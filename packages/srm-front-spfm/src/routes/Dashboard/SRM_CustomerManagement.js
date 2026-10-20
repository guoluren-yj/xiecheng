/**
 * CustomerManagement -客户管理
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
export default class CustomerManagement extends React.Component {
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
   * 查询客户管理
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryCustomer',
      payload: {
        type: 'Supplier',
        code: 'SRM_CustomerManagement',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { customerLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} customerKeys
   */
  @Bind()
  onSelectChange(customerKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        customerKeys,
      },
    });
  }

  // 确定添加需要显示的客户管理条目
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allCustomer = [], customerKeys = [] } = {} } = this.props;
    if (!isEmpty(customerKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allCustomer.length; i++) {
        if (customerKeys.indexOf(allCustomer[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_CustomerManagement',
            tenantId: getUserOrganizationId(),
            ...allCustomer[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_CustomerManagement', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { customerLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.customerField`)
          .d('请选择要显示的客户管理条目！')
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
      srmCards: { customerLoading, allCustomer = [], customerList = [], customerKeys = [] } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: customerKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.customerManage.clauseName`).d('客户管理条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.customerManagement}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.message.clientManage`).d('客户管理')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {customerLoading === true ? (
            <Card loading={customerLoading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            customerList.map(item => (
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
            .get(`spfm.dashboard.model.customerManagement.modalTitle`)
            .d('选择需要展示的客户管理条目')}
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
            dataSource={allCustomer}
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
