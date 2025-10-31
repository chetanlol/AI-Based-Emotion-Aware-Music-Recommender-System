EmotionApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';


export default function EmotionApp({ user, onLogout, apiUrl }) {
  const [emotion, setEmotion] = useState("—");
  const [confidence, setConfidence] = useState(null);
  const [songs, setSongs] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [language, setLanguage] = useState("te");
  const [appError, setAppError] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = apiUrl; 

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAppError('');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        if (cameraOn) stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setAppError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraOn(true);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      setAppError("Camera error: " + (err?.message || err));
    }
  };

  const stopCamera = () => {
    try {
      const stream = videoRef.current?.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (err) {
      // ignore
    } finally {
      setCameraOn(false);
    }
  };

  const handleAnalyze = async () => {
    setAppError('');
    let fileToSend = null;
    let dataUrlToSend = null;
    const file = fileInputRef.current?.files?.[0];

    if (file) {
      fileToSend = file;
      if (cameraOn) stopCamera();
    } else if (cameraOn && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUrlToSend = canvas.toDataURL('image/jpeg');
      } else {
        setAppError("Could not get canvas context for camera capture.");
        return;
      }
    } else {
      setAppError("Please upload an image or start the camera!");
      return;
    }

    if (fileToSend) {
      await detectAndRecommend(null, fileToSend);
    } else if (dataUrlToSend) {
      await detectAndRecommend(dataUrlToSend, null);
    } else {
      setAppError("Could not get image data.");
    }
  };

  const detectAndRecommend = async (dataUrl, file) => {
    setIsLoading(true);
    setEmotion("Analyzing...");
    setSongs([]);
    setAppError('');
    try {
      let emotionRes;
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        emotionRes = await axios.post(`${API_URL}/detect-emotion`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else if (dataUrl) {
        emotionRes = await axios.post(`${API_URL}/detect-emotion`, { image: dataUrl });
      } else {
        throw new Error("No image source provided");
      }

      const { emotion: detectedEmotion, confidence: conf } = emotionRes.data || {};
      setEmotion(detectedEmotion || "Unknown");
      setConfidence(typeof conf === 'number' ? conf : null);

      const songRes = await axios.get(`${API_URL}/recommendations/${encodeURIComponent(detectedEmotion)}/${encodeURIComponent(language)}`);
      setSongs(songRes.data.tracks || []);
      if (!songRes.data?.tracks?.length) {
        setAppError("No songs found for this emotion and language. Try another one!");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error';
      setAppError("Error processing your request: " + errorMsg);
      setEmotion("Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="app-background" />
      <div className="app">
        <header className="app-header">
          <div className="header-info">
            <h1>Emotion-Based Music</h1>
            <p>Welcome, {user?.username || 'guest'}!</p>
          </div>
          <div className="header-actions">
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </header>

        <main>
          <div className="controls">
            <label htmlFor="file-upload" className="file-input-label">Upload Image</label>
            <input id="file-upload" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
            <button onClick={startCamera} disabled={cameraOn}>Start Camera</button>
            <button onClick={stopCamera} disabled={!cameraOn}>Stop Camera</button>
          </div>

          <div className="preview">
            {imagePreview && <img src={imagePreview} alt="Upload Preview" />}
            <video ref={videoRef} style={{ display: cameraOn ? 'block' : 'none', width: '100%', height: 'auto', borderRadius: 12 }} autoPlay muted playsInline />
            {!imagePreview && !cameraOn && <p>No media selected for preview</p>}
          </div>

          <div className="actions">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isLoading}>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="en">English</option>
            </select>

            <button onClick={handleAnalyze} disabled={isLoading || (!fileInputRef.current?.files?.[0] && !cameraOn)}>
              {isLoading ? <div className="button-loader-container"><div className="loader" /><span>Processing...</span></div> : "Analyze Emotion"}
            </button>
          </div>

          {appError && <div className="app-error-message">{appError}</div>}

          <div className="results">
            <h2>Detected Emotion: <span>{emotion}</span></h2>
            {confidence !== null && <p>Confidence: <span>{(confidence * 100).toFixed(1)}%</span></p>}
          </div>

          {songs.length > 0 && (
            <div className="tracks">
              <h3>Recommended Songs for {emotion} ({language.toUpperCase()})</h3>
              {songs.map((song, idx) => (
                <div key={song.spotify_url || idx} className="song-card">
                  {song?.embed_url ? (
                    <iframe
                      src={song.embed_url}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="encrypted-media; picture-in-picture; autoplay"
                      title={`Spotify Embed: ${song.name || song.title || 'track'}`}
                    />
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                      <h4>{song?.name || song?.title || 'Unknown Title'}</h4>
                      <p>{song?.artist || 'Unknown Artist'}</p>
                      {song?.spotify_url && <a href={song.spotify_url} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </>
  );
}


