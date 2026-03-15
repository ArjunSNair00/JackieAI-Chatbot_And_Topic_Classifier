let’s build a **complete, practical guide** for your **topic classifier system**:

**From installing libraries → training DistilBERT → creating an API → connecting React → deploying on a free cloud.**

I’ll also estimate **disk size, RAM, and GPU requirements** so you know exactly what you need.

---

# 0️⃣ Final System Architecture

Your final system will look like this:

```
dataset.csv
     ↓
Training (Python)
     ↓
Fine-tuned DistilBERT model
     ↓
FastAPI server
     ↓
HTTP API
     ↓
React app
     ↓
Cloud deployment
```

---

# 1️⃣ System Requirements

Minimum machine:

| Resource | Recommended |
| -------- | ----------- |
| RAM      | 8GB         |
| Storage  | 10GB        |
| GPU      | optional    |
| Python   | 3.10+       |

Training **DistilBERT** is light.

---

# 2️⃣ Install Python

Download Python:

[https://www.python.org/downloads/](https://www.python.org/downloads/)

Check installation:

```bash
python --version
```

Expected:

```
Python 3.10+
```

---

# 3️⃣ Create Project Folder

```
topic-ai/
```

Structure we’ll use:

```
topic-ai
│
├─ dataset/
│   └─ dataset.csv
│
├─ training/
│   └─ train.py
│
├─ api/
│   └─ api.py
│
├─ model/
│
└─ frontend/
```

---

# 4️⃣ Create Virtual Environment

This prevents library conflicts.

```
python -m venv venv
```

Activate:

Windows:

```
venv\Scripts\activate
```

Mac/Linux:

```
source venv/bin/activate
```

---

# 5️⃣ Install Required Libraries

Install everything:

```bash
pip install torch transformers datasets pandas fastapi uvicorn scikit-learn
```

---

# 6️⃣ Disk Size Required (Approx)

| Library      | Size    |
| ------------ | ------- |
| torch        | ~900 MB |
| transformers | ~500 MB |
| datasets     | ~200 MB |
| pandas       | ~60 MB  |
| fastapi      | ~20 MB  |
| uvicorn      | ~10 MB  |
| scikit-learn | ~50 MB  |

Total libraries:

```
~1.7GB
```

Model size:

| Model      | Size   |
| ---------- | ------ |
| DistilBERT | ~250MB |

Total project size:

```
~2GB
```

Very manageable.

---

# 7️⃣ Create Dataset

Create:

```
dataset/dataset.csv
```

Example:

```
text,label
Stoicism teaches control over emotions,philosophy
Marcus Aurelius wrote Meditations,philosophy
Neural networks learn patterns,ai
Machine learning models train on data,ai
Graph theory studies networks,math
Calculus studies change,math
```

Better dataset size:

| Rows  | Quality |
| ----- | ------- |
| 100   | testing |
| 1000  | decent  |
| 5000+ | good    |

---

# 8️⃣ Training Script

Create:

```
training/train.py
```

Core training script:

```python
import pandas as pd
from datasets import Dataset
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    TrainingArguments,
    Trainer
)

df = pd.read_csv("../dataset/dataset.csv")

labels = list(df.label.unique())

label2id = {l:i for i,l in enumerate(labels)}
id2label = {i:l for l,i in label2id.items()}

df["label"] = df["label"].map(label2id)

dataset = Dataset.from_pandas(df)

tokenizer = DistilBertTokenizerFast.from_pretrained(
    "distilbert-base-uncased"
)

def tokenize(example):
    return tokenizer(
        example["text"],
        truncation=True,
        padding="max_length"
    )

dataset = dataset.map(tokenize)

model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(labels)
)

training_args = TrainingArguments(
    output_dir="../model",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset
)

trainer.train()

model.save_pretrained("../model")
tokenizer.save_pretrained("../model")
```

---

# 9️⃣ Train Model

Run:

```bash
cd training
python train.py
```

Training time:

| Hardware | Time      |
| -------- | --------- |
| CPU      | 10-20 min |
| GPU      | 2-5 min   |

Output folder:

```
model/
```

Contains:

```
config.json
pytorch_model.bin
tokenizer.json
```

---

# 🔟 Create API Server

Create:

```
api/api.py
```

Code:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

classifier = pipeline(
    "text-classification",
    model="../model",
    tokenizer="../model"
)

class Input(BaseModel):
    text: str

@app.post("/predict")
def predict(data: Input):

    result = classifier(data.text)

    return {
        "topic": result[0]["label"],
        "confidence": result[0]["score"]
    }
```

---

# 1️⃣1️⃣ Run API

```
cd api
uvicorn api:app --reload
```

Server:

```
http://127.0.0.1:8000
```

Test endpoint:

```
http://127.0.0.1:8000/docs
```

FastAPI auto-generates **Swagger UI**.

---

# 1️⃣2️⃣ React Frontend

Inside your React project:

Example component:

```javascript
import { useState } from "react";

function TopicPredictor() {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");

  const predict = async () => {
    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    setTopic(data.topic);
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />

      <button onClick={predict}>Detect Topic</button>

      <h2>{topic}</h2>
    </div>
  );
}

export default TopicPredictor;
```

---

# 1️⃣3️⃣ Free Cloud Deployment (FOSS)

Best free options:

| Platform           | Free tier    |
| ------------------ | ------------ |
| HuggingFace Spaces | good         |
| Railway            | limited free |
| Fly.io             | free tier    |
| Render             | free tier    |

Best for ML:

**HuggingFace Spaces**

---

# 1️⃣4️⃣ Deploy on HuggingFace Spaces

Create account:

[https://huggingface.co](https://huggingface.co)

Create:

```
New Space
```

Choose:

```
SDK: Docker or Gradio
```

But we can deploy **FastAPI directly**.

---

### Upload files

```
api.py
model/
requirements.txt
```

requirements.txt:

```
torch
transformers
fastapi
uvicorn
pandas
datasets
```

---

### Start command

```
uvicorn api:app --host 0.0.0.0 --port 7860
```

Then your API becomes:

```
https://your-space.hf.space/predict
```

---

# 1️⃣5️⃣ Connect React to Cloud

Instead of localhost:

```
http://localhost:8000/predict
```

Use:

```
https://your-space.hf.space/predict
```

Now your **React app uses the cloud model**.

---

# 1️⃣6️⃣ Final Production Architecture

```
User
 ↓
React frontend
 ↓
Cloud API (FastAPI)
 ↓
DistilBERT model
 ↓
Prediction
```

---

# 1️⃣7️⃣ Realistic Performance

DistilBERT inference speed:

| Hardware | Speed      |
| -------- | ---------- |
| CPU      | ~50-100 ms |
| GPU      | ~10-20 ms  |

So the user sees **instant topic detection**.

---

# 🚀 Cool Future Upgrade (you would like this)

Instead of just returning a topic:

```
paragraph
 ↓
topic classifier
 ↓
knowledge graph node
 ↓
NodeScape visualization
```

So your system could **automatically build knowledge graphs from text**.

That’s actually a **very interesting AI tool**.

---

If you want, I can also show you something **extremely useful before you start**:

How to generate **10,000 labeled topic samples automatically using an LLM** so you don’t have to manually write the dataset.
