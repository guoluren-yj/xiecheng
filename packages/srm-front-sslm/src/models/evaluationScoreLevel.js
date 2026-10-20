/**
 * ScoreLevel - 评分等级 - model
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import {
  fetchTmplLevel,
  fetchIndexScoreTmplLevel,
  addLevel,
  fetchTmplInfo,
  fetchTmplInfoHistory,
  queryIndicatorsListTree,
} from '@/services/evaluationTemplateService';
import { isEmpty } from 'lodash';

const tenantId = getCurrentOrganizationId();

function assignListTree(collection = [], parentIndicatorName, parentPath = []) {
  return collection.map(n => {
    const item = n;
    item.parentPath = [].concat(parentPath);
    if (parentIndicatorName) {
      item.parentIndicatorName = parentIndicatorName;
      item.parentPath.push(item.parentIndicatorId);
    }
    if (!isEmpty(item.children)) {
      item.children = assignListTree(item.children, item.indicatorName, item.parentPath);
      item.isNoEnableChildren = !item.children.some(o => o.enabledFlag === 1);
    } else {
      item.isNoChildren = true;
      item.isNoEnableChildren = true;
    }

    return item;
  });
}

export default {
  namespace: 'scoreLevel',

  state: {
    code: {},
    stageList: [], // 阶段配置集合
    tmplInfo: {},
    templateInfo: {},
  },
  effects: {
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      const stageList = getResponse(
        yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE', { tenantId })
      );
      if (res) {
        yield put({
          type: 'updateState',
          payload: { code: { ...res, stageList } },
        });
      }
    },
    *fetchTmplInfo({ payload }, { call, put }) {
      const response = yield call(fetchTmplInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            tmplInfo: {
              ...data?.content[0],
              templateCode: data?.content[0]?.evalTplCode || null,
              templateName: data?.content[0]?.evalTplName || null,
              upGradeStrategyFlag: data?.content[0]?.upGradeStrategyFlag
                ? String(data?.content[0]?.upGradeStrategyFlag)
                : null,
            },
            templateInfo: data?.content[0] || {},
          },
        });
      }
      return {
        totalLevelIsChooseUpGrade: data?.content[0]?.totalLevelIsChooseUpGrade || null,
        indicatorLevelIsChooseUpGrade: data?.content[0]?.indicatorLevelIsChooseUpGrade || null,
      };
    },
    *fetchTmplInfoHistory({ payload }, { call, put }) {
      const response = yield call(fetchTmplInfoHistory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            tmplInfo: {
              ...data?.content[0],
              templateCode: data?.content[0]?.evalTplCode || null,
              templateName: data?.content[0]?.evalTplName || null,
              upGradeStrategyFlag: data?.content[0]?.upGradeStrategyFlag
                ? String(data?.content[0]?.upGradeStrategyFlag)
                : null,
            },
            templateInfo: data?.content[0] || {},
          },
        });
      }
      return {
        totalLevelIsChooseUpGrade: data?.content[0]?.totalLevelIsChooseUpGrade || null,
        indicatorLevelIsChooseUpGrade: data?.content[0]?.indicatorLevelIsChooseUpGrade || null,
      };
    },
    *fetchScoreLevel({ payload }, { call }) {
      const response = getResponse(yield call(fetchTmplLevel, payload));
      return response;
    },
    *fetchIndexScoreLevel({ payload }, { call }) {
      const response = getResponse(yield call(fetchIndexScoreTmplLevel, payload));
      return response;
    },
    *addScoreLevel({ payload }, { call }) {
      const response = yield call(addLevel, payload);
      return getResponse(response);
    },
    *queryIndicatorsListTree({ payload }, { call }) {
      const response = getResponse(yield call(queryIndicatorsListTree, payload));
      return assignListTree(response) || [];
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
