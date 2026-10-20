/**
 * 供应商开票工作台 - models
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
// import { getResponse } from 'utils/utils';
import // uploadFile,
'@/services/supplier/supplierInvoicingService';

export default {
  namespace: 'supplierInvoicing',
  state: {},
  effects: {
    // 批量上传数据
    // *uploadFile({ payload }, { call }) {
    //   const res = yield call(uploadFile, payload);
    //   if (getResponse(res)) {
    //     return res;
    //   }
    // },
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
