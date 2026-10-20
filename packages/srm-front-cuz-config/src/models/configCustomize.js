import { getResponse } from 'utils/utils';
import {
  queryTree,
  queryGroup,
  queryUnitDetails,
  queryCode,
  queryModule,
  saveFieldIndividual,
  deleteFieldIndividual,
  queryFieldMapping,
  queryConditions,
  queryRelatedUnits,
  saveHeaderIndividual,
  querySameModelUnit,
  copyFiled,
  saveUnitConfigHeader,
} from '@/services/customizeConfigService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'configCustomizeCuz',
  state: {
    treeData: [],
    unitGroup: [],
    currentUnit: {
      config: {},
    },
    lineData: [],
    aggregationGroup: [],
    unitAlias: [],
    moduleList: [],
    codes: {
      dateFormat: [],
      whereOptions: [],
      renderOptions: [],
      fieldWidget: [],
      fieldBtnWidget: [],
      custType: [],
      custTypeObj: {},
      fieldType: [],
      fixed: [],
      fixedObj: {},
      fieldWidgetObj: {},
      unitType: [],
      unitTypeObj: {},
      condOptions: [],
    },

  },
  effects: {
    *queryCodes({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        const fixedObj = {};
        const fieldWidgetObj = {};
        const unitTypeObj = {};
        const custTypeObj = {};
        res.fixed.forEach(i => {
          fixedObj[i.value] = i.meaning;
        });
        res.fieldWidget.forEach(i => {
          fieldWidgetObj[i.value] = i.meaning;
        });
        res.fieldBtnWidget.forEach(i => {
          fieldWidgetObj[i.value] = i.meaning;
        });
        res.unitType.forEach(i => {
          unitTypeObj[i.value] = i.meaning;
        });
        res.custType.forEach(i => {
          custTypeObj[i.value] = i.meaning;
        });
        yield put({
          type: 'updateState',
          payload: {
            codes: {
              ...res,
              fixedObj,
              fieldWidgetObj,
              unitTypeObj,
              custTypeObj,
            },
          },
        });
      }
    },
    *queryTree({ payload }, { call, put }) {
      const res = getResponse(yield call(queryTree, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            treeData: res,
          },
        });
        return res;
      }
    },
    *queryCode({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCode, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { codes: res },
        });
      }
    },
    *queryGroup({ payload }, { call, put }) {
      const res = getResponse(yield call(queryGroup, payload));
      let unitGroup;
      if (res) {
        unitGroup = res.map(group=>({
          ...group,
          units: (group.units || []).filter(unit=>unit.enableFlag),
        })).filter(group=>group.units.length>0);
        unitGroup.forEach(group => {
          if (group.units) {
            group.units.sort((p, n) =>
              (p.unitName || '').localeCompare(n.unitName || '', 'zh-Hans-CN')
            );
          }
        });
        unitGroup.sort((p, n) => (p.groupName || '').localeCompare(n.groupName || '', 'zh-Hans-CN'));
        yield put({
          type: 'updateState',
          payload: { unitGroup },
        });
      }
      return unitGroup;
    },
    *queryUnitDetails({ payload }, { call, put }) {
      const res = getResponse(yield call(queryUnitDetails, payload));
      if (res) {
        const currentUnit = res.unit || { config: {} };
        const lineData = res.configFields || [];
        yield put({
          type: 'updateState',
          payload: {
            currentUnit,
            lineData,
            aggregationGroup: lineData.filter(i => i.aggregationFlag),
            unitAlias: res.unitAlias || [],
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            currentUnit: { config: {} },
            lineData: [],
            aggregationGroup: [],
            unitAlias: [],
          },
        });
      }
      return res;
    },
    *queryModule({ payload }, { call, put }) {
      const res = getResponse(yield call(queryModule, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { moduleList: res },
        });
      }
    },
    *queryFieldMapping({ payload }, { call }) {
      return getResponse(yield call(queryFieldMapping, payload));
    },
    *queryConditions({ payload }, { call }) {
      return getResponse(yield call(queryConditions, payload));
    },
    *queryRelatedUnits({ payload }, { call }) {
      return getResponse(yield call(queryRelatedUnits, payload));
    },
    *saveFieldIndividual({ payload }, { call }) {
      return getResponse(yield call(saveFieldIndividual, payload));
    },
    *saveHeaderIndividual({ payload }, { call }) {
      return getResponse(yield call(saveHeaderIndividual, payload));
    },
    *deleteFieldIndividual({ payload }, { call }) {
      return getResponse(yield call(deleteFieldIndividual, payload));
    },
    // *saveSelfValidator({ payload }, { call }) {
    //   return getResponse(yield call(saveSelfValidator, payload));
    // },
    *fetchSameModelUnit({ params }, { call }) {
      return getResponse(yield call(querySameModelUnit, params));
    },
    *copyFiled({ payload }, { call }) {
      return getResponse(yield call(copyFiled, payload));
    },
    *saveUnitConfigHeader({ payload }, { call }) {
      return getResponse(yield call(saveUnitConfigHeader, payload));
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
