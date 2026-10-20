/**
 *  审批记录(合并了原来的审批记录和审批历史)
 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Timeline, Tooltip, Icon, Tag } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config.js';

import { approveNameRenderTemp } from '@/utils/util';
import ApprovalComment from '@/routes/components/ApprovalComment';
import CarbonCopyTag from '@/routes/components/CarbonCopyTag';
import CarbonCopyRecord from './CarbonCopyRecord';
import styles from './index.less';

@formatterCollections({ code: ['hzero.common', 'hwfp.common'] })
export default class ApproveRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreArr: [], // 点击了展开更多的记录，存储其index在数组中
    };
  }

  @Bind()
  transformData(data) {
    if (isEmpty(data)) {
      return [];
    }
    const result = [];
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
      };
      if (actType === 'startEvent') {
        nodeName = intl.get('hzero.common.approve.record.start').d('提交审批');
      } else if (actType === 'endEvent') {
        nodeName = intl.get('hzero.common.text.endEvent').d('结束');
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
      const target = index < 1 ? null : data[index - 1];

      if (!target || taskDefinitionKey !== target.taskDefinitionKey) {
        result.push({
          key: taskDefinitionKey,
          name: nodeName,
          actType,
          startTime,
          endTime,
          approvalStrategy,
          nodeStatus,
          nodeStatusCode,
          action,
          records: [record],
          isJump: action === 'Jump',
          isRejected: action === 'Rejected',
          rejectJumpType: rejectJumpType
            ? rejectJumpTypeMap[`${rejectJumpType}_${rejectJumpFlag}`]
            : undefined,
        });
      } else {
        const lastRecord = result.pop();
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

        result.push({
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
        });
      }
    });
    return result;
  }

  renderRecords = (record, recordIndex) => {
    const attachmentProps = {
      labelLayout: 'float',
      viewMode: 'popup',
    };
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
              <span className={styles['assignee-name']}>
                {record.assigneeName && (
                  <>
                    <span className={styles['assignee-name-label']}>
                      {record.actType === 'startEvent'
                        ? intl.get('hzero.common.model.apply.sponsor').d('发起人')
                        : intl.get('hzero.common.model.apply.approver').d('审批人')}
                    </span>
                    <Tooltip title={record.assigneeName}>
                      <span>{record.assigneeName}</span>
                    </Tooltip>
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
                {record.action === 'Approved' || record.action === 'ApprovedAndAddSign' ? (
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
          {(['startEvent', 'endEvent'].includes(record.actType) || record.action) && (
            <div className={styles['approve-record-time']}>
              <span className={styles['approve-record-time-label']}>
                {intl.get('hzero.common.view.message.cron.date').d('日期')}
              </span>
              <span className={styles['approve-record-time-content']}>
                {record.endTime}
                {record.approveDuration && (
                  <span className={styles['approve-record-time-content-approveDuration']}>
                    {intl.get('hzero.common.model.apply.approveDuration').d('用时')}：
                    {record.approveDuration}
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
                    data={record.comment}
                    attachment={() => {
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
  handleShowMoreArr = (index, type) => {
    const { showMoreArr } = this.state;
    if (type === 'add') {
      showMoreArr.push(index);
    } else {
      const removeIndex = showMoreArr.indexOf(index);
      if (removeIndex > -1) {
        showMoreArr.splice(removeIndex, 1);
      }
    }
    this.setState({ showMoreArr });
  };

  render() {
    const { data = [] } = this.props;
    const { showMoreArr } = this.state;
    const dataSource = this.transformData(data);
    return (
      <div className={styles['approve-record-collapse']}>
        {dataSource.map((item, index) => (
          <div
            style={{
              display: item.actType === 'endEvent' && index !== 0 ? 'none' : '',
            }}
          >
            <div
              className={`${styles['approve-record-node']} ${
                styles[
                  item.actType === 'startEvent'
                    ? ''
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
                styles[item.actType === 'userTask' && !item.action ? 'timeline-border-dotted' : '']
              }`}
            >
              <Timeline>
                <Timeline.Item color="blue">
                  <div className={styles['approve-record-timeline-item']}>
                    <div>
                      <div>
                        <div className={styles['approve-record-node-name']}>
                          {item.name && (
                            <Tooltip title={item.name}>
                              <span style={{ marginRight: '0.04rem' }}>{item.name}</span>
                            </Tooltip>
                          )}
                          {item.actType === 'userTask' && item.nodeStatusCode !== ' ' && (
                            <>
                              <Tag
                                color={
                                  item.nodeStatusCode?.toLowerCase() === 'approved'
                                    ? '#47B881'
                                    : item.nodeStatusCode?.toLowerCase() === 'rejected'
                                    ? '#F56649'
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
                                {item.nodeStatus ||
                                  intl.get('hzero.common.view.message.approvaling').d('审批中')}
                              </Tag>
                            </>
                          )}
                          {item.approvalStrategy && (
                            <span className={styles['approve-record-node-tag-right']}>
                              {item.approvalStrategy}
                            </span>
                          )}
                          {(item.isJump || item.isRejected) && (
                            <>
                              {item.isJump && (
                                <Tag color="#F56649" className={styles['approve-record-node-tag']}>
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
                        </div>
                      </div>
                      {item.records.length > 3 && !showMoreArr.includes(index) ? (
                        <>
                          {item.records
                            .slice(0, 3)
                            .map((record, recordIndex) => this.renderRecords(record, recordIndex))}
                          <div
                            onClick={() => this.handleShowMoreArr(index, 'add')}
                            className={styles['approve-record-more-information']}
                          >
                            {intl.get('hzero.common.more.information').d('更多信息')}
                            <Icon type="expand_more" />
                          </div>
                        </>
                      ) : (
                        <>
                          {item.records.map((record, recordIndex) =>
                            this.renderRecords(record, recordIndex)
                          )}
                          {item.records.length > 3 && showMoreArr.includes(index) && (
                            <div
                              onClick={() => this.handleShowMoreArr(index, 'reduce')}
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
        ))}
      </div>
    );
  }
}
