/// <reference types="vite/client" />

declare global {
  interface Window {
    api?: {
    electronAPI: {
      loadProtocol: () => Promise<string>;
      saveProtocol: (content: string) => Promise<void>;
    };
    api: {
      readProtocol: () => Promise<string>;
      saveProtocol: (content: string) => Promise<boolean>;
    };
  }
}

export {};
