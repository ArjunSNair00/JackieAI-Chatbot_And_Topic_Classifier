# Title Generator Mobile (Expo)

This is the React Native Expo mobile client for the existing Python backend.

## Backend Contract (unchanged)

- POST /predict with body {"text":"..."}
- POST /chat with body {"messages":[{"role":"system|user|assistant","content":"..."}]}

Set API base URL in app.json:

- expo.extra.apiBaseUrl

Default is currently:

- https://topic-classifier-ai.onrender.com

## Run

1. Install dependencies

```bash
npm install
```

2. Start Expo

```bash
npm run start
```

3. Open on Android/iOS from Expo Go.

## Implemented So Far

- Tab navigation: Chatbot and Classifier
- Session list and persistence via AsyncStorage
- Chat screen with send + stop (AbortController)
- Classifier calls to /predict
- Chatbot calls to /chat
- Message copy + PDF export with inline action states
- PDF attach with real text extraction via hidden WebView + PDF.js
- Jackie mode toggle with persistent preference

## Next Step

- Replace the text-based Jackie toggle with a custom switch component and haptic feedback.
- Add optimistic retry UI for failed API responses.
