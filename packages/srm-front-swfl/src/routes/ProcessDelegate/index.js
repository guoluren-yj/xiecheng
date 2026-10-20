import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { Modal, Tabs, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, isObject } from 'lodash';
import { connect } from 'dva';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryUUID } from 'services/api';
import { fetchFileCount } from '@/services/taskService';
import { approverTableDS, applicantTableDS } from '@/stores/processDelegateDS';

import ApproverProcess from './ApproverProcess';
import ApplicantProcess from './ApplicantProcess';
import DelegateModal from './DelegateModal';
import SettingModal from './SettingModal';
import styles from './index.less';

export const TAB_KEY = {
  approver: 'approver',
  applicant: 'applicant',
};

@formatterCollections({
  code: [
    'hwfp.processDelegate',
    'hwfp.task',
    'hwfp.automaticProcess',
    'hwfp.common',
    'hzero.common',
    'hpfm.organization',
  ],
})
@connect(({ processDelegate, loading }) => ({
  processDelegate,
  saving:
    loading.effects['processDelegate/delegateApprovalProcess'] ||
    loading.effects['processDelegate/delegateApplicantProcess'],
}))
@observer
export default class processDelegate extends Component {
  constructor(props) {
    super(props);
    this.approverTableDs = new DataSet(approverTableDS());
    this.applicantTableDs = new DataSet(applicantTableDS());
    this.state = {
      modalVisible: false,
      buttonLoading: false,
      attachmentUuid: '',
      tabKey: TAB_KEY.approver,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'processDelegate/queryProcessStatus' });
  }

  @Bind()
  refresh() {
    if (this.state.tabKey === TAB_KEY.approver) {
      this.approverTableDs.query();
    } else {
      this.applicantTableDs.query();
    }
  }

  @Bind()
  toogleModal() {
    const { modalVisible } = this.state;
    if (!modalVisible) {
      // 打开弹窗时，请求uuid
      this.handleUUID();
    } else {
      this.setState({ attachmentUuid: '' });
    }
    this.setState({ modalVisible: !modalVisible });
  }

  @Bind()
  handleSettingModal() {
    Modal.open({
      key: 'processDelegateSettingModal',
      drawer: true,
      title: intl.get('hwfp.task.automaticProcess.or.delegate').d('自动处理 / 转交设置'),
      style: {
        width: '1090px',
      },
      children: <SettingModal />,
    });
  }

  @Bind()
  handleUUID() {
    queryUUID({
      tenantId: getCurrentOrganizationId(),
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          attachmentUuid: result.content,
        });
      }
    });
  }

  @Bind()
  setAttachmentUuid = (value) => {
    this.setState({ attachmentUuid: value });
  };

  @Bind()
  delegate(targetEmployee, comment) {
    this.setState({ buttonLoading: true });
    const selectedApproverRows = this.approverTableDs.selected;
    const selectedApplicantRows = this.applicantTableDs.selected;
    const { attachmentUuid, tabKey } = this.state;
    fetchFileCount({ attachmentUUID: attachmentUuid }).then((response) => {
      const r = getResponse(response);
      if (r !== undefined) {
        const { dispatch } = this.props;
        let payload;
        if (tabKey === TAB_KEY.approver) {
          payload = {
            type: 'processDelegate/delegateApprovalProcess',
            params: {
              taskIdList: selectedApproverRows.map((item) => item.get('id')),
              sourceEmployeeList: selectedApproverRows.map((item) => item.get('assignee')),
              targetEmployee,
              comment,
              attachmentUuid: r > 0 ? attachmentUuid : null,
            },
          };
        } else {
          payload = {
            type: 'processDelegate/delegateApplicantProcess',
            params: {
              procInstIdList: selectedApplicantRows.map((item) => item.get('processInstanceId')),
              targetEmployee,
              comment,
              attachmentUuid: r > 0 ? attachmentUuid : null,
            },
          };
        }
        dispatch(payload).then((res) => {
          if (isObject(res) && isEmpty(res)) {
            notification.success();
            this.toogleModal();
            this.refresh();
          }
          this.setState({ buttonLoading: false });
        });
      }
    });
  }

  @Bind()
  handleChangeTab(tabKey) {
    this.setState({
      tabKey,
    });
  }

  @Bind()
  renderButton() {
    const { tabKey } = this.state;
    if (tabKey === TAB_KEY.approver) {
      return (
        <>
          <Button
            type="primary"
            onClick={this.toogleModal}
            disabled={!this.approverTableDs.selected.length}
          >
            {intl.get('hwfp.task.view.option.delegate', { name: '转交' }).d('转交')}
          </Button>
          <Button onClick={this.handleSettingModal}>
            {intl.get('hwfp.task.automaticProcess.or.delegate').d('自动处理 / 转交设置')}
          </Button>
        </>
      );
    } else {
      return (
        <Button
          type="primary"
          onClick={this.toogleModal}
          disabled={!this.applicantTableDs.selected.length}
        >
          {intl.get('hwfp.task.view.option.delegate', { name: '转交' }).d('转交')}
        </Button>
      );
    }
  }

  render() {
    const { modalVisible, buttonLoading, attachmentUuid, tabKey } = this.state;
    const {
      processDelegate: { processStatus = [] },
    } = this.props;
    const selectedRows =
      tabKey === TAB_KEY.approver ? this.approverTableDs.selected : this.applicantTableDs.selected;
    return (
      <>
        <Header title={intl.get('hwfp.processDelegate.view.message.title').d('流程转交')}>
          {this.renderButton()}
        </Header>
        <Content className={styles.content}>
          <Tabs activeKey={tabKey} onChange={this.handleChangeTab} flex>
            <Tabs.TabPane
              key={TAB_KEY.approver}
              tab={intl.get('hwfp.processDelegate.view.title.delegateByApprover').d('审批人转交')}
            >
              <ApproverProcess
                tabKey={tabKey}
                processStatus={processStatus}
                tableDs={this.approverTableDs}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key={TAB_KEY.applicant}
              tab={intl.get('hwfp.processDelegate.view.title.applicantByApprover').d('申请人转交')}
            >
              <ApplicantProcess
                tabKey={tabKey}
                processStatus={processStatus}
                tableDs={this.applicantTableDs}
              />
            </Tabs.TabPane>
          </Tabs>
          <DelegateModal
            tabKey={tabKey}
            visible={modalVisible}
            onSubmit={this.delegate}
            buttonLoading={buttonLoading}
            selectedRows={selectedRows}
            handleClose={this.toogleModal}
            attachmentUuid={attachmentUuid}
            setAttachmentUuid={this.setAttachmentUuid}
          />
        </Content>
      </>
    );
  }
}
