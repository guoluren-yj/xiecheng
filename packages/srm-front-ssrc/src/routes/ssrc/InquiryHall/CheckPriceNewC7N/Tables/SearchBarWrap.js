import React, { memo, useContext } from 'react';
import { noop } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import SearchBar from '_components/SearchBarTable/SearchBar';

import { StoreContext } from '../store/StoreProvider';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

export default memo(function SearchBarWrap(props) {
  const {
    bidFlag,
    routeParams: { rfxHeaderId },
    // commonDs: { itemDs, wholePackageDs },
  } = useContext(StoreContext);

  // const { dimensionCode } = props;

  const { onRef = noop, onSearch = noop, rightRender = noop, aggregation, dimensionCode } = props;

  const wholeFlag = !aggregation && dimensionCode !== 'ITEM';

  // const currentDimensionDs = dimensionCode === 'ITEM' ? itemDs : wholePackageDs;
  const searchCode = !wholeFlag
    ? bidFlag
      ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.FILTER_BAR'
      : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.FILTER_BAR'
    : bidFlag
    ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR'
    : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR';

  return (
    <div className={styles['filter-container']}>
      <SearchBar
        autoQuery={false}
        onRef={onRef}
        defaultExpand
        closeFilterSelector
        searchCode={searchCode}
        key={searchCode}
        dataSet={[]}
        right={{
          render: rightRender,
        }}
        onQuery={onSearch}
        onLoad={onSearch}
        fieldProps={{
          rfxLineItemId: {
            lovPara: { tenantId: organizationId, rfxHeaderId },
          },
          rfxLineSupplierId: {
            lovPara: { tenantId: organizationId, rfxHeaderId },
          },
        }}
      />
    </div>
  );
});
