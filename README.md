# 🕶️ Jackie - AI 

[![Python](https://img.shields.io/badge/Python-3.x-blue.svg)](https://www.python.org/)
[![HTML5](https://img.shields.io/badge/HTML5-Modern-orange.svg)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind-Styling-38B2AC.svg)]()
[![License](https://img.shields.io/badge/Status-Underworld--Certified-yellow.svg)]()

> "Money is always an issue!" — Jackie.

**Jackie-AI** is an AI Chatbot & Classification platform that combines high-performance machine learning with a premium, "mass" themed user experience. Inspired by the iconic Malayalam cinema character Sagar Alias Jackie, this application allows you to swap between serious professional assistance and the legendary underworld don persona.

Web:
https://jackie-ai.vercel.app

Apk:
https://expo.dev/artifacts/eas/gsNXtmwpJShBz1hP6sYpDC.apk

---

## ⚡ Key Features

### 🕺 Jackie Mode (The Mass Update)
Toggle survival mode! Use the **Jackie Mode** switch in the sidebar to flip between:
- **Jackie Mode ON**: Experience the sarcastic, stylized response of Sagar Alias Jackie. No sentiments, only mass. Addressing users as "Customers" and quoting Dubai deals.
- **Jackie Mode OFF**: A professional, concise, and serious AI assistant for quick business logic and accurate data.

### 📄 Underworld PDF Scanner
Equipped with a high-performance PDF parser (`pdf.js`).
- Drop your PDF deals directly into the chat.
- Jackie extracts the hidden text and provides "official quotations" based on the content.
- Support for complex document analysis with context memory.

### 💰 Underworld Sector Classifier
A custom-trained ML model (`scikit-learn` + `TF-IDF`) that identifies deal categories with high confidence.
- Input your "deal details" and the scanner will classify it as **Business**, **Underworld**, or **Gold Deals**.
- Visual confidence meters including 100% Match, Possible, and Low Confidence alerts.

### 🎨 Premium "Mass" UI
- **Design**: Blur-heavy backgrounds with a sleek dark theme.
- **Cartoon Border Styling**: A unique, high-contrast aesthetic that feels alive.
- **Wavy Sine-Wave Animations**: Custom SVG/CSS animations for that "Thinking" state.
- **Responsive Layout**: Optimized for Desktop and Mobile (zooming disabled for consistent PWA-like feel).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla JS, TailwindCSS, Lucide Icons, PDF.js |
| **Backend** | Python, FastAPI (app.py) |
| **Machine Learning** | Scikit-learn, Pandas, TF-IDF Vectorization |
| **Export Engines** | html2pdf.js (Official Quotation PDF Exports) |
| **Deployment** | Vercel, Render |

---

## 🚀 Getting Started

### 1. Requirements
Make sure you have Python 3.8+ installed.

### 2. Setup
```bash
# Clone the repository
git clone <your-repo-url>

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the Command Center
```bash
python app.py
```
Open `http://localhost:5000` (or the port specified) in your browser.

---

## 📂 Project Structure

- `index.html`: The central "Mass" UI.
- `app.py`: Backend API and model serving.
- `topic_classifier.pkl`: The brains of the underworld classification.
- `1_dataset_generator.py`: Synthetic data engine.
- `3_train_classifier.py`: Training pipeline for the classifier.
- `dataset/`: Training raw data and cleaned CSVs.

---

## 📡 Deployment

The app is pre-configured for **Vercel** (`vercel.json`) and **Render** (`render.yaml`).
Simply connect your GitHub repo to either platform and it will deploy the API and Frontend automatically.

---

## 🖋️ Official Credits

**Directed by:** Jackie
**Produced by:** Underworld Tech Syndicate
**Music (Aesthetics) by:** Tailwind CSS

> "Nee Dubai kanditundo? Jackie Machaan is everywhere." 🕶️
