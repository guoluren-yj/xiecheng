import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const DetailInfoDS = (bomViewId) => ({
  primaryKey: 'bomDetailsLineId',
  idField: 'bomDetailsLineId',
  parentField: 'parentId',
  expandField: 'expand',
  fields: [
    {
      name: 'bomViewId',
      defaultValue: bomViewId,
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/${bomViewId}/details-line`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/save-details-lines`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/delete-details-lines`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { DetailInfoDS };
