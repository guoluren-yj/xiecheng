import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { baseDsFields, tableDsFields } from './dataSource';

const organizationId = getCurrentOrganizationId();

const baseDs = () => ({
  selection: false,
  fields: baseDsFields(),
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/detail`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMODR.REQUEST.DETAIL.WORKFLOW',
        },
      };
    },
  },
});

const tableDs = (type = undefined) => ({
  selection: false,
  cacheSelection: true,
  forceValidate: true,
  primaryKey: 'requestEntryId',
  pageSize: 20,
  fields: tableDsFields(type),
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/list`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMODR.REQUEST.DETAIL.WORKFLOW.SKU.INFO',
        },
      };
    },
  },
});



export { baseDs, tableDs };