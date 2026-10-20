import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';

const QuotationInfoDrawer = (props) => {
  const {
    stdCol = {},
    extCol = {},
    mainStdCol = {},
    mainExtCol = {},
    curDimensionDs,
    record,
    curDataset,
    // modal,
    bidFlag,
  } = props;

  const columns = [
    ...(stdCol.current || []),
    ...(extCol.current || []),
    ...(mainStdCol.current || []),
    ...(mainExtCol.current || []),
  ];

  const query = async () => {
    getResponse(await curDataset.query());
  };

  useEffect(() => {
    const { rfxHeaderId, checkChangeDataFlag, checkSelectionDimension, searchBarFlag, showType } =
      curDimensionDs.getQueryParameter('queryParams') || {};
    const queryParams = {
      rfxHeaderId,
      checkChangeDataFlag,
      checkSelectionDimension,
      searchBarFlag,
      showType,
      tileRfxLineSupplierIds: [record.get('rfxLineSupplierId')],
      customizeUnitCode: bidFlag
        ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL'
        : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL',
    };
    curDataset.setQueryParameter('queryParams', queryParams);
    query();
  }, []);

  return <Table dataSet={curDataset} columns={columns} />;
};

export default QuotationInfoDrawer;
