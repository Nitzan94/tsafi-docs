import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>
      <h1>🎉 מערכת צפי - גרסה 2.0</h1>
      <p>המערכת עולה בהצלחה!</p>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2>✨ תכונות חדשות</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>☁️ גיבוי אוטומטי ל-Google Drive</li>
          <li>🔒 הצפנה מתקדמת</li>
          <li>📱 ממשק משופר</li>
          <li>⚡ סנכרון בזמן אמת</li>
        </ul>
      </div>
      <p><strong>השרת פועל על: localhost:3003</strong></p>
    </div>
  );
}

export default App;