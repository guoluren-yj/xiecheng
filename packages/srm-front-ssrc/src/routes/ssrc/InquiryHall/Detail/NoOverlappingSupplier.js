import React, { useMemo, useEffect } from 'react';
import { useDataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { NoOverlappingSupplierDS } from './indexDS';

const NoOverlappingSupplier = ({
  rfxLineSupplierId,
  quotationHeaderId,
  whetherIpCoincide,
  sourceHeaderId,
}) => {
  const NoOverlappingSupplierDs = useDataSet(
    () =>
      NoOverlappingSupplierDS({
        rfxLineSupplierId,
        quotationHeaderId,
        whetherIpCoincide,
        sourceHeaderId,
      }),
    []
  );

  useEffect(() => {
    NoOverlappingSupplierDs.query();
  }, [rfxLineSupplierId]);

  const columns = useMemo(() => {
    return [
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'operateIpNodesMeaning',
        width: 150,
      },
      {
        name: 'ipAddress',
        width: 150,
      },
      {
        name: 'ipAcquisitionDate',
        width: 150,
      },
      {
        name: 'ipAddressLocation',
        width: 150,
      },
    ];
  }, []);

  return (
    <Table columns={columns} dataSet={NoOverlappingSupplierDs} style={{ maxHeight: '430px' }} />
  );
};

export default observer(NoOverlappingSupplier);
