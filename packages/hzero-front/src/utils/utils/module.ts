import pathToRegexp from 'path-to-regexp';
import routersArr from '../../config/routers';

/**
 * 判断pathname所在模块是否加载完毕
 * @param pathname 当前路由
 */
export function checkModuleLoaded(pathname: string): boolean {
  const {
    microModule: { microModuleScriptMap, microStatusMap } = {
      microModuleScriptMap: {},
      microStatusMap: {},
    },
  } = window.dvaApp._store.getState();
  // 假如是hzero-front里的路由，直接返回true
  if (
    routersArr.some((item: { path: string }) =>
      pathToRegexp(item.path, [], { end: false }).test(pathname)
    )
  ) {
    return true;
  }
  // 其他模块的路由判断模块是否加载完毕
  if (microModuleScriptMap) {
    return Object.keys(microModuleScriptMap).some((key) => {
      const { registerRegex } = microModuleScriptMap[key];
      // 找到路由对应模块,判断模块是否已加载完毕
      return (
        registerRegex &&
        new RegExp(registerRegex).test(pathname) &&
        microStatusMap[key] === 'LOADED'
      );
    });
  }
  return false;
}
