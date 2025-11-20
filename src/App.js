import { useState, useEffect } from 'react';
import './App.css';
import ElectionMap from './components/ElectionMap';
import ResultsSummary from './components/ResultsSummary';

function App() {
  const [electionResults, setElectionResults] = useState(null);
  const [view, setView] = useState('map'); // 'map' or 'summary'

  useEffect(() => {
    // Load election results
    fetch('/election_results.json')
      .then(response => response.json())
      .then(data => setElectionResults(data))
      .catch(error => {
        console.error('Error loading election results:', error);
        // Load sample data as fallback
        setElectionResults(null);
      });
  }, []);

  return (
    <div className="App">
      {/* Navigation Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#2c3e50',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Zambia 2021 Election Results
        </h1>
        <nav>
          <button
            onClick={() => setView('map')}
            style={{
              background: view === 'map' ? '#e74c3c' : 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              marginRight: '10px',
              cursor: 'pointer',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Map View
          </button>
          <button
            onClick={() => setView('summary')}
            style={{
              background: view === 'summary' ? '#e74c3c' : 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Summary
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ marginTop: '60px' }}>
        {view === 'map' ? (
          <ElectionMap electionResults={electionResults} />
        ) : (
          <ResultsSummary electionResults={electionResults} />
        )}
      </main>
    </div>
  );
}

export default App;
