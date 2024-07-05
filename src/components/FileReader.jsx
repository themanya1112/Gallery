import React, { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated } from 'react-spring';
import ReactImageMagnify from 'react-image-magnify';
import Loader from './Loader';
import ControlPanel from './ControlPanel';
import "react-pdf/dist/esm/Page/TextLayer.css";
import './FileReader.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = ({ savedFiles, currentFileIndex, setCurrentFileIndex, onFileChange }) => {
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);
  const [rotate, setRotate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentPageImage, setCurrentPageImage] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (currentFileIndex !== null && savedFiles.length > 0) {
      const selectedFile = savedFiles[currentFileIndex];
      setFile({ url: selectedFile.url, name: selectedFile.name });
      setFileType(selectedFile.type);
      setPageNumber(1);
      setError(null);
      if (selectedFile.type === 'application/pdf') {
        convertPageToImage(selectedFile.url, 1);
      }
    }
    else {
      setFile({ url: '/upload.jpeg', name: '/upload.jpeg' });
      setFileType('image/jpeg');
    }
  }, [currentFileIndex, savedFiles]);

  useEffect(() => {
    if (file && fileType === 'application/pdf') {
      convertPageToImage(file.url, pageNumber);
    }
  }, [pageNumber, file, fileType]);

  function onFileChangeHandler(event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile({ url: fileUrl, name: selectedFile.name });
      setFileType(fileType);
      setPageNumber(1);
      setIsLoading(true);
      setError(null);
      const newFile = { name: selectedFile.name, url: fileUrl, type: fileType };
      onFileChange(newFile);

      if (fileType === 'application/pdf') {
        convertPageToImage(fileUrl, 1);
      }
    }
  }

  function onSelectSavedFile(event) {
    const fileUrl = event.target.value;
    const selectedFileIndex = savedFiles.findIndex(file => file.url === fileUrl);

    if (selectedFileIndex !== -1) {
      setCurrentFileIndex(selectedFileIndex);
    }
  }

  function handlePreviousFile() {
    setCurrentFileIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }

  function handleNextFile() {
    setCurrentFileIndex((prevIndex) => (prevIndex < savedFiles.length - 1 ? prevIndex + 1 : prevIndex));
  }

  const handleDragStart = (e) => {
    setIsDragging(true);

    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDrag = (e) => {
    if (isDragging) {

      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleZoom = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newScale = Math.min(scale * 1.1, 2);
    const scaleRatio = newScale / scale;

    const newPosX = position.x - (clickX - position.x) * (scaleRatio - 1);
    const newPosY = position.y - (clickY - position.y) * (scaleRatio - 1);

    setScale(newScale);
    setPosition({ x: newPosX, y: newPosY });
  };

  const bind = useGesture({
    onPinch: ({ offset: [d], lastOffset: [lastD] }) => {
      const deltaD = d - lastD;
      const newScale = scale + deltaD / 400;
      setScale(Math.max(0.5, Math.min(newScale, 2)));
      return newScale;
    }
  });

  const convertPageToImage = async (pdfUrl, pageNum) => {
    setIsLoading(true);
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    setCurrentPageImage(canvas.toDataURL());
    setIsLoading(false);
  };

  const imgProps = useSpring({
    transform: `scale(${scale}) rotate(${rotate}deg) translate(${position.x}px, ${position.y}px)`,
    config: { tension: 300, friction: 30 },
    top: 1010 + ((scale - 1) * 500),
    left: (scale - 1) * 400,
  });

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
  }


  return (

    <div className="d-flex flex-column align-items-center w-100">

      <Loader isLoading={isLoading} />

      <div className="d-flex justify-content-center w-100" style={{ overflow: 'hidden' }}>

        <div className="box"
          style={
            {
              margin: '5px',
              padding: '10px',
              border: '1px solid #ccc',
              height: '100vh',
              overflow: 'auto',
              position: 'relative'
            }
          }
        >

          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={onFileChangeHandler}
            style={
              { margin: '20px 0' }
            }
          />

          <select
            onChange={onSelectSavedFile}
            style={{ margin: '10px 0' }}>

            <option value=""> Select </option>

            {savedFiles.map(file => (
              <option
                key={file.url}
                value={file.url}
              > {file.name} </option>
            ))}

          </select>

          <div className="navigation-buttons" >

            <button
              onClick={handlePreviousFile}
              disabled={currentFileIndex <= 0}
              className="navigation-button left"> &lt; </button>

            <button
              onClick={handleNextFile}
              disabled={currentFileIndex >= savedFiles.length - 1}
              className="navigation-button right"> &gt; </button>

          </div>

          {error && <div className="error">{error}</div>}

          {file && fileType === 'application/pdf' && (

            <>

              <ControlPanel

                fileType={fileType}
                file={file}
                scale={scale}
                setScale={setScale}
                numPages={numPages}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                rotate={rotate}
                setRotate={setRotate}
                position={position}
                setPosition={setPosition}
                permission={true}
              />

              <div
                ref={containerRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onClick={handleZoom}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                }}
                {...bind()}
              >
                <div style={{ position: 'relative' }}>
                  <ReactImageMagnify
                    {...{

                      smallImage: {
                        alt: 'Uploaded content',
                        isFluidWidth: true,
                        src: currentPageImage,
                      },
                      largeImage: {
                        src: currentPageImage,
                        width: 1200,
                        height: 2800,
                      },

                      enlargedImageContainerClassName: 'magnifier-container',
                      enlargedImagePosition: 'over',
                      isActivatedOnTouch: true,
                      mouseActivation: 'hover',
                      mouseMoveDelay: 100,
                      fadeDurationInMs: 200,
                      hoverDelayInMs: 100,
                      hoverOffDelayInMs: 100,
                      pressDuration: 300,
                      pressMoveThreshold: 10,
                      zoomRegionWidth: 100,
                      zoomRegionHeight: 100,
                      zoomActivationMethod: 'hover',
                      zoomTransitionDuration: 300,
                    }}
                  />

                  <animated.div

                    className='img'
                    style={{
                      ...imgProps,
                      transition: isDragging ? 'none' : 'transform 0.2s',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                    }}
                  >
                    <Document
                      file={file.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={() => {
                        setError('Failed to load PDF');
                        setIsLoading(false);
                      }}
                    >
                      <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer={false} renderTextLayer={false} />
                    </Document>
                  </animated.div>
                </div>
              </div>
            </>
          )}
          {file && fileType.startsWith('image/') && (
            <>

              <ControlPanel

                fileType={fileType}
                file={file}
                scale={scale}
                setScale={setScale}
                numPages={1}
                pageNumber={1}
                setPageNumber={() => { }}
                rotate={rotate}
                setRotate={setRotate}
                position={position}
                setPosition={setPosition}
                permission={false}
              />

              <div
                className='normal'
                ref={containerRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onClick={handleZoom}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                }}
                {...bind()}
              >
                <div style={{ position: 'relative' }}>
                  <ReactImageMagnify
                    {...{
                      smallImage: {
                        alt: 'Uploaded content',
                        isFluidWidth: true,
                        src: file.url,
                      },
                      largeImage: {
                        src: file.url,
                        width: 1200,
                        height: 1800,
                      },
                      enlargedImageContainerClassName: 'magnifier-container',
                      enlargedImagePosition: 'over',
                      isActivatedOnTouch: true,
                      mouseActivation: 'hover',
                      mouseMoveDelay: 100,
                      fadeDurationInMs: 200,
                      hoverDelayInMs: 100,
                      hoverOffDelayInMs: 100,
                      pressDuration: 300,
                      pressMoveThreshold: 10,
                      zoomRegionWidth: 100,
                      zoomRegionHeight: 100,
                      zoomActivationMethod: 'hover',
                      zoomTransitionDuration: 300,

                    }}
                  />

                  <animated.img

                    src={file.url}
                    alt="Uploaded content"
                    className='img'
                    style={{
                      ...imgProps,
                      transition: isDragging ? 'none' : 'transform 0.2s',
                      position: 'absolute',
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setError('Failed to load image');
                      setIsLoading(false);
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
