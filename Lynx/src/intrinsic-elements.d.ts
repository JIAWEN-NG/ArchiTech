// src/intrinsic-elements.d.ts
import * as Lynx from '@lynx-js/types';

type Base = Lynx.IntrinsicElements['view']; // inherit common props like style, className, etc.

declare module '@lynx-js/types' {
  interface IntrinsicElements extends Lynx.IntrinsicElements {
    input: Base & {
      type?: 'text' | 'password' | 'search' | 'number';
      value?: string;
      placeholder?: string;
      disabled?: boolean;
      maxlength?: number;
      // Lynx-style input event
      bindinput?: (e: { type: 'input'; detail: { value: string } }) => void;
      // (optional, if you want Enter-to-send and your setup supports it)
      bindconfirm?: () => void;
    };
    textarea: Base & {
      value?: string;
      placeholder?: string;
      rows?: number;
      disabled?: boolean;
      bindinput?: (e: { type: 'input'; detail: { value: string } }) => void;
    };
  }
}

export {}; // ensure this file is treated as a module
