/**
 * module - 考评档案管理
 * @date: 2019-1-10
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty, isNil } from 'lodash';
import uuid from 'uuid/v4';

import {
  getResponse,
  createPagination,
  getCurrentOrganizationId,
  addItemsToPagination,
} from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  docManageSearch,
  docManageDelete,
  docManageScoreCuiBan,
  initialFetch,
  scoreSumTabFetch,
  scoreVendorTabFetch,
  evaluationPersonFetch,
  modalScoreDetailFetch,
  productDetailFetch,
  activityLogFetch,
  saveThisDoc,
  saveEvaluationPerson,
  executeScore,
  sumStatisticsCheck,
  sumStatistics,
  publish,
  fetchGroupDimensionValue,
  queryEvaluationAuto,
  queryScopeCategoryList,
  queryScopeItemList,
  saveEvalTplScopeSupplierList,
  deleteEvalTplScopeSupplierList,
  saveCoreDetail,
  saveScoreSum,
  handleBackScore,
  queryEvalTplScopeSupplierList,
  queryEvaluationStatus,
  handleSubmit,
  submitNewApproval,
  queryAllSupplier,
  backScore,
  queryProblemHeader,
  queryComplaintSituation,
  saveComplaint,
  publishComplaint,
  recalculate,
} from '@/services/evaluationDocManageService';
import { queryUnifyIdpValue } from '@/services/evaluationTemplateService';
import { getUserDefaultMsg } from '@/services/investigationCreateService';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'evaluationDocManage',

  state: {
    statusValue: [], // 档案状态 select 组件值集
    cycleValue: [], // 考评周期 select 组件值集
    appealDeadline: [], // 申诉期限 select 组件值集
    appealLimit: [], // 申诉次数限制 select 组件值集
    levelValue: [], // 考评维度 select 组件值集
    methodValue: [], // 考评方法 select 组件值集
    dataSource: [], // 数据列表数据源
    processValue: [], // 系统评分值集
    dtlValue: [], // 手工评分值集
    docTypeList: [], // 单据类型值集
    pagination: {}, // 汇总列表分页信息

    basicInfo: {}, // 详情页面基本信息数据
    scoreDetail: [], // 评分详细表格数据
    scoreDetailPagination: {}, // 评分详细表格分页
    scoreSum: [], // 评分汇总表格数据
    scoreSumPagination: {}, // 评分汇总表格分页
    scoreVendor: [], // 参评供应商表格数据
    scoreVendorPagination: {}, // 参评供应商表格分页
    modalData: [], // modal 弹框数据
    modalPagination: {}, // modal 数据分页
    granularity: null, // 考评粒度

    productInfo: {}, // 采购品类信息
    EvaluationAutoData: {},

    groupDimensionValueObj: {}, // 当考评维度为“集团”的时候的维度值

    code: {}, // 供应商生命阶段值集

    evalTplScopeItemList: {}, // 供应商物料信息
    evalTplScopeCategoryList: {}, // 供应商品类信息

    suggestedStrategy: [], // 建议策略值集
    ParamValueList: [], // 参数值数据
    ParamValuePagination: {}, // 参数值分页
    complaintDataSource: [], // '供应商申诉情况'数据源
    complaintPagination: {}, // '供应商申诉情况'分页
  },

  effects: {
    // 获取值集
    *fetchValue(_, { put, call }) {
      const lovCode = {
        statusCode: 'SSLM.KPI_EVAL_STATUS',
        cycleCode: 'SSLM.KPI_EVAL_CYCLE_CUSTOM',
        appealDeadline: 'SSLM.KPI.APPEAL_DEADLINE',
        appealLimit: 'SSLM.KPI.APPEAL_LIMIT',
        levelCode: 'SSLM.KPI_EVAL_DIMENSION',
        methodCode: 'SSLM.KPI_EVAL_METHOD',
        processCode: 'SSLM.KPI_PROCESS_STATUS',
        dtlCode: 'SSLM.KPI_DTL_STATUS',
        docTypeCode: 'SSLM.EVAL.DOC_TYPE',
        lineStatusCode: 'SSLM.KPI.EVAL.LINE_STATUS',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            statusValue: res.statusCode,
            cycleValue: res.cycleCode,
            appealDeadline: res.appealDeadline,
            appealLimit: res.appealLimit,
            levelValue: res.levelCode,
            methodValue: res.methodCode,
            processValue: res.processCode,
            dtlValue: res.dtlCode,
            docTypeList: res.docTypeCode,
            lineStatus: res.lineStatusCode,
          },
        });
      }
    },
    // 获取当考评维度为“集团”的时候的维度值
    *fetchGroupDimensionValue(_, { put, call }) {
      const res = getResponse(yield call(fetchGroupDimensionValue));
      if (res) {
        const valueData = res.content || [];
        yield put({
          type: 'updateState',
          payload: {
            groupDimensionValueObj: valueData[0],
          },
        });
      }
    },
    /**
     * 汇总页面查询请求
     */
    *search({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(docManageSearch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content || [],
            pagination: createPagination(res),
          },
        });
      }
    },

    /**
     * 作废行数据
     * @params {string[]} selectedRowKeys - 作废行的 key 组成的数组
     */
    *deleteRecords({ payload = {} }, { call }) {
      const res = getResponse(yield call(docManageDelete, payload));
      return res;
    },

    /**
     * 评分催办行数据
     * @params {string[]} selectedRowKeys - 评分催办行的 key 组成的数组
     */
    *scoreCuiBan({ payload = {} }, { call }) {
      const res = getResponse(yield call(docManageScoreCuiBan, payload));
      return res;
    },

    /**
     *获取档案基本信息
     *@params {object} payload - 页面/档案 id 的对象
     */
    *initial({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(initialFetch, payload));
      if (res) {
        const tableInfo = res.kpiEvalDetailLineDTOPage || {};
        const { content = [] } = tableInfo;
        const scoreDetail = content.map(item => ({ ...item, _status: 'update' }));
        yield put({
          type: 'updateState',
          payload: {
            basicInfo: res,
            scoreDetail,
            scoreDetailPagination: createPagination(tableInfo),
            granularity: res.evalGranularity,
          },
        });
      }
      return res;
    },

    /**
     *获取评分汇总 table 数据
     *
     * @params {object} payload - 页面/档案 id 的对象
     */
    *fetchScoreSum({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(scoreSumTabFetch, payload));
      if (res) {
        const tableInfo = res.kpiEvalDetailLineDTOPage || {};
        const { evalStatus } = res;
        const { content = [] } = tableInfo;
        const scoreSum = ['REJECTED', 'FINAL_COLLECTED'].includes(evalStatus)
          ? content.map(item => ({ ...item, _status: 'update' }))
          : content;
        yield put({
          type: 'updateState',
          payload: {
            scoreSum: scoreSum.map(item => ({ ...item, scoreSumId: uuid() })),
            scoreSumPagination: createPagination(tableInfo),
          },
        });
        return res;
      }
    },

    /**
     *获取参评供应商 table 数据
     *
     * @params {object} payload - 页面/档案 id 的对象
     */
    *fetchScoreVendor({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(scoreVendorTabFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scoreVendor:
              res.content.map(item => ({
                ...item,
                scoreVendorId: uuid(),
              })) || [],
            scoreVendorPagination: createPagination(res),
          },
        });
      }
    },

    /**
     *获取评分人信息 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchEvaluationPerson({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(evaluationPersonFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res,
            modalPagination: false,
          },
        });
      }
      return res;
    },

    /**
     *获取评分状态 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchEvaluationStatus({ payload }, { put, call }) {
      const res = getResponse(yield call(evaluationPersonFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res,
            modalPagination: false,
          },
        });
      }
      return res;
    },

    /**
     *获取评分明细 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchModalScoreDetail({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(modalScoreDetailFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res,
            modalPagination: false,
          },
        });
      }
      return res;
    },

    /**
     *获取采购品类明细 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchProductDetail({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(productDetailFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res.content,
            modalPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    /**
     *获取操作记录 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchActivityLog({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(activityLogFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res.content,
            modalPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    /**
     *保存此新建的文档
     *@params {object} payload - 新建文档各个字段组成的对象
     */
    *saveInfo({ payload = {} }, { call }) {
      const res = getResponse(yield call(saveThisDoc, payload));
      return res;
    },

    /**
     *保存新建或修改的评分人信息
     *
     * @param {object} payload - 新建或修改的评分人信息 和页面 id
     * @param {*} { call }
     */
    *addEvaluationPerson({ payload = {} }, { call }) {
      const res = getResponse(yield call(saveEvaluationPerson, payload));
      return res;
    },

    /**
     * 执行评分
     */
    *executeScore({ payload = {} }, { call }) {
      const res = getResponse(yield call(executeScore, payload));
      return res;
    },

    /**
     * 重新计算
     */
    *recalculate({ payload = {} }, { call }) {
      const res = getResponse(yield call(recalculate, payload));
      return res;
    },

    /**
     * 汇总统计check
     */
    *sumStatisticsCheck({ payload = {} }, { call }) {
      const res = getResponse(yield call(sumStatisticsCheck, payload));
      return res;
    },

    /**
     * 汇总统计
     */
    *sumStatistics({ payload = {} }, { call }) {
      const res = getResponse(yield call(sumStatistics, payload));
      return res;
    },

    /**
     * 发布
     */
    *publish({ payload = {} }, { call }) {
      const res = getResponse(yield call(publish, payload));
      return res;
    },

    /**
     * 考评模版查询
     */
    *queryEvaluationAuto({ evalTplId }, { call, put }) {
      const response = getResponse(yield call(queryEvaluationAuto, evalTplId));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            EvaluationAutoData: response,
          },
        });
      }
      return response || {};
    },

    /**
     * 查询供应商信息
     * @param templateId
     * @param params
     * @param call
     * @returns {Generator<*, {pagination: *, dataSource: (*|*[])}, *>}
     */
    *queryEvalTplScopeSupplierList({ params }, { call }) {
      const response = getResponse(yield call(queryEvalTplScopeSupplierList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    /**
     * 获取供应商生命周期值集的值
     * @param payload
     * @param call
     * @param put
     * @returns {Generator<*, void, *>}
     */
    *querylifeCycleStageCode({ payload }, { call, put }) {
      const { lovCode, params } = payload;
      const response = yield call(queryUnifyIdpValue, lovCode, params);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [lovCode]: response,
          },
        });
      }
    },

    /**
     * 查询品类、物料信息
     * @param scopeId
     * @param params
     * @param call
     * @returns {Generator<*, {selectedRows: [], dataSource: (*|*[])}, *>}
     */
    *queryEvalTplScopeCategoryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryScopeCategoryList, payload));
      const selectedRows = [];
      const selectedRowKeys = [];
      let result = {};
      function getSelectedRows(collection = []) {
        collection.forEach(n => {
          if (n.evalLineId !== null) {
            selectedRowKeys.push(n.categoryId);
            selectedRows.push(n);
          }
          if (!isEmpty(n.children)) {
            getSelectedRows(n.children);
          }
        });
      }
      if (Array.isArray(response)) {
        getSelectedRows(response);
        result = {
          dataSource: response || [],
          selectedRows,
          selectedRowKeys,
        };
        yield put({
          type: 'updateState',
          payload: {
            evalTplScopeCategoryList: result,
          },
        });
      }
      return result;
    },

    /**
     * 查询供应商物料信息
     * @param payload
     * @param call
     * @param put
     * @returns {Generator<*, void, *>}
     */
    *queryScopeItemList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryScopeItemList, payload));
      const selectedRows = [];
      const selectedRowKeys = [];
      let result = {};
      if (response) {
        if (Array.isArray(response.content)) {
          response.content.forEach(item => {
            if (!isNil(item.evalLineId)) {
              selectedRowKeys.push(item.itemId);
              selectedRows.push(item);
            }
          });
        }
        result = {
          dataSource: response.content || [],
          pagination: createPagination(response || {}),
          selectedRows,
          selectedRowKeys,
        };
        yield put({
          type: 'updateState',
          payload: {
            evalTplScopeItemList: result,
          },
        });
      }
      return result;
    },

    /**
     * 保存参评供应商行信息
     * @param payload
     * @param call
     * @returns {Generator<*, *, *>}
     */
    *saveEvalTplScopeSupplierList({ payload }, { call }) {
      const response = getResponse(yield call(saveEvalTplScopeSupplierList, payload));
      return response;
    },

    /**
     * 删除参评供应商行信息
     * @param payload
     * @param call
     * @returns {Generator<*, void, *>}
     */
    *deleteEvalTplScopeSupplierList({ payload }, { call }) {
      const responce = getResponse(yield call(deleteEvalTplScopeSupplierList, payload));
      return responce;
    },

    *saveCoreDetail({ payload }, { call }) {
      const responce = getResponse(yield call(saveCoreDetail, payload));
      return responce;
    },

    *saveScoreSum({ payload }, { call }) {
      const responce = getResponse(yield call(saveScoreSum, payload));
      return responce;
    },

    *querySuggestedStrategy(_, { call, put }) {
      const response = yield call(queryUnifyIdpValue, 'SSLM.SUGGESTED_STRATEGIES', { tenantId });
      yield put({
        type: 'updateState',
        payload: {
          suggestedStrategy: response,
        },
      });
    },
    // 退回评分
    *handleBackScore({ payload }, { call }) {
      const responce = getResponse(yield call(handleBackScore, payload));
      return responce;
    },
    // 查询评分状态明细
    *queryEvaluationStatus({ payload }, { put, call }) {
      const response = getResponse(yield call(queryEvaluationStatus, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ParamValueList: response.content,
            ParamValuePagination: createPagination(response),
          },
        });
      }
      return response;
    },
    /**
     * 提交审批
     */
    *handleSubmit({ payload = {} }, { call }) {
      const res = getResponse(yield call(handleSubmit, payload));
      return res;
    },
    /**
     * 提交新建审批
     */
    *submitNewApproval({ payload = {} }, { call }) {
      const res = getResponse(yield call(submitNewApproval, payload));
      return res;
    },
    /**
     * 查询参评供应商所有数据
     */
    *queryAllSupplier({ payload = {} }, { call }) {
      const res = getResponse(yield call(queryAllSupplier, payload));
      return res;
    },
    /**
     * 查询用户默认信息
     */
    *getUserDefaultMsg(_, { call }) {
      const res = getResponse(yield call(getUserDefaultMsg, _));
      return res;
    },
    // 退回评分
    *backScore({ payload }, { call }) {
      const res = getResponse(yield call(backScore, payload));
      return res;
    },
    // 查询质量整改单据头ID
    *queryProblemHeader({ payload }, { call }) {
      const res = getResponse(yield call(queryProblemHeader, payload));
      return res;
    },
    // 查询供应商申诉情况
    *queryComplaintSituation({ payload }, { call, put }) {
      const res = getResponse(yield call(queryComplaintSituation, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            complaintDataSource: res.content.map(n => ({ ...n, _status: 'update' })),
            complaintPagination: createPagination(res),
          },
        });
      }
    },
    // 采购方保存供应商申诉
    *saveComplaint({ payload }, { call }) {
      const res = getResponse(yield call(saveComplaint, payload));
      return res;
    },
    // 采购方发布供应商申诉
    *publishComplaint({ payload }, { call }) {
      const res = getResponse(yield call(publishComplaint, payload));
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },

    addTableData(state, { payload }) {
      const { scoreVendor, scoreVendorPagination } = state;
      return {
        ...state,
        scoreVendor: [...payload, ...scoreVendor],
        scoreVendorPagination: addItemsToPagination(
          payload.length,
          scoreVendor.length,
          scoreVendorPagination
        ),
      };
    },

    updateScoreVendorTableData(state, { payload }) {
      const { scoreVendor, scoreVendorPagination } = state;
      return {
        ...state,
        scoreVendor: [...payload],
        scoreVendorPagination: addItemsToPagination(
          payload.length,
          scoreVendor.length,
          scoreVendorPagination
        ),
      };
    },

    updateTableData(state, { payload }) {
      const { scoreVendor } = state;
      const { granularity, activeRows = {}, data } = payload;
      for (const key in scoreVendor) {
        if (scoreVendor[key].supplierNum === activeRows.supplierNum) {
          scoreVendor[key] = {
            ...scoreVendor[key],
            [granularity === 'SU+CA' ? 'categoryVOS' : 'itemVOS']: data,
            _status: 'update',
          };
          break;
        }
      }
      return {
        ...state,
        scoreVendor,
      };
    },
  },
};
