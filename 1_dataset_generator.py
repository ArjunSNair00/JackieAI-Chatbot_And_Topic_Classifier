import csv
import random
import hashlib
import threading
import queue
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# CONFIGURATION
MODEL = "deepseek-v3.2"
TARGET_SAMPLES = 10000
NUM_WORKERS = 6
OUTPUT_FILE = "dataset.csv"

# Global State
seen = set()
write_queue = queue.Queue()
lock = threading.Lock() # Used only for the 'seen' set now

# Setup Client
MODEL_NAME = os.getenv("MODEL_NAME", "deepseek-v3.2")
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://ollama.com/v1")

client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

def generate_topic():
    base = random.choice(["ai", "math", "physics", "philosophy", "history", "programming", "biology", "economics"])
    template = random.choice(["introduction to {}", "advanced {} concepts", "history of {}", "{} applications", "{} in modern science", "future of {}", "real world {}"])
    return template.format(base), base

def is_duplicate(text):
    h = hashlib.md5(text.encode()).hexdigest()
    with lock:
        if h in seen: return True
        seen.add(h)
        return False

def generate_batch(topic_prompt, label):
    prompt = f"Generate 200 dataset rows. Format: sentence,label. Topic: {topic_prompt}. Label: {label}. Rules: 8-14 words, no commas, no quotes, no numbering, output ONLY CSV rows."
    response = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content

def writer_thread():
    """Consumes generated data from the queue and writes to disk."""
    with open(OUTPUT_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        count = 0
        while True:
            item = write_queue.get()
            if item is None: break  # Poison pill
            writer.writerow(item)
            f.flush()
            count += 1
            if count % 500 == 0: print(f"{count} samples saved.")
            write_queue.task_done()

def worker():
    """Produces data and puts it into the queue."""
    while True:
        # Check if we have enough
        if write_queue.qsize() >= TARGET_SAMPLES: break
        
        topic_prompt, label = generate_topic()
        try:
            result = generate_batch(topic_prompt, label)
            for line in result.strip().split("\n"):
                if "," not in line: continue
                parts = line.rsplit(",", 1)
                sentence, sent_label = [p.strip() for p in parts]
                if not is_duplicate(sentence):
                    write_queue.put([sentence, sent_label])
        except Exception as e:
            print(f"API Error: {e}")

if __name__ == "__main__":
    # Start Writer
    w_thread = threading.Thread(target=writer_thread)
    w_thread.start()
    
    # Start Workers
    workers = [threading.Thread(target=worker) for _ in range(NUM_WORKERS)]
    for t in workers: t.start()
    
    # Wait for completion
    for t in workers: t.join()
    write_queue.put(None) # Stop writer
    w_thread.join()
    print("Dataset generation complete.")