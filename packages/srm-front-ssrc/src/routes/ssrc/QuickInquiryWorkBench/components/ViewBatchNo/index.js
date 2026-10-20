import React, { useMemo } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import intl from 'utils/intl';

import { tableDS } from './store';

export default observer(function ViewBatchNo(props) {
  const {
    lineRecord = {},
    customizeTable = noop,
    doubleUnitFlag = false,
    onShowQuoLadderLevelModal = noop,
  } = props || {};

  const { rfqItemId, rfqHeaderId } = lineRecord?.get(['rfqItemId', 'rfqHeaderId']) || {};

  const tableDs = useDataSet(() => tableDS({ rfqItemId, rfqHeaderId }), [rfqItemId, rfqHeaderId]);

  const columns = useMemo(() => {
    return [
      {
        name: 'itemCode',
        width: 130,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'itemCategoryName',
        width: 150,
      },
      {
        name: 'secondaryUomName',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'targetPriceType',
        width: 120,
      },
      {
        name: 'secondaryTargetPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'targetPrice',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'localQuotationSecPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'localQuotationPrice',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag,
      },
      {
        name: 'localNetSecPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'localNetPrice',
        width: 150,
        align: 'right',
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderInquiry',
        width: 120,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') ? (
            <a onClick={() => onShowQuoLadderLevelModal(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : null;
        },
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'exchangeRate',
        width: 100,
      },
      {
        name: 'supplierCompanyNum',
        width: 130,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'quotationExpiryDateFrom',
        width: 130,
      },
      {
        name: 'quotationExpiryDateTo',
        width: 130,
      },
    ];
  }, [doubleUnitFlag]);

  return customizeTable(
    {
      code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE',
    },
    <SearchBarTable
      virtual
      virtualCell
      searchCode="SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE_FILTER"
      dataSet={tableDs}
      columns={columns}
      style={{
        maxHeight: 'calc(100vh - 200px)',
      }}
      searchBarConfig={{
        closeFilterSelector: true,
        expandable: false,
      }}
    />
  );
});
