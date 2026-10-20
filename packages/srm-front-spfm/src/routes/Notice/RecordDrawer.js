import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { Table } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';

import ApproveRecord from '_components/ApproveRecord';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

import styles from './index.less';

const { TabPane } = Tabs;
@connect(({ loading, notice }) => ({
  notice,
  publicLoading: loading.effects['notice/publicNotice'],
  fetchNoticeLoading: loading.effects['notice/fetchNotice'],
  historyLoading: loading.effects['notice/NoticeHistory'],
  approveHistoryLoading: loading.effects['notice/ApproveHistory'],
}))
@formatterCollections({ code: ['spfm.notice', 'hzero.common', 'component.operationRecord'] })

class RecordDetail extends React.PureComponent {
  componentDidMount() {
    this.handleHistory();
    this.handleApproveHistory();
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleHistory(page = {}) {
    const { dispatch, organizationId, noticeId } = this.props;
    // 操作记录数据
    dispatch({
      type: 'notice/NoticeHistory',
      payload: {
        page,
        organizationId,
        noticeId,
      },
    });
  }

  /**
  * 查询审批记录列表
  */
  @Bind()
  handleApproveHistory() {
    const { dispatch, businessKey } = this.props;
    // 操作记录数据
    dispatch({
      type: 'notice/ApproveHistory',
      payload: {
        businessKey,
      },
    });
  }

  render() {
    const {
      historyLoading,
      approveHistoryLoading,
      notice: {
        noticeHisotryList = [],
        approveHistoryList = [],
      },
    } = this.props;

    const actionColumns = [
      {
        title: intl.get('spfm.notice.model.actionDetail.realName').d('操作人'),
        width: 150,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.notice.model.actionDetail.processStatusMeaning').d('动作'),
        width: 80,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('spfm.notice.model.actionDetail.processDate').d('操作时间'),
        width: 150,
        dataIndex: 'processDate',
        render: dateTimeRender,
      },
    ];
    return (
      <Tabs defaultActiveKey="operationRecord" className={styles['record-drawer']}>
        <TabPane
          tab={intl.get('spfm.notice.model.notice.actionHistory').d('操作记录')}
          key="operationRecord"
        >
          <Table
            bordered
            loading={historyLoading}
            dataSource={noticeHisotryList}
            columns={actionColumns}
            onChange={this.handleHistory}
            pagination={false}
          />
        </TabPane>
        <TabPane
          tab={intl.get('hzero.common.status.approval').d('审批记录')}
          key="approveRecord"
        >
          <Spin spinning={approveHistoryLoading}>
            <ApproveRecord data={approveHistoryList} />
          </Spin>
        </TabPane>
      </Tabs>
    );
  }
}
export default RecordDetail;
