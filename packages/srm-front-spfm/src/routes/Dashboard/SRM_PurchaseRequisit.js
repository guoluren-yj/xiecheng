/**
 * PurchaseOrder -采购申请
 * @date: 2020-03-18
 * @author mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
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
import EditTable from 'components/EditTable';
import styles from './Cards.less';

import { fetchConfigSheet } from '@/services/srmCardsService';
@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class PurchaseRequisit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
    };
  }

  componentDidMount() {
    const allPurchase = ['SPFM.ASSIGN_REQUISIT', 'SPFM.REVIEW_REQUISIT'];
    this.handleSearch();
    Promise.all([this.queryOldPool()]).then((res) => {
      if (res) {
        const [oldUiSetting = []] = res;
        if (oldUiSetting && !isEmpty(oldUiSetting.content)) {
          allPurchase.push('SPRM.CREATE_REJECT', 'SPRM.CHANGE_REJECT');
        } else {
          allPurchase.push(
            'SPRM.CHANGE_REJECT_NEW',
            'SPRM.CREATE_REJECT_NEW',
            'SPRM.PR_UNDER_APPROVAL'
          );
        }
        this.setState({ allPurchase });
      }
    });
  }

  @Bind()
  queryOldPool() {
    return fetchConfigSheet({
      organizationId: getUserOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode: 'sprm_old_ui_config',
      tenant: getCurrentTenant().tenantNum,
    });
  }

  /**
   * 查询采购申请信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySrmPurchaseRequisit',
      payload: {
        type: 'Customer',
        code: 'SRM_PurchaseRequisit',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { purchaseRequisitLoading: false },
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
        purchaseRequisitKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购申请
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allPurchaseRequisit = [], purchaseRequisitKeys = [] } = {},
    } = this.props;
    if (!isEmpty(purchaseRequisitKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allPurchaseRequisit.length; i++) {
        if (purchaseRequisitKeys.indexOf(allPurchaseRequisit[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_PurchaseRequisit',
            tenantId: getUserOrganizationId(),
            ...allPurchaseRequisit[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_PurchaseRequisit', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { purchaseRequisitLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.requisitField`)
          .d('请选择要显示的需求池条目！')
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
        purchaseRequisitLoading,
        allPurchaseRequisit = [],
        srmPurchaseRequisitList = [],
        purchaseRequisitKeys = [],
      } = {},
    } = this.props;
    const { allPurchase = [] } = this.state;
    const rowSelection = {
      selectedRowKeys: purchaseRequisitKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.model.purchaseRequisit.purchaseRequisitEntry`)
          .d('需求池条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.purchaseRequisit}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.purchaseRequisit.purchaseRequisit`).d('需求池')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {purchaseRequisitLoading === true ? (
            <Card
              loading={purchaseRequisitLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            srmPurchaseRequisitList
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
            .get(`spfm.dashboard.model.purchaseRequisit.modalTitle`)
            .d('选择需要展示的需求池条目')}
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
            dataSource={allPurchaseRequisit.filter((ele) => allPurchase.includes(ele.clauseCode))}
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
