/**
 *  待办事项列表-详情
 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Timeline, Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import UploadModal from 'components/Upload';
import { BKT_HWFP } from 'utils/config';
import intl from 'utils/intl';

import { approveNameRenderTemp } from '@/utils/util';
import ApprovalComment from '../../../components/ApprovalComment';
import styles from './index.less';

export default class ApproveRecord extends Component {
  @Bind()
  transformData(data) {
    if (isEmpty(data)) {
      return [];
    }
    const result = [];
    data.forEach((item, index) => {
      const { taskDefinitionKey, name, action, actType, startTime, endTime } = item;
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
        result.push({
          key: taskDefinitionKey,
          name: nodeName,
          actType,
          startTime,
          endTime,
          records: [record],
        });
      } else {
        const lastRecord = result.pop();
        result.push({
          ...lastRecord,
          endTime,
          records: (lastRecord.records || []).concat(record),
        });
      }
    });
    return result;
  }

  render() {
    const { data = [] } = this.props;
    const dataSource = this.transformData(data);
    return (
      <div className={styles['approve-record-collapse']}>
        {dataSource.map((item) => (
          <div>
            <div className={styles['approve-record-node']}>
              <Timeline pending={item.actType !== 'endEvent' && ' '}>
                <Timeline.Item color="blue">
                  <div className={styles['approve-record-timeline-item']}>
                    <div>
                      <div
                        style={{
                          color: '#333',
                          fontWeight: 600,
                        }}
                      >
                        <div className={styles['approve-record-node-name']}>{item.name}</div>
                      </div>
                      {item.records.map((record) => (
                        <div style={{ display: 'flex', marginTop: '10px' }}>
                          <div
                            className={styles['assignee-avatar']}
                            style={{ display: record.actType === 'endEvent' ? 'none' : '' }}
                          >
                            {record.assigneeName && record.assigneeName.slice(0, 1)}
                          </div>
                          <div
                            style={{
                              margin: record.actType === 'endEvent' ? '-29px 0 0 52px' : '',
                            }}
                          >
                            {record.assigneeName && (
                              <div>
                                <div style={{ display: 'inline-flex' }}>
                                  <span
                                    style={{
                                      marginRight: '10px',
                                    }}
                                    className={styles['assignee-name']}
                                  >
                                    {record.assigneeName && (
                                      <Tooltip title={record.assigneeName}>
                                        <span>{record.assigneeName}</span>
                                      </Tooltip>
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
                                      fontSize: '13px',
                                      marginRight: '10px',
                                    }}
                                  >
                                    {['endEvent'].includes(record.actType)
                                      ? null
                                      : ['startEvent'].includes(record.actType)
                                      ? `[${intl.get('hzero.common.button.submit').d('提交')}]`
                                      : `[${record.actionText}]`}
                                  </span>
                                  {record.attachmentUuid && (
                                    <div>
                                      {/* <span className={styles['approve-record-timeline-label']}>
                                        {intl.get('hwfp.common.model.approval.file').d('附件')}
                                      </span> */}
                                      <UploadModal
                                        attachmentUUID={record.attachmentUuid}
                                        bucketName={BKT_HWFP}
                                        bucketDirectory="hwfp01"
                                        viewOnly
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {record.action && (
                              <div className={styles['approve-record-comment']}>
                                <div className={styles['approve-record-comment-label']}>
                                  {intl.get('hwfp.task.view.message.comment').d('审批意见')}
                                </div>
                                <div
                                  className={styles['approve-record-comment-content']}
                                  style={{ color: 'rgba(0,0,0,0.5)' }}
                                >
                                  <ApprovalComment data={record.comment} />
                                </div>
                              </div>
                            )}

                            <div
                              style={{
                                display: 'inline-block',
                                color: 'rgba(0,0,0,0.5)',
                                marginTop: record.actType === 'endEvent' ? '-24px' : '',
                              }}
                            >
                              {['startEvent', 'endEvent'].includes(record.actType) || record.action
                                ? record.endTime
                                : null}
                            </div>
                          </div>
                        </div>
                      ))}
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
