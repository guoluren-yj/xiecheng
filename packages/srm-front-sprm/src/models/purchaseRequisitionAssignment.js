/**
 * index - 需求分配
 * @date: 2019-07-11
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse, createPagination, parseParameters, filterNullValueObject } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  queryList,
  saveAssignmentConfigure,
  saveSuspendConfigure,
  enable,
  fetchOperationRecordList,
  queryExecutedBys,
  queryBuyer,
  priceList,
  fetchSettings,
  fetchDoExecute,
  backUnassign,
} from '@/services/purchaseRequisitionAssignmentService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseRequisitionAssignment',
  state: {
    prSourcePlatformList: [],
    projectCategoryList: [],
    executionStatusList: [],
    abcTypeList: [],
    dataSource: [],
    queryExcelExport: {},
    pagination: {}, // 分页信息
    fileList: [],
    erpEditStatusList: [],
    queryParams: {}, // 导出数据列集合
    yesAndNoList: [],
    secondLevelStrategyCode: [],
  },
  effects: {
    /**
     * 获取单据来源值集
     * @params {*} { call, put }
     */
    *init(_, { call, put }) {
      // const prSourcePlatformList = getResponse(yield call(queryUnifyIdpValue, 'SPRM.SRC_PLATFORM'));
      // const projectCategoryList = getResponse(
      //   yield call(queryUnifyIdpValue, 'SPUC.PR_LINE_PROJECT_CATEHORY')
      // );
      // const abcTypeList = getResponse(yield call(queryUnifyIdpValue, 'SMDM.ITEM_ABC'));
      // const executionStrategyList = getResponse(
      //   yield call(queryUnifyIdpValue, 'SPRM.EXECUTION_STRATEGY')
      // );
      // const erpEditStatusList = getResponse(yield call(queryUnifyIdpValue, 'SPUC.PR_ERP_STATUS'));
      // const executionStatusList = getResponse(
      //   yield call(queryUnifyIdpValue, 'SPRM.PR_EXECUTION_STATUS')
      // );
      const payload = getResponse(
        yield call(queryMapIdpValue, {
          prSourcePlatformList: 'SPRM.SRC_PLATFORM',
          projectCategoryList: 'SPUC.PR_LINE_PROJECT_CATEHORY',
          abcTypeList: 'SMDM.ITEM_ABC',
          executionStrategyList: 'SPRM.EXECUTION_STRATEGY',
          erpEditStatusList: 'SPUC.PR_ERP_STATUS',
          executionStatusList: 'SPRM.PR_EXECUTION_STATUS',
          yesAndNoList: 'HPFM.FLAG',
          secondLevelStrategyCode: 'SPRM.SECOND_LEVEL_STRATEGY',
        })
      );
      yield put({
        type: 'updateState',
        payload,
      });
    },
    *fetchTotalCountAsync({ options }, { call, put }) {
      const { payload, needCountFlag, pageStateName, queryRequest } = options || {};
      if (!payload || needCountFlag !== 'Y') return;
      const response = yield call(queryRequest, { ...payload, onlyCountFlag: 'Y' });
      const result = getResponse(response);
      if (!result) return;
      yield put({
        type: 'updateState',
        payload: {
          [pageStateName]: createPagination(result),
        },
      });
    },
    /**
     * 查询
     * @params {object} payload -查询字段对象
     * @params {*} { call, put }
     */
    *searchList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' }));
      const query = filterNullValueObject(parseParameters(payload));
      yield put({
        type: 'updateState',
        payload: {
          queryParams: query,
        },
      });
      if (res) {
        const { content, needCountFlag } = res;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: content,
            pagination: createPagination(res),
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            queryRequest: queryList,
            pageStateName: 'pagination',
          },
        });
      }
      return res;
    },
    /**
     * 分配
     * @params {object} payload.data - 分配的信息
     * @params {*} { call }
     * @returns
     */
    *saveAssignmentConfigure({ payload }, { call }) {
      const res = getResponse(yield call(saveAssignmentConfigure, payload));
      return res;
    },
    /**
     * 暂挂
     * @params {object} payload.data - 暂挂的信息
     * @params {*} { call }
     * @returns
     */
    *saveSuspendConfigure({ payload }, { call }) {
      const res = getResponse(yield call(saveSuspendConfigure, payload));
      return res;
    },
    /**
     * 启用
     * @params {string[]} payload.selectedRows - 启用的行数据
     * @params {*} { call, put }
     */
    *enable({ payload }, { call, put }) {
      const res = getResponse(yield call(enable, payload.selectedRows));
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: res,
        });
      }
      return res;
    },

    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },

    // 查询需求执行人LOV数据
    *queryExecutedBys({ payload }, { call }) {
      const result = getResponse(yield call(queryExecutedBys, payload));
      return result;
    },
    // 查询采购员
    *queryBuyer({ payload }, { call }) {
      const result = getResponse(yield call(queryBuyer, payload));
      return result;
    },
    // 查询价格库信息
    *priceList({ payload }, { call }) {
      const response = getResponse(yield call(priceList, payload));
      return response;
    },
    // 查询配置中心
    *fetchSettings(params, { call }) {
      const result = getResponse(yield call(fetchSettings));
      return result;
    },
    // 查询业务规则定义中的执行策略
    *fetchDoExecute({ payload }, { call }) {
      const result = getResponse(yield call(fetchDoExecute, payload));
      return result;
    },
    // 退回至待分配
    *backUnassign({ payload }, { call }) {
      const result = getResponse(yield call(backUnassign, payload));
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
