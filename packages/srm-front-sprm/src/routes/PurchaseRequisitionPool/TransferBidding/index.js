import React, { Component } from 'react';
import { Table, DataSet, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { biddingTableDs } from './fieldsInitalValue';
import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';
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
    const { doubleUintFlag } = props;
    const { SPRM, RFX } = doubleUintFlag || {};
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
    this.tableDataDs.setState('uomControl', SPRM || RFX || 0);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'bidding';
  }

  render() {
    const { customizeTable, doubleUintFlag } = this.props;
    const columns = [
      {
        name: 'displayPrNum',
        width: 150,
        renderer: ({ text, record }) => (
          <div className="row-agent-column">
            {text}
            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
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
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
      },
      {
        name: 'occupiedQuantity',
        width: 140,
      },
      {
        name: 'uomCodeAndName',
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

    const { SPRM, RFX } = doubleUintFlag || {};
    const baseUomInfo =
      SPRM || RFX ? [] : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    return (
      <div>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_LIST',
            filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_FILTER',
            lovIgnore: false,
            queryLovIgnore: false,
          },
          <Table
            dataSet={this.tableDataDs}
            columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
            queryFieldsLimit={3}
          />
        )}
      </div>
    );
  }
}
