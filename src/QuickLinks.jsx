// src/QuickLinks.jsx
import React from 'react';

const QuickLinks = () => {
  const links = [
    { name: 'Canvas', url: 'https://spx.instructure.com/' },
    { name: 'PowerSchool', url: 'https://spx.powerschool.com/public/' },
    { name: 'x2VOL', url: 'https://x2vol.com/' }
  ];

  return (
    <div className="bg-stpius-blue border border-stpius-gold rounded-lg p-4 flex flex-col space-y-2">
      <h2 className="text-xl font-bold text-stpius-white mb-2">Quick Links</h2>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-stpius-gold text-stpius-blue font-semibold py-2 px-4 rounded hover:bg-stpius-gold/80 transition-colors duration-200 text-center"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};

export default QuickLinks;
