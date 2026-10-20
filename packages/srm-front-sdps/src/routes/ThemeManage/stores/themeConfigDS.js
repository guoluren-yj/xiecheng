/**
 * 风险定义页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-07
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * 主题配置列表
 * @returns
 */
const ThemeListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/theme-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'themeId',
  childrenField: 'childList',
  paging: 'server',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.themeConfig.model.themeCode`).d('主题编码'),
      name: 'themeCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.themeConfig.model.themeName`).d('主题名称'),
      name: 'themeName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.themeConfig.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'string',
    },
    {
      label: intl.get(`sdps.themeConfig.model.themeLevel`).d('层级'),
      name: 'themeLevel',
      type: 'number',
    },
    {
      label: intl.get(`sdps.themeConfig.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
      lookupCode: 'SPFM.ENABLED_FLAG',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.themeConfig.model.themeCode`).d('主题编码'),
      name: 'themeCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.themeConfig.model.themeName`).d('主题名称'),
      name: 'themeName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 主题配置 Form 表单
 * @returns
 */
const ThemeFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/theme-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/theme-define/save-or-update`,
        data: {
          ...param,
          enableFlag: param.enableFlag || '0',
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/theme-define/save-or-update`,
        data: {
          ...param,
          enableFlag: param.enableFlag || '0',
        },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  autoCreate: true,
  primaryKey: '',
  fields: [
    {
      label: intl.get(`sdps.themeConfig.model.themeCode`).d('主题编码'),
      name: 'themeCode',
      type: 'string',
      required: true,
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 64,
    },
    {
      label: intl.get(`sdps.themeConfig.model.themeName`).d('主题名称'),
      name: 'themeName',
      type: 'intl',
      required: true,
      maxLength: 128,
    },
    {
      label: intl.get(`sdps.themeConfig.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'number',
      required: true,
      max: 99999999999,
    },
    {
      name: 'parentThemeId',
    },
    {
      name: 'themeLevel',
    },
  ],
  queryFields: [],
  events: {},
});

export { ThemeListDS, ThemeFormDS };
