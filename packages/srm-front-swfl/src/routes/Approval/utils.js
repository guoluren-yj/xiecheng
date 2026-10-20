import ResizeObserver from 'resize-observer-polyfill';

export const TASK_TAB_DRAWER_ID = 'task-tab-detail-drawer';
export const INVOLVED_TASK_TAB_DRAWER_ID = 'involved_task-tab-detail-drawer';
export const START_TASK_TAB_DRAWER_ID = 'start_task-tab-detail-drawer';
export const CC_TASK_TAB_DRAWER_ID = 'cc_task-tab-detail-drawer';

export function observerDrawerResize(drawerElementId) {
  const targetElement = document.getElementById(drawerElementId);
  const contentElement =
    targetElement && targetElement.parentNode && targetElement.parentNode.parentNode;
  if (!targetElement || !contentElement) {
    return undefined;
  }
  const callback = () => {
    if (targetElement.clientHeight < contentElement.clientHeight) {
      targetElement.style.height = `${contentElement.clientHeight}px`;
    }
  };
  const resizeObserver = new ResizeObserver(callback);
  resizeObserver.observe(targetElement);
  return resizeObserver;
}

export function computeDrawerHeight(drawerElementId) {
  const targetElement = document.getElementById(drawerElementId);
  const contentElement =
    targetElement && targetElement.parentNode && targetElement.parentNode.parentNode;
  if (!targetElement || !contentElement) {
    return undefined;
  }
  if (targetElement.clientHeight < contentElement.clientHeight) {
    targetElement.style.height = `${contentElement.clientHeight}px`;
  }
}