/**
 * index - 发票验真- 已检验列表页
 * @date: 2019-07-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Tooltip } from 'hzero-ui';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { numberRender, dateRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
// import { HZERO_FILE } from 'utils/config';
import { previewPdf } from '@/utils/utils';

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';
const promptCode = 'sfin.invoiceBill';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      ocrFileUrl: null,
      // accessToken: getAccessToken(),
      tenantId: getCurrentOrganizationId(),
    };
  }

  // @Bind()
  // redirct(text, record) {
  //   const { redirectDetail = (e) => e, isSave } = this.props;
  //   const { validateStatusCode } = record;
  //   return validateStatusCode === 'CHECK_SUCCESS' ? (
  //     <a onClick={isSave(() => redirectDetail(record))}>{text}</a>
  //   ) : (
  //     text
  //   );
  // }

  // SRM发票号列内容渲染
  @Bind()
  goToLink(record) {
    const { redirectInvoiceSummary, isSave } = this.props;
    const { srmTaxInvoiceMap } = record;
    return (srmTaxInvoiceMap || []).map((item) => {
      if (item.invoiceNum) {
        const { invoiceHeaderId, invoiceNum } = item;
        return (
          <p style={{ marginBottom: 0 }}>
            <a onClick={isSave(() => redirectInvoiceSummary(invoiceHeaderId))}>{invoiceNum}</a>
          </p>
        );
      }
      return null;
    });
  }

  // 显示Madal
  showModal = (fileUrl) => {
    if (!fileUrl) return;
    const { tenantId } = this.state;
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    this.setState({
      // ocrFileUrl: `${HZERO_FILE}/v1/${tenantId}/files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}&directory=${bucketDirectory}&url=${record.ocrFileUrl}`,
      ocrFileUrl: getAttachmentUrl(fileUrl, bucketName, tenantId, bucketDirectory),
      visible: true,
    });
  };

  // 关闭Modal
  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  @Bind()
  modal(record) {
    const { ocrFileUrl, jpgUrl, inputTypeCode, inputTypeCodeMeaning } = record;
    if (['OCR', 'OFD'].includes(inputTypeCode)) {
      const fileUrl = inputTypeCode === 'OFD' ? jpgUrl : ocrFileUrl;
      return <a onClick={() => this.showModal(fileUrl)}>{inputTypeCodeMeaning}</a>;
    } else {
      return <span>{inputTypeCodeMeaning}</span>;
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onViewInvoiceDetail } = this.props;
    const columnArray = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'invoiceCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
        dataIndex: 'invoiceNumber',
        width: 120,
        // render: this.redirct,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'billingDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        width: 120,
        align: 'right',
        render: (value) => {
          return numberRender(value, 2, false);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 120,
        align: 'right',
        render: (value) => {
          return numberRender(value, 2, false);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkCodeMeaning`).d('校验码'),
        dataIndex: 'checkCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.stateSpecification`).d('状态说明'),
        dataIndex: 'validateMessage',
        width: 120,
        render: (value, record) => (
          <Tooltip placement="topLeft" title={record.validateMessage}>
            <span>{record.validateMessage}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatus`).d('发票状态'),
        dataIndex: 'taxInvoiceStatusCodeMeaning',
        width: 80,
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.checkTime`).d('查验时间'),
        dataIndex: 'checkTime',
        width: 140,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sfin.invoiceVerification.view.checkCounterToday`).d('今日查验次数'),
        dataIndex: 'checkCount',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.supplierCompanyName`).d('销售方'),
        dataIndex: 'supplierName',
        width: 220,
      },
      {
        title: intl.get(`sfin.inputInvoice.model.purchaser`).d('购买方'),
        dataIndex: 'companyName',
        width: 220,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceType`).d('发票种类'),
        dataIndex: 'invoiceTypeCodeMeaning',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        dataIndex: 'srmTaxInvoiceMap',
        width: 170,
        render: (_, record) => this.goToLink(record),
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.inputTypeCodeMeaning`).d('发票录入方式'),
        dataIndex: 'inputTypeCodeMeaning',
        width: 120,
        render: (_, record) => this.modal(record),
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.invoiceView`).d('发票查看'),
        dataIndex: 'invoiceView',
        width: 120,
        render: (_, record) => (
          <a onClick={() => onViewInvoiceDetail(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      onSearch,
      verSelectedRows,
      verDataSource,
      verifiedPagination,
      verOnRowSelectChange = (e) => e,
    } = this.props;
    const { visible, ocrFileUrl } = this.state;
    const columns = this.getColumns();
    const selectedRowKeys = verSelectedRows.map((item) => item.taxInvoiceCheckId);
    const rowSelection = {
      selectedRowKeys,
      onChange: verOnRowSelectChange,
    };

    const tableProps = {
      loading,
      columns,
      rowSelection,
      bordered: true,
      dataSource: verDataSource,
      rowKey: 'taxInvoiceCheckId',
      onChange: (page) => onSearch(page),
      pagination: verifiedPagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        {visible && (
          <Modal visible={visible} onCancel={this.hideModal} footer={null} width="770px">
            <img alt="" width="95%" src={ocrFileUrl} />
          </Modal>
        )}
        <EditTable {...tableProps} />
      </Fragment>
    );
  }
}
