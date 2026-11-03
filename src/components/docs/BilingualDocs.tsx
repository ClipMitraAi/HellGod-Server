/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Terminal, 
  Smartphone, 
  Server, 
  Shield, 
  Cloud,
  ChevronRight
} from 'lucide-react';

interface DocSection {
  id: string;
  number: number;
  titleEn: string;
  titleHi: string;
  contentEn: string[];
  contentHi: string[];
  command?: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'android-install',
    number: 1,
    titleEn: 'Installation on Android (Termux)',
    titleHi: 'एंड्रॉइड पर इंस्टॉलेशन (Termux)',
    contentEn: [
      'Host the entire HELLGOD server directly on any Android 8.0+ smartphone with zero hardware budget.',
      'Install Termux from F-Droid, update repositories, and launch the one-click script.'
    ],
    contentHi: [
      'बिना किसी खर्च के अपने पुराने या नए एंड्रॉइड फोन पर पूरा HELLGOD सर्वर चलाएं।',
      'F-Droid से Termux डाउनलोड करें और नीचे दिए गए कमांड से ऑटोमैटिक इंस्टॉलेशन शुरू करें।'
    ],
    command: 'pkg update -y && pkg install -y nodejs-lts python git sqlite curl\nbash scripts/install-android-termux.sh'
  },
  {
    id: 'linux-install',
    number: 2,
    titleEn: 'Installation on Linux (Ubuntu/Debian)',
    titleHi: 'लिनक्स पर इंस्टॉलेशन (Ubuntu/Debian)',
    contentEn: [
      'Production deployment on Linux server with systemd background daemon service.',
      'Installs Node.js, Python 3.11, and SQLite with WAL durability.'
    ],
    contentHi: [
      'Ubuntu या Debian VPS पर HELLGOD को परमानेंट सर्विस के तौर पर चलाएं।',
      'यह अपने आप Node.js और Python 3.11 डिपेंडेंसी सेटअप कर देता है।'
    ],
    command: 'sudo apt update && sudo apt install -y nodejs npm python3 git sqlite3\ngit clone https://github.com/your-username/hellgod-server.git\ncd hellgod-server && npm install && npm start'
  },
  {
    id: 'windows-install',
    number: 3,
    titleEn: 'Installation on Windows (WSL2 / PowerShell)',
    titleHi: 'विंडोज पर इंस्टॉलेशन (WSL2 / PowerShell)',
    contentEn: [
      'Run HELLGOD on Windows 10/11 using PowerShell or Windows Subsystem for Linux (WSL2).',
      'Access local control panel at http://localhost:3000.'
    ],
    contentHi: [
      'Windows 10 या 11 में PowerShell खोलकर HELLGOD को आसानी से रन करें।',
      'ब्राउज़र में http://localhost:3000 खोलकर सर्वर को कंट्रोल करें।'
    ],
    command: 'git clone https://github.com/your-username/hellgod-server.git\ncd hellgod-server\nnpm install\nnpm run dev'
  },
  {
    id: 'backend-run',
    number: 4,
    titleEn: 'Running Backend (FastAPI Microservices)',
    titleHi: 'बैकएंड चलाना (FastAPI इंजन)',
    contentEn: [
      'HELLGOD includes high-throughput async Python FastAPI backend services on port 8000.',
      'Interactive Swagger API documentation is accessible at http://localhost:8000/docs.'
    ],
    contentHi: [
      'Python FastAPI बैकएंड इंजन पोर्ट 8000 पर सभी API रिक्वेस्ट को प्रोसेस करता है।',
      'इसके इंटरैक्टिव Swagger डॉक्यूमेंट्स http://localhost:8000/docs पर उपलब्ध हैं।'
    ],
    command: 'cd hellgod-server/backend\npip install -r requirements.txt\npython main.py'
  },
  {
    id: 'frontend-run',
    number: 5,
    titleEn: 'Running Frontend (React 19 + Cyberpunk UI)',
    titleHi: 'फ्रंटएंड चलाना (React 19 इंटरफ़ेस)',
    contentEn: [
      'Vite dev server with Tailwind CSS and crimson cyberpunk theme on port 3000.',
      'Includes real-time telemetry metrics and WebSocket event feed.'
    ],
    contentHi: [
      'React 19 और Tailwind CSS से बना फ्यूचरिस्टिक कंट्रोल पैनल पोर्ट 3000 पर रन होता है।',
      'इसमें रियल-टाइम सर्वर स्टेटस और लाइव एनिमेशन शामिल हैं।'
    ],
    command: 'npm run dev'
  },
  {
    id: 'connect-android',
    number: 6,
    titleEn: 'Connecting Android App to Backend',
    titleHi: 'एंड्रॉइड ऐप को बैकएंड से कनेक्ट करना',
    contentEn: [
      'In Android app settings or MainActivity.kt, configure your target server URL.',
      'Use http://10.0.2.2:3000 for Android Studio Emulator, or your local Wi-Fi IP (e.g. http://192.168.1.50:3000).',
      'Admin credentials: Username: HellGod | Password: HellGod@1122 (Full Root Clearance)'
    ],
    contentHi: [
      'एंड्रॉइड ऐप सेटिंग्स में जाकर अपने सर्वर का IP या डोमेन डालें।',
      'Android Emulator के लिए http://10.0.2.2:3000 और घर के Wi-Fi के लिए लोकल IP डालें।',
      'एडमिन लॉगिन: यूजरनेम: HellGod | पासवर्ड: HellGod@1122 (फुल सुपरएडमिन अधिकार)'
    ]
  },
  {
    id: 'github-publish',
    number: 7,
    titleEn: 'Publishing Source Code on GitHub',
    titleHi: 'सोर्स कोड गिटहब पर पब्लिश करना',
    contentEn: [
      'Initialize a git repository and push to GitHub. Automated workflows take care of testing and building APKs.',
      'Security rule: Never commit .env, API secrets, or keystores.'
    ],
    contentHi: [
      'अपने प्रोजेक्ट को GitHub पर अपलोड करें। GitHub Actions अपने आप APK बिल्ड कर देगा।',
      'सुरक्षा नियम: कभी भी अपनी सीक्रेट कीज या पासवर्ड Git पर अपलोड न करें।'
    ],
    command: 'git init\ngit add .\ngit commit -m "feat: HELLGOD v1.0.0 Production Release"\ngit branch -M main\ngit remote add origin https://github.com/your-username/hellgod-server.git\ngit push -u origin main'
  },
  {
    id: 'build-apk',
    number: 8,
    titleEn: 'Building APK (Gradle Command Line)',
    titleHi: 'एपीके बिल्ड करना (Gradle)',
    contentEn: [
      'Compile debug and release APK packages directly using Gradle wrapper.',
      'Generated APK is saved at app/build/outputs/apk/debug/app-debug.apk.'
    ],
    contentHi: [
      'टर्मिनल में जाकर Gradle से अपना एंड्रॉइड ऐप कंपाइल करें।',
      'बना हुआ APK फ़ाइल app/build/outputs/apk/debug/ फोल्डर में मिल जाएगा।'
    ],
    command: 'cd hellgod-server/android\n./gradlew assembleDebug'
  },
  {
    id: 'download-apk',
    number: 9,
    titleEn: 'Downloading APK',
    titleHi: 'एपीके डाउनलोड करना',
    contentEn: [
      '1. Click "DOWNLOAD APK (v1.0.0)" in the web header or Android APK Center.',
      '2. On GitHub: Check the Releases section or Actions tab artifacts for automated APK builds.'
    ],
    contentHi: [
      '1. वेब डैशबोर्ड में ऊपर दिए गए "DOWNLOAD APK" बटन पर क्लिक करके तुरंत APK डाउनलोड करें।',
      '2. GitHub रिपॉजिटरी के Releases या Actions टैब से भी हमेशा लेटेस्ट APK मिल जाता है।'
    ]
  },
  {
    id: 'free-deploy',
    number: 10,
    titleEn: 'Deploying Server for Free ($0.00 Cloud)',
    titleHi: 'फ्री में सर्वर डिप्लॉय करना ($0.00)',
    contentEn: [
      'Render.com (Free Web Service): Connect GitHub repo -> Build: npm run build -> Start: npm start.',
      'Oracle Cloud (Always Free Tier): 4 OCPU, 24GB RAM ARM instance running 24/7 forever at zero cost.',
      'Railway / Fly.io: Free starter tiers for dockerized deployment.'
    ],
    contentHi: [
      'Render.com पर फ्री में अपना GitHub रेपो कनेक्ट करके सर्वर लाइव करें।',
      'Oracle Cloud Always-Free Tier में 24GB RAM का सर्वर जीवनभर फ्री मिलता है।',
      'या अपने पुराने मोबाइल पर Termux के जरिए घर पर ही 24/7 फ्री सर्वर चलाएं।'
    ],
    command: 'bash scripts/deploy.sh'
  },
  {
    id: 'security-backup',
    number: 11,
    titleEn: 'Security & Backup Configuration',
    titleHi: 'सुरक्षा और बैकअप कॉन्फ़िगरेशन',
    contentEn: [
      'Anti-Brute-Force Rate Limiter: Blocks malicious IPs after 5 attempts.',
      'Path Traversal Prevention: Strict path sanitization on all filesystem endpoints.',
      'Automated Backups: Generates SHA-256 verified tar.gz snapshots.'
    ],
    contentHi: [
      'ब्रूट-फोर्स सुरक्षा: 5 गलत पासवर्ड डालने पर IP तुरंत ब्लॉक हो जाता है।',
      'फ़ाइल सुरक्षा: सर्वर से बाहर की फ़ाइलों को कोई हैक या डाउनलोड नहीं कर सकता।',
      'ऑटोमैटिक बैकअप: bash scripts/backup.sh से पूरा सिस्टम कभी भी बैकअप करें।'
    ],
    command: 'bash scripts/backup.sh'
  }
];

export const BilingualDocs: React.FC = () => {
  const [langFilter, setLangFilter] = useState<'both' | 'en' | 'hi'>('both');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSections = DOC_SECTIONS.filter(s => 
    !search ||
    s.titleEn.toLowerCase().includes(search.toLowerCase()) ||
    s.titleHi.toLowerCase().includes(search.toLowerCase()) ||
    s.contentEn.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              MASTER DOCUMENTATION // हिंदी & ENGLISH GUIDE
            </h1>
            <p className="text-xs font-mono text-slate-400">
              11 Comprehensive Operational Modules &bull; Zero-Budget Hosting &bull; Terminal Quick-Commands
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-[#101018] p-1 rounded border border-slate-800">
          <button
            onClick={() => setLangFilter('both')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${langFilter === 'both' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
          >
            SIDE-BY-SIDE
          </button>
          <button
            onClick={() => setLangFilter('en')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${langFilter === 'en' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
          >
            ENGLISH ONLY
          </button>
          <button
            onClick={() => setLangFilter('hi')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${langFilter === 'hi' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
          >
            हिंदी (HINDI)
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documentation sections (e.g. Termux, APK, Docker, Cloud)..."
          className="w-full bg-[#0a0a10] border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Documentation Section Cards */}
      <div className="space-y-4">
        {filteredSections.map(sec => (
          <div key={sec.id} className="cyber-panel rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-red-600/20">
              <span className="w-6 h-6 rounded bg-red-950 border border-red-600/40 text-red-400 font-display font-bold text-xs flex items-center justify-center">
                {sec.number}
              </span>
              <h2 className="font-display font-bold text-base text-white tracking-wide">
                {sec.titleEn}
              </h2>
              <span className="text-slate-500 text-xs hidden sm:inline">&bull;</span>
              <span className="text-xs font-mono text-red-400 hidden sm:inline">
                {sec.titleHi}
              </span>
            </div>

            {/* Content (Side by side or single) */}
            <div className={`grid gap-4 ${langFilter === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(langFilter === 'both' || langFilter === 'en') && (
                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    ENGLISH INSTRUCTIONS:
                  </span>
                  {sec.contentEn.map((line, i) => (
                    <p key={i} className="leading-relaxed">&bull; {line}</p>
                  ))}
                </div>
              )}

              {(langFilter === 'both' || langFilter === 'hi') && (
                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-red-400 font-bold block uppercase tracking-wider">
                    हिंदी निर्देश:
                  </span>
                  {sec.contentHi.map((line, i) => (
                    <p key={i} className="leading-relaxed">&bull; {line}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Copyable Command Box */}
            {sec.command && (
              <div className="mt-3 pt-2">
                <div className="flex items-center justify-between bg-[#08080d] border border-slate-800 rounded p-3 font-mono text-xs text-emerald-400">
                  <pre className="overflow-x-auto whitespace-pre-wrap">{sec.command}</pre>
                  <button
                    onClick={() => handleCopy(sec.command!, sec.id)}
                    className="p-1.5 rounded bg-[#161622] hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 ml-3"
                    title="Copy command"
                  >
                    {copiedId === sec.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
