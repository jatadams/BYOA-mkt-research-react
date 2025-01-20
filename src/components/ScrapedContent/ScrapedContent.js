import React from 'react';
import { saveAs } from 'file-saver';
import { generateMarkdown, generateDocx } from '../../services/scraper';
import './ScrapedContent.css';

const ScrapedContent = ({ scrapedData }) => {
  if (!scrapedData || scrapedData.length === 0) {
    return null;
  }

  const handleExportMarkdown = () => {
    const combinedMarkdown = scrapedData
      .map(data => generateMarkdown(data))
      .join('\n---\n\n');
    
    const blob = new Blob([combinedMarkdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'scraped-content.md');
  };

  const handleExportDoc = async () => {
    try {
      const blob = await generateDocx(scrapedData[0]);
      const filename = scrapedData[0].title
        ? `${scrapedData[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`
        : 'scraped-content.docx';
      saveAs(blob, filename);
    } catch (err) {
      console.error('Error generating DOCX:', err);
      alert('Failed to generate DOCX file. Please try again.');
    }
  };

  return (
    <div className="scraped-content">
      <div className="result-card">
        <div className="card-header">
          <h2>Scraped Content</h2>
          <div className="export-buttons">
            <button onClick={handleExportMarkdown} className="action-button">
              Export as Markdown
            </button>
            <button onClick={handleExportDoc} className="action-button">
              Export as Doc
            </button>
          </div>
        </div>
        
        {scrapedData.map((data, index) => (
          <div key={index} className="content-section">
            <h3>{data.title}</h3>
            <p className="url">{data.url}</p>
            
            {data.description && (
              <div className="description">
                <h4>Description</h4>
                <p>{data.description}</p>
              </div>
            )}

            <div className="content-sections">
              <h4>Full Content</h4>
              {data.contentSections.map((section, i) => (
                <div key={i} className="section">
                  {section.heading && (
                    <div className={`heading ${section.heading.level}`}>
                      <span className="heading-level">{section.heading.level.toUpperCase()}</span>
                      <h5>{section.heading.text}</h5>
                    </div>
                  )}
                  {section.paragraphs.map((p, j) => (
                    <div key={j} className="text-content">
                      <span className="text-indicator">TEXT</span>
                      <p className="paragraph">{p}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {index < scrapedData.length - 1 && <hr />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrapedContent; 