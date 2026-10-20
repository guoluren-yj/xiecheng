/**
 * 索赔单确认
 * @date: 2019-11-4
 * @version: 0.0.1
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';
import { createPagination, getResponse } from 'utils/utils';
import {
  StatementFetchDataList,
  releaseClaimStatement,
  FetchDetailDataList,
  FetchDetailDataHead,
  MaintainOriginal,
  ConfirmChange,
  SaveClaimStatement,
  CancelClaim,
  bindHeaderAttachmentUuid,
  deleteLines,
  submitValidate,
  SaveClaim,
} from '@/services/claimStatementService';
import { queryAmountMaintenanceMode } from '@/services/createClaimService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'claimStatement',
  state: {
    indexListDatas: [], // 索赔单申诉列表数据
    pagination: {}, // 分页信息
    DetailListDataSource: [], // 详情页列表数据
    DetailHeadDataSource: {}, // 详情页头数据
    DetailListPagination: {},
    _token: '',
    code: {},
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
    // 索赔单申诉列表数据
    *StatementFetchDataList({ payload }, { call, put }) {
      let result = yield call(StatementFetchDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            indexListDatas: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    // 索赔单申诉详情头数据
    *FetchDetailDataHead({ payload }, { call, put }) {
      let result = yield call(FetchDetailDataHead, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            DetailHeadDataSource: result,
            _token: result._token,
            objectVersionNumber: result.objectVersionNumber,
            formHeaderId: result.formHeaderId,
          },
        });
      }
      return result;
    },

    // 索赔单申诉详情行数据
    *FetchDetailDataList({ payload }, { call, put }) {
      let result = yield call(FetchDetailDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            DetailListDataSource: result.content.map((item) => {
              const { amountFieldFlag } = item;
              return {
                ...item,
                rowKey: uuid(),
                _status: 'update',
                disabledTax: amountFieldFlag === 0,
                disabledNoTax: amountFieldFlag === 1,
              };
            }),
            DetailListPagination: createPagination(result),
          },
        });
      }
    },

    // 维持原判
    *MaintainOriginal({ payload }, { call }) {
      const result = yield call(MaintainOriginal, payload);
      return getResponse(result);
    },

    // 确认改判
    *ConfirmChange({ payload }, { call }) {
      const result = yield call(ConfirmChange, payload);
      return getResponse(result);
    },
    // 保存
    *SaveClaimStatement({ payload }, { call }) {
      const result = yield call(SaveClaimStatement, payload);
      return getResponse(result);
    },
    *SaveClaim({ payload }, { call }) {
      const result = yield call(SaveClaim, payload);
      return getResponse(result);
    },
    // 取消索赔
    *CancelClaim({ payload }, { call }) {
      const result = yield call(CancelClaim, payload);
      return getResponse(result);
    },

    // 发布索赔单
    *releaseClaimStatement({ payload }, { call }) {
      const result = yield call(releaseClaimStatement, payload);
      return getResponse(result);
    },

    // 绑定头附件id
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },
    // 索赔单行删除
    *deleteLine({ payload }, { call }) {
      return getResponse(yield call(deleteLines, payload));
    },
    // 查询业务规则定义
    *queryAmountMaintenanceMode({ payload }, { call }) {
      const res = getResponse(yield call(queryAmountMaintenanceMode, payload));
      return res;
    },
    // 发布二次校验
    *submitValidate({ payload }, { call }) {
      const result = yield call(submitValidate, payload);
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
