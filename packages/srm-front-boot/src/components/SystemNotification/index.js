import React, { useState, useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '../../utils/config';
import SystemNotificationModal from './SystemNotificationModal';
import SupplierPaymentModal from './SupplierPaymentModal';

export default function SystemNotification() {
  const [modals, getModals] = useState([]);

  useEffect(() => {
    queryModals();
  }, []);

  const queryModals = () => {
    const currentOrganizationId = getCurrentOrganizationId();
    const url =
      currentOrganizationId === 0
        ? `${SRM_PLATFORM}/v1/platform-popup-notice`
        : `${SRM_PLATFORM}/v1/${currentOrganizationId}/platform-popup-notice`;
    request(url, {
      method: 'GET',
    }).then((res) => {
      if (res) {
        getModals(res);
      }
    });
  };

  const readNotice = (noticeId) => {
    return request(`${SRM_PLATFORM}/v1/notice-quantitys/gettimes`, {
      method: 'GET',
      query: {
        noticeId,
      },
    });
  };

  const onCancel = (noticeId) => {
    return request(`${SRM_PLATFORM}/v1/popup-notice/${noticeId}/ignore`, {
      method: 'POST',
    });
  };

  return (
    <React.Fragment>
      {modals.length > 0 &&
        modals.map((data = {}, index) => {
          if (data.noticeTypeCode === 'JFGG') {
            return (
              <SupplierPaymentModal
                noticeId={data.noticeId}
                key={data.noticeId}
                title={data.title}
                content={data.noticeBody}
                priority={index}
                cancel={onCancel}
              />
            );
          }
          return (
            <SystemNotificationModal
              noticeId={data.noticeId}
              key={data.noticeId}
              title={data.title}
              content={data.noticeBody}
              priority={index}
              cancel={onCancel}
              readNotice={readNotice}
            />
          );
        })}
    </React.Fragment>
  );
}
