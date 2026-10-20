/*
 * @Date: 2023-11-07 16:01:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();

export const getIndexDs = () => ({
  pageSize: 20,
  primaryKey: 'evalHeaderId',
  queryParameter: {
    supplierTenantId: organizationId,
    pageEntryPoint: 'CUSTOMER_OWNED',
    customizeUnitCode: [
      'SSLM.APPRAISAL_SUPPLIER_LIST.TABLE',
      'SSLM.APPRAISAL_SUPPLIER_LIST.SEARCH_BAR',
    ].join(),
  },
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'evalStatusMeaning',
    },
    {
      label: intl.get(`sslm.common.model.archive.num`).d('档案编码'),
      name: 'evalNum',
    },
    {
      label: intl.get(`sslm.common.model.archive.describe`).d('档案描述'),
      name: 'evalName',
    },
    {
      name: 'evalTplName',
      label: intl.get(`sslm.common.model.evaluation.template`).d('考评模板'),
    },
    {
      label: intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期'),
      name: 'evalCycleMeaning',
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      name: 'evalDimensionMeaning',
      label: intl.get(`sslm.common.view.archiveFilled.evaluationDimension`).d('考评维度'),
    },
    {
      label: intl.get(`sslm.common.model.dimension.value`).d('维度值'),
      name: 'evalDimensionValueMeaning',
    },
    {
      label: intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人'),
      name: 'createdUserName',
    },
    {
      label: intl.get(`sslm.common.model.archive.create.time`).d('建档时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-mange/result/supplier`,
      method: 'GET',
    },
  },
});
