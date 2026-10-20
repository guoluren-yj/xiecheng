/**
 * model 门户模板配置明细
 * @date: 2018-8-16
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { removeFileList, queryFileList } from 'hzero-front/lib/services/api';
import {
  fetchTemplateConfigList,
  createTemplatesConfig,
  fetchTemplatesConfigData,
  enableTemplate,
  fetchTemplateDetail,
  fetchTemplateDetailByAssignId,
  deleteTemplatesConfig,
  saveTemplateDetail,
  saveTemplateDetailNoTenantId,
  deleteSeleteRows,
  fetchTemplateInfo,
  getGroupInfo,
} from '@/services/templatesConfigService';

export default {
  namespace: 'templatesConfig',

  state: {
    logoConfigList: [], // logo配置列表
    carouselConfigList: [], // 轮播图配置列表
    templateConfigData: {}, // 模板头数据
    templatesConfigList: [], // 模板定义行数据
    templateDetail: {}, // 模板配置明细数据
    uploadFileList: [], // 上传的文件列表
    companyLinkList: [], // 公司链接行数据
    contactCompanyList: [], // 联系公司行数据
    groupName: undefined, // 集团名称
    companyName: undefined, // 公司名称
    webUrl: undefined, // 二级域名地址
    webUrls: [],
  },

  effects: {
    // 查询模板配置头数据
    *fetchTemplatesConfigData({ payload }, { call, put }) {
      const res = yield call(fetchTemplatesConfigData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateConfigData: list,
          },
        });
      }
      return list;
    },
    // 查询模板配置行数据
    *fetchTemplateConfigList({ payload }, { call, put }) {
      const res = yield call(fetchTemplateConfigList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templatesConfigList: list,
          },
        });
      }
      return list;
    },
    // 模板配置明细列表
    *fetchTemplateDetail({ payload }, { call, put }) {
      const res = yield call(fetchTemplateDetail, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateDetail: list,
          },
        });
      }
    },
    // 模版配置明细列表
    *fetchTemplateDetailByAssignId({ payload }, { call, put }) {
      const res = yield call(fetchTemplateDetailByAssignId, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateDetail: list,
          },
        });
      }
    },
    *saveTemplateDetail({ payload }, { call }) {
      const res = yield call(saveTemplateDetail, payload);
      return getResponse(res);
    },
    // 不带租户id保存
    *saveTemplateDetailNoTenantId({ payload }, { call }) {
      const res = yield call(saveTemplateDetailNoTenantId, payload);
      return getResponse(res);
    },
    *deleteSeleteRows({ payload }, { call }) {
      const res = yield call(deleteSeleteRows, payload);
      return getResponse(res);
    },
    // 创建门户模板配置明细
    *createTemplatesConfig({ payload }, { call }) {
      const res = yield call(createTemplatesConfig, payload);
      return getResponse(res);
    },
    // 启用模板
    *enableTemplate({ payload }, { call }) {
      const res = yield call(enableTemplate, payload);
      return getResponse(res);
    },
    // 删除模板配置项
    *deleteTemplatesConfig({ payload }, { call }) {
      const res = yield call(deleteTemplatesConfig, payload);
      return getResponse(res);
    },
    // 获取文件
    *queryFileList({ payload }, { call }) {
      const res = yield call(queryFileList, payload);
      return getResponse(res);
    },
    // 删除文件
    *removeFileList({ payload }, { call }) {
      const res = yield call(removeFileList, payload);
      return getResponse(res);
    },
    // 模板配置信息
    *fetchTemplateInfo({ payload }, { call, put }) {
      const res = yield call(fetchTemplateInfo, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            groupName: list.content && list.content[0] && list.content[0].groupName, // 集团名称
            companyName: list.content && list.content[0] && list.content[0].companyName, // 公司名称
            webUrl: list.content && list.content[0] && list.content[0].webUrl, // 二级域名地址
          },
        });
      }
    },
    *getGroupInfo({ payload }, { call, put }) {
      const res = yield call(getGroupInfo, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateConfigData: list && list[0],
          },
        });
      }
      return list;
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
