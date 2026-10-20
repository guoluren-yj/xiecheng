import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import SearchBarTable from '_components/SearchBarTable';

import { cuszLineUnitCodeMap } from '..';

const CuszLineSlot = observer((props) => {

  const { headerDS, cuszLineDs, remoteProps, updateFlag, readOnlyFlag, customizeTable } = props;

  const columns = useMemo(() => {
    const normalColumns = [];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_PRE.CUSZ_LINE_COLUMNS', normalColumns, {
        cuszLineDs,
        updateFlag,
        settleHeaderDs: headerDS,
      })
      : normalColumns;
    return processBtns;
  }, [
    headerDS,
    cuszLineDs,
    updateFlag,
    remoteProps,
  ]);

  const buttons = useMemo(() => {
    const normalBtns = [];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_PRE.CUSZ_LINE_BTNS', normalBtns, {
        cuszLineDs,
        updateFlag,
        settleHeaderDs: headerDS,
      })
      : normalBtns;
    return processBtns;
  }, [
    headerDS,
    cuszLineDs,
    updateFlag,
    remoteProps,
  ]);

  return customizeTable(
    {
      code: cuszLineUnitCodeMap.LIST,
      readOnly: readOnlyFlag,
      buttonCode: `SSTA.PURCHASE_SETTLE_DETAIL.PRE_CUSZ_LINE_BTNS`,
    },
    <SearchBarTable
      columns={columns}
      buttons={buttons}
      dataSet={cuszLineDs}
      style={{ maxHeight: 620 }}
      searchCode={cuszLineUnitCodeMap.SEARCH}
      searchBarConfig={{ closeFilterSelector: true }}
    />
  );
});

export default CuszLineSlot;
