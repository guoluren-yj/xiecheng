/**
 * Goods -收货
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
export default class Goods extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      exectionType: null,
    };
  }

  componentDidMount() {
    // this.handleSearch();
    this.handleGoodOldRoNew();
  }

  /**
   * 查询收货返回新老事物判断
   */
  @Bind()
  handleGoodOldRoNew() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryGoodOldRoNew',
    }).then((res) => {
      if (res === 0 || res === 1) {
        // 数据只返回0或1，如若再返回其他数据是接口问题
        this.setState(
          {
            // eslint-disable-next-line react/no-unused-state
            exectionType: res,
          },
          () => {
            this.handleSearch();
          }
        );
      }
    });
  }

  /**
   * 查询收货信息
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryNewGoods',
      payload: {
        type: 'Customer',
        code: 'SRM_Goods_New',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { goodsLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} newGoodsKeys
   */
  @Bind()
  onSelectChange(newGoodsKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        newGoodsKeys,
      },
    });
  }

  // 确定添加需要显示的收货条目
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allNewGoods = [], newGoodsKeys = [] } = {} } = this.props;
    if (!isEmpty(newGoodsKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allNewGoods.length; i++) {
        if (newGoodsKeys.indexOf(allNewGoods[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_Goods',
            tenantId: getUserOrganizationId(),
            ...allNewGoods[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_Goods', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { goodsLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.goodsField`)
          .d('请选择要显示的收货条目！')
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
    const { drawerVisible, exectionType } = this.state;
    const {
      addLoading,
      srmCards: { goodsLoading, allNewGoods = [], newGoodList = [], newGoodsKeys = [] } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: newGoodsKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.goods.clauseName`).d('收货条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    const routerType =
      exectionType === 0 ? `/sinv/purchase-reception/list` : `/sinv/receipt-execution/list`;
    return (
      <div className={styles.goods}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.goods.receiptWorkbench`).d('收货工作台')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {goodsLoading === true ? (
            <Card loading={goodsLoading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            newGoodList.map((item) => (
              <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                <Col span={20}>
                  <Link
                    to={
                      item.clauseCode !== 'SINV.RCV_TO_BE_EXECUTED'
                        ? `${item.menuCode}`
                        : routerType
                    }
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
          title={intl.get(`spfm.dashboard.model.Goods.modalTitle`).d('选择需要展示的收货条目')}
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
            dataSource={allNewGoods}
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
