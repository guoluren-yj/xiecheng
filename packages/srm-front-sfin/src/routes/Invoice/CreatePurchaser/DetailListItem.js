/**
 *  @description:非寄销发票维护
 *  @Author: jiwei.liu01@hand-china.com  *
 *  @Date: 2021-06-07 20:09:04  *
 *  @Last Modified time: 2021-06-07 20:09:04  *
 *  @copyright : { Copyright (c) 2021, Hand}  */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Modal, Badge, Form } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { isEmpty, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { stringify } from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId, getEditTableData, createPagination } from 'utils/utils';
import { routerRedux } from 'dva/router';
import Lov from 'components/Lov';
import { getInvoiceConfigTable } from '@/services/invoiceService';

import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import TaxTicketTable from '../Components/TaxTicketTable';
import AddLinesModal from '../Components/AddLinesModal';
import Change from '../../components/ChangeFormItem';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import InvoiceModal from './InvoiceModal';
// import { thousandBitSeparator, precisionParams } from '@/routes/utils';

const { TabPane } = Tabs;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';
const titlePrompt = 'sfin.invoiceBill.view.title';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO';

const remoteProcessCode = 'SFIN.INVOICE_CREATE_PURCHASER_DETAIL_LIST_CUX.VALIDATE';
const remoteOcrTitleCode = 'SFIN.INVOICE_CREATE_PURCHASER_DETAIL_LIST_CUX.OCR_TITLE';
const remoteBtnCreateCode = 'SFIN.INVOICE_CREATE_PURCHASER_DETAIL_LIST_CUX.CREATE_SHOW_FLAG';
@remote({
  code: 'SFIN.INVOICE_CREATE_PURCHASER_DETAIL_LIST_CUX',
  name: 'remote',
})
@connect(({ loading, invoice, bill }) => ({
  invoice,
  bill,
  organizationId: getCurrentOrganizationId(),
  headerLoading: loading.effects['invoice/queryDetailHeader'],
  lineLoading: loading.effects['invoice/queryDetailLine'],
  saveLoading: loading.effects['invoice/saveInvoice'],
  submitLoading: loading.effects['invoice/submitInvoice'],
  deleteLoading:
    loading.effects['invoice/deleteInvoice'] || loading.effects['invoice/cancelInvoice'],
  validatorLoading: loading.effects['invoice/checkValidator'],
  queryLineLoading: loading.effects['invoice/queryDetailLine'],
  saveLineLoading: loading.effects['invoice/saveLines'],
  addLinesLoading: loading.effects['invoice/addLines'],
  deleteLinesLoading: loading.effects['invoice/deleteLines'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'entity.item',
    'entity.business',
    'sfin.invoiceBill',
    'sfin.invoiceInspection',
  ],
})
@withCustomize({
  // unitCode: [`${hcuzCode},SFIN.INVOICE_UPDATE_DETAIL.TAB`],
  unitCode: [
    'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
    'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO',
    'SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
    'SFIN.INVOICE_UPDATE_DETAIL.TAB',
  ],
})
export default class CreateDetail extends Component {
  constructor(props) {
    super(props);
    const {
      // match: {
      //   params: { invoiceHeaderId },
      // },
      invoiceHeaderId,
    } = props;
    if (props.onRef) {
      props.onRef(this);
    }
    this.headerForm = {};
    this.state = {
      invoiceHeaderId,
      recordModal: false,
      invoiceModal: false,
      attachmentUUID: null,
      tenantId: getCurrentOrganizationId(),
      tabKey: 'detailTable',
      infDataSource: [],
      infPagination: {},
      settings: '0',
      setting010505: '',
      selectedLinesKeys: [],
      selectedLines: [],
      cancelAsyncPushFlag: false,
    };
    const Change_ = Change('taxInvoiceLineId');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isSave = Change_.isSave;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  componentDidMount() {
    this.init();
    this.getInvoiceConfigTableList();
  }

  getInvoiceConfigTableList() {
    if (getInvoiceConfigTable) {
      getInvoiceConfigTable().then((res) => {
        if (res && isArray(res)) {
          const list = res?.filter((v) => v.documentType === 'INVOICE');
          this.setState({ cancelAsyncPushFlag: Number(list[0]?.cancelAsyncPushFlag) === 1 });
        }
      });
    }
  }

  @Bind()
  init() {
    this.handleSearchInf();
    this.fetchSettings();
  }

  @Bind()
  processBillList() {
    const {
      invoice: { invoiceList = [] },
      dispatch,
      history,
      parentPage,
      // invoiceHeaderId,
    } = this.props;

    const { invoiceHeaderId } = this.state;
    if (invoiceList.length === 1) {
      dispatch({
        type: 'invoice/updateState',
        payload: { invoiceList: [] },
      });
      history.push(`/sfin/invoice-create-purchaser/list`);
    } else if (invoiceList.length > 1) {
      const list = invoiceList.filter(
        (item) => String(item.invoiceHeaderId) !== String(invoiceHeaderId)
      );
      dispatch({
        type: 'invoice/updateState',
        payload: {
          invoiceList: list,
        },
      });
      parentPage.updateActiveKey(list);
    }
  }

  // 过滤掉新建行的 行id，过滤掉 _status
  @Bind()
  filterLineKey(list = [], key = {}) {
    // 过滤掉新建行的 lineKey
    const listData = list.map((item) => {
      if (item._status === 'create') {
        return {
          ...item,
          ...key,
        };
      }
      return item;
    });
    return listData;
  }

  @Bind()
  isValidator(data, fn) {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/checkValidator',
      payload: data,
    }).then((res) => {
      if (res) {
        if (Object.keys(res).length > 0) {
          Modal.confirm({
            title: res[Object.keys(res)[0]].desc,
            onOk: fn,
          });
        } else {
          fn();
        }
      }
    });
  }

  @Bind()
  handleQueryLine() {
    const {
      dispatch,
      invoice: { detailLinePagination = {} },
      invoiceHeaderId,
    } = this.props;
    dispatch({
      type: 'invoice/queryDetailLine',
      payload: {
        type: 'create',
        invoiceHeaderId,
        page: detailLinePagination.create,
        customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
      },
    });
  }

  @Bind()
  saveInvoice() {
    const {
      dispatch,
      invoice: { detailHeader = {}, detailLine = {} },
      remote: remoteProps,
    } = this.props;
    let listDataSource;
    let search;
    let pagination;
    if (this.taxTicketTableRef) {
      listDataSource = this.taxTicketTableRef.state.listDataSource || [];
      search = this.taxTicketTableRef.handleSearch;
      pagination = this.taxTicketTableRef.pagination || {};
    }

    // const taxAmounts =
    //   Math.round(
    //     sum((listDataSource || []).map(item => item.$form.getFieldValue('taxAmount'))) * 100
    //   ) / 100;
    // const taxIncludedAmounts =
    //   Math.round(
    //     sum(
    //       (listDataSource || []).map(item =>
    //         sum([item.$form.getFieldValue('totalAmount'), item.$form.getFieldValue('taxAmount')])
    //       )
    //     ) * 100
    //   ) / 100;
    // const filterLists = (listDataSource || [])
    //   .map(item => item.$form.getFieldValue('taxAmount'))
    //   .filter(item => ![undefined, null].includes(item));

    // if (
    //   this.taxTicketTableRef &&
    //   !isEmpty(listDataSource) &&
    //   filterLists.length === listDataSource.length &&
    //   (taxAmounts !== parseFloat(this.headerForm.props.form.getFieldValue('taxAmount')) ||
    //     taxIncludedAmounts !==
    //       parseFloat(this.headerForm.props.form.getFieldValue('taxIncludedAmount')))
    // ) {
    //   Modal.confirm({
    //     title: intl
    //       .get('hzero.common.message.confirm.autoSummaryAmounts')
    //       .d('发票头行金额不一致，是否需要自动汇总税务发票行金额？'),
    //     onOk: () => {
    //       this.headerForm.props.form.setFieldsValue({
    //         taxIncludedAmount: taxIncludedAmounts,
    //         taxAmount: taxAmounts,
    //       });
    //     },
    //   });
    //   return;
    // }

    const { attachmentUUID, tenantId } = this.state;
    const { invoiceHeaderId } = this.props;
    const sourceHeader = detailHeader.create;
    const sourceLine = detailLine.create.content;
    this.headerForm.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const taxInvoiceLines = getEditTableData(listDataSource || [], {
        force: true,
      }).map((item) => {
        const { billingDate } = item;
        return {
          ...item,
          billingDate: billingDate ? moment(billingDate).format(DATETIME_MIN) : undefined,
          // taxIncludedAmount: taxIncludedAmounts,
          tenantId,
          invoiceHeaderId,
        };
      });
      if (isArray(listDataSource) && taxInvoiceLines.length !== listDataSource.length) return;
      const invoiceLines = getEditTableData(sourceLine, ['_status']);
      if (isArray(sourceLine) && sourceLine.length !== invoiceLines.length) return;
      const data = {
        ...sourceHeader,
        ...fieldsValue,
        invoiceLines,
        taxInvoiceDateIssued: fieldsValue.taxInvoiceDateIssued
          ? moment(fieldsValue.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT)
          : moment(sourceHeader.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT),
        attachmentUuid: sourceHeader.attachmentUuid || attachmentUUID,
        taxInvoiceLines: this.filterLineKey(taxInvoiceLines, { taxInvoiceLineId: null }),
        customizeUnitCode: `${hcuzCode},SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE`,
      };

      confirm({
        title: intl
          .get('sfin.invoiceBill.view.message.invoiceBill.confirmSave')
          .d('保存会自动汇总税务发票行金额，是否保存？'),
        onOk: () => {
          this.isValidator(data, () => {
            dispatch({
              type: 'invoice/saveInvoice',
              payload: data,
            }).then((res) => {
              if (res) {
                this.setUpdate('reset');
                // pur-22097 樊登读书埋点
                const remoteRes = remoteProps.process(
                  'SFIN.INVOICE_CREATE_PURCHASER_DETAIL_LIST_CUX.BTNS_SAVE',
                  true
                );
                if (remoteRes) notification.success();
                this.headerForm.fetchDetail();
                this.handleQueryLine();
                if (search) {
                  search(pagination);
                }
              }
            });
          });
        },
      });
    });
  }

  @Bind()
  deleteInvoice() {
    const { dispatch, invoiceHeaderId } = this.props;
    confirm({
      title: intl.get('sfin.invoiceBill.view.message.invoiceBill.isTrueDelte').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'invoice/deleteInvoice',
          payload: invoiceHeaderId,
        }).then((res) => {
          if (res) {
            notification.success();
            this.processBillList();
          }
        });
      },
    });
  }

  @Bind()
  cancelInvoice() {
    const { dispatch, invoiceHeaderId } = this.props;
    confirm({
      title: intl.get('sfin.invoiceBill.view.message.invoiceBill.isTrueCancel').d('是否确认取消?'),
      onOk: () => {
        dispatch({
          type: 'invoice/cancelInvoice',
          payload: { invoiceHeaderId },
        }).then((res) => {
          if (res) {
            this.processBillList();
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 设置 _status
   * @param {Object} data
   */
  @Bind()
  setStatus(data = {}) {
    const { content = [], ...other } = data;
    const newContent = content.map((o) => ({ ...o, _status: 'update' }));
    return { content: newContent, ...other };
  }

  /**
   * 查询总账科目Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchInf(params = {}) {
    const {
      dispatch,
      organizationId,
      // invoice: { infPagination },
    } = this.props;

    const { infPagination } = this.state;
    const { invoiceHeaderId } = this.props;
    dispatch({
      type: 'invoice/fetchInvoicePage',
      payload: {
        organizationId,
        invoiceHeaderId,
        page: isEmpty(params) ? infPagination : params,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          infDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          infPagination: createPagination(res),
        });
      }
    });
  }

  // 查询配置中心配置
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/querySetting',
    }).then((res) => {
      if (res) {
        this.setState({
          settings: res['010514'],
          setting010505: res['010505'] && res['010505'].settingValue,
        });
      }
    });
  }

  @Bind()
  submitInvoice() {
    const {
      dispatch,
      invoice: { detailHeader = {}, detailLine = {} },
      invoiceHeaderId,
    } = this.props;
    const { attachmentUUID, tenantId } = this.state;
    const createHeader = detailHeader.create;
    const sourceLine = detailLine.create.content;
    let listDataSource;
    if (this.taxTicketTableRef) {
      listDataSource = this.taxTicketTableRef.state.listDataSource || [];
    }

    // const taxAmounts =
    //   Math.round(
    //     sum((listDataSource || []).map(item => item.$form.getFieldValue('taxAmount'))) * 100
    //   ) / 100;
    // const taxIncludedAmounts =
    //   Math.round(
    //     sum(
    //       (listDataSource || []).map(item =>
    //         sum([item.$form.getFieldValue('totalAmount'), item.$form.getFieldValue('taxAmount')])
    //       )
    //     ) * 100
    //   ) / 100;
    // const filterLists = (listDataSource || [])
    //   .map(item => item.$form.getFieldValue('taxAmount'))
    //   .filter(item => ![undefined, null].includes(item));

    // if (
    //   this.taxTicketTableRef &&
    //   !isEmpty(listDataSource) &&
    //   filterLists.length === listDataSource.length &&
    //   (taxAmounts !== parseFloat(this.headerForm.props.form.getFieldValue('taxAmount')) ||
    //     taxIncludedAmounts !==
    //       parseFloat(this.headerForm.props.form.getFieldValue('taxIncludedAmount')))
    // ) {
    //   Modal.confirm({
    //     title: intl
    //       .get('hzero.common.message.confirm.autoSummaryAmounts')
    //       .d('发票头行金额不一致，是否需要自动汇总税务发票行金额？'),
    //     onOk: () => {
    //       this.headerForm.props.form.setFieldsValue({
    //         taxIncludedAmount: taxIncludedAmounts,
    //         taxAmount: taxAmounts,
    //       });
    //     },
    //   });
    //   return;
    // }
    this.headerForm.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const taxInvoiceLines = getEditTableData(listDataSource || [], {
        force: true,
      }).map((item) => {
        // const invoiceCode = (listDataSource || []).map(
        //   n => n.taxInvoiceLineId === item.taxInvoiceLineId && n.invoiceCode
        // );
        const { billingDate } = item;
        return {
          ...item,
          billingDate: billingDate ? moment(billingDate).format(DATETIME_MIN) : undefined,
          // invoiceCode: invoiceCode[0],
          // taxIncludedAmount: taxIncludedAmounts,
          // taxAmount: Math.round(item.taxAmount * 100) / 100,
          tenantId,
          invoiceHeaderId,
        };
      });
      if (isArray(listDataSource) && taxInvoiceLines.length !== listDataSource.length) return;
      const invoiceLines = getEditTableData(sourceLine, ['_status']);
      if (isArray(sourceLine) && sourceLine.length !== invoiceLines.length) return;
      confirm({
        title: intl
          .get('sfin.invoiceBill.view.message.invoiceBill.confirmSubmit')
          .d('提交会自动汇总税务发票行金额，是否提交？'),
        onOk: () => {
          const data = {
            ...createHeader,
            ...fieldsValue,
            checkSource: 'AUDIT',
            invoiceLines,
            taxInvoiceDateIssued: fieldsValue.taxInvoiceDateIssued
              ? moment(fieldsValue.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT)
              : moment(createHeader.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT),
            attachmentUuid: createHeader.attachmentUuid || attachmentUUID,
            taxInvoiceLines: this.filterLineKey(taxInvoiceLines, { taxInvoiceLineId: null }),
            customizeUnitCode: `${hcuzCode},SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE`,
          };

          this.isValidator(data, () => {
            dispatch({
              type: 'invoice/submitInvoice',
              payload: data,
            })
              .then((res) => {
                if (res) {
                  notification.success();
                  this.processBillList();
                } else {
                  // 重新查询税务发票信息
                  // eslint-disable-next-line no-lonely-if
                  if (this?.taxTicketTableRef?.handleSearch) {
                    this.taxTicketTableRef.handleSearch();
                  }
                }
              })
              .catch(() => {
                // 重新查询税务发票信息
                // eslint-disable-next-line no-lonely-if
                if (this?.taxTicketTableRef?.handleSearch) {
                  this.taxTicketTableRef.handleSearch();
                }
              });
          });
        },
      });
    });
  }

  /**
   * 保存attachmentUUID
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    this.setState({
      attachmentUUID,
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState(
      {
        recordModal: true,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
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

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  /**
   * makeOutInvoice - 直连开票
   */
  @Bind()
  makeOutInvoice() {
    const {
      invoice: {
        detailHeader: { create = {} },
      },
    } = this.props;
    const { invoiceType = [] } = create;
    if (invoiceType.length > 1) {
      this.setState({
        invoiceModal: true,
        invoiceType,
      });
    } else if (invoiceType.length === 1) {
      const { invoiceTypeCode } = invoiceType[0];
      this.invoiceModalOk(invoiceTypeCode);
    } else {
      return {};
    }
  }

  /**
   * invoiceModalOk - 确认并预览发票
   * @param {String} invoiceTypeCode
   */
  @Bind()
  invoiceModalOk(invoiceTypeCode) {
    const { dispatch, invoiceHeaderId } = this.props;
    // const { invoiceHeaderId } = this.state;
    const isPreview = true;
    const type = 'create';
    dispatch(
      routerRedux.push({
        pathname: '/sfin/invoice-create-purchaser/view',
        search: stringify({ invoiceHeaderId, invoiceTypeCode, isPreview, type }),
      })
    );
    this.closeInvoiceModel();
  }

  @Bind()
  closeInvoiceModel() {
    this.setState({
      invoiceModal: false,
    });
  }

  // 保存行数据
  @Bind()
  handleSaveLines() {
    const {
      dispatch,
      invoice: { detailLine = {} },
      invoiceHeaderId,
    } = this.props;
    const { tenantId } = this.state;
    const lines = detailLine.create.content;
    const body = getEditTableData(lines);
    if (isEmpty(body) && !isEmpty(lines)) {
      return;
    }
    dispatch({
      type: 'invoice/saveLines',
      payload: {
        tenantId,
        invoiceHeaderId,
        body,
        customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.headerForm.fetchDetail();
        this.handleQueryLine();
      }
    });
  }

  @Bind()
  hanldeAddModal() {
    const { setting010505 } = this.state;
    const {
      addLinesLoading,
      invoice: {
        detailHeader: { create = {} },
      },
      invoiceHeaderId,
    } = this.props;
    const { businessType } = create;
    const addLinesModalProps = {
      invoiceHeaderId,
      businessType,
      setting010505,
      detailHeader: this.props.invoice.detailHeader,
      type: 'purchaser',
      typeStatus: 'create',
      loading: addLinesLoading,
      onOk: this.handleAddLines,
    };
    c7nModal.open({
      drawer: true,
      closable: true,
      key: c7nModal.key(),
      destroyOnClose: true,
      style: { width: 1200 },
      title: intl.get(`sfin.invoiceBill.view.message.title.addLines`).d('新增发票行'),
      children: <AddLinesModal {...addLinesModalProps} />,
    });
  }

  // 新增行
  @Bind()
  async handleAddLines(body) {
    const { tenantId } = this.state;
    const {
      dispatch,
      invoice: { detailHeader = {} },
      invoiceHeaderId,
    } = this.props;
    const { businessType } = detailHeader.update || {};
    const res = await dispatch({
      type: 'invoice/addLines',
      payload: {
        body,
        tenantId,
        businessType,
        invoiceHeaderId,
      },
    });
    if (!res) return false;
    notification.success();
    this.headerForm.fetchDetail();
    this.handleQueryLine();
    this.handleSearchInf();
  }

  // 删除行
  @Bind()
  handleDeleteLines() {
    const { selectedLines, tenantId } = this.state;
    const { dispatch, invoiceHeaderId } = this.props;
    dispatch({
      type: 'invoice/deleteLines',
      payload: {
        tenantId,
        invoiceHeaderId,
        body: selectedLines.map(({ rowKey, ...other }) => other),
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.headerForm.fetchDetail();
        this.handleQueryLine();
        this.handleSearchInf();
        this.setState({ selectedLinesKeys: [], selectedLines: [] });
      }
    });
  }

  // Modal 数据勾选
  @Bind()
  lineSelectionChange(selectedLinesKeys, selectedLines) {
    this.setState({
      selectedLinesKeys,
      selectedLines,
    });
  }

  @Bind()
  handleSupplier(_, lovRecord) {
    const { form } = this.props;
    form.registerField('taxId');
    form.setFieldsValue({
      taxRate: lovRecord.taxRate,
      taxId: lovRecord.taxId,
    });
  }

  // 批量修改税率相关
  @Bind()
  handleUpdateTaxRate() {
    const { selectedLines = [], invoiceHeaderId } = this.state;
    const {
      dispatch,
      form,
      invoice: { detailLine = {} },
    } = this.props;
    const lines = detailLine.create.content;
    const body = getEditTableData(lines);
    if (isEmpty(body) && !isEmpty(lines)) {
      return;
    }
    let data = [];
    body.forEach((i) => {
      const obj = selectedLines.find((v) => i.invoiceLineId === v.invoiceLineId);
      if (obj != null) {
        data = [
          ...data,
          {
            ...obj,
            taxRate: form.getFieldValue('taxRate'),
            taxId: form.getFieldValue('taxId'),
          },
        ];
      }
    });
    dispatch({
      type: 'invoice/updateTax',
      payload: {
        body: data,
        invoiceHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: 'invoice/updateDetailLine',
          payload: {
            lines: [],
            type: 'create',
            pagination: {},
          },
        });
        this.headerForm.fetchDetail();
        this.handleQueryLine();
        this.handleSearchInf();
        this.setState({
          selectedLines: [],
          selectedLinesKeys: [],
        });
        form.setFieldsValue({ taxRate: undefined });
      }
    });
  }

  render() {
    const {
      recordModal,
      invoiceModal,
      attachmentUUID,

      tabKey,
      tenantId,
      invoiceType,
      infDataSource = [],
      infPagination = {},
      settings,
      selectedLinesKeys,
      selectedLines = [],
      cancelAsyncPushFlag,
    } = this.state;
    const {
      form,
      dispatch,
      headerLoading,
      saveLoading,
      submitLoading,
      deleteLoading,
      validatorLoading,
      queryLineLoading,
      saveLineLoading,
      addLinesLoading,
      deleteLinesLoading,
      invoice: { detailHeader = {}, detailLine = {} },
      invoice: {
        detailHeader: { create = {} },
      },
      customizeTable,
      customizeForm,
      customizeTabPane,
      invoiceHeaderId,
      defaultActiveKey,
      batchFlag,
      remote: remoteProps,
    } = this.props;
    const { amountPrecision, pricePrecision } = detailHeader.create || {};

    const { permitDirectInvoiceFlag, issueStatusCode, taxUpdFlag } = create;
    const operationRecordProps = {
      invoiceHeaderId,
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const invoiceModalProps = {
      visible: invoiceModal,
      onClose: this.closeInvoiceModel,
      onModalOk: this.invoiceModalOk,
      invoiceType,
    };
    const type = 'create';
    let uuid;
    if (attachmentUUID === null) {
      const headerInfo = detailHeader[type] || {};
      uuid = headerInfo.attachmentUuid;
    } else {
      uuid = attachmentUUID;
    }
    const attachment = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      attachmentUUID: uuid,
      btnProps: { icon: 'upload' },
      bucketDirectory: 'sfin-file-bucket',
    };
    const taxTicketTableProps = {
      amountPrecision,
      pricePrecision,
      tenantId,
      hcuzCode: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
      customizeTable,
      type,
      settings,
      invoiceHeaderId,
      fetchHeader: this.headerForm.fetchDetail,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      onRef: (ref) => {
        this.taxTicketTableRef = ref;
      },
      saveLoading,
      setUpdate: this.setUpdate,
      headerForm: this.headerForm,
      isSave: this.isSave,
      ChangeFormItem: this.ChangeFormItem,
      remoteProps,
      remoteProcessCode,
      remoteOcrTitleCode,
      remoteBtnCreateCode,
    };

    const DetailTables = {
      batchFlag,
      defaultActiveKey,
      invoiceHeaderId,
    };
    const DetailHeaderList = {
      batchFlag,
      defaultActiveKey,
      invoiceHeaderId,
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    const lines = detailLine.create.content;
    const { taxIncludePriceUpdFlag, taxAmountUpdFlag, netPriceUpdFlag } = isEmpty(lines)
      ? {}
      : lines[0];
    const saveBtnVisible = Boolean(taxIncludePriceUpdFlag || taxAmountUpdFlag || netPriceUpdFlag);
    const isLoading =
      saveLoading ||
      headerLoading ||
      submitLoading ||
      validatorLoading ||
      deleteLoading ||
      queryLineLoading;
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/invoice-create-purchaser/list"
          title={intl.get(`${promptCode}.title.invoice.create.detail`).d('非寄销发票维护')}
        >
          <Button type="primary" icon="save" loading={isLoading} onClick={this.saveInvoice}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="check" loading={isLoading} onClick={this.submitInvoice}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          {cancelAsyncPushFlag ? (
            <Button icon="rollback" loading={isLoading} onClick={this.cancelInvoice}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          ) : (
            <Button icon="delete" loading={isLoading} onClick={this.deleteInvoice}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
          {permitDirectInvoiceFlag ? (
            <Button
              onClick={this.makeOutInvoice}
              icon="link-invoice"
              disabled={issueStatusCode === 'SUCCESS'}
            >
              {intl.get(`${titlePrompt}.directInvoice`).d('直连开票')}
            </Button>
          ) : (
            ''
          )}
          <Upload {...attachment} afterOpenUploadModal={this.afterOpenUploadModal} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <DetailHeader
            {...DetailHeaderList}
            type="create"
            onRef={(ref) => {
              this.headerForm = ref;
            }}
            ChangeFormItem={this.ChangeFormItem}
            customizeForm={customizeForm}
          />
          {customizeTabPane(
            { code: 'SFIN.INVOICE_UPDATE_DETAIL.TAB' },
            <Tabs onChange={this.changeTab} activeKey={tabKey} animated={false}>
              <TabPane
                tab={intl.get(`${promptCode}.view.invoiceRow`).d('发票行')}
                key="detailTable"
                className={Styles['purchase-application']}
              >
                <Form layout="inline">
                  {saveBtnVisible && (
                    <Button
                      type="primary"
                      onClick={this.handleSaveLines}
                      loading={queryLineLoading || saveLineLoading}
                    >
                      {intl.get(`hzero.common.button.save`).d('保存')}
                    </Button>
                  )}
                  <Button
                    onClick={this.handleDeleteLines}
                    disabled={selectedLinesKeys.length === 0}
                    loading={queryLineLoading || deleteLinesLoading}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </Button>
                  <Button
                    onClick={() => this.hanldeAddModal()}
                    loading={queryLineLoading || addLinesLoading}
                  >
                    {intl.get(`hzero.common.button.add`).d('新增')}
                  </Button>
                  {Boolean(taxUpdFlag) && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => this.handleUpdateTaxRate(true)}
                        loading={queryLineLoading || addLinesLoading}
                        disabled={
                          form.getFieldValue('taxRate') === undefined ||
                          (selectedLines && selectedLines.length === 0)
                        }
                      >
                        {intl.get(`sfin.invoiceBill.button.taxRate`).d('批量修改税率')}
                      </Button>
                      <Form>
                        <Form.Item>
                          {form.getFieldDecorator(`taxRate`)(
                            <Lov
                              code="SPCM.TAX"
                              style={{ width: 200 }}
                              textField="taxRate"
                              onChange={(val, lovRecord) => this.handleSupplier(val, lovRecord)}
                              onOk={(lovRecord) => {
                                form.setFieldsValue({ taxRate: lovRecord.taxRate });
                              }}
                            />
                          )}
                        </Form.Item>
                      </Form>
                    </>
                  )}
                </Form>

                <DetailTable
                  {...DetailTables}
                  type="create"
                  rowSelection={{
                    selectedRowKeys: selectedLinesKeys,
                    onChange: this.lineSelectionChange,
                  }}
                />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.taxInvoiceRow`).d('税务发票行')}
                key="taxTicketBank"
              >
                <TaxTicketTable {...taxTicketTableProps} />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get(`${promptCode}.view.inf`).d('总账科目')}
                    <Badge
                      className={Styles['badge-tab']}
                      style={{
                        backgroundColor: '#fff',
                        color: tabKey === 'infs' ? '#29BECE' : '#000',
                      }}
                      overflowCount={99}
                      offset={[6, 0]}
                      showZero
                      count={infDataSource.length}
                    />
                  </span>
                }
                key="infs"
              >
                <SupplierTable {...glaProps} />
              </TabPane>
            </Tabs>
          )}

          <ActionHistory {...operationRecordProps} />
          <InvoiceModal {...invoiceModalProps} />
        </Content>
      </React.Fragment>
    );
  }
}
