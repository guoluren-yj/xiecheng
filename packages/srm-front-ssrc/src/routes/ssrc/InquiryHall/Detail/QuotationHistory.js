import React from 'react';
import intl from 'utils/intl';
import { Table, Popover } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';

import { numberSeparatorRender } from '@/utils/renderer';

@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  queryRoundQuotationLineDetailLoading:
    loading.effects['supplierQuotation/queryRoundQuotationLineDetail'],
}))
export default class QuotationHistory extends React.Component {
  constructor(props) {
    super(props);
    const { quotationName } = props;
    this.quotationName = quotationName;
  }

  componentDidMount() {
    this.fetchRoundQuotationList();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        roundQuotationLineDetail: [],
      },
    });
  }

  /**
   * 查找多轮报价
   *
   * @param {*} [data={}]
   * @memberof InquiryPrice
   */
  fetchRoundQuotationList = () => {
    const { dispatch, record: { quotationHeaderId = '', quotationLineId = '' } = {} } = this.props;
    dispatch({
      type: 'supplierQuotation/queryRoundQuotationLineDetail',
      payload: {
        quotationLineId,
        quotationHeaderId,
        purchaserRequestFlag: 1, // 采购方标识
      },
    });
  };

  roundColumns = (quotationHeader) => {
    const { doubleUnitFlag = false } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound } = quotationHeader || {};

    return [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 80,
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        dataIndex: 'creationDate',
        width: 150,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}人'),
        dataIndex: 'realName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('含税行金额'),
        dataIndex: 'quotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`).d('未税行金额'),
        dataIndex: 'netQuotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        align: 'right',
      },
      doubleUnitFlag
        ? {
            title: intl
              .get(`ssrc.common.model.inquiryHall.basicAvailableQuantity`)
              .d('基本可供数量'),
            dataIndex: 'quotationQuantity',
            width: 120,
            align: 'right',
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('含税单价'),
        dataIndex: 'quotationPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`).d('未税单价'),
        dataIndex: 'validNetPrice',
        width: 100,
        align: 'right',
      },
    ].filter(Boolean);
  };

  render() {
    const {
      queryRoundQuotationLineDetailLoading,
      supplierQuotation: { roundQuotationLineDetail = [], quotationHeader = {} } = {},
    } = this.props;

    return (
      <Table
        bordered
        scroll={{ x: tableScrollWidth(this.roundColumns(quotationHeader)) }}
        columns={this.roundColumns(quotationHeader)}
        rowKey={uuidv4()}
        dataSource={roundQuotationLineDetail || []}
        pagination={false}
        loading={queryRoundQuotationLineDetailLoading}
      />
    );
  }
}
