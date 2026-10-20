/**
 * model - 推荐申请单
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  queryRecommend,
  saveRecommend,
  deleteData,
  deleteEnclosureData,
  submitRecommend,
  deteleForm,
  scoreRecommend,
  obsoletedRecommend,
  handlePrint,
} from '@/services/recommendApplicationService';
import { queryScoreInfo } from '@/services/commonApplicationService';
import { queryMapIdpValue } from 'services/api';

function getHeaderInfo(data) {
  if (!isEmpty(data.recommendHeader)) {
    return data.recommendHeader;
  } else {
    return {};
  }
}
function getCapacityDataSource(data) {
  if (!isEmpty(data.recommendItemLines)) {
    return data.recommendItemLines;
  } else {
    return [];
  }
}
function getEnclosureDataSource(data) {
  if (!isEmpty(data.recommendAttachmentLines)) {
    return data.recommendAttachmentLines;
  } else {
    return [];
  }
}

export default {
  namespace: 'recommendApplication',
  state: {
    headerInfo: {}, // 表格头数据
    capacityDataSource: [], // 品类物料表格数据
    enclosureDataSource: [], // 附件表数据
    supplierClassificationData: {}, // 供应商分类表数据
    scoreInfoList: [], // 评分信息
    supplierClassifyList: [], // 供应商分类列表
  },
  effects: {
    // 查询数据
    *queryRecommend({ payload }, { call, put }) {
      const response = yield call(queryRecommend, payload);
      const data = getResponse(response);
      if (data) {
        const newScoreInfo = data.kpiEvalTplIndDTOS.map(item => ({ ...item, _status: 'create' }));
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: getHeaderInfo(data),
            scoreInfoList: newScoreInfo,
            capacityDataSource: getCapacityDataSource(data),
            enclosureDataSource: getEnclosureDataSource(data),
            supplierClassifyList: data.supplierCategoryAlterLines,
          },
        });
      }
      return data || {};
    },
    // 批量查询值集
    *queryMapIdpValue({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const response = yield call(queryMapIdpValue, lovCodes);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: data,
          },
        });
      }
    },
    // 保存所有数据
    *saveRecommend({ payload }, { call }) {
      const response = yield call(saveRecommend, payload);
      return getResponse(response);
    },
    // 删除表格数据
    *deleteData({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    // 删除附件表
    *deleteEnclosureData({ payload }, { call }) {
      const response = yield call(deleteEnclosureData, payload);
      return getResponse(response);
    },
    // 提交
    *submitRecommend({ payload }, { call }) {
      const response = yield call(submitRecommend, payload);
      return getResponse(response);
    },
    // 删除申请单
    *deteleForm({ payload }, { call }) {
      const response = yield call(deteleForm, payload);
      return getResponse(response);
    },
    // 废弃申请单
    *obsoletedRecommend({ payload }, { call }) {
      const response = yield call(obsoletedRecommend, payload);
      return getResponse(response);
    },
    // 发起评审
    *scoreRecommend({ payload }, { call }) {
      const res = getResponse(yield call(scoreRecommend, payload));
      return res;
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
