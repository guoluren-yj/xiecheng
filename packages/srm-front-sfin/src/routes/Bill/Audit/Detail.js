/**
 * AuditDetail - 非寄销开票单维护
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Modal, Badge } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray, omit, isUndefined } from 'lodash';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import querystring from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  addItemsToPagination,
  createPagination,
  getEditTableData,
  delItemsToPagination,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import { SRM_FINANCE } from '_utils/config';
import uuid from 'uuid/v4';

import HeaderInfo from '../Components/HeaderInfo';
import RowTable from '../Components/RowTable';
import DetailTable from '../Components/DetailTable';
import GlaTable from '../Components/GlaTable';
import ActionHistory from '../Components/ActionHistory';
// import SupplierTable from '../../components/SupplierTable';
import styles from '../Components/index.less';
import ItemInfo from './ItemInfo';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { TabPane } = Tabs;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';

/**
 * 非寄销开票单维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} AuditDetail - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, bill }) => ({
  bill,
  loading: loading.effects['bill/fetchHeader'] || loading.effects['bill/fetchRow'],
  confirming: loading.effects['bill/confirmBill'],
  rejecting: loading.effects['bill/rejectBill'],
  modalling: loading.effects['bill/fetchModalList'],
  saveing: loading.effects['bill/saveTotalBill'],
  deleteListing: loading.effects['bill/deleteList'],
  fetchInfing: loading.effects['bill/fetchInf'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'entity.item',
    'entity.business',
    'sfin.invoiceBill',
    'sodr.quotePurchase',
    'sfin.supplierChargeEntry',
  ],
})
export default class AuditDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { billHeaderId },
      },
    } = props;
    this.state = {
      isCreator: true,
      billHeaderId,
      recordModal: false,
      modalVisible: false,
      infDataSource: [],
      infPagination: {},
      selectedModalRows: [],
    };
  }

  componentDidMount() {
    this.handleSearchHeader();
    this.handleSearchRow();
    this.handleSearchDetail();
    this.handleSearchInf();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { billHeaderId },
      },
    } = prevProps;
    if (this.props.match.params.billHeaderId !== billHeaderId) {
      this.handleSearchHeader();
      this.handleSearchRow();
      this.handleSearchDetail();
      this.handleSearchInf();

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ billHeaderId });
    }
  }

  /**
   * 查询开票头信息
   */
  @Bind()
  handleSearchHeader() {
    const { dispatch, organizationId } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchHeader',
      payload: {
        organizationId,
        billHeaderId,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO',
      },
    }).then((res) => {
      if (res) {
        const { invOrganizationId: attributeBigint1 } = res;
        this.setState({ attributeBigint1 });
      }
    });
  }

  /**
   * 查询开票行Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchRow(params = {}) {
    const {
      dispatch,
      organizationId,
      bill: { rowPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchRow',
      payload: {
        organizationId,
        billHeaderId,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
        page: isEmpty(params) ? rowPagination : params,
      },
    });
  }

  /**
   * 查询开票明细Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchDetail(params = {}, _, sort = {}) {
    const {
      dispatch,
      organizationId,
      bill: { detailPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchDetail',
      payload: {
        sort,
        organizationId,
        billHeaderId,
        page: isEmpty(params) ? detailPagination : params,
        customizeUnitCode: 'SFIN.BILL_CREATE_DETAIL.DETAILED',
      },
    });
  }

  /**
   * 设置 _status
   * @param {Object} data
   */
  @Bind()
  setStatus(content = []) {
    // const { content = [], ...other } = data;
    const newContent = content.map((o) => ({ ...o, _status: 'update', billLineId: uuid() }));
    return newContent;
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
      bill: { infPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchInf',
      payload: {
        organizationId,
        billHeaderId,
        page: isEmpty(params) ? infPagination : params,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          // infDataSource: this.setStatus(res.content),
          infDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          infPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 开票审核申请单确认
   */
  @Bind()
  @Throttle(1000)
  handleConfirm() {
    const {
      dispatch,
      organizationId,
      history,
      bill: { rowDataSource = {} },
    } = this.props;
    const { billHeaderId, infDataSource } = this.state;
    const approvedRemark = this.headerForm.getFieldValue('approvedRemark');
    // const contentList = infDataSource.filter(item => item.edited);
    const tableDate = getEditTableData(infDataSource);
    const supLineList = tableDate;
    if (!isEmpty(infDataSource) && isEmpty(supLineList)) {
      this.tabChange('inf');
      return;
    }
    const billLineList = getEditTableData(rowDataSource.content);
    confirm({
      title: intl
        .get(`${promptCode}.view.message.title.modal.invoicePass`)
        .d('是否确认要通过开票申请单?'),
      onOk() {
        dispatch({
          type: 'bill/confirmValidateBill',
          payload: {
            billHeaderList: [{ billHeaderId, approvedRemark, supLineList }],
            organizationId,
            // supLineList: tableDate,
          },
        }).then((response) => {
          if (response?.validatedCode === 'INFO') {
            confirm({
              title: response.msg,
              // content: '',
              onOk: () => {
                dispatch({
                  type: 'bill/confirmBill',
                  payload: {
                    billHeaderList: [{ billHeaderId, approvedRemark, supLineList, billLineList }],
                    organizationId,
                    // supLineList: tableDate,
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    history.goBack();
                  }
                });
              },
            });
          }
          if (response?.validatedCode === 'SUCCESS') {
            dispatch({
              type: 'bill/confirmBill',
              payload: {
                billHeaderList: [{ billHeaderId, approvedRemark, supLineList, billLineList }],
                organizationId,
                // supLineList: tableDate,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                history.goBack();
              }
            });
          }
          if (response?.validatedCode === 'WIATING_CONFIRM') {
            confirm({
              title: response.msg,
              onOk: () => {
                dispatch({
                  type: 'bill/confirmBill',
                  payload: {
                    billHeaderList: [{ billHeaderId, approvedRemark, supLineList, billLineList }],
                    organizationId,
                    // supLineList: tableDate,
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    history.goBack();
                  }
                });
              },
            });
          }
        });
      },
    });
  }

  /**
   * 开票审核申请单退回
   */
  @Bind()
  @Throttle(1000)
  handleShowRejectModal() {
    const {
      dispatch,
      organizationId,
      history,
      bill: { rowDataSource = {} },
    } = this.props;
    const { billHeaderId, infDataSource } = this.state;
    const approvedRemark = this.headerForm.getFieldValue('approvedRemark');
    const tableDate = getEditTableData(infDataSource);
    const supLineList = tableDate;
    if (!isEmpty(infDataSource) && isEmpty(supLineList)) {
      this.tabChange('inf');
      return;
    }
    const billLineList = getEditTableData(rowDataSource.content);
    confirm({
      title: intl
        .get(`sfin.invoiceBill.view.message.title.modal.detail`)
        .d('是否确认要退回开票申请单?'),
      // content: '',
      onOk() {
        dispatch({
          type: 'bill/rejectBill',
          payload: {
            billHeaderList: [{ billHeaderId, approvedRemark, billLineList }],
            organizationId,
            supLineList: tableDate,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.goBack();
          }
        });
      },
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
  updateState(text, values, record) {
    // const { billHeaderId, infDataSource } = this.state;
    const { billHeaderId, infDataSource = [] } = this.state;
    // const { billHeaderId, infDataSource } = this.state;

    const newDataSource = {
      ...values,
      billHeaderId: billHeaderId ? Number(billHeaderId) : null,
      billLineId: record.billLineId,
      _status: 'create',
    };
    const oldState = infDataSource.findIndex((ele) => ele.billLineId === record.billLineId);

    if (oldState > -1) {
      infDataSource[oldState] = newDataSource;
      this.setState({
        // infDataSource,
        infDataSource: { infDataSource },
      });
    }
  }

  /**
   * 新建列表
   * @param {String} modalVisible
   */
  @Bind()
  project() {
    this.setState({ modalVisible: true });
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

  /**
   * closeItemInfoModal - 关闭弹窗
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * fetchModalList - 查询模态框数据
   */
  @Bind()
  fetchModalList(page = {}) {
    const {
      dispatch,
      organizationId,
      bill: { headerInfo = {} },
    } = this.props;
    const { supplierCompanyId, erpSupplierFlag, ouId, companyId, currencyCode } = headerInfo;
    const modalList = [];
    const { infDataSource, attributeBigint1 } = this.state;
    const filedValues = isUndefined(this.itemInfo.search)
      ? {}
      : filterNullValueObject(this.itemInfo.search.getFieldsValue());
    infDataSource.forEach((item) => {
      if (item.supplierDeductionsId) {
        modalList.push(item.supplierDeductionsId);
      }
    });
    dispatch({
      type: 'bill/fetchModalList',
      payload: {
        page,
        erpSupplierFlag,
        supplierCompanyId,
        organizationId,
        ticketDeductionFlag: 1,
        ouId,
        currencyCode,
        companyId,
        attributeBigint1,
        notInDeductionIds: modalList,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT_ALERT',
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
  tabChange(activeKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: {
        lastActiveTabKey: activeKey,
      },
    });
  }

  // 保存
  @Bind()
  @Throttle(1000)
  save() {
    const { dispatch, organizationId } = this.props;
    const { infDataSource, billHeaderId } = this.state;
    // const contentList = infDataSource.filter(item => item.edited);
    const tableData = getEditTableData(infDataSource);
    if (isEmpty(tableData)) {
      return;
    }
    dispatch({
      type: 'bill/saveTotalBill',
      payload: {
        organizationId,
        billHeaderId,
        supLineList: tableData,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchInf();
        // 保存刷新开票头信息
        this.handleSearchHeader();
      }
    });
  }

  /**
   * deleteModalList - 删除总账科目数据
   */
  @Bind()
  @Throttle(1000)
  deleteModalList() {
    const { dispatch, organizationId } = this.props;
    const { infDataSource, infPagination, selectedModalRows, billHeaderId } = this.state;
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
        type: 'bill/deleteList',
        payload: {
          billHeaderId,
          organizationId,
          body: oldDataSource,
        },
      }).then((res) => {
        if (res) {
          this.setState({ selectedModalRows: [] });
          notification.success();
          this.handleSearchInf(infPagination);
          // 删除时刷新开票头信息
          this.handleSearchHeader();
        }
      });
    } else {
      this.setState({
        infDataSource: newDataSource,
        selectedModalRows: [],
      });
      this.setState({
        infPagination: delItemsToPagination(
          selectedModalRows.length,
          infDataSource.length,
          infPagination
        ),
      });
    }
  }

  @Bind()
  onItemInfoModalOk() {
    const { infDataSource = [], infPagination = {} } = this.state;
    const { selectedListRows: modalList } = this.itemInfo.state;

    const newDataSource = modalList.map((item) => {
      return {
        ...item,
        // supplierDeductionsId: uuid(),
        _status: 'create',
        edited: true,
      };
    });
    this.setState({
      infDataSource: [...newDataSource, ...infDataSource],
      infPagination: addItemsToPagination(
        this.itemInfo.state.selectedListRows.length,
        infDataSource.length,
        infPagination
      ),
    });

    this.closeItemInfoModal();
  }

  render() {
    const {
      loading,
      confirming,
      rejecting,
      modalling,
      saveing,
      fetchInfing,
      deleteListing,
      organizationId,
      match,
      bill: {
        headerInfo = {},
        rowDataSource = {},
        rowPagination = {},
        detailDataSource = {},
        detailPagination = {},
        lastActiveTabKey,
      },
      location: { search },
    } = this.props;
    const { flag } = querystring.parse(search.substr(1));
    // basePrice 基准价 true含税
    const { supplierUpdateShield, basePrice } = headerInfo;
    const showPubType = match.path !== '/pub/sfin/bill-audit/detail/:billHeaderId';

    const {
      isCreator,
      billHeaderId,
      recordModal,
      modalVisible,
      infDataSource = [],
      infPagination = {},
      modalDataSource = [],
      modalPagination = {},
      selectedModalRows = [],
    } = this.state;
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    const { dispatch } = this.props;
    // const { content = [] } = infDataSource;
    const headerProps = {
      isRemarkEdit: false,
      headerInfo,
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
      showPubType,
    };
    const rowProps = {
      isEdit: false,
      supplierUpdateShield,
      basePrice,
      rowDataSource,
      rowPagination,
      onTableChange: this.handleSearchRow,
    };
    const detailProps = {
      detailDataSource,
      detailPagination,
      onTableChange: this.handleSearchDetail,
    };
    const glaProps = {
      editFlag: flag !== '0',
      loading: fetchInfing,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
      updateState: this.updateState,
      selectedModalRows,
      modalRowSelectedChange: this.handleRowSelectedChange,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };

    const itemInfoProps = {
      visible: modalVisible,
      modalling,
      modalDataSource,
      modalPagination,
      width: 900,
      onRef: (node) => {
        this.itemInfo = node;
      },
      fetchDetailList: this.fetchModalList,
    };

    const btnLoading = confirming || rejecting || saveing || deleteListing || loading;

    const customizeUnitCode = 'SFIN.BILL_MAINTAIN_DETAIL.LINE,SFIN.BILL_CREATE_DETAIL.DETAILED';
    return (
      <React.Fragment>
        {showPubType && (
          <Header
            backPath="/sfin/bill-audit/list"
            title={intl
              .get(`${promptCode}.view.message.title.billAudit.detail`)
              .d('开票单审核明细')}
          >
            {isCreator && (
              <React.Fragment>
                <Button
                  type="primary"
                  icon="check"
                  loading={btnLoading}
                  onClick={this.handleConfirm}
                >
                  {intl.get('sfin.invoiceBill.model.invoiceBill.approve').d('通过')}
                </Button>
                <Button icon="close" loading={btnLoading} onClick={this.handleShowRejectModal}>
                  {intl.get('sfin.invoiceBill.model.invoiceBill.return').d('退回')}
                </Button>
                <ExcelExport
                  requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/detail-export/${billHeaderId}?customizeUnitCode=${customizeUnitCode}`}
                  queryParams={{ billHeaderId }}
                  otherButtonProps={{ icon: 'export', type: 'default' }}
                />
                <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                  {intl.get('hzero.common.button.operating').d('操作记录')}
                </Button>
              </React.Fragment>
            )}
          </Header>
        )}
        <Content>
          <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
            <HeaderInfo {...headerProps} />
            <Tabs
              onChange={this.tabChange}
              activeKey={lastActiveTabKey}
              animated={false}
              className={CommonStyle['tabpane-style']}
            >
              <TabPane tab={intl.get(`${promptCode}.view.message.title.tab.row`).d('行')} key="row">
                <RowTable {...rowProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.tab.detail`).d('明细')}
                key="detail"
              >
                <DetailTable {...detailProps} />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get(`${promptCode}.view.inf`).d('总账科目')}
                    <Badge
                      className={Styles['badge-tab']}
                      style={{
                        backgroundColor: '#fff',
                        color: lastActiveTabKey === 'inf' ? '#29BECE' : '#000',
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
                {flag !== '0' && (
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                      style={{ marginRight: 8 }}
                      loading={btnLoading}
                      icon="delete"
                      onClick={this.deleteModalList}
                      disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                    >
                      {intl.get(`hzero.common.button.delete`).d('删除')}
                    </Button>
                    <Button
                      style={{ marginRight: 8 }}
                      icon="save"
                      loading={btnLoading}
                      onClick={this.save}
                    >
                      {intl.get(`hzero.common.button.save`).d('保存')}
                    </Button>
                    <Button icon="plus" type="primary" onClick={this.project}>
                      {intl.get(`hzero.common.button.create`).d('新建')}
                    </Button>
                  </div>
                )}
                <GlaTable {...glaProps} />
              </TabPane>
            </Tabs>
            <ActionHistory {...operationRecordProps} />
          </Spin>
        </Content>
        <Modal
          title={intl.get(`sodr.quotePurchase.view.message.addEductionBanks`).d('新增扣款行')}
          destroyOnClose
          width={900}
          visible={modalVisible}
          onCancel={this.closeItemInfoModal}
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
          <ItemInfo {...itemInfoProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
