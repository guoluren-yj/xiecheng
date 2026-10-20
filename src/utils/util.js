/**
 * util.js - 公共方法
 * @date: 2019-10-17
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isFunction } from 'lodash';

/**
 * getReDevModuleRouters - 获取模块路由的方法
 * @param {!object} app - dva.app对象
 * @param {Array<Object>} [modules=[]] - 模块路由方法集合
 * @return {Object} - 返回模块路由对象集合
 */
export function getReDevModuleRouters(app, modules = []) {
  let routers = [];
  modules.forEach(n => {
    routers.push(isFunction(n.getReDevelopRouterData) ? n.getReDevelopRouterData(app) || {} : {});
  });
  return routers;
}
