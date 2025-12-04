/// <reference types="vite/client" />

interface Window {
  api?: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<boolean>;
    startJulesTask: (task: string) => Promise<string>;
    askAI: (question: string) => Promise<string>;
    readAgentStatus: () => Promise<string>;
    runAgent: () => Promise<string>;
    runJules: (payload: {context?: string, file?: string}) => Promise<{success: boolean}>;
  };
}
