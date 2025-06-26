import { UrlRule, TextRule } from "../types/index";

// Legacy interfaces for migration
interface LegacyRedirectRule {
  sourceUrl: string;
  targetUrl: string;
}

interface LegacyTextRule {
  sourceText: string;
  targetText: string;
}

class PopupManager {
  private urlRulesContainer: HTMLElement;
  private textRulesContainer: HTMLElement;
  private addUrlRuleBtn: HTMLElement;
  private addTextRuleBtn: HTMLElement;
  private globalToggle: HTMLInputElement;
  private exportBtn: HTMLElement;
  private importBtn: HTMLElement;
  private globalEnabled: boolean = true;

  constructor() {
    this.urlRulesContainer = document.getElementById("urlRules")!;
    this.textRulesContainer = document.getElementById("textRules")!;
    this.addUrlRuleBtn = document.getElementById("addUrlRule")!;
    this.addTextRuleBtn = document.getElementById("addTextRule")!;
    this.globalToggle = document.getElementById("globalToggle") as HTMLInputElement;
    this.exportBtn = document.getElementById("exportRules")!;
    this.importBtn = document.getElementById("importRules")!;

    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.migrateOldData();
      await this.loadGlobalState();
      await this.loadRules();
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize popup:", error);
    }
  }

  private async migrateOldData(): Promise<void> {
    try {
      // Check for old data format
      const oldData = await chrome.storage.sync.get(["rules", "textRules"]);
      const newData = await chrome.storage.sync.get(["urlRules"]);

      // Migrate URL rules if old format exists and new format doesn't
      if (oldData.rules && !newData.urlRules) {
        console.log("Migrating old URL rules...");
        const oldUrlRules: LegacyRedirectRule[] = oldData.rules;
        const newUrlRules: UrlRule[] = oldUrlRules.map((rule) => ({
          from: rule.sourceUrl,
          to: rule.targetUrl,
        }));

        await chrome.storage.sync.set({ urlRules: newUrlRules });
        console.log(`Migrated ${newUrlRules.length} URL rules`);
      }

      // Migrate text rules if old format exists with different structure
      if (
        oldData.textRules &&
        Array.isArray(oldData.textRules) &&
        oldData.textRules.length > 0
      ) {
        const firstRule = oldData.textRules[0];
        // Check if it's the old format with sourceText/targetText
        if (
          firstRule &&
          "sourceText" in firstRule &&
          "targetText" in firstRule
        ) {
          console.log("Migrating old text rules...");
          const oldTextRules: LegacyTextRule[] = oldData.textRules;
          const newTextRules: TextRule[] = oldTextRules.map((rule) => ({
            from: rule.sourceText,
            to: rule.targetText,
          }));

          await chrome.storage.sync.set({ textRules: newTextRules });
          console.log(`Migrated ${newTextRules.length} text rules`);
        }
      }
    } catch (error) {
      console.error("Error during migration:", error);
    }
  }

  private async loadGlobalState(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(["enabled"]);
      this.globalEnabled = result.enabled !== undefined ? result.enabled : true;
      this.globalToggle.checked = this.globalEnabled;
      this.updateUIState();
    } catch (error) {
      console.error("Failed to load global state:", error);
    }
  }

  private async handleGlobalToggle(): Promise<void> {
    try {
      this.globalEnabled = this.globalToggle.checked;
      await chrome.storage.sync.set({ enabled: this.globalEnabled });
      this.updateUIState();
      
      // Notify background script
      await chrome.runtime.sendMessage({ action: "toggleGlobal" });
      
      // Notify all content scripts
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: "updateTextRules",
            });
          } catch {
            // Tab might not have content script, ignore
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle global state:", error);
    }
  }

  private updateUIState(): void {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      if (this.globalEnabled) {
        section.classList.remove('disabled');
      } else {
        section.classList.add('disabled');
      }
    });
  }

  private setupEventListeners(): void {
    this.addUrlRuleBtn.addEventListener("click", () => this.addUrlRule());
    this.addTextRuleBtn.addEventListener("click", () => this.addTextRule());
    this.globalToggle.addEventListener("change", () => this.handleGlobalToggle());
    this.exportBtn.addEventListener("click", () => this.exportRules());
    this.importBtn.addEventListener("click", () => this.importRules());
  }

  private async loadRules(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(["urlRules", "textRules"]);
      const urlRules: UrlRule[] = result.urlRules || [];
      const textRules: TextRule[] = result.textRules || [];

      console.log("Loaded rules:", {
        urlRules: urlRules.length,
        textRules: textRules.length,
      });

      this.renderUrlRules(urlRules);
      this.renderTextRules(textRules);
    } catch (error) {
      console.error("Failed to load rules:", error);
    }
  }

  private renderUrlRules(rules: UrlRule[]): void {
    if (rules.length === 0) {
      this.urlRulesContainer.innerHTML = this.createEmptyState(
        "No URL redirect rules yet",
        "link_off"
      );
      return;
    }

    this.urlRulesContainer.innerHTML = rules
      .map((rule, index) => this.createRuleElement(rule, index, "url"))
      .join("");

    this.attachRuleEventListeners("url");
  }

  private renderTextRules(rules: TextRule[]): void {
    if (rules.length === 0) {
      this.textRulesContainer.innerHTML = this.createEmptyState(
        "No text replacement rules yet",
        "text_fields"
      );
      return;
    }

    this.textRulesContainer.innerHTML = rules
      .map((rule, index) => this.createRuleElement(rule, index, "text"))
      .join("");

    this.attachRuleEventListeners("text");
  }

  private createEmptyState(message: string, icon: string): string {
    return `
      <div class="empty-state">
        <span class="material-icons">${icon}</span>
        ${message}
      </div>
    `;
  }

  private createRuleElement(
    rule: UrlRule | TextRule,
    index: number,
    type: "url" | "text"
  ): string {
    const fromPlaceholder =
      type === "url"
        ? "Enter URL pattern (e.g., *example.com* or regex)"
        : "Text to find";
    const toPlaceholder = type === "url" ? "Redirect to URL" : "Replace with";
    const isEnabled = rule.enabled !== false; // Default to enabled if not set
    const ruleClass = isEnabled ? "" : " rule-disabled";

    return `
      <div class="rule${ruleClass}" data-index="${index}" data-type="${type}">
        <label class="rule-toggle">
          <input 
            type="checkbox" 
            ${isEnabled ? "checked" : ""}
            data-action="toggle"
          >
          <span class="rule-slider"></span>
        </label>
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

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private attachRuleEventListeners(type: "url" | "text"): void {
    const container =
      type === "url" ? this.urlRulesContainer : this.textRulesContainer;

    container.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === "INPUT" && target.dataset.field) {
        this.handleRuleChange(target, type);
      }
    });

    container.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === "INPUT" && target.dataset.action === "toggle") {
        const ruleElement = target.closest(".rule") as HTMLElement;
        const index = parseInt(ruleElement.dataset.index!);
        this.handleRuleToggle(index, type, target.checked);
      }
    });

    container.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const deleteBtn = target.closest('[data-action="delete"]') as HTMLElement;

      if (deleteBtn) {
        const ruleElement = deleteBtn.closest(".rule") as HTMLElement;
        const index = parseInt(ruleElement.dataset.index!);
        this.deleteRule(index, type);
      }
    });
  }

  private async handleRuleChange(
    input: HTMLInputElement,
    type: "url" | "text"
  ): Promise<void> {
    try {
      const ruleElement = input.closest(".rule") as HTMLElement;
      const index = parseInt(ruleElement.dataset.index!);
      const field = input.dataset.field as "from" | "to";
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
    } catch (error) {
      console.error("Failed to update rule:", error);
    }
  }

  private async handleRuleToggle(index: number, type: "url" | "text", enabled: boolean): Promise<void> {
    try {
      const storageKey = type === "url" ? "urlRules" : "textRules";
      const result = await chrome.storage.sync.get([storageKey]);
      const rules = result[storageKey] || [];

      if (rules[index]) {
        rules[index].enabled = enabled;
        await chrome.storage.sync.set({ [storageKey]: rules });

        // Update UI to reflect the change
        const ruleElement = document.querySelector(`[data-index="${index}"][data-type="${type}"]`) as HTMLElement;
        if (ruleElement) {
          if (enabled) {
            ruleElement.classList.remove('rule-disabled');
          } else {
            ruleElement.classList.add('rule-disabled');
          }
        }

        // Notify background script of changes
        await this.notifyBackgroundScript(type);
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  }

  private async deleteRule(index: number, type: "url" | "text"): Promise<void> {
    try {
      const storageKey = type === "url" ? "urlRules" : "textRules";
      const result = await chrome.storage.sync.get([storageKey]);
      const rules = result[storageKey] || [];

      rules.splice(index, 1);
      await chrome.storage.sync.set({ [storageKey]: rules });

      // Re-render the rules
      if (type === "url") {
        this.renderUrlRules(rules);
      } else {
        this.renderTextRules(rules);
      }

      // Notify background script of changes
      await this.notifyBackgroundScript(type);
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  }

  private async addUrlRule(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(["urlRules"]);
      const urlRules: UrlRule[] = result.urlRules || [];

      urlRules.push({ from: "", to: "", enabled: true });
      await chrome.storage.sync.set({ urlRules });

      this.renderUrlRules(urlRules);
      await this.notifyBackgroundScript("url");
    } catch (error) {
      console.error("Failed to add URL rule:", error);
    }
  }

  private async addTextRule(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(["textRules"]);
      const textRules: TextRule[] = result.textRules || [];

      textRules.push({ from: "", to: "", enabled: true });
      await chrome.storage.sync.set({ textRules });

      this.renderTextRules(textRules);
      await this.notifyBackgroundScript("text");
    } catch (error) {
      console.error("Failed to add text rule:", error);
    }
  }

  private async exportRules(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(["urlRules", "textRules", "enabled"]);
      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          urlRules: result.urlRules || [],
          textRules: result.textRules || [],
          enabled: result.enabled !== undefined ? result.enabled : true
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wrong-us-rules-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('Rules exported successfully');
    } catch (error) {
      console.error('Failed to export rules:', error);
      alert('Failed to export rules. Please try again.');
    }
  }

  private async importRules(): Promise<void> {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importData = JSON.parse(text);
          
          // Validate import data structure
          if (!this.validateImportData(importData)) {
            alert('Invalid file format. Please select a valid Wrong Us rules export file.');
            return;
          }

          // Confirm import
          const confirm = window.confirm(
            `Import ${importData.data.urlRules?.length || 0} URL rules and ${importData.data.textRules?.length || 0} text rules?\n\nThis will replace your current rules.`
          );
          
          if (!confirm) return;

          // Import the data
          const { urlRules, textRules, enabled } = importData.data;
          
          // Ensure all rules have the enabled property
          const processedUrlRules = urlRules?.map((rule: any) => ({
            from: rule.from || "",
            to: rule.to || "",
            enabled: rule.enabled !== undefined ? rule.enabled : true
          })) || [];
          
          const processedTextRules = textRules?.map((rule: any) => ({
            from: rule.from || "",
            to: rule.to || "",
            enabled: rule.enabled !== undefined ? rule.enabled : true
          })) || [];

          await chrome.storage.sync.set({
            urlRules: processedUrlRules,
            textRules: processedTextRules,
            enabled: enabled !== undefined ? enabled : true
          });

          // Update global state and UI
          this.globalEnabled = enabled !== undefined ? enabled : true;
          this.globalToggle.checked = this.globalEnabled;
          this.updateUIState();

          // Re-render rules
          this.renderUrlRules(processedUrlRules);
          this.renderTextRules(processedTextRules);

          // Notify background and content scripts
          await this.notifyBackgroundScript("url");
          await this.notifyBackgroundScript("text");
          await chrome.runtime.sendMessage({ action: "toggleGlobal" });

          console.log('Rules imported successfully');
          alert('Rules imported successfully!');
        } catch (error) {
          console.error('Failed to import rules:', error);
          alert('Failed to import rules. Please check the file format and try again.');
        }
      };

      input.click();
    } catch (error) {
      console.error('Failed to initiate import:', error);
      alert('Failed to open file picker. Please try again.');
    }
  }

  private validateImportData(data: any): boolean {
    try {
      // Check basic structure
      if (!data || typeof data !== 'object') return false;
      if (!data.data || typeof data.data !== 'object') return false;
      
      const { urlRules, textRules } = data.data;
      
      // Validate URL rules
      if (urlRules && (!Array.isArray(urlRules) || !urlRules.every((rule: any) => 
        rule && typeof rule === 'object' && 
        typeof rule.from === 'string' && 
        typeof rule.to === 'string'
      ))) {
        return false;
      }
      
      // Validate text rules
      if (textRules && (!Array.isArray(textRules) || !textRules.every((rule: any) => 
        rule && typeof rule === 'object' && 
        typeof rule.from === 'string' && 
        typeof rule.to === 'string'
      ))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private async notifyBackgroundScript(type: "url" | "text"): Promise<void> {
    try {
      if (type === "url") {
        await chrome.runtime.sendMessage({ action: "updateUrlRules" });
      } else {
        // Notify all tabs about text rule changes
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: "updateTextRules",
              });
            } catch {
              // Tab might not have content script, ignore
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to notify background script:", error);
    }
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    new PopupManager();
  } catch (error) {
    console.error("Error creating PopupManager:", error);
  }
});

// Handle any encoding issues by ensuring proper UTF-8 handling
document.addEventListener("DOMContentLoaded", () => {
  // Ensure proper UTF-8 encoding for all text content
  const metaCharset = document.querySelector(
    "meta[charset]"
  ) as HTMLMetaElement;
  if (
    !metaCharset ||
    metaCharset.getAttribute("charset")?.toLowerCase() !== "utf-8"
  ) {
    console.warn("UTF-8 charset not properly set");
  }

  // Test UTF-8 support
  const testString = "🔗 ➡️ 📝 ✨";
  console.log("UTF-8 test string:", testString);
});
