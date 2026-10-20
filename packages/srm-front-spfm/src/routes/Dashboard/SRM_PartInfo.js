/**
 * PartsRecognition -零件承认
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
@formatterCollections({ code: 'spfm.dashboard' })
export default class PartsRecognition extends React.Component {
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
   * 查询采购订单信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryPartsRecognition',
      payload: {
        type: 'Customer',
        code: 'SRM_PartInfo',
      },
    }).then((res) => {
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
   * @param {Array} partsKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        partsKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购订单
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allParts = [], partsKeys = [] } = {} } = this.props;
    if (!isEmpty(partsKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allParts.length; i++) {
        if (partsKeys.indexOf(allParts[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_PartInfo',
            tenantId: getUserOrganizationId(),
            ...allParts[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_PartInfo', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addParts',
        payload: notPurchase,
      }).then((res) => {
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

  render() {
    const { drawerVisible } = this.state;
    const {
      addLoading,
      name,
      srmCards: { purchaseOrderLoading, allParts = [], partsRecognition = [], partsKeys = [] } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: partsKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.partInfo.partsRecognition`).d('零件承认'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.purchaseOrder}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {name || intl.get(`spfm.dashboard.model.partInfo.partsRecognition`).d('零件承认')}
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
            partsRecognition.map((item) => (
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
            .get(`spfm.dashboard.model.partInfo.modalTitle`)
            .d('选择需要展示的零件承认条目')}
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
            dataSource={allParts}
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
