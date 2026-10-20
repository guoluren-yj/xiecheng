/**
 * OperatingRecord 操作记录页面
 * @date: 2018-9-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Tooltip, Tabs, Tag } from 'hzero-ui';
import { approveNameRender, dateTimeRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const { TabPane } = Tabs;

@formatterCollections({
  code: ['sslm.operatingRecord', 'hwfp.common'],
})
@connect(({ loading, operatingRecord }) => ({
  operatingRecord,
  loading: loading.effects['operatingRecord/fetchRecordList'],
  reviewLoading: loading.effects['operatingRecord/fetchReviewList'],
}))
export default class OperatingRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabKey: 'operationRecord',
    };
  }

  /**
   * 操作记录页面
   * @extends {Component} - React.Component
   * @reactProps {Object} recordList - 数据源
   * @reactProps {Object} loading - 数据加载是否完成
   * @reactProps {Object} form - 表单对象
   * * 需要传的值
   * @reactProps {Number} investgHeaderId 模板头Id
   * @reactProps {Number} tenantId 租户Id
   * @reactProps {Function} onShowOperatingRecord 控制是否显隐
   */

  componentDidMount() {
    this.fetchRecordList({}, 'all');
  }

  // 组件卸载清空list
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'operatingRecord/clearRecordList',
    });
  }

  /**
   * 查询调查表审批记录
   *
   */
  @Bind()
  fetchRecordList(pageInfo = {}, activeKey) {
    const {
      dispatch,
      investgHeaderId,
      organizationId,
      businessKeyList,
      isShowReviewRecord = true,
    } = this.props;
    const { tabKey } = this.state;
    const currentTabKey = activeKey || tabKey;
    const { size, pageSizeOptions, ...params } = pageInfo || {};
    if (currentTabKey === 'all') {
      dispatch({
        type: 'operatingRecord/fetchRecordList',
        payload: {
          investgHeaderId,
          organizationId,
          page: isEmpty(params) ? {} : params,
          ...params,
        },
      });

      if (isShowReviewRecord && !isEmpty(businessKeyList)) {
        dispatch({
          type: 'operatingRecord/fetchReviewList',
          payload: {
            organizationId,
            ...params,
            needMerge: true,
            businessKeyList,
          },
        });
      }
    }
    if (currentTabKey === 'operationRecord') {
      dispatch({
        type: 'operatingRecord/fetchRecordList',
        payload: {
          investgHeaderId,
          organizationId,
          page: isEmpty(params) ? {} : params,
          ...params,
        },
      });
    }
  }

  @Bind()
  showModal() {
    this.props.onShowOperatingRecord();
  }

  /**
   * 切换 tab 并请求数据
   * @param {string} activeKey - 当前 tab 的key
   */
  @Bind()
  handleTabChange(activeKey = '') {
    this.setState({
      tabKey: activeKey,
    });
  }

  render() {
    const {
      loading,
      reviewLoading,
      historyVisible,
      operatingRecord: { recordList = {}, recordPagination = {}, reviewList = {} },
      isShowReviewRecord = true,
    } = this.props;

    const columns = [
      {
        title: intl.get('sslm.operatingRecord.model.operatingRecord.processUserName').d('操作人'),
        width: 100,
        dataIndex: 'processUserName',
      },
      {
        title: intl.get('sslm.operatingRecord.model.operatingRecord.processTime').d('操作时间'),
        width: 100,
        dataIndex: 'processDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        width: 150,
        align: 'left',
        dataIndex: 'processRemark',
        render: text => <Tooltip title={text}>{text}</Tooltip>,
      },
    ];

    const actionType = {
      startEvent: intl.get('hzero.common.text.startEvent').d('开始'),
      userTask: intl.get('hzero.common.text.userTask').d('审批中'),
      endEvent: intl.get('hzero.common.text.endEvent').d('结束'),
    };
    const reviewColumns = [
      {
        key: 'name',
        title: intl.get('sslm.operatingRecord.model.approveHistory.approvalNode').d('审批节点'),
        dataIndex: 'name',
        render: (val, { actType }) => val || actionType[actType],
      },
      {
        key: 'action',
        title: intl.get('sslm.operatingRecord.model.approveHistory.action').d('审批动作'),
        dataIndex: 'action',
        render: (action, { actType }) => {
          if (action) {
            return approveNameRender(action);
          } else if (actType === 'startEvent') {
            return <Tag color="green">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
          } else if (actType === 'endEvent') {
            return <Tag>{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
          } else if (actType) {
            return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
          } else {
            return '';
          }
        },
      },
      {
        key: 'assigneeName',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeName').d('审批人'),
        dataIndex: 'assigneeName',
      },
      {
        key: 'comment',
        title: intl.get('sslm.operatingRecord.model.approveHistory.comment').d('审批意见'),
        dataIndex: 'comment',
      },
      {
        key: 'endTime',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeDate').d('审批时间'),
        dataIndex: 'endTime',
        render: dateTimeRender,
      },
    ];

    return (
      <React.Fragment>
        <Modal visible={historyVisible} onCancel={this.showModal} footer={null} width={800}>
          <Tabs animated={false} defaultActiveKey="operationRecord">
            <TabPane
              tab={intl.get('sslm.operatingRecord.view.operatingRecord.record').d('操作记录')}
              key="operationRecord"
            >
              <Table
                loading={loading}
                dataSource={recordList.content}
                pagination={recordPagination}
                rowKey="recordId"
                onChange={page => this.fetchRecordList(page, 'operationRecord')}
                columns={columns}
                bordered
              />
            </TabPane>
            {isShowReviewRecord && (
              <TabPane
                tab={intl.get('sslm.operatingRecord.view.reviewRecord.record').d('审批记录')}
                key="reviewRecord"
              >
                <Table
                  loading={reviewLoading}
                  dataSource={reviewList}
                  pagination={null}
                  rowKey="recordId"
                  columns={reviewColumns}
                  bordered
                />
              </TabPane>
            )}
          </Tabs>
        </Modal>
      </React.Fragment>
    );
  }
}
