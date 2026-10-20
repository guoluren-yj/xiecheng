/*
 * @Date: 2023-10-20 15:09:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getIndexDs = type => ({
  pageSize: 20,
  selection: false,
  queryParameter: {
    pageEntryPoint: 'CUSTOMER_OWNED',
  },
  fields: [
    {
      name: 'scoreStatus',
      label: intl.get('sslm.common.model.archiveFilled.completeFlag').d('评分状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'evalNum',
      label: intl.get('sslm.common.model.archive.fileCode').d('档案编码'),
    },
    {
      name: 'evalStatusMeaning',
      label: intl.get('sslm.common.model.archive.status').d('档案状态'),
    },
    {
      name: 'evalName',
      label: intl.get('sslm.common.model.archive.fileDescribe').d('档案描述'),
    },
    {
      name: 'evalTplName',
      label: intl.get('sslm.common.model.evaluation.template').d('考评模板'),
    },
    {
      name: 'evalTplTypeMeaning',
      label: intl.get('sslm.common.model.evaluation.evalTplType').d('模板类型'),
    },
    {
      name: 'kpiMethodMeaning',
      label: intl.get('sslm.common.model.archive.kpiMethod').d('考评方式'),
    },
    {
      name: 'evalCycleMeaning',
      label: intl.get('sslm.common.model.archive.evaluationCycle').d('考评周期'),
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      name: 'evalDimensionMeaning',
      label: intl.get('sslm.common.model.evaluation.dimension').d('考评维度'),
    },
    {
      name: 'evalDimensionValueMeaning',
      label: intl.get('sslm.common.model.dimension.value').d('维度值'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sslm.common.model.evaluation.createdUserName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.archive.create.time').d('建档时间'),
    },
  ],
  transport: {
    read: ({ params }) => {
      const path = type === 'UN_COMPLETE' ? 'eval-manage/evaluating' : 'evaluate/all';
      const otherParams = type === 'UN_COMPLETE' ? {} : { allQueryFlag: 1 };
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/${path}`,
        method: 'GET',
        params: {
          ...params,
          ...otherParams,
        },
      };
    },
  },
});
