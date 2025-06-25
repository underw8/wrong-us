interface TextRule {
  from: string;
  to: string;
}

// Store for text replacement rules and global state
let textRules: TextRule[] = [];
let globalEnabled = true;

// Initialize content script
try {
  chrome.storage.sync
    .get(["textRules", "enabled"])
    .then((result) => {
      globalEnabled = result.enabled !== undefined ? result.enabled : true;
      if (result.textRules) {
        textRules = result.textRules;
        if (globalEnabled) {
          applyTextReplacements();
        }
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
  (message: { action: string; rules?: TextRule[] }, _sender, sendResponse) => {
    if (message.action === "updateTextRules") {
      // Reload rules from storage
      chrome.storage.sync
        .get(["textRules", "enabled"])
        .then((result) => {
          globalEnabled = result.enabled !== undefined ? result.enabled : true;
          if (result.textRules) {
            textRules = result.textRules;
            if (globalEnabled) {
              applyTextReplacements();
            }
          }
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Error reloading text rules:", error);
          sendResponse({ success: false, error: error.message });
        });
    }
    return true; // Keep message channel open
  }
);

// Apply text replacements
function applyTextReplacements(): void {
  try {
    if (!document.body || !globalEnabled) {
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
        if (text && rule.from && rule.to && text.includes(rule.from)) {
          text = text.replace(
            new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            rule.to
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
      if (mutation.type === "childList" && globalEnabled) {
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
