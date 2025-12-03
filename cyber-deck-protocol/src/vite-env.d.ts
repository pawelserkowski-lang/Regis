
interface Window {
  api: {
    readProtocol: (filename?: string) => Promise<string>;
    saveProtocol: (content: string) => Promise<void>;
  };
}
