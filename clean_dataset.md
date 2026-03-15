the output actually reveals **exactly what’s wrong with the dataset**, and it’s a very fixable issue. 👍

Your classifier accuracy (~0.81) is fine, but the **labels are corrupted**. Look at these lines from the report:

```
Truth, and Logic.,philosophy
choice, and meaning.,philosophy
clean code.,programming
```

Those appear as **labels** in the classifier output, which means your CSV parsing went wrong.

Example of a bad row in the dataset:

```
Truth, and Logic.,philosophy
```

Your script splits on the **first comma**, so it becomes:

```
text = "Truth"
label = " and Logic.,philosophy"
```

Now the model thinks the label is `"and Logic.,philosophy"` instead of `"philosophy"`.

That’s why you see weird labels like:

```
Truth, and Logic.,philosophy
depending on context,philosophy
run anywhere.
```

Those are **broken rows**.

---

# ✅ Fix 1 (most important): make the generator safer

Update the parsing part of your generator.

Instead of:

```python
sentence, label = line.split(",",1)
```

use:

```python
parts = line.rsplit(",", 1)
if len(parts) != 2:
    continue

sentence = parts[0].strip()
label = parts[1].strip()
```

Using `rsplit(",",1)` ensures the **last comma separates the label**, which is what we want.

---

# ✅ Fix 2: clean the existing dataset

You can repair the current dataset with this quick script.

Create `clean_dataset.py`:

```python
import pandas as pd

df = pd.read_csv("dataset.csv")

valid_labels = [
    "ai","math","physics","philosophy",
    "history","programming","biology","economics"
]

df = df[df["label"].isin(valid_labels)]

df.to_csv("dataset_clean.csv", index=False)

print("Clean rows:", len(df))
```

Run:

```bash
python clean_dataset.py
```

Then train using:

```
dataset_clean.csv
```

---

# ✅ Fix 3 (optional but improves training)

Add this to the classifier script:

```python
print(df["label"].value_counts())
```

You should see something like:

```
ai           1300
math         1280
physics      1270
...
```

Balanced datasets improve accuracy.

---

# 🎯 After fixing this

Your accuracy will likely jump to roughly:

```
0.88 – 0.94
```

even with the same data.

---

# 💡 One more thing I noticed

Your generator prompt probably allows **commas inside sentences**, which causes this parsing issue.

The safest instruction is:

```
Do not use commas inside sentences.
```

That prevents CSV corruption entirely.

---

