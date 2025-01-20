import { load } from 'cheerio';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export const scrapeWebpage = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Remove common header, footer, and navigation elements
    $('header, footer, nav, .header, .footer, .navigation, #header, #footer, #nav').remove();

    // Try to find the main content area
    const mainContent = $('main, article, .main-content, #main-content, .content, #content, .post-content, .article-content').first();
    
    // If we found a main content area, use that for scraping, otherwise use body
    const contentRoot = mainContent.length ? mainContent : $('body');

    // Extract relevant content
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    
    // Get all heading levels
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    // Process each heading level
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(level => {
      headings[level] = contentRoot.find(level)
        .map((_, el) => ({
          text: $(el).text().trim(),
          level
        }))
        .get()
        .filter(h => h.text.length > 0);
    });

    // Get paragraphs with their context
    const contentSections = [];
    let currentSection = null;

    contentRoot.find('h1, h2, h3, h4, h5, h6, p').each((_, el) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();
      const text = $el.text().trim();

      if (text.length === 0) return;

      if (tagName.startsWith('h')) {
        if (currentSection) {
          contentSections.push(currentSection);
        }
        currentSection = {
          heading: {
            text,
            level: tagName
          },
          paragraphs: []
        };
      } else if (tagName === 'p' && text.length > 20) {
        if (currentSection) {
          currentSection.paragraphs.push(text);
        } else {
          contentSections.push({
            heading: null,
            paragraphs: [text]
          });
        }
      }
    });

    if (currentSection) {
      contentSections.push(currentSection);
    }

    return {
      url,
      title,
      description,
      headings,
      contentSections,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  }
};

export const generateMarkdown = (scrapedData) => {
  let markdown = `# ${scrapedData.title}\n\n`;
  markdown += `URL: ${scrapedData.url}\n`;
  markdown += `Scraped on: ${new Date(scrapedData.timestamp).toLocaleString()}\n\n`;
  
  if (scrapedData.description) {
    markdown += `## Description\n${scrapedData.description}\n\n`;
  }

  markdown += `## Content Structure\n\n`;
  
  // Add heading outline
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(level => {
    const headings = scrapedData.headings[level];
    if (headings.length > 0) {
      markdown += `### ${level.toUpperCase()} Headings\n`;
      headings.forEach(h => {
        const indent = '  '.repeat(parseInt(level[1]) - 1);
        markdown += `${indent}- ${h.text}\n`;
      });
      markdown += '\n';
    }
  });

  markdown += `## Full Content\n\n`;
  scrapedData.contentSections.forEach(section => {
    if (section.heading) {
      const level = '#'.repeat(parseInt(section.heading.level[1]));
      markdown += `${level} ${section.heading.text}\n\n`;
    }
    section.paragraphs.forEach(p => {
      markdown += `${p}\n\n`;
    });
  });

  return markdown;
};

export const generateDocx = async (scrapedData) => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: scrapedData.title,
            heading: HeadingLevel.TITLE
          }),
          new Paragraph({
            text: `URL: ${scrapedData.url}`
          }),
          new Paragraph({
            text: `Scraped on: ${new Date(scrapedData.timestamp).toLocaleString()}`
          }),
          new Paragraph({
            text: ''  // Empty line
          }),
          new Paragraph({
            text: 'Description',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({
            text: scrapedData.description || 'No description available'
          }),
          new Paragraph({
            text: ''  // Empty line
          }),
          new Paragraph({
            text: 'Content Structure',
            heading: HeadingLevel.HEADING_1
          })
        ]
      }]
    });

    // Add headings structure
    for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const headings = scrapedData.headings[level];
      if (headings.length > 0) {
        doc.addSection({
          children: [
            new Paragraph({
              text: `${level.toUpperCase()} Headings`,
              heading: HeadingLevel.HEADING_2
            }),
            ...headings.map(h => new Paragraph({
              text: `${' '.repeat((parseInt(level[1]) - 1) * 2)}• ${h.text}`
            })),
            new Paragraph({ text: '' })  // Empty line
          ]
        });
      }
    }

    // Add full content
    doc.addSection({
      children: [
        new Paragraph({
          text: 'Full Content',
          heading: HeadingLevel.HEADING_1
        })
      ]
    });

    // Add content sections
    for (const section of scrapedData.contentSections) {
      const sectionParagraphs = [];
      
      if (section.heading) {
        sectionParagraphs.push(
          new Paragraph({
            text: section.heading.text,
            heading: Math.min(parseInt(section.heading.level[1]), 6)
          })
        );
      }

      section.paragraphs.forEach(p => {
        sectionParagraphs.push(
          new Paragraph({ text: p }),
          new Paragraph({ text: '' })  // Empty line after each paragraph
        );
      });

      doc.addSection({ children: sectionParagraphs });
    }

    // Use blob instead of buffer for browser environment
    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
}; 