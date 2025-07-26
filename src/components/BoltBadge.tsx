import React from 'react';

interface BoltBadgeProps {
  isDarkMode?: boolean;
}

export function BoltBadge({ isDarkMode = true }: BoltBadgeProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-110 duration-200"
        title="Built with Bolt.new"
      >
        <img
          src={isDarkMode ? "/white_circle_360x360.png" : "/black_circle_360x360.png"}
          alt="Built with Bolt.new"
          className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg"
        />
      </a>
    </div>
  );
}