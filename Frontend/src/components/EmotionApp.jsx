EmotionApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './EmotionApp.css';
import FloatingEmojis from './FloatingEmojis';


export default function EmotionApp({ user, onLogout, apiUrl }) {
  const [emotion, setEmotion] = useState("—");
  const [confidence, setConfidence] = useState(null);
  const [songs, setSongs] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [language, setLanguage] = useState("te");
  const [appError, setAppError] = useState('');
  const [backgroundTheme, setBackgroundTheme] = useState('default');
  const [audioContext, setAudioContext] = useState(null);
  const [isAudioAnalyzing, setIsAudioAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const API_URL = apiUrl; 

  // Emotion-based background themes
  const getEmotionTheme = (emotionName) => {
    const themes = {
      'happy': 'happy',
      'joy': 'happy',
      'excited': 'happy',
      'sad': 'sad', 
      'melancholy': 'sad',
      'depressed': 'sad',
      'angry': 'angry',
      'rage': 'angry',
      'frustrated': 'angry',
      'fear': 'fear',
      'anxious': 'fear',
      'worried': 'fear',
      'surprised': 'surprised',
      'surprise': 'surprised',
      'amazed': 'surprised',
      'calm': 'calm',
      'peaceful': 'calm',
      'relaxed': 'calm',
      'neutral': 'neutral',
      'disgust': 'neutral'
    };
    return themes[emotionName.toLowerCase()] || 'default';
  }; 

  // Detect theme from songs and update animation
  const updateThemeFromSongs = (songsArray, currentEmotion) => {
    if (songsArray && songsArray.length > 0) {
      // Use the current emotion if available, otherwise analyze song titles
      if (currentEmotion && currentEmotion !== "—" && currentEmotion !== "Unknown") {
        const theme = getEmotionTheme(currentEmotion);
        setBackgroundTheme(theme);
      } else {
        // Analyze song titles/artists for emotional keywords
        const songText = songsArray.slice(0, 5).map(song => 
          `${song.name || song.title || ''} ${song.artist || ''}`
        ).join(' ').toLowerCase();
        
        if (songText.includes('happy') || songText.includes('joy') || songText.includes('dance') || songText.includes('party')) {
          setBackgroundTheme('happy');
        } else if (songText.includes('sad') || songText.includes('blue') || songText.includes('cry') || songText.includes('lonely')) {
          setBackgroundTheme('sad');
        } else if (songText.includes('rock') || songText.includes('metal') || songText.includes('rage') || songText.includes('fight')) {
          setBackgroundTheme('angry');
        } else if (songText.includes('chill') || songText.includes('calm') || songText.includes('peaceful') || songText.includes('relax')) {
          setBackgroundTheme('calm');
        } else {
          setBackgroundTheme('neutral');
        }
      }
    }
  };

  // Audio Analysis for Beat Detection
  const initializeAudioAnalysis = () => {
    try {
      // Simulate beat analysis since real audio capture requires permissions
      startSimulatedBeatAnalysis();
    } catch (error) {
      console.log("Audio analysis not supported, using simulated beats");
      startSimulatedBeatAnalysis();
    }
  };

  const startSimulatedBeatAnalysis = () => {
    setIsAudioAnalyzing(true);
    
    // Simulate different beat patterns based on current theme
    const simulateBeat = () => {
      if (!isAudioAnalyzing) return;
      
      let energy;
      // Different energy patterns based on theme
      switch(backgroundTheme) {
        case 'happy':
          energy = Math.random() * 0.4 + 0.6; // High energy (0.6-1.0)
          break;
        case 'angry':
          energy = Math.random() * 0.3 + 0.7; // Very high energy (0.7-1.0)
          break;
        case 'sad':
          energy = Math.random() * 0.3 + 0.1; // Low energy (0.1-0.4)
          break;
        case 'calm':
          energy = Math.random() * 0.2 + 0.1; // Very low energy (0.1-0.3)
          break;
        case 'surprised':
          energy = Math.random() * 0.5 + 0.5; // High variable energy (0.5-1.0)
          break;
        default:
          energy = Math.random() * 0.5 + 0.3; // Medium energy (0.3-0.8)
      }
      
      updateAnimationSpeed(energy);
      
      // Update every 150-400ms to simulate beat changes
      const interval = Math.random() * 250 + 150;
      setTimeout(simulateBeat, interval);
    };
    
    simulateBeat();
  };

  const updateAnimationSpeed = (energy) => {
    // Map energy (0-1) to animation speed
    let speed;
    if (energy > 0.8) speed = 4; // Very fast beat
    else if (energy > 0.6) speed = 7; // Fast beat
    else if (energy > 0.4) speed = 12; // Medium beat
    else if (energy > 0.2) speed = 18; // Slow beat
    else speed = 25; // Very slow beat
    
    // Update CSS custom property for animation speed
    document.documentElement.style.setProperty('--beat-speed', `${speed}s`);
  };

  const stopAudioAnalysis = () => {
    setIsAudioAnalyzing(false);
  };

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
      
      // Update background theme based on detected emotion
      if (detectedEmotion) {
        const theme = getEmotionTheme(detectedEmotion);
        setBackgroundTheme(theme);
      }

      const songRes = await axios.get(`${API_URL}/recommendations/${encodeURIComponent(detectedEmotion)}/${encodeURIComponent(language)}?limit=20`);
      setSongs(songRes.data.tracks || []);
      
      // Update theme based on songs and emotion
      updateThemeFromSongs(songRes.data.tracks || [], detectedEmotion);
      
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

  // Update body class based on background theme only for emotion app
  useEffect(() => {
    document.body.className = `emotion-app theme-${backgroundTheme}`;
    return () => {
      document.body.className = '';
    };
  }, [backgroundTheme]);

  // Update animation when songs change (for when songs are playing)
  useEffect(() => {
    if (songs.length > 0) {
      updateThemeFromSongs(songs, emotion);
      // Start beat analysis when songs are available
      initializeAudioAnalysis();
    } else {
      // Stop beat analysis when no songs
      stopAudioAnalysis();
    }
  }, [songs, emotion]);

  // Clean up audio analysis on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalysis();
    };
  }, []);

  return (
    <>
      <div className="app-background" />
      <FloatingEmojis count={15} />
      <div className="app">
        <header className="top-header">
          <div className="title-container">
            <h1>Emotion-Based Music Recommender</h1>
          </div>
          <div className="logout-container">
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </header>

        <main className="main-content">
          {/* Left Side - Detection (Wider) */}
          <div className="left-container">
            {/* Top Left - Controls */}
            <div className="controls-box">
              <label htmlFor="file-upload" className="file-input-label">Upload Image</label>
              <input id="file-upload" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
              <button onClick={startCamera} disabled={cameraOn}>Start Camera</button>
              <button onClick={stopCamera} disabled={!cameraOn}>Stop Camera</button>
            </div>

            {/* Top Right - Preview */}
            <div className="preview-box">
              {imagePreview && <img src={imagePreview} alt="Upload Preview" />}
              <video ref={videoRef} style={{ display: cameraOn ? 'block' : 'none', width: '100%', height: 'auto', borderRadius: 12 }} autoPlay muted playsInline />
              {!imagePreview && !cameraOn && <p>No media selected for preview</p>}
            </div>

            {/* Bottom - Detection Results */}
            <div className="detection-box">
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
            </div>
          </div>

          {/* Right Side - Recommendations (Narrower with Scroll) */}
          <div className="right-container">
            <div className="recommendations-box">
              <h3>Recommended Songs</h3>
              <div className="songs-scroll">
                {songs.length > 0 ? (
                  songs.map((song, idx) => (
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
                  ))
                ) : (
                  <div className="no-songs">
                    <p>Analyze an emotion to get personalized song recommendations!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}