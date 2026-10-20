import React, { useContext, memo } from 'react';
import C7nFromWrapper from '@/routes/components/C7nFormWrapper';
import { Spin } from 'choerodon-ui/pro';
import { Store } from './index';

import { useYesOrNoRender, useRenderMeaning } from '../hooks';

function DeliverHeader() {
  const { DeliverHeaderDs, customizeForm, loading, editFlag } = useContext(Store);
  const getFields = [
    { name: 'asnNum' },
    {
      name: 'asnTypeCode',
      renderer: useRenderMeaning('asnTypeCode'),
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'immedShippedFlag',
      renderer: useYesOrNoRender(),
    },
    { name: 'supplierSiteName' },
    { name: 'shipDate' },
    { name: 'expectedArriveDate' },
    { name: 'totalQuantity' },
    {
      name: 'transportType',
      renderer: useRenderMeaning('transportType'),
    },
    { name: 'remark', _type: 'TextArea' },
  ];

  return (
    <Spin spinning={loading}>
      <C7nFromWrapper
        readOnly={editFlag}
        dataSet={DeliverHeaderDs}
        columns={3}
        fields={getFields}
        customizeForm={customizeForm}
        customizeCode="SINV.SUPPLIER_DELIVERY.DETAIL.HEADER"
      />
    </Spin>
  );
}
export default memo(DeliverHeader);
