/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { Table, Tooltip, Tag, Popover } from 'hzero-ui';
import { Button } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import UploadModal from '_components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
import { BKT_HWFP } from 'utils/config';

import { approveNameRender, approveNameRenderTemp } from '@/utils/util';
import CarbonCopyTag from '../components/CarbonCopyTag';
import styles from './index.less';

export default class ApproveHistory extends PureComponent {
  rowCombineArr = [];

  @Bind()
  transformData(originData) {
    if (isEmpty(originData)) {
      return [];
    }
    const delegateNodes = [];
    let data = [];
    originData.forEach((d) => {
      if (d.actType === 'startDelegateEvent') {
        delegateNodes.push(d);
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
    this.rowCombineArr = [];
    let currentKey = null;
    let repeatNum = 0;
    let repeatStart = 0;

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      // 根据name进行合并
      const { taskDefinitionKey } = record;
      if (currentKey === null) {
        currentKey = taskDefinitionKey;
        repeatNum = 1;
        repeatStart = i;
        this.rowCombineArr[repeatStart] = 1;
      } else if (currentKey === taskDefinitionKey) {
        this.rowCombineArr[i] = 0;
        repeatNum++;
      } else {
        currentKey = null;
        this.rowCombineArr[repeatStart] = repeatNum;
        repeatNum = 0;
        i--;
      }
      if (i === data.length - 1) {
        this.rowCombineArr[repeatStart] = repeatNum;
      }
    }
    return data;
  }

  @Bind()
  getRejectJumpTypeMessage(record = {}) {
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
    return record.rejectJumpType
      ? rejectJumpTypeMap[`${record.rejectJumpType}_${record.rejectJumpFlag}`]
      : undefined;
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

  /**
   * render
   * @returns React.element
   */
  render() {
    const { detail, historyApprovalRecords = [], mergeHistoryFlag, loading = false } = this.props;
    // eslint-disable-next-line
    const dataSource = !mergeHistoryFlag
      ? detail.historicTaskList
      : loading
      ? []
      : []
          .concat(...historyApprovalRecords.map((item) => item.historicTaskExtList || []))
          .concat(detail.historicTaskList || []);
    const columns = [
      {
        title: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
        dataIndex: 'name',
        width: 180,
        render: (value, record, index) => {
          const { actType } = record;
          let val = value;
          if (['startEvent', 'endEvent'].includes(actType)) {
            const { actionText } = approveNameRenderTemp(actType);
            val = actionText;
          }
          const obj = {
            children: val,
            props: {
              rowSpan: this.rowCombineArr[index],
            },
          };
          return obj;
        },
      },
      {
        title: intl.get('hwfp.common.model.approval.action').d('审批动作'),
        dataIndex: 'action',
        width: 120,
        render: (action, record) =>
          action ? (
            <>
              {approveNameRender(action)}
              {record.rejectJumpType &&
                (action.toLowerCase(action) === 'jump' ||
                  action.toLowerCase(action) === 'rejected') && (
                  <Tooltip title={() => this.getRejectJumpTypeMessage(record)}>
                    <a>{intl.get('hwfp.common.view.message.RejectJumpPath').d('审批路径')}</a>
                  </Tooltip>
                )}
            </>
          ) : ['startEvent', 'endEvent'].includes(record.actType) ? (
            approveNameRender(record.actType)
          ) : (
            <Tag color="geekblue">
              {intl.get('hwfp.common.view.message.approvaling').d('审批中')}
            </Tag>
          ),
      },
      {
        title: intl.get('hwfp.common.model.approval.owner').d('审批人'),
        dataIndex: 'assigneeName',
        width: 200,
        render: (value, record) => {
          const { employeeResign, startDelegateNodes } = record;
          return (
            <span>
              {value}
              {employeeResign && (
                <Tag color="#E5E7EC" className={styles['table-info-assigneeName-tag']}>
                  {intl.get('hpfm.organization.model.position.leave').d('离职')}
                </Tag>
              )}
              {startDelegateNodes && startDelegateNodes.length > 0 && (
                <Popover
                  overlayClassName={styles['work-log-content']}
                  content={this.renderDelegateRecords(startDelegateNodes)}
                >
                  <Button
                    className={styles['work-log-button']}
                    icon="work_log"
                    funcType="flat"
                    shape="circle"
                  />
                </Popover>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get('hwfp.common.model.approval.time').d('审批时间'),
        dataIndex: 'endTime',
        width: 180,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.common.model.approval.opinion', { title: '审批意见' }).d('审批意见'),
        dataIndex: 'comment',
        // width: 300,
        render: (value, record) => {
          return record.carbonCopyInfo ? (
            <CarbonCopyTag carbonCopyInfo={record.carbonCopyInfo} showRowTooltip />
          ) : (
            <Tooltip
              title={
                <pre
                  className={styles['comment-pre']}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  {value}
                </pre>
              }
              placement="topLeft"
              overlayClassName={styles.opinion}
            >
              {value}
            </Tooltip>
          );
        },
      },
      {
        title: intl.get('hwfp.common.model.approval.approveDuration').d('用时'),
        dataIndex: 'approveDuration',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.file').d('附件'),
        dataIndex: 'attachmentUuid',
        fixed: 'right',
        width: 150,
        render: (val, record) => {
          if (record.attachmentUuid) {
            return (
              <UploadModal
                attachmentUUID={val}
                bucketName={BKT_HWFP}
                bucketDirectory="hwfp01"
                viewOnly
              />
            );
          }
        },
      },
    ];
    return (
      <Table
        bordered
        // rowKey="id"
        loading={loading}
        pagination={false}
        dataSource={this.transformData(dataSource)}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
