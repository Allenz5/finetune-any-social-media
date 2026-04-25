'use client';

import { useEffect, useState } from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface Status {
  state: ConnectionState;
  loggedIn: boolean;
  error?: string;
}

export default function Home() {
  const [status, setStatus] = useState<Status>({ state: 'disconnected', loggedIn: false });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const res = await fetch('/api/linkedin/status', { cache: 'no-store' });
      setStatus(await res.json());
    } catch {
      // ignore polling errors
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

  async function connect() {
    setBusy(true);
    try {
      await fetch('/api/linkedin/connect', { method: 'POST' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch('/api/linkedin/disconnect', { method: 'POST' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const label = status.loggedIn
    ? 'Connected'
    : status.state === 'connecting'
      ? 'Waiting for login…'
      : status.state === 'error'
        ? 'Error'
        : 'Disconnected';

  const showConnect = !status.loggedIn && status.state !== 'connecting';

  return (
    <main style={{ maxWidth: 640, margin: '60px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Finetune Social Media</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Connect a platform to start shaping your feed.
      </p>

      <section
        style={{
          marginTop: 32,
          padding: 24,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <h2 style={{ marginTop: 0 }}>LinkedIn</h2>
        <p>
          Status: <strong>{label}</strong>
        </p>
        {status.error && (
          <p style={{ color: 'crimson', fontSize: 14 }}>Error: {status.error}</p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {showConnect && (
            <button className="primary" onClick={connect} disabled={busy}>
              Connect LinkedIn
            </button>
          )}
          {(status.state === 'connecting' || status.loggedIn || status.state === 'error') && (
            <button onClick={disconnect} disabled={busy}>
              Disconnect
            </button>
          )}
        </div>

        {status.state === 'connecting' && !status.loggedIn && (
          <p style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
            A Chrome window opened on your machine. Log in to LinkedIn there.
            This page will update automatically once login is detected.
          </p>
        )}
      </section>
    </main>
  );
}
