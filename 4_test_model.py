import joblib

model = joblib.load("topic_classifier.pkl")

print(model.predict(["calculus"]))
#"ai","math","physics","philosophy","history","programming","biology","economics"