/**
 * PurchaseOrder -采购订单
 * @date: 2019-02-18
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Modal, message, Icon, Card } from 'hzero-ui';
import { getUserOrganizationId, getCurrentTenant } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  fetchConfigSheetRfxPrepare,
  fetchConfigSheet,
  fetchConfigSheetOrder,
  fetchNewBidConfig,
} from '@/services/srmCardsService';
import EditTable from 'components/EditTable';
import styles from './Cards.less';
@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchasePool'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class PurchaseRequisitionPool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
    };
  }

  componentDidMount() {
    // 'all', 'order', 'contract', 'biding', 'inquery', 'project'
    const allPurchase = ['SPUC.PURCHASE_POOL_SOURCE', 'SPUC.PURCHASE_POOL_ALL'];
    this.handleSearch();
    Promise.all([
      this.queryPermissions(),
      this.queryOrderSettings(),
      this.queryContractSettings(),
      this.queryOldRfx(),
      this.queryOldPool('sprm_demand_pool_tenant'),
      this.queryOldPool('spcm_old_contract_tenant'), // 新老协议
      this.queryOldOrder(),
      this.getNewBidConfig(), // 查询是否在配置表ource_new_bid_config中且【招投标（新招标）】为是
    ]).then((res) => {
      if (res) {
        const [
          permissions = [],
          orderSetting = [],
          contractSetting = [],
          oldRfx = [], // 询报价
          oldUiSetting = {},
          oldExecution = {},
          oldOrder = [], // 订单
          isShowNewBid = [], // 新招标
        ] = res;
        if (
          contractSetting[0] &&
          contractSetting[0].dsPrFlag === 1 &&
          oldExecution &&
          !isEmpty(oldExecution.content)
        ) {
          allPurchase.push('SPUC.PURCHASE_POOL_CONTRACT');
        }
        if (
          contractSetting[0] &&
          contractSetting[0].dsPrFlag === 1 &&
          oldExecution &&
          isEmpty(oldExecution.content)
        ) {
          allPurchase.push('SPRM.PURCHASE_POOL_CON_NEW');
        }
        if (oldUiSetting && !isEmpty(oldUiSetting.content)) {
          allPurchase.push('SPRM.PURCHASE_POOL_ALL');
        } else {
          allPurchase.push('SPRM.PURCHASE_WORKBENCH_ALL');
        }
        const permissionsList = {};
        permissions.forEach(({ code, approve }) => {
          if (code.includes('order')) {
            permissionsList.orderFlag = permissionsList.orderFlag || approve;
          } else if (code.includes('inquiry-hall')) {
            permissionsList.rfxFlag = permissionsList.rfxFlag || approve;
          } else if (code.includes('bid-hall')) {
            permissionsList.bidFlag = permissionsList.rfxFlag || approve;
          }
        });
        if (permissionsList.orderFlag) {
          if (
            orderSetting.some((i) => i.businessType === 'PR_CHANGE_ORDER' && i.enabledFlag === 1)
          ) {
            if (oldOrder && !isEmpty(oldOrder)) {
              allPurchase.push('SPUC.PURCHASE_POOL_ORDER'); // 老租户
            } else {
              allPurchase.push('SPRM.PURCHASE_POOL_ORDER_NEW'); // 新租户
            }
          }
        }
        if (permissionsList.bidFlag) {
          allPurchase.push('SPUC.PURCHASE_POOL_BID');
          if (isShowNewBid && !isEmpty(isShowNewBid)) {
            allPurchase.push('SPUC.PURCHASE_POOL_BID_NEW');
          }
        }
        if (permissionsList.rfxFlag) {
          if (oldRfx && !isEmpty(oldRfx)) {
            allPurchase.push('SPUC.PURCHASE_POOL_RFXOLD');
          } else {
            allPurchase.push('SPUC.PURCHASE_POOL_RFX');
          }
        }
        this.setState({ allPurchase });
      }
    });
  }

  @Bind()
  getNewBidConfig = () => {
    return fetchNewBidConfig({
      tenant: getCurrentTenant().tenantNum,
      newBid: 1,
    });
  };

  /**
   * 查询采购订单信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryPurchasePool',
      payload: {
        type: 'Customer',
        code: 'SRM_PurchaseRequisitionPool',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { purchasePoolLoading: false },
        });
      }
    });
  }

  @Bind()
  queryPermissions() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'srmCards/queryPermissions',
    });
  }

  @Bind()
  queryOldOrder() {
    return fetchConfigSheetOrder({
      map: {
        // menuFlag: "quotePurchaseRequisition",
        tenantNum: getCurrentTenant().tenantNum,
      },
      tenantId: 0,
    });
  }

  @Bind()
  queryOldRfx() {
    return fetchConfigSheetRfxPrepare({
      organizationId: getUserOrganizationId(),
      tenant: getCurrentTenant().tenantNum,
    });
  }

  @Bind()
  queryOrderSettings() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'srmCards/queryOrderSettings',
    });
  }

  @Bind()
  queryContractSettings() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'srmCards/queryContractSettings',
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(purchasePoolSelectedRowKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        purchasePoolSelectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购订单
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allPurchasePool = [], purchasePoolSelectedRowKeys = [] } = {},
    } = this.props;
    if (!isEmpty(purchasePoolSelectedRowKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allPurchasePool.length; i++) {
        if (purchasePoolSelectedRowKeys.indexOf(allPurchasePool[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_PurchaseRequisitionPool',
            tenantId: getUserOrganizationId(),
            ...allPurchasePool[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({
          code: 'SRM_PurchaseRequisitionPool',
          tenantId: getUserOrganizationId(),
        });
      }
      dispatch({
        type: 'srmCards/addPurchasePool',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { purchasePoolLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.selected.purchasePoolField`)
          .d('请选择要显示的申请转单条目！')
      );
    }
  }

  // 打开Modal框
  @Bind()
  openModal() {
    this.setState({
      drawerVisible: true,
    });
  }

  // 关闭Modal框
  @Bind()
  hideModal() {
    this.setState({
      drawerVisible: false,
    });
  }

  @Bind()
  queryOldPool(tableCode) {
    return fetchConfigSheet({
      organizationId: getUserOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode,
    });
  }

  render() {
    const { drawerVisible } = this.state;
    const {
      addLoading,
      srmCards: {
        purchasePoolLoading,
        allPurchasePool = [],
        purchasePool = [],
        purchasePoolSelectedRowKeys = [],
      } = {},
    } = this.props;
    const { allPurchase = [] } = this.state;
    const rowSelection = {
      selectedRowKeys: purchasePoolSelectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.model.purchaseOrder.purchaseChangeDate`)
          .d('采购申请转单条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.purchaseOrder}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.purchaseOrder.purchaseChange`).d('申请转单')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {purchasePoolLoading === true ? (
            <Card
              loading={purchasePoolLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            purchasePool
              .filter((ele) => allPurchase.includes(ele.clauseCode))
              .map((item) => (
                <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                  <Col span={20}>
                    <Link to={`${item.menuCode}`} className={styles['card-entry']}>
                      {item.clauseName}
                    </Link>
                  </Col>
                  <Col span={4} className={styles['card-number']}>
                    {item.docCount}
                  </Col>
                </Row>
              ))
          )}
        </Row>
        <Modal
          title={intl
            .get(`spfm.dashboard.model.purchaseRequisitionPool.modalTitle`) // SRM_PurchaseRequisitionPool
            .d('选择需要展示的申请转单条目')}
          visible={drawerVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          confirmLoading={addLoading}
          width="400px"
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          <EditTable
            // loading={loading}
            dataSource={allPurchasePool.filter((ele) => allPurchase.includes(ele.clauseCode))}
            // pagination={operationRecordPagination}
            rowKey="clauseId"
            onChange={this.handleSearch}
            columns={columns}
            rowSelection={rowSelection}
            bordered
          />
        </Modal>
      </div>
    );
  }
}
