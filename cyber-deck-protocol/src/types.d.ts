declare module "react-dom/client" {
  import * as React from "react";

  interface Root {
    render(children: React.ReactNode): void;
  }

  function createRoot(container: Element | DocumentFragment): Root;

  export { createRoot, Root };
}

declare global {
  interface Window {
    api: {
      readProtocol: () => Promise<string>;
      saveProtocol: (content: string) => Promise<boolean>;
    };
  }
}

export {};
