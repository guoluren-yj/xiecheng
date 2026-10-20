/*
 *
 * @date: 2018/11/13 17:47:27
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  // fetchOperationRecordList,
  // approveDeliveryOrder,
  // rejectDeliveryOrder,
  // queryDetailHeader,
  fetchHeader,
  fetchDetailList,
  itemCategories,
  saveList,
  updateList,
  submit,
  handleUpload,
  deleteHeader,
  deleteLine,
  bindHeaderAttachmentUuid,
  fetchPurAgentLovData,
  fetchBasePcLineList,
} from '@/services/acceptanceSheetCreateService';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
// import { queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'acceptanceSheetCreate',

  state: {
    orderList: [], // 列表
    listPagination: {},
    listQuery: {}, // 列表查询条件
    purAgentPagination: {}, // 验收人分页
    projectInfo: {},
    purAgentList: {},
    orderSource: [], // 验收单来源类型
    pcLineList: [], // 验收单创建-基于协议-行列表
    pcLinePagination: {},
    detailList: [],
    detailListPagination: {},
    code: {},
  },
  effects: {
    // 查询已创建的验收单
    *queryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            orderList: result.content,
            listPagination: createPagination(result),
          },
        });
      }
    },

    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },

    *fetchPurAgentLovData({ payload }, { call, put }) {
      const list = yield call(fetchPurAgentLovData, payload);
      yield put({
        type: 'updateState',
        payload: {
          purAgentList: list,
          purAgentPagination: createPagination(list),
        },
      });
    },
    *fetchBasePcLineList({ payload }, { call, put }) {
      const list = getResponse(yield call(fetchBasePcLineList, payload));
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            pcLineList: list.content.map((i) => ({
              ...i,
              createId: `${i.pcSubjectId}${i.pcStageId}`,
            })),
            pcLinePagination: createPagination(list),
          },
        });
      }
    },
    // 删除行数据
    *deleteLine({ payload }, { call }) {
      const res = yield call(deleteLine, payload);
      return getResponse(res);
    },
    //  已创建的验收单提交
    *submit({ payload }, { call }) {
      const result = getResponse(yield call(submit, payload));
      return result;
    },
    // // 查询头数据
    *fetchHeader({ payload }, { call }) {
      const result = getResponse(yield call(fetchHeader, payload));
      return result;
    },
    // 行附件上传
    *handleUpload({ payload }, { call }) {
      const result = getResponse(yield call(handleUpload, payload));
      return result;
    },
    // 查询行数据
    *fetchDetailList({ payload }, { call, put }) {
      const list = yield call(fetchDetailList, payload);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: list.content,
            detailListPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    *itemCategories({ payload }, { call }) {
      const list = getResponse(yield call(itemCategories, payload));
      return list;
    },

    // 更新
    *updateList({ payload }, { call }) {
      const result = getResponse(yield call(updateList, { ...payload }));
      return result;
    },

    // 绑定附件
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },

    // 整单删除
    *delete({ payload }, { call }) {
      const result = getResponse(yield call(deleteHeader, payload));
      return result;
    },

    // 查询送货单审批详情列表信息
    *saveList({ payload }, { call }) {
      const result = getResponse(yield call(saveList, payload));
      return result;
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
