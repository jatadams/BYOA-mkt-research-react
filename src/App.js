import React, { useState } from 'react';
import URLForm from './components/URLForm/URLForm';
import ScrapedContent from './components/ScrapedContent/ScrapedContent';
import './App.css';

function App() {
  const [scrapedData, setScrapedData] = useState([]);

  const handleScrapedData = (data) => {
    setScrapedData(data);
  };

  return (
    <div className="App">
      <h1>Market Research URL Organizer</h1>
      <URLForm onSubmit={handleScrapedData} />
      <ScrapedContent scrapedData={scrapedData} />
    </div>
  );
}

export default App;
