import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [publicToken, setPublicToken] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState(null);

  const [age, setAge] = useState(30);
  const [salary, setSalary] = useState(80000);
  const [contrib, setContrib] = useState(6);
  const [match, setMatch] = useState(3);
  const [result, setResult] = useState('');

  // Telegram Init
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Fetch link_token from backend
  useEffect(() => {
    fetch('/api/create_link_token')
      .then(res => res.json())
      .then(data => setLinkToken(data.link_token))
      .catch(() => alert('Backend not ready. Use sandbox later.'));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      setPublicToken(public_token);
      setAccountName(metadata.institution.name);
      // Exchange token on backend
      fetch('/api/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      })
        .then(res => res.json())
        .then(data => {
          setBalance(data.total || 'N/A');
          alert(`Linked ${metadata.institution.name}!`);
        });
    },
  });

  const calculate = () => {
    const years = 65 - age;
    if (years <= 0) return setResult('Age must be under 65');

    const annual = salary * ((contrib + match) / 100);
    const months = years * 12;
    let bal = balance || 0;
    const rate = Math.pow(1.07, 1/12);

    for (let i = 0; i < months; i++) {
      bal = (bal + annual / 12) * rate;
    }

    setResult(`$${Math.round(bal).toLocaleString()}`);
  };

  return (
    <div style={{ padding: 20, fontFamily: '-apple-system, sans-serif' }}>
      <h1 style={{ color: '#2481cc', textAlign: 'center' }}>
        Growyo 401(k) Easy
      </h1>
      <p style={{ textAlign: 'center' }}>
        Hi {window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'there'}!
      </p>

      {!publicToken ? (
        <button
          onClick={() => open()}
          disabled={!ready}
          style={{
            background: ready ? 'var(--tg-theme-button-color, #2481cc)' : '#ccc',
            color: 'white',
            padding: 14,
            borderRadius: 12,
            width: '100%',
            fontWeight: 'bold',
            border: 'none',
            margin: '10px 0'
          }}
        >
          {ready ? 'Link 401(k) Account' : 'Loading Plaid...'}
        </button>
      ) : (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          Linked: {accountName} | Balance: ${balance?.toLocaleString() || 'N/A'}
        </p>
      )}

      <label>Current Age</label>
      <input type="number" value={age} onChange={e => setAge(+e.target.value)} style={inputStyle} />

      <label>Annual Salary ($)</label>
      <input type="number" value={salary} onChange={e => setSalary(+e.target.value)} style={inputStyle} />

      <label>Your Contribution (%)</label>
      <input type="number" value={contrib} onChange={e => setContrib(+e.target.value)} style={inputStyle} />

      <label>Employer Match (%)</label>
      <input type="number" value={match} onChange={e => setMatch(+e.target.value)} style={inputStyle} />

      <button onClick={calculate} style={buttonStyle}>
        Calculate Projection
      </button>

      {result && (
        <div style={{
          background: '#f0f8ff',
          padding: 16,
          borderRadius: 12,
          marginTop: 15,
          textAlign: 'center',
          fontSize: 18
        }}>
          <b>Projected at 65:</b><br />
          <span style={{ fontSize: 24 }}>{result}</span><br />
          <small>7% return, no fees</small>
        </div>
      )}

      <small style={{ display: 'block', marginTop: 20, color: '#888' }}>
        Simulation only. Not financial advice.
      </small>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: 12,
  margin: '8px 0',
  borderRadius: 12,
  border: '1px solid #ddd',
  fontSize: 16
};

const buttonStyle = {
  ...inputStyle,
  background: 'var(--tg-theme-button-color, #2481cc)',
  color: 'white',
  fontWeight: 'bold',
  border: 'none'
};

export default App;
