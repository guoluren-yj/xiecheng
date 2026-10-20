/**
 * GoodsShare -商品分享 - model
 * @date: 2019-10-28
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { uniqWith, isEqual, uniq } from 'lodash';
import {
  fetchShareGoodsList,
  fetchSharedGoodsList,
  handleGoodsShare,
  changeState,
  handleModalOk,
  fetchGoodsDetail,
  // fetchGoodsSubmit,
  // fetchGoodsScrapped,
  fetchLadderPriceTable,
  saveLadderPrice,
  groupShare,
  batchStatus,
  deleteLadderPriceLines,
} from '@/services/goodsShareService';
import { queryMapIdpValue, queryUUID } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'goodsShare',
  state: {
    shareList: [],
    sharedList: [],
    infoList: [],
    sharePagination: {}, // 分享分页
    sharedPagination: {}, // 被分享分页
    infoPagination: {},
    activeKey: '1',
    dataList: [], // 分享模态框数据
    defaultSelect: [], // 默认选中启用数据companyId
    modalPagination: {}, // 分享模态框分页
    visible: false,
    productIds: [],
    detail: {},
    code: {}, // 获取状态下拉值集
    attachmentImageUUId: '', // 上传图片UUID
    attachmentUUId: '', // 上传附件UUID
    selectedRows: [], // 选中状态
    selectedKeys: [],
    rows: [],
    modalRows: [],
    totalList: [], // 公司总条数
    // shareStatus: 1,
  },
  effects: {
    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            code: list,
          },
        });
      }
    },

    *batchStatus({ payload }, { call }) {
      const res = getResponse(yield call(batchStatus, payload));
      return res;
    },

    // 分享的商品列表查询
    *fetchShareGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchShareGoodsList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            shareList: list.content || [],
            sharePagination: createPagination(list),
          },
        });
      }
    },

    // 被分享的商品列表查询
    *fetchSharedGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchSharedGoodsList, payload);
      const goodsList = getResponse(response);
      if (goodsList) {
        yield put({
          type: 'updateState',
          payload: {
            sharedList: goodsList.content || [],
            sharedPagination: createPagination(goodsList),
          },
        });
      }
    },

    // 集团共享
    *groupShare({ payload }, { call }) {
      const res = getResponse(yield call(groupShare, payload));
      return res;
    },

    // 分享/批量分享
    *handleGoodsShare({ payload = {} }, { call, put }) {
      const response = yield call(handleGoodsShare, payload);
      const dataLists = getResponse(response);
      if (dataLists) {
        yield put({
          type: 'updateState',
          payload: {
            productIds: payload.productIds,
            dataList: dataLists.content || [],
            modalPagination: createPagination(dataLists),
          },
        });
        yield put({
          type: 'updateDefaultSelect',
          payload:
            dataLists.content &&
            dataLists.content.filter(item => item.enableFlag === 1).map(item => item.companyId),
        });
        yield put({
          type: 'updateModalRows',
          payload: dataLists.content && dataLists.content.filter(item => item.enableFlag === 1),
        });
      }
      return getResponse(response);
    },

    // 分享模态框确定
    *handleModalOk({ payload }, { call, put }) {
      const response = yield call(handleModalOk, payload);
      const infoList = getResponse(response);
      if (infoList) {
        yield put({
          type: 'updateState',
          payload: {
            infoList: infoList.content || [],
            infoPagination: createPagination(infoList),
          },
        });
      }
      return getResponse(response);
    },

    // 启用/禁用
    *changeState({ payload }, { call }) {
      const response = yield call(changeState, payload);
      return getResponse(response);
    },

    // 用于查询商品详情
    *fetchGoodsDetail({ payload }, { call, put }) {
      const response = yield call(fetchGoodsDetail, payload);
      const detail = getResponse(response);
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            detail,
          },
        });
      }
    },

    // 获取上传图片的uuid
    *getAttachmentId({ payload }, { call, put }) {
      const response = yield call(queryUUID, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentImageUUId: list.content,
          },
        });
      }
    },

    // 获取上传附件的uuid
    *getAttachmentUUId({ payload }, { call, put }) {
      const response = yield call(queryUUID, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentUUId: list.content,
          },
        });
      }
    },

    // // 商品提交
    // *fetchGoodsSubmit({ payload }, { call }) {
    //   const response = yield call(fetchGoodsSubmit, payload);
    //   return getResponse(response);
    // },

    // // 商品作废
    // *fetchGoodsScrapped({ payload }, { call }) {
    //   const response = yield call(fetchGoodsScrapped, payload);
    //   return getResponse(response);
    // },

    // 阶梯报价-批量删除
    *deleteLadderPriceLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderPriceLines, payload));
      return result;
    },

    // 保存阶梯报价行
    *saveLadderPrice({ payload }, { call }) {
      const result = getResponse(yield call(saveLadderPrice, payload));
      return result;
    },

    // 询价阶梯报价
    *fetchLadderPriceTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderPriceTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceData: dealDataState(result.content),
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
    updateModalRows(state, { payload }) {
      return {
        ...state,
        modalRows: uniqWith([...state.modalRows, ...payload], isEqual),
      };
    },
    updateDefaultSelect(state, { payload }) {
      return {
        ...state,
        defaultSelect: uniq([...state.defaultSelect, ...payload]),
      };
    },
  },
};
