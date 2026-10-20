/**
 * DetailTable.js - 发票行明细表格
 * @date: 2019-07-25
 * @author: zhutian <tian.zhu02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Table, Popover, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isFunction } from 'lodash';
import Viewer from 'react-viewer';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { createPagination, getAttachmentUrl } from 'utils/utils';
import { thousandBitSeparator } from '@/routes/utils';
import { previewPdf, getAttachmentUrlWithToken } from '@/utils/utils';
import filePdf from '@/assets/file_pdf.svg';
import { viewInvoiceDetail } from '../../utils';

const promptCode = 'sfin.invoiceBill';

@connect(({ loading }) => ({
  loading: loading.effects['invoice/queryTaxInvoiceLine'],
}))
@withRouter
export default class TaxDetailTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listDataSource: [],
      pagination: {},
      viewVisible: false, // ocr文件查看-图片
      ocrFileUrl: '',
    };
  }

  componentDidMount() {
    if (this.props?.onRef) this.props.onRef(this);
    this.handleSearch();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { invoiceHeaderId },
      },
    } = prevProps;
    if (this.props.match.params.invoiceHeaderId !== invoiceHeaderId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.handleSearch();
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const {
      match: {
        params: { invoiceHeaderId },
      },
      getTaxDetailList,
    } = this.props;
    const { dispatch, type, code } = this.props;
    dispatch({
      type: 'invoice/queryTaxInvoiceLine',
      payload: {
        type,
        invoiceHeaderId: invoiceHeaderId || this.props.invoiceHeaderId,
        page,
        customizeUnitCode: code,
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          listDataSource: isArray(res.content) ? res.content : [],
          pagination: createPagination(res),
        });
        if (getTaxDetailList) {
          getTaxDetailList(isArray(res.content) ? res.content : []);
        }
      }
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  modal(ocrFileUrl) {
    if (ocrFileUrl) {
      const content = (
        <div>
          <span className="check-ocr" onClick={() => this.showModal(ocrFileUrl)}>
            <img src={filePdf} alt="" className="svg-img" />
            {intl.get(`sfin.invoiceBill.view.message.orcFile`).d('查看OCR识别附件')}
          </span>
        </div>
      );
      return (
        <Popover
          content={content}
          title={intl.get(`sfin.invoiceBill.view.title.ocrDistinguish`).d('OCR识别')}
          trigger="hover"
          placement="bottomLeft"
        >
          <a className="ocr-btn">
            <Icon type="find_in_page" />
            {intl.get(`sfin.invoiceBill.view.message.checkOCRFile`).d('OCR识别附件')}
          </a>
        </Popover>
      );
    } else {
      return '';
    }
  }

  // 显示Madal
  showModal = (ocrFileUrl) => {
    const { tenantId } = this.state;
    const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
    const bucketDirectory = 'finance-invoice';
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(ocrFileUrl);
    this.setState({
      ocrFileUrl: getAttachmentUrl(ocrFileUrl, bucketName, tenantId, bucketDirectory),
      viewVisible: true,
    });
  };

  // 关闭Modal
  hideModal = () => {
    this.setState({
      viewVisible: false,
    });
  };

  render() {
    const { loading, customizeTable, code } = this.props;
    const { listDataSource, pagination = {}, viewVisible = false, ocrFileUrl } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'invoiceCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
        dataIndex: 'invoiceNumber',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ocrFileUrl`).d('OCR识别附件'),
        dataIndex: 'ocrFileUrl',
        width: 150,
        render: (val) => this.modal(val),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ofdFile`).d('OFD文件'),
        dataIndex: 'ofdFile',
        width: 120,
        render: (_, record) => {
          const { jpgUrl, ofdFileUrl } = record;
          return (
            <span className="action-link">
              {ofdFileUrl && (
                <a onClick={() => this.showModal(ofdFileUrl)}>
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
              {jpgUrl && (
                <a onClick={() => this.showModal(jpgUrl)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'billingDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceType`).d('发票种类'),
        dataIndex: 'noDepositInvoiceTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceDirection`).d('发票方向'),
        dataIndex: 'invoiceDirectionMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkCodeMeaning`).d('校验码'),
        dataIndex: 'checkCode',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierCompanyNames`).d('销方名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supUnifiedSocialCode`).d('销方税号'),
        dataIndex: 'supUnifiedSocialCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purCompanyName`).d('购方名称'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purUnifiedSocialCode`).d('购方税号'),
        dataIndex: 'purUnifiedSocialCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.dataSourceMeaning`).d('数据来源'),
        dataIndex: 'inputTypeCodeMeaning',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoicePrintStatus`).d('发票打印状态'),
        dataIndex: 'invoicePrintStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.listPrintStatus`).d('销货清单打印状态'),
        dataIndex: 'listPrintStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkStateExplain`).d('查验状态说明'),
        dataIndex: 'validateMessage',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatus`).d('发票状态'),
        dataIndex: 'taxInvoiceStatusCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载'),
        dataIndex: 'downloadInvoice',
        width: 100,
        // eslint-disable-next-line no-unused-vars
        render: (value, record) =>
          record.layoutFileUrl ? (
            <a href={record.layoutFileUrl}>
              {intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`sfin.common.model.common.invoiceView`).d('发票查看'),
        dataIndex: 'invoiceView',
        width: 120,
        render: (_, record) => {
          const { taxInvoiceLineId: invoiceHeaderId } = record;
          return (
            <a onClick={() => viewInvoiceDetail({ invoiceHeaderId, docType: 'taxInvoice' })}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
    ];

    const scrollWidth = this.scrollWidth(columns, 230);
    const tableProps = {
      dataSource: listDataSource,
      columns,
      loading,
      bordered: true,
      rowKey: 'categoryAssignId',
      onChange: this.handleSearch,
      pagination,
      // scroll: { x: sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 250 },
      // scroll: { y: 'calc(100vh - 422px)' },
      scroll: { x: scrollWidth, y: 'calc(100vh - 422px)' },
    };

    return (
      <Fragment>
        {isFunction(customizeTable) ? (
          customizeTable({ code }, <Table {...tableProps} />)
        ) : (
          <Table {...tableProps} />
        )}
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={viewVisible}
          onClose={this.hideModal}
          downloadable
          images={[
            {
              src: ocrFileUrl,
              alt: '',
              downloadUrl: ocrFileUrl,
            },
          ]}
        />
      </Fragment>
    );
  }
}
