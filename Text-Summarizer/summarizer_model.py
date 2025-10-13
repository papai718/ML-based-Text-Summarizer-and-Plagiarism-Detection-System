"""
summarizer_model.py
A small module that loads the summarization model and exposes summarize_text().
This uses T5-small as in your notebook. Adjust MODEL_NAME if you used a different model.
"""

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "t5-small"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load tokenizer and model
# Note: this will download the model if not present locally.
print(f"Loading model '{MODEL_NAME}' on device: {device} ...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)
print("Model loaded.")


def preprocess_text(text: str) -> str:
    """
    Minimal preprocessing: strip and replace newlines.
    If you had other preprocessing in the notebook, add it here.
    """
    return text.strip().replace("\n", " ")


def summarize_text(article: str) -> str:
    """
    Generate a summary for `article`. Returns a string summary.
    Uses generation settings similar to your notebook.
    """
    if not article or not article.strip():
        return ""

    clean_article = preprocess_text(article)

    # Prepare inputs: for t5 prefix with "summarize:" if you trained it that way
    # If you fine-tuned without a prefix, you can remove it.
    input_text = f"summarize: {clean_article}"

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=1024,
        truncation=True,
        padding="longest"
    ).to(device)

    # Generation parameters (from your notebook)
    summary_ids = model.generate(
        inputs["input_ids"],
        attention_mask=inputs.get("attention_mask", None),
        min_length=50,
        max_length=200,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True,
        no_repeat_ngram_size=3
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return summary
