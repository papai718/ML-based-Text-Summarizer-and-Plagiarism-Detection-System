// Tab switching functionality
document.querySelectorAll(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((s) => s.classList.remove("active"));

    tab.classList.add("active");
    if (tab.id === "summaryTab") {
      document.getElementById("summarySection").classList.add("active");
    } else {
      document.getElementById("plagiarismSection").classList.add("active");
    }
  });
});

// Word count for text summarization
const inputText = document.getElementById("inputText");
if (inputText) {
  inputText.addEventListener("input", () => {
    const text = inputText.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    document.getElementById("wordCount").textContent = wordCount;
  });
}

// Word count for plagiarism checker
const plagiarismText = document.getElementById("plagiarismText");
if (plagiarismText) {
  plagiarismText.addEventListener("input", () => {
    const text = plagiarismText.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    document.getElementById("plagiarismWordCount").textContent = wordCount;
  });
}

// Text summarization function (calls Flask backend)
document.getElementById("summarizeBtn").addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) {
    alert("Please enter some text to summarize");
    return;
  }

  const summaryOutput = document.getElementById("summaryOutput");
  summaryOutput.textContent = "Generating summary...";

  // show result area while waiting
  document.getElementById("summaryResult").classList.remove("hidden");

  try {
    const response = await fetch("/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (data.summary) {
      const summary = data.summary;
      summaryOutput.textContent = summary;

      const originalWordCount = text.split(/\s+/).length;
      const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
      const reduction = Math.round((1 - summaryWordCount / originalWordCount) * 100);

      document.getElementById("summaryWordCount").textContent = summaryWordCount;
      document.getElementById("reductionPercent").textContent = reduction;
    } else {
      summaryOutput.textContent = "Error: " + (data.error || "Unknown issue");
    }
  } catch (error) {
    summaryOutput.textContent = "Error connecting to the backend.";
  }
});

// Copy summary to clipboard
document.getElementById("copySummary").addEventListener("click", () => {
  const summary = document.getElementById("summaryOutput").textContent;
  navigator.clipboard.writeText(summary).then(() => {
    const btn = document.getElementById("copySummary");
    btn.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy mr-2"></i> Copy';
    }, 2000);
  });
});

// Plagiarism checker function (demo)
// Plagiarism checker function
document.getElementById("checkPlagiarismBtn").addEventListener("click", async () => {
  const text = plagiarismText.value.trim();
  if (!text) {
    alert("Please enter some text to check for plagiarism");
    return;
  }

  // Show loading state
  const indicator = document.getElementById("plagiarismIndicator");
  const resultSection = document.getElementById("plagiarismResult");
  const matchesContainer = document.getElementById("plagiarismMatches");

  resultSection.classList.remove("hidden");
  matchesContainer.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i><p class="mt-2 text-gray-600">Checking against database...</p></div>';

  try {
    const response = await fetch("/check_plagiarism", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (data.error) {
      matchesContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg">Error: ${data.error}</div>`;
      return;
    }

    const similarity = data.similarity_score || 0;
    const similarityPercent = Math.round(similarity * 100);
    const isPlagiarized = data.is_plagiarized;
    const sourceSnippet = data.most_similar_source || "No source found.";

    // Update UI
    document.getElementById("plagiarismPercent").textContent = similarityPercent + "%";
    document.getElementById("originalityPercent").textContent = (100 - similarityPercent) + "%";

    indicator.style.width = "0%";
    setTimeout(() => {
      indicator.style.width = similarityPercent + "%";
      if (similarityPercent > 50) {
        indicator.classList.remove("bg-green-500", "bg-yellow-500");
        indicator.classList.add("bg-red-500");
      } else if (similarityPercent > 20) {
        indicator.classList.remove("bg-green-500", "bg-red-500");
        indicator.classList.add("bg-yellow-500");
      } else {
        indicator.classList.remove("bg-yellow-500", "bg-red-500");
        indicator.classList.add("bg-green-500");
      }
    }, 100);

    // Show matches
    matchesContainer.innerHTML = "";

    if (similarityPercent > 0) {
      const matchDiv = document.createElement("div");
      matchDiv.className = `p-4 rounded-lg border ${isPlagiarized ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`;
      matchDiv.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="font-medium ${isPlagiarized ? 'text-red-700' : 'text-yellow-700'}">
            ${isPlagiarized ? 'High Similarity Detected' : 'Some Similarity Detected'}
          </span>
          <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Best Match</span>
        </div>
        <p class="text-sm text-gray-700 mb-2"><strong>Matched Source Snippet:</strong></p>
        <p class="text-sm text-gray-600 italic mb-2">"...${sourceSnippet}..."</p>
      `;
      matchesContainer.appendChild(matchDiv);
    } else {
      matchesContainer.innerHTML = `
        <div class="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <i class="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
          <p class="text-green-700">No content matched in our database.</p>
        </div>
      `;
    }

  } catch (error) {
    matchesContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg">Error connecting to server.</div>`;
    console.error(error);
  }
});

// Download report (demo)
document.getElementById("downloadReport").addEventListener("click", () => {
  alert("In a real application this would download a PDF report.");
});
