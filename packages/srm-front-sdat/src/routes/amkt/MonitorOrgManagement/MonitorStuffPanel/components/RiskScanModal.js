/* eslint-disable no-unneeded-ternary */
import React, { useState, useEffect } from 'react';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { getRiskScanUrl } from '@/services/monitorOrgManagementService';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const RiskScanModal = ({ record = '', enterpriseName = '' }) => {
  const [urlStr, setUrl] = useState('');

  useEffect(() => {
    const keyWord = enterpriseName ? enterpriseName : record?.get('enterpriseName') ?? '';
    getRiskScanUrl({
      keyword: keyWord,
      ...passParams,
    }).then((res) => {
      if (res && res.success) {
        setUrl(res?.data ?? '');
      } else {
        notification.error({
          message: res?.msg ?? '',
        });
      }
    });
  }, [record, enterpriseName]);

  return (
    <>
      {urlStr ? (
        <iframe title={urlStr} src={urlStr} frameBorder={0} height="100%" width="100%" />
      ) : null}
    </>
  );
};

export default RiskScanModal;
