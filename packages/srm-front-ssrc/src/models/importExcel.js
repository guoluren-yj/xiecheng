import React from 'react';
import { isObject, isString } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  queryPrefixPatch,
  uploadExcel,
  validateData,
  queryStatus,
  loadDataSource,
  importData,
} from '@/services/importExcel';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}
/**
 * namespace中通过不同的key值解决通用组件串数据的问题
 */
export default {
  namespace: 'importExcel',
  state: {
    namespace: {
      default: {
        prefixPatch: '', // 服务前缀，如/ssrc
        batch: '', // 批次号，上传数据后生成
        /*
         *当前数据状态。
         *涵盖上传中-完成，核验中-完成，导入中-完成。
         *状态1标识上传请求完成，但未收到服务器返回数据。
         */
        status: '',
        dataSource: [], // 当前处理的数据
        errData: [], // 当前dataSource中的错误行，并非全部
        pagination: {}, // 分页控制
      },
    },
  },
  effects: {
    /**
     * 状态查询，获取对应模板编码的服务前缀
     * @param {Object} payload {uniqueKey, organizationId, templateCode}
     */
    *queryPrefixPatch({ payload }, { call, put }) {
      const { uniqueKey = 'default', ...others } = payload;
      const res = yield call(queryPrefixPatch, others);
      const parsedRes = getResponse(res);
      if (parsedRes) {
        yield put({
          type: 'updateState',
          payload: {
            uniqueKey,
            prefixPatch: res.prefixPatch,
            batch: '',
            status: '',
            dataSource: [],
            errData: [],
            pagination: {},
          },
        });
      }
    },
    /**
     * 文件上传
     * @param {Object} payload {
        uniqueKey,
        organizationId,
        templateCode,
        formData,
      }
     */
    *uploadExcel({ payload }, { call, put, select }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = yield select(state => state.importExcel);
      const value = namespace[uniqueKey] || namespace.default;
      const res = yield call(uploadExcel, {
        prefixPatch: value.prefixPatch,
        ...others,
      });
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
      } else if (res) {
        notification.success({
          message: intl.get(`ssrc.common.view.message.uploadSuccess`).d('上传成功，请刷新数据'),
        });
        yield put({
          type: 'updateState',
          payload: {
            uniqueKey,
            batch: res,
            status: '1',
          },
        });
      }
    },
    /**
     * 数据校验
     * @param {Object} payload {
        uniqueKey,
        organizationId,
        templateCode,
        ...extraParams,
      },
     */
    *validateData({ payload }, { call, put, select }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = yield select(state => state.importExcel);
      const value = namespace[uniqueKey] || namespace.default;
      if (value.batch) {
        const res = yield call(validateData, {
          prefixPatch: value.prefixPatch,
          batch: value.batch,
          ...others,
        });
        const validateRes = getResponse(res);
        if (validateRes) {
          yield put({
            type: 'updateState',
            payload: {
              uniqueKey,
              status: validateRes.status,
            },
          });
          notification.success({
            message: intl.get(`ssrc.common.view.message.startCheck`).d('开始校验，请稍后刷新数据'),
          });
        }
      } else {
        notification.error({
          description: intl
            .get(`ssrc.common.view.message.modelclientPath`)
            .d('模板客户端路径前缀未配置'),
        });
      }
    },
    /**
     * 查询当前数据状态，不包含数据本身
     * @param {Object} payload {
        uniqueKey,
        organizationId,
        templateCode,
      }
     */
    *queryStatus({ payload }, { call, put, select }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = yield select(state => state.importExcel);
      const value = namespace[uniqueKey] || namespace.default;
      const res = yield call(queryStatus, {
        prefixPatch: value.prefixPatch,
        batch: value.batch,
        ...others,
      });
      const statusRes = getResponse(res);
      if (statusRes) {
        yield put({
          type: 'updateState',
          payload: {
            description: (
              <span>
                {intl.get(`ssrc.common.view.message.curDataStatus`).d('当前数据状态')}:
                {res.statusMeaning}
              </span>
            ),
            uniqueKey,
            status: statusRes.status,
          },
        });
        notification.success({
          message: intl.get(`ssrc.common.view.message.refreshSuccess`).d('刷新成功'),
          description: (
            <span>
              {intl.get(`ssrc.common.view.message.curDataStatus`).d('当前数据状态')}:
              {res.statusMeaning}
            </span>
          ),
        });
      }
    },
    /**
     * 查询数据
     * @param {Object} payload {
        uniqueKey,
        organizationId,
        templateCode,
      }
     */
    *loadDataSource({ payload }, { call, put, select }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = yield select(state => state.importExcel);
      const value = namespace[uniqueKey] || namespace.default;
      const res = yield call(loadDataSource, {
        prefixPatch: value.prefixPatch,
        batch: value.batch,
        ...others,
      });
      const dataSource = getResponse(res);
      if (dataSource) {
        const { content = [] } = dataSource;
        const errData = [];
        const _dataSource = [];
        content.forEach(item => {
          if (['IMPORT_FAILED', 'VALID_FAILED', 'ERROR'].includes(item._dataStatus)) {
            errData.push({
              ...JSON.parse(item._data),
              errorMsg: item._errorMsg,
              _lineNo: errData.length,
            });
          }
          _dataSource.push({
            ...JSON.parse(item._data),
            lineNo: _dataSource.length,
          });
        });
        yield put({
          type: 'updateState',
          payload: {
            uniqueKey,
            dataSource: _dataSource,
            pagination: createPagination(dataSource),
            errData,
          },
        });
      }
    },
    /**
     * 导入正式表
     * @param {Object} payload {
        uniqueKey,
        organizationId,
        templateCode,
        ...extraParams,
      }
     */
    *importData({ payload }, { call, put, select }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = yield select(state => state.importExcel);
      const value = namespace[uniqueKey] || namespace.default;
      const res = yield call(importData, {
        prefixPatch: value.prefixPatch,
        batch: value.batch,
        ...others,
      });
      const importDataRes = getResponse(res);
      if (importDataRes) {
        yield put({
          type: 'updateState',
          payload: {
            uniqueKey,
            status: importDataRes.status,
          },
        });
        notification.success({
          message: intl
            .get(`ssrc.common.view.message.currentexportData`)
            .d('正在导入，请稍后刷新数据'),
        });
      }
      return importDataRes;
    },
  },
  reducers: {
    updateState(state, { payload }) {
      const { uniqueKey = 'default', ...others } = payload;
      const { namespace } = state;
      const preValue = namespace[uniqueKey] || namespace.default;
      return {
        namespace: {
          ...namespace,
          [uniqueKey]: {
            ...preValue,
            ...others,
          },
        },
      };
    },
    deleteNamespace(state, { payload }) {
      const { uniqueKey = 'default' } = payload;
      const { namespace } = state;
      const preValue = namespace[uniqueKey];
      if (preValue && uniqueKey !== 'default') {
        delete namespace[uniqueKey];
      }
      return {
        namespace,
      };
    },
  },
};
