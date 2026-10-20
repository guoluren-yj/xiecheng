/**
 * prepareApplication.js - 供应商生命周期预留申请单 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  queryPrepareDetail,
  deletePrepare,
  savePrepare,
  submitPrepare,
  deleteEnclosureData,
  onDraggerUploadRemove,
  scorePrepare,
  obsoletedPrepare,
  deleteAbilityData,
  handlePrint,
} from '@/services/prepareApplicationService';
import { queryScoreInfo, querySupplierAbility } from '@/services/commonApplicationService';

export default {
  namespace: 'prepareApplication',

  state: {
    prepareHeader: {}, // 头信息
    attachmentList: [], // 附件列表
    scoreInfoList: [], // 评分信息
    supplierClassifyList: [], // 供应商分类列表
  },

  effects: {
    *queryPrepareDetail({ payload }, { call, put }) {
      const prepareInfo = getResponse(yield call(queryPrepareDetail, payload));
      if (prepareInfo) {
        const {
          prepareHeader,
          prepareAttachmentLines: attachmentList,
          kpiEvalTplIndDTOS,
          supplierCategoryAlterLines: supplierClassifyList,
        } = prepareInfo;
        const scoreInfoList = (kpiEvalTplIndDTOS || []).map(item => ({
          ...item,
          _status: 'create',
        }));
        yield put({
          type: 'updateState',
          payload: { prepareHeader, attachmentList, scoreInfoList, supplierClassifyList },
        });
      }
      return prepareInfo;
    },
    *deletePrepare({ payload }, { call }) {
      const { requisitionId } = payload;
      const res = getResponse(yield call(deletePrepare, { requisitionId }));
      return res;
    },
    *savePrepare({ payload }, { call }) {
      const res = getResponse(yield call(savePrepare, payload));
      return res;
    },
    *submitPrepare({ payload }, { call }) {
      const res = getResponse(yield call(submitPrepare, payload));
      return res;
    },
    // 删除附件表
    *deleteEnclosureData({ payload }, { call }) {
      const response = yield call(deleteEnclosureData, payload);
      return getResponse(response);
    },
    // 移除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    // 发起评审
    *scorePrepare({ payload }, { call }) {
      const res = getResponse(yield call(scorePrepare, payload));
      return res;
    },
    // 废弃申请单
    *obsoletedPrepare({ payload }, { call }) {
      const response = yield call(obsoletedPrepare, payload);
      return getResponse(response);
    },
    // 查询评分信息
    *queryScoreInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(queryScoreInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scoreInfoList: res.map(item => ({ ...item, _status: 'create' })),
          },
        });
      }
      return res;
    },
    // 查询历史供货能力清单
    *querySupplierAbility({ payload }, { call }) {
      const res = getResponse(yield call(querySupplierAbility, payload));
      return res;
    },
    // 删除供货能力清单
    *deleteAbilityData({ payload }, { call }) {
      const res = getResponse(yield call(deleteAbilityData, payload));
      return res;
    },
    // 打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
