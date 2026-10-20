/**
 * orderCancel - 订单取消
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { omit } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  querySingleList,
  cancelOrder,
  fetchCancelList,
  cancelLine,
  closeOrder,
  closeLine,
  fetchChangeHeader,
  fetchChangeLines,
  submitChangeOrder,
  fetchOperationRecordList,
  fetchChangeFields,
  saveAttachmentUUID,
  priceList,
  queryPoItemBOM,
  checkInvOrganization,
  addNewSubmitDetail,
  oldBudgetVerification,
  handleRevoke,
} from '@/services/orderCancel';
import { queryIdpValue, queryMapIdpValue } from 'services/api';

export default {
  namespace: 'orderCancel',

  state: {
    enumMap: {},
    dataSource: [], // 行数据源
    pagination: {}, // 分页数据
    orderSource: [], // 单据来源值集
    lineDataSource: [], // 行取消数据源
    linePagination: {}, // 行取消数据
  },

  effects: {
    // 值集查询
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          purchaseLineType: 'SODR.PO_LINE_TYPE',
          operateType: 'SODR.OPERATION_TYPE',
          freeFlag: 'HPFM.FLAG',
          batchMaintain: 'SPUC.ORDER_BATCH_MAINTENANCE',
          internationalTelCode: 'HPFM.IDD',
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
    *fetchSingleList({ payload }, { call, put }) {
      const res = getResponse(yield call(querySingleList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content,
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *fetchSingleListPage({ payload }, { call, put }) {
      const res = getResponse(yield call(querySingleList, { ...payload, onlyCountFlag: 'Y' }));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(res),
          },
        });
      }
    },
    *fetchCancelList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchCancelList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            lineDataSource: (res || {}).content || [],
            linePagination: createPagination(res || {}),
          },
        });
      }
      return res;
    },
    *fetchCancelListPage({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchCancelList, { ...payload, onlyCountFlag: 'Y' }));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            linePagination: createPagination(res || {}),
          },
        });
      }
    },
    *cancelOrder({ payload }, { call }) {
      const res = getResponse(yield call(cancelOrder, payload));
      return res;
    },
    *cancelLine({ payload }, { call }) {
      const res = getResponse(yield call(cancelLine, payload));
      return res;
    },
    /* 整单关闭 */
    *closeOrder({ payload }, { call }) {
      const res = getResponse(yield call(closeOrder, payload));
      return res;
    },
    /* 按行关闭 */
    *closeLine({ payload }, { call }) {
      const res = getResponse(yield call(closeLine, payload));
      return res;
    },
    *fetchValue(_, { call, put }) {
      const orderSource = getResponse(yield call(queryIdpValue, 'SPRM.SRC_PLATFORM'));
      yield put({
        type: 'updateState',
        payload: {
          orderSource,
        },
      });
    },
    // 订单变更头信息
    *fetchChangeHeader({ payload }, { call }) {
      const res = getResponse(yield call(fetchChangeHeader, payload));
      return res;
    },
    // 订单变更行查询
    *fetchChangeLines({ payload }, { call }) {
      const res = getResponse(yield call(fetchChangeLines, payload));
      return res;
    },
    // 订单变更行可修改字段
    *fetchChangeFields({ payload }, { call }) {
      const res = getResponse(yield call(fetchChangeFields, payload));
      return res;
    },
    // 订单变更提交
    *submitChangeOrder({ payload }, { call }) {
      const res = getResponse(yield call(submitChangeOrder, payload));
      return res;
    },
    // 订单变更提交新增接口
    *addNewSubmitDetail({ payload }, { call }) {
      const res = getResponse(yield call(addNewSubmitDetail, payload));
      return res;
    },
    // 保存与附件关联的附件uuid
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
      return getResponse(res);
    },
    // 参考价格查询
    *priceList({ payload }, { call }) {
      const result = getResponse(yield call(priceList, payload));
      return result;
    },
    // 订单变更操作记录
    *fetchOperationRecordList({ payload }, { call, put }) {
      const { poHeaderId, ...otherParams } = payload;
      const res = getResponse(yield call(fetchOperationRecordList, poHeaderId, otherParams));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            detailOperationQuery: omit(payload, ['page']),
            operationRecordList: res.content,
            operationRecordPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *queryPoItemBOM({ params }, { call }) {
      const res = yield call(queryPoItemBOM, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 校验物料&库存组织关联关系
    *checkInvOrganization({ payload }, { call }) {
      let res;
      const response = yield call(checkInvOrganization, payload);
      try {
        res = getResponse(JSON.parse(response));
      } catch {
        res = response;
      }
      return res;
    },
    // 订单提交预算校验
    *oldBudgetVerification({ payload }, { call }) {
      const res = getResponse(yield call(oldBudgetVerification, payload));
      return res;
    },
    /* 撤销变更 */
    *handleRevoke({ payload }, { call }) {
      const res = yield call(handleRevoke, payload);
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
