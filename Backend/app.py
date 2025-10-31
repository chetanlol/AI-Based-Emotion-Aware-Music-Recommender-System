# Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import base64
from io import BytesIO
import traceback # Added for better error logging

# Load environment variables for security
from dotenv import load_dotenv
load_dotenv()

# --- ADDED: Database, Hashing, and Forgot Password Imports ---
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import pooling, Error as MySQLError
import uuid # For generating reset tokens
from datetime import datetime, timedelta # For token expiry
# --- END ADDED IMPORTS ---

app = Flask(__name__)
# Allow requests from your Vite frontend development server
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) # Adjust port if needed

# --- MODEL CONFIGURATION ---
try:
    MODEL_PATH = os.getenv("MODEL_PATH", "rafdb_cnn_model.h5") # Read from .env if available
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

class_labels = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

# --- SPOTIFY API CONFIGURATION ---
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

sp = None
if CLIENT_ID and CLIENT_SECRET:
    try:
        sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
            client_id=CLIENT_ID, client_secret=CLIENT_SECRET))
        print("✅ Authenticated with Spotify successfully!")
    except Exception as e:
        print(f"⚠️ Spotify authentication failed: {e}")
else:
    print("⚠️ Spotify credentials not found in .env file! Recommendations will not work.")

emotion_genre_map = {
    "happy": "pop", 
    "sad": "sad", # Use Spotify's 'sad' genre
    "angry": "rock", 
    "fear": "ambient",
    "neutral": "classical", 
    "surprise": "electronic", 
    "disgust": "metal"
}

# --- MySQL Database Configuration for XAMPP ---
db_pool = None
try:
    print("Attempting to create MySQL connection pool for XAMPP...")
    db_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="emotion_app_pool",
        pool_size=5,
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DB", "emotion_app_db"), # Ensure this matches your DB name in .env
        pool_reset_session=True,
        connection_timeout=10
    )
    conn = db_pool.get_connection() # Test connection
    print("✅ MySQL connection pool created and tested successfully.")
    conn.close()
except MySQLError as err:
    print(f"❌ FATAL ERROR connecting to MySQL: {err}")
    print("   Please ensure XAMPP MySQL is running, the database exists,")
    print("   and your .env file has the correct credentials.")
    db_pool = None
except Exception as e:
    print(f"❌ An unexpected error occurred during DB pool creation: {e}")
    db_pool = None

# --- Helper Function for Database Operations ---
def execute_db_query(query, params=None, fetch_one=False, fetch_all=False, dictionary=False, commit=False):
    if not db_pool:
        print("❌ DB_HELPER: Cannot execute query - Database pool is not available.")
        return False if commit else None

    conn = None
    cursor = None
    operation = "COMMIT" if commit else ("FETCH" if fetch_one or fetch_all else "EXECUTE")
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=dictionary)
        print(f"     [DB] Executing {operation}: {query[:100]}... Params: {params}")
        cursor.execute(query, params or ())

        if commit:
            conn.commit()
            print(f"     [DB] {operation} successful.")
            return True

        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        
        log_detail = f"fetchone" if fetch_one else (f"fetchall: {len(result)} rows" if fetch_all else "execute")
        print(f"     [DB] {operation} successful ({log_detail}).")
        return result

    except MySQLError as err:
        print(f"❌ DB_HELPER: Database Error during {operation}: {err}")
        if commit and conn: conn.rollback()
        return False if commit else None
    except Exception as e:
        print(f"❌ DB_HELPER: Unexpected error during DB query ({operation}): {e}")
        traceback.print_exc()
        return False if commit else None
    finally:
        if conn and conn.is_connected():
            if cursor: cursor.close()
            conn.close()

# --- Authentication Endpoints ---
@app.route("/register", methods=["POST"])
def register():
    print("\n--- INCOMING REQUEST: /register ---")
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        existing_user = execute_db_query("SELECT id FROM users WHERE username = %s", (username,), fetch_one=True)
        if existing_user:
            print(f"⚠️ Registration failed: Username '{username}' already exists.")
            return jsonify({"error": "Username already exists"}), 409

        hashed_password = generate_password_hash(password)
        success = execute_db_query(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, hashed_password),
            commit=True
        )

        if success:
            print(f"✅ User '{username}' successfully registered in MySQL.")
            return jsonify({"message": "Registration successful!"}), 201
        else:
            print(f"❌ User '{username}' registration FAILED (check previous DB error).")
            return jsonify({"error": "Database error during registration."}), 500

    except Exception as e:
        print(f"❌ UNEXPECTED SERVER ERROR in /register:")
        traceback.print_exc()
        return jsonify({"error": "A server error occurred during registration."}), 500

@app.route("/login", methods=["POST"])
def login():
    print("\n--- INCOMING REQUEST: /login ---")
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        user = execute_db_query(
            "SELECT id, password_hash FROM users WHERE username = %s",
            (username,),
            fetch_one=True,
            dictionary=True # Get results as dict
        )

        if user and check_password_hash(user.get('password_hash', ''), password):
            print(f"✅ Login successful for user '{username}'.")
            # Return userId needed by the frontend
            return jsonify({"message": "Login successful!", "userId": user['id']})
        else:
            print(f"⚠️ Login failed for user '{username}'. Invalid credentials or user not found.")
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        print(f"❌ UNEXPECTED SERVER ERROR in /login:")
        traceback.print_exc()
        return jsonify({"error": "A server error occurred during login."}), 500

# --- Forgot Password Endpoints ---
reset_tokens = {} # Temporary storage

@app.route("/request-reset", methods=["POST"])
def request_password_reset():
    print("\n--- INCOMING REQUEST: /request-reset ---")
    try:
        data = request.get_json()
        username = data.get('username')
        if not username:
            return jsonify({"error": "Username is required"}), 400

        user = execute_db_query(
            "SELECT id FROM users WHERE username = %s",
            (username,),
            fetch_one=True,
            dictionary=True
        )

        if not user:
            print(f"⚠️ Password reset requested for potentially non-existent user '{username}'.")
            return jsonify({"message": "If an account with that username exists, reset instructions have been simulated."})

        token = str(uuid.uuid4())
        expiry_time = datetime.now() + timedelta(hours=1)
        reset_tokens[token] = {"user_id": user['id'], "expires_at": expiry_time}

        print(f"✅ Generated password reset token for user '{username}': {token}")
        return jsonify({"message": "Password reset token generated (simulated email).", "reset_token": token})

    except Exception as e:
        print(f"❌ AN UNEXPECTED ERROR OCCURRED in /request-reset:")
        traceback.print_exc()
        return jsonify({"error": "A server error occurred while requesting password reset."}), 500

@app.route("/reset-password", methods=["POST"])
def reset_password():
    print("\n--- INCOMING REQUEST: /reset-password ---")
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400

        token_data = reset_tokens.get(token)

        if not token_data:
            print(f"⚠️ Invalid reset token received: {token}")
            return jsonify({"error": "Invalid or expired reset token"}), 400

        if datetime.now() > token_data.get('expires_at', datetime.min):
            print(f"⚠️ Expired reset token used: {token}")
            if token in reset_tokens: del reset_tokens[token]
            return jsonify({"error": "Invalid or expired reset token"}), 400

        user_id = token_data.get('user_id')
        if not user_id:
            print(f"❌ Token data is invalid (missing user_id): {token_data}")
            return jsonify({"error": "Internal token error."}), 500

        new_hashed_password = generate_password_hash(new_password)
        success = execute_db_query(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (new_hashed_password, user_id),
            commit=True
        )

        if success:
            print(f"✅ Password successfully reset for user ID {user_id}.")
            if token in reset_tokens: del reset_tokens[token]
            return jsonify({"message": "Password has been reset successfully."})
        else:
            print(f"❌ Failed to update password in database for user ID {user_id}.")
            return jsonify({"error": "Failed to update password in database."}), 500

    except Exception as e:
        print(f"❌ AN UNEXPECTED ERROR OCCURRED in /reset-password:")
        traceback.print_exc()
        return jsonify({"error": "A server error occurred while resetting password."}), 500


# --- API ENDPOINTS (Emotion & Recommendations) ---
@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    print("\n--- INCOMING REQUEST: /detect-emotion ---")
    if not model:
        return jsonify({"error": "Model is not loaded"}), 500

    image_data = None
    if 'image' in request.files:
        print("Processing image from file upload...")
        image_data = request.files['image'].read()
    elif request.is_json:
        print("Processing image from JSON payload...")
        base64_str_from_json = request.json.get('image')
        if base64_str_from_json:
            try:
                if ',' in base64_str_from_json: base64_str = base64_str_from_json.split(',')[1]
                else: base64_str = base64_str_from_json
                image_data = base64.b64decode(base64_str)
            except Exception as e:
                print(f"❌ Error decoding base64: {e}"); return jsonify({"error": "Invalid base64"}), 400
        else: print("❌ JSON but no 'image' key.")

    if not image_data:
        print("❌ ERROR: No image data."); return jsonify({"error": "No image data"}), 400

    try:
        image = Image.open(BytesIO(image_data)).convert("L").resize((48, 48))
        image_array = np.expand_dims(np.array(image) / 255.0, axis=(0, -1))
        prediction = model.predict(image_array)
        emotion_idx = np.argmax(prediction)
        detected_emotion = class_labels[emotion_idx]
        confidence_score = float(prediction[0][emotion_idx])
        print(f"🎭 Detected: {detected_emotion} ({confidence_score:.2%})")
        return jsonify({"emotion": detected_emotion, "confidence": confidence_score})
    except Exception as e:
        print(f"❌ Error in detection: {e}"); traceback.print_exc()
        return jsonify({"error": "Failed to process image."}), 500

@app.route("/recommendations/<emotion>/<language>", methods=["GET"])
def recommendations(emotion, language):
    print(f"\n--- INCOMING REQUEST: /recommendations/{emotion}/{language} ---")
    if not sp: return jsonify({"error": "Spotify service unavailable"}), 500

    try:
        language_map = {"en": {"name": "English", "market": "US"}, "hi": {"name": "Hindi", "market": "IN"},
                        "ta": {"name": "Tamil", "market": "IN"}, "te": {"name": "Telugu", "market": "IN"}}
        lang_info = language_map.get(language, {"name": "English", "market": "US"})
        language_name = lang_info["name"]; market_code = lang_info["market"]
        emotion_lower = emotion.lower()
        genre = emotion_genre_map.get(emotion_lower, "pop")
        
        # --- NEW FALLBACK LOGIC ---
        
        # Attempt 1: Specific query (genre + language)
        query1 = f"genre:{genre} {language_name}"
        print(f"🎧 Searching Spotify (Attempt 1): '{query1}' in market '{market_code}'")
        results = sp.search(q=query1, type="track", limit=10, market=market_code)
        tracks = results["tracks"]["items"]

        # Attempt 2: Broader query (emotion + language) if first attempt fails
        if not tracks:
            print(f"⚠️ No tracks found for query 1. Trying broader search...")
            # This query searches for the emotion as a keyword, which is more flexible
            query2 = f"{language_name} {emotion_lower} songs"
            print(f"🎧 Searching Spotify (Attempt 2): '{query2}' in market '{market_code}'")
            results = sp.search(q=query2, type="track", limit=10, market=market_code)
            tracks = results["tracks"]["items"]
        
        # --- END OF FALLBACK LOGIC ---

        if not tracks: 
            print(f"⚠️ No tracks found for: '{query1}' or '{query2}'"); 
            return jsonify({"tracks": []})

        music_list = []
        for t in tracks:
            if not t or not isinstance(t, dict) or not t.get("artists"): continue
            artist_list = t.get("artists", [])
            first_artist = artist_list[0].get("name", "Unknown") if artist_list and isinstance(artist_list[0], dict) else "Unknown"
            external_urls = t.get("external_urls", {}); track_id = t.get('id')
            music_list.append({
                "name": t.get("name", "Unknown"), "artist": first_artist,
                "spotify_url": external_urls.get("spotify"),
                "image": t.get("album", {}).get("images", [{}])[0].get("url") if t.get("album", {}).get("images") else None,
                "preview_url": t.get("preview_url"),
                "embed_url": f"https://open.spotify.com/embed/track/{track_id}" if track_id else None })

        print(f"✅ Returning {len(music_list)} tracks.")
        return jsonify({"tracks": music_list})
    except Exception as e:
        print(f"❌ Spotify Error: {e}"); traceback.print_exc()
        return jsonify({"error": "Could not fetch recommendations."}), 500

# -------------------------
# Run The Application
# -------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)

