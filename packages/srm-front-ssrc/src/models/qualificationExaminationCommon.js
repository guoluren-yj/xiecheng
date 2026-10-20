/**
 * model 资格审查
 * @date: 2018-1-25
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchQualificationDataList,
  fetchQualificationHeader,
  fetchQualificationLineList,
  fetchQualificationRankList,
  saveQualificationRankList,
  saveQualificationExamination,
  submitQualificationExamination,
  quotationControll,
  quotationContBid,
  fetchQualificationSum,
  saveSubmitQualificationSum,
  fetchQualificationSectionHeader,
  fetchQualificationSectionLineList,
  saveQualificationSectionExamination,
  submitQualificationSectionExamination,
  fetchPretrialSectionPanel,
  fetchQualificationSectionRankList,
  saveQualificationSectionRankList,
  fetchQualificationSectionSum,
  saveSubmitQualificationSectionSum,
} from '@/services/qualificationExaminationService';
import { queryMapIdpValue } from 'services/api';
import {
  fetchScoreInquiryHeaderDetail,
  fetchInquiryItemLine,
  fetchLadderLevelyTable,
  fetchScoringElementData,
  fetchInquirySupplierLine,
  getStage,
  fetchOperation,
  supplierInquiryRecord,
  inquiryAgain,
  fetchItemLineQuotationDetail,
  fetchBidholderList,
  fetchPretrialPanel,
} from '@/services/inquiryHallService';
import {
  fetchExpertAllocationData,
  fetchTempelateDetailData,
  fetchEvaluateIndicAssign,
  fetchInquiryHeaderDetail,
  fetchItemLine,
  fetchSupplierLine,
  fetchBidMembers,
  fetchSupplier,
} from '@/services/bidHallService';

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

function dealDataStateRecursive(data) {
  let config = [];

  config = data.map((item) => {
    if (item.children) {
      let subConfig = [];
      subConfig = item.children.map((subItem) => {
        return {
          ...subItem,
          _status: 'update',
        };
      });

      // eslint-disable-next-line
      item.children = subConfig;
    }

    return {
      ...item,
      _status: 'update',
    };
  });

  return config;
}

function sumDataSource(qualificationSum = []) {
  const result = qualificationSum.map((item) => {
    let elementValue = {};
    const { summaryDTOList = [], ...otherItem } = item;
    summaryDTOList.forEach((elementItem) => {
      elementValue = {
        ...elementValue,
        [elementItem.userId]: item.flagSummary
          ? elementItem.lineApprovedStatusMeaning
          : elementItem.approvalFlagMeaning,
        [`${elementItem.userId}approvedRemark`]: elementItem.approvedRemark,
        [`${elementItem.userId}realName`]: elementItem.realName,
      };
    });
    return {
      ...otherItem,
      ...elementValue,
    };
  });
  return result;
}

const getModel = (modelName = 'qualificationExamination') => ({
  namespace: modelName,
  state: {
    code: {}, // 值集
    qualificationList: [], // 资格审查列表数据
    qualificationPagination: {}, // 资格审查列表分页
    qualificationHeader: {}, // 资格审查头部信息
    qualificationLine: [], // 资格审查行列表
    qualificationLinePagination: {}, // 资格审查行分页
    qualificationRank: [],
    header: {},
    itemLine: [], // 物品明细数据
    supplierLine: [], // 供应商列表数据
    itemLinePagination: {}, // 物品明细分页
    supplierLinePagination: {}, // 供应商列表数据分页
    scoringElement: [], // 评分要素数据
    ladderLevelData: [], // 阶梯报价数据
    operationData: [], // 操作记录
    operationPagination: {}, // 操作记录分页
    evaluateExpertList: [], // none/diff 合并
    scoringNoneTempelate: [], // 模板明细不区分数据
    scoringBusinessTempelate: [], // 模板明细商务组数据
    scoringTechnologyTempelate: [], // 模板明细技术组数据
    currentScoringExperts: [], // 当前评分要素专家数据
    historys: '', // 路由历史
    bidMembersList: [], // 招标小组列表
    itemLineQuotationDetail: [], // 物品明细报价详情
    bidHolderList: [], // 开标人数据
    bidHolderPagination: {}, // 开标人分页
    pretrialPanelList: [], // 预审小组数据
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
    // 资格审查list
    *fetchQualificationDataList({ payload }, { call, put }) {
      let result = yield call(fetchQualificationDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationList: result.content,
            qualificationPagination: createPagination(result),
          },
        });
      }
    },

    // 资格审查头信息
    *fetchQualificationHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQualificationHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationHeader: result,
          },
        });
      }
      return result;
    },

    // 资格审查头信息 - 分标段
    *fetchQualificationSectionHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQualificationSectionHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationHeader: result,
          },
        });
      }
      return result;
    },

    // 资格审查list
    *fetchQualificationLineList({ payload }, { call, put }) {
      let result = yield call(fetchQualificationLineList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationLine: dealDataState(result.content),
            qualificationLinePagination: createPagination(result),
          },
        });
      }
    },

    // 资格审查list - 分标段
    *fetchQualificationSectionLineList({ payload }, { call, put }) {
      let result = yield call(fetchQualificationSectionLineList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationLine: dealDataState(result.content),
            qualificationLinePagination: createPagination(result),
          },
        });
      }
    },
    // 评分明细
    *fetchQualificationRankList({ payload }, { call, put }) {
      let result = yield call(fetchQualificationRankList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationRank: dealDataState(result),
            // qualificationRankPagination: createPagination(result),
          },
        });
      }
    },
    // 评分明细 - 分标段
    *fetchQualificationSectionRankList({ payload }, { call, put }) {
      let result = yield call(fetchQualificationSectionRankList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationRank: dealDataState(result),
            // qualificationRankPagination: createPagination(result),
          },
        });
      }
    },
    // 评分明细保存
    *saveQualificationRankList({ payload }, { call }) {
      const result = getResponse(yield call(saveQualificationRankList, payload));
      return result;
    },
    // 评分明细保存 - 分标段
    *saveQualificationSectionRankList({ payload }, { call }) {
      const result = getResponse(yield call(saveQualificationSectionRankList, payload));
      return result;
    },
    // 资格评审 - 保存
    *saveQualificationExamination({ payload }, { call }) {
      const result = getResponse(yield call(saveQualificationExamination, payload));
      return result;
    },
    // 资格评审 - 保存 - 分标段
    *saveQualificationSectionExamination({ payload }, { call }) {
      const result = getResponse(yield call(saveQualificationSectionExamination, payload));
      return result;
    },
    // 资格评审 - 提交
    *submitQualificationExamination({ payload }, { call }) {
      const result = getResponse(yield call(submitQualificationExamination, payload));
      return result;
    },
    // 资格评审 - 提交 - 分标段
    *submitQualificationSectionExamination({ payload }, { call }) {
      const result = getResponse(yield call(submitQualificationSectionExamination, payload));
      return result;
    },
    // 专家评审-资格审查汇总查询
    *fetchQualificationSum({ payload }, { call, put }) {
      let result = yield call(fetchQualificationSum, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationSum: dealDataState(sumDataSource(result)),
            qualificationSumDTO: result?.[0]?.summaryDTOList,
          },
        });
      }
    },
    // 专家评审-资格审查汇总查询-分标段
    *fetchQualificationSectionSum({ payload }, { call, put }) {
      let result = yield call(fetchQualificationSectionSum, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            qualificationSum: result,
          },
        });
      }
    },
    // 专家评审-资格审查汇总保存和提交
    *saveSubmitQualificationSum({ payload }, { call }) {
      const result = yield call(saveSubmitQualificationSum, payload);
      return getResponse(result);
    },
    // 专家评审-资格审查汇总保存和提交
    *saveSubmitQualificationSectionSum({ payload }, { call }) {
      const result = yield call(saveSubmitQualificationSectionSum, payload);
      return getResponse(result);
    },
    // 关闭
    *close({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 关闭招标书
    *closeBid({ payload }, { call }) {
      const res = yield call(quotationContBid, payload);
      return getResponse(res);
    },
    // 获取询价大厅维护头
    *fetchInquiryHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchScoreInquiryHeaderDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    // 获取物品明细列表
    *fetchInquiryItemLine({ payload }, { call, put }) {
      let result = yield call(fetchInquiryItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataState(result.content),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取供应商列表
    *fetchInquirySupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchInquirySupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content),
            supplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 供应商list
    *supplierInquiryRecord({ payload }, { call, put }) {
      let result = yield call(supplierInquiryRecord, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierData: dealDataState(result),
          },
        });
      }
    },
    // 操作记录
    *operationRecord({ payload }, { call, put }) {
      let result = yield call(fetchOperation, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationData: result.content,
            operationPagination: createPagination(result),
          },
        });
      }
    },
    // 请求stage
    *getStage({ payload }, { call, put }) {
      let res = yield call(getStage, payload);
      res = getResponse(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            stageData: dealDataState(res),
          },
        });
      }
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
    // 获取评分要素定义数据
    *fetchScoringElementData({ payload }, { call, put }) {
      let result = yield call(fetchScoringElementData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringElement: dealDataState(result),
          },
        });
      }
    },
    // 获取专家分配数据
    *fetchExpertAllocationData({ payload }, { call, put }) {
      let result = yield call(fetchExpertAllocationData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evaluateExpertList: dealDataState(result.evaluateExpertList),
          },
        });
      }
    },
    // 获取模板明细数据
    *fetchTempelateDetailData({ payload }, { call, put }) {
      let result = yield call(fetchTempelateDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringNoneTempelate: dealDataState(result.otherIndicList),
            scoringBusinessTempelate: dealDataState(result.businessIndicList),
            scoringTechnologyTempelate: dealDataState(result.technologyIndicList),
          },
        });
      }
    },
    // 评分要素-专家分配-查询
    *fetchEvaluateIndicAssign({ payload }, { call, put }) {
      let result = yield call(fetchEvaluateIndicAssign, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentScoringExperts: dealDataState(result),
          },
        });
      }
    },
    // 获取招标大厅维护头
    *fetchBidHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInquiryHeaderDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    // 获取物品明细列表
    *fetchItemLine({ payload }, { call, put }) {
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },
    // 获取供应商列表
    *fetchSupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content),
            supplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取招标小组
    *fetchBidMembers({ payload }, { call, put }) {
      let result = yield call(fetchBidMembers, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidMembersList: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 供应商list
    *supplierRecord({ payload }, { call, put }) {
      let result = yield call(fetchSupplier, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierData: dealDataState(result),
          },
        });
      }
    },
    // 再次询价
    *inquiryAgain({ payload }, { call }) {
      const result = getResponse(yield call(inquiryAgain, payload));
      return result;
    },
    // 获取物品行报价详情
    *fetchItemLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLineQuotationDetail: dealDataState(result),
          },
        });
      }

      return dealDataState(result);
    },
    // 开标人弹框表格
    *fetchBidholderList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBidholderList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidHolderList: dealDataState(result.content),
            bidHolderPagination: createPagination(result),
          },
        });
      }
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

    // 预审小组-分标段-查询
    *fetchPretrialSectionPanel({ payload }, { call, put }) {
      const response = yield call(fetchPretrialSectionPanel, payload);
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
