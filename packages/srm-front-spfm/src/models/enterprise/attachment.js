/**
 * financeInfo - 企业注册-附件信息Modal
 * @date: 2018-7-9
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  queryAttachment,
  addAttachment,
  removeAttachment,
  queryAttachmentType,
  queryUuid,
  submitApproval,
  fetchFileNumber,
} from '@/services/attachmentService';

export default {
  namespace: 'attachment',
  state: {
    data: [],
    code: {
      AttachmentType: [],
    },
  },
  effects: {
    *fetchAttachment({ payload }, { call, put }) {
      const response = yield call(queryAttachment, payload);
      const attachmentData = getResponse(response);
      if (attachmentData) {
        const data = attachmentData.map(item => ({ ...item, _status: 'update' }));
        yield put({
          type: 'queryAttachment',
          payload: data,
        });
      }
    },
    *addAttachment({ payload }, { call }) {
      const response = yield call(addAttachment, payload);
      return getResponse(response);
    },
    *deleteAttachment({ payload }, { call }) {
      const response = yield call(removeAttachment, payload);
      return getResponse(response);
    },
    *fetchAttachmentType({ payload }, { call, put }) {
      const response = yield call(queryAttachmentType, payload);
      const data = getResponse(response);
      const arr = [];
      data.map(d => {
        return arr.push({
          ...d,
          isLeaf: false,
        });
      });
      if (data) {
        yield put({
          type: 'queryAttachmentType',
          payload: arr,
        });
      }
    },
    *fetchUuid({ payload }, { call }) {
      const response = yield call(queryUuid, payload);
      return getResponse(response);
    },
    *submitApproval({ payload }, { call }) {
      const response = yield call(submitApproval, payload);
      return getResponse(response);
    },
    *fetchFileNumber({ payload }, { call }) {
      const response = yield call(fetchFileNumber, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryAttachment(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    addNewData(state, action) {
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    },
    editRow(state, action) {
      return {
        ...state,
        data: action.payload.data,
      };
    },
    removeNewAdd(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    queryAttachmentType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          AttachmentType: action.payload,
        },
      };
    },
  },
};
