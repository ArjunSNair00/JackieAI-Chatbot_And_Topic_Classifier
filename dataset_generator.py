import csv
import random
import hashlib
import threading
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ==========================
# CONFIG
# ==========================

MODEL = os.getenv("MODEL_NAME", "deepseek-v3.2")
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://ollama.com/v1")

TARGET_SAMPLES = 10000   # first test dataset
BATCH_SIZE = 200
NUM_WORKERS = 6

OUTPUT_FILE = "dataset.csv"

BASE_TOPICS = [
    "ai","math","physics","philosophy",
    "history","programming","biology","economics"
]

TOPIC_MUTATIONS = [
    "introduction to {}",
    "advanced {} concepts",
    "history of {}",
    "{} applications",
    "{} in modern science",
    "future of {}",
    "real world {}"
]

# ==========================
# CLIENT
# ==========================

client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY
)

# ==========================
# GLOBAL STATE
# ==========================

seen = set()
total_generated = 0
lock = threading.Lock()

# ==========================
# HELPERS
# ==========================

def generate_topic():
    base = random.choice(BASE_TOPICS)
    template = random.choice(TOPIC_MUTATIONS)
    return template.format(base), base


def is_duplicate(text):
    h = hashlib.md5(text.encode()).hexdigest()
    if h in seen:
        return True
    seen.add(h)
    return False


def generate_batch(topic_prompt, label):

    prompt = f"""
Generate {BATCH_SIZE} CSV rows.

Format:
sentence,label

Topic context: {topic_prompt}
Label: {label}

Rules:
- sentence length 6-15 words
- label must be "{label}"
- no numbering
- no explanations
- output only CSV rows
"""

    response = client.responses.create(
        model=MODEL,
        input=prompt
    )

    return response.output_text


# ==========================
# WORKER
# ==========================

def worker(file, writer):

    global total_generated

    while True:

        with lock:
            if total_generated >= TARGET_SAMPLES:
                return

        topic_prompt, label = generate_topic()

        try:

            result = generate_batch(topic_prompt, label)

            for line in result.split("\n"):

                if "," not in line:
                    continue

                sentence, label = line.split(",",1)
                sentence = sentence.strip()
                label = label.strip()

                if is_duplicate(sentence):
                    continue

                with lock:

                    if total_generated >= TARGET_SAMPLES:
                        return

                    writer.writerow([sentence,label])
                    file.flush()   # <-- important fix

                    total_generated += 1

                    if total_generated % 500 == 0:
                        print(f"{total_generated} samples generated")

        except Exception as e:
            print("API error:",e)


# ==========================
# MAIN
# ==========================

def main():

    with open(OUTPUT_FILE,"w",newline="",encoding="utf-8") as f:

        writer = csv.writer(f)
        writer.writerow(["text","label"])

        threads = []

        for _ in range(NUM_WORKERS):

            t = threading.Thread(target=worker,args=(f,writer))
            t.start()
            threads.append(t)

        for t in threads:
            t.join()

    print("Dataset generation complete")


if __name__ == "__main__":
    main()