import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

# 1. Load and prepare data
df = pd.read_csv("dataset_clean.csv")
# Define your valid labels
VALID_LABELS = ["ai", "math", "physics", "philosophy", "history", "programming", "biology", "economics"]

# Filter the dataframe to only include rows with valid labels
df = df[df['label'].isin(VALID_LABELS)]

# Reset index after filtering
df = df.reset_index(drop=True)

df = df.sample(frac=1, random_state=42).reset_index(drop=True)

X = df["text"]
y = df["label"]

# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Enhanced Pipeline
# The vectorizer converts raw text into numerical features
# The LogisticRegression classifier uses these features to predict the topic
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2), 
        stop_words='english', 
        max_features=5000
    )),
    ("clf", LogisticRegression(
        max_iter=500, 
        class_weight='balanced', 
        solver='lbfgs'
    ))
])

# 

# 4. Train
model.fit(X_train, y_train)

# 5. Evaluate
pred = model.predict(X_test)
print("\nClassification Report:\n")
print(classification_report(y_test, pred))

# 

# 6. Save for future inference
joblib.dump(model, "topic_classifier.pkl")
print("\nModel saved as topic_classifier.pkl")