/**
 * 明细头Ds
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getHeaderDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.company').d('公司'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.supplierLife').d('供应商生命周期'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam: { supplyAbilityId, ...others } = {} } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/${supplyAbilityId}`,
        method: 'GET',
        data: {
          ...others,
          ...params,
        },
      };
    },
  },
});

export { getHeaderDs };
