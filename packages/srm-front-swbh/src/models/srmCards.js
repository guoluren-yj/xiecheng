// import { getResponse, createPagination, isTenantRoleLevel } from 'utils/utils';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import intl from 'utils/intl';
// import { filter, isEmpty } from 'lodash';
import {
  getCardSetting,
  getDocTotal,
  queryList,
  queryCustomizeUnitCode,
  attentionIgnore,
  todoDocStatus,
  isShowReportCards,
  getTransferTotalElements,
} from '@/services/roleWorkbenchService';

export default {
  namespace: 'swbhCards',
  state: {
    currentCarousel: 'ALL', // 当前选中的单据卡片
    currentDocName: '',
    currentMenuData: {}, // 当前单据卡片下的menu
    totalLoading: true, // total数据加载loading(顶部卡片及左侧menu)
    businessLoading: true, // 快速发起业务卡片loading

    docTotal: {}, // 数量
    transferTotalElements: [], // 待转单的数量单独拆分出来查询
    todoDocTotal: {}, // 待办数量
    focusDocTotal: {}, // 待阅数量

    allCard: {}, // “全部”卡片
    cardList: [], // 单据卡片分类列表

    docTypeSource: [], // 当前卡片下单据类型下拉值集数据源
    cardDocFastDTOList: [], // 快速发起业务
    cardQuickLinkDTOList: [], // 快速入口
    draftNum: 0, // 草稿箱数量

    wsInfo: null,
    initFlag: true,
  },

  effects: {
    // 卡片查询
    *getCardSetting(_, { call }) {
      const data = getResponse(yield call(getCardSetting));
      // debugger
      // const { cardDocTypeList, fastCardDocTypeList, quickLinkList, cardList } = data;
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     cardDocTypeList,
      //     fastCardDocTypeList,
      //     quickLinkList,
      //     cardList,
      //   },
      // });
      return data;
    },

    // 卡片汇总单据数量查询
    *getDocTotal({ payload }, { call, put }) {
      const data = getResponse(yield call(getDocTotal, payload));

      if (payload?.todoFlag === 'TODO') {
        yield put({
          type: 'updateState',
          payload: {
            todoDocTotal: data,
          },
        });
      } else if (payload?.todoFlag === 'FOCUS') {
        yield put({
          type: 'updateState',
          payload: {
            focusDocTotal: data,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            docTotal: data,
            todoDocTotal: {},
            focusDocTotal: {},
            // currentMenuData: data?.allCard ?? {},
          },
        });
      }

      return data;
    },

    // 拆分获取待处理数量
    *getTransferTotalElements(_, { call, put }) {
      const transferTotalElements = getResponse(yield call(getTransferTotalElements));
      if (transferTotalElements) {
        yield put({
          type: 'updateState',
          payload: { transferTotalElements },
        });
      }
    },

    // 单据查询
    *queryList({ payload }, { call }) {
      const data = getResponse(yield call(queryList, payload));
      return data;
    },
    // 筛选器查询
    *queryCustomizeUnitCode({ payload }, { call }) {
      const data = getResponse(yield call(queryCustomizeUnitCode, payload));
      return data;
    },
    // 关注忽略
    *attentionIgnore({ payload }, { call }) {
      const data = getResponse(yield call(attentionIgnore, payload));
      return data;
    },
    // 待办单据状态查询
    *todoDocStatus({ payload }, { call }) {
      const data = getResponse(yield call(todoDocStatus, payload));
      return data;
    },
    // 是否显示采购驾驶舱
    *isShowReportCards(_, { call }) {
      const data = getResponse(yield call(isShowReportCards));
      return data;
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
