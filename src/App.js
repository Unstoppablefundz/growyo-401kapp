import React, { useState, useEffect } from 'react';

function App() {
  const [userName, setUserName] = useState('User');
  const [linkToken, setLinkToken] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      setUserName(window.Telegram.WebApp.initDataUnsafe.user.first_name);
    }

    // Create Plaid link token
    fetch('/api/create_link_token', { method: 'POST' })
      .then(res => res.json())
      .then(data => setLinkToken(data.link_token))
      .catch(() => alert('Failed to load Plaid'));
  }, []);

  const openPlaid = () => {
    if (!linkToken) return;

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token) => {
        const res = await fetch('/api/exchange_public_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token })
        });
        const data = await res.json();
        setAccount(data);
      },
    });
    handler.open();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Hi, {userName}!</h2>
      <h1>Growyo 401(k) Easy</h1>

      {account ? (
        <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '12px' }}>
          <h3>Linked: {account.institution_name}</h3>
          <p><strong>Balance:</strong> ${account.balance?.toLocaleString()}</p>
          <h4>Top Holdings:</h4>
          <ul>
            {account.holdings?.slice(0, 5).map((h, i) => (
              <li key={i}>{h.security.ticker} – ${h.value.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          onClick={openPlaid}
          style={{
            background: '#229ED9',
            color: 'white',
            border: 'none',
            padding: '
