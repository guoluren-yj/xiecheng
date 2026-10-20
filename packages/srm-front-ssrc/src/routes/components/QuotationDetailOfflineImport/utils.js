
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { fetchImportStatusInfo, } from './api';


const getImportStatusInfos = async (params) => {
  const {
    sourceFrom = 'RFX',
    templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
    sourceHeaderId,
    batch,
    formValues,
  } = params || {};

  let result = null;

  if (!batch || !templateCode) {
    return result;
  };

  try {
    result = await fetchImportStatusInfo({
      sourceFrom,
      templateCode,
      organizationId: getCurrentOrganizationId(),
      sourceHeaderId,
      batch,
      ...(formValues || {}),
    });
    result = getResponse(result);
    if (!result) {
      return result;
    }


    return result;
  } catch (e) {
    throw e;
  }
};

export { getImportStatusInfos};
