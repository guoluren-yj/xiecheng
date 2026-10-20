import { getResponse } from 'utils/utils';
import { queryFileListOrg } from 'services/api';

import {
  saveAttachmentUUID,
  print,
  queryCollByLine,
  fetchSettings,
  confirmDetail,
  saveDetail,
  submitAfterConfirm,
  listByLineFeedback,
  listByLineSave,
  listByLineFeedbackAgain,
  searchUuid,
  confirm,
  querySealPictures,
  fetchVerifyPhoneNum,
  getVerifyCode,
  confirmMobileChapter,
  confirmChapter,
  getFeedbackVerificationList,
} from '@/services/orderExecutionWorkbenchService';

const INIT_STATE = {
  redioKey: 'whole',
  activeKey: 'toBeFedBack',
  detailActiveKey: 'detailToBeFedBack',
  initFlag: false,
};
export default {
  namespace: 'orderExecutionWorkbench',

  state: {
    ...INIT_STATE,
  },

  effects: {
    // 保存文件上传后的UUID
    *saveAttachmentUUID({ payload }, { call }) {
      return getResponse(yield call(saveAttachmentUUID, payload));
    },
    // 打印
    *print({ payload }, { call }) {
      return getResponse(yield call(print, payload));
    },
    // 查询是否按行协同
    *queryCollByLine({ payload }, { call }) {
      return getResponse(yield call(queryCollByLine, payload));
    },
    // 获取附件
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
    },
    // 获取附件
    *fetchSettings(_, { call }) {
      const res = yield call(fetchSettings);
      return getResponse(res);
    },
    // 反馈
    *confirmDetail({ payload }, { call }) {
      const response = yield call(confirmDetail, payload);
      return getResponse(response);
    },
    // 保存
    *saveDetail({ payload }, { call }) {
      const response = yield call(saveDetail, payload);
      return getResponse(response);
    },
    // 再次反馈
    *submitAfterConfirm({ payload }, { call }) {
      const response = yield call(submitAfterConfirm, payload);
      return getResponse(response);
    },
    // 列表按行反馈
    *listByLineFeedback({ payload }, { call }) {
      const response = yield call(listByLineFeedback, payload);
      return getResponse(response);
    },
    // 列表按行保存
    *listByLineSave({ payload }, { call }) {
      const response = yield call(listByLineSave, payload);
      return getResponse(response);
    },
    // 列表按行再次反馈
    *listByLineFeedbackAgain({ payload }, { call }) {
      const response = yield call(listByLineFeedbackAgain, payload);
      return getResponse(response);
    },
    // 查询附件列表
    *searchUuid({ payload }, { call }) {
      const response = yield call(searchUuid, payload);
      return getResponse(response);
    },
    // 订单确认
    *confirm({ payload }, { call }) {
      const response = yield call(confirm, payload);
      return getResponse(response);
    },
    // -查询印章图片
    *fetchSealPictures({ payload }, { call }) {
      const response = getResponse(yield call(querySealPictures, payload));
      return response;
    },

    // 查询实名认证手机号
    *fetchVerifyPhoneNum({ payload }, { call }) {
      const response = getResponse(yield call(fetchVerifyPhoneNum, payload));
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
    // 反馈校验
    *getFeedbackVerificationList({ payload }, { call }) {
      const response = getResponse(yield call(getFeedbackVerificationList, payload));
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
    initState(state) {
      return {
        ...state,
        ...INIT_STATE,
      };
    },
  },
};
