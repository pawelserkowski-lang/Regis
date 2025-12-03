/// <reference types="vite/client" />

declare global {
  interface Window {
    api?: {
      readProtocol: () => Promise<string>;
      saveProtocol: (content: string) => Promise<boolean>;
    };
  }
}

export {};
