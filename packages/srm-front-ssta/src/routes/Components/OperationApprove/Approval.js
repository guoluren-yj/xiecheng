import { fetchApprovalData } from '@/services/costSheetService';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';


async function hasApprovalData(primaryId, documentType) {
  const res = await fetchApprovalData({
    primaryId,
    documentType,
  });
  if (getResponse(res)) {
    return !isEmpty(res);
  }
  return false;
}

export { hasApprovalData };
