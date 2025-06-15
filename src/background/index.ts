interface RedirectRule {
  sourceUrl: string;
  targetUrl: string;
}

// Store for URL redirect rules
let redirectRules: RedirectRule[] = [];

console.log("Background script loaded");

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed/updated");
  try {
    // Load saved rules from storage
    const result = await chrome.storage.sync.get(["rules"]);
    console.log("Storage result:", result);
    if (result.rules) {
      redirectRules = result.rules;
      console.log("Loaded redirect rules:", redirectRules);
      await updateRedirectRules();
    } else {
      console.log("No saved rules found");
    }
  } catch (error) {
    console.error("Error loading rules on install:", error);
  }
});

// Listen for rule updates from popup
chrome.runtime.onMessage.addListener(
  (message: { type: string; rules: RedirectRule[] }, _sender, sendResponse) => {
    console.log("Received message:", message);
    if (message.type === "UPDATE_RULES") {
      redirectRules = message.rules;
      console.log("Updated redirect rules:", redirectRules);
      updateRedirectRules()
        .then(() => {
          console.log("Rules updated successfully");
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Error updating rules:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open for async response
    }
  }
);

// Helper function to detect if a pattern is regex
function isRegexPattern(pattern: string): boolean {
  // Check if pattern contains regex special characters or starts with ^
  return /[\[\](){}.*+?^$|\\]/.test(pattern) || pattern.startsWith("^");
}

// Update declarative net request rules
async function updateRedirectRules(): Promise<void> {
  try {
    console.log("Starting to update redirect rules...");

    // Get current dynamic rules first
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("Current dynamic rules:", currentRules);

    // Remove existing rules
    const existingRuleIds = currentRules.map((rule) => rule.id);
    if (existingRuleIds.length > 0) {
      console.log("Removing existing rules:", existingRuleIds);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
      });
    }

    // Add new rules
    if (redirectRules.length > 0) {
      const rules = redirectRules.map((rule, index) => {
        const isRegex = isRegexPattern(rule.sourceUrl);
        console.log(
          `Rule ${index + 1}: ${rule.sourceUrl} - Using ${
            isRegex ? "regex" : "url"
          } filter`
        );

        const condition: any = {
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.IMAGE,
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
            chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        };

        if (isRegex) {
          condition.regexFilter = rule.sourceUrl;
        } else {
          condition.urlFilter = rule.sourceUrl;
        }

        return {
          id: index + 1,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: { url: rule.targetUrl },
          },
          condition,
        };
      });

      console.log("Adding new rules:", rules);
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
      });

      // Verify rules were added
      const newRules = await chrome.declarativeNetRequest.getDynamicRules();
      console.log("Rules after update:", newRules);
    } else {
      console.log("No rules to add");
    }
  } catch (error) {
    console.error("Error updating declarative net request rules:", error);
  }
}
