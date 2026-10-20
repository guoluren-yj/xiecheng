import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { biddingTableDs } from './fieldsInitalValue';

@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_LIST',
    'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_FILTER',
  ],
})
export default class TransferBidding extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const tableDate = biddingTableDs();
    this.tableDataDs = new DataSet({
      ...tableDate,
      events: {
        load: ({ dataSet }) => {
          const { totalCount } = dataSet;
          const { updatePage } = this.props;
          updatePage(totalCount, 'biddingDate');
        },
      },
    });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'bidding';
  }

  render() {
    const { customizeTable } = this.props;
    const columns = [
      {
        name: 'displayPrNum',
        width: 150,
      },
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 130,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'occupiedQuantity',
        width: 140,
      },
      {
        name: 'uomName',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'neededDate',
        width: 170,
      },
      {
        name: 'prRequestedName',
        width: 130,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'unitName',
        width: 120,
      },
      {
        name: 'requestDate',
        width: 170,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 130,
      },
      {
        name: 'assignedDate',
        width: 170,
      },
    ];

    return (
      <div style={{ height: '500px' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_LIST',
            filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_FILTER',
          },
          <Table dataSet={this.tableDataDs} columns={columns} queryFieldsLimit={3} autoHeight />
        )}
      </div>
    );
  }
}
