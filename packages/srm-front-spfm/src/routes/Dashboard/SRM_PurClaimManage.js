/**
 * PurClaimManage -采购方索赔管理
 * @date: 2021-12-31
 * @author JSS <shangshang.jing@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Link } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Row, Col, Modal, message, Icon, Card } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './Cards.less';

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurClaimManage'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class PurClaimManage extends React.Component {
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
   * 查询采购方质量业务
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryPurClaimManage',
      payload: {
        type: 'Customer',
        code: 'SRM_PurClaimManage',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { purClaimManageLoading: false },
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array}
   */
  @Bind()
  onSelectChange(purClaimManageKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        purClaimManageKeys,
      },
    });
  }

  // 确定添加需要显示的质量业务条目
  @Bind()
  onOk() {
    const {
      dispatch,
      srmCards: { allPurClaimManage = [], purClaimManageKeys = [] } = {},
    } = this.props;
    if (!isEmpty(purClaimManageKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allPurClaimManage.length; i++) {
        if (purClaimManageKeys.indexOf(allPurClaimManage[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_PurClaimManage',
            tenantId: getUserOrganizationId(),
            ...allPurClaimManage[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({
          code: 'SRM_PurClaimManage',
          tenantId: getUserOrganizationId(),
        });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'srmCards/updateState',
            payload: { purClaimManageLoading: true },
          });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.purClaimManageField`)
          .d('请选择要显示的采购方索赔管理条目！')
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
        purClaimManageLoading,
        allPurClaimManage = [],
        purClaimManage = [],
        purClaimManageKeys = [],
      } = {},
    } = this.props;
    const rowSelection = {
      selectedRowKeys: purClaimManageKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.model.qualityBusiness.qualityBusinessEntry`)
          .d('质量业务条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    return (
      <div className={styles.purClaimManage}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.purClaimManage.title`).d('采购方索赔管理')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {purClaimManageLoading === true ? (
            <Card
              loading={purClaimManageLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            purClaimManage.map((item) => (
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
            .get(`spfm.dashboard.model.purClaimManage.modalTitle`)
            .d('采购方查看索赔管理相关信息')}
          visible={drawerVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          confirmLoading={addLoading}
          width="400px"
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          <EditTable
            dataSource={allPurClaimManage}
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
