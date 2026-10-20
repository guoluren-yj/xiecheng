/**
 *  审批记录(合并了原来的审批记录和审批历史)
 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Timeline, Icon, Tag, Popover, Modal } from 'choerodon-ui';
import uuid from 'uuid/v4';
import { Attachment, Tooltip, Spin, Button, Modal as ModalPro } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isString, isNil } from 'lodash';
import moment from 'moment';
import classnames from 'classnames';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getCurrentUser, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '@/utils/config.js';

import ApprovalComment from '@/components/ApprovalComment';
import ApprovalReply from '@/components/ApprovalReply';
import { getProcessDefineConfig } from '@/services/taskService';
import CarbonCopyTag from './CarbonCopyTag';
import { approveNameRenderTemp, getAttachmentCountService } from './utils';
import CarbonCopyRecord from './CarbonCopyRecord';
import styles from './index.less';
import EmptySvg from './EmptySvg';

@formatterCollections({
  code: ['hzero.common', 'hwfp.common', 'hwfp.task', 'component.operationRecord'],
})
export default class ApproveRecord extends Component {
  constructor(props) {
    super(props);
    const { additionInfo } = getCurrentUser() || {};
    const { employeeCode } = additionInfo || {};
    this.haEmployeeCount = !isNil(employeeCode);
    this.state = {
      showMoreArr: [], // 点击了展开更多的记录，存储其index在数组中
      uuidCountObj: 'noQuery', // 记录uuid查询的附件数量，用于附件数0时隐藏dom
      showForecastFlag: props.forecastUnfold || false,
      showMoreReplyArr: [], // 存储展示更多回复记录
      defaultExpandFlag: props.commentUnfold || false,
      showModelStandardTime: props.showModelStandardTime || false, // 是否展示标准工时
    };
  }

  static defaultProps = {
    getProcessGlobalConfig: true,
    forecastUnfold: false,
    commentUnfold: false,
  };

  componentDidMount() {
    const { data = [] } = this.props;
    this.getAttachmentCount(data);
    if (this.props.getProcessGlobalConfig) {
      this.fetchProcessGlobalConfig();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { data = [], forecastUnfold, commentUnfold } = this.props;
    // 减少请求的次数
    if (isArray(data) && isArray(nextProps.data) && nextProps.data.length !== data.length) {
      this.getAttachmentCount(nextProps.data);
    }
    if (nextProps.forecastUnfold !== this.props.forecastUnfold) {
      this.setState({ showForecastFlag: nextProps.forecastUnfold });
    }
    if (nextProps.commentUnfold !== this.props.commentUnfold) {
      this.setState({ defaultExpandFlag: nextProps.commentUnfold });
    }
  }

  fetchProcessGlobalConfig = () => {
    getProcessDefineConfig().then((res) => {
      if (getResponse(res)) {
        this.setState({
          showForecastFlag: res.forecastUnfoldFlag === 1,
          defaultExpandFlag: res.commentUnfoldFlag === 1,
          showModelStandardTime: res.modelStandardTimeFlag === 1,
        });
      }
    });
  };

  @Bind()
  getAttachmentCount(data) {
    const transData = [];
    this.transformData(data).forEach((item) => {
      item.records.forEach((i) => {
        if (i.attachmentUuid) {
          transData.push({ bucketName: 'private-bucket', uuid: i.attachmentUuid });
        }
      });
    });
    if (transData.length > 0) {
      getAttachmentCountService(transData).then((res) => {
        this.setState({ uuidCountObj: res || {} });
      });
    }
  }

  @Bind()
  transformData(originData) {
    if (isEmpty(originData)) {
      return [];
    }
    const result = [];
    const delegateNodes = [];
    let data = [];
    originData.forEach((d) => {
      if (d.actType === 'startDelegateEvent') {
        delegateNodes.push({
          ...d,
          name: intl.get('hwfp.common.status.startDelegate').d('申请人转交'),
        });
      } else {
        data.push(d);
      }
    });
    if (delegateNodes.length > 0) {
      data = data.map((node) => {
        if (node.actType === 'startEvent') {
          const nodes = delegateNodes.filter((v) => v.processInstanceId === node.processInstanceId);
          node.startDelegateNodes = nodes;
        }
        return node;
      });
    }
    data.forEach((item, index) => {
      const {
        taskDefinitionKey,
        name,
        action,
        actType,
        startTime,
        endTime,
        approvalStrategy,
        nodeStatus,
        nodeStatusCode,
        rejectJumpType,
        rejectJumpFlag,
        forecastNode,
        startDelegateNodes,
        commentRecordList,
        commentReplyFlag,
        commentStartFlag,
        modelStandardTime,
      } = item;
      let record = item;
      let nodeName = name;
      const rejectJumpTypeMap = {
        'REFUSE_-1': intl
          .get('hwfp.common.view.rejectJumpType.refuse-1')
          .d('流程版本发生变更或发起的流程不一致，跳过已审批节点失败'),
        REFUSE_0: intl
          .get('hwfp.common.view.rejectJumpType.refuse0')
          .d('发起人再次提交的审批路径：从首个节点开始重新审批'),
        REFUSE_1: intl
          .get('hwfp.common.view.rejectJumpType.refuse2')
          .d('发起人再次提交的审批路径：跳过已审批节点直接到当前节点'),
        REFUSE_2: intl
          .get('hwfp.common.view.rejectJumpType.refuse2')
          .d('发起人再次提交的审批路径：跳过已审批节点直接到当前节点'),
        'REFUSE_-2': intl
          .get('hwfp.common.view.rejectJumpType.refuse-2')
          .d('流程使用的跳转条件不一致，跳过已审批节点失败'),
        'REFUSE_-3': intl
          .get('hwfp.common.view.rejectJumpType.refuse-3')
          .d('流程跳转线执行的结果不一致，跳过已审批节点失败'),
        'REFUSE_-4': intl
          .get('hwfp.common.view.rejectJumpType.refuse-4')
          .d('流程强制性校验的变量值出现不一致，跳过已审批节点失败'),
        'REBUT_-1': intl
          .get('hwfp.common.view.rejectJumpType.rebut-1')
          .d('流程版本发生变更或发起的流程不一致，跳过已审批节点失败'),
        REBUT_0: intl
          .get('hwfp.common.view.rejectJumpType.rebut0')
          .d('驳回节点人员重审后的路径：从驳回节点后重新审批'),
        REBUT_1: intl
          .get('hwfp.common.view.rejectJumpType.rebut1')
          .d('驳回节点人员重审后的路径：跳过中间节点直接到当前节点'),
        REBUT_2: intl
          .get('hwfp.common.view.rejectJumpType.rebut2')
          .d('重审后的路径为跳过中间节点直接到当前节点'),
        'REBUT_-2': intl
          .get('hwfp.common.view.rejectJumpType.rebut-2')
          .d('流程使用的跳转条件不一致，跳过已审批节点失败'),
        'REBUT_-3': intl
          .get('hwfp.common.view.rejectJumpType.rebut-3')
          .d('流程跳转线执行的结果不一致，跳过已审批节点失败'),
        'REBUT_-4': intl
          .get('hwfp.common.view.rejectJumpType.rebut-4')
          .d('流程强制性校验的变量值出现不一致，跳过已审批节点失败'),
      };
      if (actType === 'startEvent') {
        nodeName = intl.get('hzero.common.approve.record.start').d('提交审批');
      } else if (actType === 'endEvent') {
        nodeName = intl.get('hzero.common.text.endEvent').d('结束');
      } else if (actType === 'CommentCarbonCopy') {
        nodeName = intl.get('hzero.common.text.comment').d('评论');
      } else if (!action) {
        record = {
          ...record,
          actionText: intl.get('hzero.common.view.message.approvaling').d('审批中'),
        };
      } else {
        const { actionText } = approveNameRenderTemp(action);
        record = {
          ...record,
          actionText,
          actionColor:
            action.toLowerCase() === 'approved'
              ? 'green'
              : action.toLowerCase() === 'rejected'
              ? 'red'
              : 'blue',
        };
      }
      // 单一和并行网关全不满足，不显示结束
      if (actType === 'endEvent' && !taskDefinitionKey && forecastNode) {
        nodeName = name;
      } else if (actType === 'endEvent' && taskDefinitionKey && forecastNode) {
        // 有且仅有一个结束节点时，显示结束节点
        if (data.length > 1) {
          return;
        }
      }
      const target = index < 1 ? null : data[index - 1];

      if (
        !target ||
        taskDefinitionKey !== target.taskDefinitionKey ||
        actType === 'CommentCarbonCopy'
      ) {
        const node = {
          key: taskDefinitionKey,
          name: nodeName,
          actType,
          startTime,
          endTime,
          approvalStrategy,
          nodeStatus,
          nodeStatusCode,
          action,
          commentReplyFlag,
          commentStartFlag,
          records: [record],
          commentNum: commentRecordList ? commentRecordList.length : 0,
          isComment: actType === 'CommentCarbonCopy',
          isJump: action === 'Jump',
          isRejected: action === 'Rejected',
          rejectJumpType: rejectJumpType
            ? rejectJumpTypeMap[`${rejectJumpType}_${rejectJumpFlag}`]
            : undefined,
          forecastNode,
          modelStandardTime,
        };
        if (node.actType === 'startEvent') {
          node.startDelegateNodes = startDelegateNodes;
        }
        result.push(node);
      } else {
        const lastRecord = result.pop();
        if (lastRecord.actType === 'CommentCarbonCopy') {
          result.push(lastRecord);
        } else {
          const newRecords = (lastRecord.records || []).concat(record);
          const nodeStatusArr = [];
          const nodeStatusCodeArr = [];
          const actionArr = [];
          const rejectJumpTypeArr = [];
          newRecords.forEach((recordItem) => {
            nodeStatusArr.push(recordItem.nodeStatus);
            nodeStatusCodeArr.push(recordItem.nodeStatusCode);
            actionArr.push(recordItem.action);
            // 收集子集驳回数据
            rejectJumpTypeArr.push(
              rejectJumpTypeMap[`${recordItem.rejectJumpType}_${recordItem.rejectJumpFlag}`]
            );
          });
          const node = {
            ...lastRecord,
            endTime,
            approvalStrategy,
            nodeStatus: nodeStatusArr.includes(null) ? null : nodeStatus,
            nodeStatusCode: nodeStatusCodeArr.includes(null) ? null : nodeStatusCode,
            action: actionArr.includes(null) ? null : action,
            isJump: actionArr.includes(null) ? null : actionArr.includes('Jump'),
            isRejected: actionArr.includes(null) ? null : actionArr.includes('Rejected'),
            records: (lastRecord.records || []).concat(record),
            // 此处逻辑为，如果父级没有驳回， 就遍历子集获取驳回数据
            rejectJumpType: rejectJumpType
              ? rejectJumpTypeMap[`${rejectJumpType}_${rejectJumpFlag}`]
              : rejectJumpTypeArr.find((n) => !!n),
            forecastNode,
            modelStandardTime,
            commentStartFlag,
          };
          if (node.actType === 'startEvent') {
            node.startDelegateNodes = startDelegateNodes;
          }
          result.push(node);
        }
      }
    });
    return result;
  }

  @Bind()
  renderStartDelegateAssignee(record, item) {
    const { assigneeName, employeeResign } = record;
    const { startDelegateNodes } = item;
    const { oldAssigneeName, assigneeName: nowAssigneeName } = startDelegateNodes[0];
    return (
      <>
        <span style={{ textDecoration: 'line-through' }}>{oldAssigneeName}</span>
        <Icon
          type="navigate_next"
          style={{ fontSize: '14px', lineHeight: '18px', marginRight: '4px' }}
        />
        <span>{nowAssigneeName}</span>
      </>
    );
  }

  renderDelegateRecords = (records) => {
    const { length } = records;
    return records.map((record, index) => (
      <div>
        <div className={styles['delegate-record-title']}>
          {intl.get('hwfp.common.status.startDelegate').d('申请人转交')}
        </div>
        <div>
          <span className={styles['delegate-record-label']}>
            {intl.get('hwfp.common.model.apply.approver').d('审批人')}
          </span>
          <span className={styles['delegate-record-text']}>{record.assigneeName}</span>
          {record.employeeResign && (
            <Tag color="#E5E7EC" className={styles['approve-info-assigneeName-tag']}>
              {intl.get('hpfm.organization.model.position.leave').d('离职')}
            </Tag>
          )}
        </div>
        <div>
          <span className={styles['delegate-record-label']}>
            {intl.get('hzero.common.view.message.comment').d('审批意见')}
          </span>
          <span className={styles['delegate-record-text']}>{record.comment}</span>
        </div>
        <div>
          <span className={styles['delegate-record-label']}>
            {intl.get('hzero.common.view.message.cron.date').d('日期')}
          </span>
          <span className={styles['delegate-record-text']}>{dateTimeRender(record.endTime)}</span>
        </div>
        {record.attachmentUuid && (
          <div>
            <span
              className={styles['delegate-record-label']}
              style={{ lineHeight: '28px', verticalAlign: 'bottom' }}
            >
              {intl.get('hwfp.common.model.approval.file').d('附件')}
            </span>
            <span className={styles['delegate-record-text']}>
              <Attachment
                labelLayout="float"
                viewMode="popup"
                className={styles['approvalComment-attachment']}
                value={record.attachmentUuid}
                bucketName={PRIVATE_BUCKET}
                readOnly
              />
            </span>
          </div>
        )}
        {index < length - 1 && <div className={styles['delegate-record-line']} />}
      </div>
    ));
  };

  renderReplyRecords = (record, recordIndex) => {
    const { employeeName, creationDate, attachmentUuid, comment } = record;
    return (
      <div className={styles['reply-item']} key={recordIndex}>
        <div className={styles['reply-item-border']} />
        <div className={styles['reply-item-main']}>
          <div
            className={classnames(
              styles['reply-item-title'],
              'boot-component-approval-record-reply-item-title'
            )}
          >
            {intl.get('hzero.common.view.label.reply').d('回复')}
          </div>
          <div className={styles['reply-item-card']}>
            <div
              className={classnames(
                styles['reply-item-label'],
                'boot-component-approval-record-reply-item-label'
              )}
            >
              {intl.get('hzero.common.model.apply.sponsor').d('发起人')}
            </div>
            <div className={styles['reply-item-content']}>{employeeName}</div>
          </div>
          <div className={styles['reply-item-card']}>
            <div
              className={classnames(
                styles['reply-item-label'],
                'boot-component-approval-record-reply-item-label'
              )}
            >
              {intl.get('hzero.common.view.message.cron.date').d('日期')}
            </div>
            <div className={styles['reply-item-content']}>{dateTimeRender(creationDate)}</div>
          </div>
          <div className={styles['reply-item-card']}>
            <div
              className={classnames(
                styles['reply-item-label'],
                'boot-component-approval-record-reply-item-label'
              )}
            >
              {intl.get('hzero.common.label.content').d('内容')}
            </div>
            <div className={styles['reply-item-content']}>
              <ApprovalComment data={comment} />
            </div>
          </div>
          {attachmentUuid && (
            <div className={styles['reply-item-card']}>
              <div
                className={classnames(
                  styles['reply-item-label'],
                  'boot-component-approval-record-reply-item-label'
                )}
              >
                {intl.get('hwfp.common.model.approval.file').d('附件')}
              </div>
              <div className={styles['reply-item-content']}>
                <Attachment
                  labelLayout="float"
                  viewMode="popup"
                  className={styles['approvalComment-attachment']}
                  value={attachmentUuid}
                  bucketName={PRIVATE_BUCKET}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  renderCommentRecords = ({ record, recordIndex, parentRecordIndex, parentRecord }) => {
    const { showMoreReplyArr } = this.state;
    const {
      commentNum,
      assigneeName,
      comment,
      endTime,
      employeeResign,
      commentRecordList,
      commentRemindEmpNameList,
      attachmentUuid,
    } = record;
    return (
      <div
        className={styles['approve-record-timeline-item-records']}
        style={{ marginBottom: comment && endTime ? '0.04rem' : '' }}
      >
        <div style={{ width: '100%' }}>
          {record.assigneeName && (
            <div style={{ display: 'flex' }}>
              <span
                className={classnames(
                  styles['assignee-name'],
                  'boot-component-approval-record-assignee-name'
                )}
              >
                <span className={styles['assignee-name-label']}>
                  {intl.get('hzero.common.model.apply.sponsor').d('发起人')}
                </span>
                <Tooltip title={assigneeName}>
                  <span>{assigneeName}</span>
                  {employeeResign && (
                    <Tag color="#E5E7EC" className={styles['approve-info-assigneeName-tag']}>
                      {intl.get('hpfm.organization.model.position.leave').d('离职')}
                    </Tag>
                  )}
                </Tooltip>
              </span>
            </div>
          )}
          <div className={styles['approve-record-time']}>
            <span className={styles['approve-record-time-label']}>
              {intl.get('hzero.common.view.message.cron.date').d('日期')}
            </span>
            <span className={styles['approve-record-time-content']}>{dateTimeRender(endTime)}</span>
          </div>
          <div className={styles['approve-record-comment']}>
            <div className={styles['approve-record-comment-label']}>
              {intl.get('hzero.common.label.content').d('内容')}
            </div>
            <div
              className={styles['approve-record-comment-content']}
              style={{ color: '#000', width: '4rem' }}
            >
              {commentRemindEmpNameList && commentRemindEmpNameList.length > 0
                ? commentRemindEmpNameList.map((nameItem, nameItemIndex) => (
                    <span style={{ color: '#0161D5' }}>
                      @{nameItem}
                      {nameItemIndex !== commentRemindEmpNameList.length - 1 ? (
                        '、'
                      ) : (
                        <span style={{ marginRight: '4px' }} />
                      )}
                    </span>
                  ))
                : null}
              <ApprovalComment data={comment} className={styles['approvalComment-content']} />
              {parentRecord.commentReplyFlag === 1 &&
              parentRecord.isComment &&
              this.haEmployeeCount ? (
                <Button
                  color="primary"
                  funcType="link"
                  onClick={() => this.handleReply(parentRecord.records)}
                >
                  <Icon
                    type="message-o"
                    style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'text-bottom' }}
                  />
                  {intl.get('hzero.common.button.reply').d('回复')}
                </Button>
              ) : undefined}
            </div>
          </div>
          {attachmentUuid && (
            <div className={styles['approve-record-time']}>
              <div className={styles['approve-record-comment-label']}>
                {intl.get('hwfp.common.model.approval.file').d('附件')}
              </div>
              <div style={{ display: 'inline-block', margin: '-3px 0 0 0' }}>
                <Attachment
                  labelLayout="float"
                  viewMode="popup"
                  className={styles['approvalComment-attachment']}
                  value={attachmentUuid}
                  bucketName={PRIVATE_BUCKET}
                  readOnly
                />
              </div>
            </div>
          )}
          {this.checkExpandMore(parentRecordIndex, 'reply') &&
          commentRecordList &&
          commentRecordList.length > 0 ? (
            <div className={styles['approve-record-reply-list']}>
              {commentRecordList.map((commentRecord, commentRecordIndex) =>
                this.renderReplyRecords(commentRecord, commentRecordIndex)
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  renderRecords = ({ record, recordIndex, parentRecord, parentRecordIndex }) => {
    const attachmentProps = {
      labelLayout: 'float',
      viewMode: 'popup',
    };
    const hasStartDelegateNodes =
      record.actType === 'startEvent' &&
      parentRecord &&
      parentRecord.startDelegateNodes &&
      parentRecord.startDelegateNodes.length > 0;
    if (parentRecord.isComment) {
      return this.renderCommentRecords({ record, recordIndex, parentRecord, parentRecordIndex });
    }
    return (
      <div
        className={styles['approve-record-timeline-item-records']}
        style={{ marginBottom: !record.comment && !record.endTime ? '0.04rem' : '' }}
      >
        <div
          style={
            (record.action === 'Approved' || record.action === 'Rejected') && recordIndex > 0
              ? { width: '100%', marginTop: '0.16rem' }
              : { width: '100%' }
          }
        >
          {record.action !== 'Approved' &&
            record.action !== 'Rejected' &&
            record.action !== 'Jump' &&
            record.action && (
              <div
                style={{
                  display: 'flex',
                  color: 'rgba(0,0,0,0.85)',
                  lineHeight: '18px',
                  fontWeight: '600',
                  marginTop: recordIndex === 0 ? '' : '16px',
                  marginBottom: '4px',
                }}
              >
                {record.actionText}
              </div>
            )}
          {record.actType === 'startEvent' && (
            <div style={{ display: 'flex' }}>
              <span
                style={{
                  width: '60px',
                  marginRight: '0.16rem',
                  color: 'rgba(0,0,0,0.5)',
                }}
              >
                {intl.get('hzero.common.model.process.ID').d('流程标识')}
              </span>
              <span style={{ color: '#000' }}>{record.processInstanceId}</span>
            </div>
          )}
          {record.assigneeName && (
            <div
              style={{
                display:
                  record.action === 'CarbonCopy' || record.action === 'AutoCarbonCopy'
                    ? 'none'
                    : 'flex',
              }}
            >
              <span
                className={classnames(
                  styles['assignee-name'],
                  'boot-component-approval-record-assignee-name'
                )}
              >
                {record.assigneeName && (
                  <>
                    <span className={styles['assignee-name-label']}>
                      {record.actType === 'startEvent'
                        ? intl.get('hzero.common.model.apply.sponsor').d('发起人')
                        : intl.get('hzero.common.model.apply.approver').d('审批人')}
                    </span>
                    {hasStartDelegateNodes ? (
                      this.renderStartDelegateAssignee(record, parentRecord)
                    ) : (
                      <Tooltip title={record.assigneeName}>
                        <span>{record.assigneeName}</span>
                        {record.employeeResign && (
                          <Tag color="#E5E7EC" className={styles['approve-info-assigneeName-tag']}>
                            {intl.get('hpfm.organization.model.position.leave').d('离职')}
                          </Tag>
                        )}
                      </Tooltip>
                    )}
                    {hasStartDelegateNodes && (
                      <Popover
                        overlayClassName={styles['work-log-content']}
                        content={this.renderDelegateRecords(parentRecord.startDelegateNodes)}
                      >
                        <Button
                          className={styles['work-log-button']}
                          icon="work_log"
                          funcType="flat"
                          shape="circle"
                        />
                      </Popover>
                    )}
                  </>
                )}
              </span>
              <span
                style={{
                  color: `${
                    record.actType === 'startEvent'
                      ? '#3095F2'
                      : record.actType === 'endEvent'
                      ? '#F56349'
                      : record.action === 'delegate'
                      ? '#F88D10'
                      : record.action === 'Approved'
                      ? '#47B881'
                      : record.action === 'Rejected'
                      ? '#F56349'
                      : '#29bece'
                  }`,
                }}
                className={styles['status-icon']}
              >
                {record.action === 'Approved' || record.action === 'ApproveAndAddSign' ? (
                  <Icon type="check" style={{ color: '#47B881' }} />
                ) : record.action === 'Jump' || record.action === 'Rejected' ? (
                  <Icon type="close" style={{ color: '#F56349' }} />
                ) : null}
              </span>
              {record.ccList && record.ccList.length > 0 && (
                <CarbonCopyRecord ccList={record.ccList} />
              )}
            </div>
          )}
          {(['startEvent', 'endEvent'].includes(record.actType) || record.action) &&
            !record.forecastNode && (
              <div className={styles['approve-record-time']}>
                <span className={styles['approve-record-time-label']}>
                  {intl.get('hzero.common.view.message.cron.date').d('日期')}
                </span>
                <span className={styles['approve-record-time-content']}>
                  {dateTimeRender(record.endTime)}
                  {record.approveDuration && (
                    <span className={styles['approve-record-time-content-approveDuration']}>
                      {intl.get('hzero.common.model.apply.approveDuration').d('用时')}：
                      {this.renderApproveDuration(record)}
                    </span>
                  )}
                </span>
              </div>
            )}
          {record.action && (record.comment || record.attachmentUuid) && (
            <div className={styles['approve-record-comment']}>
              <div className={styles['approve-record-comment-label']}>
                {record.action === 'CarbonCopy' || record.action === 'AutoCarbonCopy'
                  ? intl.get('hzero.common.status.carbonCopy').d('抄送')
                  : intl.get('hzero.common.view.message.comment').d('审批意见')}
              </div>
              <div
                className={styles['approve-record-comment-content']}
                style={{
                  color:
                    record.action === 'Jump' || record.action === 'Rejected' ? '#F56349' : '#000',
                  width:
                    record.action === 'CarbonCopy' || record.action === 'AutoCarbonCopy'
                      ? 'auto'
                      : '4rem',
                }}
              >
                {record.carbonCopyInfo ? (
                  <CarbonCopyTag carbonCopyInfo={record.carbonCopyInfo} />
                ) : (
                  <ApprovalComment
                    key={record.attachmentUuid || uuid()}
                    data={record.comment}
                    attachment={() => {
                      if (record.attachmentUuid) {
                        const { uuidCountObj } = this.state;
                        if (!isString(uuidCountObj) && !uuidCountObj[record.attachmentUuid]) {
                          return false;
                        }
                      }
                      return (
                        record.attachmentUuid && (
                          <div style={{ display: 'inline-block', margin: '-3px 0 0 0' }}>
                            <Attachment
                              {...attachmentProps}
                              className={styles['approvalComment-attachment']}
                              value={record.attachmentUuid}
                              bucketName={PRIVATE_BUCKET}
                              readOnly
                            />
                          </div>
                        )
                      );
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 记录全部展开的records
  handleShowMoreArr = (index, type, item) => {
    const { showMoreArr, defaultExpandFlag } = this.state;
    if (defaultExpandFlag ? !type : type) {
      showMoreArr.push(index);
    } else {
      const removeIndex = showMoreArr.indexOf(index);
      if (removeIndex > -1) {
        showMoreArr.splice(removeIndex, 1);
      }
    }
    this.setState({ showMoreArr });
  };

  handleReply = (records) => {
    const { commentIdEncrypt, processInstanceId: procInstId, id } = (records || [])[0] || {};
    const { taskId, processInstanceId } = this.props;
    ModalPro.open({
      title: intl.get('hwfp.task.button.comment').d('评论'),
      footer: null,
      drawer: true,
      bodyStyle: {
        padding: 0,
        background: '#F8F9FB',
      },
      closable: true,
      children: (
        <ApprovalReply
          commentId={commentIdEncrypt}
          taskId={taskId || id}
          processInstanceId={processInstanceId || procInstId}
        />
      ),
    });
  };

  handleShowMoreReply = (index, type) => {
    const { showMoreReplyArr, defaultExpandFlag } = this.state;
    if (defaultExpandFlag ? !type : type) {
      showMoreReplyArr.push(index);
    } else {
      const removeIndex = showMoreReplyArr.indexOf(index);
      if (removeIndex > -1) {
        showMoreReplyArr.splice(removeIndex, 1);
      }
    }
    this.setState({ showMoreReplyArr });
  };

  renderApproveDuration = (record) => {
    const { startTime, endTime, approveDuration } = record;
    if (startTime && endTime) {
      const start = moment(startTime);
      const end = moment(endTime);
      const diffDay = end.diff(start, 'd');
      const diffHour = end.diff(start, 'h') - diffDay * 24;
      const diffSecond = end.diff(start, 's') % 60;
      const diffMinute = (end.diff(start, 'm') % 60) + (diffSecond > 0 ? 1 : 0);
      return `${diffDay} ${intl.get('hzero.common.date.unit.day').d('天')} ${diffHour} ${intl
        .get('hzero.common.date.unit.hours')
        .d('小时')} ${diffMinute} ${intl.get('hzero.common.date.unit.minute').d('分')}`;
    }
    return null;
  };

  handleComment = (dataSource) => {
    if (dataSource && dataSource.length) {
      const param = {};
      const processInstanceId = new Set(); // 取children的processInstanceId, 需去重
      const approvingRecord = dataSource.find(
        (i) =>
          i && !['startEvent', 'endEvent', 'CommentCarbonCopy'].includes(i.actType) && !i.action
      );
      if (
        approvingRecord &&
        approvingRecord.records &&
        approvingRecord.records[0] &&
        approvingRecord.records[0].id
      ) {
        // 取审批中节点的taskid，没有审批中节点就不传
        param.taskId = approvingRecord.records[0].id;
        if (approvingRecord.records[0].processInstanceId) {
          processInstanceId.add(approvingRecord.records[0].processInstanceId);
        }
      }
      dataSource.forEach((item) => {
        if (item.records && item.records.length) {
          item.records.forEach((record) => {
            if (record.processInstanceId) {
              processInstanceId.add(record.processInstanceId);
            }
          });
        }
      });
      param.processInstanceId = Array.from(processInstanceId);
      ModalPro.open({
        title: intl.get('hwfp.task.button.comment').d('评论'),
        footer: null,
        drawer: true,
        bodyStyle: {
          padding: 0,
          background: '#F8F9FB',
        },
        closable: true,
        children: <ApprovalReply {...param} />,
      });
    }
  };

  checkExpandMore = (key, type) => {
    const { defaultExpandFlag, showMoreArr, showMoreReplyArr } = this.state;
    // defaultExpandFlag-默认展开，为true时 数组存的是收起的元素，为false时存的是展开的元素
    if (type === 'reply') {
      return defaultExpandFlag ? !showMoreReplyArr.includes(key) : showMoreReplyArr.includes(key);
    }
    return defaultExpandFlag ? !showMoreArr.includes(key) : showMoreArr.includes(key);
  };

  render() {
    const {
      data = [],
      forecastData = [],
      forecastLoading = false,
      showForecastBtnFlag = false,
      noCommentBtn = false,
      hiddenEndEvent = false,
    } = this.props;
    const { showMoreArr, showForecastFlag, showMoreReplyArr, showModelStandardTime } = this.state;
    let dataSource = this.transformData(data);
    if (forecastData.length > 0) {
      const forecastDataSource = this.transformData(forecastData);
      if (showForecastFlag) {
        dataSource = forecastDataSource.concat(dataSource);
      }
    }
    return (
      <div className={styles['approve-record-collapse']}>
        {!noCommentBtn && dataSource[0] && dataSource[0].commentStartFlag === 1 ? (
          <Button
            funcType="link"
            style={{
              display: 'block',
              marginBottom: '16px',
              fontWeight: 600,
              height: '14px',
              lineHeight: '14px',
            }}
            onClick={(event) => this.handleComment(dataSource)}
          >
            <Icon
              type="textsms-o"
              style={{ marginRight: '4px', fontSize: '14px', fontWeight: 400 }}
            />
            {intl.get('srm.common.view.button.addComment').d('添加评论')}
          </Button>
        ) : null}
        {/* 若传参显示流程预测，那么不论流程预测有无数据，都显示按钮 */}
        {showForecastBtnFlag && (
          <>
            <div className={styles['approve-forecast']}>
              <div
                className="approve-forecast-font"
                onClick={() => {
                  this.setState({ showForecastFlag: !showForecastFlag });
                }}
              >
                {!showForecastFlag ? (
                  <>
                    <Icon type="expand_more" />
                    {intl.get('hwfp.common.view.button.forecast').d('流程预览')}
                  </>
                ) : (
                  <>
                    <Icon type="expand_less" />
                    {intl.get('hwfp.common.view.button.closeForecast').d('收起流程预览')}
                  </>
                )}
                <Tooltip
                  title={intl
                    .get('hwfp.common.view.button.closeForecast.info')
                    .d('流程预览仅供参考，实际结果可能会根据配置改变')}
                >
                  <Icon type="help" />
                </Tooltip>
              </div>
            </div>
            {showForecastFlag && <Spin spinning={forecastLoading} />}
          </>
        )}
        {dataSource.map((item, index) => (
          <>
            <div
              style={{
                display: hiddenEndEvent && item.actType === 'endEvent' && index !== 0 ? 'none' : '',
              }}
            >
              <div
                className={`${styles['approve-record-node']} ${
                  styles[
                    item.actType === 'CommentCarbonCopy'
                      ? 'timeline-deepBlue'
                      : item.actType === 'startEvent'
                      ? ''
                      : item.forecastNode
                      ? 'timeline-blue'
                      : item.actType === 'endEvent' && index === 0
                      ? 'timeline-black'
                      : item.nodeStatusCode?.toLowerCase() === 'approved'
                      ? 'timeline-green'
                      : item.nodeStatusCode?.toLowerCase() === 'rejected'
                      ? 'timeline-red'
                      : !item.nodeStatusCode
                      ? 'timeline-orange'
                      : ''
                  ]
                } ${
                  styles[
                    (item.actType === 'userTask' && !item.action) || item.forecastNode
                      ? 'timeline-border-dotted'
                      : ''
                  ]
                }`}
              >
                <Timeline>
                  <Timeline.Item color="blue">
                    <div
                      className={styles['approve-record-timeline-item']}
                      style={{ display: item.forecastNode === 'action' ? 'none' : '' }}
                    >
                      <div>
                        <div>
                          <div
                            className={classnames(
                              styles['approve-record-node-name'],
                              'boot-component-approve-record-node-name'
                            )}
                            style={{ display: 'flex' }}
                          >
                            {item.name && (
                              <Tooltip title={item.name}>
                                <span style={{ marginRight: '0.04rem' }}>{item.name}</span>
                              </Tooltip>
                            )}
                            {!item.isComment &&
                              item.actType === 'userTask' &&
                              (item.nodeStatusCode !== ' ' || item.forecastNode) && (
                                <>
                                  <Tag
                                    color={
                                      item.nodeStatusCode?.toLowerCase() === 'approved'
                                        ? '#47B881'
                                        : item.nodeStatusCode?.toLowerCase() === 'rejected'
                                        ? '#F56649'
                                        : item.forecastNode
                                        ? '#02A7F0'
                                        : !item.nodeStatusCode
                                        ? '#f88d10'
                                        : '#fff'
                                    }
                                    style={{
                                      borderColor:
                                        item.nodeStatusCode?.toLowerCase() !== 'approved' &&
                                        item.nodeStatusCode?.toLowerCase() !== 'rejected' &&
                                        item.nodeStatusCode
                                          ? '#979797'
                                          : '',
                                      color:
                                        item.nodeStatusCode?.toLowerCase() !== 'approved' &&
                                        item.nodeStatusCode?.toLowerCase() !== 'rejected' &&
                                        item.nodeStatusCode
                                          ? '#000'
                                          : '#fff',
                                    }}
                                    className={styles['approve-record-node-tag']}
                                  >
                                    {item.forecastNode
                                      ? intl.get('hwfp.common.view.title.pending').d('待审批')
                                      : item.nodeStatus ||
                                        intl
                                          .get('hzero.common.view.message.approvaling')
                                          .d('审批中')}
                                  </Tag>
                                </>
                              )}
                            {!item.isComment && item.approvalStrategy && (
                              <span className={styles['approve-record-node-tag-right']}>
                                {item.approvalStrategy}
                              </span>
                            )}
                            {!item.isComment && (item.isJump || item.isRejected) && (
                              <>
                                {item.isJump && (
                                  <Tag
                                    color="#F56649"
                                    className={styles['approve-record-node-tag']}
                                  >
                                    {intl.get('hzero.common.status.jump').d('驳回')}
                                  </Tag>
                                )}
                                {item.rejectJumpType && (
                                  <Tooltip title={item.rejectJumpType}>
                                    <span
                                      style={{
                                        color: '#868D9C',
                                        margin: '0 8px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        width: '3.2rem',
                                      }}
                                    >
                                      {item.rejectJumpType}
                                    </span>
                                  </Tooltip>
                                )}
                              </>
                            )}
                            {item.isComment && item.commentNum > 0 && (
                              <>
                                <Tag color="geekblue" className={styles['approve-record-node-tag']}>
                                  {item.commentNum} {intl.get('hzero.common.view.reply').d('回复')}
                                </Tag>
                                {!this.checkExpandMore(index, 'reply') ? (
                                  <Icon
                                    style={{
                                      fontWeight: 400,
                                      cursor: 'pointer',
                                      color: 'rgba(0,0,0,0.85)',
                                      marginLeft: '10px',
                                    }}
                                    type="expand_more"
                                    onClick={() => this.handleShowMoreReply(index, true)}
                                  />
                                ) : (
                                  <Icon
                                    style={{
                                      fontWeight: 400,
                                      cursor: 'pointer',
                                      color: 'rgba(0,0,0,0.85)',
                                      marginLeft: '10px',
                                    }}
                                    type="expand_less"
                                    onClick={() => this.handleShowMoreReply(index, false)}
                                  />
                                )}
                              </>
                            )}
                            {showModelStandardTime && item.modelStandardTime && (
                              <span className={styles['approve-record-node-tag-right']}>
                                {intl
                                  .get(
                                    'hwfp.common.view.message.current.preStage.modelStandardTime'
                                  )
                                  .d('标准用时')}
                                :{item.modelStandardTime || '1小时'}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.records.length > 3 && !this.checkExpandMore(index) ? (
                          <>
                            {item.records.slice(0, 3).map((record, recordIndex) =>
                              this.renderRecords({
                                record,
                                recordIndex,
                                parentRecord: item,
                                parentRecordIndex: index,
                              })
                            )}
                            <div
                              onClick={() => this.handleShowMoreArr(index, true, item)}
                              className={styles['approve-record-more-information']}
                            >
                              {intl.get('hzero.common.more.information').d('更多信息')}
                              <Icon type="expand_more" />
                            </div>
                          </>
                        ) : (
                          <>
                            {item.records.map((record, recordIndex) =>
                              this.renderRecords({
                                record,
                                recordIndex,
                                parentRecord: item,
                                parentRecordIndex: index,
                              })
                            )}
                            {item.records.length > 3 && this.checkExpandMore(index) && (
                              <div
                                onClick={() => this.handleShowMoreArr(index, false)}
                                className={styles['approve-record-more-information']}
                              >
                                {intl.get('hzero.common.button.up').d('收起')}
                                <Icon type="expand_less" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </div>
            </div>
          </>
        ))}
        {dataSource.length === 0 && (
          <div className="empty-img">
            <EmptySvg />
            <span className="desc boot-component-approval-record-empty-img-desc">
              {intl.get('component.operationRecord.view.tabs.approval.empty').d('暂无审批记录')}
            </span>
          </div>
        )}
      </div>
    );
  }
}
