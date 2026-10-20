/**
 * index -创建一般付款申请-明细页面
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Alert } from 'choerodon-ui';
import { Button, Spin, Collapse, Icon, Form, Tabs, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, omit, isArray, isUndefined } from 'lodash';
import moment from 'moment';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import { Bind, Throttle } from 'lodash-decorators';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import {
  getCurrentOrganizationId,
  createPagination,
  addItemsToPagination,
  delItemsToPagination,
  filterNullValueObject,
  getEditTableData,
} from 'utils/utils';
import notification from 'utils/notification';
import Upload from '_components/Upload';
import uuid from 'uuid/v4';

import PaymentHeader from './PaymentHeader';
import GlaTable from './GlaTable';
import DocRelate from './DocRelate';
import ItemInfo from './ItemInfo';
import styles from './index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;

const titlePrompt = 'sfin.common';
@Form.create({ fieldNameProp: null })
@connect(({ loading, createPaymentRequest }) => ({
  createPaymentRequest,
  loading,
  searchLoading: loading.effects['createPaymentRequest/handleSearchHeader'],
  listLoading: loading.effects['createPaymentRequest/fetchInvoiceLine'],
  modalLoading: loading.effects['createPaymentRequest/fetchModalList'],
  saveLoading: loading.effects['createPaymentRequest/saveList'],
  subLoading: loading.effects['createPaymentRequest/handleSubmit'],
  delLoading: loading.effects['createPaymentRequest/deleteHeader'],
  sdelLoading: loading.effects['createPaymentRequest/deleteList'],
  fetLoading: loading.effects['createPaymentRequest/fetchLine'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.invoiceBill',
    'sfin.common',
    'entity.company',
    'entity.supplier',
    'sprm.payment',
    'sfin.supplierChargeEntry',
    'entity.attachment',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { paymentHeaderId },
      },
    } = props;
    this.state = {
      collapseKeys: ['paymentHeaderInfo'], // 打开的折叠面板key
      visible: false,
      paymentHeaderId,
      modalDataSource: [],
      modalPagination: {},
      headerInfo: { key: 'any' },
      InvoiceLineSource: [],
      InvoicePagination: {},
      selectedRows: [],
      lineSource: [],
      linePagination: {},
      // saveVisible: false,
    };
    this.headerRef = React.createRef();
  }

  componentDidMount() {
    this.handleSearchHeader();
    this.fetchInvoiceLine();
    this.fetchLine();
  }

  /**
   * 查询头信息
   */
  @Bind()
  handleSearchHeader() {
    const { dispatch, tenantId } = this.props;
    const { paymentHeaderId } = this.state;
    dispatch({
      type: 'createPaymentRequest/handleSearchHeader',
      payload: {
        tenantId,
        paymentHeaderId,
        customizeUnitCode: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
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
    const { paymentHeaderId } = this.state;
    const flag = this.checkHasSelected();
    if (flag && Object.keys(page).length > 0) {
      // 付款行如果存在新建的且点击分页时，不能查询，避免出现分页错误
      return;
    }
    dispatch({
      type: 'createPaymentRequest/fetchInvoiceLine',
      payload: {
        paymentHeaderId,
        page,
        customizeUnitCode: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          InvoiceLineSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          InvoicePagination: createPagination(res),
        });
      }
    });
  }

  // 关联单据查询
  @Bind()
  fetchLine(page = {}) {
    const { dispatch } = this.props;
    const { paymentHeaderId } = this.state;
    dispatch({
      type: 'createPaymentRequest/fetchLine',
      payload: { paymentHeaderId, page },
    }).then((res) => {
      if (res) {
        this.setState({
          lineSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          linePagination: createPagination(res),
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
    const { dispatch, form } = this.props;
    const { InvoiceLineSource, headerInfo } = this.state;
    const data = getEditTableData(InvoiceLineSource);
    const errsArray = [];
    InvoiceLineSource.forEach((item) => {
      const { $form } = item;
      if ($form?.validateFieldsAndScroll) {
        $form.validateFieldsAndScroll((errs) => {
          if (errs) {
            errsArray.push(errs);
          }
        });
      }
    });
    if (Array.isArray(data) && data.length !== 0) {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs && isEmpty(errsArray)) {
          const headerList = {
            ...headerInfo,
            ...values,
            paymentDate:
              values.paymentDate && moment(values.paymentDate).format('YYYY-MM-DD 00:00:00'),
          };
          const dataList = {
            ...headerList,
            paymentLineList: data.map((item) =>
              item._status === 'create' ? { ...item, paymentLineId: null } : item
            ),
            customizeUnitCode:
              'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
          };
          dispatch({
            type: 'createPaymentRequest/saveList',
            payload: dataList,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearchHeader();
              this.fetchInvoiceLine();
              this.fetchLine();
            }
          });
        }
      });
    }
    // form.validateFieldsAndScroll((errs, values) => {
    //   debugger;
    //   if (!errs && isEmpty(errsArray)) {
    //     const headerList = {
    //       ...headerInfo,
    //       ...values,
    //       paymentDate:
    //         values.paymentDate && moment(values.paymentDate).format('YYYY-MM-DD 00:00:00'),
    //     };
    //     const dataList = {
    //       ...headerList,
    //       paymentLineList: InvoiceLineSource.map((item) =>
    //         item._status === 'create' ? { ...item, paymentLineId: null } : item
    //       ),
    //       customizeUnitCode: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE',
    //     };
    //     dispatch({
    //       type: 'createPaymentRequest/saveList',
    //       payload: dataList,
    //     }).then((res) => {
    //       if (res) {
    //         notification.success();
    //         this.handleSearchHeader();
    //         this.fetchInvoiceLine();
    //         this.fetchLine();
    //       }
    //     });
    //   }
    // });
  }

  /**
   * 提交
   */
  @Bind()
  @Throttle(1000)
  handleSubmit() {
    const { dispatch, form, history } = this.props;
    const { InvoiceLineSource, headerInfo } = this.state;
    const lines = getEditTableData(InvoiceLineSource, ['_status', 'edited', 'advanceLineId']);
    const noLineId = InvoiceLineSource.some((item) => item._status === 'create');
    if (noLineId) {
      notification.error({
        message: `${intl.get('hzero.common.notification.first.save.data').d('请先点击保存数据')}`,
      });
      return;
    }
    const errsArray = [];
    InvoiceLineSource.forEach((item) => {
      const { $form } = item;
      if ($form?.validateFieldsAndScroll) {
        $form.validateFieldsAndScroll((errs) => {
          if (errs) {
            errsArray.push(errs);
          }
        });
      }
    });
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs && isEmpty(errsArray)) {
        const headerList = {
          ...headerInfo,
          ...values,
          paymentDate:
            values.paymentDate && moment(values.paymentDate).format('YYYY-MM-DD 00:00:00'),
        };
        const paymentLineList = lines.map((n) => ({
          ...n,
          paymentDate: n.paymentDate && moment(lines.paymentDate).format('YYYY-MM-DD 00:00:00'),
          // paymentLineId: null,
        }));

        const dataList = {
          ...headerList,
          paymentLineList,
          customizeUnitCode:
            'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
          // paymentLineList: InvoiceLineSource.map((item) =>
          //   item._status === 'create' ? { ...item, paymentLineId: null } : { ...item }
          // ),
        };
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交？'),
          onOk: () => {
            dispatch({
              type: 'createPaymentRequest/hasValidateSubmit',
              payload: {
                ...dataList,
                customizeUnitCode:
                  'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
              },
            }).then((r) => {
              if (r) {
                if (r.validatedCode === 'SUCCESS') {
                  dispatch({
                    type: 'createPaymentRequest/handleSubmit',
                    payload: {
                      ...dataList,
                      customizeUnitCode:
                        'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
                    },
                  }).then((res) => {
                    if (res) {
                      notification.success();
                      history.push({ pathname: '/sfin/create-payment-request/list' });
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
                        type: 'createPaymentRequest/handleSubmit',
                        payload: {
                          ...dataList,
                          customizeUnitCode:
                            'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
                        },
                      }).then((res) => {
                        if (res) {
                          notification.success();
                          history.push({ pathname: '/sfin/create-payment-request/list' });
                        }
                      });
                    },
                    onCancel: () => {
                      this.handleSearchHeader();
                      this.fetchInvoiceLine();
                    },
                  });
                }
              }
            });
          },
          onCancel: () => {
            this.handleSearchHeader();
            this.fetchInvoiceLine();
            this.fetchLine();
          },
        });
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
          type: 'createPaymentRequest/deleteHeader',
          payload: delList,
        }).then((res) => {
          if (res) {
            notification.success();
            history.push({ pathname: `/sfin/create-payment-request/list` });
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
   * 新建列表
   * @param {String} pcTemplateId
   */
  @Bind()
  project() {
    this.setState({ visible: true });
  }

  /**
   * closeItemInfoModal - 关闭弹窗
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * fetchModalList - 查询模态框数据
   */
  @Bind()
  fetchModalList(page = {}) {
    const { dispatch } = this.props;
    const modalList = [];
    const invoiceHeaderIds = [];
    const { InvoiceLineSource = [], paymentHeaderId } = this.state;
    const filedValues = isUndefined(this.itemInfo.search)
      ? {}
      : filterNullValueObject(this.itemInfo.search.getFieldsValue());

    InvoiceLineSource.forEach((item) => {
      invoiceHeaderIds.push(item.invoiceHeaderIds);
      if (item.paymentLineId && item._status !== 'create') {
        modalList.push(item.paymentLineId);
      }
    });
    dispatch({
      type: 'createPaymentRequest/fetchModalList',
      payload: {
        paymentHeaderId,
        paymentLineIds: modalList,
        invoiceHeaderIds,
        page,
        ...filedValues,
        taxInvoiceDateIssuedFrom:
          filedValues.taxInvoiceDateIssuedFrom &&
          filedValues.taxInvoiceDateIssuedFrom.format('YYYY-MM-DD 00:00:00'),
        taxInvoiceDateIssuedTo:
          filedValues.taxInvoiceDateIssuedTo &&
          filedValues.taxInvoiceDateIssuedTo.format('YYYY-MM-DD 23:59:59'),
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
    const { InvoiceLineSource = [], InvoicePagination = {} } = this.state;
    const { selectedListRows: modalList } = this.itemInfo.state;
    const newDataSource = modalList.map((item) => {
      return {
        ...item,
        paymentLineId: uuid(),
        paymentAmount: item.laveAmount,
        invoiceHeaderIds: item.invoiceHeaderId,
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

    this.closeItemInfoModal();
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
    } = this.state;
    const newDataSource = [];
    const oldDataSource = [];
    const selectedRowKeys = selectedRows.map((n) => n.paymentLineId);
    InvoiceLineSource.forEach((item) => {
      if (!selectedRowKeys.includes(item.paymentLineId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        oldDataSource.push(omit(item, ['$form']));
      }
    });
    if (!isEmpty(oldDataSource)) {
      dispatch({
        type: 'createPaymentRequest/deleteList',
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

  // 添加头paymentTypeId
  // @Bind()
  // handerChange(record) {
  //   const { headerInfo } = this.state;
  //   this.setState({
  //     headerInfo: {
  //       ...headerInfo,
  //       paymentTypeId: record.typeId,
  //     },
  //   });
  // }

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

  // 修改行paymentAmount
  // @Bind()
  // handleInput (text, values, record) {
  //   const { InvoiceLineSource } = this.state;

  //   const oldList = InvoiceLineSource.findIndex((e) => e.paymentLineId === record.paymentLineId);
  //   const newDataSource = {
  //     ...record,
  //     paymentAmount: text,
  //   };
  //   if (oldList > -1) {
  //     InvoiceLineSource[oldList] = newDataSource;
  //   }
  //   const num = newDataSource.laveAmount || 0;
  //   if (Number(text) > Number(num)) {
  //     notification.warning({
  //       message: intl.get(`sfin.common.view.message.num`).d('付款金额超过剩余可付金额,请重新填写'),
  //     });
  //   } else {
  //     this.setState({
  //       InvoiceLineSource,
  //     });
  //   }
  // }

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
      type: 'createPaymentRequest/bindHeaderAttachmentUuid',
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
   * 跳转至预付款核销详情页
   * @param {Object} record 行数据
   */
  @Bind()
  handleToDetail(record) {
    const {
      dispatch,
      match: {
        params: { paymentHeaderId },
      },
    } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/create-payment-request/cancelAfterVerification/${paymentHeaderId}/${record.paymentLineId}`,
      })
    );
  }

  // 检查付款行是否有新增的数据
  @Bind()
  checkHasSelected() {
    const { InvoiceLineSource } = this.state;
    return InvoiceLineSource.some((item) => item._status === 'create');
  }

  render() {
    const {
      form,
      tenantId,
      searchLoading,
      listLoading,
      modalLoading,
      saveLoading,
      subLoading,
      sdelLoading,
      fetLoading,
    } = this.props;
    const {
      collapseKeys,
      visible,
      modalDataSource = [],
      modalPagination = {},
      headerInfo = {},
      InvoiceLineSource = [],
      InvoicePagination = {},
      selectedRows = [],
      // saveVisible,
      lineSource = [],
      linePagination = {},
    } = this.state;
    // console.log('头:', headerInfo);
    const selectedRowKeys = selectedRows.map((n) => n.paymentLineId);
    const headerProps = {
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
      form,
      tenantId,
      dataSource: headerInfo,
      // handerChange: this.handerChange,
      bankHanderChange: this.bankHanderChange,
    };
    const flag = this.checkHasSelected();
    const invioceProps = {
      selectedRows,
      loading: listLoading,
      dataSource: InvoiceLineSource,
      pagination: { ...InvoicePagination, showSizeChanger: !flag },
      onSearch: this.fetchInvoiceLine,
      handleInput: this.handleInput,
      onToDetail: this.handleToDetail,
      onSelectedRowChange: this.onSelectedRowChange,
      className: flag ? 'sfin-pagination' : '',
    };
    const modalProps = {
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

    const lineProps = {
      loading: fetLoading,
      dataSource: lineSource,
      pagination: linePagination,
      onTableChange: this.fetchLine,
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
          backPath="/sfin/create-payment-request/list"
          title={intl
            .get('sfin.invoiceBill.view.message.paymentrequestdetails')
            .d('到票付款申请明细')}
        >
          <Button
            // disabled={saveVisible}
            type="primary"
            icon="save"
            loading={saveLoading || subLoading || listLoading || searchLoading}
            onClick={this.handleSave}
          >
            {intl.get(`hzero.common.btn.save`).d('保存')}
          </Button>
          <Button
            // disabled={saveVisible}
            icon="check"
            loading={saveLoading || subLoading || listLoading || searchLoading}
            onClick={this.handleSubmit}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button icon="delete" onClick={this.handleDelete} loading={listLoading || searchLoading}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Upload {...uploadProps} />
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
                    <h3>{intl.get(`${titlePrompt}.paymentHeaderInfo`).d('付款头信息')}</h3>
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
                    .get(`sfin.payment.view.title.prompt`)
                    .d(
                      '❗当前收款银行账户默认展示供应商已启用的主账号银行信息，若不符合本次业务场景，可点击【银行账号】字段，重新选择银行信息'
                    )}
                  type="info"
                  closable
                  showIcon
                  className={styles['prompt-alert']}
                />
                <PaymentHeader {...headerProps} />
              </Panel>
            </Collapse>
          </Spin>
          <Tabs animated={false}>
            <TabPane tab={intl.get(`sfin.payment.view.detailLine`).d('付款行')} key="detail">
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
                <Button icon="plus" type="primary" onClick={this.project}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
              </div>
              <GlaTable {...invioceProps} />
            </TabPane>
            <TabPane tab={intl.get(`sfin.common.view.associatedDoc`).d('关联单据')} key="detail2">
              <DocRelate {...lineProps} />
            </TabPane>
          </Tabs>
          <Modal
            title={intl.get(`sfin.common.view.addPaymentLine`).d('新增付款行')}
            destroyOnClose
            width={1000}
            visible={visible}
            onCancel={this.closeItemInfoModal}
            footer={
              <Button type="primary" onClick={this.onItemInfoModalOk}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            }
          >
            {visible && <ItemInfo {...modalProps} />}
          </Modal>
        </Content>
      </Fragment>
    );
  }
}
