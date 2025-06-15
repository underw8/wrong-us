/// <reference types="chrome"/>

declare namespace chrome {
  namespace declarativeNetRequest {
    type ResourceType =
      | "main_frame"
      | "sub_frame"
      | "stylesheet"
      | "script"
      | "image"
      | "font"
      | "object"
      | "xmlhttprequest"
      | "ping"
      | "csp_report"
      | "media"
      | "websocket"
      | "other";

    enum RuleActionType {
      BLOCK = "block",
      REDIRECT = "redirect",
      ALLOW = "allow",
      UPGRADE_SCHEME = "upgradeScheme",
      MODIFY_HEADERS = "modifyHeaders",
      ALLOW_ALL_REQUESTS = "allowAllRequests",
    }

    enum ResourceType {
      MAIN_FRAME = "main_frame",
      SUB_FRAME = "sub_frame",
      STYLESHEET = "stylesheet",
      SCRIPT = "script",
      IMAGE = "image",
      FONT = "font",
      OBJECT = "object",
      XMLHTTPREQUEST = "xmlhttprequest",
      PING = "ping",
      CSP_REPORT = "csp_report",
      MEDIA = "media",
      WEBSOCKET = "websocket",
      OTHER = "other",
    }
  }
}
