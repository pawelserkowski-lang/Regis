// src/preload/monaco-config.ts
// TO JEST NAJWAŻNIEJSZY FIX – bez tego Monaco nigdy nie działa w Electronie!

// @ts-nocheck – bo Electron czasem marudzi o "self"
declare const self: any;

self.MonacoEnvironment = {
  getWorkerUrl: function (workerId: string, label: string): string {
    const workers: Record<string, string> = {
      editor: 'monaco-editor/esm/vs/editor/editor.worker.js',
      json: 'monaco-editor/esm/vs/language/json/json.worker.js',
      css: 'monaco-editor/esm/vs/language/css/css.worker.js',
      html: 'monaco-editor/esm/vs/language/html/html.worker.js',
      typescript: 'monaco-editor/esm/vs/language/typescript/ts.worker.js',
      javascript: 'monaco-editor/esm/vs/language/typescript/ts.worker.js',
    };

    const path = workers[label] || workers.editor;

    // Magia 2025 – wrzucamy worker jako blob, żeby Electron nie płakał o CORS
    return URL.createObjectURL(
      new Blob(
        [
          `importScripts('${new URL('../../node_modules/' + path, import.meta.url).toString()}');`,
        ],
        { type: 'application/javascript' }
      )
    );
  },
};