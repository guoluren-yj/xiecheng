/**
 * SRM_SourceEvent 寻源事件
 * @author zk <kang.zou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Modal, message } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
// import querystring from 'querystring';

import { getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';

import styles from './Cards.less';

@formatterCollections({ code: ['spfm.dashboard'] })
@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addSourceEvent'],
  organizationId: getUserOrganizationId,
}))
export default class SrmSourceEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerVisible: false,
    };
  }

  componentDidMount() {
    this.querySrmSourceEvent();
  }

  querySrmSourceEvent() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySrmSourceEvent',
      payload: {
        type: 'Customer',
        code: 'SRM_SourceEvent',
      },
    });
  }

  /**
   * 保存选中的行
   * @param {Array} sourceEventKeys
   */
  @Bind()
  onSelectChange(sourceEventKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
      payload: {
        sourceEventKeys,
      },
    });
  }

  // 确定添加需要显示的条目
  @Bind()
  onOk() {
    const { dispatch, srmCards: { allSourceEvent = [], sourceEventKeys = [] } = {} } = this.props;
    if (!isEmpty(sourceEventKeys)) {
      const notPurchase = [];
      for (let i = 0; i < allSourceEvent.length; i++) {
        if (sourceEventKeys.indexOf(allSourceEvent[i].clauseId) === -1) {
          notPurchase.push({
            code: 'SRM_SourceEvent',
            tenantId: getUserOrganizationId(),
            ...allSourceEvent[i],
          });
        }
      }
      if (isEmpty(notPurchase)) {
        notPurchase.push({ code: 'SRM_SourceEvent', tenantId: getUserOrganizationId() });
      }
      dispatch({
        type: 'srmCards/addPurchases',
        payload: notPurchase,
      }).then(res => {
        if (res) {
          this.querySrmSourceEvent();
          notification.success();
          this.hideModal();
        }
      });
    } else {
      message.warning(
        intl
          .get(`spfm.dashboard.view.message.confirm.selected.sourceEventField`)
          .d('请选择要显示的寻源条目！')
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

  /**
   * 获取路径查询信息
   *
   * @param {*} item
   * @returns
   * @memberof SrmSourceEvent
   */
  getPathSearch(item = {}) {
    let search = '';
    if (!item.statsExpression) {
      return search;
    }

    const { clauseCode = null, statsExpression = null } = item;
    const EndStatus = [
      'SPFM.BID_CHECK_PENDING',
      'SPFM.BID_EVALUATION_PENDING',
      'SPFM.BID_PENDING_RELEASE',
    ];
    const PassNoStatus = ['SPFM.BID_PENDING_CLARIFY'];
    const searchExpression = statsExpression;
    if (searchExpression.indexOf('#') < 0) {
      return search;
    }
    const strStatus = searchExpression.replace(/#sourceStatus==/g, '');
    let statusArr = strStatus.split(' or ') || [];
    if (statusArr.length) {
      if (EndStatus.includes(clauseCode)) {
        statusArr = statusArr.map(d => {
          return d ? d.replace(/_STATUS/g, '') : '';
        });
        const searchObj = statusArr.map(d => {
          return d ? d.replace(/'/g, '') : '';
        });
        search = `sourceStatus=${searchObj.join(',')}`;
      } else if (PassNoStatus.includes(clauseCode)) {
        return search;
      } else {
        const searchObj = statusArr.map(d => {
          return d ? d.replace(/'/g, '') : '';
        });
        search = `sourceStatus=${searchObj.join(',')}`;
      }
    }

    // const delSearchExpression = searchExpression.substring(searchExpression.indexOf('#') + 1);
    // const searchArr = delSearchExpression.split('==') || [];
    // if (searchArr.length) {
    //   const AllStatus = searchArr[1] ? searchArr[1] : '';
    //   if (EndStatus.includes(clauseCode)) {
    //     const allStatus = AllStatus ? AllStatus.replace(/_STATUS/g, '') : '';
    //     search = querystring.stringify({
    //       [searchArr[0]]: allStatus ? allStatus.replace(/'/g, '') : '',
    //     });
    //   } else if (PassNoStatus.includes(clauseCode)) {
    //     return search;
    //   } else {
    //     search = querystring.stringify({
    //       [searchArr[0]]: AllStatus ? AllStatus.replace(/'/g, '') : '',
    //     });
    //   }
    // }
    return search;
  }

  /**
   * 渲染列表数据
   *
   * @param {*} [item={}]
   * @returns
   * @memberof SrmSourceEvent
   */
  renderListItem(item = {}) {
    const search = this.getPathSearch(item);

    return (
      <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
        <Col span={20}>
          <Link to={`${item.menuCode}?${search}`} className={styles['card-entry']}>
            {item.clauseName}
          </Link>
        </Col>
        <Col span={4} className={styles['card-number']}>
          {item.docCount}
        </Col>
      </Row>
    );
  }

  render() {
    const {
      addLoading,
      srmCards: { srmSourceEventList = [], sourceEventKeys = [], allSourceEvent = [] },
    } = this.props;

    const { drawerVisible } = this.state;
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.sourceEvent.clauseName`).d('寻源条目'),
        dataIndex: 'clauseName',
        width: 100,
      },
    ];
    const rowSelection = {
      selectedRowKeys: sourceEventKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div className={styles.srouceEvent}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get('spfm.dashboard.view.srouceEvent.srouceSsrc').d('寻源')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          {srmSourceEventList.map(item => this.renderListItem(item))}
        </Row>
        <Modal
          title={intl
            .get(`spfm.dashboard.model.sourceEvent.modalTitle`)
            .d('选择需要展示的寻源条目')}
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
            dataSource={allSourceEvent}
            // pagination={operationRecordPagination}
            rowKey="clauseId"
            onChange={this.querySrmSourceEvent}
            columns={columns}
            rowSelection={rowSelection}
            bordered
          />
        </Modal>
      </div>
    );
  }
}
