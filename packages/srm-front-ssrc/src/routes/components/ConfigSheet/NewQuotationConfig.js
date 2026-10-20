import { isEmpty } from 'lodash';

import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';

import { fetchConfigSheet } from '@/services/inquiryHallNewService';

export async function fetchNewQuotationConfigSheet(param = {}) {
  let data = -1;

  const params = {
    configCode: 'ssrc_rfx_offline_whole_config',
    organizationId: getCurrentOrganizationId,
    data: {
      tenantNum: getCurrentTenant().tenantNum,
    },
    ...(param || {}),
  };

  try {
    data = getResponse(await fetchConfigSheet(params));
    if (data && !data.failed) {
      if (!isEmpty(data)) {
        data = 1;
      } else {
        data = 0;
      }
    }
  } catch (e) {
    throw e;
  }

  return data;
}
