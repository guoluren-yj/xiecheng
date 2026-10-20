// ViewPriceLineTable

import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { viewPriceDataSet } from './tableDataSet';

@observer
class ViewPriceLineTable extends Component {
  constructor(props) {
    super(props);

    this.viewPriceInfoDS = new DataSet(viewPriceDataSet());

    this.state = {};
  }

  componentDidMount() {
    this.initTable();
  }

  initTable = () => {
    const { pageData: { record = {}, dataSource } = {} } = this.props || {};

    const { rfxHeaderId } = record?.get ? record.get(['rfxHeaderId']) : dataSource || {};

    const organizationId = getCurrentOrganizationId();
    this.viewPriceInfoDS.setQueryParameter('rfxHeaderId', rfxHeaderId);
    this.viewPriceInfoDS.setQueryParameter('organizationId', organizationId);

    this.viewPriceInfoDS.query();
  };

  tableColumns = () => {
    const Columns = [
      {
        width: 140,
        name: 'itemCode',
      },
      {
        name: 'itemName',
        type: 'string',
      },
      {
        name: 'taxPrice',
        width: 140,
      },
      {
        name: 'netPrice',
        width: 140,
      },
      {
        name: 'supplierCompanyNum',
        width: 140,
      },
      {
        name: 'supplierCompanyName',
        width: 140,
      },

      {
        name: 'purOrganizationName',
        width: 140,
      },
      {
        name: 'priceLibNumber',
        width: 140,
      },
      {
        name: 'attributeVarchar1',
        width: 140,
      },
      {
        name: 'examine',
        renderer: ({ value }) => yesOrNoRender(value),
        width: 140,
      },
      {
        name: 'expire',
        renderer: ({ value }) => yesOrNoRender(value),
        width: 140,
      },
      {
        name: 'expireRemark',
        type: 'string',
        width: 180,
      },
    ];

    return Columns;
  };

  render() {
    return (
      <div>
        <Table rowKey="priceLibId" columns={this.tableColumns()} dataSet={this.viewPriceInfoDS} />
      </div>
    );
  }
}

export default ViewPriceLineTable;
