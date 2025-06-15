// Simple test to see if script loads
console.log("Popup script loaded!");

interface RedirectRule {
  sourceUrl: string;
  targetUrl: string;
}

interface TextRule {
  sourceText: string;
  targetText: string;
}

// Load saved rules
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const result = await chrome.storage.sync.get(["rules", "textRules"]);
    const urlRules = result.rules || [];
    const textRules = result.textRules || [];

    // Initialize URL rules
    urlRules.forEach((rule: RedirectRule) => addUrlRuleElement(rule));

    // Initialize text rules
    textRules.forEach((rule: TextRule) => addTextRuleElement(rule));
  } catch (error) {
    console.log("Error loading saved rules:", error);
    // Continue with empty rules if storage fails
  }
});

// URL Rules
document.getElementById("addUrlRule")?.addEventListener("click", () => {
  addUrlRuleElement();
});

function addUrlRuleElement(
  rule: RedirectRule = { sourceUrl: "", targetUrl: "" }
): void {
  const container = document.getElementById("urlRules");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "rule";

  const sourceInput = document.createElement("input");
  sourceInput.placeholder =
    "URL pattern: *avatar-management.*/(48|128|256)$ or ^https://example.com.*";
  sourceInput.value = rule.sourceUrl;

  const targetInput = document.createElement("input");
  targetInput.placeholder =
    "Redirect to URL (e.g., https://ca.slack-edge.com/...)";
  targetInput.value = rule.targetUrl;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.onclick = () => {
    div.remove();
    saveRules();
  };

  div.appendChild(sourceInput);
  div.appendChild(targetInput);
  div.appendChild(deleteBtn);
  container.appendChild(div);

  // Save on change
  [sourceInput, targetInput].forEach((input) => {
    input.addEventListener("change", saveRules);
  });
}

// Text Rules
document.getElementById("addTextRule")?.addEventListener("click", () => {
  addTextRuleElement();
});

function addTextRuleElement(
  rule: TextRule = { sourceText: "", targetText: "" }
): void {
  const container = document.getElementById("textRules");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "rule";

  const sourceInput = document.createElement("input");
  sourceInput.placeholder = "Text to replace";
  sourceInput.value = rule.sourceText;

  const targetInput = document.createElement("input");
  targetInput.placeholder = "Replace with";
  targetInput.value = rule.targetText;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.onclick = () => {
    div.remove();
    saveRules();
  };

  div.appendChild(sourceInput);
  div.appendChild(targetInput);
  div.appendChild(deleteBtn);
  container.appendChild(div);

  // Save on change
  [sourceInput, targetInput].forEach((input) => {
    input.addEventListener("change", saveRules);
  });
}

// Save rules to storage
async function saveRules(): Promise<void> {
  try {
    const urlRulesContainer = document.getElementById("urlRules");
    const textRulesContainer = document.getElementById("textRules");

    if (!urlRulesContainer || !textRulesContainer) return;

    const urlRules: RedirectRule[] = Array.from(urlRulesContainer.children)
      .map((div) => ({
        sourceUrl: (div.children[0] as HTMLInputElement).value,
        targetUrl: (div.children[1] as HTMLInputElement).value,
      }))
      .filter((rule) => rule.sourceUrl && rule.targetUrl);

    const textRules: TextRule[] = Array.from(textRulesContainer.children)
      .map((div) => ({
        sourceText: (div.children[0] as HTMLInputElement).value,
        targetText: (div.children[1] as HTMLInputElement).value,
      }))
      .filter((rule) => rule.sourceText && rule.targetText);

    // Save to storage
    await chrome.storage.sync.set({ rules: urlRules, textRules });

    // Notify background script with error handling
    try {
      await chrome.runtime.sendMessage({
        type: "UPDATE_RULES",
        rules: urlRules,
      });
    } catch (error) {
      // Background script not ready, ignore
    }

    // Notify content scripts with error handling
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: "UPDATE_TEXT_RULES",
          rules: textRules,
        });
      }
    } catch (error) {
      // Content script not ready, ignore
    }
  } catch (error) {
    console.error("Error saving rules:", error);
  }
}
