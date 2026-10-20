/* eslint-disable no-return-assign */
/**
 * MaintainIndex -开票申请维护查询界面 -table 表格
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { SRM_FINANCE } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import Viewer from 'react-viewer';

import { getCurrentOrganizationId, filterNullValueObject, getAttachmentUrl } from 'utils/utils';
import moment from 'moment';

import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import withRemote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { getAttachmentUrlWithToken, previewPdf } from '../../../utils/utils';
import SummaryTab from './SummaryTab.js';
import InvoiceLineTab from './InvoiceLineTab.js';
import TaxInvoiceTab from './TaxInvoiceTab.js';

const { TabPane } = Tabs;
@withRemote({
  code: 'SFIN_INVOICE_SUMMARY_LIST_CUX',
  name: 'remote',
})
@connect(({ invoice = {} }) => ({
  invoice,
}))
@formatterCollections({
  code: [
    'sfin.invoiceBill',
    'entity.companyName',
    'sfin.invoiceVerification',
    'sfin.payableInvoice',
  ],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_SUMMARY_LIST.SUMMARY_BTNS'],
})
export default class Maintain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taxInvoiceRows: [],
      organizationId: getCurrentOrganizationId(),
      activeKey: 'summaryTab',
      selectedRows: [],
      viewVisible: false, // ocr识别文件为图片时-是否显示弹窗
      ocrFileUrl: '',
    };
  }

  // nonRef;

  @Bind()
  handleNonRef(ref = {}) {
    this.summary = ref;
  }

  @Bind()
  handelSetSelectRows(selectedRows) {
    this.setState({ taxInvoiceRows: selectedRows });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue(customizeUnitCode, thisList) {
    const { activeKey } = this.state;
    const thisForm = activeKey === 'summaryTab' ? this.summary : this.taxInvoiceLine;
    const params =
      thisForm && thisForm.filterForm
        ? (thisForm.filterForm.props && thisForm.filterForm.props.form.getFieldsValue()) || {}
        : {};
    // console.log(params)
    // debugger;
    if (isEmpty(thisList)) {
      return filterNullValueObject({
        ...params,
        submitDateFrom: params.submitDateFrom
          ? moment(params.submitDateFrom).format(DATETIME_MIN)
          : '',
        submitDateTo: params.submitDateTo ? moment(params.submitDateTo).format(DATETIME_MAX) : '',
        approvedDateFrom: params.approvedDateFrom
          ? moment(params.approvedDateFrom).format(DATETIME_MIN)
          : '',
        approvedDateTo: params.approvedDateTo
          ? moment(params.approvedDateTo).format(DATETIME_MAX)
          : '',
        billingDateFrom: params.billingDateFrom
          ? moment(params.billingDateFrom).format(DATETIME_MIN)
          : '',
        billingDateTo: params.billingDateTo
          ? moment(params.billingDateTo).format(DATETIME_MAX)
          : '',
        customizeUnitCode,
      });
    } else if (activeKey === 'summaryTab') {
      return {
        invoiceHeaderIds: thisList,
        customizeUnitCode,
      };
    } else {
      return {
        taxInvoiceLineIds: thisList,
        customizeUnitCode,
      };
    }
  }

  @Bind()
  handleGetForm() {
    const { activeKey } = this.state;
    switch (activeKey) {
      case 'summaryTab':
        return this.summary?.filterForm?.props?.form;
      case 'invoiceLineTab':
        return this.invoiceLine?.props?.form;
      case 'taxInvoiceTab':
        return this.taxInvoiceLine?.filterForm?.props?.form;
      default:
    }
  }

  @Bind()
  handleSearch() {
    const { activeKey } = this.state;
    const {
      invoice: { pagination },
    } = this.props;
    if (activeKey === 'summaryTab' && this.summary) {
      this.summary.handleSearch(pagination.supplier);
    } else if (activeKey === 'invoiceLineTab' && this.invoiceLine) {
      this.invoiceLine.handleSearch(pagination.summaryInvoice);
    } else if (this.taxInvoiceLine) {
      this.taxInvoiceLine.handleSearch(pagination.supplier);
    }
  }

  @Bind()
  changeTabs(activeKey) {
    this.setState({ activeKey }, () => {
      this.handleSearch();
    });
  }

  @Bind()
  @Throttle(2000)
  handlePrint() {
    const {
      dispatch,
      invoice: { selectedInfo },
    } = this.props;
    // 我的应付发票Tab选中keys
    const { selectedRowKeys } = selectedInfo.summary;
    if (selectedRowKeys.length > 16) {
      notification.warning({
        message: intl
          .get('sfin.invoiceBill.view.message.selectedMaxLimit16')
          .d('操作失败，失败原因是您当前批量勾选的单据过多，建议勾选16条及以下的数据重新操作'),
      });
      return;
    }
    this.setState({
      loading: true,
    });
    for (let i = 0; i < selectedRowKeys.length; i++) {
      dispatch({
        type: 'invoice/print',
        invoiceHeaderId: selectedRowKeys[i],
      }).then((res) => {
        if (!res) return;
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          try {
            const failedInfo = JSON.parse(content);
            notification.error({
              description: failedInfo.message,
            });
            this.setState({ loading: false });
          } catch (e) {
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow?.print) {
              printWindow.print();
            }
            this.setState({ loading: false });
          }
        };
        reader.readAsText(res);
      });
    }
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  clearRows() {
    this.setState({ selectedRows: [] });
  }

  // 关闭Modal
  hideModal = () => {
    this.setState({
      viewVisible: false,
    });
  };

  // 显示Madal
  previewOcrFile = (ocrFileUrl) => {
    if (!ocrFileUrl) return;
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

  @Bind()
  renderHeaderBtns() {
    const {
      organizationId,
      activeKey,
      taxInvoiceRows = [],
      selectedRows = [],
      loading,
    } = this.state;
    const {
      remote,
      invoice: { selectedInfo },
    } = this.props;
    const { selectedRowKeys: invoiceHeaderIds } = selectedInfo.summary; // 我的应付发票Tab选中keys
    const taxInvoiceLineIds = taxInvoiceRows.map((item) => item.taxInvoiceLineId);
    const invoiceLineIdList = selectedRows.map((item) => item.invoiceLineId);
    const invoiceLineParams = this.invoiceLine?.props?.form.getFieldsValue() || {};
    let normalBtns = [];
    switch (activeKey) {
      case 'summaryTab':
        normalBtns = [
          <ExcelExport
            name="export"
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/export`}
            queryParams={this.handleGetFormValue(
              'SFIN.INVOICE_SUMMARY_LIST.GRID',
              invoiceHeaderIds
            )}
            otherButtonProps={{ type: 'primary' }}
          />,
          <Button
            name="print"
            icon="printer"
            onClick={this.handlePrint}
            disabled={isEmpty(invoiceHeaderIds)}
            loading={loading}
          >
            {intl.get(`sfin.invoiceBill.view.button.print`).d('打印')}
          </Button>,
        ];
        break;
      case 'invoiceLineTab':
        normalBtns = [
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice-line/payable-list-export`}
            queryParams={
              !isEmpty(invoiceLineIdList)
                ? {
                    invoiceLineIdList,
                    businessType:
                      this.invoiceLine && this.invoiceLine.props.form.getFieldValue('businessType'),
                    customizeUnitCode: 'SFIN.INVOICE_SUMMARY_LIST.LINE',
                  }
                : this.invoiceLine &&
                  filterNullValueObject({
                    ...invoiceLineParams,
                    trxDateFrom: invoiceLineParams.trxDateFrom
                      ? moment(invoiceLineParams.trxDateFrom).format(DATETIME_MIN)
                      : '',
                    trxDateTo: invoiceLineParams.trxDateTo
                      ? moment(invoiceLineParams.trxDateTo).format(DATETIME_MAX)
                      : '',
                    approvedDateFrom: invoiceLineParams.approvedDateFrom
                      ? moment(invoiceLineParams.approvedDateFrom).format(DATETIME_MIN)
                      : '',
                    approvedDateTo: invoiceLineParams.approvedDateTo
                      ? moment(invoiceLineParams.approvedDateTo).format(DATETIME_MAX)
                      : '',
                    reviewedDateFrom: invoiceLineParams.reviewedDateFrom
                      ? moment(invoiceLineParams.reviewedDateFrom).format(DATETIME_MIN)
                      : '',
                    reviewedDateTo: invoiceLineParams.reviewedDateTo
                      ? moment(invoiceLineParams.reviewedDateTo).format(DATETIME_MAX)
                      : '',
                    customizeUnitCode: 'SFIN.INVOICE_SUMMARY_LIST.LINE',
                  })
            }
            otherButtonProps={{
              type: 'primary',
            }}
          />,
        ];
        break;
      case 'taxInvoiceLineTab':
        normalBtns = [
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/purchase/export`}
            queryParams={this.handleGetFormValue(
              'SFIN.INVOICE_SUMMARY_LIST.TAX_LINE',
              taxInvoiceLineIds
            )}
            otherButtonProps={{ type: 'primary' }}
          />,
        ];
        break;
      default:
    }
    return remote
      ? remote.process('SFIN_INVOICE_SUMMARY_LIST_CUX_HEADER_BTNS', normalBtns, {
          loading,
          activeKey,
          form: this.handleGetForm(),
          handleSearch: this.handleSearch,
          selectedRows,
        })
      : normalBtns;
  }

  render() {
    const { activeKey, selectedRows = [], viewVisible, ocrFileUrl } = this.state;
    const { history, customizeBtnGroup } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sfin.invoiceBill.view.message.title.myOwnShouldPayInvoice`)
            .d('我的应付发票')}
        >
          {customizeBtnGroup(
            {
              code: activeKey === 'summaryTab' ? 'SFIN.INVOICE_SUMMARY_LIST.SUMMARY_BTNS' : '',
            },
            this.renderHeaderBtns()
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs activeKey={activeKey} tabPosition="top" animated={false} onChange={this.changeTabs}>
            <TabPane
              tab={intl
                .get('sfin.invoiceBill.view.message.title.myOwnShouldPayInvoice')
                .d('我的应付发票')}
              key="summaryTab"
            >
              <SummaryTab onRef={this.handleNonRef} history={history} />
            </TabPane>
            <TabPane
              tab={intl.get('sfin.invoiceBill.view.message.title.invoiceLine').d('发票行')}
              key="invoiceLineTab"
            >
              <InvoiceLineTab
                onRef={(ref) => (this.invoiceLine = ref)}
                handleRowSelect={this.handleRowSelect}
                history={history}
                clearRows={this.clearRows}
                selectedRows={selectedRows}
              />
            </TabPane>
            <TabPane
              tab={intl.get('sfin.invoiceBill.view.taxInvoiceRow').d('税务发票行')}
              key="taxInvoiceLineTab"
            >
              <TaxInvoiceTab
                onRef={(ref = {}) => (this.taxInvoiceLine = ref)}
                onSetSelectRows={this.handelSetSelectRows}
                previewOcrFile={this.previewOcrFile}
              />
            </TabPane>
          </Tabs>
        </Content>
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
      </React.Fragment>
    );
  }
}
