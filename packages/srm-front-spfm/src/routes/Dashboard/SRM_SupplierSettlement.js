/**
 * PurchaseOrder -采购协议
 * @date: 2020-03-19
 * @author mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Modal, message, Icon, Card } from 'hzero-ui';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import styles from './Cards.less';
import { findMenuName } from '@/utils/utils';
import { getUxInvableTotal } from '@/services/srmCardsService';

const uxBillFlag = findMenuName('srm.settle-account.reconciliation-workbench.ux-supplier');
const uxSettleFlag = findMenuName('srm.settle-account.jsd.ux-supply');
const oldBillRoute = '/ssta/reconciliation-workbench-supplier/list';
const oldSettleRoute = '/ssta/supply-settle/list';
const oldCostRoute = '/ssta/cost-sheet-sup/list';
const uxCostFlag = findMenuName('srm.settle-account.ux-cost-sheet-sup-cost-sheet');

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class Settlement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询采购方结算平台
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySrmSupplierSettle',
      payload: {
        type: 'Customer',
        code: 'SRM_SupplierSettlement',
      },
    }).then(async (res) => {
      if (res) {
        if (!uxSettleFlag) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { supplierSettlementLoading: false },
          });
        } else {
          const uxInvableTotal = getResponse(await getUxInvableTotal('supplier'));
          const newRes = res
            .filter((item) => item.isShow === 0)
            .map((item) => {
              const { docCount, clauseCode } = item || {};
              const newDocCount = clauseCode === 'SSTA.SUPPLIER_INV_SETTLEPOOL'
                ? uxInvableTotal?.totalElements || 0
                : docCount;
              return {
               ...item,
                docCount: newDocCount > 99 ? '99+' : newDocCount,
              };
            });
          dispatch({
            type: 'srmCards/updateState',
            payload: { supplierSettlementLoading: false, srmSupplySettleList: newRes },
          });
        }
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        supplierSettlementKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购方结算平台
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allSupplierSettlement = [], supplierSettlementKeys = [] } = {},
    } = this.props;
    if (!isEmpty(supplierSettlementKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allSupplierSettlement.length; i++) {
        if (supplierSettlementKeys.indexOf(allSupplierSettlement[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_SupplierSettlement',
            tenantId: getUserOrganizationId(),
            ...allSupplierSettlement[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_SupplierSettlement', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { supplierSettlementLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.supplierSettlementField`)
          .d('请选择要显示的销售方结算条目！')
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

  uxRouteReplace = (menuCode = '') => {
    if (
      (menuCode.startsWith(oldSettleRoute) && uxSettleFlag) ||
      (menuCode.startsWith(oldBillRoute) && uxBillFlag) ||
      (menuCode.startsWith(oldCostRoute) && uxCostFlag)
    ) {
      return menuCode.replace('ssta/', 'ssta/new-');
    } else {
      return menuCode;
    }
  };

  render() {
    const { drawerVisible } = this.state;
    const {
      addLoading,
      srmCards: {
        supplierSettlementLoading,
        allSupplierSettlement = [],
        srmSupplySettleList = [],
        supplierSettlementKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: supplierSettlementKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.model.settlement.supplierSettlementEntry`)
          .d('销售方结算条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.supplierSettlement}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.supplier.settlement`).d('销售方结算')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {supplierSettlementLoading === true ? (
            <Card
              loading={supplierSettlementLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            srmSupplySettleList.map((item) => (
              <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                <Col span={20}>
                  <Link to={this.uxRouteReplace(item.menuCode)} className={styles['card-entry']}>
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
            .get(`spfm.dashboard.model.supplierSettlement.modalTitle`)
            .d('选择需要展示的销售方结算条目')}
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
            dataSource={allSupplierSettlement}
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
