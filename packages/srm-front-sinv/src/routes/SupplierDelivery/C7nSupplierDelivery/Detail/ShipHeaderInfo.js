import React, { useMemo, useContext, memo } from 'react';
import C7nFromWrapper from '@/routes/components/C7nFormWrapper';
import { Spin } from 'choerodon-ui/pro';
import { Store } from './index';

function ShipHeaderInfo() {
  const { customizeForm, ShipHeaderInfoDs, loading, editFlag } = useContext(Store);
  const getFields = useMemo(
    () => [
      { name: 'companyName' },
      { name: 'organizationName' },
      { name: 'shipToLocationAddress' },
      { name: 'actualReceiverName' },
      { name: 'contactInfo' },
    ],
    []
  );

  return (
    <Spin spinning={loading}>
      <C7nFromWrapper
        readOnly={editFlag}
        dataSet={ShipHeaderInfoDs}
        columns={3}
        fields={getFields}
        customizeForm={customizeForm}
        customizeCode="SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP"
      />
    </Spin>
  );
}

export default memo(ShipHeaderInfo);
