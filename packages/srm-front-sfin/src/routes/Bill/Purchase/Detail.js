/**
 * PurchaseDetail - 非寄销开票单采购订单只读页面
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

import HeaderInfo from '../Components/HeaderInfo';
import RowTable from '../Components/RowTable';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import styles from '../Components/index.less';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';

/**
 * 非寄销开票单维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} PurchaseDetail - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, bill }) => ({
  bill,
  loading: loading.effects['bill/fetchHeader'] || loading.effects['bill/fetchRow'],
  printLoading: loading.effects['bill/print'],
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
export default class PurchaseDetail extends PureComponent {
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
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { billHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/print',
      billHeaderId,
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

  /* 查询总账科目Table
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

  // /**
  //  * 打印功能
  //  */
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
      bill: {
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
    // const { isCreator, billHeaderId, recordModal } = this.state;
    // const { supplierUpdateShield, basePrice } = headerInfo;
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
    // const { supplierUpdateShield, basePrice, billStatus } = headerInfo;
    // const { isCreator, billHeaderId, recordModal } = this.state;
    const { dispatch } = this.props;
    const headerProps = {
      isRemarkEdit: false,
      isOpinionEdit: false,
      headerInfo: { ...headerInfo, customReadFlag: 1 }, // readFlag只读标识，可用个性化fx条件
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
          backPath="/sfin/purchase-bill/list"
          title={intl.get(`${promptCode}.view.message.title.billDetail`).d('开票单明细')}
        >
          {isCreator && (
            <React.Fragment>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/detail-export/${billHeaderId}`}
                queryParams={{
                  billHeaderId,
                  customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
                }}
                otherButtonProps={{ icon: 'export', type: 'primary' }}
              />
              <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                {isApprovalShow && `${intl.get('hzero.common.button.approval').d('审批')}/`}
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
              <Button
                // disabled={!['CONFIRMED', 'INFORM_CONFIRMED'].includes(billStatus)}
                onClick={() => Throttle(this.handlePrint(), 2000)}
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
              animated={false}
              onChange={this.changeTab}
              activeKey={tabKey}
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
