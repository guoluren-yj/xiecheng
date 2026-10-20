import { isEmpty, forEach, camelCase } from 'lodash';

import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  saveTemptDetail,
  investigationTemplateConfigQuery,
  investigationTemplateHeaderQueryAll,
  investigationTemplateOrgHeaderQueryAll,
  updateHeader,
  saveDefinition,
  // fetchHeaderInfo,
  queryAttachmentList,
  saveAttachmentLine,
  deleteAttachmentLine,
  fetchInvestigateListOrg,
  fetchInvestigateListSite,
  saveReferenceTemplateOrg,
  saveReferenceTemplateSite,
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
    if (!line._status) {
      // line = { ...line, _status: 'update' };
      // eslint-disable-next-line
      line._status = 'update';
    }
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
    configLines[line.investgCfLineId] = line;
    configLines[line.investgCfLineId].fieldCode = camelCase(line.fieldCode);
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
      configLines[line.investgCfLineId].fxProps = [];
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
  // 处理fx属性
  forEach(config.investigateConfigLineFXs, componentProp => {
    const props =
      configLines[componentProp.investgCfLineId] &&
      configLines[componentProp.investgCfLineId].fxProps;
    if (props) {
      props.push(componentProp);
    }
  });
  return headers;
}

export default {
  namespace: 'investigationDefinitionOrg',
  state: {
    // 头信息
    headerInfo: {},
    // 配置信息
    config: {},
    attachmentList: [], // 附件模板定义列表
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
    currentInvestigateTemplateId: null, // 当前要查看的模板id
    detailHeaderInfo: {}, // 详情头信息
    detailConfig: {}, // 详情配置信息
    activeKey: 'site', // 当前查看的是平台还是租户级的模板明细
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
    // 查询模板配置数据
    *queryTemplateConfig({ payload }, { call, put }) {
      const res = getResponse(yield call(investigationTemplateHeaderQueryAll, payload));
      let config = [];
      if (res) {
        config = dealConfigData(res);
        yield put({
          type: 'updateState',
          payload: {
            config,
          },
        });
      }
      return config;
    },
    // 查询值集
    *queryInviteTypes(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SSLM.INVESTIGATE_TYPE',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            investigateTypes: res.inviteTypeCode,
          },
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
    // 更新页签是否启用
    *updateHeader({ payload }, { call }) {
      const response = yield call(updateHeader, payload);
      return getResponse(response);
    },
    *saveDefinition({ payload }, { call }) {
      const response = yield call(saveDefinition, payload);
      return getResponse(response);
    },
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
      return attachmentList;
    },
    // 新增或更新附件模板定义
    *saveAttachmentLine({ payload }, { call }) {
      const res = yield call(saveAttachmentLine, payload);
      return getResponse(res);
    },
    // 删除附件模板定义
    *deleteAttachmentLine({ payload }, { call }) {
      const res = yield call(deleteAttachmentLine, payload);
      return getResponse(res);
    },
    // 查询租户级列表
    *fetchInvestigateListOrg({ payload }, { call, put }) {
      const result = yield call(fetchInvestigateListOrg, { ...payload, enabledFlag: 1 });
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            templateListOrg: result.content,
            referenceOrgPagination: createPagination(result),
          },
        });
      }
    },
    // 查询平台级列表
    *fetchInvestigateListSite({ payload }, { call, put }) {
      const result = yield call(fetchInvestigateListSite, { ...payload, enabledFlag: 1 });
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            templateListSite: result.content,
            referenceSitePagination: createPagination(result),
          },
        });
      }
    },
    /**
     * 保存新的租户级引用模板
     * @param {Object} { payload }
     * @param {*} { call }
     * @returns JSON
     */
    *saveReferenceTemplateOrg({ payload }, { call }) {
      const data = yield call(saveReferenceTemplateOrg, payload);
      return getResponse(data);
    },
    /**
     * 保存新的平台级引用模板
     * @param {Object} { payload }
     * @param {*} { call }
     * @returns JSON
     */
    *saveReferenceTemplateSite({ payload }, { call }) {
      const data = yield call(saveReferenceTemplateSite, payload);
      return getResponse(data);
    },
    *fetchTemplate({ payload }, { call, put, select }) {
      const { activeKey } = yield select(state => state.investigationDefinitionOrg);
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
      return dealConfigDataPreview(config);
    },
    // 保存头详情
    *saveTemptDetail({ payload }, { call }) {
      return getResponse(yield call(saveTemptDetail, payload));
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
