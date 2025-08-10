# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Bilkul bhai, **mood detect karne** ke liye aapko **face-api.js** ka **expression recognition** model use karna padega. Iske liye main aapko **step-by-step guide** de raha hoon — models kaise download karne hain, kaunse models chahiye, React mein kaise setup karna hai — sab kuch simple language mein.

---

# 🧠 Aap Kya Banana Chahte Ho?

User ka **facial expression (mood)** detect karna, jaise:

* Happy 😀
* Sad 😢
* Angry 😠
* Surprised 😲
* Disgusted 🤢
* Fearful 😨
* Neutral 😐

Ye sab detect hota hai **face-api.js** se.

---

## ✅ Step-by-Step Guide for Expression Detection using face-api.js in React

---

## 🛠️ Step 1: React App Setup Karo

```bash
npx create-react-app face-mood-detector
cd face-mood-detector
npm install face-api.js
```

---

## 📥 Step 2: Required Models Download Karo

Aapko ye **4 models** chahiye honge:

| Purpose                     | Model Name           | Required                           |
| --------------------------- | -------------------- | ---------------------------------- |
| Face detection              | `tiny_face_detector` | ✅                                  |
| Face landmarks              | `face_landmark_68`   | ✅                                  |
| Expression detection        | `face_expression`    | ✅                                  |
| (Optional) Face recognition | `face_recognition`   | ❌ (not needed for expression only) |

---

### 🔗 Download All Models from Official Link:

1. Open this page:
   👉 [https://justadudewhohacks.github.io/face-api.js/models/](https://justadudewhohacks.github.io/face-api.js/models/)

2. Download ye 3 folders:

   * `tiny_face_detector_model`
   * `face_landmark_68_model`
   * `face_expression_model`

3. Place them in this path inside your React app:

```
public/
└── models/
    ├── tiny_face_detector_model-weights_manifest.json
    ├── tiny_face_detector_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_expression_model-weights_manifest.json
    ├── face_expression_model-shard1
```

🟢 **Note:** Ye files `.json` aur `.bin` hoti hain. Unke names change mat karna.

---

## ⚙️ Step 3: React Component Mein Models Load Karna

### `App.js` Example

```jsx
import React, { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  // Load Models
  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  // Start Webcam
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error:', err));
  };

  useEffect(() => {
    loadModels().then(startVideo);
  }, []);

  // Detect Mood (Expressions)
  const handleVideoPlay = async () => {
    const video = videoRef.current;

    setInterval(async () => {
      if (video.paused || video.ended) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const canvas = canvasRef.current;
      faceapi.matchDimensions(canvas, {
        width: video.width,
        height: video.height,
      });

      const resizedDetections = faceapi.resizeResults(detections, {
        width: video.width,
        height: video.height,
      });

      canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 500);
  };

  return (
    <div>
      <h2>😃 Mood Detector</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="720"
        height="560"
        onPlay={handleVideoPlay}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
}

export default App;
```

---

## 🏁 Step 4: Run Your App

```bash
npm start
```

Aapka webcam open hoga, aur user ke face expressions detect honge real-time.

---

## 🔍 Output Example (Console or Overlay):

```js
{
  happy: 0.85,
  sad: 0.05,
  angry: 0.01,
  neutral: 0.09,
  ...
}
```

Aap in expressions ka use karke mood ka message bhi dikha sakte ho like:

```js
if (expressions.happy > 0.7) {
  console.log("User is Happy 😄");
}
```

---

## ⚠️ Troubleshooting Tips:

* Make sure `models/` folder is inside `public/`
* Check file names (case-sensitive)
* Use HTTPS and allow camera permission

---

Agar tu chahe to main tujhe ye models `.zip` mein ready bhi bhej sakta hoon (bas tu mujhe allow kar file bhejne ke liye). Ya bol de kis tarah chahiye.

Aur koi doubt ho to poochh le bhai 💬
