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
document.getElementById("checkPlagiarismBtn").addEventListener("click", () => {
  const text = plagiarismText.value.trim();
  if (!text) {
    alert("Please enter some text to check for plagiarism");
    return;
  }

  // Simulate checking (in a real app this would call a backend)
  setTimeout(() => {
    const plagiarismPercent = Math.min(100, Math.floor(Math.random() * 40));
    document.getElementById("plagiarismPercent").textContent = plagiarismPercent + "%";
    document.getElementById("originalityPercent").textContent = 100 - plagiarismPercent + "%";

    const indicator = document.getElementById("plagiarismIndicator");
    indicator.style.width = "0%";
    setTimeout(() => {
      indicator.style.width = plagiarismPercent + "%";
    }, 100);

    const matchesContainer = document.getElementById("plagiarismMatches");
    matchesContainer.innerHTML = "";

    if (plagiarismPercent > 0) {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const numMatches = Math.min(3, Math.floor(sentences.length * 0.3));

      for (let i = 0; i < numMatches; i++) {
        const matchDiv = document.createElement("div");
        matchDiv.className = "p-4 bg-red-50 rounded-lg border border-red-200";
        matchDiv.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <span class="font-medium text-red-700">Potential match (${Math.floor(Math.random() * 50) + 50}% similar)</span>
            <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">${Math.floor(Math.random() * 5) + 1} sources</span>
          </div>
          <p class="text-sm text-gray-700 mb-2">"${sentences[i] || ''}"</p>
          <a href="#" class="text-xs text-blue-600 hover:underline">View sources</a>
        `;
        matchesContainer.appendChild(matchDiv);
      }
    } else {
      matchesContainer.innerHTML = `
        <div class="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <i class="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
          <p class="text-green-700">No plagiarism detected. Your text appears to be original!</p>
        </div>
      `;
    }

    document.getElementById("plagiarismResult").classList.remove("hidden");
  }, 1200);
});

// Download report (demo)
document.getElementById("downloadReport").addEventListener("click", () => {
  alert("In a real application this would download a PDF report.");
});
