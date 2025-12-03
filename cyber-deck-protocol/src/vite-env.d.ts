/// <reference types="vite/client" />

interface Window {
  api: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<boolean>;
    listHistory: () => Promise<string[]>;
    readHistory: (filename: string) => Promise<string>;
  };
}
