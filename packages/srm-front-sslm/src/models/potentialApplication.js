/**
 * model - 推荐申请单
 * @date: 2018-9-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryFileListOrg, queryUUID, removeFileOrg } from 'services/api';
import {
  queryPotential,
  savePotential,
  deleteData,
  deleteEnclosureData,
  submitPotential,
  deteleForm,
  scorePotential,
  obsoletedPotential,
  handlePrint,
} from '@/services/potentialApplicationService';
import { queryScoreInfo } from '@/services/commonApplicationService';

function getHeaderInfo(data) {
  if (!isEmpty(data.potentialHeader)) {
    return data.potentialHeader;
  } else {
    return {};
  }
}
function getSupplierCapacityDataSource(data) {
  if (!isEmpty(data.potentialLines)) {
    return data.potentialLines;
  } else {
    return [];
  }
}
function getEnclosureDataSource(data) {
  if (!isEmpty(data.potentialAttachmentLines)) {
    return data.potentialAttachmentLines;
  } else {
    return [];
  }
}

export default {
  namespace: 'potentialApplication',
  state: {
    headerInfo: {}, // 表格头数据
    supplierCapacityDataSource: [], // 供应商能力清单表格数据
    enclosureDataSource: [], // 附件表数据
    scoreInfoList: [], // 评分信息
    supplierClassifyList: [],
  },
  effects: {
    // 查询数据
    *queryPotential({ payload }, { call, put }) {
      const response = yield call(queryPotential, payload);
      const data = getResponse(response);
      if (data) {
        const newScoreInfo = data.kpiEvalTplIndDTOS.map((item) => ({ ...item, _status: 'create' }));
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: getHeaderInfo(data),
            supplierCapacityDataSource: getSupplierCapacityDataSource(data),
            enclosureDataSource: getEnclosureDataSource(data),
            scoreInfoList: newScoreInfo,
            supplierClassifyList: data.supplierCategoryAlterLines,
          },
        });
      }
      return data || {};
    },
    // 保存所有数据
    *savePotential({ payload }, { call }) {
      const response = yield call(savePotential, payload);
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
    *submitPotential({ payload }, { call }) {
      const response = yield call(submitPotential, payload);
      return getResponse(response);
    },
    // 删除申请单
    *deteleForm({ payload }, { call }) {
      const response = yield call(deteleForm, payload);
      return getResponse(response);
    },

    // 查询UUID
    *fetchUuid({ payload }, { call }) {
      const res = yield call(queryUUID, payload);
      return getResponse(res);
    },

    // 获取文件
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
    },

    // 通过uuid删除附件
    *removeFileOrg({ payload }, { call }) {
      const res = yield call(removeFileOrg, payload);
      return getResponse(res);
    },

    // 发起评审
    *scorePotential({ payload }, { call }) {
      const res = getResponse(yield call(scorePotential, payload));
      return res;
    },
    // 废弃申请单
    *obsoletedPotential({ payload }, { call }) {
      const response = yield call(obsoletedPotential, payload);
      return getResponse(response);
    },
    // 打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
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
