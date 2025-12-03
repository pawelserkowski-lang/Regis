export interface IElectronAPI {
  readProtocol: () => Promise<string>;
  saveProtocol: (content: string) => Promise<boolean>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
