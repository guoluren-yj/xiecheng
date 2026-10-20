import React from 'react';
import { Icon as C7nIcon } from 'choerodon-ui';
import { withRouter, Link } from 'dva/router';
import { Row, Col, Icon, Card, Modal } from 'hzero-ui';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';

import styles from './Cards.less';
import awaitSevenB from '../../assets/dashboard/await_seven_b.svg';

const prefix = `spfm.dashboard`;

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class ScuxSbuxSettle extends React.Component {
  state = {
    formData: [],
    showData: [],
    loading: true,
    drawerVisible: false,
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    this.setState({ loading: true }, () => {
      dispatch({
        type: 'srmCards/queryCardData',
        payload: {
          type: 'Customer',
          code: 'SCUX_STARBUCKS_SRM_Settlement',
        },
      }).then((res) => {
        const newStateData = { loading: false };
        const result = getResponse(res);
        if (result) {
          Object.assign(newStateData, {
            formData: result,
            showData: result.filter((ele) => ele.isShow === 0).map((item) => item.clauseId),
          });
        }
        this.setState(newStateData);
      });
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({
      showData: selectedRowKeys,
    });
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

  // 确定添加需要显示的采购申请
  @Bind()
  onOk() {
    const { dispatch } = this.props;
    const { formData = [], showData = [] } = this.state;
    if (!isEmpty(showData)) {
      const notPurchase = [];
      for (let i = 0; i < formData.length; i++) {
        if (showData.indexOf(formData[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SCUX_STARBUCKS_SRM_Settlement',
            tenantId: getUserOrganizationId(),
            ...formData[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({
          code: 'SCUX_STARBUCKS_SRM_Settlement',
          tenantId: getUserOrganizationId(),
        });
      }
      this.setState({ loading: true });
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then((res) => {
        if (res) {
          this.setState({ loading: false });
          this.handleSearch();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`spfm.dashboard.view.message.confirm.selected.Field`)
          .d('请选择要显示的条目！'),
      });
      return false;
    }
  }

  render() {
    const { formData = [], drawerVisible, showData, loading } = this.state;
    const columns = [
      {
        title: intl
          .get(`spfm.dashboard.view.message.confirm.selected.Field`)
          .d('请选择要显示的条目！'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    const rowSelection = {
      selectedRowKeys: showData,
      onChange: this.onSelectChange,
    };
    return (
      <div className={styles['sbux-settlement']}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <img src={awaitSevenB} style={{ padding: '10px 8px 10px 12px' }} alt="" />
            <span className={styles['card-title']}>
              {intl.get(`${prefix}.view.message.settlement`).d('结算')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>

          {loading === true ? (
            <Card loading={loading} bordered={false} bodyStyle={{ padding: '0 20px' }} />
          ) : (
            formData
              .filter((ele) => ele.isShow === 0)
              .map((ele) => {
                return (
                  <Row className={styles['card-content']}>
                    <Col span={20}>
                      <Link to={ele.menuCode} className={styles['card-entry']}>
                        {ele.clauseName}
                      </Link>
                    </Col>
                    <Col span={4} className={styles['card-number']}>
                      {ele.docCount}
                    </Col>
                  </Row>
                );
              })
          )}
        </Row>
        <Modal
          title={intl
            .get(`spfm.dashboard.view.message.confirm.selected.Field`)
            .d('选择需要展示的条目')}
          visible={drawerVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          width="400px"
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          <EditTable
            // loading={loading}
            dataSource={formData}
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
