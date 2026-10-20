/*
 * @Date: 2023-10-18 16:29:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getBasicDs = ({ isEdit, type, isCreate, evalTplId } = {}) => ({
  paging: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'evalTplCode',
      disabled: !isCreate,
      pattern: /^[0-9A-Za-z-_]*$/,
      label: intl.get('sslm.common.model.template.code').d('模板编码'),
    },
    {
      name: 'evalTplName',
      required: isEdit,
      label: intl.get('sslm.common.model.template.name').d('模板描述'),
    },
    {
      name: 'evalTplType',
      required: isEdit,
      lookupCode: 'SSLM.KPI_EVAL_TPL_TYPE_NEW',
      label: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplType`).d('模板类型'),
      dynamicProps: {
        disabled: ({ record }) => record.get('evalTplId') || type === 'COPY',
      },
    },
    {
      name: 'versionNum',
      disabled: true,
      label: intl.get('sslm.common.version.number').d('版本'),
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
    {
      name: 'enabledFlag',
      defaultValue: 1,
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/detail/${evalTplId}`,
      method: 'GET',
    },
  },
});
