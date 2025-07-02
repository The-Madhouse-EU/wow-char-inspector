import React from 'react';

export default function InfoBox({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <pre
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '8px',
        fontSize: '18px',
        color: 'gold',
      }}
    >
      {children}
    </pre>
  );
}
