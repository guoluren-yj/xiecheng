/**
 * SupplierManagement -供应商管理
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
export default class SupplierManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      managementVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询供应商管理信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryManagement',
      payload: {
        type: 'Customer',
        code: 'SRM_SupplierManagement',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { managementLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} managementKeys
   */
  @Bind()
  onSelectChange(managementKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        managementKeys,
      },
    });
  }

  // 确定添加需要显示的供应商管理条目
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allManagement = [], managementKeys = [] } = {} } = this.props;
    if (!isEmpty(managementKeys)) {
      const notManagement = [];
      for (let i = 0; i < allManagement.length; i++) {
        if (managementKeys.indexOf(allManagement[i].clauseId) === -1) {
          notManagement.push({
            code: 'SRM_SupplierManagement',
            tenantId: getUserOrganizationId(),
            ...allManagement[i],
          });
        }
      }
      if (isEmpty(notManagement)) {
        notManagement.push({
          code: 'SRM_SupplierManagement',
          tenantId: getUserOrganizationId(),
        });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notManagement,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { managementLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.supplierField`)
          .d('请选择要显示的供应商管理条目！')
      );
    }
  }

  // 打开Modal框
  @Bind()
  openModal() {
    this.setState({
      managementVisible: true,
    });
  }

  // 关闭Modal框
  @Bind()
  hideModal() {
    this.setState({
      managementVisible: false,
    });
  }

  render() {
    const { managementVisible } = this.state;
    const {
      addLoading,
      srmCards: {
        managementLoading,
        allManagement = [],
        managementList = [],
        managementKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: managementKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.model.supplierManage.supplierManageEntry`)
          .d('供应商管理条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.supplierManagement}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.supplierManage.title`).d('供应商管理')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {managementLoading === true ? (
            <Card loading={managementLoading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            managementList.map(item => (
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
            .get(`spfm.dashboard.model.supplierManagement.modalTitle`)
            .d('选择需要展示的供应商管理条目')}
          visible={managementVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          confirmLoading={addLoading}
          width="400px"
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          <EditTable
            // loading={loading}
            dataSource={allManagement}
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
