/* eslint-disable no-unneeded-ternary */
import React, { useState, useEffect } from 'react';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';

import { getRiskScanUrl } from '@/services/monitorBusinessService';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const commonParam = {
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
      ...commonParam,
    }).then((res) => {
      if (res && res.success) {
        setUrl(res?.data ?? '');
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
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
