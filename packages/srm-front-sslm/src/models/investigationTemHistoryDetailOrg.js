/*
 * author: 吴云强
 * createTime: 2018/08/01 18:53:54
 * editTime: 2018/08/01 18:54:30
 * feature: 租户级调查表模板历史详情页
 */

import { isEmpty, forEach, camelCase } from 'lodash';

import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  investigationTemplateConfigQuery,
  investigationTemplateHeaderQueryAll,
  investigationTemplateOrgHeaderQueryAll,
  // fetchHeaderInfo,
  queryAttachmentList,
  fetchInvestigateListOrg,
  fetchInvestigateListSite,
  investigationTemplateSiteConfigQuery,
  investigationTemplateSiteHeaderQueryAll,
} from '@/services/investigationDefinitionOrgService';

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
    configLines[line.investgCfLineId] = line;
    const lines =
      configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
    const { fieldCode, componentType } = line;
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
      if (fieldCode === 'attachment_type') {
        configLines[componentProp.investgCfLineId].lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
      }
      if (fieldCode === 'authentication_type') {
        configLines[componentProp.investgCfLineId].lovCode =
          'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
      }
    }
  });
  return headers;
}

function dealConfigDataPreview(config) {
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
  namespace: 'investigationTemHistoryDetailOrg',
  state: {
    // 头信息
    headerInfo: {},
    // 配置信息
    config: {},
    attachmentList: [], // 附件模板定义列表
    attachmentEditContent: [], // 附件模板定义编辑数据
    investigateTypes: [], // 调查表类型
    dataSouceQueryCompany: [], // 调查表未分配模板的公司
    dataSouceSelectCompany: [], // 调查表已分配的公司
    referenceModalVisible: false, // 引用模板弹窗visible
    temDetailVisible: false, // 模板明细弹窗visible

    templateListSite: [], // 平台模板列表
    templateListOrg: [], // 租户模板列表
    referenceSitePagination: {}, // 引用模板平台分页信息
    referenceOrgPagination: {}, // 引用模板租户分页信息
    referenceQueryParams: {}, // 引用模板查询条件
    // investigateTypes: [], // 调查表类型
    selectedRowKeysSite: [], // 平台级选中
    selectedRowKeysOrg: [], // 租户级选中
    currentInvestigateTemplateId: null, // 当前要查看的模板id
    detailHeaderInfo: {}, // 详情头信息
    detailConfig: {}, // 详情配置信息
    activeKey: 'site', // 当前查看的是平台还是租户级的模板明细
    queryOrg: {},
    querySite: {},
  },
  effects: {
    // 查询数据
    *init({ payload }, { call, put }) {
      // const { investigateTemplateId, organizationId } = payload;
      const header = getResponse(yield call(investigationTemplateConfigQuery, payload));
      const config = getResponse(yield call(investigationTemplateHeaderQueryAll, payload));
      if (!(isEmpty(header) || isEmpty(config))) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: header,
            config: dealConfigData(config),
          },
        });
      }
    },
    *queryInviteTypes(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SSLM.INVESTIGATE_TYPE',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { investigateTypes: res.inviteTypeCode },
        });
      }
    },
    // 查询头数据
    // *fetchHeaderInfo({ payload }, { call, put }) {
    //   const { investigateTemplateId } = payload;
    //   const response = yield call(investigationTemplateConfigQuery, investigateTemplateId);
    //   const data = getResponse(response);
    //   if (data) {
    //     yield put({
    //       type: 'updateState',
    //       payload: { headerInfo: data },
    //     });
    //   }
    // },

    /**
     * BEGIN 附件模板定义 API 开始
     */
    // 获取附件模板定义
    *queryAttachmentList({ payload }, { put, call }) {
      const res = yield call(queryAttachmentList, payload);
      const attachmentList = getResponse(res);
      if (attachmentList) {
        yield put({
          type: 'updateState',
          payload: { attachmentList },
        });
        return attachmentList;
      }
    },

    // 查询租户级列表
    *fetchInvestigateListOrg({ payload }, { call, put }) {
      const { page = 0, size = 10, ...query } = payload;
      const result = yield call(fetchInvestigateListOrg, { ...query, page, size });
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            queryOrg: query,
            templateListOrg: result.content,
            referenceOrgPagination: createPagination(result),
          },
        });
      }
    },
    // 查询平台级列表
    *fetchInvestigateListSite({ payload }, { call, put }) {
      const { page = 0, size = 10, ...query } = payload;
      const result = yield call(fetchInvestigateListSite, { ...query, page, size });
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            querySite: query,
            templateListSite: result.content,
            referenceSitePagination: createPagination(result),
          },
        });
      }
    },

    *fetchTemplate({ payload }, { call, put, select }) {
      const { activeKey } = yield select(state => state.investigationTemHistoryDetailOrg);
      let header = {};
      let config = {};
      if (activeKey === 'site') {
        const { investigateTemplateId } = payload;
        header = getResponse(
          yield call(investigationTemplateSiteConfigQuery, investigateTemplateId)
        );
        config = getResponse(
          yield call(investigationTemplateSiteHeaderQueryAll, investigateTemplateId)
        );
      } else {
        header = getResponse(yield call(investigationTemplateConfigQuery, payload));
        config = getResponse(yield call(investigationTemplateOrgHeaderQueryAll, payload));
      }
      if (!(isEmpty(header) || isEmpty(config))) {
        yield put({
          type: 'updateState',
          payload: {
            detailHeaderInfo: header,
            detailConfig: dealConfigData(config),
          },
        });
      }
    },
    /**
     * END 附件模板定义 API 结束
     */
    // 预览
    *openPreview({ payload }, { call, put }) {
      const { investigateTemplateId, organizationId } = payload;
      const config = getResponse(
        yield call(investigationTemplateOrgHeaderQueryAll, {
          organizationId,
          investigateTemplateId,
        })
      );
      if (!isEmpty(config)) {
        yield put({
          type: 'updateState',
          payload: {
            previewConfig: dealConfigDataPreview(config),
            previewVisible: true,
          },
        });
      }
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
