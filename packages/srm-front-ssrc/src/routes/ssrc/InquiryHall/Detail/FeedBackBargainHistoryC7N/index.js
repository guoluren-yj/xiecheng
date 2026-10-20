/**
 * 还比价历史-c7n
 * */

import React, { Component } from 'react';
import { Table, DataSet, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import { numberSeparatorRender } from '@/utils/renderer';
import { headerDataSet, lineTableDataSet } from './store';

class LadderLevelCheckPrice extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    const { doubleUnitFlag, quotationName } = props;

    this.organizationId = getCurrentOrganizationId();

    this.headDS = new DataSet(headerDataSet());
    this.lineDS = new DataSet(lineTableDataSet({ doubleUnitFlag, quotationName }));
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {
    const { record, uiType = 'c7n', rfxHeaderId } = this.props;

    if (!record) {
      return;
    }

    let lineData = uiType === 'c7n' ? record?.toData() : {};
    lineData = lineData || {};

    const { quotationLineId } = lineData;

    if (!quotationLineId) {
      return;
    }

    this.headDS.loadData([lineData]);

    this.lineDS.setQueryParameter('commons', {
      rfxHeaderId, // 好像暂时不需要
      quotationLineId,
      customizeUnitCode: this.getTableCustomizeUnitCode(),
      organizationId: this.organizationId,
    });
    this.lineDS.query();
  };

  getFields = () => {
    return [
      <Output name="supplierCompanyName" />,
      <Output name="itemCode" />,
      <Output name="itemName" />,
    ];
  };

  getTableCustomizeUnitCode = () => {
    // const { bidFlag } = this.props;

    // let code = 'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE';
    //
    // if (bidFlag) {
    //   code = 'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE';
    // }

    return '';
  };

  getLines = () => {
    const { doubleUnitFlag } = this.props;

    const columns = [
      {
        name: 'quotationCount',
        width: 90,
      },
      {
        name: 'quotationRoundNumber',
        width: 60,
      },
      {
        name: 'quotedDate',
        width: 160,
      },
      {
        name: 'quotedByName',
        width: 160,
      },
      {
        align: 'right',
        name: 'quotationPrice',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            align: 'right',
            name: 'quotationSecondaryPrice',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'priceBatchQuantity',
        width: 130,
      },
      {
        name: 'currentQuotationRemark',
      },
      {
        name: 'bargainPrice',
        align: 'right',
        width: 130,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 180,
        name: 'bargainRemark',
      },
      {
        name: 'bargainDate',
        width: 150,
      },
      {
        name: 'bargainByName',
        width: 160,
      },
      {
        name: 'promisedDate',
        width: 100,
      },
      {
        name: 'deliveryCycle',
        width: 100,
      },
      {
        name: 'quotationExpiryDateFrom',
        width: 120,
      },
      {
        name: 'quotationExpiryDateTo',
        width: 120,
      },
    ];

    return columns.filter(Boolean);
  };

  /**
   * 头信息
   */
  headerInfo = () => {
    return (
      <Form
        dataSet={this.headDS}
        columns={2}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        {this.getFields()}
      </Form>
    );
  };

  // 当前供应商分类表格
  tableInfo() {
    const { customizeTable } = this.props;

    return (
      <div style={{ marginTop: '32px' }}>
        {customizeTable(
          { code: this.getTableCustomizeUnitCode() },
          <Table dataSet={this.lineDS} columns={this.getLines()} />
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.headerInfo()}
        {this.tableInfo()}
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return withCustomize({
    unitCode: [],
  })(formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.queryRfq'] })(observer(Com)));
};

export default hocComponent(LadderLevelCheckPrice);

export { LadderLevelCheckPrice, hocComponent };
