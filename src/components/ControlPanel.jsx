import React from 'react';
import PDFPrinter from './FilePrinter';
import './ControlPanel.css';

const ControlPanel = ({
  fileType,
  file,
  pageNumber,
  numPages,
  setPageNumber,
  scale,
  setScale,
  rotate,
  setRotate,
  position,
  setPosition,
  permission
}) => {
  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === numPages;

  const firstPageClass = isFirstPage ? 'disabled' : 'clickable';
  const lastPageClass = isLastPage ? 'disabled' : 'clickable';

  const goToFirstPage = () => {
    if (!isFirstPage) setPageNumber(1);
  };
  const goToPreviousPage = () => {
    if (!isFirstPage) setPageNumber(pageNumber - 1);
  };
  const goToNextPage = () => {
    if (!isLastPage) setPageNumber(pageNumber + 1);
  };
  const goToLastPage = () => {
    if (!isLastPage) setPageNumber(numPages);
  };

  const onPageChange = (e) => {
    const { value } = e.target;
    setPageNumber(Number(value));
  };

  const isMinZoom = scale < 0.6;
  const isMaxZoom = scale >= 2.0;

  const zoomOutClass = isMinZoom ? 'disabled' : 'clickable';
  const zoomInClass = isMaxZoom ? 'disabled' : 'clickable';
  const resetClass = 'clickable';
  const rotateClass = 'clickable';

  const zoomOut = () => {
    if (!isMinZoom) setScale(scale - 0.1);
  };

  const zoomIn = () => {
    if (!isMaxZoom) setScale(scale + 0.1);
  };

  const reset = () => {
    setScale(1.0);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
  };

  const rotation = () => {
    setRotate((prevRotation) => (prevRotation + 90)%360);
  };

  const handleDownload = () => {
    if (file) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  return (

    <div className = "control-panel"> 

      {fileType === 'application/pdf' && (
    
      <div className = "page-controls">
            
            <button 
              className = { `control-button ${ firstPageClass }` } 
              onClick = { goToFirstPage }   
              title = "First Page"
            >
            &laquo;
            
            </button>
             <button 
              className = { `control-button ${ firstPageClass }` } onClick = { goToPreviousPage } title = "Previous Page" >
            &lsaquo;
            </button>
          
          <span>
            
            Page
            
            <input
            
              name = "pageNumber"
              type = "number"
              min = { 1 }
              max = { numPages || 1 }
              value = { pageNumber }
              onChange = { onPageChange }
            />
            of { numPages }
          </span>

          <button 
            className = { `control-button ${ lastPageClass }` } 
            onClick = { goToNextPage }   
            title = "Next Page"
          >
          &rsaquo;
          </button>
          
          <button 
            className = { `control-button ${ lastPageClass }` } 
            onClick = { goToLastPage } 
            title = "Last Page"
          >
          &raquo;
          </button>
        
        </div>
      )}
      
      <div className = "zoom-controls">
        
        <button 
          className = { `control-button ${zoomOutClass}` } 
          onClick = { zoomOut } 
          title = "Zoom Out"
        >
          -
        </button>
        
        <span>
          {(scale * 100).toFixed()}
          %
        </span>
        
        <button 
          className = { `control-button ${zoomInClass}` } 
          onClick = { zoomIn } 
          title = "Zoom In"
        >
          +
        </button>
        
        <button 
          className = { `control-button ${resetClass}` } 
          onClick = { reset } 
          title = "Reset"
        >
          &#8635;
        </button>
        
        <button 
          className = { `control-button ${rotateClass}` } 
          onClick = { rotation } 
          title = "Rotate"
        >
          &#8634;
        </button>
        
        { permission && (
          <>
            
            <button 
              className = "control-button clickable" 
              onClick = { handleDownload } 
              title = "Download"
            >
              &#8681;
            </button>
            
            <PDFPrinter file = {file} />
          </>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
