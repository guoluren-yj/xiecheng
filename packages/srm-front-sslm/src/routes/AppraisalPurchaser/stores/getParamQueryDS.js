/*
 * @Date: 2023-11-03 14:22:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getUserOrganizationId } from 'utils/utils';

const organizationId = getUserOrganizationId();

export const getParamQueryDs = ({ evalDtlId }) => ({
  pageSize: 20,
  selection: false,
  autoQuery: true,
  queryParameter: {
    evalDtlId,
  },
  fields: [
    {
      label: intl.get('sslm.common.model.evalDocManage.paramName').d('参数名称'),
      name: 'paramDescription',
    },
    {
      label: intl.get('sslm.common.model.evalDocManage.calculatedValue').d('计算值'),
      name: 'paramValue',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-processs/${evalDtlId}`,
      method: 'GET',
    },
  },
});

export const getParamQueryColumns = () => [
  {
    name: 'paramDescription',
  },
  {
    name: 'paramValue',
  },
];
