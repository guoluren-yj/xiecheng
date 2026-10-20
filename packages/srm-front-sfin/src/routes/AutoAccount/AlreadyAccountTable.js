import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';

import intl from 'utils/intl';
import { thousandBitSeparator } from '@/routes/utils';
import InvoiceDownloadList from './InvoiceDownloadList';

const promptCode = 'sfin.payableInvoice';
const FormItem = Form.Item;

/**
 * 已对账table
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_GRID'],
})
@connect(({ autoAccount, loading }) => ({
  autoAccount,
  loading: loading.effects['autoAccount/fetchAlreadyAccount'],
}))
export default class AlreadyAccountTable extends Component {
  state = {
    modalVisible: false,
  };

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * openInvoiceDownload - 打开发票下载弹窗
   */
  @Bind()
  openInvoiceDownload(record) {
    this.setState(
      {
        modalVisible: true,
        data: record,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideInvoiceDownload - 关闭发票下载弹窗
   */
  @Bind()
  hideInvoiceDownload() {
    this.setState(
      {
        modalVisible: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  render() {
    const {
      loading,
      autoAccount: { alreadyAccountList = [], alreadyAccountPagination = {} },
      dispatch,
      customizeTable,
    } = this.props;
    const { modalVisible, data } = this.state;
    const invoiceDownloadProps = {
      dispatch,
      visible: modalVisible,
      data,
      onRef: this.onRef,
      hideModal: this.hideInvoiceDownload.bind(this),
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.billNum`).d('开票申请单号'),
        dataIndex: 'billNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.srmInvoiceNum`).d('SRM发票号'),
        dataIndex: 'srmInvoiceNum',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.payableInvoice.srmInvoiceStatusMeaning`)
          .d('SRM发票申请状态'),
        dataIndex: 'srmInvoiceStatusMeaning',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.payableInvoice.issueStatusMeaning`)
          .d('税务发票开具状态'),
        dataIndex: 'issueStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplyCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号'),
        dataIndex: 'ecPoNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号'),
        dataIndex: 'ecPoSubNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductNum`).d('商品编码'),
        dataIndex: 'ecProductNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductName`).d('商品名称'),
        dataIndex: 'ecProductName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesNum`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.actualPrice`).d('商品单价'),
        dataIndex: 'actualPrice',
        align: 'right',
        width: 100,
        render: (value, record) => {
          // return record.priceShieldFlag === 1 ? record.actualPriceMeaning : record.actualPrice;
          return record.priceShieldFlag === 1
            ? thousandBitSeparator(record.actualPriceMeaning)
            : thousandBitSeparator(record.actualPrice);
        },
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.showPoNum`).d('订单编号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliveredNum`).d('妥投数量'),
        dataIndex: 'deliveredNum',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.accpetNum`).d('验收数量'),
        dataIndex: 'accpetNum',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.quantityReturned`).d('退货数量'),
        dataIndex: 'quantityReturned',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.reverseFlag`).d('已产生退货事务'),
        dataIndex: 'reverseFlag',
        align: 'right',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`reverseFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.billOrigin`).d('订单来源'),
        dataIndex: 'billOriginMeaning',
        width: 200,
      },
      {
        title: intl.get(`sfin.common.modeld.common.createByName`).d('创建人'),
        dataIndex: 'createdByName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式'),
        dataIndex: 'invoiceStateMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.afterSalesStatus`).d('售后状态'),
        dataIndex: 'afterSalesStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliverTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecFinishTime`).d('订单完成时间'),
        dataIndex: 'ecFinishTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceDownload`).d('发票下载'),
        dataIndex: 'invoiceDownload',
        width: 120,
        render: (_, record) =>
          record.invoiceState === '1' && record.invoiceDownloadFlag === 1 ? (
            <a onClick={() => this.openInvoiceDownload(record)}>
              {intl.get(`${promptCode}.view.message.invoiceDownloadList`).d('发票下载')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.orderCode`).d('商城订单编码'),
        dataIndex: 'orderCode',
        width: 150,
      },
    ];

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_GRID',
          },
          <EditTable
            bordered
            loading={loading}
            rowKey="billId"
            columns={columns}
            dataSource={alreadyAccountList}
            pagination={alreadyAccountPagination}
            onChange={this.props.onTableChange}
            scroll={{ x: this.scrollWidth(columns, 0) }}
          />
        )}
        <InvoiceDownloadList {...invoiceDownloadProps} />
      </React.Fragment>
    );
  }
}
