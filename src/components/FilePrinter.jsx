import React, { useRef } from 'react';

const PDFPrinter = ({ file }) => {
  const iframeRef = useRef(null);

  const print = () => {
    if (file) {
      const iframe = iframeRef.current;
      iframe.src = file.url;
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    }
  };

  return (
    <>
      <button 
        className = "control-button clickable" 
        onClick = { print }  
        title = "Print"
      >
        &#128424;
      </button>
      
      <iframe 
        ref = { iframeRef } 
        style = {{ display: 'none' }} 
        title = "Print Frame" 
      />
    </>
  );
};

export default PDFPrinter;
