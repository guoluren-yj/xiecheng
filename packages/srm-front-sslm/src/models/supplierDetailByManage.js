/**
 * supplierDetail - 供应商360度查询 - model
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchCompanyInfo,
  fetchERPInfo,
  fetchContacts,
  fetchAddress,
  fetchBankAccount,
  fetEditedInfo,
  fetCatalog,
  fetchQuestionnaireTmpl,
  fetchDataSource,
  fetchSupplierLifeCycle,
  fetchHistoryVersionList,
  fetchOperationList,
  fetchSupplierCatagoryInfo,
  fetchSupplyCapacityListData,
  queryLineAttachment,
  queryDetailData, // 查询考评结果详情数据
  queryScoreDetail, // 获取评分明细数据
  queryEliminate, // 查询物料、品类详情数据
  fetchOuList, // OU层信息
  fetchDestinationList, // 地点层信息
  fetchLocalDestinationList, // 本地供应商地点层
  fetchPurchaseList, // 采购财务
  fetchPurchaseFormList,
  fetchAccountFreeze,
  fetchOtherInfo, // 其他信息
  fetchCompanyIdReserve,
  handlePrint,
} from '@/services/supplierDetailService';

export default {
  namespace: 'supplierDetailByManage',

  state: {
    companyInfo: {},
    ERPInfo: [],
    contactsData: [],
    addressData: [],
    bankAccountData: [],
    editedInfo: {},
    catalogData: [],
    questionnaireTmpl: [],
    tmplDataSource: {},
    lifeCycleSteps: [],
    historyPagination: {}, // 历史版本对比分页参数
    query: {},
    historyList: [],
    operationList: [],
    operationPagination: {},
    supplierCatagoryData: [], // 供应商数据
    supplyCapacityListData: [], // 供货能力清单数据
    supplierEvaluationResultData: [], // 供应商考评结果数据
    supplierEvaluationResultDataPagination: {}, // 供应商考评结果数据分页
    detailData: {}, // 考评结果详情数据
    detailLinePage: {}, // 考评结果详情页信息,
    queryEnum: {}, // 值集
    stageMsg: {}, // 申请单查看信息
    scoreDetailList: [], // 评分明细数据
    headerInfo: {}, // 申请单表格头数据
    enclosureDataSource: [], // 附件表数据
    destinationList: [], // 地点层数据
    localDestinationList: [], // 本地供应商地点层数据
    ouList: [], // OU层数据
    purchaseList: [], // 采购财务数据
    purchaseListPagination: {}, // 采购财务数据分页
    otherInfo: {}, // 其他信息
    capacityAttachmentData: [], // 供货能力清单附件行
    capacityAttachmentPagination: {}, // 供货能力清单附件行分页
  },
  effects: {
    *fetchCompanyInfo({ payload }, { call, put }) {
      const companyInfoData = yield call(fetchCompanyInfo, payload);
      const companyInfo = getResponse(companyInfoData);
      if (companyInfo) {
        yield put({
          type: 'updateState',
          payload: {
            companyInfo,
          },
        });
      }
      const ERPInfoData = yield call(fetchERPInfo, {
        supplierCompanyId: payload.supplierCompanyId,
      });
      const ERPInfo = getResponse(ERPInfoData);
      if (ERPInfo) {
        yield put({
          type: 'updateState',
          payload: {
            ERPInfo,
          },
        });
      }
      const info = {
        companyInfo,
        erpInfo: ERPInfo,
      };
      return info || {};
    },
    *fetchSupplierInfo({ payload }, { call, put, all }) {
      const [contacts, address, bankAccount] = yield all([
        call(fetchContacts, payload),
        call(fetchAddress, payload),
        call(fetchBankAccount, payload),
      ]);
      const contactsData = getResponse(contacts);
      if (contactsData) {
        yield put({
          type: 'updateState',
          payload: {
            contactsData,
          },
        });
      }
      const addressData = getResponse(address);
      if (addressData) {
        yield put({
          type: 'updateState',
          payload: {
            addressData,
          },
        });
      }
      const bankAccountData = getResponse(bankAccount);
      if (bankAccountData) {
        yield put({
          type: 'updateState',
          payload: {
            bankAccountData,
          },
        });
      }
      const info = {
        contactsData: contactsData || [],
        addressData: addressData || [],
        bankAccountData: bankAccountData || [],
      };
      return info || {};
    },
    *editedInfo({ payload }, { call, put }) {
      const response = yield call(fetEditedInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            editedInfo: data,
          },
        });
      }
      return data || {};
    },
    *fetchCatalog({ payload }, { call, put }) {
      const response = yield call(fetCatalog, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            catalogData: data,
          },
        });
      }
      return data || [];
    },
    *fetchQuestionnaireTmpl({ payload }, { call, put, all }) {
      const { supplierBasicId, ...other } = payload;
      const response = yield call(fetchQuestionnaireTmpl, other);
      const data = getResponse(response);
      let tmplDataSource = {};
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            questionnaireTmpl: data,
          },
        });
        if (data.length > 0) {
          const allRequestInterface = [];
          for (let i = 0; i < data.length; i++) {
            const requestInterface = call(fetchDataSource, {
              configName: data[i].configName,
              investgHeaderId: data[i].investgHeaderId,
              supplierBasicId,
            });
            allRequestInterface.push(requestInterface);
          }
          const resp = yield all(allRequestInterface);
          for (let i = 0; i < resp.length; i++) {
            const eachData = resp[i];
            const dataSource = getResponse(eachData);
            if (dataSource && data[i].configName) {
              yield put({
                type: 'updateTmplData',
                payload: {
                  [data[i].configName.replace(/_/g, '')]: dataSource,
                },
              });
              tmplDataSource = {
                ...tmplDataSource,
                [data[i].configName.replace(/_/g, '')]: dataSource,
              };
            }
          }
        }
      }
      const info = {
        tmplDataSource,
        questionnaireTmpl: data,
      };
      return info || {};
    },
    *fetchSupplierLifeCycle({ payload }, { call, put }) {
      const response = yield call(fetchSupplierLifeCycle, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            lifeCycleSteps: data,
          },
        });
      }
      return data || {};
    },

    /**
     * 查询供应商分类信息
     */
    *fetchSupplierCatagoryInfo({ payload }, { call, put }) {
      const supplierCatagory = yield call(fetchSupplierCatagoryInfo, payload);
      const supplierData = getResponse(supplierCatagory);
      if (supplierData) {
        yield put({
          type: 'updateState',
          payload: {
            supplierCatagoryData: supplierData.content,
          },
        });
      }
      return (supplierData || {}).content || [];
    },

    // 查询供货能力清单数据
    *fetchSupplyCapacityList({ payload }, { call, put }) {
      const supplierCatagory = yield call(fetchSupplyCapacityListData, payload);
      const supplierData = getResponse(supplierCatagory);
      if (supplierData) {
        yield put({
          type: 'updateState',
          payload: {
            supplierCapacityData: supplierData.content,
          },
        });
      }
      return (supplierData || {}).content || [];
    },

    // 查询供货能力清单行附件
    *queryLineAttachment({ payload }, { call, put }) {
      const res = getResponse(yield call(queryLineAttachment, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            capacityAttachmentData: res.content,
            capacityAttachmentPagination: createPagination(res),
          },
        });
      }
      const info = {
        capacityAttachmentData: (res || {}).content || {},
        capacityAttachmentPagination: createPagination(res),
      };
      return info || {};
    },

    // 查询采购/财务信息
    *fetchPurchaseList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPurchaseList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseList: result.content,
            purchaseListPagination: createPagination(result),
          },
        });
      }
      const info = {
        purchaseList: (result || {}).content || [],
        purchaseListPagination: createPagination(result),
      };
      return info || {};
    },
    // 查询地点层信息
    *fetchDestinationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDestinationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            destinationList: result.content,
          },
        });
      }
      return (result || {}).content;
    },
    // 查询本地供应商地点层信息
    *fetchLocalDestinationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchLocalDestinationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            localDestinationList: result,
          },
        });
      }
      return result || [];
    },
    // 查询Ou层信息
    *fetchOuList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchOuList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ouList: result.content,
          },
        });
      }
      return (result || {}).content;
    },

    /**
     * 查询考评结果详情数据
     * @param {!string} params.id - 页面数据的Id
     */
    *fetchDetailData({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDetailData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: result,
            detailLinePage: createPagination(result.kpiEvalDetailLineDTOPage),
          },
        });
      }
    },
    // 获取评分明细数据
    *fetchScoreDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(queryScoreDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetailList: result,
          },
        });
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const queryEnum = getResponse(
        yield call(queryMapIdpValue, {
          archiveStatus: 'SSLM.KPI_EVAL_STATUS',
          methodValue: 'SSLM.KPI_EVAL_METHOD',
        })
      );
      if (queryEnum) {
        yield put({
          type: 'updateState',
          payload: {
            ...queryEnum,
          },
        });
      }
    },
    // 查询品类物料详情数据
    *fetchQueryEliminate({ payload }, { call, put }) {
      const response = yield call(queryEliminate, payload);
      const data = getResponse(response);
      const { degradeHeader, degradeAttachmentLines } = data;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: degradeHeader || {},
            enclosureDataSource: degradeAttachmentLines || [],
          },
        });
      }
      return data || {};
    },

    // 查询列表
    *fetchHistoryVersionList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchHistoryVersionList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: result.content,
            historyPagination: createPagination(result),
          },
        });
      }
    },
    // 查询操作列表
    *fetchOperationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchOperationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationList: result.content,
            operationPagination: createPagination(result),
          },
        });
      }
    },
    // 查询采购/财务信息表单数据
    *fetchPurchaseFormList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPurchaseFormList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseFormList: result,
          },
        });
        return result || {};
      }
    },
    // 记账冻结/取消记账冻结
    *fetchAccountFreeze({ payload }, { call }) {
      const result = getResponse(yield call(fetchAccountFreeze, payload));
      return result;
    },
    // 查询其他信息
    *fetchOtherInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchOtherInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            otherInfo: result,
          },
        });
      }
      return result || {};
    },
    // 查询采购商Lov数据
    *fetchCompanyIdReserve({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchCompanyIdReserve, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            companyIdReserve: !isEmpty(result) ? result[0].companyId : '',
          },
        });
      }
      return result;
    },
    // 360 打印
    *handlePrint({ payload }, { call }) {
      const result = getResponse(yield call(handlePrint, payload));
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
    updateTmplData(state, { payload }) {
      return {
        ...state,
        tmplDataSource: {
          ...state.tmplDataSource,
          ...payload,
        },
      };
    },
  },
};
