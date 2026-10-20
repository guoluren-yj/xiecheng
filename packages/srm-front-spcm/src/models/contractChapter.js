/*
 * @Description: contractChapter - 协议用章
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:05:55
 * @LastEditTime: 2024-10-23 16:03:55
 * @version: 0.0.1
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryList,
  fetchHeader,
  getVerifyCode,
  querySealPictures,
  confirmMobileChapter,
  confirmChapter,
  rollbackContract,
} from '../services/contractChapterService';

export default {
  namespace: 'contractChapter',
  state: {
    dataSource: [], // 列表数据
    pagination: {}, // 分页参数
    enumMap: {}, // 列表值集
  },
  effects: {
    // 查询明细头
    *fetchHeader({ payload }, { call }) {
      const response = yield call(fetchHeader, payload);
      return getResponse(response);
    },
    // -查询列表
    *queryList({ payload }, { call, put, select }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        const loading = yield select((state) => state.loading);
        loading.effects['contractChapter/queryList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
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
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
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
    // -查询印章图片
    *fetchSealPictures({ payload }, { call }) {
      const response = getResponse(yield call(querySealPictures, payload));
      return response;
    },

    // 获取手机验证码
    *getVerifyCode({ payload }, { call }) {
      const response = getResponse(yield call(getVerifyCode, payload));
      return response;
    },

    // 手机验证签章
    *confirmMobileChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmMobileChapter, payload));
      return response;
    },

    // 无手机验证签章
    *confirmChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmChapter, payload));
      return response;
    },
    // 协议退回
    *rollbackContract({ payload }, { call }) {
      const response = getResponse(yield call(rollbackContract, payload));
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
