from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from summarizer_model import summarize_text

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/summarize", methods=["POST"])
def summarize_api():
    data = request.get_json(force=True)
    text = data.get("text", "")
    if not text or not text.strip():
        return jsonify({"error": "No text provided"}), 400

    try:
        summary = summarize_text(text)
        return jsonify({"summary": summary})
    except Exception as e:
        # Return the error message for debugging (in production hide details)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Set host=0.0.0.0 only if you want external access; default is local only
    app.run(debug=True)
