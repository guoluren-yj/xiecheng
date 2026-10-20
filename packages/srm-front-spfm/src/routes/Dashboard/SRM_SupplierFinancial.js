/**
 * SupplierFinancial -供应商财务
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
export default class SupplierFinancial extends React.Component {
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
   * 查询供应商财务
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySupplierFinancial',
      payload: {
        type: 'SupplierChangeCustomer',
        code: 'SRM_SupplierFinancial',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { supplierFinancialLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} supplierFinancialKeys
   */
  @Bind()
  onSelectChange(supplierFinancialKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        supplierFinancialKeys,
      },
    });
  }

  // 确定添加需要显示的采购订单
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allSupplierFinancial = [], supplierFinancialKeys = [] } = {},
    } = this.props;
    if (!isEmpty(supplierFinancialKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allSupplierFinancial.length; i++) {
        if (supplierFinancialKeys.indexOf(allSupplierFinancial[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_SupplierFinancial',
            tenantId: getUserOrganizationId(),
            ...allSupplierFinancial[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_SupplierFinancial', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { supplierFinancialLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.financialField`)
          .d('请选择要显示的财务条目！')
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
        supplierFinancialLoading,
        allSupplierFinancial = [],
        supplierFinancial = [],
        supplierFinancialKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: supplierFinancialKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.financial.clauseName`).d('财务条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.financial}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.financial.title`).d('财务')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {supplierFinancialLoading === true ? (
            <Card
              loading={supplierFinancialLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            supplierFinancial.map(item => (
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
            .get(`spfm.dashboard.model.supplierFinancial.modalTitle`)
            .d('选择需要展示的财务条目')}
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
            dataSource={allSupplierFinancial}
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
