/*
 * planSheet - 计划单创建
 * @date: 2019/12/11 11:49:14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchOperation, getAttachmentuuid, saveAttachmentUUID } from '@/services/planSheetService';
import { queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'planSheetCommon',
  state: {},
  effects: {
    // 操作记录
    *operationRecord({ payload }, { call }) {
      let result = yield call(fetchOperation, payload);
      result = getResponse(result);
      return result;
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
    },
    // 获取附件uuid
    *getAttachmentuuid({ payload }, { call }) {
      const res = getResponse(yield call(getAttachmentuuid, payload));
      return res;
    },
    // 获取采购方附件
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },
    // 保存与附件关联的附件uuid
    *saveAttachmentUUID({ payload }, { call }) {
      const res = getResponse(yield call(saveAttachmentUUID, payload));
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
