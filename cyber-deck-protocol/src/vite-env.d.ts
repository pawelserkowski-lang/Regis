export interface IElectronAPI {
  readProtocol: () => Promise<string>;
  saveProtocol: (content: string) => Promise<boolean>;
  startJulesTask: (payload: { repoName: string, taskDescription: string }) => Promise<any>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
