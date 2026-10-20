/**
 * model 消息服务
 * @date: 2018-9-29
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { isUndefined } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  searchList,
  searchDetail,
  saveTemplate,
  updateDetail,
  queryLanguageData,
  parseData,
  searchTemplate,
} from '@/services/messageTemplateService';
import { queryIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'spfmMessageTemplate',
  state: {
    templateList: [], // 消息模板列表
    template: {}, // 特定ID的消息模板信息
    templateDetail: [], // 特定消息模板明细
    messageType: [], // 消息明细包含的消息类型
    language: [], // 系统支持的语言类型
    sysMessageType: [], // 系统支持的消息类型
    query: {}, // 查询参数
    pagination: {},
    typeToLanguage: {}, // 消息类型与语言关联管理
  },
  effects: {
    // 消息模板列表数据获取
    *fetchTemplateList({ payload }, { call, put }) {
      const { page, ...query } = payload;
      const result = getResponse(yield call(searchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            templateList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 获取模板明细详情
    *fetchDetail({ payload }, { call }) {
      const result = getResponse(yield call(searchDetail, payload));
      return result;
    },
    // 获取特定消息模板、语言类型、消息类型
    *fetchTemplate({ payload }, { call, put }) {
      const template = getResponse(yield call(searchTemplate, payload));
      const result = getResponse(yield call(queryIdpValue, 'HMSG.MESSAGE_TYPE'));
      const language = getResponse(yield call(queryLanguageData));
      if (template && result && language) {
        yield put({
          type: 'updateState',
          payload: {
            template,
            language,
            sysMessageType: result,
          },
        });
      }
      return result;
    },
    // 语言数据获取
    *fetchLanguage(_, { call, put }) {
      const language = getResponse(yield call(queryLanguageData));
      if (language) {
        yield put({
          type: 'updateState',
          payload: {
            language,
          },
        });
      }
    },
    // 消息模板创建-保存
    *saveTemplate({ payload }, { call }) {
      const result = getResponse(yield call(saveTemplate, payload));
      return result;
    },
    // 更新消息模板明细
    *updateDetail({ payload }, { call }) {
      const result = getResponse(yield call(updateDetail, payload));
      return result;
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // 更新detail
    updateDetailState(state, { payload }) {
      const { detail, messageType } = payload;
      const newDetail = parseData(detail, messageType.map(item => item.value));
      // debugger;
      const typeToLanguage = {};
      for (let i = 0; i < messageType.length; i++) {
        const temp = messageType[i];
        typeToLanguage[temp.value] = detail
          .filter(target => target.templateTypeCode === temp.value)
          .map(item => ({
            code: item.lang,
            name: item.languageName,
            isNew: !isUndefined(item.isNew),
          }));
      }
      return {
        ...state,
        messageType,
        typeToLanguage,
        templateDetail: [...detail],
        templateShowDetail: newDetail,
      };
    },
  },
};
