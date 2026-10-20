import React, { memo, useContext, useMemo } from 'react';
import { Store } from './stores';
import { useTable } from './hooks';

const DscTable = function DscTable(props) {
  const { dataSet } = props;
  const { handleToDetail, sourceFromModal, customizeTable } = useContext(Store);
  const columns = useMemo(
    () => [
      {
        name: 'displayPoNum',
        width: 160,
        renderer: ({ value, record }) =>
          sourceFromModal ? (
            `${value}/${record.get('lineNum')}`
          ) : (
            <a onClick={() => handleToDetail(record)}>{`${value}/${record.get('lineNum')}`}</a>
          ),
      },
      {
        name: 'planStatusMeaning',
        width: 80,
      },
      {
        name: 'planQuantity',
        width: 120,
      },
      {
        name: 'planDate',
        width: 150,
      },
      {
        name: 'purchaserRemark',
        width: 120,
      },
      {
        name: 'supplierConfirmQuantity',
        width: 120,
      },
      {
        name: 'supplierRemark',
        width: 100,
      },
      {
        name: 'netReceivedQuantity',
        width: 100,
      },
      {
        name: 'sendingQuantity',
        width: 100,
      },
    ],
    []
  );
  return customizeTable(
    {
      code: 'SODR.SEND_ORDER_DETAIL.DOCRELATE_DSC',
    },
    useTable(dataSet, columns)
  );
};

export default memo(DscTable);
