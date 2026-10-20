import React, { useMemo, useEffect } from 'react';
import { useDataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { OverlappingSupplierDS } from './indexDS';

const OverlappingSupplier = ({
  rfxLineSupplierId,
  quotationHeaderId,
  whetherIpCoincide,
  sourceHeaderId,
}) => {
  const OverlappingSupplierDs = useDataSet(
    () =>
      OverlappingSupplierDS({
        rfxLineSupplierId,
        quotationHeaderId,
        whetherIpCoincide,
        sourceHeaderId,
      }),
    []
  );

  useEffect(() => {
    OverlappingSupplierDs.query();
  }, [rfxLineSupplierId]);

  const columns = useMemo(() => {
    return [
      {
        name: 'quotationIpAddress',
        width: 150,
      },
      {
        name: 'operateIpNodesMeaning',
        width: 150,
      },
      {
        name: 'coincideSupplier',
        width: 250,
      },
      {
        name: 'coincideNodeMeaning',
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

  return <Table columns={columns} dataSet={OverlappingSupplierDs} style={{ maxHeight: '430px' }} />;
};

export default observer(OverlappingSupplier);
