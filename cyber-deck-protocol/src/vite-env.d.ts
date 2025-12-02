
interface Window {
  api: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<void>;
  };
}
