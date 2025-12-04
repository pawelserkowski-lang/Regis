/// <reference types="vite/client" />

interface Window {
  api?: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<boolean>;
    readAgentStatus: () => Promise<string>;
    runJules: (payload: {context?: string, file?: string}) => Promise<{success: boolean}>;
  };
}
