// src/components/AdSense.jsx
import React, { useEffect, useRef } from 'react';

const AdSense = ({ adSlot }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', height: '100%' }}
      data-ad-client="ca-pub-9365788286872902"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      ref={adRef}
    />
  );
};

export default AdSense;
