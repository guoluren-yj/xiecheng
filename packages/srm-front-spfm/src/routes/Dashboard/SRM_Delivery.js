/**
 * Delivery -送货
 * @date: 2019-02-26
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Modal, message, Icon, Card } from 'hzero-ui';
import { getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import styles from './Cards.less';

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class Delivery extends React.Component {
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
   * 查询销售订单
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryDelivery',
      payload: {
        type: 'SupplierChangeCustomer',
        code: 'SRM_Delivery',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { deliveryLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} deliveryKeys
   */
  @Bind()
  onSelectChange(deliveryKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        deliveryKeys,
      },
    });
  }

  // 确定添加需要显示的送货条目
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allDelivery = [], deliveryKeys = [] } = {} } = this.props;
    if (!isEmpty(deliveryKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allDelivery.length; i++) {
        if (deliveryKeys.indexOf(allDelivery[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_Delivery',
            tenantId: getUserOrganizationId(),
            ...allDelivery[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_Delivery', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { deliveryLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.deliveryField`)
          .d('请选择要显示的送货条目！')
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

  render() {
    const { drawerVisible } = this.state;
    const {
      addLoading,
      srmCards: { deliveryLoading, allDelivery = [], deliveryList = [], deliveryKeys = [] } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: deliveryKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.delivery.clauseName`).d('送货条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.delivery}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.delivery.title`).d('送货')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {deliveryLoading === true ? (
            <Card loading={deliveryLoading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            deliveryList.map(item => (
              <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                <Col span={20}>
                  <Link
                    to={`${item.menuCode}${
                      item.clauseCode === 'SPFM.DELIVERY_MAINTENANCE' ? '/?deliveryOrder' : ''
                    }`}
                    className={styles['card-entry']}
                  >
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
          title={intl.get(`spfm.dashboard.model.delivery.modalTitle`).d('选择需要展示的送货条目')}
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
            dataSource={allDelivery}
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
