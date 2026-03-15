import pandas as pd
import joblib

def batch_classify(input_file, output_file):
    # Load model and data
    model = joblib.load("topic_classifier.pkl")
    df = pd.read_csv(input_file)
    
    # Predict topics and confidence probabilities
    df['predicted_topic'] = model.predict(df['text'])
    
    # Get max probability as confidence score
    probs = model.predict_proba(df['text'])
    df['confidence'] = probs.max(axis=1)
    
    # Save
    df.to_csv(output_file, index=False)
    print(f"Classification complete. Results saved to {output_file}")

if __name__ == "__main__":
    batch_classify("new_titles.csv", "labeled_titles.csv")