/**
 * index.js - 协议模板管理
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  update,
  queryList,
  getHeaderAttachmentUuid,
  getLineAttachmentUuid,
  fetchCompany,
  saveCompany,
  fetchTemplateConfig,
  saveTemplateConfig,
  deleteTemplateConfig,
  submitTemplate,
  unlockTemplate,
  versionTemplate,
  clearRevisions,
  backToNew,
} from '@/services/contractTemplateService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'contractTemplate',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
    selectedRows: [],
    operationRecordPagination: {},
    operationRecordList: [],
    templateConfigList: [],
    templateStatus: '', // 协议模板状态
    templateEditable: '', // 协议模板配置是否可以操作
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource:
              response.content &&
              response.content.map((n) => ({
                ...n,
                _status: 'update',
              })),
            pagination: createPagination(response),
          },
        });
      }
    },
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'HPFM.FLAG',
          langList: 'SPCM.LANGUAGE',
          templateType: 'SPCM.PC_TEMPLATE.TYPE',
          templateStatusList: 'SPCM.CONTRACT.TEMPLATE.STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 获取明细头附件uuid
    *getHeaderAttachmentUuid({ data }, { call }) {
      const res = yield call(getHeaderAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 更新模板协议编码列表
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },
    *fetchCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchCompany, payload));
      return response;
    },
    // -保存公司协议模板
    *saveCompany({ payload }, { call }) {
      const response = getResponse(yield call(saveCompany, payload));
      return response;
    },

    // 查询模板配置
    *fetchTemplateConfig({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchTemplateConfig, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            templateConfigList: response.map((n) => ({
              ...n,
              _status: 'update',
            })),
          },
        });
      }
    },

    // 查询模板版本
    *versionTemplate({ payload }, { call }) {
      const response = getResponse(yield call(versionTemplate, payload));
      return response;
    },
    // 保存模板配置
    *saveTemplateConfig({ payload }, { call }) {
      const response = getResponse(yield call(saveTemplateConfig, payload));
      return response;
    },
    // 删除模板配置
    *deleteTemplateConfig({ payload }, { call }) {
      const response = getResponse(yield call(deleteTemplateConfig, payload));
      return response;
    },
    // 提交协议模板审批
    *submitTemplate({ payload }, { call }) {
      const response = getResponse(yield call(submitTemplate, payload));
      return response;
    },
    // 提交协议模板审批
    *unlockTemplate({ payload }, { call }) {
      const response = getResponse(yield call(unlockTemplate, payload));
      return response;
    },
    // 获取清稿文件
    *clearRevisions({ payload }, { call }) {
      const response = getResponse(yield call(clearRevisions, payload));
      return response;
    },
    // 退回至新建
    *backToNew({ payload }, { call }) {
      const response = getResponse(yield call(backToNew, payload));
      return response;
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
