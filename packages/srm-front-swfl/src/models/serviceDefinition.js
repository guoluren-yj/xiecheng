import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import {
  fetchList,
  fetchDetail,
  createService,
  updateService,
  queryParams,
  updateParam,
  deleteService,
  fetchVariable,
  syncParam,
  getApprovalGroupList,
  getApproverList,
  validateBeforeSave,
} from '../services/serviceDefinitionService';

export default {
  namespace: 'serviceDefinition',

  state: {
    serviceList: [], // 服务列表
    serviceDetail: {},
    pagination: {}, // 分页
    parameterList: [], // 参数列表
    serviceModeList: [], // 服务方式值集
    serviceTypeList: [], // 服务类别值集
    processCategoryList: [], // 流程分类
    paramterSourceList: [], // 参数来源值集
    variableList: [], // 流程变量
  },

  effects: {
    *init({ payload }, { call, put }) {
      const mapValue = yield call(queryMapIdpValue, {
        serviceTypeList: 'HWFP.SERVICE_TYPE',
        serviceModeList: 'HWFP.SERVICE_MODE',
        serviceOperatorList: 'HWFP.PROCESS_OPERATOR',
        serviceEnableList: 'HPFM.PROCESS_DOCUMENT_SOURCE',
      });
      const processCategoryList = yield call(queryUnifyIdpValue, 'HWFP.PROCESS_CATEGORY', payload);
      const result = getResponse(mapValue);
      const processResult = getResponse(processCategoryList);
      if (result) {
        const {
          serviceTypeList = [],
          serviceModeList = [],
          serviceOperatorList = [],
          serviceEnableList = [],
        } = result;
        yield put({
          type: 'updateState',
          payload: {
            serviceTypeList,
            serviceModeList,
            serviceOperatorList,
            processCategoryList: processResult,
            serviceEnableList,
          },
        });
      }
    },

    *initParamter(_, { call, put }) {
      const paramterSourceList = yield call(queryUnifyIdpValue, 'HWFP.SERVICE.PARAMETER_SOURCE');
      const result = getResponse(paramterSourceList);
      if (result) {
        yield put({
          type: 'updateState',
          payload: { paramterSourceList },
        });
      }
    },

    // 列表数据
    *fetchList({ payload }, { call, put }) {
      const res = yield call(fetchList, parseParameters(payload));
      const resList = getResponse(res);
      if (resList) {
        yield put({
          type: 'updateState',
          payload: {
            serviceList: resList.content,
            pagination: createPagination(resList),
          },
        });
      }
      return resList;
    },

    // 详情数据
    *fetchDetail({ payload }, { call, put }) {
      const res = yield call(fetchDetail, payload);
      const detail = getResponse(res);
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            serviceDetail: detail,
            parameterList: detail.parameterList,
          },
        });
      }
      return detail;
    },

    // 获取流程变量
    *fetchVariable({ payload }, { call, put }) {
      const res = yield call(fetchVariable, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            variableList: data,
          },
        });
      }
      return data;
    },

    *queryParams({ payload }, { call, put }) {
      const res = yield call(queryParams, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            parameterList: result.map((item) => {
              const { _token, objectVersionNumber, parameterId, ...other } = item;
              return { interfaceParameterId: parameterId, ...other };
            }),
          },
        });
      }
    },

    *createService({ payload }, { call }) {
      const res = yield call(createService, payload);
      return getResponse(res);
    },

    *updateService({ payload }, { call }) {
      const res = yield call(updateService, payload);
      return getResponse(res);
    },

    *deleteService({ payload }, { call }) {
      const res = yield call(deleteService, payload);
      return getResponse(res);
    },

    *updateParam({ payload }, { call }) {
      const res = yield call(updateParam, payload);
      return getResponse(res);
    },
    *syncParam({ payload }, { call }) {
      const res = yield call(syncParam, payload);
      return getResponse(res);
    },
    *getApprovalGroupList({ payload }, { call }) {
      const res = yield call(getApprovalGroupList, payload);
      return getResponse(res);
    },
    *getApproverList({ payload }, { call }) {
      const res = yield call(getApproverList, payload);
      return getResponse(res);
    },
    *validateBeforeSave({ payload }, { call }) {
      const res = yield call(validateBeforeSave, payload);
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
