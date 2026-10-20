/**
 * Detail.js - 非寄销发票维护
 * @date: 2018-12-03
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Modal, Badge, Form } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId, getEditTableData, createPagination } from 'utils/utils';
import { getInvoiceConfigTable } from '@/services/invoiceService';
import Change from '../../components/ChangeFormItem';

import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import TaxTicketTable from '../Components/TaxTicketTable';
import AddLinesModal from '../Components/AddLinesModal';
import PermitDireModal from './PermitDireModal';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { confirm } = Modal;
const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO';

const remoteProcessCode = 'SFIN_INVOICE_UPDATE_PURCHASER_DETAIL_VALIDATE';
const remoteOcrTitleCode = 'SFIN_INVOICE_UPDATE_PURCHASER_DETAIL_CUX.OCR_TITLE';
const remoteBtnCreateCode = 'SFIN_INVOICE_UPDATE_PURCHASER_DETAIL_CUX.CREATE_SHOW_FLAG';

@remote({
  code: 'SFIN_INVOICE_UPDATE_PURCHASER_DETAIL',
  name: 'remote',
})
@connect(({ loading, invoice, bill }) => ({
  invoice,
  bill,
  loading:
    loading.effects['invoice/queryDetailHeader'] ||
    loading.effects['invoice/queryDetailLine'] ||
    loading.effects['invoice/saveInvoice'] ||
    loading.effects['invoice/submitInvoice'] ||
    loading.effects['invoice/deleteInvoice'] ||
    loading.effects['invoice/cancelInvoice'] ||
    loading.effects['invoice/checkValidator'] ||
    loading.effects['invoice/queryDetailLine'] ||
    loading.effects['invoice/saveLines'] ||
    loading.effects['invoice/addLines'] ||
    loading.effects['invoice/deleteLines'],
  // headerLoading: loading.effects['invoice/queryDetailHeader'],
  // lineLoading: loading.effects['invoice/queryDetailLine'],
  // saveLoading: loading.effects['invoice/saveInvoice'],
  // submitLoading: loading.effects['invoice/submitInvoice'],
  // deleteLoading: loading.effects['invoice/deleteInvoice'],
  // cancelLoading: loading.effects['invoice/cancelInvoice'],
  // validatorLoading: loading.effects['invoice/checkValidator'],
  // queryLineLoading: loading.effects['invoice/queryDetailLine'],
  // saveLineLoading: loading.effects['invoice/saveLines'],
  // addLinesLoading: loading.effects['invoice/addLines'],
  // deleteLinesLoading: loading.effects['invoice/deleteLines'],
  // organizationId: getCurrentOrganizationId(),
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sfin.invoiceBill'],
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
export default class UpdateDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { invoiceHeaderId, supplierType },
      },
    } = props;
    this.headerForm = {};
    let backPath;
    if (supplierType === 'supplier') {
      backPath = `/sfin/invoice-supplier/list`;
    } else {
      backPath = `/sfin/invoice-update-purchaser/list`;
    }
    this.state = {
      invoiceHeaderId,
      recordModal: false,
      attachmentUUID: null,
      backPath,
      tabKey: 'detailTable',
      isOpenAllowAble: false,
      openAccountDeduct: false,
      permitDireModal: false, // 直连开票模态框
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
    const { dispatch } = this.props;
    // 批量查询配置中心
    dispatch({
      type: 'invoice/querySetting',
      payload: {},
    }).then((res = {}) => {
      const isOpenAllowAble = res['010510'] === '1' ? true : !!undefined;
      const openAccountDeduct = res['010522'] === '1';
      this.setState({
        isOpenAllowAble,
        openAccountDeduct,
      });
    });
    this.handleSearchInf();
    this.fetchSettings();
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

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { invoiceHeaderId },
      },
    } = prevProps;
    if (this.props.match.params.invoiceHeaderId !== invoiceHeaderId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ invoiceHeaderId });
      const { dispatch } = this.props;
      // 批量查询配置中心
      dispatch({
        type: 'invoice/querySetting',
        payload: {},
      }).then((res) => {
        const isOpenAllowAble = res['010510'] === '1' ? true : !!undefined;
        const openAccountDeduct = res['010522'] === '1';
        this.setState({
          isOpenAllowAble,
          openAccountDeduct,
        });
      });
    }
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
  handleQueryLine() {
    const {
      dispatch,
      invoice: { detailLinePagination = {} },
    } = this.props;
    const { invoiceHeaderId } = this.state;
    dispatch({
      type: 'invoice/queryDetailLine',
      payload: {
        type: 'update',
        invoiceHeaderId,
        page: detailLinePagination.update,
        customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
      },
    });
  }

  @Bind()
  @Throttle(1000)
  saveInvoice() {
    const {
      dispatch,
      invoice: { detailHeader = {}, detailLine = {} },
      tenantId,
      remote: remoteProps,
    } = this.props;
    const { attachmentUUID, invoiceHeaderId } = this.state;
    const sourceHeader = detailHeader.update;
    const sourceLine = detailLine.update.content;
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
    //   const filterLists = (listDataSource || [])
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
      const taxInvoiceLines = getEditTableData(listDataSource || [], ['_status'], {
        force: true,
      }).map((item) => {
        const { billingDate } = item;
        return {
          ...item,
          billingDate: billingDate ? moment(billingDate).format(DATETIME_MIN) : undefined,
          // taxIncludedAmount: taxIncludedAmounts,
          // taxAmount: Math.round(item.taxAmount * 100) / 100,
          // taxAmount: taxAmounts,
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
        taxInvoiceLines:
          isEmpty(listDataSource) || taxInvoiceLines.length !== listDataSource.length
            ? []
            : this.changeList(taxInvoiceLines),
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
                const remoteRes = remoteProps.process(
                  'SFIN_INVOICE_UPDATE_PURCHASER_DETAIL.BTNS_SAVE',
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
  @Throttle(1000)
  deleteInvoice() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId, backPath } = this.state;
    confirm({
      title: intl.get('sfin.invoiceBill.view.message.invoiceBill.isTrueDelete').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'invoice/deleteInvoice',
          payload: invoiceHeaderId,
        }).then((res) => {
          if (res) {
            history.push(backPath);
            notification.success();
          }
        });
      },
    });
  }

  @Bind()
  @Throttle(1000)
  cancelInvoice() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId, backPath } = this.state;
    const remark = this.headerForm.props.form.getFieldValue('remark');
    confirm({
      title: intl.get('sfin.invoiceBill.view.message.invoiceBill.isTrueCancel').d('是否确认取消?'),
      onOk: () => {
        dispatch({
          type: 'invoice/cancelInvoice',
          payload: { invoiceHeaderId, remark },
        }).then((res) => {
          if (res) {
            history.push(backPath);
            notification.success();
          }
        });
      },
    });
  }

  @Bind()
  @Throttle(1000)
  submitInvoice() {
    const {
      invoice: { detailHeader = {} },
    } = this.props;
    const updateHeader = detailHeader.update;
    let listDataSource;
    if (this.taxTicketTableRef) {
      listDataSource = this.taxTicketTableRef.state.listDataSource || [];
    }

    if (updateHeader.permitDirectInvoiceFlag === 1) {
      // if (updateHeader.issueStatusCode !== 'SUCCESS') {
      //   notification.warning({
      //     message: intl
      //       .get(` sfin.invoiceBill.view.message.confirmInvoicesStatus`)
      //       .d('存在未开具成功的税务发票，请确认开具成功后再提交'),
      //   });
      // } else {
      this.submitInvoiceHelp(listDataSource);
      // }
    } else {
      this.submitInvoiceHelp(listDataSource);
    }
  }

  // 提交的辅助函数
  @Bind()
  submitInvoiceHelp(listDataSource) {
    const {
      dispatch,
      history,
      tenantId,
      invoice: { detailHeader = {}, detailLine = {} },
    } = this.props;
    const { attachmentUUID, backPath, invoiceHeaderId } = this.state;
    const updateHeader = detailHeader.update;
    const sourceLine = detailLine.update.content;
    this.headerForm.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const taxInvoiceLines = getEditTableData(listDataSource || [], ['_status'], {
        force: true,
      }).map((item) => {
        const { billingDate } = item;
        return {
          ...item,
          billingDate: billingDate ? moment(billingDate).format(DATETIME_MIN) : undefined,
          // taxIncludedAmount: Math.round(item.taxIncludedAmount * 100) / 100,
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
          .get('sfin.invoiceBill.view.message.invoiceBill.isTrueSubmit')
          .d('提交会自动汇总税务发票行金额，是否提交？'),
        onOk: () => {
          const data = {
            ...updateHeader,
            ...fieldsValue,
            checkSource: 'AUDIT',
            invoiceLines,
            taxInvoiceDateIssued: fieldsValue.taxInvoiceDateIssued
              ? moment(fieldsValue.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT)
              : moment(updateHeader.taxInvoiceDateIssued).format(DEFAULT_DATETIME_FORMAT),
            attachmentUuid: updateHeader.attachmentUuid || attachmentUUID,
            taxInvoiceLines:
              isEmpty(listDataSource) || taxInvoiceLines.length !== listDataSource.length
                ? []
                : this.changeList(taxInvoiceLines),
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
                  history.push(backPath);
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

  // 直连开票
  @Bind()
  openPermitDire() {
    const {
      invoice: {
        detailHeader: { update = {} },
      },
    } = this.props;
    const { invoiceType = [] } = update;
    if (invoiceType.length > 1) {
      const { permitDireModal } = this.state;
      this.setState({ permitDireModal: !permitDireModal });
    } else if (invoiceType.length === 0) {
      notification.warning({
        message: intl
          .get(`sfin.invoiceBill.view.message.InvoiceTypeUnExist`)
          .d('发票类型不存在,请前往配置中心配置'),
      });
    } else {
      const { invoiceTypeCode } = invoiceType[0] || '';
      this.invoiceModalOk(invoiceTypeCode);
    }
  }

  /**
   * invoiceModalOk - 确认开票
   * @param {String} invoiceTypeCode
   */
  @Bind()
  invoiceModalOk(invoiceTypeCode) {
    const { dispatch } = this.props;
    const { invoiceHeaderId } = this.state;
    const isPreview = true;
    const type = 'update';
    if (invoiceTypeCode) {
      dispatch(
        routerRedux.push({
          pathname: '/sfin/invoice-update-purchaser/view',
          search: stringify({ invoiceHeaderId, invoiceTypeCode, isPreview, type }),
        })
      );
    }
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
      tenantId,
      // invoice: { infPagination },
    } = this.props;

    const { invoiceHeaderId, infPagination } = this.state;
    dispatch({
      type: 'invoice/fetchInvoicePage',
      payload: {
        organizationId: tenantId,
        invoiceHeaderId,
        page: isEmpty(params) ? infPagination : params,
        customizeUnitCode: 'SFIN.BILL_SALE_DETAIL.LEDGER_ACCOUNT',
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

  // 保存行数据
  @Bind()
  @Throttle(1000)
  handleSaveLines() {
    const {
      dispatch,
      tenantId,
      invoice: { detailLine = {} },
    } = this.props;
    const { invoiceHeaderId } = this.state;
    const lines = detailLine.update.content;
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
    const { invoiceHeaderId, setting010505 } = this.state;
    const {
      loading,
      invoice: { detailHeader = {} },
    } = this.props;
    const { businessType } = detailHeader.update || {};
    const addLinesModalProps = {
      invoiceHeaderId,
      setting010505,
      businessType,
      detailHeader,
      type: 'purchaser',
      typeStatus: 'update',
      onOk: this.handleAddLines,
      loading,
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
    const { invoiceHeaderId } = this.state;
    const {
      dispatch,
      tenantId,
      invoice: { detailHeader = {} },
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
  @Throttle(1000)
  handleDeleteLines() {
    const { invoiceHeaderId, selectedLines } = this.state;
    const { dispatch, tenantId } = this.props;
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
        this.setState({
          selectedLines: [],
          selectedLinesKeys: [],
        });
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

  // 批量修改税率相关
  @Bind()
  @Throttle(1000)
  handleUpdateTaxRate() {
    const { selectedLines = [], invoiceHeaderId } = this.state;
    const {
      dispatch,
      form,
      invoice: { detailLine = {} },
    } = this.props;
    const lines = detailLine.update.content;
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

  @Bind()
  handleSupplier(_, lovRecord) {
    const { form } = this.props;
    form.registerField('taxId');
    form.setFieldsValue({
      taxRate: lovRecord.taxRate,
      taxId: lovRecord.taxId,
    });
  }

  render() {
    const {
      form,
      dispatch,
      tenantId,
      saveLoading,
      loading,
      invoice: { detailHeader = {}, detailLine = {} },
      customizeTable,
      customizeForm,
      customizeTabPane,
      remote: remoteProps,
    } = this.props;
    const {
      recordModal,
      attachmentUUID,
      backPath,
      invoiceHeaderId,
      tabKey,
      isOpenAllowAble,
      openAccountDeduct,
      infDataSource = [],
      infPagination = {},
      settings,
      selectedLinesKeys,
      isApprovalShow = true,
      selectedLines = [],
      cancelAsyncPushFlag,
    } = this.state;
    const { permitDireModal } = this.state;
    const {
      amountPrecision,
      invoiceStatus,
      invoiceType,
      permitDirectInvoiceFlag,
      issueStatusCode,
      taxUpdFlag,
    } = detailHeader.update || {};
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
    };
    const permitDireRecordProps = {
      dispatch,
      invoiceType,
      defaultInvoiceType:
        isArray(invoiceType) && invoiceType[0] ? invoiceType[0].invoiceTypeCode : '',
      visible: permitDireModal,
      onHideModal: this.openPermitDire,
      onDirectLinkedInvoice: this.invoiceModalOk,
    };
    const type = 'update';
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
      tenantId,
      customizeTable,
      hcuzCode: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
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
      isSave: this.isSave,
      headerForm: this.headerForm,
      ChangeFormItem: this.ChangeFormItem,
      typeCode: 'purchase',
      remoteProps,
      remoteProcessCode,
      remoteOcrTitleCode,
      remoteBtnCreateCode,
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    const lines = detailLine.update.content;
    const { taxIncludePriceUpdFlag, taxAmountUpdFlag, netPriceUpdFlag } = isEmpty(lines)
      ? {}
      : lines[0];
    const saveBtnVisible = Boolean(taxIncludePriceUpdFlag || taxAmountUpdFlag || netPriceUpdFlag);

    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`${promptCode}.view.InvoiceMaintain`).d('发票维护')}
        >
          <Button type="primary" icon="save" loading={loading} onClick={this.saveInvoice}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>

          <Button icon="check" loading={loading} onClick={this.submitInvoice}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          {invoiceStatus === 'NEW' && !cancelAsyncPushFlag ? (
            <Button icon="delete" loading={loading} onClick={this.deleteInvoice}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          ) : (
            <Button icon="rollback" loading={loading} onClick={this.cancelInvoice}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          )}
          {permitDirectInvoiceFlag === 1 ? (
            <Button
              onClick={this.openPermitDire}
              icon="link-invoice"
              disabled={issueStatusCode === 'SUCCESS'}
            >
              {intl.get(`${promptCode}.view.title.directInvoice`).d('直连开票')}
            </Button>
          ) : (
            ''
          )}
          <Upload {...attachment} afterOpenUploadModal={this.afterOpenUploadModal} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {isApprovalShow && `${intl.get('hzero.common.button.approval').d('审批')}/`}

            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <DetailHeader
            type="update"
            onRef={(ref) => {
              this.headerForm = ref;
            }}
            isOpenAllowAble={isOpenAllowAble}
            openAccountDeduct={openAccountDeduct}
            ChangeFormItem={this.ChangeFormItem}
            customizeForm={customizeForm}
          />
          {customizeTabPane(
            { code: 'SFIN.INVOICE_UPDATE_DETAIL.TAB' },
            <Tabs
              onChange={this.changeTab}
              activeKey={tabKey}
              animated={false}
              className={CommonStyle['tabpane-style']}
            >
              <TabPane
                tab={intl.get(`${promptCode}.view.invoiceRow`).d('发票行')}
                key="detailTable"
                className={Styles['purchase-application']}
              >
                <Form layout="inline">
                  {saveBtnVisible && (
                    <Button type="primary" onClick={this.handleSaveLines} loading={loading}>
                      {intl.get(`hzero.common.button.save`).d('保存')}
                    </Button>
                  )}
                  <Button
                    onClick={this.handleDeleteLines}
                    disabled={selectedLines && selectedLines.length === 0}
                    loading={loading}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </Button>
                  <Button onClick={this.hanldeAddModal} loading={loading}>
                    {intl.get(`hzero.common.button.add`).d('新增')}
                  </Button>
                  {Boolean(taxUpdFlag) && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => this.handleUpdateTaxRate(true)}
                        loading={loading}
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
                  type="update"
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
                        color: tabKey === 'inf' ? '#29BECE' : '#000',
                      }}
                      overflowCount={99}
                      offset={[6, 0]}
                      showZero
                      count={infDataSource.length}
                    />
                  </span>
                }
                key="inf"
              >
                <SupplierTable {...glaProps} />
              </TabPane>
            </Tabs>
          )}
          <ActionHistory {...operationRecordProps} />
          {permitDireModal && <PermitDireModal {...permitDireRecordProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
