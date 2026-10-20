import React, { useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';

import { otherInfoDS } from '../store/subModel';

const OtherInfoDrawer = (props) => {
  const {
    bidFlag,
    customizeTable,
    curDimensionDs,
    record: curRecord,
    detailFlag,
    otherInfoColumns,
  } = props;
  const otherInfoDs = useDataSet(() => otherInfoDS(), []);

  const query = async () => {
    getResponse(await otherInfoDs.query());
  };

  useEffect(() => {
    const queryParams = {
      ...curDimensionDs.getQueryParameter('queryParams'),
      tileRfxLineSupplierIds: [curRecord.get('rfxLineSupplierId')],
      customizeUnitCode: bidFlag
        ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER'
        : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER',
    };
    otherInfoDs.setQueryParameter('queryParams', queryParams);
    query();
  }, []);

  return customizeTable(
    {
      readOnly: detailFlag,
      code: bidFlag
        ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER'
        : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER',
      dataSet: otherInfoDs,
    },
    <Table dataSet={otherInfoDs} columns={otherInfoColumns} />
  );
};

export default OtherInfoDrawer;
