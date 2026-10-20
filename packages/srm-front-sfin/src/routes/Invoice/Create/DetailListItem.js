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
import { isEmpty, isArray, uniqBy } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import remote from 'hzero-front/lib/utils/remote';
// import { stringify } from 'querystring';

import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId, getEditTableData, createPagination } from 'utils/utils';
// import { routerRedux } from 'dva/router';
import Lov from 'components/Lov';
import DynamicButtons from '_components/DynamicButtons';
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

const { TabPane } = Tabs;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';
const titlePrompt = 'sfin.invoiceBill.view.title';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO';

const remoteCodeMap = {
  BTNS: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX.BTNS',
  BTN_SAVE: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX.BTNS_SAVE',
  PROCESS: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX.VALIDATE',
  OCR_TITLE: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX.OCR_TITLE',
  BTN_TICKET_CREATE: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX.CREATE_SHOW_FLAG',
};

@remote({
  code: 'SFIN.INVOICE_CREATE_DETAIL_LIST_CUX',
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
  saveAllLinesLoading: loading.effects['invoice/saveAllLines'],
  confirmeInvoiceLoading: loading.effects['invoice/confirmeInvoice'],
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
    'SFIN.INVOICE_CREATE_DETAIL.BTNS',
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
      // defaultActiveKey,
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
      history.push(`/sfin/invoice-create/list`);
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
  @Throttle(1000)
  saveInvoice() {
    const {
      dispatch,
      invoice: { detailHeader = {}, detailLine = {} },
      invoiceHeaderId,
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
  @Throttle(1000)
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
      invoiceHeaderId,
      // invoice: { infPagination },
    } = this.props;

    const { infPagination } = this.state;
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
  @Throttle(1000)
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
            checkSource: 'RECEIVABLES',
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
  @Throttle(1000)
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
    const {
      dispatch,
      invoice: { detailLine = {} },
      invoiceHeaderId,
    } = this.props;
    const { tenantId } = this.state;
    // const isPreview = true;
    // const type = 'create';
    // 直连开票前保存行数据
    const sourceLine = detailLine.create.content;
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
    this.closeInvoiceModel();

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
        // dispatch(
        //   routerRedux.push({
        //     pathname: '/sfin/invoice-create/view',
        //     search: stringify({ invoiceHeaderId, invoiceTypeCode, isPreview, type }),
        //   })
        // );
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
      type: 'supplier',
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

  @Bind()
  handleUpdateTaxRate() {
    // TODO:
    const { selectedLines = [] } = this.state;
    const {
      dispatch,
      form,
      invoice: { detailLine = {} },
      invoiceHeaderId,
    } = this.props;
    const lines = detailLine.create.content;
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
    const lines = detailLine.create.content;
    const pagination = detailLinePagination.create;
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
                      i.netAmount +
                        this.numberFixed(math.div(math.multipliedBy(i.netAmount, taxRate), 100), 2),
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
            type: 'create',
            lines: {
              ...detailLine.create,
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
                      math.minus(
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
            type: 'create',
            lines: {
              ...detailLine.create,
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
    const lines = detailLine.create.content;
    const pagination = detailLinePagination.create;
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
            type: 'create',
            lines: {
              ...detailLine.create,
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
            type: 'create',
            lines: {
              ...detailLine.create,
              content: uniqBy([...data, ...lines], 'invoiceLineId'),
            },
            pagination,
          },
        });
      }
    }
  }

  @Bind()
  handleSupplier(_, lovRecord) {
    const { form } = this.props;
    // const { setFieldsValue, registerField } = form;
    form.registerField('taxId');
    form.setFieldsValue({
      taxRate: lovRecord.taxRate,
      taxId: lovRecord.taxId,
    });
  }

  @Bind()
  getBtns() {
    const type = 'create';
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
    const { permitDirectInvoiceFlag, issueStatusCode } = detailHeader.update || {};

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
      !cancelAsyncPushFlag && {
        name: 'delete',
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          icon: 'delete',
          loading: isLoading,
          onClick: this.deleteInvoice,
          disabled: issueStatusCode === 'SUCCESS',
        },
      },
      cancelAsyncPushFlag && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'rollback',
          loading: isLoading,
          onClick: this.cancelInvoice,
          disabled: issueStatusCode === 'SUCCESS',
        },
      },
      permitDirectInvoiceFlag === 1 && {
        name: 'directInvoice',
        child: intl.get(`${titlePrompt}.directInvoice`).d('直连开票'),
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
      recordModal,
      invoiceModal,
      // invoiceHeaderId,
      tabKey,
      tenantId,
      invoiceType,
      infDataSource = [],
      infPagination = {},
      settings,
      selectedLinesKeys,
      selectedLines,
    } = this.state;
    const {
      form,
      dispatch,
      saveLoading,
      queryLineLoading,
      saveLineLoading,
      addLinesLoading,
      deleteLinesLoading,
      invoice: { detailLine = {} },
      invoice: {
        detailHeader: { create = {} },
      },
      customizeTable,
      customizeForm,
      customizeTabPane,
      customizeBtnGroup,
      invoiceHeaderId,
      defaultActiveKey,
      invoiceNum,
      remote: remoteProps,
    } = this.props;
    const { permitDirectInvoiceFlag, taxUpdFlag, amountPrecision } = create;

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

    const taxTicketTableProps = {
      amountPrecision,
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
      remoteProcessCode: remoteCodeMap.PROCESS,
      remoteOcrTitleCode: remoteCodeMap.OCR_TITLE,
      remoteBtnCreateCode: remoteCodeMap.BTN_TICKET_CREATE,
    };
    const DetailTables = {
      // onRef: (ref) => {
      //   this.taxTicketTableRef = ref;
      // },
      invoiceNum,
      defaultActiveKey,
      invoiceHeaderId,
    };
    const DetailHeaderList = {
      // onRef: (ref) => {
      //   this.taxTicketTableRef = ref;
      // },
      invoiceNum,
      defaultActiveKey,
      invoiceHeaderId,
    };
    const glaProps = {
      // tenantId,
      type: 'create',
      dataSource: infDataSource,
      pagination: infPagination,
      permitDirectInvoiceFlag,
      onTableChange: this.handleSearchInf,
    };
    const lines = detailLine.create.content;
    const { taxIncludePriceUpdFlag, taxAmountUpdFlag, netPriceUpdFlag } = isEmpty(lines)
      ? {}
      : lines[0];
    const saveBtnVisible = Boolean(taxIncludePriceUpdFlag || taxAmountUpdFlag || netPriceUpdFlag);

    return (
      <React.Fragment>
        <Header
          backPath="/sfin/invoice-create/list"
          title={intl.get(`${promptCode}.view.InvoiceMaintain`).d('发票维护')}
        >
          {customizeBtnGroup(
            { code: 'SFIN.INVOICE_CREATE_DETAIL.BTNS', pro: true },
            <DynamicButtons buttons={this.getBtns()} />
          )}
        </Header>
        <Content>
          <DetailHeader
            {...DetailHeaderList}
            type="create"
            onRef={(ref) => {
              this.headerForm = ref;
            }}
            customizeForm={customizeForm}
            ChangeFormItem={this.ChangeFormItem}
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
                    disabled={selectedLines && selectedLines.length === 0}
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
                              // lovOptions={{
                              //   valueField: 'taxRate',
                              //   displayField: 'taxRate',
                              // }}
                              // onChange={(value, lovRecord) =>
                              //   form.setFieldsValue({ taxId: lovRecord.taxId })
                              // }
                              onChange={(val, lovRecord) => this.handleSupplier(val, lovRecord)}
                              onOk={(lovRecord) => {
                                form.setFieldsValue({ taxRate: lovRecord.taxRate });
                              }}
                            />
                          )}
                        </Form.Item>
                        <Form.Item>{form.getFieldDecorator(`taxId`)}</Form.Item>
                      </Form>
                    </>
                  )}
                </Form>
                <DetailTable
                  {...DetailTables}
                  type="create"
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
