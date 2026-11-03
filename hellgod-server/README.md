# ⚡ HELLGOD – Ultimate All-in-One Server & AI Platform
**Version:** 1.0.0  
**License:** MIT (Zero Budget, Open-Source)  
**Platforms:** Android (8.0+) + Web Dashboard + Linux / Windows / Cloud  

---

## 🌐 Complete Documentation (English & हिंदी)

Welcome to **HELLGOD** — the futuristic, self-hostable, all-in-one server operations, file management, database controller, and AI assistant ecosystem.

---

### 1. Installation on Android (एंड्रॉइड पर इंस्टॉलेशन)
**English:**
You can host the entire HELLGOD server directly on an Android smartphone using **Termux** with zero cost:
1. Install Termux from F-Droid or GitHub.
2. Open Termux and run:
   ```bash
   pkg update -y && pkg upgrade -y
   pkg install -y nodejs-lts python git sqlite curl
   git clone https://github.com/your-username/hellgod-server.git
   cd hellgod-server
   bash scripts/install-android-termux.sh
   ```
3. Access the dashboard in your mobile browser at `http://localhost:3000`.

**हिंदी (Hindi):**
आप बिना किसी खर्च के किसी भी एंड्रॉइड फोन पर Termux के जरिए HELLGOD सर्वर चला सकते हैं:
1. F-Droid से Termux इंस्टॉल करें।
2. Termux खोलें और ऊपर दिए गए कमांड चलाएं।
3. अपने मोबाइल ब्राउज़र में `http://localhost:3000` खोलकर कंट्रोल पैनल चलाएं।

---

### 2. Installation on Linux (लिनक्स पर इंस्टॉलेशन)
**English:**
```bash
sudo apt update && sudo apt install -y nodejs npm python3 python3-pip git sqlite3
git clone https://github.com/your-username/hellgod-server.git
cd hellgod-server
npm install
npm run build
npm start
```
**हिंदी:**
Ubuntu या Debian सर्वर पर Node.js और Python इंस्टॉल करें, रिपॉजिटरी क्लोन करें और `npm start` चलाएं।

---

### 3. Installation on Windows (विंडोज पर इंस्टॉलेशन)
**English:**
1. Install Node.js (v20+) and Python 3.11+.
2. Open PowerShell or WSL2:
   ```powershell
   git clone https://github.com/your-username/hellgod-server.git
   cd hellgod-server
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in Chrome/Edge.

**हिंदी:**
Node.js और Python इंस्टॉल करने के बाद PowerShell खोलें, कमांड चलाएं और `http://localhost:3000` पर डैशबोर्ड एक्सेस करें।

---

### 4. Running Backend (फास्टएपीआई बैकएंड चलाना)
**English:**
HELLGOD includes a native Python FastAPI microservice architecture:
```bash
cd hellgod-server/backend
pip install -r requirements.txt
python main.py
```
FastAPI runs on `http://localhost:8000` with Swagger docs at `/docs`.

**हिंदी:**
Python FastAPI इंजन को `python main.py` से शुरू करें। इसके API डाक्यूमेंट्स `http://localhost:8000/docs` पर उपलब्ध हैं।

---

### 5. Running Frontend (फ्रंटएंड चलाना)
**English:**
```bash
npm run dev
```
Runs the React 19 + TypeScript + Tailwind CSS cyberpunk web interface on port 3000.

---

### 6. Connecting Android App to Backend (एंड्रॉइड ऐप को बैकएंड से कनेक्ट करना)
**English:**
1. In the Android App settings or `MainActivity.kt`, set `serverUrl`:
   - Android Emulator: `http://10.0.2.2:3000`
   - Local Wi-Fi Network: `http://192.168.1.X:3000`
   - Cloud / Public Server: `https://your-hellgod-server.com`
2. Authenticate using Root Admin credentials:
   - Username: `HellGod`
   - Password: `HellGod@1122`

**हिंदी:**
अपने मोबाइल ऐप को सर्वर से कनेक्ट करने के लिए अपने सर्वर का IP या URL ऐप सेटिंग्स में डालें और एडमिन लॉगिन `HellGod / HellGod@1122` से लॉगिन करें।

---

### 7. Publishing Source Code on GitHub (गिटहब पर पब्लिश करना)
**English:**
```bash
git init
git add .
git commit -m "feat: HELLGOD v1.0.0 master release"
git branch -M main
git remote add origin https://github.com/your-username/hellgod-server.git
git push -u origin main
```
*Note: Never commit `.env` or sensitive credentials. HELLGOD `.gitignore` is pre-configured.*

---

### 8. Building APK (एपीके बिल्ड करना)
**English:**
Build using Android Studio or command-line Gradle:
```bash
cd hellgod-server/android
./gradlew assembleDebug
```
Output location: `app/build/outputs/apk/debug/app-debug.apk`

**Automated GitHub Actions Build:**
The repository includes `.github/workflows/android-apk-build.yml` which compiles the APK on every GitHub push automatically!

**हिंदी:**
टर्मिनल से `./gradlew assembleDebug` चलाकर APK बनाएं, या GitHub Actions का इस्तेमाल करें जो अपने आप हर पुश पर नया APK बना देता है।

---

### 9. Downloading APK (एपीके डाउनलोड करना)
**English:**
1. In the HELLGOD Web Dashboard, click the **Android APK Center** tab.
2. Click **Download Debug APK (v1.0.0)** for instant installation.
3. On GitHub: Navigate to the **Releases** or **Actions** tab -> Artifacts -> `hellgod-debug-apk`.

---

### 10. Deploying Server for Free (फ्री में सर्वर डिप्लॉय करना)
**English:**
- **Render.com (Free Tier):** Connect GitHub repo -> Build Command: `npm install && npm run build` -> Start Command: `npm start`.
- **Railway.app (Free Starter):** One-click Dockerfile deploy.
- **Oracle Cloud (Always Free Tier):** Provision a free 4 OCPU, 24GB RAM ARM instance running Ubuntu, clone HELLGOD and run with `systemd` or Docker Compose.
- **Termux Android:** 100% Free self-hosting on your spare phone.

**हिंदी:**
बिना पैसे खर्च किए आप Render, Railway, Oracle Cloud Always-Free Tier, या अपने पुराने एंड्रॉइड फोन (Termux) पर सर्वर चला सकते हैं।

---

### 11. Security and Backup Configuration (सुरक्षा और बैकअप)
**English:**
- **Rate Limiting:** Protects against brute-force attacks by locking out failed logins.
- **Path Traversal Shield:** Sanitizes all filesystem requests (`sanitizeFilePath`).
- **Command Allowlist:** Prevents arbitrary shell injection.
- **Automated Snapshots:** Run `bash scripts/backup.sh` to generate SHA-256 encrypted archive backups.

**हिंदी:**
HELLGOD में ब्रूट-फोर्स सुरक्षा, फ़ाइल ट्रेवर्सल प्रोटेक्शन, और कमांड अलोलिस्ट मौजूद है। बैकअप के लिए `bash scripts/backup.sh` चलाएं।
