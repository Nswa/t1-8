import type { SvelteComponentTyped } from 'svelte';
import type { editor } from 'monaco-editor';

export interface MonacoEditorComponent {
  setContent: (content: string) => void;
  getContent: () => string;
}

interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  'bind:this'?: MonacoEditorComponent;
  onEditorReady?: (editor: editor.IStandaloneCodeEditor) => void;
}

export default class MonacoEditor extends SvelteComponentTyped<MonacoEditorProps> implements MonacoEditorComponent {
  setContent: (content: string) => void;
  getContent: () => string;
}
