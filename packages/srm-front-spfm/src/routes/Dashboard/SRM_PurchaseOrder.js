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
import { getUserOrganizationId, getResponse, getCurrentTenant } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import styles from './Cards.less';
import { fetchOrderConfig } from '@/services/hpfm/workplaceService';

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class PurchaseOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      isOldUser: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.getOrderConfig();
  }

  @Bind()
  getOrderConfig() {
    fetchOrderConfig({ tenantNum: getCurrentTenant().tenantNum }).then(res => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        this.setState({
          isOldUser: true,
        });
      }
    });
  }

  /**
   * 查询采购订单信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryPurchaseOrder',
      payload: {
        type: 'Customer',
        code: 'SRM_PurchaseOrder',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { purchaseOrderLoading: false },
        });
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
        selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购订单
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allPurchase = [], selectedRowKeys = [] } = {} } = this.props;
    if (!isEmpty(selectedRowKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allPurchase.length; i++) {
        if (selectedRowKeys.indexOf(allPurchase[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_PurchaseOrder',
            tenantId: getUserOrganizationId(),
            ...allPurchase[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_PurchaseOrder', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { purchaseOrderLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.orderField`)
          .d('请选择要显示的采购订单条目！')
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
  goNewLink(item) {
    switch (item.clauseCode) {
      case 'SPFM.REVIEW_ORDER':
        return {
          pathname: item.menuCode,
        };
      case 'SPFM.RELEASE_ORDER':
        return {
          pathname: '/sodr/order-workspace/list',
          state: {
            activeKey: 'toBeReleased',
          },
        };
      case 'SPFM.LOOKING_FORWARD_REVIEW':
        return {
          pathname: '/sodr/order-workspace/list',
          state: {
            activeKey: 'feedbackUnderReview',
          },
        };
      // 订单工作台 待反馈审核列表页
      case 'SPUC.LOOKING_FORWARD_REVIEW':
        return {
          pathname: '/sodr/order-workspace/list',
          state: {
            activeKey: 'feedbackUnderReview',
          },
        };
      //  订单工作台 待发布列表页
      case 'SODR.WORKBENCH_RELEASE_ORDER':
        return {
          pathname: '/sodr/order-workspace/list',
          state: {
            activeKey: 'toBeReleased',
          },
        };
      //  销售方订单工作台 待反馈列表页
      case 'SODR.WORKBENCH_CONFIRMED_ORDER':
        return {
          pathname: '/sodr/order-execution-workbench/list',
        };
      //  订单工作台-待审批-58
      case 'SPFM.WB.REVIEW_ORDER':
        return {
          pathname: item.menuCode,
          state: {
            activeKey: 'underApproval',
          },
        };
      default:
        return '/sodr/order-workspace/list';
    }
  }

  @Bind()
  handleClause(arr = []) {
    const { isOldUser } = this.state;
    // 标准需处理的条目
    const oldClause = ['SPFM.REVIEW_ORDER', 'SPFM.RELEASE_ORDER', 'SPFM.LOOKING_FORWARD_REVIEW'];
    const newClause = [
      'SPFM.REVIEW_ORDER',
      'SODR.WORKBENCH_RELEASE_ORDER',
      'SPUC.LOOKING_FORWARD_REVIEW',
    ];
    // return arr.filter(i => {
    //   const filterClause = isOldUser ? newUserClause : oldUserClause;
    //   const allHandles = newUserClause.concat(oldUserClause);
    //   if (!allHandles.includes(i.clauseCode)) return true;
    //   return !filterClause.includes(i.clauseCode);
    // });
    const newList = [];
    (isOldUser ? oldClause : newClause).forEach(i => {
      const standard = arr.find(n => n.clauseCode === i);
      if (standard) newList.push(standard);
    });
    arr.forEach(i => {
      if (!oldClause.includes(i.clauseCode) && !newClause.includes(i.clauseCode)) newList.push(i);
    });
    return newList;
  }

  @Bind()
  getClause(purchases) {
    const { isOldUser } = this.state;
    const _purchases = this.handleClause(purchases);
    const getClauseItem = record => {
      const { clauseId, menuCode, clauseName, docCount } = record;
      return (
        <Row className={styles['card-content']} key={`members-item-${clauseId}`}>
          <Col span={20}>
            <Link
              to={isOldUser ? `${menuCode}` : this.goNewLink(record)}
              className={styles['card-entry']}
            >
              {clauseName}
            </Link>
          </Col>
          <Col span={4} className={styles['card-number']}>
            {docCount}
          </Col>
        </Row>
      );
    };
    return _purchases.map(item => getClauseItem(item));
  }

  render() {
    const { drawerVisible } = this.state;
    const {
      addLoading,
      srmCards: {
        purchaseOrderLoading,
        allPurchase = [],
        purchases = [],
        selectedRowKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.purchaseOrder.purchaseOrderEntry`).d('采购订单条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    const clauseData = this.handleClause(allPurchase);
    return (
      <div className={styles.purchaseOrder}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.purchaseOrder.purchaseOrder`).d('采购订单')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {purchaseOrderLoading === true ? (
            <Card
              loading={purchaseOrderLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            this.getClause(purchases)
          )}
        </Row>
        <Modal
          title={intl
            .get(`spfm.dashboard.model.purchaseOrder.modalTitle`)
            .d('选择需要展示的采购订单条目')}
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
            dataSource={clauseData}
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
