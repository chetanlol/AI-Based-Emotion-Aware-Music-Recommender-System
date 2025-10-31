import React from 'react';

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
      :root {
        --primary-color: #2e7d32;
        --primary-color-dark: #1b5e20;
        --bg-color: #f7f9fc;
        --card-bg: #ffffff;
        --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        --error-color: #d32f2f;
        --info-color: #1976d2;
        --border-color: #ccc;
        --gradient-green-light: #a8e063;
        --gradient-green-medium: #6fbf73;
      }
      body {
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background-color: var(--bg-color);
        color: #333;
        overflow-x: hidden;
      }
      @keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
      .loader { border: 3px solid rgba(255,255,255,0.3); border-top:3px solid #fff; border-radius:50%; width:16px; height:16px; animation: spin 1s linear infinite; }
      .button-loader-container { display:flex; align-items:center; gap:10px; }
      .app { max-width:900px; margin:2rem auto; padding:1rem; text-align:center; position:relative; z-index:1; }
      .app-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;}
      .header-info h1{ color:var(--primary-color); font-weight:600; margin:0;}
      .header-info p{ margin:0; color:#555; }
      .header-actions{ display:flex; gap:0.5rem; }
      button, .file-input-label, select { background-color:var(--primary-color); color:white; border:none; padding:12px 20px; border-radius:8px; cursor:pointer; font-size:1rem; font-family:'Poppins',sans-serif; transition:all .3s ease; display:inline-flex; align-items:center; justify-content:center; }
      button:hover, .file-input-label:hover, select:hover { background-color:var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      button:disabled, select:disabled { background-color:#9e9e9e; cursor:not-allowed; transform:none; box-shadow:none; }
      button:focus-visible, .file-input-label:focus-visible, select:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
      input[type="file"] { display:none; }
      .file-input-label { text-align:center; cursor:pointer; }
      .controls, .actions { margin:1.5rem 0; display:flex; justify-content:center; align-items:center; gap:1rem; flex-wrap:wrap; }
      .preview { margin:1rem auto; width:100%; max-width:480px; min-height:240px; background-color:#e0e0e0; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .preview img, .preview video { max-width:100%; max-height:360px; border-radius:12px; object-fit:cover; }
      .results { margin:2rem 0; font-size:1.5rem; }
      .results span { font-weight:600; color:var(--primary-color); }
      .tracks { margin-top:2rem; text-align:left; }
      .song-card { background-color:var(--card-bg); border-radius:12px; margin:1rem 0; box-shadow:var(--shadow); overflow:hidden; }
      .song-card iframe { display:block; width:100%; border-radius:12px; }
      .song-card > div { padding:1rem; text-align:center; width:100%; }
      .song-card > div h4 { margin-top:0; }
      .song-card > div a { color:var(--primary-color); text-decoration:none; }
      .song-card > div a:hover { text-decoration:underline; }
      .auth-container { display:flex; align-items:center; justify-content:center; min-height:100vh; position:relative; z-index:1; }
      .auth-form { background-color:var(--card-bg); padding:2.5rem; border-radius:12px; box-shadow:var(--shadow); width:100%; max-width:400px; text-align:center; }
      .auth-form h2 { color:var(--primary-color); margin-top:0; }
      .input-group { text-align:left; margin-bottom:1.5rem; }
      .input-group label { display:block; margin-bottom:.5rem; font-weight:600; }
      .input-group input { width:100%; padding:12px; border:1px solid var(--border-color); border-radius:8px; box-sizing:border-box; font-size:1rem; transition:border-color .3s ease, box-shadow .3s ease; }
      .input-group input:focus-visible { outline:none; border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(46,125,50,0.3); }
      .auth-button { width:100%; padding:14px; font-size:1.1rem; }
      .logout-button { background-color:#f44336; }
      .logout-button:hover { background-color:#d32f2f; }
      .form-switcher { margin-top:1.5rem; font-size:.9rem; }
      .form-switcher span { color:var(--primary-color); text-decoration:underline; cursor:pointer; }
      .error-message { color:var(--error-color); margin-top:.5rem; min-height:1.2em; }
      .info-message { color:var(--info-color); margin-top:.5rem; min-height:1.2em; }
      .app-error-message { color:var(--error-color); background-color: rgba(211,47,47,0.08); border:1px solid rgba(211,47,47,0.15); border-radius:8px; padding:1rem; margin-top:1.5rem; }
      .forgot-password-link { text-align:center; margin-top:-10px; margin-bottom:10px; font-size:.9rem; }
      .forgot-password-link span { color:var(--primary-color); text-decoration:underline; cursor:pointer; }
      .login-background { position:fixed; top:0; left:0; width:100vw; height:100vh; background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLDgoKCgsKCwoLDREAMBAPDARkEBgRE'); background-size:cover; background-position:center; filter: brightness(0.7); z-index:0; }
      .login-background::before { content:''; position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%); }
      .app-background { position:fixed; top:0; left:0; width:100vw; height:100vh; overflow:hidden; z-index:0; background: radial-gradient(circle at top left, var(--gradient-green-light), transparent 50%), radial-gradient(circle at bottom right, var(--gradient-green-medium), transparent 50%); animation: gradient-shift 6s ease infinite alternate; }
      @keyframes gradient-shift { 0% { background-position: 0% 0%, 100% 100%; background-size: 200% 200%; } 100% { background-position: 100% 100%, 0% 0%; background-size: 200% 200%; } }
      .floating-emojis-container { position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:0; overflow:hidden; }
      .floating-emoji { position:absolute; font-size:2rem; animation: float-up 10s linear infinite; opacity:.6; }
      @keyframes float-up { 0% { transform: translateY(100vh) rotate(0deg); opacity:.6; } 100% { transform: translateY(-10vh) rotate(360deg); opacity:0; } }
    `}</style>
  );
}
