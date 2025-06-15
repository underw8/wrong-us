export interface UrlRule {
  from: string;
  to: string;
}

export interface TextRule {
  from: string;
  to: string;
}

export interface StorageData {
  urlRules: UrlRule[];
  textRules: TextRule[];
}

// Legacy interfaces for backward compatibility during migration
export interface LegacyRedirectRule {
  sourceUrl: string;
  targetUrl: string;
}

export interface LegacyTextRule {
  sourceText: string;
  targetText: string;
}
