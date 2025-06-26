export interface UrlRule {
  from: string;
  to: string;
  enabled?: boolean;
}

export interface TextRule {
  from: string;
  to: string;
  enabled?: boolean;
}

export interface StorageData {
  urlRules: UrlRule[];
  textRules: TextRule[];
  enabled: boolean;
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
