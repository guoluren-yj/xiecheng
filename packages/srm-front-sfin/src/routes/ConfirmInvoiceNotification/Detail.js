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
import { isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_FINANCE } from '_utils/config';

import HeaderInfo from '@/routes/Bill/Components/HeaderInfo';
import RowTable from '@/routes/Bill/Components/RowTable';
import DetailTable from '@/routes/Bill/Components/DetailTable';
import ActionHistory from '@/routes/Bill/Components/ActionHistory';
import styles from '@/routes/Bill/Components/index.less';
import SupplierTable from '../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../common.less';

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
  confirming: loading.effects['bill/confirmNotificationBillConfirm'],
  rejecting: loading.effects['bill/confirmBillRejectBill'],
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
      infDataSource: [],
      infPagination: {},
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
        page: isEmpty(params) ? rowPagination : params,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
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
        interfaceType: 'supplier',
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
      bill: { infPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchInf',
      payload: {
        organizationId,
        billHeaderId,
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

  /**
   * 开票审核申请单确认
   */
  @Bind()
  @Throttle(1000)
  handleConfirm() {
    const { dispatch, organizationId, history } = this.props;
    const { billHeaderId } = this.state;
    const approvedRemark = this.headerForm.getFieldValue('approvedRemark');
    confirm({
      title: intl
        .get(`${promptCode}.view.message.title.modal.invoicePass`)
        .d('是否确认要通过开票申请单?'),
      onOk() {
        dispatch({
          type: 'bill/confirmValidateBill',
          payload: { billHeaderList: [{ billHeaderId, approvedRemark }], organizationId },
        }).then((response) => {
          if (response?.validatedCode === 'INFO') {
            confirm({
              title: response.msg,
              // content: '',
              onOk: () => {
                dispatch({
                  type: 'bill/confirmNotificationBillConfirm',
                  payload: { billHeaderList: [{ billHeaderId, approvedRemark }], organizationId },
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
              type: 'bill/confirmNotificationBillConfirm',
              payload: { billHeaderList: [{ billHeaderId, approvedRemark }], organizationId },
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
                  type: 'bill/confirmNotificationBillConfirm',
                  payload: { billHeaderList: [{ billHeaderId, approvedRemark }], organizationId },
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
    const { dispatch, organizationId, history } = this.props;
    const { billHeaderId } = this.state;
    const approvedRemark = this.headerForm.getFieldValue('approvedRemark');
    confirm({
      title: intl
        .get(`${promptCode}.view.message.title.modal.returnInvoiceApplication`)
        .d('是否确认要退回开票申请单?'),
      // content: '',
      onOk() {
        dispatch({
          type: 'bill/confirmBillRejectBill',
          payload: { billHeaderList: [{ billHeaderId, approvedRemark }], organizationId },
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
  tabChange(activeKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: {
        lastActiveTabKey: activeKey,
      },
    });
  }

  render() {
    const {
      loading,
      confirming,
      rejecting,
      organizationId,
      bill: {
        headerInfo = {},
        rowDataSource = {},
        rowPagination = {},
        detailDataSource = {},
        detailPagination = {},
        lastActiveTabKey,
      },
    } = this.props;
    // basePrice 基准价 true含税
    const { supplierUpdateShield, basePrice } = headerInfo;
    const {
      isCreator,
      billHeaderId,
      recordModal,
      infDataSource = [],
      infPagination = {},
    } = this.state;
    // const { content = [] } = infDataSource;
    const { dispatch } = this.props;
    const headerProps = {
      isRemarkEdit: false,
      headerInfo,
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
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

    const suppProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/confirm-invoice-notification/list"
          title={intl
            .get(`${promptCode}.view.message.title.invoiceConfirm.detail`)
            .d('开票单确认明细')}
        >
          {isCreator && (
            <React.Fragment>
              <Button
                type="primary"
                icon="check"
                loading={confirming || rejecting}
                onClick={this.handleConfirm}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.approve').d('通过')}
              </Button>
              <Button
                icon="close"
                loading={confirming || rejecting}
                onClick={this.handleShowRejectModal}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.return').d('退回')}
              </Button>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/detail-export/${billHeaderId}`}
                queryParams={{ billHeaderId, customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE' }}
                otherButtonProps={{ icon: 'export', type: 'default' }}
              />
              <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
            </React.Fragment>
          )}
        </Header>
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
                <SupplierTable {...suppProps} />
              </TabPane>
            </Tabs>
            <ActionHistory {...operationRecordProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
