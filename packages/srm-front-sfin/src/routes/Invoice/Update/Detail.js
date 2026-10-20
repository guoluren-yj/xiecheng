/**
 * Detail.js - 发票维护删除状态
 * @date: 2020-10-23
 * @author: liujiwei <jiwei.liu01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Modal, Badge, Form } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray, uniqBy, isUndefined, omit } from 'lodash';
import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  filterNullValueObject,
} from 'utils/utils';
import Lov from 'components/Lov';
import { Button as PermissionButton } from 'components/Permission';
import qs from 'querystring';
import remote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { getInvoiceConfigTable } from '@/services/invoiceService';

import { getEditTableAllData } from '@/utils/utils';
import Change from '../../components/ChangeFormItem';
import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import TaxTicketTable from '../Components/TaxTicketTable';
import AddLinesModal from '../Components/AddLinesModal';
import PermitDireModal from './PermitDireModal';
import SupplierTable from '../../components/SupplierTable';
import ItemInfo from './ItemInfo';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { confirm } = Modal;
const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO';

const remoteCodeMap = {
  BTNS: 'SFIN_INVOICE_UPDATE_DETAIL.BTNS',
  BTN_SAVE: 'SFIN_INVOICE_UPDATE_DETAIL.BTNS_SAVE',
  PROCESS: 'SFIN_INVOICE_UPDATE_DETAIL_VALIDATE',
  OCR_TITLE: 'SFIN_INVOICE_UPDATE_DETAIL_CUX.OCR_TITLE',
  BTN_TICKET_CREATE: 'SFIN_INVOICE_UPDATE_DETAIL_CUX.CREATE_SHOW_FLAG',
};

@remote({
  code: 'SFIN_INVOICE_UPDATE_DETAIL',
  name: 'remote',
})
@connect(({ loading, invoice, bill }) => ({
  invoice,
  bill,
  headerLoading: loading.effects['invoice/queryDetailHeader'],
  lineLoading: loading.effects['invoice/queryDetailLine'],
  saveLoading: loading.effects['invoice/saveInvoice'],
  submitLoading: loading.effects['invoice/submitInvoice'],
  deleteLoading: loading.effects['invoice/deleteInvoice'],
  cancelLoading: loading.effects['invoice/cancelInvoice'],
  validatorLoading: loading.effects['invoice/checkValidator'],
  queryLineLoading: loading.effects['invoice/queryDetailLine'],
  saveLineLoading: loading.effects['invoice/saveLines'],
  addLinesLoading: loading.effects['invoice/addLines'],
  deleteLinesLoading: loading.effects['invoice/deleteLines'],
  saveAllLinesLoading: loading.effects['invoice/saveAllLines'],
  confirmeInvoiceLoading: loading.effects['invoice/confirmeInvoice'],
  modalling: loading.effects['invoice/fetchModalList'],
  invoiceSave: loading.effects['invoice/fetchInvoiceSave'],
  deteleinvoiceSave: loading.effects['invoice/deteleinvoiceSave'],

  // organizationId: getCurrentOrganizationId(),
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'sodr.quotePurchase'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  // unitCode: [`${hcuzCode},SFIN.INVOICE_UPDATE_DETAIL.TAB`],
  unitCode: [
    'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
    'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO',
    'SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
    'SFIN.INVOICE_UPDATE_DETAIL.TAB',
    'SFIN.INVOICE_UPDATE_DETAIL.BTNS',
  ],
})
export default class UpdateDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { invoiceHeaderId, supplierType },
      },
      history: {
        location: { search = {} },
      },
    } = props;
    this.headerForm = {};
    let backPath;
    if (supplierType === 'supplier') {
      backPath = `/sfin/invoice-supplier/list`;
    } else {
      backPath = `/sfin/invoice-update/list`;
    }
    const routerParams = qs.parse(search.substr(1));
    this.state = {
      invoiceHeaderId,
      recordModal: false,
      attachmentUUID: null,
      backPath,
      tabKey: routerParams.activeTab ? routerParams.activeTab : 'detailTable',
      isOpenAllowAble: false,
      openAccountDeduct: false,
      permitDireModal: false, // 直连开票模态框
      infDataSource: [],
      infPagination: {},
      settings: '0',
      setting010505: '',
      selectedLinesKeys: [],
      selectedLines: [],
      visible: false,
      modalDataSource: [],
      modalPagination: {},
      selectedModalRows: [],
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

    this.headerForm.props.form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const taxInvoiceLines = (await getEditTableAllData(listDataSource)).map((record) => {
        const { billingDate } = record;
        return {
          ...record,
          billingDate: billingDate ? moment(billingDate).format(DATETIME_MIN) : undefined,
          // taxIncludedAmount: taxIncludedAmounts,
          // taxAmount: Math.round(item.taxAmount * 100) / 100,
          // taxAmount: taxAmounts,
          tenantId,
          invoiceHeaderId,
        };
      });
      if (isArray(listDataSource) && taxInvoiceLines.length !== listDataSource.length) return;
      // const infDataLines = getEditTableData(infDataSource);
      // if (isArray(infDataSource) && infDataSource.length > 0) {
      //   if (isArray(infDataLines) && infDataLines.length === 0) {
      //     notification.warning({
      //       message: intl
      //         .get(`sfin.invoiceBill.view.message.confirmGeneralAccountCheckData`)
      //         .d('请先检查总账科目中的数据'),
      //     });
      //     return;
      //   }
      //   if (isArray(infDataLines) && infDataLines.length !== infDataSource.length) {
      //     notification.warning({
      //       message: intl
      //         .get(`sfin.invoiceBill.view.message.confirmGeneralAccountHasData`)
      //         .d('总账科目中有必填选项'),
      //     });
      //     return;
      //   }
      // }
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
        // deductionRelations: infDataLines,
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
                const remoteRes = remoteProps.process(remoteCodeMap.BTN_SAVE, true);
                if (remoteRes) notification.success();
                this.headerForm.fetchDetail();
                this.handleQueryLine();
                this.handleSearchInf();
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
            this.handleSearchInf();
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

    if (updateHeader.permitDirectInvoiceFlag === 1) {
      if (updateHeader.issueStatusCode !== 'SUCCESS') {
        notification.warning({
          message: intl
            .get(`sfin.invoiceBill.view.message.confirmInvoicesStatus`)
            .d('存在未开具成功的税务发票，请确认开具成功后再提交'),
        });
      } else {
        this.submitInvoiceHelp(listDataSource);
      }
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
    this.headerForm.props.form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const taxInvoiceLines = (await getEditTableAllData(listDataSource)).map((item) => {
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
            checkSource: 'RECEIVABLES',
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
  @Throttle(1000)
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
    const {
      dispatch,
      tenantId,
      invoice: { detailLine = {} },
    } = this.props;
    const { invoiceHeaderId } = this.state;
    // 直连开票前保存行数据
    const sourceLine = detailLine.update.content;
    const invoiceLines = getEditTableData(sourceLine, ['_status']);
    if (isArray(sourceLine) && sourceLine.length !== invoiceLines.length) {
      notification.warning({
        message: intl
          .get(`sfin.invoiceBill.view.message.confirmInvoiceLinesCheckData`)
          .d('发票行中有必填数据'),
      });
      return;
    }

    // const infDataLines = getEditTableData(infDataSource);
    // if (isArray(infDataSource) && infDataSource.length > 0) {
    //   if (isArray(infDataLines) && infDataLines.length === 0) {
    //     notification.warning({
    //       message: intl
    //         .get(`sfin.invoiceBill.view.message.confirmGeneralAccountCheckData`)
    //         .d('请先检查总账科目中的数据'),
    //     });
    //     return;
    //   }
    //   if (isArray(infDataLines) && infDataLines.length !== infDataSource.length) {
    //     notification.warning({
    //       message: intl
    //         .get(`sfin.invoiceBill.view.message.confirmGeneralAccountHasData`)
    //         .d('总账科目中有必填选项'),
    //     });
    //     return;
    //   }
    // }

    const body = {
      invoiceLines,
      // deductionRelations: infDataLines,
    };
    dispatch({
      type: 'invoice/saveAllLines',
      payload: {
        body,
        tenantId,
        invoiceHeaderId,
      },
    }).then((res) => {
      if (res) {
        // if (invoiceTypeCode) {
        //   dispatch(
        //     routerRedux.push({
        //       pathname: '/sfin/invoice-update/view',
        //       search: stringify({ invoiceHeaderId, invoiceTypeCode, isPreview, type }),
        //     })
        //   );
        // }
        // this.closeInvoiceModel();
        dispatch({
          type: 'invoice/confirmeInvoice',
          payload: {
            invoiceHeaderId,
            invoiceTypeCode,
          },
        }).then((res1) => {
          if (res1) {
            this.handleQueryLine();
            this.headerForm.fetchDetail();
            notification.success();
          }
        });
      }
    });
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
      addLinesLoading,
      invoice: { detailHeader = {} },
    } = this.props;
    const { businessType } = detailHeader.update || {};
    const addLinesModalProps = {
      invoiceHeaderId,
      setting010505,
      businessType,
      detailHeader,
      type: 'supplier',
      typeStatus: 'update',
      onOk: this.handleAddLines,
      loading: addLinesLoading,
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
  handleDeleteLines() {
    const { invoiceHeaderId, selectedLines } = this.state;
    const {
      dispatch,
      tenantId,
      invoice: { detailHeader = {} },
    } = this.props;
    const { businessType } = detailHeader.update || {};
    dispatch({
      type: 'invoice/deleteLines',
      payload: {
        tenantId,
        invoiceHeaderId,
        businessType,
        body: selectedLines.map(({ rowKey, ...other }) => other),
        // page: isEmpty(params) ? infPagination : params,
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
        // this.setState({
        //   infPagination: createPagination(res),
        // });
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
  handleUpdateTaxRate() {
    // TODO:
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
    const data = [];
    body.forEach((i) => {
      selectedLines.forEach((j) => {
        if (i.invoiceLineId === j.invoiceLineId) {
          data.push({
            ...i,
            taxRate: form.getFieldValue('taxRate'),
            taxId: form.getFieldValue('taxId'),
          });
        }
      });
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
            type: 'update',
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

  /**
   * lov改变时，获取待到当前的税率，判断当前是否存在勾选行，存在时，才进行金额的联动
   */
  @Bind()
  handleTaxLovChange(taxRate) {
    const { selectedLines = [] } = this.state;
    const {
      dispatch,
      invoice: { detailLine = {}, detailLinePagination = {} },
    } = this.props;
    const lines = detailLine.update.content;
    const pagination = detailLinePagination.update;
    const body = getEditTableData(lines);
    if (isEmpty(body) && !isEmpty(lines)) {
      return;
    }
    const data = [];
    if (selectedLines && selectedLines.length > 0) {
      const ratePlus = math.plus(1, taxRate);
      const rateDivPlus = math.plus(1, math.div(taxRate, 100));
      if (selectedLines[0].basePrice === 'NET_PRICE') {
        // 更新含税单价  含税单价 = 不含税单价 * （1+税率）保留十位小数
        // 更新税额  税额 = round(不含税金额 * 税率， 2)
        // 含税金额  含税金额 = 不含税金额+税额
        body.forEach((i, index) => {
          selectedLines.forEach((j) => {
            const pushData =
              selectedLines[0].priceUpdFlag === 1
                ? {
                    ...i,
                    taxRate,
                    taxIncludedPrice: this.numberFixed(
                      math.multipliedBy(i.netPrice, rateDivPlus),
                      2
                    ),
                    // taxAmount: Math.round(i.netAmount * taxRate / 100, 2),
                    taxIncludedAmount: this.numberFixed(
                      math.plus(
                        i.netAmount,
                        this.numberFixed(math.div(math.multipliedBy(i.netAmount, taxRate), 100), 2)
                      ),
                      2
                    ),
                  }
                : {
                    ...i,
                    taxRate,
                    taxIncludedPrice: this.numberFixed(
                      math.multipliedBy(i.netPrice, rateDivPlus),
                      10
                    ),
                  };
            if (i.invoiceLineId === j.invoiceLineId) {
              data.push(pushData);
            }
            if (selectedLines[0].priceUpdFlag === 1) {
              // 更新不含税单价、不含税金额
              // FIXME: 需要单独给表单赋值，不能通过状态树更新
              lines[index].$form.setFieldsValue({
                taxAmount: this.numberFixed(
                  math.div(math.multipliedBy(i.netAmount, taxRate), 100),
                  2
                ),
              });
            }
          });
        });
        dispatch({
          type: 'invoice/updateDetailLine',
          payload: {
            type: 'update',
            lines: {
              ...detailLine.update,
              content: uniqBy([...data, ...lines], 'invoiceLineId'),
            },
            pagination,
          },
        });
      }
      if (selectedLines[0].basePrice === 'TAX_INCLUDE_PRICE') {
        // 更新税额、不含税金额、不含税单价
        // 更新税额  税额 = round(含税金额 / （1 + 税率）* 税率， 2)
        // 不含税单价  不含税单价 = 含税金额 / （1 + 税率）
        // 不含税金额  不含税金额 = 含税金额 - 税额
        body.forEach((i, index) => {
          selectedLines.forEach((j) => {
            const pushData =
              selectedLines[0].priceUpdFlag === 1
                ? {
                    ...i,
                    taxRate,
                    netPrice: this.numberFixed(
                      math.div(math.div(i.taxIncludedPrice, ratePlus), 100),
                      10
                    ),
                    taxIncludedPrice: this.numberFixed(
                      math.multipliedBy(i.netPrice, rateDivPlus),
                      10
                    ),
                    // taxAmount: Math.round(i.taxIncludedAmount / (1 + taxRate) * taxRate / 100, 2),
                    netAmount: this.numberFixed(
                      math.div(
                        i.taxIncludedAmount,
                        this.numberFixed(
                          math.div(
                            math.multipliedBy(math.div(i.taxIncludedAmount, ratePlus), taxRate),
                            100
                          ),
                          2
                        )
                      ),
                      2
                    ),
                  }
                : {
                    ...i,
                    taxRate,
                    taxIncludedPrice: this.numberFixed(
                      math.multipliedBy(i.netPrice, rateDivPlus),
                      10
                    ),
                  };
            if (i.invoiceLineId === j.invoiceLineId) {
              data.push(pushData);
            }
            if (selectedLines[0].priceUpdFlag === 1) {
              // 更新税额
              lines[index].$form.setFieldsValue({
                taxAmount: this.numberFixed(
                  math.div(
                    math.multipliedBy(math.div(i.taxIncludedAmount, ratePlus), taxRate),
                    100
                  ),
                  2
                ),
              });
            }
          });
        });
        dispatch({
          type: 'invoice/updateDetailLine',
          payload: {
            type: 'update',
            lines: {
              ...detailLine.update,
              content: uniqBy([...data, ...lines], 'invoiceLineId'),
            },
            pagination,
          },
        });
      }
    }
  }

  @Bind()
  numberFixed(exp, per) {
    const num = Number(per) || 0;
    return math.toFixed(exp, num);
  }

  @Bind()
  handleLineSelect(record, selected, selectedRows) {
    if (selected) {
      this.handleLineSelectCallback(selectedRows);
    }
  }

  @Bind()
  handleLineSelectAll(selected, selectedRows) {
    if (selected) {
      this.handleLineSelectCallback(selectedRows);
    }
  }

  @Bind()
  handleLineSelectCallback(selectedRows) {
    const {
      dispatch,
      form,
      invoice: { detailLine = {}, detailLinePagination = {} },
    } = this.props;
    const taxRate = form.getFieldValue('taxRate');
    const lines = detailLine.update.content;
    const pagination = detailLinePagination.update;
    const body = getEditTableData(lines);
    if (isEmpty(body) && !isEmpty(lines)) {
      return;
    }
    const data = [];
    if (taxRate !== undefined) {
      const ratePlus = math.plus(1, taxRate);
      const rateDivPlus = math.plus(1, math.div(taxRate, 100));
      if (selectedRows[0].basePrice === 'NET_PRICE') {
        // 更新含税单价  含税单价 = 不含税单价 * （1+税率）保留十位小数
        // 更新税额  税额 = round(不含税金额 * 税率， 2)
        // 含税金额  含税金额 = 不含税金额+税额
        body.forEach((i, index) => {
          selectedRows.forEach((j) => {
            const pushData =
              selectedRows[0].priceUpdFlag === 1
                ? {
                    ...i,
                    taxRate,
                    taxIncludedPrice: math.multipliedBy(i.netPrice, rateDivPlus),
                    // taxAmount: Math.round(i.netAmount * taxRate / 100, 2),
                    taxIncludedAmount: math.plus(
                      i.netAmount,
                      this.numberFixed(math.div(math.multipliedBy(i.netAmount, taxRate), 100), 2)
                    ),
                  }
                : {
                    ...i,
                    taxRate,
                    taxIncludedPrice: math.multipliedBy(i.netPrice, rateDivPlus),
                  };
            if (i.invoiceLineId === j.invoiceLineId) {
              data.push(pushData);
            }
            if (selectedRows[0].priceUpdFlag === 1) {
              // 更新不含税单价、不含税金额
              // FIXME: 需要单独给表单赋值，不能通过状态树更新
              lines[index].$form.setFieldsValue({
                taxAmount: this.numberFixed(
                  math.div(math.multipliedBy(i.netAmount, taxRate), 100),
                  2
                ),
              });
            }
          });
        });
        dispatch({
          type: 'invoice/updateDetailLine',
          payload: {
            type: 'update',
            lines: {
              ...detailLine.update,
              content: uniqBy([...data, ...lines], 'invoiceLineId'),
            },
            pagination,
          },
        });
      }
      if (selectedRows[0].basePrice === 'TAX_INCLUDE_PRICE') {
        // 更新税额、不含税金额、不含税单价
        // 更新税额  税额 = round(含税金额 / （1 + 税率）* 税率， 2)
        // 不含税单价  不含税单价 = 含税金额 / （1 + 税率）
        // 不含税金额  不含税金额 = 含税金额 - 税额
        body.forEach((i, index) => {
          selectedRows.forEach((j) => {
            const pushData =
              selectedRows[0].priceUpdFlag === 1
                ? {
                    ...i,
                    taxRate,
                    netPrice: math.div(math.div(i.taxIncludedPrice, ratePlus), 100),
                    taxIncludedPrice: math.multipliedBy(i.netPrice, rateDivPlus),
                    // taxAmount: Math.round(i.taxIncludedAmount / (1 + taxRate) * taxRate / 100, 2),
                    netAmount: math.minus(
                      i.taxIncludedAmount,
                      this.numberFixed(
                        math.div(
                          math.multipliedBy(math.div(i.taxIncludedAmount, ratePlus), taxRate),
                          100
                        ),
                        2
                      )
                    ),
                  }
                : {
                    ...i,
                    taxRate,
                    taxIncludedPrice: math.multipliedBy(i.netPrice, rateDivPlus),
                  };
            if (i.invoiceLineId === j.invoiceLineId) {
              data.push(pushData);
            }
            if (selectedRows[0].priceUpdFlag === 1) {
              // 更新税额
              lines[index].$form.setFieldsValue({
                taxAmount: this.numberFixed(
                  math.div(
                    math.multipliedBy(math.div(i.taxIncludedAmount, ratePlus), taxRate),
                    100
                  ),
                  2
                ),
              });
            }
          });
        });
        dispatch({
          type: 'invoice/updateDetailLine',
          payload: {
            type: 'update',
            lines: {
              ...detailLine.update,
              content: uniqBy([...data, ...lines], 'invoiceLineId'),
            },
            pagination,
          },
        });
      }
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} selectedListRows
   * @param {Object} selectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedModalRows: selectedRows });
  }

  @Bind()
  project() {
    this.setState({ visible: true });
  }

  /**
   * fetchModalList - 查询模态框数据
   */
  @Bind()
  fetchModalList(page = {}) {
    const {
      dispatch,
      tenantId,
      invoice: { detailHeader = {} },
    } = this.props;
    const {
      supplierCompanyId,
      erpSupplierFlag,
      ouId,
      companyId,
      currencyCode,
      invoiceHeaderId,
      supplierId,
    } = detailHeader?.update;
    const modalList = [];
    const { infDataSource = [] } = this.state;
    const filedValues = isUndefined(this.itemInfo.search)
      ? {}
      : filterNullValueObject(this.itemInfo.search.getFieldsValue());
    infDataSource.forEach((item) => {
      if (item.supplierDeductionsId) {
        modalList.push(item.supplierDeductionsId);
      }
    });
    //  infPagination
    dispatch({
      type: 'invoice/fetchModalList',
      payload: {
        page,
        erpSupplierFlag,
        supplierCompanyId,
        organizationId: tenantId,
        ticketDeductionFlag: 1,
        ouId,
        companyId,
        currencyCode,
        notInDeductionIds: modalList,
        customizeUnitCode: 'SFIN.INVOICE_CREATE_LIST.TOTAL_ADD_LIST',
        invoiceHeaderId,
        supplierId,
        ...filedValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modalDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          modalPagination: createPagination(res),
        });
      }
    });
  }

  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
  }

  @Bind()
  onItemInfoModalOk() {
    const { selectedListRows: modalList } = this.itemInfo.state;
    const { invoiceHeaderId } = this.state;
    const { dispatch, tenantId } = this.props;
    const newDataSource = modalList.map((item) => {
      return {
        ...item,
        _status: 'create',
      };
    });
    if (isEmpty(newDataSource)) {
      return;
    }

    dispatch({
      type: 'invoice/fetchInvoiceSave',
      payload: {
        organizationId: tenantId,
        invoiceHeaderId,
        supLineList: newDataSource,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchInf();
        this.headerForm.fetchDetail();
      }
    });
    this.closeItemInfoModal();
  }

  /**
   * deleteModalList - 删除总账科目数据
   */
  @Bind()
  deleteModalList() {
    const { dispatch, tenantId } = this.props;
    const { infDataSource, infPagination, selectedModalRows, invoiceHeaderId } = this.state;
    const newDataSource = [];
    const oldDataSource = [];
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    infDataSource.forEach((item) => {
      if (!selectedRowKeys.includes(item.supplierDeductionsId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        oldDataSource.push(omit(item, ['$form']));
      }
    });
    if (!isEmpty(oldDataSource)) {
      dispatch({
        type: 'invoice/deteleinvoiceSave',
        payload: {
          invoiceHeaderId,
          organizationId: tenantId,
          body: oldDataSource,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchInf(infPagination);
          this.headerForm.fetchDetail();
        }
      });
    }
  }

  @Bind()
  getBtns() {
    const type = 'update';
    const {
      tenantId,
      invoice: { detailHeader = {} },
      headerLoading,
      saveLoading,
      submitLoading,
      deleteLoading,
      cancelLoading,
      validatorLoading,
      queryLineLoading,
      saveAllLinesLoading,
      confirmeInvoiceLoading,
      remote: remoteProps,
    } = this.props;
    const { attachmentUUID, isApprovalShow = true, cancelAsyncPushFlag } = this.state;
    const { invoiceStatus, permitDirectInvoiceFlag, issueStatusCode } = detailHeader.update || {};

    let uuid;
    if (attachmentUUID === null) {
      const headerInfo = detailHeader[type] || {};
      uuid = headerInfo.attachmentUuid;
    } else {
      uuid = attachmentUUID;
    }

    const isLoading =
      headerLoading ||
      saveLoading ||
      validatorLoading ||
      submitLoading ||
      deleteLoading ||
      cancelLoading ||
      saveAllLinesLoading ||
      confirmeInvoiceLoading ||
      queryLineLoading;

    const approveTitle = isApprovalShow
      ? `${intl.get('hzero.common.button.approval').d('审批')}/`
      : '';

    const btns = [
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'primary',
          icon: 'save',
          loading: isLoading,
          onClick: this.saveInvoice,
        },
      },
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          loading: isLoading,
          onClick: this.submitInvoice,
        },
      },
      invoiceStatus === 'NEW' && !cancelAsyncPushFlag
        ? {
            name: 'delete',
            child: intl.get('hzero.common.button.delete').d('删除'),
            btnProps: {
              icon: 'delete',
              loading: isLoading,
              onClick: this.deleteInvoice,
              disabled: issueStatusCode === 'SUCCESS',
            },
          }
        : {
            name: 'cancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              icon: 'rollback',
              loading: isLoading,
              onClick: this.cancelInvoice,
            },
          },
      permitDirectInvoiceFlag === 1 && {
        name: 'directInvoice',
        child: intl.get(`${promptCode}.view.title.directInvoice`).d('直连开票'),
        btnProps: {
          icon: 'link-invoice',
          loading: isLoading,
          onClick: this.openPermitDire,
          disabled: issueStatusCode === 'SUCCESS',
        },
      },
      {
        name: 'upload',
        btnComp: Upload,
        // child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          btnProps: {
            icon: 'upload',
            loading: isLoading,
          },
          tenantId,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sfin-file-bucket',
          attachmentUUID: uuid,
          afterOpenUploadModal: this.afterOpenUploadModal,
        },
      },
      {
        name: 'operation',
        child: approveTitle + intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          onClick: this.openOperationRecord,
        },
      },
    ].filter((item) => item);
    const otherProps = {
      headerForm: this.headerForm,
      fetchDetail: this.headerForm?.fetchDetail,
      handleQueryLine: this.handleQueryLine,
      handleSearchInf: this.handleSearchInf,
      detailHeader: detailHeader[type],
      loading: isLoading,
      taxTicketTableSearch: this.taxTicketTableRef?.handleSearch,
    };
    const allBtns = remoteProps ? remoteProps.process(remoteCodeMap.BTNS, btns, otherProps) : btns;
    return allBtns;
  }

  render() {
    const {
      dispatch,
      tenantId,
      saveLoading,
      queryLineLoading,
      saveLineLoading,
      addLinesLoading,
      deleteLinesLoading,
      invoice: { detailHeader = {}, detailLine = {} },
      customizeTable,
      customizeForm,
      customizeTabPane,
      customizeBtnGroup,
      form,
      modalling,
      invoiceSave,
      deteleinvoiceSave,
      remote: remoteProps,
    } = this.props;

    const {
      recordModal,
      backPath,
      invoiceHeaderId,
      tabKey,
      isOpenAllowAble,
      openAccountDeduct,
      infDataSource = [],
      infPagination = {},
      settings,
      selectedLinesKeys,
      selectedLines = [],
      visible,
      modalDataSource = [],
      modalPagination = {},
      selectedModalRows,
    } = this.state;
    const { permitDireModal } = this.state;
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    const { invoiceType, permitDirectInvoiceFlag, taxUpdFlag, amountPrecision } =
      detailHeader.update || {};

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

    const taxTicketTableProps = {
      amountPrecision,
      infDataSource,
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
      typeCode: 'supply',
      remoteProps,
      remoteProcessCode: remoteCodeMap.PROCESS,
      remoteOcrTitleCode: remoteCodeMap.OCR_TITLE,
      remoteBtnCreateCode: remoteCodeMap.BTN_TICKET_CREATE,
    };

    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      permitDirectInvoiceFlag,
      onTableChange: this.handleSearchInf,
      type: 'update',
      selectedModalRows,
      modalRowSelectedChange: this.handleRowSelectedChange,
    };
    const lines = detailLine.update.content;
    const { taxIncludePriceUpdFlag, taxAmountUpdFlag, netPriceUpdFlag } = isEmpty(lines)
      ? {}
      : lines[0];
    const itemInfoProps = {
      visible,
      modalling,
      onRef: (node) => {
        this.itemInfo = node;
      },
      modalDataSource,
      modalPagination,
      width: 900,
      fetchDetailList: this.fetchModalList,
    };
    const saveBtnVisible = Boolean(taxIncludePriceUpdFlag || taxAmountUpdFlag || netPriceUpdFlag);
    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`${promptCode}.view.InvoiceMaintain`).d('发票维护')}
        >
          {customizeBtnGroup(
            { code: 'SFIN.INVOICE_UPDATE_DETAIL.BTNS', pro: true },
            <DynamicButtons buttons={this.getBtns()} />
          )}
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
                    onClick={this.hanldeAddModal}
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
                              lovOptions={{
                                valueField: 'taxRate',
                                displayField: 'taxRate',
                              }}
                              onChange={(value, lovRecord) =>
                                form.setFieldsValue({ taxId: lovRecord.taxId })
                              }
                            />
                          )}
                        </Form.Item>
                        <Form.Item>{form.getFieldDecorator(`taxId`)}</Form.Item>
                      </Form>
                    </>
                  )}
                </Form>
                <DetailTable
                  type="update"
                  permitDirectInvoiceFlag={permitDirectInvoiceFlag}
                  rowSelection={{
                    selectedRowKeys: selectedLinesKeys,
                    onChange: this.lineSelectionChange,
                    // onSelect: this.handleLineSelect,
                    // onSelectAll: this.handleLineSelectAll,
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
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <PermissionButton
                    style={{ marginRight: 8 }}
                    loading={deteleinvoiceSave}
                    icon="delete"
                    onClick={this.deleteModalList}
                    disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                    permissionList={[
                      {
                        code: `srm.finance.ar-invoice.modify.ps.button.delete`,
                        type: 'button',
                      },
                    ]}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </PermissionButton>
                  <PermissionButton
                    icon="plus"
                    type="primary"
                    onClick={this.project}
                    permissionList={[
                      {
                        code: `srm.finance.ar-invoice.modify.ps.button.create`,
                        type: 'button',
                      },
                    ]}
                  >
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </PermissionButton>
                </div>
                <SupplierTable {...glaProps} />
              </TabPane>
            </Tabs>
          )}
          <ActionHistory {...operationRecordProps} />
          {permitDireModal && <PermitDireModal {...permitDireRecordProps} />}
        </Content>
        <Modal
          title={intl.get(`sodr.quotePurchase.view.message.addEductionBanks`).d('新增扣款行')}
          destroyOnClose
          width={900}
          visible={visible}
          onCancel={this.closeItemInfoModal}
          footer={
            <Button type="primary" loading={invoiceSave} onClick={this.onItemInfoModalOk}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <ItemInfo {...itemInfoProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
