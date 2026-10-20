import { getResponse } from 'utils/utils';
import {
  unlockStatus,
  publishStatus,
  chnageIsOpen,
  fetchOperationRcord,
  cloneTemplate,
  queryChildNode,
  changeNode,
  enabledServices,
  fetchCommonConfig,
} from '@/services/cartTemplateDefinitionService';

export default {
  namespace: 'cartDefinition',
  state: {
    templateStyle: 'STANDARD',
  },
  effects: {
    *unlockLine({ payload }, { call }) {
      return getResponse(yield call(unlockStatus, payload));
    },
    *publishLine({ payload }, { call }) {
      return getResponse(yield call(publishStatus, payload));
    },
    *handleEdit({ payload }, { call }) {
      const response = yield call(chnageIsOpen, { ...payload });
      return getResponse(response);
    },
    *handleEnabled({ payload }, { call }) {
      const response = yield call(enabledServices, { ...payload });
      return getResponse(response);
    },
    *queryOperationRecord({ payload }, { call }) {
      const response = yield call(fetchOperationRcord, { ...payload });
      return getResponse(response);
    },
    *copyRecordValue({ payload }, { call }) {
      return getResponse(yield call(cloneTemplate, { ...payload }));
    },
    *fetchChildNode({ payload }, { call }) {
      return getResponse(yield call(queryChildNode, { ...payload }));
    },
    *saveCheckedNode({ payload }, { call }) {
      return getResponse(yield call(changeNode, { ...payload }));
    },
    *checkCommonConfig(_, { call, put }){
      const response = getResponse(yield call(fetchCommonConfig));
      if(response){
        yield put({
          type: 'updateState',
          payload: {
            showOpenCart: !response.oldTenantFlag,
          },
        });
      }
      return response;
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
