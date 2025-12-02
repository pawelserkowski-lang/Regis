/// <reference types="vite/client" />

interface Window {
  api: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<boolean>;
  };
}
