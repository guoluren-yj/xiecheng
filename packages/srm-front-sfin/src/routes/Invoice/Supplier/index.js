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
import { isEmpty, map } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { SRM_FINANCE } from '_utils/config';
import Viewer from 'react-viewer';

import { getCurrentOrganizationId, filterNullValueObject, getAttachmentUrl } from 'utils/utils';
import notification from 'utils/notification';
import moment from 'moment';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import withRemote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getAttachmentUrlWithToken, previewPdf } from '../../../utils/utils';
import SupplierTab from './SupplierTab.js';
import InvoiceLineTab from './InvoiceLineTab.js';
import TaxInvoiceTab from './TaxInvoiceTab.js';

const { TabPane } = Tabs;
@withRemote({
  code: 'SFIN_INVOICE_SUPPLIER_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: ['sfin.invoiceBill', 'sfin.common', 'sfin.invoiceVerification', 'sfin.payableInvoice'],
})
@connect(({ invoice = {}, loading }) => ({
  invoice,
  printLoading: loading.effects['invoice/print'],
}))
export default class Maintain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      taxInvoiceRows: [],
      organizationId: getCurrentOrganizationId(),
      activeKey: 'supplierTab',
      selectedRowKeys: [],
      viewVisible: false, // ocr识别文件为图片时-是否显示弹窗
      ocrFileUrl: '',
    };
  }

  // nonRef;

  @Bind()
  handleNonRef(ref = {}) {
    this.supplier = ref;
  }

  @Bind()
  handleGetForm() {
    const { activeKey } = this.state;
    switch (activeKey) {
      case 'supplierTab':
        return this.supplier?.filterForm?.props?.form;
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
    if (activeKey === 'supplierTab') {
      this.supplier.handleSearch(pagination.supplier);
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

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue(customizeUnitCode, thisList) {
    const { activeKey } = this.state;
    const thisForm = activeKey === 'supplierTab' ? this.supplier : this.taxInvoiceLine;
    const params =
      thisForm && thisForm.filterForm
        ? (thisForm.filterForm.props && thisForm.filterForm.props.form.getFieldsValue()) || {}
        : {};
    if (isEmpty(thisList)) {
      return filterNullValueObject({
        ...params,
        creationDateFrom: params.creationDateFrom
          ? moment(params.creationDateFrom).format(DATETIME_MIN)
          : '',
        creationDateTo: params.creationDateTo
          ? moment(params.creationDateTo).format(DATETIME_MAX)
          : '',
        reviewedDateFrom: params.reviewedDateFrom
          ? moment(params.reviewedDateFrom).format(DATETIME_MIN)
          : '',
        reviewedDateTo: params.reviewedDateTo
          ? moment(params.reviewedDateTo).format(DATETIME_MAX)
          : '',
        billingDateFrom: params.billingDateFrom
          ? moment(params.billingDateFrom).format(DATETIME_MIN)
          : '',
        billingDateTo: params.billingDateTo
          ? moment(params.billingDateTo).format(DATETIME_MAX)
          : '',
        customizeUnitCode,
      });
    } else if (activeKey === 'supplierTab') {
      return {
        invoiceHeaderIds: thisList.map((item) => item.invoiceHeaderId),
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
  handelSetSelectRows(val, selectedRows) {
    this.setState({ [val]: selectedRows });
  }

  /**
   * 全选
   */
  // @Bind()
  // handleRowSelectAll(_, rows){
  //   // invoiceHeaderId
  //   const rowKey =rows.map(item=>item.invoiceHeaderId);
  //   this.setState({
  //     selectedRowKeys: rowKey,
  //   });
  // }

  /**
   * 打印功能
   */
  @Bind()
  @Throttle(2000)
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    let flag;
    const invoiceStatus = map(selectedRows, 'invoiceStatus');
    for (let i = 0; i < invoiceStatus.length; i++) {
      if (
        invoiceStatus[i] === 'NEW' ||
        invoiceStatus[i] === 'CANCELLED' ||
        invoiceStatus[i] === 'EC_REJECTED' ||
        invoiceStatus[i] === 'EC_INVOICING' ||
        invoiceStatus[i] === 'EC_INVOICED' ||
        invoiceStatus[i] === 'EC_SERVING' ||
        invoiceStatus[i] === 'EC_SERVICED'
      ) {
        flag = true;
      }
    }
    if (flag) {
      notification.error({
        message: intl
          .get(`sfin.invoiceBill.view.message.selectedCannotBePrinted`)
          .d('您选择的单据中含不可打印状态的单据,请检查!'),
      });
    } else {
      if (selectedRowKeys.length > 16) {
        notification.warning({
          message: intl
            .get('sfin.invoiceBill.view.message.selectedMaxLimit16')
            .d('操作失败，失败原因是您当前批量勾选的单据过多，建议勾选16条及以下的数据重新操作'),
        });
        return;
      }
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
            } catch (e) {
              const file = new Blob([res], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              const printWindow = window.open(fileURL);
              if (printWindow?.print) {
                printWindow.print();
              }
            }
          };
          reader.readAsText(res);
        });
      }
    }
  }

  @Bind()
  handleRowSelectedChange(key, rows) {
    this.setState({
      selectedRowKeys: key,
      selectedRows: rows,
    });
  }

  /**
   * 是否高亮显示打印按钮
   * description: 已提交: SUBMITTED、已审核: APPROVED、已复核: REVIEWED、退回至审核: RETURN_TO_APPROVE 退回至复核:RETURN_TO_REVIEW 外部系统签收中:EXT_SYSTEM_SIGN
   */
  @Bind()
  renderDisabled() {
    const { selectedRows = [], selectedRowKeys = [] } = this.state;
    const isEdit = selectedRows.some((item) =>
      [
        'SUBMITTED',
        'APPROVED',
        'REVIEWED',
        'RETURN_TO_APPROVE',
        'RETURN_TO_REVIEW',
        'SYNCHRONIZING',
        'EXT_SYSTEM_SIGN',
      ].includes(item.invoiceStatus)
    );
    return isEmpty(selectedRowKeys) ? true : !isEdit;
  }

  @Bind()
  handleRowSelect(selectedRowKeys, supplierSelectedRows) {
    this.setState({
      supplierSelectedRows,
    });
  }

  @Bind()
  clearRows() {
    this.setState({ supplierSelectedRows: [] });
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
      selectedRows = [],
      taxInvoiceRows = [],
      supplierSelectedRows = [],
    } = this.state;
    const { remote, printLoading = false } = this.props;
    let taxInvoiceLineIds = [];
    // let baseExportBtnProps = {};
    const invoiceLineIdList = supplierSelectedRows.map((item) => item.invoiceLineId);
    const invoiceLineParams = this.invoiceLine?.props?.form.getFieldsValue() || {};
    if (activeKey === 'taxInvoiceLineTab') {
      taxInvoiceLineIds = taxInvoiceRows.map((item) => item.taxInvoiceLineId);
    }
    let normalBtns = [];
    switch (activeKey) {
      case 'supplierTab':
        normalBtns = [
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/supplier-export`}
            queryParams={this.handleGetFormValue(
              'SFIN.INVOICE_SUPPLIER_LIST.FILTER,SFIN.INVOICE_SUPPLIER_LIST.GRID',
              selectedRows
            )}
            otherButtonProps={{
              type: 'primary',
            }}
          />,
          <Button
            icon="printer"
            onClick={this.handlePrint}
            disabled={this.renderDisabled()}
            loading={printLoading}
          >
            {intl.get('sfin.invoiceBill.view.button.print').d('打印')}
          </Button>,
          <Button disabled={isEmpty(selectedRows)} onClick={() => this.supplier.showModal(true)}>
            {intl.get('sfin.invoiceBill.button.invoiceMultipleImport').d('发票物流批量录入')}
          </Button>,
        ];
        break;
      case 'invoiceLineTab':
        normalBtns = [
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice-line/payable-list-supplier-export`}
            queryParams={
              !isEmpty(invoiceLineIdList)
                ? {
                    invoiceLineIdList,
                    businessType:
                      this.invoiceLine && this.invoiceLine.props.form.getFieldValue('businessType'),
                    customizeUnitCode:
                      'SFIN.INVOICE_SUPPLIER_LIST.LINE,SFIN.INVOICE_SUPPLIER_LIST.INVOICE_FILTER',
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
                    customizeUnitCode:
                      'SFIN.INVOICE_SUPPLIER_LIST.LINE,SFIN.INVOICE_SUPPLIER_LIST.INVOICE_FILTER',
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
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/supplier/export`}
            queryParams={this.handleGetFormValue(
              'SFIN.INVOICE_SUMMARY_LIST.TAX_LINE,SFIN.INVOICE_SUPPLIER_LIST.TAX_FILTER',
              taxInvoiceLineIds
            )}
            otherButtonProps={{
              type: 'primary',
            }}
          />,
        ];
        break;
      default:
    }
    return remote
      ? remote.process('SFIN_INVOICE_SUPPLIER_LIST_CUX_HEADER_BTNS', normalBtns, {
          loading: printLoading,
          activeKey,
          form: this.handleGetForm(),
          handleSearch: this.handleSearch,
          selectedRows,
        })
      : normalBtns;
  }

  render() {
    const { activeKey, supplierSelectedRows = [], viewVisible, ocrFileUrl } = this.state;
    const { history } = this.props;
    return (
      <React.Fragment>
        <Header title={intl.get(`sfin.common.view.myOwnShouldInvoice`).d('我的应收发票')}>
          {this.renderHeaderBtns()}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs activeKey={activeKey} tabPosition="top" animated={false} onChange={this.changeTabs}>
            <TabPane
              tab={intl.get('sfin.common.view.myOwnShouldInvoice').d('我的应收发票')}
              key="supplierTab"
            >
              <SupplierTab
                onRef={this.handleNonRef}
                history={history}
                onSetSelectRows={this.handelSetSelectRows}
                handleRowSelectedChange={this.handleRowSelectedChange}
                // onSelectAll={this.handleRowSelectAll}
              />
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
                selectedRows={supplierSelectedRows}
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
