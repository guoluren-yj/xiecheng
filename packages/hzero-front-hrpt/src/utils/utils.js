import { isObject, isString } from 'lodash';

export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

export function scrollIntoViewY(nodeSelector, containerSelector) {
  const node = document.querySelector(nodeSelector);
  const container = document.querySelector(containerSelector);
  if (!node || !container) return;
  const nodeY = container.scrollTop + node.getBoundingClientRect().y;
  const maxScrollY = container.scrollHeight - container.clientHeight;
  let targetY = nodeY - container.clientHeight / 2;
  if (targetY < 0) return;
  if (targetY > maxScrollY) targetY = maxScrollY;
  container.scrollTo(0, targetY);
}