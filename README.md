# Market Research URL Organizer

A web-based tool for collecting URLs, scraping their content, and generating organized research documents based on tags. The tool creates immediate output files without storing content in a database.

## Features

- Add URLs with custom tags and descriptions
- On-demand web scraping of URL content including:
  - Main article text
  - Headlines
  - Key metadata
- Organize scraped content by categories/tags
- Generate immediate output files (.doc or .md) containing:
  - Original URLs
  - Freshly scraped content
  - Tags and categories
  - Custom notes
- Simple and intuitive user interface

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Web Scraping: Puppeteer/Cheerio
- Export functionality: docx and markdown libraries

## Project Structure

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
