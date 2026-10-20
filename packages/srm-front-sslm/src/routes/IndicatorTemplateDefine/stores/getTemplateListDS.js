/*
 * @Date: 2023-10-17 15:18:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getTemplateListDs = () => ({
  selection: false,
  pageSize: 20,
  paging: 'server',
  childrenField: 'children',
  fields: [
    {
      name: 'evalStatusCode',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'evalTplCode',
      label: intl.get('sslm.common.model.template.code').d('模板编码'),
    },
    {
      name: 'evalTplName',
      label: intl.get('sslm.common.model.template.name').d('模板描述'),
    },
    {
      name: 'evalTplType',
      lookupCode: 'SSLM.KPI_EVAL_TPL_TYPE_NEW',
      label: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplType`).d('模版类型'),
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('sslm.common.version.number').d('版本'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.time.updateTime').d('更新时间'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/new/list`,
      method: 'GET',
    },
  },
});
