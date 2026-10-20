/**
 * 核价 阶梯报价
 * */

import React, { Component } from 'react';
import { Table, DataSet, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import { useTernaryExpression } from '@/utils/renderer';
import { yesOrNoRender } from 'utils/renderer';
import { headerDataSet, ladderQuotationTableDS } from './store';

class LadderLevelCheckPrice extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    const { doubleUnitFlag } = props;

    this.organizationId = getCurrentOrganizationId();

    this.headDS = new DataSet(headerDataSet());
    this.lineDS = new DataSet(ladderQuotationTableDS({ doubleUnitFlag }));
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {
    const { record, uiType = 'c7n' } = this.props;

    if (!record) {
      return;
    }

    let lineData = uiType === 'c7n' ? record?.toData() : {};
    lineData = lineData || {};

    const { quotationLineId } = lineData;

    this.headDS.loadData([lineData]);

    this.lineDS.setQueryParameter('commons', {
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
    const { bidFlag } = this.props;

    let code = 'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE';

    if (bidFlag) {
      code = 'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE';
    }

    return code;
  };

  getLines = () => {
    const { doubleUnitFlag } = this.props;

    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
        lock: 'left',
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderFrom',
        width: 120,
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderTo',
        width: 120,
      }),
      {
        name: 'ladderFrom',
        width: 140,
      },
      {
        name: 'ladderTo',
        width: 140,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'validLadderSecPrice',
        width: 100,
        align: 'right',
      }),

      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetLadderSecPrice',
        width: 100,
        align: 'right',
      }),

      {
        name: 'validLadderPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'validBargainPrice',
        width: 130,
        align: 'right',
      },
      {
        name: 'remark',
        // width: 100,
      },
    ];

    return columns.filter(Boolean);
  };

  /**
   * 阶梯报价头信息查询
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
          <Table dataSet={this.lineDS} columns={this.getLines()} pagination={false} />
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
    unitCode: [
      'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE',
    ],
  })(formatterCollections({ code: ['ssrc.inquiryHall'] })(observer(Com)));
};

export default hocComponent(LadderLevelCheckPrice);

export { LadderLevelCheckPrice, hocComponent };
