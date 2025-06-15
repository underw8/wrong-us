class PopupManager {
    constructor() {
        this.urlRulesContainer = document.getElementById("urlRules");
        this.textRulesContainer = document.getElementById("textRules");
        this.addUrlRuleBtn = document.getElementById("addUrlRule");
        this.addTextRuleBtn = document.getElementById("addTextRule");
        this.init();
    }
    async init() {
        try {
            await this.loadRules();
            this.setupEventListeners();
        }
        catch (error) {
            console.error("Failed to initialize popup:", error);
        }
    }
    setupEventListeners() {
        this.addUrlRuleBtn.addEventListener("click", () => this.addUrlRule());
        this.addTextRuleBtn.addEventListener("click", () => this.addTextRule());
    }
    async loadRules() {
        try {
            const result = await chrome.storage.sync.get(["urlRules", "textRules"]);
            const urlRules = result.urlRules || [];
            const textRules = result.textRules || [];
            this.renderUrlRules(urlRules);
            this.renderTextRules(textRules);
        }
        catch (error) {
            console.error("Failed to load rules:", error);
        }
    }
    renderUrlRules(rules) {
        if (rules.length === 0) {
            this.urlRulesContainer.innerHTML = this.createEmptyState("No URL redirect rules yet", "link_off");
            return;
        }
        this.urlRulesContainer.innerHTML = rules
            .map((rule, index) => this.createRuleElement(rule, index, "url"))
            .join("");
        this.attachRuleEventListeners("url");
    }
    renderTextRules(rules) {
        if (rules.length === 0) {
            this.textRulesContainer.innerHTML = this.createEmptyState("No text replacement rules yet", "text_fields");
            return;
        }
        this.textRulesContainer.innerHTML = rules
            .map((rule, index) => this.createRuleElement(rule, index, "text"))
            .join("");
        this.attachRuleEventListeners("text");
    }
    createEmptyState(message, icon) {
        return `
      <div class="empty-state">
        <span class="material-icons">${icon}</span>
        ${message}
      </div>
    `;
    }
    createRuleElement(rule, index, type) {
        const fromPlaceholder = type === "url"
            ? "Enter URL pattern (e.g., *example.com* or regex)"
            : "Text to find";
        const toPlaceholder = type === "url" ? "Redirect to URL" : "Replace with";
        return `
      <div class="rule" data-index="${index}" data-type="${type}">
        <div class="input-field">
          <input 
            type="text" 
            placeholder="${fromPlaceholder}" 
            value="${this.escapeHtml(rule.from)}"
            data-field="from"
          >
        </div>
        <div class="input-field">
          <input 
            type="text" 
            placeholder="${toPlaceholder}" 
            value="${this.escapeHtml(rule.to)}"
            data-field="to"
          >
        </div>
        <button class="delete-btn" data-action="delete">
          <span class="material-icons">delete</span>
        </button>
      </div>
    `;
    }
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    attachRuleEventListeners(type) {
        const container = type === "url" ? this.urlRulesContainer : this.textRulesContainer;
        container.addEventListener("input", (e) => {
            const target = e.target;
            if (target.tagName === "INPUT") {
                this.handleRuleChange(target, type);
            }
        });
        container.addEventListener("click", (e) => {
            const target = e.target;
            const deleteBtn = target.closest('[data-action="delete"]');
            if (deleteBtn) {
                const ruleElement = deleteBtn.closest(".rule");
                const index = parseInt(ruleElement.dataset.index);
                this.deleteRule(index, type);
            }
        });
    }
    async handleRuleChange(input, type) {
        try {
            const ruleElement = input.closest(".rule");
            const index = parseInt(ruleElement.dataset.index);
            const field = input.dataset.field;
            const value = input.value;
            const storageKey = type === "url" ? "urlRules" : "textRules";
            const result = await chrome.storage.sync.get([storageKey]);
            const rules = result[storageKey] || [];
            if (rules[index]) {
                rules[index][field] = value;
                await chrome.storage.sync.set({ [storageKey]: rules });
                // Notify background script of changes
                await this.notifyBackgroundScript(type);
            }
        }
        catch (error) {
            console.error("Failed to update rule:", error);
        }
    }
    async deleteRule(index, type) {
        try {
            const storageKey = type === "url" ? "urlRules" : "textRules";
            const result = await chrome.storage.sync.get([storageKey]);
            const rules = result[storageKey] || [];
            rules.splice(index, 1);
            await chrome.storage.sync.set({ [storageKey]: rules });
            // Re-render the rules
            if (type === "url") {
                this.renderUrlRules(rules);
            }
            else {
                this.renderTextRules(rules);
            }
            // Notify background script of changes
            await this.notifyBackgroundScript(type);
        }
        catch (error) {
            console.error("Failed to delete rule:", error);
        }
    }
    async addUrlRule() {
        try {
            const result = await chrome.storage.sync.get(["urlRules"]);
            const urlRules = result.urlRules || [];
            urlRules.push({ from: "", to: "" });
            await chrome.storage.sync.set({ urlRules });
            this.renderUrlRules(urlRules);
            await this.notifyBackgroundScript("url");
        }
        catch (error) {
            console.error("Failed to add URL rule:", error);
        }
    }
    async addTextRule() {
        try {
            const result = await chrome.storage.sync.get(["textRules"]);
            const textRules = result.textRules || [];
            textRules.push({ from: "", to: "" });
            await chrome.storage.sync.set({ textRules });
            this.renderTextRules(textRules);
            await this.notifyBackgroundScript("text");
        }
        catch (error) {
            console.error("Failed to add text rule:", error);
        }
    }
    async notifyBackgroundScript(type) {
        try {
            if (type === "url") {
                await chrome.runtime.sendMessage({ action: "updateUrlRules" });
            }
            else {
                // Notify all tabs about text rule changes
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                    if (tab.id) {
                        try {
                            await chrome.tabs.sendMessage(tab.id, {
                                action: "updateTextRules",
                            });
                        }
                        catch {
                            // Tab might not have content script, ignore
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Failed to notify background script:", error);
        }
    }
}
// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new PopupManager();
});
// Handle any encoding issues by ensuring proper UTF-8 handling
document.addEventListener("DOMContentLoaded", () => {
    // Ensure proper UTF-8 encoding for all text content
    const metaCharset = document.querySelector("meta[charset]");
    if (!metaCharset ||
        metaCharset.getAttribute("charset")?.toLowerCase() !== "utf-8") {
        console.warn("UTF-8 charset not properly set");
    }
    // Test UTF-8 support
    const testString = "🔗 ➡️ 📝 ✨";
    console.log("UTF-8 test string:", testString);
});
export {};
