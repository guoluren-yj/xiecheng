/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  queryList,
  archiveContract,
  uploads,
  fetchStage,
  fetchDocument,
  fetchAcceptDocument,
  fetchDetailList,
  reExportContract,
  reExportCommission,
  reExportContractLock,
  triggerPush,
  queryChangeInfo,
  signAndSeal,
  queryPushExternalSystemData,
  againPushExternalSystemData,
  contractPushExternalSystemData,
  syncAttachment,
} from '../services/purchaseContractViewService';

export default {
  namespace: 'purchaseContractView',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataLineList: [], // 列表数据
    pagination: {},
    dataDetailList: [],
    detailPagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
    listQuery: {},
    stageList: [],
    stagePagination: {},
    documentList: [],
    documentPagination: {},
    acceptDocList: [], // 验收单据列表数据
    acceptDocPagination: {}, // 验收单据分页对象
  },

  effects: {
    // -查询列表
    *queryList({ payload }, { call, put, select }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        const loading = yield select(state => state.loading);
        loading.effects['purchaseContractView/queryList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            dataLineList: response.content,
            pagination: createPagination(response),
            paginationLoading: response?.needCountFlag === 'Y',
          },
        });
      }

      // 异步获取 totalElements
      if (response?.needCountFlag === 'Y') {
        const resForCount = yield call(queryList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            paginationLoading: false,
            pagination: createPagination(pageCount),
          },
        });
      }
    },

    // 归档
    *archiveContract({ payload }, { call }) {
      const response = getResponse(yield call(archiveContract, payload));
      return response;
    },

    // 附件
    *uploads({ payload }, { call }) {
      const response = getResponse(yield call(uploads, payload));
      return response;
    },

    // 同步附件
    *syncAttachment({ payload }, { call }) {
      const response = getResponse(yield call(syncAttachment, payload));
      return response;
    },

    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
          signSeal: 'SPCM.BUTTOM_MEANING',
          orderSign: 'SPCM.PC_SHOW_PO_FLAG',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    // -查询协议阶段
    *fetchStage({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchStage, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            stageList: response.content,
            stagePagination: createPagination(response),
          },
        });
      }
    },
    // -查询执行单据
    *fetchDocument({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchDocument, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            documentList: response.content,
            documentPagination: createPagination(response),
          },
        });
      }
    },

    // -查询验收单据
    *fetchAcceptDocument({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchAcceptDocument, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            acceptDocList: response.content,
            acceptDocPagination: createPagination(response),
          },
        });
      }
    },
    // 按明细查询协议
    *fetchDetailList({ payload }, { call, put, select }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(fetchDetailList, payload));
      if (response) {
        const loading = yield select(state => state.loading);
        loading.effects['purchaseContractView/fetchDetailList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            dataDetailList:
              response.content && response.content.map((r) => ({ ...r, _status: 'update' })),
            detailPagination: createPagination(response),
            detailPaginationLoading: response?.needCountFlag === 'Y',
          },
        });
      }

      // 异步获取 totalElements
      if (response?.needCountFlag === 'Y') {
        const resForCount = yield call(fetchDetailList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            detailPaginationLoading: false,
            detailPagination: createPagination(pageCount),
          },
        });
      }
    },

    // 协议接口重推（该功能为权限性功能）
    *reExportContract({ payload }, { call }) {
      const response = getResponse(yield call(reExportContract, payload));
      return response;
    },

    // 协议接口重推佣金系统（该功能为权限性功能）
    *reExportCommission({ payload }, { call }) {
      const response = getResponse(yield call(reExportCommission, payload));
      return response;
    },

    // 协议接口重推契约锁（该功能为权限性功能-伽蓝）
    *reExportContractLock({ payload }, { call }) {
      const response = getResponse(yield call(reExportContractLock, payload));
      return response;
    },

    // 触发推送
    *triggerPush({ payload }, { call }) {
      const response = getResponse(yield call(triggerPush, payload));
      return response;
    },
    // 查询协议历史版本对比数据
    *queryChangeInfo({ payload }, { call }) {
      const response = getResponse(yield call(queryChangeInfo, payload));
      return response;
    },
    // 签署盖章
    *postSignAndSeal({ payload }, { call }) {
      const response = getResponse(yield call(signAndSeal, payload));
      return response;
    },
    // 获取同步列表Spa
    *queryPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(queryPushExternalSystemData, payload));
      return response;
    },
    // 单个推送单位失败重新同步
    *againPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(againPushExternalSystemData, payload));
      return response;
    },
    // 协议推送失败重新同步
    *contractPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(contractPushExternalSystemData, payload));
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
