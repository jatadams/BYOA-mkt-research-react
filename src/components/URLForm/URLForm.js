import React, { useState } from 'react';
import { scrapeWebpage } from '../../services/scraper';
import './URLForm.css';

const emptyEntry = {
  tags: '',
  url: ''
};

const URLForm = ({ onSubmit }) => {
  const [entries, setEntries] = useState(Array(5).fill().map(() => ({...emptyEntry})));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = async () => {
    const validEntries = entries.filter(entry => entry.url.trim());
    if (validEntries.length === 0) {
      setError('Please enter at least one valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.all(
        validEntries.map(entry => scrapeWebpage(entry.url))
      );
      onSubmit(results);
    } catch (err) {
      setError('Failed to scrape some URLs. Please check if they are valid.');
      console.error('Scraping error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    setEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value
      };
      return newEntries;
    });
  };

  const addRow = () => {
    setEntries(prev => [...prev, {...emptyEntry}]);
  };

  const deleteRow = () => {
    setEntries(prev => prev.slice(0, -1));
  };

  return (
    <form className="url-form" onSubmit={e => e.preventDefault()}>
      <div className="entries-container">
        {entries.map((entry, index) => (
          <div key={index} className="form-content">
            <div className="form-group tags-field">
              <label htmlFor={`tags-${index}`}>Tag</label>
              <input
                type="text"
                id={`tags-${index}`}
                value={entry.tags}
                onChange={(e) => handleChange(index, 'tags', e.target.value)}
              />
            </div>

            <div className="form-group url-field">
              <label htmlFor={`url-${index}`}>URL</label>
              <input
                type="url"
                id={`url-${index}`}
                value={entry.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button type="button" onClick={addRow} className="action-button">
          Add
        </button>
        <button type="button" onClick={deleteRow} className="action-button">
          Delete
        </button>
        <button 
          type="button" 
          onClick={handleScrape} 
          className="action-button primary"
          disabled={loading}
        >
          {loading ? 'Scraping...' : 'Scrape Content'}
        </button>
      </div>
    </form>
  );
};

export default URLForm; 