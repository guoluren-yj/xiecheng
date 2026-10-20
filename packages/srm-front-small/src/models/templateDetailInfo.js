import { getResponse } from 'utils/utils';
import {
  fetchDetail,
  editDimension,
  handleFieldParams,
  deleteConfig,
  delteLovAssociatService,
} from '@/services/templateDetail';

export default {
  namespace: 'templateDetailInfo',
  state: {},
  effects: {
    *queryDetail({ payload }, { call }) {
      return getResponse(yield call(fetchDetail, payload));
    },
    *saveDimensionData({ payload }, { call }) {
      return getResponse(yield call(editDimension, { ...payload }));
    },
    *delteFieldParams({ payload }, { call }) {
      return getResponse(yield call(handleFieldParams, payload));
    },
    *delteLovAssociat({ payload }, { call }) {
      return getResponse(yield call(delteLovAssociatService, payload));
    },
    *delteConfigSet({ payload }, { call }) {
      return getResponse(yield call(deleteConfig, payload));
    },
  },
  reducers: {},
};
