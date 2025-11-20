import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ResultsSummary = ({ electionResults }) => {
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!electionResults) return null;

    const partyCounts = {};
    const partyVotes = {};
    let totalVotes = 0;
    let totalConstituencies = 0;

    Object.values(electionResults).forEach(result => {
      if (result.winner) {
        partyCounts[result.winner] = (partyCounts[result.winner] || 0) + 1;
        partyVotes[result.winner] = (partyVotes[result.winner] || 0) + (result.totalVotes || 0);
        totalVotes += result.totalVotes || 0;
        totalConstituencies++;
      }
    });

    return {
      partyCounts,
      partyVotes,
      totalVotes,
      totalConstituencies
    };
  };

  const summary = calculateSummary();

  if (!summary) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No Election Results Available</h2>
        <p>Load election results data to see the summary.</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = Object.entries(summary.partyCounts).map(([party, seats]) => ({
    party,
    seats,
    votes: summary.partyVotes[party],
    percentage: ((seats / summary.totalConstituencies) * 100).toFixed(1)
  })).sort((a, b) => b.seats - a.seats);

  const partyColors = {
    'UPND': '#e74c3c',
    'PF': '#3498db',
    'INDEPENDENT': '#95a5a6',
    'OTHER': '#f39c12'
  };

  return (
    <div style={{ padding: '20px', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Zambia Election Results 2021
        </h1>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              Total Constituencies
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              {summary.totalConstituencies}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              Total Votes Cast
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              {summary.totalVotes.toLocaleString()}
            </p>
          </div>

          {chartData.slice(0, 2).map((party) => (
            <div
              key={party.party}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                textAlign: 'center',
                borderTop: `4px solid ${partyColors[party.party]}`
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                {party.party} Seats
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: partyColors[party.party] }}>
                {party.seats}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '12px' }}>
                {party.percentage}% of seats
              </p>
            </div>
          ))}
        </div>

        {/* Seats Chart */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>Seats by Party</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="seats" fill="#3498db" name="Seats Won" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>Detailed Results</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Party</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Seats</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>% of Seats</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total Votes</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>% of Votes</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((party, idx) => (
                <tr key={party.party} style={{
                  borderBottom: '1px solid #dee2e6',
                  background: idx % 2 === 0 ? 'white' : '#f8f9fa'
                }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: partyColors[party.party] || '#e0e0e0',
                      borderRadius: '3px'
                    }} />
                    <strong>{party.party}</strong>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{party.seats}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{party.percentage}%</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{party.votes.toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {((party.votes / summary.totalVotes) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
