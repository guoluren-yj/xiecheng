/**
 * model - 流程指定
 * @date: 2019-07-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';

import { getResponse, createPagination } from 'utils/utils';
import {
  queryProcessConfig,
  saveProcessConfig,
  deleteProcessConfig,
  queryVariableConfig,
  saveVariableConfig,
  deleteVariableConfig,
  queryRuleConfig,
  saveRuleConfig,
  deleteRuleConfig,
} from '@/services/processAppointServices';
import { queryMapIdpValue, queryIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'processAppoint',
  state: {
    processAppointList: [], // 流程指定列表
    processAppointPagination: {}, // 流程指定分页参数
    variableConfigList: [], // 变量配置列表
    variableConfigPagination: {}, // 变量配置列表分页
    variableLovList: [], // 流程指定变量LOV列表
    ruleConfigList: [], // 规则配置列表
    ruleConfigPagination: {}, // 规则配置列表分页
    valueSetViewList: [], // 值集视图列表
    code: [], // 值集列表
    startupRuleTypes: [], // 启动规则类型
  },
  effects: {
    // 获取字段类型
    *init({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    *getStartupRuleType({ payload }, { call, put }) {
      const { code } = payload;
      const result = getResponse(yield call(queryIdpValue, code));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            startupRuleTypes: result,
          },
        });
      }
    },
    // 流程指定查询
    *queryProcessConfig({ payload }, { call, put }) {
      const result = getResponse(yield call(queryProcessConfig, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            processAppointList: result.content,
            processAppointPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 流程指定保存
    *saveProcessConfig({ payload }, { call }) {
      const result = getResponse(yield call(saveProcessConfig, payload));
      return result;
    },

    // 流程指定删除
    *deleteProcessConfig({ payload }, { call }) {
      const result = getResponse(yield call(deleteProcessConfig, payload));
      return result;
    },

    // 变量配置查询
    *queryVariableConfig({ payload }, { call, put }) {
      const result = getResponse(yield call(queryVariableConfig, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            variableConfigList: result.content,
            variableConfigPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 变量配置保存
    *saveVariableConfig({ payload }, { call }) {
      const result = getResponse(yield call(saveVariableConfig, payload));
      return result;
    },

    // 变量配置删除
    *deleteVariableConfig({ payload }, { call }) {
      const result = getResponse(yield call(deleteVariableConfig, payload));
      return result;
    },

    // 规则配置查询
    *queryRuleConfig({ payload }, { call, put }) {
      const result = getResponse(yield call(queryRuleConfig, payload));

      /**
       * 将返回的二维数据源转为一维
       * 如果不放在model中处理，新建和编辑行时
       * 行内无$form导致getEditTableData是既不做校验，也获取不到数据
       */
      if (result) {
        const dataSource = result.content.map((item) => {
          const {
            procAssignRuleConfId,
            procDefId,
            name,
            remark,
            defaultSubmitEmployee,
            defaultSubmitEmployeeName,
            procAssignRuleVarDTOS = [],
            objectVersionNumber = null,
          } = item;
          const obj = {
            name,
            remark,
            procDefId,
            defaultSubmitEmployee,
            defaultSubmitEmployeeName,
            procAssignRuleConfId,
            objectVersionNumber,
          };
          // 列转行
          if (!isEmpty(procAssignRuleVarDTOS)) {
            procAssignRuleVarDTOS.forEach((e) => {
              obj[e.variableName] = e.variableValue;
              obj[`${e.variableName}Desc`] = e.variableValueDesc;
            });
          }
          return obj;
        });

        yield put({
          type: 'updateState',
          payload: {
            ruleConfigList: dataSource,
            ruleConfigPagination: createPagination(result),
          },
        });
      }
    },

    // 规则配置保存
    *saveRuleConfig({ payload }, { call }) {
      const result = getResponse(yield call(saveRuleConfig, payload));
      return result;
    },

    // 规则配置删除
    *deleteRuleConfig({ payload }, { call }) {
      const result = getResponse(yield call(deleteRuleConfig, payload));
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
