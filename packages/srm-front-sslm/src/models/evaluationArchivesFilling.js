/**
 * model - 考评档案填制
 * @date: 2019-01-02
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  querySupplierFilling,
  queryDetailData,
  saveScore,
  submitScore,
  queryLineAttachment,
  saveLineAttachment,
  deleteLineAttachment,
  onDraggerUploadRemove,
  handleGiveUpScore,
  weightSameJudge,
  transmitScorer,
  activityLogFetch,
} from '@/services/evaluationArchivesFillingService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'evaluationArchivesFilling',
  state: {
    dataSource: [], // 考评结果列表
    pagination: {}, // 分页器
    detailData: {}, // 考评档案填制详情页
    evaluationCycle: [],
    evaluationDim: [],
    archiveStatus: [],
    methodValue: [],
    detailLines: [], // 详情页行数据
    detailLinePage: {}, // 详情页行数据分页
  },
  effects: {
    // 获取考评档案填制列表
    *fetchList({ payload }, { put, call }) {
      const result = getResponse(yield call(querySupplierFilling, payload));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 获取考评档案填制详情页数据
    *fetchDetailData({ payload }, { put, call }) {
      const result = getResponse(yield call(queryDetailData, payload));
      if (!isEmpty(result)) {
        const { kpiEvalDetailLineDTOPage: list } = result;
        yield put({
          type: 'updateState',
          payload: {
            detailData: result,
            detailLines: list && list.content.map(item => ({ ...item, _status: 'update' })),
            detailLinePage: createPagination(result.kpiEvalDetailLineDTOPage),
          },
        });
        return result;
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          evaluationCycle: 'SSLM.KPI_EVAL_CYCLE',
          evaluationDim: 'SSLM.KPI_EVAL_DIMENSION',
          archiveStatus: 'SSLM.KPI_EVAL_STATUS',
          methodValue: 'SSLM.KPI_EVAL_METHOD',
          tenantId,
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
      }
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
    // 考评分数编辑保存
    *saveScore({ payload }, { call }) {
      return getResponse(yield call(saveScore, payload));
    },
    // 考评分数编辑提交
    *submitScore({ payload }, { call }) {
      return getResponse(yield call(submitScore, payload));
    },
    // 查询考评附件
    *queryLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryLineAttachment, payload));
      return res;
    },
    // 保存考评附件
    *saveLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveLineAttachment, payload));
      return res;
    },
    // 删除考评附件
    *deleteLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteLineAttachment, payload));
      return res;
    },
    // 通过url删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const res = yield call(onDraggerUploadRemove, payload);
      return getResponse(res);
    },

    // 放弃评分
    *handleGiveUpScore({ payload }, { call }) {
      const res = yield call(handleGiveUpScore, payload);
      return getResponse(res);
    },

    // 判断权重是否相同
    *weightSameJudge({ payload }, { call }) {
      const res = yield call(weightSameJudge, payload);
      return getResponse(res);
    },

    // 转交评分人
    *transmitScorer({ payload }, { call }) {
      const res = yield call(transmitScorer, payload);
      return getResponse(res);
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
