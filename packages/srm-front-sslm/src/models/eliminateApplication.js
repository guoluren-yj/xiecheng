/**
 * model - 淘汰申请单
 * @date: 2018-9-18
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  queryEliminate,
  saveEliminate,
  deleteEnclosureData,
  submitEliminate,
  deteleForm,
  obsoletedEliminate,
  handlePrint,
} from '@/services/eliminateApplicationService';

function getHeaderInfo(data) {
  if (!isEmpty(data.degradeHeader)) {
    return data.degradeHeader;
  }
}
function getEnclosureDataSource(data) {
  if (!isEmpty(data.degradeAttachmentLines)) {
    return data.degradeAttachmentLines;
  }
}

export default {
  namespace: 'eliminateApplication',
  state: {
    headerInfo: {}, // 表格头数据
    enclosureDataSource: [], // 附件表数据
    supplierClassifyList: [], // 供应商分类列表
  },
  effects: {
    // 查询数据
    *queryEliminate({ payload }, { call, put }) {
      const response = yield call(queryEliminate, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: getHeaderInfo(data),
            enclosureDataSource: getEnclosureDataSource(data),
            supplierClassifyList: data.supplierCategoryAlterLines,
          },
        });
      }
      return data || {};
    },
    // 保存所有数据
    *saveEliminate({ payload }, { call }) {
      const response = yield call(saveEliminate, payload);
      return getResponse(response);
    },
    // 删除附件表
    *deleteEnclosureData({ payload }, { call }) {
      const response = yield call(deleteEnclosureData, payload);
      return getResponse(response);
    },
    // 提交
    *submitEliminate({ payload }, { call }) {
      const response = yield call(submitEliminate, payload);
      return getResponse(response);
    },
    // 删除申请单
    *deteleForm({ payload }, { call }) {
      const response = yield call(deteleForm, payload);
      return getResponse(response);
    },
    // 废弃申请单
    *obsoletedEliminate({ payload }, { call }) {
      const response = yield call(obsoletedEliminate, payload);
      return getResponse(response);
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
