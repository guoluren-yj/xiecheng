/* eslint-disable no-unneeded-ternary */
import React, { useState, useEffect } from 'react';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { getRiskScanUrl } from '@/services/riskControl/monitorBusinessService';

const { realName, id, loginName = '' } = getCurrentUser();

let commonParams = {
  userId: id,
  tenantId: getCurrentOrganizationId(),
  operateName: realName,
  realName,
  loginName,
};

const RiskScanModal = ({ record = '', enterpriseName = '' }) => {
  const [urlStr, setUrl] = useState('');

  useEffect(() => {
    return () => {
      commonParams = {};
    };
  }, []);

  useEffect(() => {
    const keyWord = enterpriseName ? enterpriseName : record?.get('enterpriseName') ?? '';
    getRiskScanUrl({
      keyWord,
      gatewayUrl: location?.origin ?? '',
      ...commonParams,
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
