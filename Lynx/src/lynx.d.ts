// src/lynx.d.ts
declare namespace JSX {
  interface LynxBaseProps {
    style?: any;
    bindtap?: (e: any) => void;
    bindinput?: (e: any) => void;
    [key: string]: any; // <- allow any other prop
  }

  interface IntrinsicElements {
    page: LynxBaseProps;
    view: LynxBaseProps;
    text: LynxBaseProps;
    image: LynxBaseProps;
    'text-input': LynxBaseProps;
    'scroll-view': LynxBaseProps;
    button: LynxBaseProps;
  }
}
