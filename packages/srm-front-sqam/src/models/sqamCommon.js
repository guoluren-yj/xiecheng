// import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse, createPagination } from 'utils/utils';
import { fetchOperationRecord, approveHistory } from '@/services/sqamCommonService';
import { queryUnifyIdpValue } from 'services/api';
import { isEmpty, isArray } from 'lodash';
import { valueMapMeaning } from 'utils/renderer';
import intl from 'utils/intl';

export default {
  namespace: 'sqamCommon',
  state: {
    changeItem: [], // 值集
    operationRecordList: [], // 操作记录
    operationRecordPagination: {}, // 操作记录分页参数
    approveHistoryList: [],
  },
  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const changeItem = getResponse(yield call(queryUnifyIdpValue, 'SQAM.RECORD.FIELD'));
      yield put({
        type: 'updateState',
        payload: {
          changeItem,
        },
      });
    },
    *fetchOperationRecord({ payload }, { call, put, select }) {
      const sqamCommon = yield select((state) => state.sqamCommon);
      const { changeItem = [] } = sqamCommon;
      const result = getResponse(yield call(fetchOperationRecord, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: result.content.map((item) => {
              if (item.claimFormChangeRecords && !isEmpty(item.claimFormChangeRecords)) {
                const newValues = [];
                const oldValues = [];
                item.claimFormChangeRecords.forEach((val) => {
                  let formatOldValue = null;
                  let formatNewValue = null;
                  const numberArray = [
                    'taxRate',
                    'quantity',
                    'unitPrice',
                    'lineAmount',
                    'taxIncludedLineAmount',
                  ];
                  const flagArray = ['taxFlag'];
                  const oldItem = `${valueMapMeaning(changeItem, val.changeFieldName)} ${
                    formatOldValue || val.oldValue
                  }`;
                  const newItem = `${valueMapMeaning(changeItem, val.changeFieldName)} ${
                    formatNewValue || val.newValue
                  }`;
                  if (numberArray.includes(val.changeFieldName)) {
                    formatOldValue = parseFloat(val.oldValue).toFixed(2);
                    formatNewValue = parseFloat(val.newValue).toFixed(2);
                  } else if (flagArray.includes(val.changeFieldName)) {
                    formatOldValue =
                      val.oldValue === '1'
                        ? intl.get('sqam.common.model.8d.yes').d('是')
                        : intl.get('sqam.common.model.8d.no').d('否');
                    formatNewValue =
                      val.newValue === '1'
                        ? intl.get('sqam.common.model.8d.yes').d('是')
                        : intl.get('sqam.common.model.8d.no').d('否');
                  }
                  oldValues.push(
                    val.isHeaderFieldFlag
                      ? oldItem
                      : `${
                          valueMapMeaning(changeItem, 'displayLineNum') + val.displayLineNum
                        }: ${oldItem}`
                  );
                  newValues.push(
                    val.isHeaderFieldFlag
                      ? newItem
                      : `${
                          valueMapMeaning(changeItem, 'displayLineNum') + val.displayLineNum
                        }: ${newItem}`
                  );
                });
                return {
                  oldValues,
                  newValues,
                  ...item,
                };
              }
              return item;
            }),
            operationRecordPagination: createPagination(result),
          },
        });
      }
    },

    // 索赔单申诉列表数据
    *approveHistory({ payload }, { call, put }) {
      let result = yield call(approveHistory, payload);
      result = getResponse(result);
      if (result && isArray(result)) {
        yield put({
          type: 'updateState',
          payload: {
            approveHistoryList: result,
          },
        });
      }
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
