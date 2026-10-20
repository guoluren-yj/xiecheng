import React, { Component } from 'react';
import { Modal, DataSet, Icon, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getQuotationName } from '@/utils/globalVariable';

import { tableDS } from './ds';

class NoQuotedItemView extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.tableDs = new DataSet(
      tableDS({
        organizationId: this.organizationId,
      })
    );
  }

  getColumns = () => {
    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 220,
      },
      {
        name: 'itemName',
      },
    ];

    return columns;
  };

  getHeaderData = () => {
    const { header, headerDs } = this.props;

    let data = header || {};

    if (headerDs) {
      data = headerDs?.current
        ? headerDs.current?.get([
            'noQuotedItemNames',
            'noQuotedItemCount',
            'rfxHeaderId',
            'secondarySourceCategory',
          ])
        : {};
    }

    return data;
  };

  getItemInfo = () => {
    const { noQuotedItemNames, noQuotedItemCount, secondarySourceCategory } = this.getHeaderData();

    if (!noQuotedItemCount) {
      return '';
    }

    const text = intl
      .get('ssrc.inquiryHall.model.inquiryHall.noQuotedItemInfo', {
        names: noQuotedItemNames,
        count: noQuotedItemCount,
        type: getQuotationName(secondarySourceCategory === 'NEW_BID'),
      })
      .d('提示：{names}等共计{count}颗物料无供应商{type}');

    return text;
  };

  renderTable = () => {
    const text = this.getItemInfo();

    return (
      <div>
        <div
          style={{
            margin: '-10px 0 20px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {text}
        </div>

        <div>
          <Table columns={this.getColumns()} dataSet={this.tableDs} />
        </div>
      </div>
    );
  };

  closeModal = () => {
    this.tableDs.loadData();
  };

  view = async () => {
    const { rfxHeaderId } = this.getHeaderData();

    if (!rfxHeaderId) {
      return;
    }

    this.tableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
    this.tableDs.query();

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.common.itemDetail').d('物料明细'),
      children: this.renderTable(),
      style: { width: '690px' },
      closable: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
      onClose: this.closeModal,
    });
  };

  render() {
    const text = this.getItemInfo();
    if (!text) {
      return '';
    }

    return (
      <div>
        <div
          style={{
            margin: '20px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {text}
          ,&nbsp;
          {intl.get(`ssrc.common.button.detailClickTo`).d('详情请点击')}
          <span onClick={this.view} style={{ textDecoration: 'underline', marginLeft: '2px' }}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </span>
        </div>
      </div>
    );
  }
}

export default NoQuotedItemView;
