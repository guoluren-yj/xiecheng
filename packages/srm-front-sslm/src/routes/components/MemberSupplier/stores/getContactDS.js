/*
 * @Date: 2024-08-01 17:10:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const contactDS = ({ multiple = false } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'userId',
      label: intl.get('sslm.common.model.field.account').d('账号'),
      type: 'object',
      multiple,
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
      lovPara: { tenantId, enabledFlag: 1 },
      textField: 'loginName',
      transformRequest: value => value?.id,
      transformResponse: (value, data) =>
        value
          ? {
              id: data.userId,
              email: data.email,
              mobile: data.phone,
              name: data.realName,
              loginName: data.loginName,
            }
          : null,
    },
    {
      name: 'realName',
      bind: 'userId.name',
      label: intl.get('sslm.common.model.field.name').d('名称'),
    },
    {
      name: 'email',
      bind: 'userId.email',
      label: intl.get('hzero.common.email').d('邮箱'),
    },
    {
      name: 'phone',
      bind: 'userId.mobile',
      label: intl.get('sslm.supplierManage.model.supplierManage.contactPhone').d('手机号码'),
    },
  ],
  transport: {
    destroy: {
      url: `${SRM_PLATFORM}/v1/${tenantId}/company-member-contacts/batch-delete`,
      method: 'DELETE',
    },
  },
});
