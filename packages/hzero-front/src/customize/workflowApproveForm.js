import { isFunction, isNumber } from 'lodash';

import { mapCustomize } from 'utils/customize';

/**
 * 如果 审批表单存在 则加载表单
 * 否则 返回 null
 * @param<string> formCode 表单code
 * @param<string[]> moduleCode 表单页面所属模块code
 * @return {Promise<null|*>}
 */
export async function loadWorkflowApproveFormAsync(formCode, modules) {
  // 不传modules 则调用loadCustomizeConfig加载所有模块
  if (!modules || !modules.length) {
    if (window.loadCustomizeConfig) {
      await window.loadCustomizeConfig();
    }
  } else if (window.loadCustomizeConfigWithPackage) {
    await Promise.all(window.loadCustomizeConfigWithPackage(modules));
  }
  if (
    mapCustomize.has({ module: 'hzero-front-hwfp', feature: 'workflowApproveForm', key: formCode })
  ) {
    const layout = mapCustomize.get({
      module: 'hzero-front-hwfp',
      feature: 'workflowApproveForm',
      key: formCode,
    });
    if (isFunction(layout && layout.component)) {
      const approveForm = await layout.component();
      return approveForm;
    }
  }
  return null;
}

/**
 * 用于include表单有自定义审批逻辑，控制审批按钮loading
 */
export async function loadApproveFormWithCustomSubmit(formCode, modules) {
  // 不传modules 则调用loadCustomizeConfig加载所有模块
  if (!modules || !modules.length) {
    if (window.loadCustomizeConfig) {
      await window.loadCustomizeConfig();
    }
  } else if (window.loadCustomizeConfigWithPackage) {
    await Promise.all(window.loadCustomizeConfigWithPackage(modules));
  }
  if (
    mapCustomize.has({ module: 'hzero-front-hwfp', feature: 'workflowApproveForm', key: formCode })
  ) {
    const layout = mapCustomize.get({
      module: 'hzero-front-hwfp',
      feature: 'workflowApproveForm',
      key: formCode,
    });
    if (isFunction(layout && layout.component)) {
      const approveForm = await layout.component();
      return { approveForm, customSubmit: layout.customSubmit };
    }
  }
  return null;
}

export function setWorkflowApproveForm(formConfig) {
  // TODO: 判断是否需要检查 重复设置的问题
  // 对存入的数据进行判断
  // 如果数据不存在，就插入全局数据
  // 如果数据存在，判断优先级，如果后来的配置存在优先级或者优先级高于相同编码的已存在数据，就删除后以高优先级进行存储。
  if (
    mapCustomize.has({
      module: 'hzero-front-hwfp',
      feature: 'workflowApproveForm',
      key: formConfig.code,
    })
  ) {
    const config = mapCustomize.get({
      module: 'hzero-front-hwfp',
      feature: 'workflowApproveForm',
      key: formConfig.code,
    });
    if (
      isNumber(config.priority) &&
      isNumber(formConfig.priority) &&
      config.priority < formConfig.priority
    ) {
      mapCustomize.delete({
        module: 'hzero-front-hwfp',
        feature: 'workflowApproveForm',
        key: formConfig.code,
      });
      mapCustomize.set({
        module: 'hzero-front-hwfp',
        feature: 'workflowApproveForm',
        key: formConfig.code,
        data: { component: formConfig.component, priority: formConfig.priority, customSubmit: Boolean(formConfig.customSubmit) },
      });
    }
  } else {
    mapCustomize.set({
      module: 'hzero-front-hwfp',
      feature: 'workflowApproveForm',
      key: formConfig.code,
      data: { component: formConfig.component, priority: formConfig.priority || 0, customSubmit: Boolean(formConfig.customSubmit) },
    });
  }
}
