import { isEmpty, forEach, camelCase } from 'lodash';

import { getResponse } from 'utils/utils';
import {
  investigationTemplateConfigQuery,
  investigationTemplateHeaderQueryAll,
  updateHeader,
  saveDefinition,
  // fetchHeaderInfo,
  // 查询调查表配置
  investigationTemplateConfigPreviewQuery,
} from '@/services/investigationDefinitionSiteService';

/**
 *处理预览的配置
 * @param {Object} config 配置信息
 * @returns
 */
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
      // eslint-disable-next-line
      line = { ...line, _status: 'update' };
    }
    const lines =
      configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
    if (lines) {
      lines.push(line);
      configLines[line.investgCfLineId].props = [];
    }
  });

  // // 处理属性
  // forEach(config.investigateConfigComponents, componentProp => {
  //   const props =
  //     configLines[componentProp.investgCfLineId] &&
  //     configLines[componentProp.investgCfLineId].props;
  //   if (props) {
  //     props.push(componentProp);
  //   }
  // });
  return headers;
}
/**
 * 处理 预览的属性
 * @param {*} config
 * @returns
 */
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
  });
  return headers;
}

export default {
  namespace: 'investigationDefinitionSite',
  state: {
    // 头信息
    headerInfo: {},
    // 配置信息
    config: {},
  },
  effects: {
    // 查询数据
    *init({ payload }, { call, put }) {
      const { investigateTemplateId } = payload;
      const header = getResponse(
        yield call(investigationTemplateConfigQuery, investigateTemplateId)
      );
      const config = getResponse(
        yield call(investigationTemplateHeaderQueryAll, investigateTemplateId)
      );
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
    // 预览
    *openPreview({ payload }, { call, put }) {
      const { investigateTemplateId } = payload;
      const config = getResponse(
        yield call(investigationTemplateConfigPreviewQuery, investigateTemplateId)
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
