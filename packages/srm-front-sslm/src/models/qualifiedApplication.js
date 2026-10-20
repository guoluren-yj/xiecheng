/**
 * qualifiedApplication.js - 供应商生命周期合格申请单 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, filterNullValueObject } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryFileListOrg } from 'services/api';
import {
  queryQualifiedDetail,
  deleteQualified,
  saveQualified,
  scoreQualified,
  submitQualified,
  deleteEnclosureData,
  querySupplierAbility,
  handleAsnPrint,
  deleteData,
  obsoletedQualified,
  queryManageList,
} from '@/services/qualifiedApplicationService';
import { queryScoreInfo } from '@/services/commonApplicationService';

export default {
  namespace: 'qualifiedApplication',

  state: {
    qualifiedInfo: {}, // 合格申请单详情
    attachmentList: [], // 附件列表
    abilityInfo: {}, // 供货能力清单
    qualifiedSupRecList: [], // 供货能力清单表格数据
    scoreInfoList: [], // 评分信息
    abilityInfoData: [],
    supplierClassifyList: [], // 供应商分类列表
    manageList: [], // 现场考察列表
    manageListPagination: {}, // 现场考察列表分页
  },

  effects: {
    *queryQualifiedDetail({ payload }, { call, put }) {
      const qualifiedInfo = getResponse(yield call(queryQualifiedDetail, payload));
      if (!isEmpty(qualifiedInfo)) {
        const {
          qualifiedHeader,
          qualifiedAttachmentLines: attachmentList,
          kpiEvalTplIndDTOS: scoreInfoList,
          qualifiedSupRecList,
          supplierCategoryAlterLines: supplierClassifyList,
          ...others
        } = qualifiedInfo;
        const newScoreInfoList = scoreInfoList.map((item) => ({ ...item, _status: 'create' }));
        yield put({
          type: 'updateState',
          payload: {
            qualifiedInfo: { ...others, ...filterNullValueObject(qualifiedHeader) },
            attachmentList,
            scoreInfoList: newScoreInfoList,
            qualifiedSupRecList,
            supplierClassifyList,
          },
        });
      }
      return qualifiedInfo || {};
    },
    *querySupplierAbility({ payload }, { call, put }) {
      const abilityInfo = getResponse(yield call(querySupplierAbility, payload));
      if (abilityInfo) {
        yield put({
          type: 'updateState',
          payload: {
            abilityInfo,
            abilityInfoData: abilityInfo.content,
          },
        });
      }
    },
    // 现场考察列表查询
    *queryManageList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryManageList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            manageList: res.content,
            manageListPagination: createPagination(res),
          },
        });
      }
    },
    *deleteQualified({ payload }, { call }) {
      const { requisitionId } = payload;
      const res = getResponse(yield call(deleteQualified, { requisitionId }));
      return res;
    },
    *saveQualified({ payload }, { call }) {
      const res = getResponse(yield call(saveQualified, payload));
      return res;
    },
    // 删除表格数据
    *deleteData({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *scoreQualified({ payload }, { call }) {
      const res = getResponse(yield call(scoreQualified, payload));
      return res;
    },
    *submitQualified({ payload }, { call }) {
      const res = getResponse(yield call(submitQualified, payload));
      return res;
    },
    // 删除附件表
    *deleteEnclosureData({ payload }, { call }) {
      const response = yield call(deleteEnclosureData, payload);
      return getResponse(response);
    },
    // 获取文件
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
    },
    // 打印
    *handleAsnPrint({ payload }, { call }) {
      const res = getResponse(yield call(handleAsnPrint, payload));
      return res;
    },
    // 废弃申请单
    *obsoletedQualified({ payload }, { call }) {
      const response = yield call(obsoletedQualified, payload);
      return getResponse(response);
    },
    // 查询评分信息
    *queryScoreInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(queryScoreInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scoreInfoList: res.map((item) => ({ ...item, _status: 'create' })),
          },
        });
      }
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
