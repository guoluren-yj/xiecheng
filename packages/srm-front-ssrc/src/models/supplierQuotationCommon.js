/**
 * model 供应商报价
 * @date: 2019-1-8
 * @author:LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import {
  fetchEntranceList,
  fetchHeadDataList,
  fetchItemsDataList,
  fatchParticipate,
  fatchAbandon,
  fetchFeedBackBarginHistory,
  fetchPretrialApplication,
  savePretrialApplication,
  submitPretrialApplication,
  queryIndicateData,
  saveConfirmMatter,
  updateLineData,
  roundQuotationInfo,
  queryPrint,
  fetchReviewClarificationList,
  querySupplierPrequalHeader,
  saveSupplierPrequalHeader,
  submitSupplierPrequalHeader,
  querySectionIndicateData,
  querySectionIndicateNewData,
  fetchQuotationItem,
} from '@/services/supplierQutationService';
import {
  queryQuotationHeader,
  saveHeaderAttachment,
  queryQuotationLines,
  queryBiddingQuotationLine,
  saveQuotationLines,
  submitReferencePrice,
  submitQuotationLines,
  validateQuotationSubmit,
  backQuotationLines,
  queryQuotationLineDetail,
  biddingRank,
  biddingHistory,
  fetchLadderList,
  saveLadderList,
  deleteLadderQuot,
  fetchQuotationDetailData,
  saveQuotationDetailData,
  deleteQuotationDetailData,
  queryRoundQuotationLineDetail,
  validateLadderQuotation,
} from '@/services/inquiryPriceService';
import {
  fetchLadderLevelyTable,
  fetchPretrialPanel,
  batchMaintainItemQuotationLine,
  signIn,
} from '@/services/inquiryHallService';
import { fetchClarifyNotifyDataList, querySetting } from '@/services/bidHallService';
import {
  queryClarifyNotifyDetailHeader,
  queryClarifyNotifyDetailList,
} from '@/services/expertScoringService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';
import {
  fetchNoticeHeader,
  fetchNoticeRows,
  saveAnswerQuestion,
  saveNoticeQuestion,
  submitNoticeQuestion,
  fetchQuestionMaintain,
  fetchClarificationList,
  fetchQuestionHeader,
  fetchQuestionRows,
  saveQuestion,
  submitQuestion,
  deleteQuestion,
  deleteQuestionRows,
  fetchClarificationDetails,
  fetchClarificationQuestion,
} from '@/services/supplierBidService';

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
const getModel = (modelName) => ({
  namespace: modelName,
  state: {
    suppliereEntranceList: [], // 供应商报价入口表格数据
    suppliereEntrancePagin: {}, // 供应商报价入口表格分页
    supplierHolderList: {}, // 供应商询价单头
    supplierItemsList: [], // 供应商询价物料行
    supplierItemsPagination: {}, // 供应商询价物料行分页
    code: {}, // 值集
    quotationHeader: {}, // 供应商报价头信息
    quotationLines: {}, // 供应商报价行信息
    biddingQuotationLine: {}, // 单行竞价行信息
    quotationLinePagination: {}, // 供应商报价行查询分页信息
    quotationLineDetail: {}, // 供应商单个物品所有报价信息
    quotationLineDetailPagination: {}, // 供应商单个物品所有报价分页信息
    roundQuotationLineDetail: [], // 供应商单个物品所有多轮报价信息
    // roundQuotationLineDetailPagination: {}, // 供应商单个物品所有多轮报价分页信息
    quotationHistoryList: [], // 个人报价历史
    feedBackBarginHistoryLine: [], // 报价查询比价历史列表数据
    feedBackBarginHistoryPagination: {}, // 个人报价历史分页
    fetchPretrialApplicationData: {}, // 预审申请弹窗数据
    fetchLadderList: [], // 阶梯报价
    quotationDetailList: [], // 报价明细数据
    clarifyNotifyDataList: [], // 澄清通知列表
    clarifyNotifyDataListPagination: {}, // 澄清通知列表分页数据
    clarifyNotifyDetailList: [], // 澄清详情列表数据
    clarifyNotifyDetailListPagination: {}, // 澄清详情列表分页数据
    clarifyNotifyDetailHeader: {}, // 澄清单详情头信息
    questionNoticeHeader: {}, // 评审澄清通知问题头
    noticeRowsList: [], // 评审澄清通知问题行
    noticeRowsPagination: {}, // 评审澄清通知问题行分页信息
    supplierQutQueryList: {}, // 供应商询价单头-报价查询页面
    supplierQutItemsList: [], // 供应商询价物料行-报价查询页面
    supplierQutItemsPagination: {}, // 供应商询价物料行分页-报价查询页面
    questionMaintainList: [], // 澄清答疑维护列表
    questionMaintainPagination: {}, // 澄清答疑维护列表分页
    clarificationList: [], // 澄清答疑查看澄清函列表
    clarificationPagination: {}, // 澄清答疑查看澄清函列表分页
    questionInformationHeader: {}, // 问题详情头信息
    questionRowsList: [], // 问题行列表
    questionRowsPagination: {}, // 问题行分页参数
    clarificationDetails: {}, // 澄清函详情
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    clarificationQuestionList: {}, // 澄清函引用问题列表
    pretrialPanelList: [], // 预审小组成员
    indicateDataSource: [], // 资质要求细项 - 要素列表
    settings: {}, // 配置中心
    roundQuotationInfo: [], // 供应商报价多轮报价信息表格
    quotationRoundQuotationInfo: [], // 报价查询多轮报价信息表格
    reviewClarificationList: [], // 评审澄清list
    reviewClarificationPagination: {}, // 评审澄清pagination
    supplierFormChangeFlag: 0, // 报价页面头表单变更标识
    quotationItemDto: {}, // 报价行-物料
  },
  effects: {
    // 评审澄清-list
    *fetchReviewClarificationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReviewClarificationList, payload));
      const questionMaintainPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            reviewClarificationList: result.content,
            reviewClarificationPagination: questionMaintainPagination,
          },
        });
      }
    },
    // 报价行行批量维护
    *batchMaintainItemQuotationLine({ payload }, { call }) {
      const result = yield call(batchMaintainItemQuotationLine, payload);
      return getResponse(result);
    },
    // 查询配置中心配置项
    *querySetting({ payload }, { call, put }) {
      const settings = getResponse(yield call(querySetting, payload));
      if (settings) {
        yield put({
          type: 'updateState',
          payload: {
            settings,
          },
        });
      }
    },
    // 问题维护查询
    *fetchQuestionMaintain({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuestionMaintain, payload));
      const questionMaintainPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            questionMaintainList: result.content,
            questionMaintainPagination,
          },
        });
      }
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
    // 查看澄清函
    *fetchClarificationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClarificationList, payload));
      const clarificationPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarificationList: result.content,
            clarificationPagination,
          },
        });
      }
    },
    // 问题头查询
    *fetchQuestionHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchQuestionHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { questionInformationHeader: res },
        });
      }
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
    // 保存澄清通知回答问题行信息
    *saveAnswerQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveAnswerQuestion, payload));
      return result;
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
    // 评审澄清通知问题头查询
    *fetchNoticeHeader({ payload }, { call, put }) {
      const questionNoticeHeader = getResponse(yield call(fetchNoticeHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionNoticeHeader },
      });
    },
    // 获取澄清详情列表数据
    *queryClarifyNotifyDetailList({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyDetailList, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDetailList: result.content,
            clarifyNotifyDetailListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取澄清单详情头信息
    *queryClarifyNotifyDetailHeader({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyDetailHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDetailHeader: result,
          },
        });
      }
      return result;
    },
    // 查询澄清通知列表
    *fetchClarifyNotifyDataList({ payload }, { call, put }) {
      let result = yield call(fetchClarifyNotifyDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDataList: result.content,
            clarifyNotifyDataListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询竞价排名 供websocket
    *biddingRank({ payload }, { call }) {
      const result = getResponse(yield call(biddingRank, payload));
      return result;
    },
    // 查询个人报价历史
    *biddingHistory({ payload }, { call, put }) {
      const result = getResponse(yield call(biddingHistory, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationHistoryList: result,
          },
        });
      }
      return result;
    },
    // 查询供应商询价入口
    *fetchEntranceList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchEntranceList, payload));
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  suppliereEntranceList: result.content,
                  suppliereEntrancePagin: createPagination(result),
                }
              : {
                  suppliereEntrancePagin: createPagination(result),
                  suppliereEntranceOldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
                },
        });
      }
      return result;
    },
    // 查询供应商询价单头
    *fetchHeadDataList({ payload }, { call, put }) {
      const { routerFrom } = payload;
      const result = getResponse(yield call(fetchHeadDataList, payload));
      if (result) {
        if (routerFrom) {
          if (routerFrom === 'quotationQuery') {
            yield put({
              type: 'updateState',
              payload: {
                supplierQutQueryList: result || {},
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
    // 供应商询价物料行
    *fetchItemsDataList({ payload }, { call, put }) {
      const { routerFrom } = payload;
      const result = getResponse(yield call(fetchItemsDataList, payload));
      if (result) {
        if (routerFrom) {
          if (routerFrom === 'quotationQuery') {
            yield put({
              type: 'updateState',
              payload: {
                supplierQutItemsList: result.content,
                supplierQutItemsPagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                supplierItemsList: result.content,
                supplierItemsPagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              supplierItemsList: result.content,
              supplierItemsPagination: createPagination(result),
            },
          });
        }
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
    // 供应商询价-参与
    *fatchParticipate({ payload }, { call }) {
      const result = getResponse(yield call(fatchParticipate, payload));
      return result;
    },
    // 供应商询价-放弃
    *fatchAbandon({ payload }, { call }) {
      const result = getResponse(yield call(fatchAbandon, payload));
      return result;
    },
    // 查询报价单头信息
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

    // 保存报价单头附件
    *saveHeaderAttachment({ payload }, { call }) {
      return getResponse(yield call(saveHeaderAttachment, payload));
    },

    // 查询报价单行信息列表
    *queryQuotationLines({ payload }, { call, put }) {
      const res = getResponse(yield call(queryQuotationLines, payload));
      let quotationLines = res;
      if (res) {
        const quotationLinePagination = createPagination(res);
        quotationLines = {
          ...res,
          content: res.content.map((item) => ({
            ...item,
            _status: 'update',
          })),
        };
        yield put({
          type: 'updateState',
          payload: {
            quotationLines,
            quotationLinePagination,
          },
        });
      }
      return quotationLines;
    },

    // 查询单行竞价行
    *queryBiddingQuotationLine({ payload }, { call, put }) {
      const res = getResponse(yield call(queryBiddingQuotationLine, payload));
      if (res) {
        // const quotationLinePagination = createPagination(res);
        const biddingQuotationLine = res.content[0];
        yield put({
          type: 'updateState',
          payload: {
            biddingQuotationLine,
            //  quotationLinePagination,
          },
        });
      }
      return res;
    },
    // 查询单个物品所有报价行
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

    // 查询单个物品多轮报价历史
    *queryRoundQuotationLineDetail({ payload }, { call, put }) {
      const roundQuotationLineDetail = getResponse(
        yield call(queryRoundQuotationLineDetail, payload)
      );
      if (roundQuotationLineDetail) {
        // const roundQuotationLineDetailPagination = createPagination(roundQuotationLineDetail);
        yield put({
          type: 'updateState',
          payload: {
            roundQuotationLineDetail,
            // roundQuotationLineDetailPagination,
          },
        });
      }
    },
    // 保存报价单行
    *saveQuotationLines({ payload }, { call }) {
      return getResponse(yield call(saveQuotationLines, payload));
    },
    // 引用参考价格
    *submitReferencePrice({ payload }, { call }) {
      return getResponse(yield call(submitReferencePrice, payload));
    },
    // 提交报价单行
    *submitQuotationLines({ payload }, { call }) {
      return yield call(submitQuotationLines, payload); // 这里是为了捕获到异常信息
    },
    // 供应商报价-提交校验
    *validateQuotationSubmit({ payload }, { call }) {
      return yield call(validateQuotationSubmit, payload); // 这里是为了捕获到异常信息
    },

    // 整单升降价
    *updateLineData({ payload }, { call }) {
      return getResponse(yield call(updateLineData, payload));
    },
    // 收回报价单行
    *backQuotationLines({ payload }, { call }) {
      return getResponse(yield call(backQuotationLines, payload));
    },
    // 获取还比价历史明细列表
    *fetchFeedBackBarginHistory({ payload }, { call, put }) {
      let result = yield call(fetchFeedBackBarginHistory, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            feedBackBarginHistoryLine: result.content,
            feedBackBarginHistoryPagination: createPagination(result),
          },
        });
      }
      return result;
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
    // 获取阶梯报价历史明细列表
    *fetchLadderList({ payload }, { call, put }) {
      let result = yield call(fetchLadderList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchLadderList: dealDataState(result.content),
            // fetchLadderListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存之前校验阶梯报价
    *validateLadderQuotation({ payload }, { call }) {
      return getResponse(yield call(validateLadderQuotation, payload));
    },
    // 保存阶梯报价
    *saveLadderList({ payload }, { call }) {
      return getResponse(yield call(saveLadderList, payload));
    },
    // 阶梯报价-批量删除
    *deleteLadderQuot({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderQuot, payload));
      return result;
    },
    // 询价阶梯报价
    *fetchLadderLevelyTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelyTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderLevelData: dealDataState(result.content),
          },
        });
      }
    },
    // 获取报价明细数据
    *fetchQuotationDetailData({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailList: dealDataState(result),
          },
        });
      }
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
    // 资质要求细项-要素列表
    *fetchQueryIndicateData({ payload }, { call, put }) {
      const result = getResponse(yield call(queryIndicateData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            indicateDataSource: result || [],
          },
        });
      }
    },
    // 资质要求细项-要素列表-分标段
    *fetchQuerySectionIndicateData({ payload }, { call, put }) {
      const result = getResponse(yield call(querySectionIndicateData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            indicateDataSource: result || [],
          },
        });
      }
    },
    // 资质要求细项-要素列表-分标段
    *fetchQuerySectionIndicateNewData({ payload }, { call, put }) {
      const result = getResponse(yield call(querySectionIndicateNewData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            indicateDataSource: result || [],
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
    // 开始竞价
    *signIn({ payload }, { call }) {
      const result = getResponse(yield call(signIn, payload));
      return result;
    },
    // 打印
    *queryPrint({ payload }, { call }) {
      const result = getResponse(yield call(queryPrint, payload));
      return result;
    },
    // 供应商报价-多轮报价信息表
    *roundQuotationInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(roundQuotationInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            roundQuotationInfo: result || [],
          },
        });
      }
      return result;
    },

    // 报价查询-多轮报价信息表
    *quotationRoundQuotationInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(roundQuotationInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationRoundQuotationInfo: result || [],
          },
        });
      }
      return result;
    },
    // 查询立项生成的单据下资格预审申请头 - 分组情况下
    *querySupplierPrequalHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(querySupplierPrequalHeader, payload));
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
    // 保存资格预审申请头 - 分组情况下
    *saveSupplierPrequalHeader({ payload }, { call }) {
      const result = getResponse(yield call(saveSupplierPrequalHeader, payload));
      return result;
    },
    // 提交资格预审申请头 - 分组情况下
    *submitSupplierPrequalHeader({ payload }, { call }) {
      const result = getResponse(yield call(submitSupplierPrequalHeader, payload));
      return result;
    },
    // 报价行物料
    *fetchQuotationItem({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuotationItem, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationItemDto: result || {},
          },
        });
      }

      return result || {};
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
