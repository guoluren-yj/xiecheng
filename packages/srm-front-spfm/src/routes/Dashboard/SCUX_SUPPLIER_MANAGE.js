import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Modal, message, Icon, Card } from 'hzero-ui';
import { Icon as C7nIcon } from 'choerodon-ui';
import { getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import styles from './Cards.less';

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addParts'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class SupplierManage extends React.Component {
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
   * 查询采购申请信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySupplierManageList',
      payload: {
        type: 'Customer',
        code: 'SCUX_SUPPLIER_MANAGE',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { supplierManageLoading: false },
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
        supplierManageKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的供应商管理条目
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allSupplierManage = [], supplierManageKeys = [] } = {},
    } = this.props;
    if (!isEmpty(supplierManageKeys)) {
      const notSupplierManage = [];
      for (let i = 0; i < allSupplierManage.length; i++) {
        if (supplierManageKeys.indexOf(allSupplierManage[i].clauseId) === -1) {
          notSupplierManage.push({
            code: 'SCUX_SUPPLIER_MANAGE',
            tenantId: getUserOrganizationId(),
            ...allSupplierManage[i],
          });
        }
      }
      if (isEmpty(notSupplierManage)) {
        notSupplierManage.push({ code: 'SCUX_SUPPLIER_MANAGE', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addParts',
        payload: notSupplierManage,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { supplierManageLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.supplierManageField`)
          .d('请选择要显示的供应商管理条目！')
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
      srmCards: {
        supplierManageLoading,
        allSupplierManage = [],
        scuxSupplierManageList = [],
        supplierManageKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: supplierManageKeys,
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
      <div className={styles.supplierManage}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <C7nIcon
              type="wait_one_b"
              style={{ padding: '10px 8px 10px 12px', color: 'rgb(10, 114, 9)' }}
            />
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.supplierManage.supplierManage`).d('供应商管理')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {supplierManageLoading === true ? (
            <Card
              loading={supplierManageLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            scuxSupplierManageList.map(item => (
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
            .get(`spfm.dashboard.view.message.confirm.selected.supplierManageField`)
            .d('请选择要显示的供应商管理条目！')}
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
            dataSource={allSupplierManage}
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
