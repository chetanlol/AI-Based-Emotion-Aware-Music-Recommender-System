import React from 'react';

export default function FloatingEmojis({ count = 20 }) {
  const emojis = ['🎵','🎶','🎼','🎧','😊','😁','😄','✨','🤩'];
  return (
    <div className="floating-emojis-container" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const style = {
          left: `${Math.random() * 95}vw`,
          animationDuration: `${Math.random() * 5 + 8}s`,
          animationDelay: `${Math.random() * 10}s`,
        };
        return (
          <span key={i} className="floating-emoji" style={style}>
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </span>
        );
      })}
    </div>
  );
}
