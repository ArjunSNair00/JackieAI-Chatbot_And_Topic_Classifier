import pandas as pd

# Load the dirty data
df = pd.read_csv("dataset.csv")
# Define your valid labels
VALID_LABELS = ["ai", "math", "physics", "philosophy", "history", "programming", "biology", "economics"]

# Filter the dataframe to only include rows with valid labels
df = df[df['label'].isin(VALID_LABELS)]

# Reset index after filtering
df = df.reset_index(drop=True)

# Ensure the label column only contains the base topic
# This logic assumes the label is the text after the last comma
def clean_label(row):
    # Split by last comma and take the last part
    label = str(row['label']).split(',')[-1].strip()
    return label

df['label'] = df.apply(clean_label, axis=1)

# Save the cleaned version
df.to_csv("dataset_clean.csv", index=False)
print("Dataset cleaned. Please retrain using 'dataset_clean.csv'.")