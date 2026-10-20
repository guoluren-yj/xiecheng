/**
 * 索赔单确认
 * @date: 2019-11-4
 * @version: 0.0.1
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  ConfirmFetchDataList,
  ConfirmFetchDetailDataHead,
  ConfirmFetchDetailDataList,
  AgreeClaim,
  bindHeaderAttachmentUuid,
  InitiateClaimStatement,
  SaveClaim,
} from '@/services/claimConfirmService';
import { queryMapIdpValue, queryFileListOrg } from 'services/api';

export default {
  namespace: 'claimOrder',
  state: {
    IndexListDatas: [], // 索赔单确认列表数据
    pagination: {}, // 分页信息
    DetailListDataSource: [], // 详情页列表数据
    DetailHeadDataSource: {}, // 详情页头数据
    DetailListPagination: {},
    code: {}, // 申诉内容
    formHeaderId: '',
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 获取索赔单列表数据
    *ConfirmFetchDataList({ payload }, { call, put }) {
      let result = yield call(ConfirmFetchDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            IndexListDatas: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    // 绑定头附件id
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },

    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },

    // 获取索赔单详情页数据
    *ConfirmFetchDetailDataHead({ payload }, { call, put }) {
      let result = yield call(ConfirmFetchDetailDataHead, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            DetailHeadDataSource: result,
            formHeaderId: result.formHeaderId,
          },
        });
      }
      return result;
    },

    // 获取索赔单详情页数据
    *ConfirmFetchDetailDataList({ payload }, { call, put }) {
      let result = yield call(ConfirmFetchDetailDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            DetailListDataSource: (result.content || []).map(item => {
              return { ...item, _status: 'update' };
            }),
            DetailListPagination: createPagination(result),
          },
        });
      }
    },

    // 同意索赔
    *AgreeClaim({ payload }, { call }) {
      const result = yield call(AgreeClaim, payload);
      return getResponse(result);
    },
    // 保存
    *SaveClaim({ payload }, { call }) {
      const result = yield call(SaveClaim, payload);
      return getResponse(result);
    },

    // 申诉功能
    *InitiateClaimStatement({ payload }, { call }) {
      // console.log('申诉功能')
      const result = yield call(InitiateClaimStatement, payload);
      return getResponse(result);
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
  },
};
