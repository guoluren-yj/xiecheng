import React, { Component, Fragment } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { tableDs } from './fieldsInitalValue';

@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_FILTER',
    'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_LIST',
  ],
})
export default class TransferContract extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.tableDataDs = new DataSet({
      ...tableDs(),
      events: {
        load: ({ dataSet }) => {
          const { totalCount } = dataSet;
          const { updatePage } = this.props;
          updatePage(totalCount, 'contractDate');
        },
      },
    });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'contract';
  }

  render() {
    const { customizeTable } = this.props;
    const columns = [
      {
        name: 'prNum',
        width: 160,
        fixed: 'left',
      },
      {
        name: 'lineNum',
        width: 100,
        fixed: 'left',
      },
      {
        name: 'itemCode',
        fixed: 'left',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 120,
      },
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'quantity',
        width: 100,
      },
      {
        name: 'occupiedQuantity',
        width: 100,
        renderer: ({ value, record }) => {
          const {
            data: { quantity = 0 },
          } = record;
          return <span>{quantity - value}</span>;
        },
      },
      {
        name: 'executionStatusCodeMeaning',
        width: 150,
      },
      {
        name: 'reqTypeCode',
        width: 140,
      },
      {
        name: 'supplierCode',
        width: 120,
      },
      {
        name: 'supplierName',
        width: 160,
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'ouName',
        width: 140,
      },
      {
        name: 'purchaseOrgName',
        width: 160,
      },
      {
        name: 'agentName',
        width: 160,
      },
      {
        name: 'invOrganizationName',
        width: 160,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'catalogName',
        width: 160,
      },
      {
        name: 'prRequestedName',
        width: 160,
      },
      // {
      //   name: 'contactTelNum',
      //   width: 160,
      // },
      {
        name: 'invoiceAddress',
        width: 160,
      },
      {
        name: 'neededDate',
        width: 120,
      },
      // {
      //   name: 'companyOrgName',
      //   width: 120,
      // },
      // {
      //   name: 'costAnchDepDesc',
      //   width: 160,
      // },
      // {
      //   name: 'expBearDep',
      //   width: 160,
      // },
      {
        name: 'locationMeaning',
        width: 160,
      },
      {
        name: 'projectNum',
        width: 160,
      },
      {
        name: 'projectName',
        width: 160,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 160,
      },
      {
        name: 'urgentFlag',
        width: 160,
      },
      {
        name: 'urgentDate',
      },
      {
        name: 'creationDate',
        width: 160,
      },
    ];

    return (
      <Fragment>
        <div style={{ height: '500px' }}>
          {customizeTable(
            {
              code: 'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_LIST',
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_FILTER',
            },
            <Table
              dataSet={this.tableDataDs}
              columns={columns}
              style={{ height: 400 }}
              autoHeight
            />
          )}
        </div>
      </Fragment>
    );
  }
}
