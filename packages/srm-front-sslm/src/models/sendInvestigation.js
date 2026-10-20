/*
 * sendInvestigation - 我发出的调查表
 * @date: 2018/10/13 11:00:17
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { forEach, camelCase } from 'lodash';
import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchSendInvestigationList,
  investigationTemplateHeaderQueryAll,
  handleCancel,
  checkInvestigation,
  handleDetailExport,
} from '@/services/sendInvestigationService';
import { fetchInvestigationDetail } from '@/services/investigationDetailMaintainService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

function dealConfigData(config) {
  const configHeaders = {};
  const configLines = {};
  const headers = [];
  // 处理头 处理 tab
  forEach(config.investigateConfigHeaders, header => {
    configHeaders[header.investgCfHeaderId] = header;
    configHeaders[header.investgCfHeaderId].lines = [];
    headers.push(header);
  });

  // 处理行 处理字段
  forEach(config.investigateConfigLines, line => {
    const { fieldCode, componentType } = line;
    configLines[line.investgCfLineId] = line;
    configLines[line.investgCfLineId].fieldCode = camelCase(fieldCode);
    const lines =
      configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
    const formatFieldCode = camelCase(fieldCode);
    switch (formatFieldCode) {
      case 'attachmentType':
        if (componentType === 'ValueList') {
          configLines[line.investgCfLineId].componentType = 'Cascader';
        }
        break;
      default:
        break;
    }
    if (lines) {
      lines.push(line);
      configLines[line.investgCfLineId].props = [];
    }
  });

  // 处理属性
  forEach(config.investigateConfigComponents, componentProp => {
    const props =
      configLines[componentProp.investgCfLineId] &&
      configLines[componentProp.investgCfLineId].props;
    if (props) {
      props.push(componentProp);
    }
    if (componentProp.attributeName === 'toValueListFlag' && componentProp.attributeValue) {
      const fieldCode =
        configLines[componentProp.investgCfLineId] &&
        configLines[componentProp.investgCfLineId].fieldCode;
      if (fieldCode) {
        configLines[componentProp.investgCfLineId].componentType = 'ValueList';
      }
      if (fieldCode === 'attachmentType') {
        configLines[componentProp.investgCfLineId].lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
      }
      if (fieldCode === 'authenticationType') {
        configLines[componentProp.investgCfLineId].lovCode =
          'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
      }
    }
  });
  return headers;
}
export default {
  namespace: 'sendInvestigation',

  state: {
    investigationList: [], // 发出的调查表列表
    pagination: {},
    query: {},
    detail: {}, // 头详情
    investigateTypes: [], // 调查表类型
    processStatusList: [], // 调查表状态列表
    investigateLevelList: [], // 调查表管控制度
    config: {},
    dataSource: {}, // tabs数据源
  },

  effects: {
    // 查询列表
    *fetchSendList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchSendInvestigationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            investigationList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 查询值集
    *init(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SSLM.INVESTIGATE_TYPE',
        statusCode: 'SSLM.INVESTIGATE_STATUS',
        investigateLevelCode: 'SSLM.INVESTIGATE_LEVEL',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            investigateTypes: res.inviteTypeCode,
            processStatusList: res.statusCode.filter(
              n => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value)
            ),
            investigateLevelList: res.investigateLevelCode,
          },
        });
      }
    },
    // 查询配置头
    *fetchTemplate({ payload }, { call, put }) {
      const { investigateTemplateId } = payload;
      const config = getResponse(
        yield call(investigationTemplateHeaderQueryAll, investigateTemplateId)
      );
      if (config) {
        yield put({
          type: 'updateState',
          payload: {
            config: dealConfigData(config),
          },
        });
      }
    },
    // 查询详情
    *fetchInvestigationDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigationDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
    },
    // 校验调查表
    *checkInvestigation({ payload }, { call }) {
      const res = getResponse(yield call(checkInvestigation, payload));
      return res;
    },
    // 详情导出
    *handleDetailExport({ payload }, { call }) {
      const res = getResponse(yield call(handleDetailExport, payload));
      return res;
    },
    // 取消
    *handleCancel({ payload }, { call }) {
      const res = getResponse(yield call(handleCancel, payload));
      return res;
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
