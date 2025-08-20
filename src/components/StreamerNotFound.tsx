import React from 'react';
import { useParams } from 'react-router-dom';


function StreamerNotFound() {
  const { streamerName } = useParams<{ streamerName: string }>();

  if (!streamerName) return <div>Streamer não encontrado</div>;

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Streamer não encontrado</h2>
    </div>
  );
}

export default StreamerNotFound;
