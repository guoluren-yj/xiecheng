/**
 * index - * 创建预收款申请页-明细页面
 * @date: 2020-03-10
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Alert } from 'choerodon-ui';
import { isEmpty, omit, isArray, isUndefined, isNumber } from 'lodash';
import moment from 'moment';
import querystring from 'querystring';
import uuid from 'uuid/v4';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Bind, Throttle } from 'lodash-decorators';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import {
  getCurrentOrganizationId,
  createPagination,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
  filterNullValueObject,
  getCurrentUserId,
  addItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import Upload from 'components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';

import AdvHeader from './AdvHeader';
import ItemInfo from './ItemInfo'; // 订单模态框
import AgreementInfo from './AgreementInfo'; // 协议模态框
import GlaTable from './GlaTable';
import Agreement from './Agreement';
import TheOrder from './TheOrder';

import styles from './index.less';

const { Panel } = Collapse;

const common = 'sfin.advanceReceivePayment.model.common.';

@formatterCollections({
  code: ['sfin.payment', 'sfin.advanceReceivePayment', 'entity.attachment'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, advanceReceivePayment }) => ({
  advanceReceivePayment,
  loading,
  searchLoading: loading.effects['advanceReceivePayment/handleSearchHeader'],
  listLoading: loading.effects['advanceReceivePayment/fetchInvoiceLine'],
  modalLoading: loading.effects['advanceReceivePayment/fetchModalList'],
  saveLoading: loading.effects['advanceReceivePayment/saveList'],
  subLoading: loading.effects['advanceReceivePayment/handleSubmit'],
  delLoading: loading.effects['advanceReceivePayment/deleteHeader'],
  sdelLoading: loading.effects['advanceReceivePayment/deleteList'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { paymentHeaderId } = querystring.parse(search.substr(1));

    this.state = {
      collapseKeys: ['paymentList', 'paymentHeaderInfo'], // 打开的折叠面板key
      visible: false,
      orderVisible: false,
      paymentHeaderId,
      modalDataSource: [],
      modalPagination: {},
      headerInfo: {},
      InvoiceLineSource: [],
      InvoicePagination: {},
      selectedRows: [],
    };
    this.headerRef = React.createRef();
  }

  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    const { paymentHeaderId } = this.state;
    dispatch({
      type: 'advanceReceivePayment/fetchSupplierLov',
      payload: {
        tenantId,
        userId: getCurrentUserId(),
      },
    });
    if (paymentHeaderId && isNumber(+paymentHeaderId)) {
      dispatch({
        type: 'advanceReceivePayment/handleSearchHeader',
        payload: {
          tenantId,
          paymentHeaderId,
          customizeUnitCode: 'SFIN.RECEIVE_PREPAYMENT_DETAIL.HEADER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: res,
          });
          this.fetchInvoiceLine();
        }
      });
    }
  }

  /**
   * 查询头信息
   */
  @Bind()
  handleSearchHeader() {
    const { dispatch, tenantId } = this.props;
    const { paymentHeaderId } = this.state;
    dispatch({
      type: 'advanceReceivePayment/handleSearchHeader',
      payload: {
        tenantId,
        paymentHeaderId,
        customizeUnitCode: 'SFIN.RECEIVE_PREPAYMENT_DETAIL.HEADER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
        });
      }
    });
  }

  /**
   * 查询行信息
   */
  @Bind()
  fetchInvoiceLine(page = {}) {
    const { dispatch } = this.props;
    const { paymentHeaderId, headerInfo } = this.state;
    const { paymentSourceTypeCode } = headerInfo || {};
    const customizeUnitCode = ['CONTRACT'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_CONTRACT'
      : ['ORDER'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER'
      : ['SUPPLIER'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_SUPPLIER'
      : 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER';
    dispatch({
      type: 'advanceReceivePayment/fetchInvoiceLine',
      payload: { paymentHeaderId, page, customizeUnitCode },
    }).then((res) => {
      if (res) {
        this.setState({
          InvoiceLineSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          InvoicePagination: createPagination(res),
        });
      }
    });
  }

  // 保存
  /**
   * 保存数据
   */
  @Bind()
  @Throttle(1000)
  handleSave() {
    const {
      dispatch,
      form,
      advanceReceivePayment: { supplierLovList = [] },
    } = this.props;
    const { bankId, backFirm } = supplierLovList[0] || {};
    const otherFields = supplierLovList.length === 1 ? { bankId, backFirm } : {};
    const { InvoiceLineSource, headerInfo } = this.state;
    const newDataSource = InvoiceLineSource.filter((item) => item.edited);
    const lines = getEditTableData(newDataSource, ['_status', 'edited', 'advanceLineId']);
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          const paymentAdvanceLineList = lines.map((n) => ({
            ...n,
            // paymentDate: n.paymentDate && moment(lines.paymentDate).format('YYYY-MM-DD 00:00:00'),
          }));
          const headerInfoTest = {
            ...headerInfo,
            ...values,
            ...otherFields,
            paymentDate:
              values.paymentDate && moment(values.paymentDate).format('YYYY-MM-DD 00:00:00'),
          };
          dispatch({
            type: 'advanceReceivePayment/saveList',
            payload: { ...headerInfoTest, paymentAdvanceLineList, camp: 'SUPPLIER' },
          }).then((res) => {
            if (res) {
              this.setState({
                paymentHeaderId: res.paymentHeaderId,
              });
              notification.success();
              this.handleSearchHeader();
              this.fetchInvoiceLine();
            }
          });
        }
      }
    });
  }

  // 提交
  /**
   * 提交数据
   */
  @Bind()
  @Throttle(1000)
  handleSubmit() {
    const { dispatch, form, history } = this.props;
    const { InvoiceLineSource, headerInfo } = this.state;
    // const newDataSource = InvoiceLineSource.filter(item => item.edited);
    const lines = getEditTableData(InvoiceLineSource, ['_status', 'edited', 'advanceLineId']);
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        if (lines.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          const paymentAdvanceLineList = lines.map((n) => ({
            ...n,
            // paymentDate: n.paymentDate && moment(lines.paymentDate).format('YYYY-MM-DD 00:00:00'),
          }));
          const headerInfoTest = {
            ...headerInfo,
            ...values,
            paymentDate:
              values.paymentDate && moment(values.paymentDate).format('YYYY-MM-DD 00:00:00'),
          };
          const dataList = { ...headerInfoTest, paymentAdvanceLineList };
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交？'),
            onOk: () => {
              dispatch({
                type: 'advanceReceivePayment/validateSubmit',
                payload: dataList,
              }).then((r) => {
                if (r) {
                  if (r.validatedCode === 'SUCCESS') {
                    dispatch({
                      type: 'advanceReceivePayment/handleSubmit',
                      payload: dataList,
                    }).then((res) => {
                      if (res) {
                        notification.success();
                        history.push({ pathname: '/sfin/advance-receive-payment/list' });
                      }
                    });
                  }
                  if (r.validatedCode === 'WIATING_CONFIRM') {
                    const { msg } = r;
                    Modal.confirm({
                      content: intl
                        .get(`sfin.payment.view.message.verifyError`, { msg })
                        .d(`校验资金计划失败,${msg},您是否继续提交？`),
                      onOk: () => {
                        dispatch({
                          type: 'advanceReceivePayment/handleSubmit',
                          payload: dataList,
                        }).then((res) => {
                          if (res) {
                            notification.success();
                            history.push({ pathname: '/sfin/advance-receive-payment/list' });
                          }
                        });
                      },
                      onCancel: () => {
                        this.handleSearchHeader();
                        this.fetchInvoiceLine();
                        // this.fetchLine();
                      },
                    });
                  }
                }
              });
            },
            onCancel: () => {
              this.handleSearchHeader();
              this.fetchInvoiceLine();
              // this.fetchLine();
            },
          });
        }
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, history } = this.props;
    const { paymentHeaderId, headerInfo, InvoiceLineSource } = this.state;
    const delList = { paymentHeaderId, ...headerInfo, InvoiceLineSource };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'advanceReceivePayment/deleteHeader',
          payload: delList,
        }).then((res) => {
          if (res) {
            notification.success();
            history.push({ pathname: `/sfin/advance-receive-payment/list` });
          }
        });
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  // 选择的数据
  @Bind()
  onSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 新建列表-协议
   * @param {String} pcTemplateId
   */
  @Bind()
  project() {
    this.setState({ visible: true });
  }

  /**
   * 新建列表-订单
   * @param {String} pcTemplateId
   */
  @Bind()
  orderProject() {
    this.setState({ orderVisible: true });
  }

  /**
   * closeItemInfoModal - 关闭弹窗-协议
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * closeItemInfoModal - 关闭弹窗-订单
   */
  @Bind()
  orderCloseItemInfoModal() {
    this.setState({
      orderVisible: false,
    });
  }

  /**
   * fetchModalList - 查询模态框数据
   */
  @Bind()
  fetchModalList(page = {}) {
    const { dispatch } = this.props;
    const headerIdList = [];
    const { InvoiceLineSource = [], paymentHeaderId } = this.state;
    const PaymentAdvanceLineVO = isUndefined(this.itemInfo.search)
      ? {}
      : filterNullValueObject(this.itemInfo.search.getFieldsValue());
    InvoiceLineSource.forEach((item) => {
      if (item.referenceDataId) {
        headerIdList.push(item.referenceDataId);
      }
    });
    dispatch({
      type: 'advanceReceivePayment/fetchModalList',
      payload: {
        paymentHeaderId,
        headerIdList,
        page,
        ...PaymentAdvanceLineVO,
        creationDateStart:
          PaymentAdvanceLineVO.creationDateStart &&
          PaymentAdvanceLineVO.creationDateStart.format('YYYY-MM-DD 00:00:00'),
        creationDateEnd:
          PaymentAdvanceLineVO.creationDateEnd &&
          PaymentAdvanceLineVO.creationDateEnd.format('YYYY-MM-DD 23:59:59'),
        publishDateStart:
          PaymentAdvanceLineVO.publishDateStart &&
          PaymentAdvanceLineVO.publishDateStart.format('YYYY-MM-DD 00:00:00'),
        publishDateEnd:
          PaymentAdvanceLineVO.publishDateEnd &&
          PaymentAdvanceLineVO.publishDateEnd.format('YYYY-MM-DD 23:59:59'),
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

  // 确定添加行数据
  @Bind()
  onItemInfoModalOk() {
    const { InvoiceLineSource = [], InvoicePagination = {}, headerInfo = {} } = this.state;
    const { selectedListRows: modalList } = this.itemInfo.state;
    const newDataSource = modalList.map((item) => {
      return {
        ...item,
        referenceDataCode: headerInfo.paymentSourceTypeCode,
        referenceDataId: item.headerId,
        referenceDataLineId:
          headerInfo.paymentSourceTypeCode === 'PO_LINE' ? item.poLineId : item.lineId,
        _status: 'create',
        edited: true,
      };
    });
    this.setState({
      InvoiceLineSource: [...newDataSource, ...InvoiceLineSource],
      InvoicePagination: addItemsToPagination(
        this.itemInfo.state.selectedListRows.length,
        InvoiceLineSource.length,
        InvoicePagination
      ),
    });
    if (headerInfo.paymentSourceTypeCode === 'CONTRACT') {
      this.closeItemInfoModal();
    } else {
      this.orderCloseItemInfoModal();
    }
  }

  /**
   * deleteModalList - 删除发票行数据
   */
  @Bind()
  deleteModalList() {
    const { dispatch } = this.props;
    const {
      InvoiceLineSource = [],
      InvoicePagination = {},
      selectedRows,
      paymentHeaderId,
      headerInfo = {},
    } = this.state;
    const newDataSource = [];
    const oldDataSource = [];
    const selectedRowKeys = selectedRows.map((n) =>
      headerInfo.paymentSourceTypeCode === 'PO_LINE' ? n.referenceDataLineId : n.referenceDataId
    );
    InvoiceLineSource.forEach((item) => {
      if (
        !selectedRowKeys.includes(
          headerInfo.paymentSourceTypeCode === 'PO_LINE'
            ? item.referenceDataLineId
            : item.referenceDataId
        )
      ) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        oldDataSource.push(omit(item, ['$form']));
      }
    });
    if (!isEmpty(oldDataSource)) {
      dispatch({
        type: 'advanceReceivePayment/deleteList',
        payload: {
          paymentHeaderId,
          body: oldDataSource,
        },
      }).then((res) => {
        if (res) {
          this.setState({ selectedRows: [] });
          notification.success();
          this.fetchInvoiceLine();
        }
      });
    } else {
      this.setState({
        InvoiceLineSource: newDataSource,
        selectedRows: [],
      });
      this.setState({
        InvoicePagination: delItemsToPagination(
          selectedRows.length,
          InvoiceLineSource.length,
          InvoicePagination
        ),
      });
    }
  }

  // 修改行paymentAmount
  @Bind()
  handleInput(text, values, record) {
    const { InvoiceLineSource, headerInfo } = this.state;

    const oldList = InvoiceLineSource.findIndex((e) =>
      headerInfo.paymentSourceTypeCode === 'PO_LINE'
        ? e.referenceDataLineId === record.referenceDataLineId
        : e.referenceDataId === record.referenceDataId
    );
    const newDataSource = {
      ...record,
      edited: true,
      paymentAdvanceAmount: text,
    };
    if (oldList > -1) {
      InvoiceLineSource[oldList] = newDataSource;
    }
    const num = newDataSource.paymentAmount || 0;
    if (text > num) {
      notification.warning({
        message: intl
          .get(`sfin.common.view.message.returnWrite`)
          .d('收款金额超过剩余可收金额,请重新填写'),
      });
    } else {
      this.setState({
        InvoiceLineSource,
      });
    }
  }

  // 添加头paymentTypeId
  @Bind()
  handerChange(record) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        paymentTypeId: record.typeId,
      },
    });
  }

  // 添加头paymentTypeId
  @Bind()
  bankHanderChange(val, record) {
    const { headerInfo } = this.state;
    const {
      form: { setFieldsValue },
    } = this.props;
    if (record) {
      setFieldsValue({
        bankId: record.bankId,
        bankName: record.bankName,
        bankBranchName: record.bankBranchName,
        bankAccountName: record.bankAccountName,
        bankAccountNum: record.bankAccountNum,
        bankFirm: record.bankFirm,
      });
      this.setState({
        headerInfo: {
          ...headerInfo,
          bankId: record.bankId,
          bankName: record.bankName,
          bankBranchName: record.bankBranchName,
          bankAccountName: record.bankAccountName,
          bankAccountNum: record.bankAccountNum,
          bankFirm: record.bankFirm,
        },
      });
    }
  }

  @Bind()
  companyChange(val, record) {
    const { headerInfo } = this.state;
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      typeName: record.typeName || null,
      currencyCode: record.currencyCode || 'CNY',
      currencyName: record.currencyName || intl.get(`hzero.common.currency.cny`).d('人民币'),
      ouId: null,
    });
    this.setState({
      headerInfo: {
        ...headerInfo,
        typeName: record.typeName || null,
        companyId: record.companyId,
        currencyCode: record.currencyCode || 'CNY',
        currencyName: record.currencyName || intl.get(`hzero.common.currency.cny`).d('人民币'),
      },
    });
  }

  @Bind()
  supplierChange(val, record) {
    const { headerInfo } = this.state;
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      bankName: record.bankName,
      bankBranchName: record.bankBranchName,
      bankAccountName: record.bankAccountName,
      bankId: record.bankId,
      bankAccountNum: record.bankAccountNum,
      bankFirm: record.bankFirm,
      supplierId: record.supplierId,
      supplierName: record.supplierName,
      supplierCompanyId: record.companyId,
    });
    this.setState({
      headerInfo: {
        ...headerInfo,
        supplierId: record.supplierId,
        supplierName: record.supplierName,
        supplierCompanyId: record.companyId,
        supplierCompanyName: record.companyName,
        bankId: record.bankId,
        bankAccountNum: record.bankAccountNum,
        bankFirm: record.bankFirm,
      },
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { headerInfo = {} } = this.state;
    if (!headerInfo.attachmentUuid) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      headerInfo: { paymentHeaderId },
    } = this.state;
    dispatch({
      type: 'advanceReceivePayment/bindHeaderAttachmentUuid',
      payload: {
        paymentHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.handleSearchHeader();
      }
    });
  }

  /**
   * 新建列表-来源商城
   * @param {String} supplierDeductionsId
   */
  @Bind()
  newProject() {
    const { InvoiceLineSource = [], InvoicePagination = {} } = this.state;

    const newDataSource = {
      edited: true,
      _status: 'create',
      advanceLineId: uuid(),
    };
    this.setState({
      InvoiceLineSource: [newDataSource, ...InvoiceLineSource],
      InvoicePagination: addItemToPagination(InvoiceLineSource.length, InvoicePagination),
    });
  }

  render() {
    const {
      form,
      tenantId,
      delLoading = false,
      searchLoading = false,
      listLoading = false,
      modalLoading = false,
      saveLoading = false,
      subLoading = false,
      sdelLoading = false,
      advanceReceivePayment: { supplierLovList },
    } = this.props;
    const {
      collapseKeys,
      visible,
      orderVisible,
      paymentHeaderId,
      modalDataSource = [],
      modalPagination = {},
      headerInfo = {},
      InvoiceLineSource = [],
      InvoicePagination = {},
      selectedRows = [],
    } = this.state;
    const selectedRowKeys = selectedRows.map((n) => n.advancePaymentLineId);
    const headerProps = {
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
      form,
      tenantId,
      supplierLovList,
      dataSource: headerInfo,
      handleInput: this.handleInput,
      handerChange: this.handerChange,
      companyChange: this.companyChange,
      supplierChange: this.supplierChange,
      bankHanderChange: this.bankHanderChange,
    };
    const invioceProps = {
      headerInfo,
      selectedRows,
      loading: listLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      onSearch: this.fetchInvoiceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const agreementProps = {
      selectedRows,
      loading: listLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchInvoiceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const theorderProps = {
      selectedRows,
      loading: listLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchInvoiceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };

    const theorderLineProps = {
      selectedRows,
      loading: listLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchInvoiceLine,
      onSelectedRowChange: this.onSelectedRowChange,
      isOrderLine: 1,
    };

    const orderModalProps = {
      orderVisible,
      modalling: modalLoading,
      modalDataSource,
      modalPagination,
      width: 900,
      onRef: (node) => {
        this.itemInfo = node;
      },
      // selectedModalRows,
      fetchDetailList: this.fetchModalList,
      isOrderLine: headerInfo.paymentSourceTypeCode === 'PO_LINE' ? 1 : 0,
      // modalRowSelectedChange: this.handleRowSelectedChange,
    };

    const agreeModalProps = {
      visible,
      modalling: modalLoading,
      modalDataSource,
      modalPagination,
      width: 900,
      onRef: (node) => {
        this.itemInfo = node;
      },
      // selectedModalRows,
      fetchDetailList: this.fetchModalList,
      // modalRowSelectedChange: this.handleRowSelectedChange,
    };

    const uploadProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
      },
      showFilesNumber: false,
      attachmentUUID: headerInfo.attachmentUuid ? headerInfo.attachmentUuid : '',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-acceptance',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    return (
      <Fragment>
        <Header
          backPath="/sfin/advance-receive-payment/list"
          title={intl
            .get('sfin.advanceReceivePayment.view.message.addReceivedPayment')
            .d('预收款申请创建')}
        >
          <Button
            // disabled={saveVisible}
            type="primary"
            icon="save"
            loading={delLoading || searchLoading || saveLoading || subLoading}
            onClick={this.handleSave}
          >
            {intl.get(`hzero.common.btn.save`).d('保存')}
          </Button>
          <Button
            disabled={!paymentHeaderId}
            icon="check"
            loading={delLoading || searchLoading || saveLoading || subLoading}
            onClick={this.handleSubmit}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button
            icon="delete"
            loading={delLoading || searchLoading || saveLoading || subLoading}
            disabled={!paymentHeaderId}
            onClick={this.handleDelete}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          {paymentHeaderId && <Upload {...uploadProps} />}
        </Header>
        <Content>
          <Spin
            spinning={searchLoading}
            wrapperClassName={classnames(styles['panel-list-wrapper'], DETAIL_DEFAULT_CLASSNAME)}
          >
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${common}receivedPaymentHeader`).d('预收款头信息')}</h3>
                    <a>
                      {collapseKeys.includes('paymentHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('paymentHeaderInfo') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="paymentHeaderInfo"
              >
                <Alert
                  message={intl
                    .get(`sfin.advanceReceivePayment.view.title.prompt`)
                    .d(
                      '❗当前收款银行账户默认展示供应商已启用的主账号银行信息，若不符合本次业务场景，可点击【银行账号】字段，重新选择银行信息'
                    )}
                  type="info"
                  closable
                  showIcon
                  className={styles['prompt-alert']}
                />
                <AdvHeader {...headerProps} />
              </Panel>
              {paymentHeaderId && (
                <Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>{intl.get(`${common}receivedPaymentList`).d('预收款行信息')}</h3>
                      <a>
                        {collapseKeys.includes('paymentList')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('paymentList') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="paymentList"
                >
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                      style={{ marginRight: 8 }}
                      loading={sdelLoading}
                      icon="delete"
                      onClick={this.deleteModalList}
                      disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                    >
                      {intl.get(`hzero.common.button.delete`).d('删除')}
                    </Button>
                    {headerInfo.paymentSourceTypeCode === 'SUPPLIER' ? (
                      <Button icon="plus" type="primary" onClick={this.newProject}>
                        {intl.get(`hzero.common.button.create`).d('新建')}
                      </Button>
                    ) : (
                      <Button
                        icon="plus"
                        type="primary"
                        onClick={
                          headerInfo.paymentSourceTypeCode === 'CONTRACT'
                            ? this.project
                            : this.orderProject
                        }
                      >
                        {intl.get(`hzero.common.button.create`).d('新建')}
                      </Button>
                    )}
                  </div>
                  {headerInfo.paymentSourceTypeCode === 'SUPPLIER' && (
                    <GlaTable {...invioceProps} />
                  )}
                  {headerInfo.paymentSourceTypeCode === 'CONTRACT' && (
                    <Agreement {...agreementProps} />
                  )}
                  {headerInfo.paymentSourceTypeCode === 'ORDER' && <TheOrder {...theorderProps} />}
                  {headerInfo.paymentSourceTypeCode === 'PO_LINE' && (
                    <TheOrder {...theorderLineProps} />
                  )}
                </Panel>
              )}
            </Collapse>
          </Spin>
          <Modal
            title={intl.get(`${common}addreceivedPaymentLine`).d('新增收款行')}
            destroyOnClose
            width={1000}
            visible={headerInfo.paymentSourceTypeCode === 'CONTRACT' ? visible : orderVisible}
            onCancel={
              headerInfo.paymentSourceTypeCode === 'CONTRACT'
                ? this.closeItemInfoModal
                : this.orderCloseItemInfoModal
            }
            footer={
              <Button
                type="primary"
                // loading={validating}
                onClick={this.onItemInfoModalOk}
              >
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            }
          >
            {orderVisible && <ItemInfo {...orderModalProps} />}
            {visible && <AgreementInfo {...agreeModalProps} />}
          </Modal>
        </Content>
      </Fragment>
    );
  }
}
