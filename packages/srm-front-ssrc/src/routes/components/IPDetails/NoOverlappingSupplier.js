import React, { useMemo, useEffect } from 'react';
import { useDataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { NoOverlappingSupplierDS } from './indexDS';

const NoOverlappingSupplier = ({ rfxHeaderId }) => {
  const NoOverlappingSupplierDs = useDataSet(() => NoOverlappingSupplierDS({ rfxHeaderId }), []);

  useEffect(() => {
    NoOverlappingSupplierDs.query();
  }, []);

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
    <Table
      customizable
      customizedCode="code"
      columns={columns}
      dataSet={NoOverlappingSupplierDs}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    />
  );
};

export default observer(NoOverlappingSupplier);
