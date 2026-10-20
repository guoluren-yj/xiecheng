/* eslint-disable prefer-destructuring */
const driverNamespace = "DRIVERSTORE";
let _guideStore = {};
let _guideGlobalStore: Guide[] = [];
let _GuideInstance: { current: any } = { current: null };
if (window[driverNamespace]) {
  _guideStore = window[driverNamespace].guideStore;
  _guideGlobalStore = window[driverNamespace].guideGlobalStore;
  _GuideInstance = window[driverNamespace].GuideInstance;
} else {
  window[driverNamespace] = {
    guideStore: _guideStore,
    guideGlobalStore: _guideGlobalStore,
    GuideInstance: _GuideInstance,
  };
}
export const guideStore = _guideStore;
export const guideGlobalStore = _guideGlobalStore;
export const GuideInstance = _GuideInstance;

export interface Guide {
  /** 区分平台级还是租户级配置的 */
  // presetFlag: 0 | 1,
  enable: boolean,
  code: string,
  /** 组件内部存取数据 */
  __path?: string,
  type: 'short' | 'weak' | 'strong' | 'overview',
  priority?: number,
  version: number,
  title?: string,
  delay?: number;
  width?: number;
  steps: {
    uniqueKey?: string;
    delay?: number;
    selector: string,
    title: string,
    htmlText?: string,
    preview?: string;
    beforeCheck?: string,
    placement?: string,
  }[];
  optionalSteps?: boolean;
}
export function injectGlobalGuides(configFunc: () => Guide[]) {
  const configs = configFunc();
  configs.forEach(config => {
    if (guideGlobalStore.find(item => item.code === config.code)) return;
    _guideGlobalStore.push(config);
  });
}

export default function injectGuide(path: string, configFunc: () => Guide[]) {
  guideStore[path] = configFunc();
  if (GuideInstance.current) {
    GuideInstance.current.refreshMatchGuides();
  }
}