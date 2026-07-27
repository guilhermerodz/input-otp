/**
 * Flags whether this browser draws *classic* scrollbars — ones that take a
 * strip of layout width — rather than overlay scrollbars that float above the
 * content and fade out. Windows and Linux are classic; macOS is overlay unless
 * the reader has set "Show scroll bars: Always".
 *
 * Why detect at all, rather than just style the scrollbar everywhere: defining
 * a `::-webkit-scrollbar` rule opts the element out of overlay scrollbars
 * completely. Styling unconditionally would therefore *give* macOS a permanent
 * scrollbar gutter it does not have today — making the platform we are trying
 * to imitate the one we broke. The rules in globals.css are gated behind the
 * attribute this sets, so a browser that already does the right thing is left
 * alone.
 *
 * Must run before first paint, and needs a <body> to attach the probe to, so
 * it belongs at the top of <body> rather than in <head>. It measures the
 * native scrollbar because the CSS it unlocks cannot apply until it has run.
 */
export const SCROLLBAR_PROBE = [
  'try{',
  "var d=document.createElement('div');",
  "d.style.cssText='position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll';",
  'document.body.appendChild(d);',
  "if(d.offsetWidth-d.clientWidth>0)document.documentElement.setAttribute('data-scrollbars','classic');",
  'd.remove()',
  '}catch(e){}',
].join('')
