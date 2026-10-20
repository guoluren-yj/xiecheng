/**
 * model 公告管理
 * @date: 2018-8-6
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import {
  getResponse,
  createPagination,
  parseParameters,
  getCurrentOrganizationId,
} from 'utils/utils';
import {
  queryIdpValue,
  queryUUID,
  removeFileList,
  queryFileList,
  // queryUnifyIdpValue,
} from 'hzero-front/lib/services/api';
import {
  fetchNotice,
  createNotice,
  updateNotice,
  uploadImage,
  // queryNoticeType,
  deleteNotice,
  queryNotice,
  publicNotice,
  revokeNotice,
  noticeHistory,
  approveHistory,
  fetchNoticeTimes,
  fetchNoticeCountDelete,
  fetchNoticeReadPurchaseList,
  fetchNoticeUnReadPurchaseList,
  fetchNoticeReadSupplierList,
  fetchNoticeUnReadSupplierList,
  fetchNoticeReadUserList,
  fetchNoticeUnReadUserList,
  fetchRolesList,
} from '@/services/noticeService';

export default {
  namespace: 'notice',

  state: {
    noticeList: [], // 公告列表数据
    pagination: {}, // 分页对象
    noticeDetail: {
      // 公告明细信息
      noticeContent: {
        noticeBody: '',
      },
    },
    noticeBodyWord: '',
    noticeDetailOnly: {
      // 公告明细信息-工作台进入
      noticeContent: {
        noticeBody: '',
      },
    },
    noticeBodyWordOnly: '',
    noticeReceiverType: [], // 公告接受者类型
    noticeCategory: [], // 公告类别
    noticeStatus: [], // 公告状态
    noticeObject: [], // 公告对象
    // noticeType: [], // 公告类型
    // langList: [], // 语言列表
    // noticeCascaderType: [], // 级联数据
    noticeHisotryList: [], // 操作历史列表
    approveHistoryList: [], // 审批记录列表
    // noticeHisotrypagination: {}, // 操作历史分页
    noticeReadPurchaseList: [],
    noticeReadPurchasePagination: {},
    noticeUnReadPurchaseList: [],
    noticeUnReadPurchasePagination: {},
    noticeReadSupplierList: [],
    noticeReadSupplierPagination: {},
    noticeUnReadSupplierList: [],
    noticeUnReadSupplierPagination: {},
    noticeReadUserList: [],
    noticeReadUserPagination: {},
    noticeUnReadUserList: [],
    noticeUnReadUserPagination: {},
    readRolesList: [],
    readRolesPagination: {},
    unReadRolesList: [],
    unReadRolesPagination: {},
  },

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      // const langList = getResponse(yield call(queryUnifyIdpValue, 'HPFM.LANGUAGE'));
      // const noticeReceiverType = getResponse(
      //   yield call(queryIdpValue, 'HPTL.NOTICE.RECERVER_TYPE')
      // );
      const noticeCategory = getResponse(
        yield call(
          queryIdpValue,
          getCurrentOrganizationId() !== 0 ? 'SPFM.TENANT_NOTICE_TYPE' : 'SPFM.PLATFORM_NOTICE_TYPE'
        )
      );
      const noticeStatus = getResponse(yield call(queryIdpValue, 'SPFM.NOTICE.STATUS_PAGE'));
      const noticeObject = getResponse(yield call(queryIdpValue, 'SPFM.NOTICE.NOTICE_CATEGORY'));
      const langObject = getResponse(yield call(queryIdpValue, 'HPFM.LANGUAGE2'));
      // const noticeType = getResponse(
      //   yield call(queryNoticeType, {
      //     'HPTL.NOTICE.NOTICE_TYPE': 1,
      //     'HPTL.NOTICE.NOTICE_TYPE.CH': 2,
      //   })
      // );
      // const noticeCascaderType = getResponse(
      //   yield call(queryNoticeType, {
      //     'HPTL.NOTICE.RECERVER_TYPE': 1,
      //     'HPTL.NOTICE.NOTICE_CATEGORY': 2,
      //   })
      // );
      yield put({
        type: 'updateState',
        payload: {
          // noticeReceiverType,
          noticeStatus,
          langObject,
          // noticeType,
          // noticeCascaderType,
          noticeCategory,
          noticeObject,
          // langList,
        },
      });
    },
    *fetchNotice({ payload }, { call, put }) {
      const res = yield call(fetchNotice, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeReadPurchaseList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeReadPurchaseList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeReadPurchaseList: list.content,
            noticeReadPurchasePagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeUnReadPurchaseList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeUnReadPurchaseList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeUnReadPurchaseList: list.content,
            noticeUnReadPurchasePagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeReadSupplierList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeReadSupplierList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeReadSupplierList: list.content,
            noticeReadSupplierPagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeUnReadSupplierList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeUnReadSupplierList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeUnReadSupplierList: list.content,
            noticeUnReadSupplierPagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeReadUserList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeReadUserList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeReadUserList: list.content,
            noticeReadUserPagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchReadRolesList({ payload }, { call, put }) {
      const res = yield call(fetchRolesList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            readRolesList: list.content,
            readRolesPagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchUnReadRolesList({ payload }, { call, put }) {
      const res = yield call(fetchRolesList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            unReadRolesList: list.content,
            unReadRolesPagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *fetchNoticeUnReadUserList({ payload }, { call, put }) {
      const res = yield call(fetchNoticeUnReadUserList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeUnReadUserList: list.content,
            noticeUnReadUserPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 创建公告信息
    *createNotice({ payload }, { call }) {
      const res = yield call(createNotice, payload);
      return getResponse(res);
    },
    // 更新公告信息
    *updateNotice({ payload }, { call }) {
      const res = yield call(updateNotice, payload);
      return getResponse(res);
    },
    // 删除公告信息
    *deleteNotice({ payload }, { call }) {
      const res = yield call(deleteNotice, payload);
      return getResponse(res);
    },
    // 查询单条公告信息
    *queryNotice({ payload }, { call, put }) {
      const res = yield call(queryNotice, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeDetail: list,
            noticeBodyWord: list.noticeContent.noticeBody,
          },
        });
      }
      return list;
    },
    // 查询单条公告信息-工作台进入
    *queryNoticeOnly({ payload }, { call, put }) {
      const res = yield call(queryNotice, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeDetailOnly: list,
            noticeBodyWordOnly: list.noticeContent.noticeBody,
          },
        });
      }
      return list;
    },
    // 发布公告信息
    *publicNotice({ payload }, { call }) {
      const res = yield call(publicNotice, payload);
      return getResponse(res);
    },

    // 查看操作记录
    *NoticeHistory({ payload }, { call, put }) {
      const res = yield call(noticeHistory, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeHisotryList: list,
            // noticeHisotrypagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查看审批记录
    *ApproveHistory({ payload }, { call, put }) {
      const res = yield call(approveHistory, payload);
      const list = getResponse(res);
      const historyArr = list ? []
          .concat(...list.map((item) => item.historicTaskExtList || []))
          .concat(list.historicTaskExtList || []).reverse() : [];
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            approveHistoryList: historyArr,
          },
        });
      }
      return historyArr;
    },

    // 撤销删除公告信息
    *revokeNotice({ payload }, { call }) {
      const res = yield call(revokeNotice, payload);
      return getResponse(res);
    },
    // 获取文件
    *queryFileList({ payload }, { call }) {
      const res = yield call(queryFileList, payload);
      return getResponse(res);
    },
    // 查询UUID
    *fetchUuid(_, { call }) {
      const res = yield call(queryUUID);
      return getResponse(res);
    },
    // 删除文件
    *removeFile({ payload }, { call }) {
      const res = yield call(removeFileList, payload);
      return getResponse(res);
    },
    // 富文本上传图片
    *uploadImage({ payload, file }, { call }) {
      const res = yield call(uploadImage, payload, file);
      return res;
    },
    *fetchNoticeTimes({ payload }, { call }) {
      const res = yield call(fetchNoticeTimes, payload);
      return res;
    },
    *fetchNoticeCountDelete({ payload }, { call }) {
      const res = yield call(fetchNoticeCountDelete, payload);
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
