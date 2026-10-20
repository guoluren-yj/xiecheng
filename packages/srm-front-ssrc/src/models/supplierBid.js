/**
 * model 供应商投标
 * @date: 2019-05-18
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import {
  fetchBidList,
  fetchHeadDataList,
  fetchItemsDataList,
  fatchParticipate,
  fatchAbandon,
  quotationTakeback,
  fetchPretrialApplication,
  savePretrialApplication,
  submitPretrialApplication,
  queryQuotationHeader,
  saveHeaderAttachment,
  queryQuotationLines,
  queryBiddingQuotationLine,
  saveQuotationLines,
  abandonQuotationLine,
  abandonRevokeQuotationLine,
  saveAllBid,
  submitAllBid,
  submitLinesBid,
  submitQuotationLines,
  queryQuotationLineDetail,
  fetchQuestionMaintain,
  fetchQuestionHeader,
  fetchQuestionRows,
  fetchClarificationList,
  fetchReviewList,
  deleteQuestionRows,
  deleteQuestion,
  saveQuestion,
  submitQuestion,
  fetchClarificationDetails,
  fetchClarificationQuestion,
  fetchNoticeHeader,
  fetchNoticeRows,
  saveAnswerQuestion,
  saveNoticeQuestion,
  submitNoticeQuestion,
  fetchItemSupplierLineQuotationDetail,
  saveQuotationDetailData,
  deleteQuotationDetailData,
  saveConfirmMatter,
} from '@/services/supplierBidService';
// import {
//   fetchQuotationDetail,
//   saveElementDetail,
//   deleteElementDetail,
// } from '@/services/supplierQutationService';
import { fetchPretrialPanel } from '@/services/inquiryHallService';

import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'supplierBid',
  state: {
    code: {}, // 值集
    bidList: [], // 供应商投标入口表格数据
    bidPagination: {}, // 供应商投标入口表格分页
    supplierHolderList: {}, // 供应商询价单头
    supplierBidQueryHeader: {}, // 招投标澄清查询头部信息
    supplierBidTenderHeader: {}, // 招投标澄清头部信息
    supplierItemsList: [], // 供应商招标物料行
    quotationDetailList: [], // 报价明细数据
    supplierLineQuotationDetail: [], // 供应商报价明细
    supplierItemsPagination: {}, // 供应商招标物料行分页
    supplierBidQueryItemsList: [], //  招投标澄清查询 供应商招标物料行
    supplierBidQueryItemsPagination: {}, //  招投标澄清查询 供应商招标物料行分页
    supplierBidTenderItemsList: [], //  招投标澄清 供应商招标物料行
    supplierBidTenderItemsPagination: {}, //  招投标澄清 供应商招标物料行分页
    quotationHeader: {}, // 供应商投标头信息
    // sectionFlag: 0,
    quotationLines: [], // 供应商投标行信息
    biddingQuotationLine: {}, // 子行投标行信息
    biddingQuotationParentLine: {}, // 父行投标标段头信息
    quotationLinePagination: {}, // 供应商投标行查询分页信息
    quotationLineDetail: {}, // 供应商单个物品所有投标信息
    quotationLineDetailPagination: {}, // 供应商单个物品所有投标分页信息
    fetchPretrialApplicationData: {}, // 预审申请弹窗数据
    questionMaintainList: {}, // 问题维护列表
    questionMaintainPagination: {}, // 问题维护分页参数
    questionInformationHeader: {}, // 问题详情头信息
    questionNoticeHeader: {}, // 评审澄清问题头信息查询
    questionRowsList: [], // 问题行列表
    questionRowsPagination: {}, // 问题行分页参数
    clarificationList: {}, // 查看澄清函列表
    reviewList: [], // 评审澄清维护列表
    reviewPagination: {}, // 评审澄清维护列表分页参数
    clarificationPagination: {}, // 查看澄清函分页参数
    clarificationDetails: {}, // 澄清函详情
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    clarificationQuestionList: {}, // 澄清函引用问题列表
    noticeRowsList: [], // 评审澄清通知问题行
    noticeRowsPagination: {}, // 评审澄清通知问题行分页信息
    bidQuoPagination: {}, // 供应商投标行数据分页信息
    QuotationDetailDataSource: {}, // 报价明细all data
    itemQuotationDetail: [], // 报价明细list
    itemQuotationPagination: {}, // 报价明细pagination
    pretrialPanelList: [], // 预审小组成员
  },
  effects: {
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
    // 查询供应商投标入口列表
    *fetchBidList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBidList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidList: result.content,
            bidPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询供应商招标单头
    *fetchHeadDataList({ payload }, { call, put }) {
      const { routerParams } = payload;
      const result = getResponse(yield call(fetchHeadDataList, payload));
      if (result) {
        if (routerParams) {
          if (routerParams.typeName === 'bidQueryClarification') {
            yield put({
              type: 'updateState',
              payload: {
                supplierBidQueryHeader: result,
              },
            });
          } else if (routerParams.typeName === 'bidTenderlarification') {
            yield put({
              type: 'updateState',
              payload: {
                supplierBidTenderHeader: result,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                supplierHolderList: result || {},
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              supplierHolderList: result || {},
            },
          });
        }
      }
      return result;
    },
    // 供应商招标物料行
    *fetchItemsDataList({ payload }, { call, put }) {
      const { routerParams } = payload;
      const result = getResponse(yield call(fetchItemsDataList, payload));
      if (result) {
        if (routerParams) {
          if (routerParams.typeName === 'bidQueryClarification') {
            yield put({
              type: 'updateState',
              payload: {
                supplierBidQueryItemsList: result.content,
                supplierBidQueryItemsPagination: createPagination(result),
              },
            });
          }
          if (routerParams.typeName === 'bidTenderlarification') {
            yield put({
              type: 'updateState',
              payload: {
                supplierBidTenderItemsList: result.content,
                supplierBidTenderItemsPagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                supplierItemsList: result.data,
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              supplierItemsList: result.data,
            },
          });
        }
      }
      return result;
    },
    // 供应商招标-参与
    *fatchParticipate({ payload }, { call }) {
      const result = getResponse(yield call(fatchParticipate, payload));
      return result;
    },
    // 供应商招标-放弃
    *fatchAbandon({ payload }, { call }) {
      const result = getResponse(yield call(fatchAbandon, payload));
      return result;
    },
    // 查寻投标单头信息
    *queryQuotationHeader({ payload }, { call, put }) {
      const quotationHeader = getResponse(yield call(queryQuotationHeader, payload));
      if (quotationHeader) {
        yield put({
          type: 'updateState',
          payload: {
            quotationHeader,
          },
        });
      }

      return quotationHeader;
    },
    // 保存投标单头附件
    *saveHeaderAttachment({ payload }, { call }) {
      return getResponse(yield call(saveHeaderAttachment, payload));
    },
    // 查寻投标行信息列表
    *queryQuotationLines({ payload }, { call, put }) {
      const res = getResponse(yield call(queryQuotationLines, payload));
      const bidQuoPagination = createPagination(res.bidQuotationLineDTOS);
      if (res) {
        if (res.sectionFlag) {
          yield put({
            type: 'updateState',
            payload: {
              quotationLines: res.bidQuotationLineDTOS,
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              quotationLines: res.bidQuotationLineDTOS.content,
              bidQuoPagination,
            },
          });
        }
      }
      return res;
    },
    // 查询父行投标标段头
    *queryBiddingQuotationParentLine({ payload }, { call, put }) {
      const res = getResponse(yield call(queryBiddingQuotationLine, payload));
      if (res) {
        const biddingQuotationParentLine = res;
        yield put({
          type: 'updateState',
          payload: {
            biddingQuotationParentLine,
          },
        });
      }
      return res;
    },
    // 查询子行投标行
    *queryBiddingQuotationLine({ payload }, { call, put }) {
      const res = getResponse(yield call(queryBiddingQuotationLine, payload));
      if (res) {
        const biddingQuotationLine = res;
        yield put({
          type: 'updateState',
          payload: {
            biddingQuotationLine,
          },
        });
      }
      return res;
    },
    // 查询单个物品所有投标行
    *queryQuotationLineDetail({ payload }, { call, put }) {
      const quotationLineDetail = getResponse(yield call(queryQuotationLineDetail, payload));
      if (quotationLineDetail) {
        const quotationLineDetailPagination = createPagination(quotationLineDetail);
        yield put({
          type: 'updateState',
          payload: {
            quotationLineDetail,
            quotationLineDetailPagination,
          },
        });
      }
    },
    // 放弃投标  标段
    *abandonQuotationLine({ payload }, { call }) {
      return getResponse(yield call(abandonQuotationLine, payload));
    },
    // 撤销弃投标  标段
    *abandonRevokeQuotationLine({ payload }, { call }) {
      return getResponse(yield call(abandonRevokeQuotationLine, payload));
    },
    // 保存投标单  单行
    *saveQuotationLines({ payload }, { call }) {
      return getResponse(yield call(saveQuotationLines, payload));
    },
    // 保存投标单头-所有
    *saveAllBid({ payload }, { call }) {
      return getResponse(yield call(saveAllBid, payload));
    },
    // 保存投标单头-所有
    *submitAllBid({ payload }, { call }) {
      return getResponse(yield call(submitAllBid, payload));
    },
    // 保存投标单头-所有
    *submitLinesBid({ payload }, { call }) {
      return getResponse(yield call(submitLinesBid, payload));
    },
    // 提交投标单行
    *submitQuotationLines({ payload }, { call }) {
      return getResponse(yield call(submitQuotationLines, payload));
    },
    // 收回投标
    *quotationTakeback({ payload }, { call }) {
      return getResponse(yield call(quotationTakeback, payload));
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
    // 保存预审申请弹窗数据
    *savePretrialApplication({ payload }, { call }) {
      let result = yield call(savePretrialApplication, payload);
      result = getResponse(result);
      if (result) {
        notification.success();
      }
      return result;
    },
    // 保存预审申请弹窗数据
    *submitPretrialApplication({ payload }, { call }) {
      let result = yield call(submitPretrialApplication, payload);
      result = getResponse(result);
      if (result) {
        notification.success();
      }
      return result;
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

    // 问题维护查询
    *fetchQuestionMaintain({ payload }, { call, put }) {
      const questionMaintainList = getResponse(yield call(fetchQuestionMaintain, payload));
      const questionMaintainPagination = createPagination(questionMaintainList);
      yield put({
        type: 'updateState',
        payload: {
          questionMaintainList,
          questionMaintainPagination,
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

    // 评审澄清维护列表
    *fetchReviewList({ payload }, { call, put }) {
      let result = yield call(fetchReviewList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            reviewList: result.content,
            reviewPagination: createPagination(result),
          },
        });
      }
      return result;
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

    // 问题头查询
    *fetchQuestionHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchQuestionHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
    },

    // 问题行查询
    *fetchQuestionRows({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuestionRows, payload));
      const questionRowsPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            questionRowsList: result.content,
            questionRowsPagination,
          },
        });
      }
    },

    // 删除问题行
    *deleteQuestionRows({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuestionRows, payload));
      return result;
    },

    // 删除问题
    *deleteQuestion({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuestion, payload));
      return result;
    },

    // 保存问题
    *saveQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveQuestion, payload));
      return result;
    },

    // 提交问题
    *submitQuestion({ payload }, { call }) {
      const result = getResponse(yield call(submitQuestion, payload));
      return result;
    },
    // 评审澄清通知问题头查询
    *fetchNoticeHeader({ payload }, { call, put }) {
      const questionNoticeHeader = getResponse(yield call(fetchNoticeHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionNoticeHeader },
      });
    },
    // 评审澄清通知问题行查询
    *fetchNoticeRows({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchNoticeRows, payload));
      const noticeRowsPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            noticeRowsList: result.content,
            noticeRowsPagination,
          },
        });
      }
    },
    // 保存澄清通知回答问题行信息
    *saveAnswerQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveAnswerQuestion, payload));
      return result;
    },
    // 保存澄清通知回答问题信息
    *saveNoticeQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveNoticeQuestion, payload));
      return result;
    },
    // 提交澄清通知回答问题信息
    *submitNoticeQuestion({ payload }, { call }) {
      const result = getResponse(yield call(submitNoticeQuestion, payload));
      return result;
    },
    *fetchItemSupplierLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemSupplierLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLineQuotationDetail: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 保存报价明细
    *saveQuotationDetailData({ payload }, { call }) {
      return getResponse(yield call(saveQuotationDetailData, payload));
    },
    // 删除报价模板明细
    *deleteQuotationDetailData({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuotationDetailData, payload));
      return result;
    },
    // // 物料报价明细重构
    // *fetchQuotationDetail({ payload }, { call, put }) {
    //   let result = yield call(fetchQuotationDetail, payload);
    //   result = getResponse(result);
    //   if (result) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         QuotationDetailDataSource: result,
    //         itemQuotationDetail: dealDataState(result.supQuotationDetailPage.content),
    //         itemQuotationPagination: createPagination(result.supQuotationDetailPage),
    //       },
    //     });
    //   }

    //   return dealDataState(result);
    // },
    // // 保存自定义报价明细项
    // *saveElementDetail({ payload }, { call }) {
    //   const result = getResponse(yield call(saveElementDetail, payload));
    //   return result;
    // },
    // // 删除自定义明细项
    // *deleteElementDetail({ payload }, { call }) {
    //   const result = getResponse(yield call(deleteElementDetail, payload));
    //   return result;
    // },
    // 预审小组-查询
    *fetchPretrialPanel({ payload }, { call, put }) {
      const response = yield call(fetchPretrialPanel, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            pretrialPanelList: dealDataState(data),
          },
        });
      }
    },
    // 保存投标,阅读事项说明标识
    *fetchSaveConfirmMatter({ payload }, { call }) {
      const result = getResponse(yield call(saveConfirmMatter, payload));
      if (result) {
        return result;
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
