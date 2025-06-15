interface TextRule {
  sourceText: string;
  targetText: string;
}

// Store for text replacement rules
let textRules: TextRule[] = [];

// Initialize content script
try {
  chrome.storage.sync
    .get(["textRules"])
    .then((result) => {
      if (result.textRules) {
        textRules = result.textRules;
        applyTextReplacements();
      }
    })
    .catch((error) => {
      console.error("Error loading text rules:", error);
    });
} catch (error) {
  console.error("Error accessing storage:", error);
}

// Listen for rule updates
chrome.runtime.onMessage.addListener(
  (message: { type: string; rules: TextRule[] }, _sender, sendResponse) => {
    if (message.type === "UPDATE_TEXT_RULES") {
      textRules = message.rules;
      applyTextReplacements();
      sendResponse({ success: true });
    }
    return true; // Keep message channel open
  }
);

// Apply text replacements
function applyTextReplacements(): void {
  try {
    if (!document.body) {
      return;
    }

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    let node: Text | null;

    while ((node = walker.nextNode() as Text)) {
      let text = node.textContent;
      let modified = false;

      textRules.forEach((rule) => {
        if (text && text.includes(rule.sourceText)) {
          text = text.replace(
            new RegExp(rule.sourceText, "g"),
            rule.targetText
          );
          modified = true;
        }
      });

      if (modified && text) {
        node.textContent = text;
      }
    }
  } catch (error) {
    console.error("Error applying text replacements:", error);
  }
}

// Observe DOM changes for dynamically loaded content
try {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        applyTextReplacements();
      }
    });
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    // Wait for body to be available
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
} catch (error) {
  console.error("Error setting up DOM observer:", error);
}
