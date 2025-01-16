declare module 'monaco-editor' {
  interface IStandaloneEditorConstructionOptions {
    markdown?: {
      enabled: boolean;
      renderer: {
        useDefaultRenderer: boolean;
        renderMarkdown: (markdown: string) => string;
      };
    };
  }
}
