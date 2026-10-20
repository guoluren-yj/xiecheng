/*
 * @Date: 2023-10-20 17:18:23
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

export const getBasicDs = ({ evalHeaderId, evalGranularity }) => ({
  paging: false,
  forceValidate: true,
  queryParameter: {
    supFlag: 1,
    supplierTenantId: organizationId,
    selectOptional: paramItem[evalGranularity],
  },
  fields: [
    {
      name: 'evalNum',
      label: intl.get(`sslm.common.model.archive.num`).d('档案编码'),
    },
    {
      name: 'evalName',
      label: intl.get(`sslm.common.model.archive.describe`).d('档案描述'),
    },
    {
      name: 'evalStatus',
      label: intl.get(`sslm.common.model.archive.status`).d('档案状态'),
    },
    {
      name: 'evalTplName',
      label: intl.get(`sslm.common.model.evaluation.template`).d('考评模板'),
    },
    {
      name: 'evalDimensionMeaning',
      label: intl.get(`sslm.common.view.archiveFilled.evaluationDimension`).d('考评维度'),
    },
    {
      name: 'evalDimensionValueMeaning',
      label: intl.get(`sslm.common.model.dimension.value`).d('维度值'),
    },
    {
      name: 'evalCycleMeaning',
      label: intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sslm.common.model.archive.create.time`).d('建档时间'),
    },
    {
      name: 'createdUserName',
      label: intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人'),
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      name: 'docTypeMeaning',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docType`).d('单据类型'),
    },
    {
      name: 'docNum',
      type: 'object',
      multiple: true,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docNum`).d('单据'),
      dynamicProps: {
        lovCode: ({ record }) => {
          const docType = record.get('docType');
          return docType === 'YS'
            ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
            : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT';
        },
      },
      transformRequest: value => value && value.docNum,
      transformResponse: (value, data) => value && data.docNumMeaning,
    },
    {
      name: 'appealDeadlineMeaning',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealDeadlineMeaning`)
        .d('申诉期限'),
    },
    {
      name: 'appealDeadlineTime',
      type: 'dateTime',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealDeadlineTime`)
        .d('申诉截止时间'),
    },
    {
      name: 'appealLimitMeaning',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealLimitMeaning`)
        .d('申诉次数限制'),
    },
    {
      name: 'useTimes',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.appealSum`).d('申诉次数'),
    },
    {
      name: 'evalRuleRemark',
      label: intl.get(`sslm.common.model.evaluation.rule`).d('考评规则说明'),
    },
    {
      name: 'remark',
      label: intl.get(`sslm.common.model.evaluation.remark`).d('考评说明'),
    },
    {
      name: 'evalResultRemark',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.evalResultRemark`)
        .d('考评结果说明'),
    },
    {
      name: 'confirmSupplierUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
      label: intl.get(`sslm.common.model.field.confirmSupplierAttachment`).d('供应商确认附件'),
      dynamicProps: {
        readOnly: ({ record }) => !record.get('allowPublishedFlag'),
      },
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/result/supplier/${evalHeaderId}`,
      method: 'GET',
    },
  },
});
