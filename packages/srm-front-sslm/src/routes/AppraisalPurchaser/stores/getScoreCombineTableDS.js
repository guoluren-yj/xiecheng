/*
 * @Date: 2023-11-20 13:47:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';

import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();

export const getScoreCombineTableDs = ({ evalTplId, evalHeaderId, isAppeal = false } = {}) => ({
  pageSize: 20,
  paging: !isAppeal,
  forceValidate: true,
  primaryKey: 'evalLineId',
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
      label: intl.get(`sslm.supplierDocManage.model.docManage.sumScore`).d('汇总得分'),
      name: 'lineScore',
      type: 'number',
    },
    {
      name: 'checkCollectScore',
      type: 'number',
      label: intl.get('sslm.common.model.docManage.checkCollectScore').d('校准得分'),
    },
    {
      name: 'rankNum',
      label: isAppeal
        ? intl.get('sslm.supplierDocManage.model.docManage.oldRanking').d('原排名')
        : intl.get('sslm.common.model.field.rank').d('排名'),
      type: 'number',
    },
    {
      name: 'levelCode',
      label: isAppeal
        ? intl.get('sslm.supplierDocManage.model.docManage.oldGrade').d('原等级')
        : intl.get('sslm.common.model.archiveFilled.level').d('等级'),
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.checkLevelDesc').d('校准等级'),
      name: 'checkLevelDesc',
      lookupCode: 'SSLM.KPI_TPL_EVAL_COLLECT_LEVEL_CODE',
      noCache: true,
      dynamicProps: {
        lovPara: () => {
          // 需要函数形式，否则无法传参
          return { evalTplId };
        },
      },
    },
    {
      name: 'executeAction',
      multiple: ',',
      lookupCode: 'SSLM_KPI_EVAL_EXECUTE_ACTION',
      label: intl.get('sslm.common.model.field.subsequentExecutionAction').d('后续执行动作'),
    },
    {
      name: 'toStageDescription',
      label: intl.get('sslm.common.model.field.executionTarget').d('执行目标'),
    },
    {
      label: intl.get('sslm.common.model.field.executionDocument').d('执行单据'),
      name: 'executeTotalCount',
    },
    {
      name: 'publishDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
    // 申诉字段
    {
      name: 'appealRemark',
      label: intl.get(`sslm.common.model.feedback.complaintRemark`).d('申诉说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
      label: intl.get(`sslm.common.model.evaluation.supplierAttachment`).d('供方上传附件'),
    },
    {
      name: 'appealLevelCode',
      label: intl.get(`sslm.common.model.feedback.newRank`).d('新等级'),
    },
    {
      name: 'appealRankNum',
      type: 'number',
      label: intl.get(`sslm.common.model.feedback.newRanking`).d('新排名'),
    },
    {
      name: 'appealCheckCollectScore',
      type: 'number',
      numberGrouping: false,
      label: intl.get(`sslm.common.model.feedback.calibrationGrade`).d('校准分数'),
    },
    {
      name: 'appealReply',
      label: intl.get(`sslm.common.model.feedback.appealReply`).d('采购方回复'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/preview/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
  },
});

// 供应商下的指标
export const getSupplierIndicatorDs = ({ evalRespRule, evalLineId, respCalMethod } = {}) => ({
  paging: false,
  selection: false,
  forceValidate: true,
  idField: 'evalTplIndId',
  childrenField: 'children',
  parentField: 'parentId',
  fields: [
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationStatus').d('评分状态'),
      name: 'completeFlag',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorCode').d('指标编码'),
      name: 'indicatorCode',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorName').d('指标描述'),
      name: 'indicatorName',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorType').d('指标类型'),
      name: 'indicatorType',
      lookupCode: 'SSLM.KPI_INDICATOR_TYPE',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationWay').d('评分方式'),
      name: 'scoreType',
      lookupCode: 'SPFM.KPI_SCORE_TYPE',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.processRemark').d('系统计算说明'),
      name: 'processRemark',
    },
    {
      label: intl.get('sslm.common.view.title.paramQuery').d('参数值查询'),
      name: 'paramQuery',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationStandard').d('评分标准'),
      name: 'evalStandard',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.indexWeight').d('指标权重%'),
      name: 'evalWeight',
      type: 'number',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore').d('基准分值'),
      name: 'benchmarkScore',
      type: 'number',
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
      name: 'scoreFrom',
      type: 'number',
      label: intl.get('sslm.scoreLevel.model.scoreLevel.indicatorScoreFrom').d('指标分值从(=)'),
    },
    {
      name: 'scoreTo',
      type: 'number',
      label: intl.get('sslm.scoreLevel.model.scoreLevel.indicatorScoreTo').d('指标分值至(<)'),
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
      name: 'finalScore',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.checkDetailScore`).d('校准明细得分'),
      name: 'checkDetailScore',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalWeightScore').d('指标权重得分'),
      name: 'evalWeightScore',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorLevelCode`).d('指标等级'),
      name: 'indicatorLevelCode',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.feedbackDescription`).d('反馈备注'),
      name: 'respRemarks',
    },
    {
      name: 'scorer',
      type: 'object',
      multiple: true,
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      textField: 'scorer',
      label: intl.get('sslm.common.modal.grade.realName').d('评分人'),
      transformResponse: (value, data) => {
        const { children, kpiEvalHeaderRespDmsList } = data;
        // 父级不展示评分人
        const dataList = isEmpty(children) ? kpiEvalHeaderRespDmsList : null;
        return dataList
          ? dataList.map(n => ({
              scorer:
                respCalMethod === 'AVERAGE'
                  ? `${n.respUserName}`
                  : n.respWeight
                  ? `${n.respUserName}-${n.respWeight}%`
                  : `${n.respUserName}`,
            }))
          : null;
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-datas/eval-manage/line/${evalRespRule}/${evalLineId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
  },
  events: {
    select: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.unSelect(i));
      }
    },
  },
});
