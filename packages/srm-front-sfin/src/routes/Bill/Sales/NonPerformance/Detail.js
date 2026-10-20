/**
 * SalesDetail - 非寄销开票单销售账单只读页面
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Badge } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';
import ExcelExport from '@/components/ExcelExport';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import notification from 'utils/notification';
import HeaderInfo from '../../Components/HeaderInfo';
import RowTable from '../../Components/RowTable';
import DetailTable from '../../Components/DetailTable';
import ActionHistory from '../../Components/ActionHistory';
import styles from '../../Components/index.less';
import SupplierTable from '../../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../../common.less';

const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';

/**
 * 非寄销开票单维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} SalesDetail - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, salesBill }) => ({
  salesBill,
  loading: loading.effects['salesBill/fetchHeader'] || loading.effects['salesBill/fetchRow'],
  printLoading: loading.effects['salesBill/print'],
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
export default class SalesDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { billHeaderId },
      },
    } = props;
    this.state = {
      tabKey: 'row',
      isCreator: true,
      billHeaderId,
      recordModal: false,
      infDataSource: [],
      infPagination: {},
      billFlag: true,
    };
  }

  componentDidMount() {
    this.handleSearchHeader();
    this.handleSearchRow();
    this.handleSearchDetail();
    this.handleSearchInf();
  }

  /**
   * 查询开票头信息
   */
  @Bind()
  handleSearchHeader() {
    const { dispatch, organizationId } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'salesBill/fetchHeader',
      payload: {
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
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
      salesBill: { rowPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'salesBill/fetchRow',
      payload: {
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
        page: isEmpty(params) ? rowPagination : params,
      },
    });
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
      salesBill: { infPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'salesBill/fetchInf',
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
   * 查询开票明细Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchDetail(params = {}, _, sort = {}) {
    const {
      dispatch,
      organizationId,
      salesBill: { detailPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'salesBill/fetchDetail',
      payload: {
        sort,
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
        page: isEmpty(params) ? detailPagination : params,
        customizeUnitCode: 'SFIN.BILL_CREATE_DETAIL.DETAILED',
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

  /**
   * 打印功能
   * @FileReader 拦截报错信息
   */
  @Bind()
  @Throttle(2000)
  handlePrint() {
    const { billHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'salesBill/print',
      billHeaderId,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const targer = reader.result;
        try {
          const failedInfo = JSON.parse(targer);
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

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  /**
   * 打印功能
   */
  // @Bind()
  // handlePrint() {
  //   const { billHeaderId } = this.state;
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'bill/print',
  //     billHeaderId,
  //   }).then(res => {
  //     if (res) {
  //       const file = new Blob([res], { type: 'application/pdf' });
  //       const fileURL = URL.createObjectURL(file);
  //       const printWindow = window.open(fileURL);
  //       printWindow.print();
  //     }
  //   });
  // }

  render() {
    const {
      loading,
      organizationId,
      salesBill: {
        headerInfo = {},
        rowDataSource = {},
        rowPagination = {},
        detailDataSource = {},
        detailPagination = {},
      },
      printLoading = false,
    } = this.props;
    // basePrice 基准价 true含税
    const { supplierUpdateShield, basePrice } = headerInfo;
    const {
      tabKey,
      isCreator,
      billHeaderId,
      recordModal,
      infDataSource = [],
      infPagination = {},
      isApprovalShow = true,
      billFlag = true,
    } = this.state;
    const { dispatch } = this.props;
    const headerProps = {
      isRemarkEdit: false,
      isOpinionEdit: false,
      headerInfo: { ...headerInfo, customReadFlag: 1 },
    };
    const rowProps = {
      billFlag,
      isEdit: false,
      supplierUpdateShield,
      basePrice,
      rowDataSource,
      rowPagination,
      onTableChange: this.handleSearchRow,
    };
    const detailProps = {
      billFlag,
      detailDataSource,
      detailPagination,
      onTableChange: this.handleSearchDetail,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
      showRejected: true,
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/sales-bill/list"
          title={intl.get(`${promptCode}.view.message.title.billDetail`).d('开票单明细')}
        >
          {isCreator && (
            <React.Fragment>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/supplier/detail-export/${billHeaderId}`}
                queryParams={{ billHeaderId, customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE' }}
                otherButtonProps={{ icon: 'export', type: 'primary' }}
              />
              <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                {isApprovalShow && `${intl.get('hzero.common.button.approval').d('审批')}/`}

                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
              <Button
                // disabled={!['CONFIRMED', 'INFORM_CONFIRMED'].includes(billStatus)}
                onClick={this.handlePrint}
                icon="printer"
                loading={printLoading}
              >
                {intl.get(`hzero.common.button.print`).d('打印')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
            <HeaderInfo {...headerProps} />
            <Tabs
              onChange={this.changeTab}
              activeKey={tabKey}
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
            <ActionHistory {...operationRecordProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
