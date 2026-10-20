import React, { useContext } from 'react';
import intl from 'utils/intl';
import { Spin } from 'choerodon-ui/pro';
import { Store } from './index';
import { useRenderMeaning } from '../hooks';

import C7nFromWrapper from '@/routes/components/C7nFormWrapper';
import styles from '../index.less';

export default function BaseLogisticInfo() {
  const { LogisticsDs, loading, editFlag, customizeForm } = useContext(Store);
  const getFields = [
    {
      name: 'logisticsCompany',
      renderer: useRenderMeaning('logisticsCompany'),
    },
    {
      name: 'logisticsContactInfo',
    },
    { name: 'logisticsCost' },
    { name: 'expressNum' },
    {
      name: 'logisticsPhoneNum',
      // renderer: ({ value, record }) => (
      //   <span>{value && record.get('internationalTelMeaning') | value}</span>
      // ),
      renderer: ({ value, record }) =>
        `${(record && record.get('internationalTelMeaning')) || ''} | ${value || ''}`,
    },
    { name: 'logisticsStaff' },
    { name: 'carNumber' },
  ];

  return (
    <>
      <div className={styles['logistics-title']}>
        {intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
      </div>
      <div className={styles['logistics-basic']}>
        <Spin spinning={loading}>
          <C7nFromWrapper
            readOnly={editFlag}
            dataSet={LogisticsDs}
            columns={3}
            fields={getFields}
            customizeForm={customizeForm}
            customizeCode="SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS"
          />
        </Spin>
      </div>
    </>
  );
}
