/**
 * MessageQuery - 消息查询列表
 * @date: 2018-7-29
 * @author: CJ <juan.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { Modal } from "choerodon-ui/pro";

import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';
import request from "hzero-front/lib/utils/request";

import ContentView from './ContentView';
import RecipientView from './RecipientView';
import ListTable from './ListTable';
import QueryForm from './QueryForm';
import EmailSendStatus from './EmailSendStatus';

/**
 * 消息查询数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} formValues - 查询表单值
 * @reactProps {Object} recordData - 表格中信息的一条记录
 * @return React.element
 */

function getRefFieldsValue(ref) {
  if (ref.current) {
    return ref.current.props.form.getFieldsValue();
  }
  return {};
}

@connect(({ messageQuery, loading }) => ({
  messageQuery,
  tenantRoleLevel: isTenantRoleLevel(),
  queryMessageLoading: loading.effects['messageQuery/queryMessageList'],
  queryRecipientLoading: loading.effects['messageQuery/queryRecipient'],
  queryContentLoading: loading.effects['messageQuery/queryContent'],
  queryErrorLoading: loading.effects['messageQuery/queryError'],
  deleteLoading: loading.effects['messageQuery/deleteMessage'],
  resendLoading: loading.effects['messageQuery/resendMessage'],
  batchRetryLoading: loading.effects['messageQuery/batchRetry'],
}))
@formatterCollections({ code: ['hmsg.messageQuery', 'entity.tenant', 'hmsg.common'] })
export default class MessageQuery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      contentVisible: false, // 内容和错误模态框是否可见
      recipientVisible: false, // 收件人模态框是否可见
      isContent: true, // 是否为内容
      recordData: {},
      selectedRows: [], // 选择的行数据
    };
    this.multiSearchFormRef = React.createRef();
  }

  tenantId = getCurrentOrganizationId();
  /**
   * 初始化数据
   *
   * @memberof MessageQuery
   */
  componentDidMount() {
    // this.handleQueryMessage();
    this.props.dispatch({
      type: 'messageQuery/init',
    });
    this.syncTenantId(this.tenantId);
  }

  queryEmailStatusPermission() {
    request(`/hmsg/v1/3rd/aliyun/email/permission?tenantId=${this.tenantId}`, {
      method: 'GET',
    }).then(res => {
      if (getResponse(res)) {
        if (res.hasPermission) {
          this.setState({ hasEmailStatusPermission: true });
        }
      }
    })
  }

  /**
   * 获取消息列表
   *
   * @param {*} [params={}]
   * @memberof MessageQuery
   */
  @Bind()
  handleQueryMessage(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryMessageList',
      payload: {
        ...params,
        oldTotalElements: params && params.total ? params.total : '',
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'messageQuery/queryMessageListPage',
          payload: {
            ...params,
            oldTotalElements: params && params.total ? params.total : '',
            needCountFlag: res.needCountFlag,
          },
        });
      }
    });
  }

  /**
   * 点击内容查看模态框
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenContentModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryContent',
      payload: record.messageId,
    });
    this.setState({
      isContent: true,
      contentVisible: true,
    });
  }

  /**
   * 确认内容和错误模态框
   *
   * @memberof MessageQuery
   */
  @Bind()
  handleOk() {
    const { isContent } = this.state;
    this.setState({
      contentVisible: false,
      isContent: !isContent,
    });
  }

  /**
   * 收件人查看数据
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenRecipientModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryRecipient',
      payload: record,
    });
    this.setState({
      recipientVisible: true,
      recordData: record,
    });
  }

  /**
   * 确认收件人模态框
   *
   * @memberof MessageQuery
   */
  @Bind()
  handleRecipientOk() {
    this.setState({
      recipientVisible: false,
    });
  }

  /**
   * 点击错误查看模态框
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenErrorModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryError',
      payload: record.transactionId,
    });
    this.setState({
      isContent: false,
      contentVisible: true,
    });
  }

  /**
   * 重试
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleResendMessage(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/resendMessage',
      payload: record.transactionId,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleMultiSearchFormSearch();
      }
    });
  }

  /**
   * 获取表单的值
   *
   * @param {*} values
   * @memberof MessageQuery
   */
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  /**
   * 表单查询
   */
  @Bind()
  handleMultiSearchFormSearch(params) {
    const fieldsValue = getRefFieldsValue(this.multiSearchFormRef);
    let values = fieldsValue;
    values = {
      startDate: fieldsValue.startDate
        ? fieldsValue.startDate.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      endDate: fieldsValue.endDate
        ? fieldsValue.endDate.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
    };
    this.handleQueryMessage(params || { ...fieldsValue, ...values });
  }

  @Bind()
  handleSelectChange(rows) {
    this.setState({ selectedRows: rows });
  }

  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    dispatch({
      type: 'messageQuery/deleteMessage',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleMultiSearchFormSearch();
      }
    });
  }

  @Bind()
  handlePageChange(pagination = {}, fieldsValue) {
    this.handleQueryMessage({
      page: pagination,
      ...fieldsValue,
    });
  }

  @Bind()
  handleBatchRetry() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    dispatch({
      type: 'messageQuery/batchRetry',
      payload: selectedRows.map(item => item.transactionId),
    }).then(res => {
      if (res) {
        const { success, failed } = res;
        notification.info({
          message: intl
            .get('hmsg.messageQuery.view.message.batchRecoveryResult', {
              success,
              failed,
            })
            .d(`成功${success}条, 失败${failed}条`),
        });
        this.handleMultiSearchFormSearch();
      }
    });
  }

  openEmailSendStatus = () => {
    Modal.open({
      title: intl.get('hmsg.messageQuery.common.emailSendStatus').d('邮件发送状态详情'),
      drawer: true,
      style: { width: 1000 },
      children: <EmailSendStatus tenantId={this.tenantId}/>,
      cancelText: intl.get("hzero.common.button.close").d("关闭"),
      cancelProps: {
        color: "primary",
      },
      footer: (ok, cancel) => {
        return cancel;
      },
    });
  }

  syncTenantId = (tenantId) => {
    this.tenantId = this.props.tenantRoleLevel ? getCurrentOrganizationId() : tenantId;
    this.setState({ hasEmailStatusPermission: false });
    if ([null, undefined].includes(tenantId)) return;
    this.queryEmailStatusPermission();
  }

  render() {
    const {
      queryMessageLoading,
      queryRecipientLoading,
      queryContentLoading,
      queryErrorLoading,
      resendLoading,
      deleteLoading = false,
      batchRetryLoading = false,
      match: { path },
      messageQuery: {
        messageData = {},
        content = {},
        recipientData = {},
        error = {},
        statusList = [],
        messageTypeList = [],
      },
      tenantRoleLevel,
    } = this.props;
    const {
      contentVisible,
      recipientVisible,
      isContent,
      selectedRows = [],
      recordData = {},
      formValues = {},
      hasEmailStatusPermission,
    } = this.state;
    const formProps = {
      messageTypeList,
      statusList,
      tenantRoleLevel,
      onQueryMessage: this.handlePageChange,
      onStoreFormValues: this.storeFormValues,
      wrappedComponentRef: this.multiSearchFormRef,
      onSearch: this.handleMultiSearchFormSearch,
      syncTenantId: this.syncTenantId,
    };
    const tableProps = {
      messageData,
      formValues,
      tenantRoleLevel,
      loading: queryMessageLoading,
      onSelectChange: this.handleSelectChange,
      onOpenRecipientModal: this.handleOpenRecipientModal,
      onOpenContentModal: this.handleOpenContentModal,
      onOpenErrorModal: this.handleOpenErrorModal,
      onQueryMessage: this.handleQueryMessage,
      onResendMessage: this.handleResendMessage,
      path,
      resendLoading,
    };
    const contentViewProps = {
      isContent,
      contentVisible,
      content,
      error,
      loading: queryContentLoading || queryErrorLoading || false,
      onOk: this.handleOk,
      path,
    };
    const recipientViewProps = {
      recipientVisible,
      recipientData,
      recordData,
      loading: queryRecipientLoading,
      onOk: this.handleRecipientOk,
      onOpenRecipientModal: this.handleOpenRecipientModal,
      path,
    };
    // 平台级，暂挂类型消息支持批量暂挂
    const showBatchRetry =
      !tenantRoleLevel &&
      !isEmpty(messageData) &&
      !isEmpty(messageData.content) &&
      messageData.content.every(item => item.trxStatusCode === 'I');
    return (
      <>
        <Header title={intl.get('hmsg.messageQuery.view.message.title').d('消息查询')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.delete`,
                type: 'button',
                meaning: '消息查询-删除',
              },
            ]}
            type="primary"
            icon="delete"
            onClick={this.handleDelete}
            disabled={selectedRows.length === 0}
            loading={deleteLoading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </ButtonPermission>
          {hasEmailStatusPermission && (
            <Button
              onClick={this.openEmailSendStatus}
            >
              {intl.get('hmsg.messageQuery.common.emailSendStatus').d('邮件发送状态详情')}
            </Button>
          )}
        </Header>
        <Content>
          <QueryForm {...formProps} />
          {showBatchRetry && (
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <Button
                loading={batchRetryLoading}
                disabled={selectedRows.length === 0}
                onClick={this.handleBatchRetry}
              >
                {intl.get('hmsg.messageQuery.view.button.batchRecovery').d('批量恢复')}
              </Button>
            </div>
          )}
          <ListTable {...tableProps} />
        </Content>
        <ContentView {...contentViewProps} />
        <RecipientView {...recipientViewProps} />
      </>
    );
  }
}
