/*
 * @Descripttion: 复制历史单据--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-09-06 09:55:54
 * @LastEditors: yiping.liu
 */
import React, { useMemo } from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

const CopyRF = (props) => {
  const { RFCopyDs, sourceCategory, customizeTable } = props;

  const columns = useMemo(
    () => [
      {
        name: 'displayRfStatusMeaning',
        width: 100,
      },
      {
        name: 'rfNum',
        width: 150,
      },
      {
        name: 'rfTitle',
        width: 150,
      },
      sourceCategory === 'RFP'
        ? {
            name: 'purOrganizationName',
            width: 150,
          }
        : null,
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'expertScoreTypeMeaning',
        width: 150,
      },
      {
        name: 'sourceMethodMeaning',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 170,
      },
      {
        name: 'createdByName',
        width: 120,
      },
      {
        name: 'createdUnitName',
        width: 120,
      },
    ],
    []
  );
  return (
    <React.Fragment>
      {customizeTable(
        {
          code: `SSRC.INQUIRY_HALL.RF_LIST.COPY.${sourceCategory}.LIST`,
        },
        <SearchBarTable
          searchCode={`SSRC.INQUIRY_HALL.RF_LIST.COPY.${sourceCategory}`}
          dataSet={RFCopyDs}
          columns={columns}
          searchBarConfig={{
            closeFilterSelector: false,
            expandable: false,
          }}
        />
      )}
    </React.Fragment>
  );
};

export default WithCustomizeC7N({
  unitCode: ['SSRC.INQUIRY_HALL.RF_LIST.COPY.RFI.LIST', 'SSRC.INQUIRY_HALL.RF_LIST.COPY.RFP.LIST'],
})(CopyRF);
