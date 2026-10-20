// import { inject } from 'what-di';
import { getConfig } from 'hzero-boot';

import * as defaultConfig from '../defaultConfig';
// import { ConfigProvider } from './init';
// import { UedProvider } from './UedProvider';

let configureParams = 'false' as any;
let globalConfig = 'false' as any;
const config = {
  ...window.$$env,
  ...defaultConfig,
};

// 适配未引入新版hzero-boot的情况
export function getEnvConfig<T>(): T {
  if (configureParams === 'false') {
    configureParams = {};
    const result = getConfig('configureParams');
    if (result) {
      if (typeof result === 'function') {
        configureParams = result();
      } else {
        configureParams = result;
      }
    }
    config.configureParams = configureParams;
  }
  if (globalConfig === 'false') {
    globalConfig = {};
    const result = getConfig('globalConfig');
    if (result) {
      globalConfig = result();
    }
    Object.assign(config, globalConfig);
  }
  return config as T;
  // }
}

/**
 * 获取dvaApp
 */
export function getDvaApp(): any {
  // const dvaApp = inject('dvaApp');
  // return dvaApp || (<any>window).dvaApp;
  return (<any>window).dvaApp;
}

/**
 * 拓展配置
 * @param conf { Object }
 */
export function extendsEnvConfig(_conf: any): void {
  // const _conf = inject<ConfigProvider>('config');
  // _conf.extends(conf);
}

export function registerUedContainer(_Container: any) {
  // const ued = inject<UedProvider>(UedProvider);
  // ued.registerContainer(Container);
}
