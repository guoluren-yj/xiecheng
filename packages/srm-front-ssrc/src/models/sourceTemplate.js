/**
 * model 模板创建
 * @date: 2018-12-24
 * @author: chao.li03@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  searchSourceTemp,
  templateSave,
  templateDetail,
  templateRelease,
  saveCopySourceTemp,
  saveCopyRFTemp,
  fetchConfigSheetRfxPrepare,
} from '@/services/sourceTemplateService';
import { queryIdpValue, queryMapIdpValue } from 'services/api';

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

const newKeyFiledRFXInfo = [
  {
    fieldName: 'techAttachmentUuid',
    requiredFlag: 0,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 1,
  },
  {
    fieldName: 'businessAttachmentUuid',
    requiredFlag: 0,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 1,
  },
  {
    fieldName: 'supplierTechAttachmentUuid',
    requiredFlag: 0,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 0,
  },
  {
    fieldName: 'supplierBusinessAttachmentUuid',
    requiredFlag: 0,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 0,
  },
];

const newKeyFiledBIDInfo = [
  {
    fieldName: 'totalBudget',
    requiredFlag: 0,
    beforeVisibleFlag: 0,
    afterVisibleFlag: 0,
    supplierVisibleFlag: 0, // 供应商可见
    prequalVisibleFlag: 0, // 预审通过前可见
  },
  {
    fieldName: 'techAttachmentUuid',
    requiredFlag: 1,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 1,
  },
  {
    fieldName: 'businessAttachmentUuid',
    requiredFlag: 1,
    beforeVisibleFlag: 1,
    afterVisibleFlag: 1,
    supplierVisibleFlag: 1,
    prequalVisibleFlag: 1,
  },
];

export default {
  namespace: 'sourceTemplate',
  state: {
    list: [], // 寻源模板数据列表
    pagination: {}, // 分页
    sourceCategory: [],
    test: [],
    detail: {}, // 模板详情
    sourceTempStatus: [], // 模板状态
    sourceGaty: [], // 寻源类别
    approve: [], // 发布审批
    resultApprove: [], // 结果审批
    bidRule: [], // 标书规则
    sourceQualification: [], // 资格审查方式
    expertScore: [], // 专家评分
    sourceStage: [], // 招标阶段
    openBid: [], // 开标步制
    subjectMater: [], // 标的规则
    validDateInput: [], // 报价有效期填写方式
    autoDefer: [], // 延时触发规则
    sourceMd: [], // 寻源方式
    quotationType: [], // 报价方式
    sourceAuctionDir: [], // 报价方向
    quotationChange: [], // 供应商升降价设置
    detailPriceControlRule: [], // 报价明细总价管控
    reaAuction: [], // 竞价规则
    reaOpen: [], // 公开规则
    // reaAuctionRank: [], // 竞价排名
    sourcePrice: [], // 价格类型
    sourceTy: [], // 寻源类型
    roundQuotationRule: [], // 多轮报价规则
    preApproveType: [], // 一阶段评审结果审批
    newKeyFiledRFXInfo: dealDataState(newKeyFiledRFXInfo), // 关键字显示控制弹框中的数据
    newKeyFiledBIDInfo: dealDataState(newKeyFiledBIDInfo),
    bargainRule: [], // 议价规则
    rankRules: [], // 排名规则
    budgetControlRules: [], // 预算控制规则
    configInfo: [], // 配置表信息
    selectionStrategys: [], // 选择策略
    initialReview: [], // 初步评审
    releaseApprove: [], // 发布审批
    autoScorePriceTypeList: [], // 自动评分价格取值
  },
  effects: {
    // 查询
    *fetchSourceTemp({ payload }, { call, put }) {
      let result = yield call(searchSourceTemp, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新建/保存
    *templateSave({ payload }, { call }) {
      const result = yield call(templateSave, payload);
      return getResponse(result);
    },
    // 查看详情
    *templateDetail({ payload }, { call, put }) {
      const result = yield call(templateDetail, payload);
      // return getResponse(result);
      if (result) {
        const dataSource =
          result.sourceCategory === 'RFQ' || result.sourceCategory === 'RFA'
            ? 'newKeyFiledRFXInfo'
            : 'newKeyFiledBIDInfo';
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
            [dataSource]: dealDataState(result.tmplFieldCols.reverse()),
          },
        });
        return result;
      }
    },
    // 发布
    *templateRelease({ payload }, { call }) {
      const result = yield call(templateRelease, payload);
      return getResponse(result);
    },
    // 获取值集
    *templateLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          sourceTempStatus: 'SSRC.SOURCE_TEMPLATE_STATUS', // 模板状态
          sourceGaty: 'SSRC.SOURCE_CATEGORY', // 寻源类别
          newSourceGaty: 'SSRC.SECONDARY_SOURCE_CATEGORY', // 新招标-寻源类别
          approve: 'SPFM.BUSINESS_APV_METHOD', // 审批
          bidRule: 'SSRC.BID_RULE_TYPE', // 标书规则
          sourceQualification: 'SSRC.SOURCE_QUALIFICATION_TYPE', // 资格审查方式
          expertScore: 'SSRC.EXPERT_SCORE_TYPE', // 专家评分方式
          openBid: 'SSRC.OPEN_BID_ORDER', // 开标步制
          sourceStage: 'SSRC.SOURCE_STAGE', // 招标阶段
          subjectMater: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
          validDateInput: 'SSRC.VALID_DATE_INPUT_TYPE', // 报价有效期填写方式
          autoDefer: 'SSRC.AUTO_DEFER_TYPE', // 延时触发规则
          sourceMd: 'SSRC.SOURCE_METHOD', // 寻源方式
          quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
          sourceAuctionDir: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
          quotationChange: 'SSRC.QUOTATION_CHANGE', // 供应商升降价设置
          detailPriceControlRule: 'SSRC.DETAIL_PRICE_CONTROL', // 报价明细总价管控
          reaAuction: 'SSRC.RFA_AUCTION_RULE', // 竞价规则
          reaOpen: 'SSRC.RFA_OPEN_RULE', // 公开规则
          // reaAuctionRank: 'SSRC.RFA_AUCTION_RANKING', // 竞价排名
          sourcePrice: 'SSRC.SOURCE_PRICE_CATEGORY', // 价格类型
          sourceTy: 'SSRC.SOURCE_TYPE', // 寻源类型
          quotationScope: 'SSRC.QUOTATION_SCOPE_CODE', // 报价范围
          roundQuotationRule: 'SSRC.ROUND_QUOTATION_RULE', // 多轮报价规则
          preApproveType: 'SPFM.BUSINESS_APV_METHOD', // 一阶段评审结果审批
          bargainRule: 'SSRC.BARGAIN_RULE', // 议价规则
          rankRules: 'SSRC.RANK_RULE', // 排名规则
          expertSources: 'SSRC.EXPERT_SOURCE', // 专家来源
          budgetControlRules: 'SSRC.BUDGET_CONTROL_RULE', // 预算控制规则
          scoreTemplateScoreType: 'SSRC.TEMPLATE_SCORE_TYPE', // 模板评分类型
          roundQuotationRankRules: 'SSRC.ROUND_RANK_RULE',
          selectionStrategys: 'SSRC.RFX_SELECTION_STRATEGY', // 选择策略
          initialReview: 'SSRC.INITIAL_REVIEW', // 初步评审
          autoDeferTimeRuleDate: 'SSRC.AUTO_DEFER_TIME_RULE', // 延时时间规则
          businessTechSees: 'SSRC.BUSINESS_TECH_SEE', // 商务/技术标隐藏配置
          scoringReportGenerationCtrl: 'SSRC.SCORING_REPORT_CTRL_RULE', // 评审结果附件上传管控
          checkRecommendationStrategys: 'SSRC.CHECK_RECOMMENDATION_STRATEGY', // 选用标准
          checkSelectionDimensions: 'SSRC.CHECK_SELECTION_DIMENSION', // 选用维度
          bidFileDownloadNodeData: 'SDEP.TENDER_FEES_DOWNLOAD_NODE', // 标书下载节点
          noticeEndNodeCode: 'SSRC.NOTICE_END_NODE_CODE', // 公告终止节点
          releaseApprove: 'SPFM.BUSINESS_RELEASE_APV_METHOD', // 发布审批
          scoreHideSupplierRule: 'SSRC.SCORE_HIDE_SUPPLIER_RULE', // 评分中隐藏供应商信息
          autoScorePriceTypeList: 'SSRC.AUTO_SCORE_PRICE_TYPE', // 自动评分价格取值
          announcementTypeList: 'SSRC.BID_ANNOUNCEMENT_TYPE', // 唱标价格公开范围
          announcementContentList: 'SSRC.BID_ANNOUNCEMENT_SCOPE_CODE', // 唱标内容选择
          clarifyApprovalTypeList: 'SSRC.APPROVE_TYPE', // 澄清答疑发布审批选择
          expertRequirementsRule: 'SSRC_EXPERT_REQUIREMENTS_RULE', // 专家需求数量抽取规则
          reviewHidePriceOptions: 'SSRC.COMPLIANCE_CHECK_HIDE_PRICE', // 符合性检查是否隐藏价格信息
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
      }
    },
    // 获取
    *fetchSourceCategory(_, { call, put }) {
      const sourceCategory = getResponse(yield call(queryIdpValue, 'SSRC.SOURCE_CATEGORY_SCORE'));
      yield put({
        type: 'updateState',
        payload: {
          sourceCategory,
        },
      });
    },
    // 获取
    *fetchSecondarySourceCategory({ payload }, { call, put }) {
      const secondarySourceCategory = getResponse(yield call(queryIdpValue, payload.code));
      yield put({
        type: 'updateState',
        payload: {
          secondarySourceCategory,
        },
      });
    },
    // 复制寻源模板
    *fetchSaveCopySourceTemp({ payload }, { call }) {
      const result = getResponse(yield call(saveCopySourceTemp, payload));
      if (result) {
        return result;
      }
    },
    // 复制RF模板
    *saveCopyRFTemp({ payload }, { call }) {
      const result = getResponse(yield call(saveCopyRFTemp, payload));
      if (result) {
        return result;
      }
    },
    // 获取配置表信息
    *fetchConfigSheetRfxPrepare({ payload }, { call, put }) {
      const configInfo = getResponse(yield call(fetchConfigSheetRfxPrepare, payload));
      yield put({
        type: 'updateState',
        payload: {
          configInfo,
        },
      });
      return configInfo;
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // 初始化可配置套框的初始值
    updateEditTableState(state) {
      return {
        ...state,
        newKeyFiledRFXInfo: dealDataState(newKeyFiledRFXInfo),
        newKeyFiledBIDInfo: dealDataState(newKeyFiledBIDInfo),
      };
    },
  },
};
