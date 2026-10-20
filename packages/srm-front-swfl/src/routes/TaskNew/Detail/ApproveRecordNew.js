/* eslint-disable no-param-reassign */
/**
 *  待办事项列表-详情
 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { Timeline, Collapse, Tag, Button, Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import UploadModal from '_components/Upload';
import { BKT_HWFP } from 'utils/config';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { approveNameRenderTemp } from '@/utils/util';
import ApprovalComment from '../../components/ApprovalComment';
import styles from './index.less';

export default class ApproveRecord extends Component {
  @Bind()
  transformData(originData) {
    if (isEmpty(originData)) {
      return [];
    }
    const delegateNodes = [];
    const otherNodes = [];
    originData.forEach((d) => {
      if (d.actType === 'startDelegateEvent') {
        delegateNodes.push({
          ...d,
          name: intl.get('hwfp.common.status.startDelegate').d('申请人转交'),
        });
      } else {
        otherNodes.push(d);
      }
    });
    let data = otherNodes;
    if (delegateNodes.length > 0) {
      data = data.map((node) => {
        if (node.actType === 'startEvent') {
          const nodes = delegateNodes.filter((v) => v.processInstanceId === node.processInstanceId);
          node.startDelegateNodes = nodes;
        }
        return node;
      });
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
        startDelegateNodes,
      } = item;
      let record = item;
      let nodeName = name;
      if (actType === 'startEvent') {
        nodeName = intl.get('hwfp.common.status.start').d('开始');
      } else if (actType === 'endEvent') {
        nodeName = intl.get('hwfp.common.status.end').d('结束');
      } else if (!action) {
        record = {
          ...record,
          actionText: intl.get('hwfp.common.view.message.approvaling').d('审批中'),
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
        const node = {
          key: taskDefinitionKey,
          name: nodeName,
          actType,
          startTime,
          endTime,
          records: [record],
          startDelegateNodes,
        };
        result.push(node);
      } else {
        const lastRecord = result.pop();
        const node = {
          ...lastRecord,
          endTime,
          records: (lastRecord.records || []).concat(record),
          startDelegateNodes,
        };
        result.push(node);
      }
    });
    return result;
  }

  @Bind()
  renderDelegateRecords(records) {
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
        </div>
        <div>
          <span className={styles['delegate-record-label']}>
            {intl.get('hwfp.task.view.message.comment').d('审批意见')}
          </span>
          <span className={styles['delegate-record-text']}>{record.comment}</span>
        </div>
        <div>
          <span className={styles['delegate-record-label']}>
            {intl.get('hzero.common.view.message.cron.date').d('日期')}
          </span>
          <span className={styles['delegate-record-text']}>{record.endTime}</span>
        </div>
        {record.attachmentUuid && (
          <div>
            <span className={styles['delegate-record-label']}>
              {intl.get('hwfp.common.model.approval.file').d('附件')}
            </span>
            <span className={styles['delegate-record-text']}>
              <UploadModal
                attachmentUUID={record.attachmentUuid}
                bucketName={PRIVATE_BUCKET}
                viewOnly
              />
            </span>
          </div>
        )}
        {index < length - 1 && <div className={styles['delegate-record-line']} />}
      </div>
    ));
  }

  @Bind()
  renderAssigneeName(record, item) {
    const { actType, assigneeName } = record;
    const { startDelegateNodes } = item;
    if (actType === 'startEvent' && startDelegateNodes && startDelegateNodes.length > 0) {
      const { oldAssigneeName, assigneeName: nowAssigneeName } = startDelegateNodes[
        startDelegateNodes.length - 1
      ];
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
    } else {
      return assigneeName;
    }
  }

  render() {
    const { data = [] } = this.props;
    const dataSource = this.transformData(data);
    return (
      <Collapse
        bordered={false}
        activeKey={dataSource.map((item) => item.key)}
        className={styles['approve-record-collapse']}
      >
        {dataSource.map((item) => (
          <Collapse.Panel key={item.key} header={null} showArrow={false}>
            <div className={styles['approve-record-node']}>
              <div className={styles['approve-record-node-name']}>{item.name}</div>
              <Timeline pending={item.actType !== 'endEvent' && ' '}>
                {item.records.map((record) => (
                  <Timeline.Item color={record.actionColor || 'blue'}>
                    <div className={styles['approve-record-timeline-item']}>
                      <div>
                        <div
                          style={{
                            color: record.actionColor === 'red' ? '#f56349' : '#333',
                            fontWeight: 600,
                          }}
                        >
                          {['startEvent', 'endEvent'].includes(record.actType)
                            ? item.name
                            : record.actionText}
                        </div>
                        {record.assigneeName && (
                          <div>
                            <span className={styles['approve-record-timeline-label']}>
                              {intl.get('hwfp.task.model.task.handler').d('处理人')}
                            </span>
                            {this.renderAssigneeName(record, item)}
                            {record.employeeResign && (
                              <Tag
                                color="#E5E7EC"
                                className={styles['table-info-assigneeName-tag']}
                              >
                                {intl.get('hpfm.organization.model.position.leave').d('离职')}
                              </Tag>
                            )}
                            {record.actType === 'startEvent' &&
                              item.startDelegateNodes &&
                              item.startDelegateNodes.length > 0 && (
                                <Popover
                                  overlayClassName={styles['work-log-content']}
                                  content={this.renderDelegateRecords(item.startDelegateNodes)}
                                >
                                  <Button
                                    className={styles['work-log-button']}
                                    icon="work_log"
                                    funcType="flat"
                                    shape="circle"
                                  />
                                </Popover>
                              )}
                          </div>
                        )}
                        {record.action && (
                          <div className={styles['approve-record-comment']}>
                            <div className={styles['approve-record-comment-label']}>
                              {intl.get('hwfp.task.view.message.comment').d('审批意见')}
                            </div>
                            <div
                              style={{ color: record.actionColor === 'red' ? '#f56349' : '#333' }}
                              className={styles['approve-record-comment-content']}
                            >
                              <ApprovalComment data={record.comment} />
                            </div>
                          </div>
                        )}
                        {record.attachmentUuid && (
                          <div>
                            <span className={styles['approve-record-timeline-label']}>
                              {intl.get('hwfp.common.model.approval.file').d('附件')}
                            </span>
                            <UploadModal
                              attachmentUUID={record.attachmentUuid}
                              bucketName={BKT_HWFP}
                              bucketDirectory="hwfp01"
                              viewOnly
                            />
                          </div>
                        )}
                      </div>
                      <div className={styles['approve-record-timeline-time']}>
                        {['startEvent', 'endEvent'].includes(record.actType) || record.action
                          ? record.endTime
                          : null}
                        {record.approveDuration && (
                          <span className={styles['approve-record-timeline-time-approveDuration']}>
                            {intl.get('hwfp.common.model.approval.approveDuration').d('用时')}：
                            {record.approveDuration}
                          </span>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  }
}
