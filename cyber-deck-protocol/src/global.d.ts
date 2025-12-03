export interface IElectronAPI {
  readProtocol: () => Promise<string>;
  saveProtocol: (content: string) => Promise<boolean>;
  readAgentStatus: () => Promise<string | null>;
  runAgent: () => Promise<{ success: boolean; code?: number; error?: string }>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
