/**
 * 多轮报价历史-c7n
 * */

import React, { Component } from 'react';
import { Table, DataSet, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import { numberSeparatorRender } from '@/utils/renderer';
import { lineTableDataSet } from './store';

class RoundQuotationHistoryC7N extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    const { doubleUnitFlag, quotationName } = props;

    this.organizationId = getCurrentOrganizationId();

    this.lineDS = new DataSet(lineTableDataSet({ doubleUnitFlag, quotationName }));
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

    const { quotationLineId, quotationHeaderId } = lineData;

    if (!quotationLineId) {
      return;
    }

    this.lineDS.setQueryParameter('commons', {
      quotationLineId,
      quotationHeaderId,
      purchaserRequestFlag: 1, // 采购方标识
      organizationId: this.organizationId,
    });
    this.lineDS.query();
  };

  // getFields = () => {
  //   return [
  //     <Output name="supplierCompanyName" />,
  //     <Output name="itemCode" />,
  //     <Output name="itemName" />,
  //   ];
  // };

  /**
   * 阶梯报价头信息查询
   */
  headerInfo = () => {
    return (
      <Form dataSet={this.headDS} columns={2} labelLayout="float">
        {this.getFields()}
      </Form>
    );
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
    const { doubleUnitFlag, header } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound, quotationRoundNumber } = header || {};

    const roundNumber = currentQuotationRound || quotationRoundNumber;
    const showRoundRank = roundQuotationRankFlag && roundNumber > 1;

    const columns = [
      {
        name: 'quotationRoundNumber',
        width: 80,
      },
      showRoundRank
        ? {
            name: 'roundRank',
          }
        : null,
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'realName',
        width: 200,
      },
      {
        name: 'quotationAmount',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netQuotationAmount',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'secondaryQuantity',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'quotationQuantity',
            width: 120,
            align: 'right',
          }
        : null,
      {
        name: 'quotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
    ];

    return columns.filter(Boolean);
  };

  render() {
    return (
      <div>
        <Table dataSet={this.lineDS} columns={this.getLines()} pagination={false} />
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return formatterCollections({ code: ['ssrc.supplierQuotation'] })(observer(Com));
};

export default hocComponent(RoundQuotationHistoryC7N);

export { RoundQuotationHistoryC7N, hocComponent };
