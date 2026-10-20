/*
 * @Date: 2023-11-01 17:47:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const paramItem = {
  SU: 'SUPPLIER',
  'SU+CA': 'SCORE',
  'SU+IT': 'SCORE',
};

// 评分结果列表ds
export const getResultListDs = ({ evalHeaderId, evalGranularity, paging = true } = {}) => ({
  paging,
  pageSize: 20,
  forceValidate: true,
  primaryKey: 'evalLineId',
  record: {
    dynamicProps: {
      selectable: record =>
        !['appealing', 'appealApprovaRejected', 'appealApprovaling'].includes(
          record.get('lineStatus')
        ),
    },
  },
  queryParameter: {
    queryParams: {
      supFlag: 1,
      supplierTenantId: organizationId,
      selectOptional: paramItem[evalGranularity],
      customizeUnitCode: [
        'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_TABLE',
        'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_SEARCH_BAR',
      ].join(),
    },
  },
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'lineStatusMeaning',
    },
    {
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.purchaseCategory').d('采购品类'),
      name: 'categoryName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.item').d('物料'),
      name: 'itemName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.score').d('得分'),
      name: 'lineScore',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.level').d('等级'),
      name: 'levelCode',
    },
    {
      label: intl.get('sslm.common.model.appraisal.ranking').d('考评排名'),
      name: 'rankNum',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.feedback.remark').d('反馈说明'),
      name: 'lineRemark',
    },
    {
      name: 'checkCollectScore',
      type: 'number',
      label: intl.get('sslm.common.model.docManage.checkCollectScore').d('校准得分'),
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.checkLevelDesc').d('校准等级'),
      name: 'checkLevelDesc',
    },
    {
      label: intl.get('sslm.common.model.evaluation.supplierAttachment').d('供方上传附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
    },
    {
      label: intl.get(`sslm.common.model.feedback.appealRemark`).d('供应商回复说明'),
      name: 'appealRemark',
    },
    {
      label: intl.get('sslm.common.model.feedback.calibrationGrade').d('校准分数'),
      name: 'appealCheckCollectScore',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.feedback.newRank').d('新等级'),
      name: 'appealLevelCode',
    },
    {
      label: intl.get('sslm.common.model.feedback.newRanking').d('新排名'),
      name: 'appealRankNum',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.feedback.purchaserReply').d('采购方回复'),
      name: 'appealReply',
    },
    {
      name: 'executeAction',
      multiple: ',',
      lookupCode: 'SSLM_KPI_EVAL_EXECUTE_ACTION',
      label: intl.get('sslm.common.model.field.subsequentExecutionAction').d('后续执行动作'),
    },
    {
      label: intl.get('sslm.common.model.field.executionDocument').d('执行单据'),
      name: 'executeTotalCount',
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParams } = data;
      const search = dataSet?.queryDataSet?.current?.toData() || {}; // 筛选器查询条件
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/preview/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...search },
      };
    },
  },
});

// 评分明细ds
export const getScoreDetailDs = ({ evalRespRule, evalLineId } = {}) => ({
  paging: false,
  selection: false,
  idField: 'evalDtlId',
  parentField: 'parentId',
  childrenField: 'children',
  fields: [
    {
      label: intl.get('sslm.common.model.indicator.code').d('指标编码'),
      name: 'indicatorCode',
    },
    {
      label: intl.get('sslm.common.model.indicator.desc').d('指标描述'),
      name: 'indicatorName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.indexWeight').d('指标权重%'),
      name: 'evalWeight',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalWeightScore').d('指标权重得分'),
      name: 'evalWeightScore',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.score.method').d('评分方式'),
      name: 'scoreType',
      lookupCode: 'SPFM.KPI_SCORE_TYPE',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationStatus').d('评分状态'),
      name: 'completeFlag',
    },
    {
      label: intl.get('sslm.common.model.supplierKpiIndicator.indicatorType').d('指标类型'),
      name: 'indicatorType',
      lookupCode: 'SSLM.KPI_INDICATOR_TYPE',
    },
    {
      label: intl.get('sslm.evaluationQuery.model.docManage.vetoFlag').d('已否决'),
      name: 'vetoFlag',
    },
    {
      label: intl.get('sslm.common.model.field.checked').d('已勾选'),
      name: 'standardFlag',
    },
    {
      label: intl.get('sslm.common.model.field.selected').d('已选择'),
      name: 'indOptFlag',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.score').d('得分'),
      name: 'finalScore',
      type: 'number',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.indicatorLevelCode').d('指标等级'),
      name: 'indicatorLevelCode',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.scoreStandard').d('评分标准'),
      name: 'evalStandard',
    },
    {
      label: intl
        .get('sslm.receivedEvaluationResult.model.score.feedbackDescription')
        .d('反馈说明'),
      name: 'respRemarks',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.checkDetailScore').d('校准明细得分'),
      name: 'checkDetailScore',
      type: 'number',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-datas/eval-manage/line/${evalRespRule}/${evalLineId}`,
      method: 'GET',
    },
  },
});

// 质量整改列表ds
export const getQualityRectifyDs = ({ evalHeaderId, supplierId }) => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  queryParameter: {
    orderSource: 'kpiEval',
  },
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'problemStatusMeaning',
    },
    {
      label: intl.get('sslm.common.view.document.number').d('单据编号'),
      name: 'problemNum',
    },
    {
      label: intl.get('sslm.common.model.field.qualityRectifyTitle').d('整改报告标题'),
      name: 'problemTitle',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/site_eval_external_orders/eval-manage/${evalHeaderId}/${supplierId}`,
      method: 'GET',
    },
  },
});
