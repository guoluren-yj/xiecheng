/*
 * @Date: 2023-10-23 17:03:14
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';

import { bucketDirectory } from '@/routes/utils/utils';

const organizationId = getCurrentOrganizationId();

// 左侧筛选ds
export const getLeftFitlterDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'extraParameter',
    },
    {
      name: 'lineScoreStatus',
      type: 'boolean',
      trueValue: '0',
      falseValue: '1',
    },
    {
      name: 'dimension',
      defaultValue: 'SU',
    },
  ],
});

// 评分信息
export const getScoreInfoDs = ({ evalGranularity, evalHeaderId }) => ({
  pageSize: 20,
  forceValidate: true,
  primaryKey: 'evalDtlId',
  record: {
    dynamicProps: {
      selectable: record => record.get('completeFlag') !== 4,
    },
  },
  fields: [
    {
      label: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
      name: 'supplierName',
    },
    {
      name: 'categoryName',
      dynamicProps: {
        label: () => {
          return evalGranularity === 'RULE_SU'
            ? intl.get('sslm.common.model.archiveFilled.suppilerRule').d('供应商规则')
            : intl.get('sslm.common.model.archiveFilled.purchaseCategory').d('采购品类');
        },
      },
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.item').d('物料'),
      name: 'itemName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.scoreItem').d('评分细项'),
      name: 'indicatorName',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.scoreStandard').d('评分标准'),
      name: 'evalStandard',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.completeFlag').d('评分状态'),
      name: 'completeFlagMeaning',
    },
    {
      label: intl.get('sslm.common.model.supplierKpiIndicator.indicatorType').d('指标类型'),
      name: 'indicatorTypeMeaning',
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.score').d('得分'),
      name: 'finalScore',
      type: 'number',
      numberGrouping: false,
      dynamicProps: {
        defaultValue: ({ record }) => record.get('defaultScore'),
        required: ({ record }) => {
          const { indicatorType, completeFlag } = record.get(['indicatorType', 'completeFlag']);
          return completeFlag !== 4 && ['SCORE'].includes(indicatorType);
        },
        max: ({ record }) => {
          const { indicatorType, completeFlag } = record.get(['indicatorType', 'completeFlag']);
          return completeFlag !== 4 && ['SCORE'].includes(indicatorType) ? 'scoreTo' : null;
        },
        min: ({ record }) => {
          const { indicatorType, completeFlag } = record.get(['indicatorType', 'completeFlag']);
          return completeFlag !== 4 && ['SCORE'].includes(indicatorType) ? 'scoreFrom' : null;
        },
      },
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.indexWeight').d('指标权重%'),
      name: 'evalWeight',
      type: 'number',
      numberGrouping: false,
    },
    {
      name: 'score',
      label: intl.get('sslm.common.model.field.mark').d('分值'),
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.scoreFrom').d('分值从'),
      name: 'scoreFrom',
      type: 'number',
      numberGrouping: false,
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.scoreTo').d('分值至'),
      name: 'scoreTo',
      type: 'number',
      numberGrouping: false,
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.gradersWeight').d('评分人权重%'),
      name: 'respWeight',
      type: 'number',
      numberGrouping: false,
    },
    {
      name: 'isStandard',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.common.model.archiveFilled.isStandard').d('符合评分标准'),
      transformRequest: value => (isNil(value) ? 0 : value),
    },
    {
      name: 'isVeto',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.common.model.archiveFilled.isVeto').d('否决该项'),
      transformRequest: value => (isNil(value) ? 0 : value),
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.indOptName').d('评分选项'),
      name: 'indOptName',
      lookupCode: 'SSLM.KPI.INDICATOR.OPT.CFG',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            evalTplIndId: record.get('indicatorId'),
            tenantId: organizationId,
            page: 0,
            size: 0,
          };
        },
        required: ({ record }) => {
          const { completeFlag, indicatorType } = record.get(['completeFlag', 'indicatorType']);
          return completeFlag !== 4 && indicatorType === 'OPT';
        },
      },
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.feedbackRemark').d('反馈说明'),
      name: 'remark',
      maxLength: 600,
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.transmitReason').d('转交原因'),
      name: 'transformReason',
    },
    {
      name: 'scorerAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
      label: intl.get('sslm.common.model.attachment.upload').d('附件上传'),
    },
    {
      label: intl.get('sslm.common.model.archiveFilled.backReason').d('退回原因'),
      name: 'backReason',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...rest } = data || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-headers/evaluation/new/${evalHeaderId}`,
        method: 'GET',
        data: {
          ...queryParams,
          ...rest,
        },
      };
    },
  },
  events: {
    query: async ({ dataSet }) => {
      if (dataSet.dirty) {
        const validate = await dataSet.validate();
        if (!validate) {
          return false;
        }
      }
    },
    update: ({ name, record, value, dataSet }) => {
      switch (name) {
        case 'indOptName':
          {
            const indOptField = dataSet.getField(name);
            const indOptObj = indOptField?.getLookupData(value, record) || {};
            record.set({
              evalTplIndOptId: indOptObj.value,
              finalScore: indOptObj.score,
            });
          }
          break;
        default:
          break;
      }
    },
  },
});

// 转交评分人
export const getTransferDs = ({ averageFlag, weightSameFlag }) => ({
  paging: false,
  dataToJSON: 'all',
  forceValidate: true,
  fields: [
    {
      name: 'loginName',
      type: 'object',
      required: true,
      textField: 'loginName',
      valueField: 'loginName',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
      transformRequest: value => value && value.loginName,
      transformResponse: (value, data) =>
        value
          ? {
              loginName: data.loginName,
              userId: data.respUserId,
              userName: data.userName,
              unitName: data.userDepartment,
            }
          : null,
    },
    {
      name: 'respUserId',
      bind: 'loginName.userId',
    },
    {
      name: 'userName',
      bind: 'loginName.userName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
    },
    {
      name: 'userDepartment',
      bind: 'loginName.unitName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.department`).d('部门'),
    },
    {
      name: 'respWeight',
      type: 'number',
      numberGrouping: false,
      required: !averageFlag && weightSameFlag,
      disabled: averageFlag || !weightSameFlag,
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
    },
    {
      name: 'transformReason',
      label: intl.get('sslm.supplierDocManage.model.docManage.transmitReason').d('转交原因'),
    },
  ],
});
