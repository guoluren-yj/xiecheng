/**
 * contractCard -采购协议
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
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class StarbuckContract extends React.Component {
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
   * 查询采购协议
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryStarbuckContract',
      payload: {
        type: 'Customer',
        code: 'SBUX_SPCM_TITLE',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { starbuckContractLoading: false },
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
        starbuckContractKeys: selectedRowKeys,
      },
    });
  }

  // 确定添加需要显示的采购协议
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allStarbuckContract = [], starbuckContractKeys = [] } = {},
    } = this.props;
    if (!isEmpty(starbuckContractKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allStarbuckContract.length; i++) {
        if (starbuckContractKeys.indexOf(allStarbuckContract[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SBUX_SPCM_TITLE',
            tenantId: getUserOrganizationId(),
            ...allStarbuckContract[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SBUX_SPCM_TITLE', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { starbuckContractLoading: true },
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
      srmCards: {
        starbuckContractLoading,
        allStarbuckContract = [],
        starbuckContractList = [],
        starbuckContractKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: starbuckContractKeys,
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
          <C7nIcon
            type="wait_four_b"
            style={{ padding: '10px 8px 10px 12px', color: 'rgb(10, 114, 9)' }}
          />
          <span
            className={styles['card-title']}
            style={{ paddingLeft: '0px', position: 'relative', top: '3px' }}
          >
            {intl.get(`spfm.configServer.view.purchaseContract.message.title`).d('采购协议')}
          </span>
          <a
            onClick={this.openModal}
            className={styles['card-icon']}
            style={{ padding: '12px 16px' }}
          >
            <Icon type="ellipsis" />
          </a>
          {starbuckContractLoading === true ? (
            <Card
              loading={starbuckContractLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            starbuckContractList.map(item => (
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
            dataSource={allStarbuckContract}
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
