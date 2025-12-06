declare module "react-dom/client" {
  import * as ReactDOM from "react-dom";

  export interface Root {
    render(children: React.ReactNode): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}
