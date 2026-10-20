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
export default class Contract extends React.Component {
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
   * 查询采购协议信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySrmContract',
      payload: {
        type: 'Customer',
        code: 'SRM_Contract',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { contractLoading: false },
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
        contractKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购协议
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allContract = [], contractKeys = [] } = {} } = this.props;
    if (!isEmpty(contractKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allContract.length; i++) {
        if (contractKeys.indexOf(allContract[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_Contract',
            tenantId: getUserOrganizationId(),
            ...allContract[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_Contract', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { contractLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.contractField`)
          .d('请选择要显示的采购协议条目！')
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
      srmCards: { contractLoading, allContract = [], srmContractList = [], contractKeys = [] } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: contractKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.contract.contractEntry`).d('采购协议条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.contract}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.model.contract.contract`).d('采购协议')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {contractLoading === true ? (
            <Card loading={contractLoading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            srmContractList.map(item => (
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
            .get(`spfm.dashboard.model.contract.modalTitle`)
            .d('选择需要展示的采购协议条目')}
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
            dataSource={allContract}
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
