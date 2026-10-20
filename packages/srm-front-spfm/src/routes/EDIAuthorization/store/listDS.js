/**
 * listDS.js
 * EDI的供应商接口配置
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

export default function () {
  return {
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'authId',
      },
      {
        name: 'supplierCompanyObj',
        type: 'object',
        textField: 'supplierCompanyCode',
        valueField: 'supplierCompanyCode',
        lovCode: 'SPFM.ERP.SUPPLIER',
        ignore: 'always',
        required: true,
        label: intl.get('spfm.ediAuth.model.view.supplierCompanyNum').d('内部供应商编码'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyObj.supplierCompanyCode',
        required: true,
        //  label: intl.get('spfm.ediAuth.model.view.supplierCompanyNum').d('内部供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyObj.supplierCompanyName',
        label: intl.get('spfm.ediAuth.model.view.supplierCompanyName').d('内部供应商描述'),
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyObj.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyObj.supplierTenantId',
      },
      {
        name: 'authUuid',
        type: 'string',
        label: intl.get('spfm.ediAuth.model.view.authUUid').d('令牌'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('spfm.ediAuth.model.view.enabledFlag').d('是否启用'),
      },
    ],
    queryFields: [
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('spfm.ediAuth.model.view.supplierCompanyNum').d('内部供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('spfm.ediAuth.model.view.supplierCompanyName').d('内部供应商描述'),
      },
      {
        name: 'authUuid',
        type: 'string',
        label: intl.get('spfm.ediAuth.model.view.authUUid').d('令牌'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'SPFM.ENABLED_FLAG',
        label: intl.get('spfm.ediAuth.model.view.enabledFlag').d('是否启用'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-itf-auths`,
        method: 'GET',
      },
      submit: ({ data = {} }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-itf-auths`,
          method: 'PUT',
          data: data.map((e) => {
            return { ...e, tenantId: organizationId };
          }),
        };
      },
    },
  };
}
