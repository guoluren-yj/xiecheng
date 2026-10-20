/**
 * model 投标查询
 * @date: 2019-5-18
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchBidQueryList,
  fetchHeadDataList,
  fetchItemsDataList,
  queryQuotationLines,
  queryQuotationHeader,
  fetchPretrialApplication,
  fetchQuestionsubmitted,
  fetchClarificationList,
  fetchClarificationDetails,
  fetchClarificationQuestion,
  fetchQuestionHeader,
  fetchQuestionRows,
  fetchItemSupplierLineQuotationDetail,
} from '@/services/supplierBidService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';
// import { fetchQuotationDetail } from '@/services/supplierQutationService';

// function dealDataState(data) {
//   // 处理行 处理字段为update
//   let config = [];
//   if (Array.isArray(data) && data.length > 0) {
//     config = data.map(item => {
//       return {
//         ...item,
//         _status: 'update',
//       };
//     });
//   }
//   return config;
// }

const getModel = (modelName = 'supplierBidQuery') => ({
  namespace: modelName,
  state: {
    bidQueryList: [], // 投标查询入口表格数据
    bidQueryPagination: {}, // 投标查询入口表格分页
    supplierHolderList: {}, // 投标查询明细页面询价单头
    supplierItemsList: [], // 投标查询明细页面招标物料行
    quotationLines: [],
    bidQueryOldTotalElements: 0,
    itemLineQuotationDetail: [], // 报价明细数据
    bidQuoPagination: {},
    supplierItemsPagination: {}, // 投标查询明细页面物料行分页
    code: {}, // 值集
    fetchPretrialApplicationData: {}, // 预审申请弹窗数据
    questionsubmittedList: {}, // 已提交问题列表
    questionsubmittedPagination: {}, // 已提交问题分页参数
    clarificationList: {}, // 查看澄清函列表
    clarificationPagination: {}, // 查看澄清函分页参数
    clarificationDetails: {}, // 澄清函详情
    clarificationQuestionList: {}, // 澄清函引用问题列表
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    questionInformationHeader: {}, // 问题详情头信息
    questionRowsList: {}, // 问题详情行列表
    questionRowsPagination: {}, // 问题详情行分页参数
    QuotationDetailDataSource: {}, // 报价明细all data
    itemQuotationDetail: [], // 报价明细list
    itemQuotationPagination: {}, // 报价明细pagination
  },
  effects: {
    // // 采购方物料报价明细重构
    // *fetchQuotationDetail({ payload }, { call, put }) {
    //   let result = yield call(fetchQuotationDetail, payload);
    //   result = getResponse(result);
    //   if (!isEmpty(result)) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         QuotationDetailDataSource: result,
    //         itemQuotationDetail: dealDataState(result.supQuotationDetailPage.content),
    //         itemQuotationPagination: createPagination(result.supQuotationDetailPage),
    //       },
    //     });
    //     return dealDataState(result);
    //   } else {
    //     return null;
    //   }
    // },
    // 投标查询入口查询
    *fetchBidQueryList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBidQueryList, payload));
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  bidQueryList: result.content,
                  bidQueryPagination: createPagination(result),
                }
              : {
                  bidQueryPagination: createPagination(result),
                  bidQueryOldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
                },
        });
      }
      return result;
    },
    // 查寻投标行信息列表
    *queryQuotationLines({ payload }, { call, put }) {
      const res = getResponse(yield call(queryQuotationLines, payload));
      const { bidQuotationLineDTOS = {} } = res;
      const bidQuoPagination = createPagination(bidQuotationLineDTOS);
      if (res) {
        if (res.sectionFlag) {
          yield put({
            type: 'updateState',
            payload: {
              quotationLines: bidQuotationLineDTOS,
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              quotationLines: bidQuotationLineDTOS.content,
              bidQuoPagination,
            },
          });
        }
      }
      return res;
    },
    // 查寻投标单头信息
    *queryQuotationHeader({ payload }, { call, put }) {
      const supplierHolderList = getResponse(yield call(queryQuotationHeader, payload));
      if (supplierHolderList) {
        yield put({
          type: 'updateState',
          payload: {
            supplierHolderList,
          },
        });
      }
    },
    // 投标查询明细页面招标单头
    *fetchHeadDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchHeadDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierHolderList: result,
          },
        });
      }
      return result;
    },
    // 投标查询明细页面招标物料行
    *fetchItemsDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchItemsDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierItemsList: result.data,
          },
        });
      }
      return result;
    },
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 获取预审申请弹窗数据
    *fetchPretrialApplication({ payload }, { call, put }) {
      let result = yield call(fetchPretrialApplication, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchPretrialApplicationData: result,
          },
        });
      }
      return result;
    },
    // 查看问题
    *fetchQuestionsubmitted({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuestionsubmitted, payload));
      const questionsubmittedPagination = createPagination(result);
      yield put({
        type: 'updateState',
        payload: {
          questionsubmittedList: result,
          questionsubmittedPagination,
        },
      });
    },

    // 查看澄清函
    *fetchClarificationList({ payload }, { call, put }) {
      const clarificationList = getResponse(yield call(fetchClarificationList, payload));
      const clarificationPagination = createPagination(clarificationList);
      yield put({
        type: 'updateState',
        payload: {
          clarificationList,
          clarificationPagination,
        },
      });
    },

    // 澄清函详情
    *fetchClarificationDetails({ payload }, { call, put }) {
      const clarificationDetails = getResponse(yield call(fetchClarificationDetails, payload));
      yield put({
        type: 'updateState',
        payload: {
          clarificationDetails,
        },
      });
    },

    // 澄清函详情引入问题
    *fetchClarificationQuestion({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClarificationQuestion, payload));
      const clarificationQuestionPagination = createPagination(result);
      yield put({
        type: 'updateState',
        payload: {
          clarificationQuestionList: result,
          clarificationQuestionPagination,
        },
      });
    },

    // 详情页问题头查询
    *fetchQuestionHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchQuestionHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
    },

    // 详情页问题行查询
    *fetchQuestionRows({ payload }, { call, put }) {
      const questionRowsList = getResponse(yield call(fetchQuestionRows, payload));
      const questionRowsPagination = createPagination(questionRowsList);
      yield put({
        type: 'updateState',
        payload: {
          questionRowsList,
          questionRowsPagination,
        },
      });
    },
    // 获取供应商物品行报价详情
    *fetchItemSupplierLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemSupplierLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLineQuotationDetail: result,
          },
        });
      }
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
});

export default getModel;
