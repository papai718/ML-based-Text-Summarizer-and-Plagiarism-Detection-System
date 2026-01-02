"""
summarizer_model.py
Reverted to t5-small (as requested) but tuned for abstractive summarization.
"""

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "t5-small"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Loading model '{MODEL_NAME}' on device: {device} ...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)
    print("Model loaded.")
except Exception as e:
    print(f"Error loading model: {e}")
    raise e

def summarize_text(article: str) -> str:
    """
    Generate a summary utilizing sampling to encourage 'new words' (abstraction).
    """
    if not article or not article.strip():
        return ""

    input_text = "summarize: " + article.strip().replace("\n", " ")

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=1024,
        truncation=True
    ).to(device)

    # Tune for "Coverage" + "Abstraction"
    # User Complaint: "Main data missing" -> implies Sampling went too far off track.
    # Solution: Beam Search (Deterministic) + High Length Penalty + No Repetition
    
    # Calculate a reasonable min length based on input
    input_word_count = len(article.split())
    min_len = min(50, int(input_word_count * 0.4)) 
    max_len = min(1200, int(input_word_count * 0.8))
    
    summary_ids = model.generate(
        inputs["input_ids"],
        do_sample=False, # Disable sampling to ensure factual consistency
        num_beams=5,     # Increased beams for better quality
        length_penalty=2.5, # Encourages longer summaries (more content coverage)
        min_length=min_len,
        max_length=max_len,
        no_repeat_ngram_size=2, # Stricter repetition check
        early_stopping=True
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary
