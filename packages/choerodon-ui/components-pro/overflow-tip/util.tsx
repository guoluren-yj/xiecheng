import isElement from 'lodash/isElement';
import measureTextWidth from '../_util/measureTextWidth';

function getContentWidth(element: HTMLElement, computedStyle: CSSStyleDeclaration): number {
  const { width, boxSizing } = computedStyle;
  if (boxSizing === 'content-box' && width && width !== 'auto') {
    return parseFloat(width);
  }
  const contentWidth = width && width !== 'auto' ? parseFloat(width) : element.offsetWidth;
  const { paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } = computedStyle;
  const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
  const pr = paddingRight ? parseFloat(paddingRight) : 0;
  const bl = borderLeftWidth ? parseFloat(borderLeftWidth) : 0;
  const br = borderRightWidth ? parseFloat(borderRightWidth) : 0;
  return contentWidth - pl - pr - bl - br;
}

export function getInnerSize(element: HTMLElement): DOMRect {
  const range = new Range();
  range.setStart(element, 0);
  range.setEnd(element, element.childNodes.length);
  return range.getBoundingClientRect();
}

export default function isOverflow(element: HTMLElement | HTMLInputElement) {
  const { value, placeholder, textContent, ownerDocument } = element as HTMLInputElement;
  const inputTextContent = value || placeholder;
  if ((inputTextContent || textContent) && ownerDocument) {
    const { clientWidth, scrollWidth} = element;
    if (scrollWidth > clientWidth + 1) {
      return true;
    }
    const { defaultView } = ownerDocument;
    if (defaultView && isElement(element)) {
      const computedStyle = defaultView.getComputedStyle(element);
      const contentWidth = getContentWidth(element, computedStyle);
      const textWidth = (inputTextContent ? measureTextWidth(inputTextContent, computedStyle) : getInnerSize(element).width) - 0.001;
      return textWidth > contentWidth;
    }
  }
  return false;
}

export function isVerticalOverflow(element: HTMLElement | HTMLInputElement) {
  const { value, placeholder, textContent, ownerDocument } = element as HTMLInputElement;
  const inputTextContent = value || placeholder;
  if ((inputTextContent || textContent) && ownerDocument) {
    const { clientHeight, scrollHeight} = element;
    if (scrollHeight > clientHeight + 1) {
      return true;
    }
  }
  return false;
}
