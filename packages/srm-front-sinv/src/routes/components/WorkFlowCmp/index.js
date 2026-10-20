/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect, useState } from 'react';
// import { isEmpty } from 'lodash';
import { Spin, Table, Button, Tooltip, DataSet } from 'choerodon-ui/pro';
import { Tag, Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import request from 'utils/request';
import { Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

import formatterCollections from 'utils/intl/formatterCollections';

import { workFlowDS } from './indexDS';
import CarbonCopyTag from './components/CarbonCopyTag';
import {
  // approveNameRenderTemp,
  approveNameRender,
  getRejectJumpTypeMessage,
  renderDelegateRecords,
} from './utils';
import styles from './index.less';

const WorkFlowCmp = (props) => {
  const { id } = props;

  // const transformData = (originData) => {
  //   if (isEmpty(originData)) {
  //     return [];
  //   }
  //   const delegateNodes = [];
  //   let data = [];
  //   originData.forEach((d) => {
  //     if (d.actType === 'startDelegateEvent') {
  //       delegateNodes.push(d);
  //     } else {
  //       data.push(d);
  //     }
  //   });
  //   if (delegateNodes.length > 0) {
  //     data = data.map((node) => {
  //       if (node.actType === 'startEvent') {
  //         const nodes = delegateNodes.filter((v) => v.processInstanceId === node.processInstanceId);
  //         node.startDelegateNodes = nodes;
  //       }
  //       return node;
  //     });
  //   }
  //   setRowCombineArr();
  //   let currentKey = null;
  //   let repeatNum = 0;
  //   let repeatStart = 0;
  //   for (let i = 0; i < data.length; i++) {
  //     const record = data[i];
  //     // 根据name进行合并
  //     const { taskDefinitionKey } = record;
  //     if (currentKey === null) {
  //       currentKey = taskDefinitionKey;
  //       repeatNum = 1;
  //       repeatStart = i;
  //       this.rowCombineArr[repeatStart] = 1;
  //     } else if (currentKey === taskDefinitionKey) {
  //       this.rowCombineArr[i] = 0;
  //       repeatNum++;
  //     } else {
  //       currentKey = null;
  //       this.rowCombineArr[repeatStart] = repeatNum;
  //       repeatNum = 0;
  //       i--;
  //     }
  //     if (i === data.length - 1) {
  //       this.rowCombineArr[repeatStart] = repeatNum;
  //     }
  //   }
  //   return data;
  // };
  const workFlowDs = useMemo(() => new DataSet(workFlowDS()), [id]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    queryListChange();
  }, []);

  const queryListChange = async () => {
    try {
      setLoading(true);
      const queryData = filterNullValueObject({ rcvTrxHeaderId: id });
      const res = await request(
        `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/sinv/rcv/trx/rcv-action-record/list-history-approval`,
        {
          query: queryData,
          method: 'GET',
        }
      );
      if (getResponse(res)) {
        const data = [];
        const list = [...(res || [])];
        list.forEach((item) => {
          const arr = item?.historicTaskExtList || [];
          arr.forEach((i) => {
            data.push(i);
          });
        });
        workFlowDs.loadData(data);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'name',
      // renderer: ({ value, record }) => {
      //   const { actType } = record;
      //   const val = value;
      //   if (['startEvent', 'endEvent'].includes(actType)) {
      //     const { actionText } = approveNameRenderTemp(actType);
      //     val = actionText;
      //   }
      //   const obj = {
      //     children: val,
      //     props: {
      //       // rowSpan: this.rowCombineArr[record?.index],
      //     },
      //   };
      //   return obj;
      // },
    },
    {
      name: 'action',
      renderer: ({ value, record }) =>
        value ? (
          <>
            {approveNameRender(value)}
            {record?.get('rejectJumpType') &&
              (value.toLowerCase(value) === 'jump' || value.toLowerCase(value) === 'rejected') &&
              [-1, 0, 1, 2].indexOf(record?.get('rejectJumpType')) > -1 && (
                <Tooltip title={() => getRejectJumpTypeMessage(record)}>
                  <a>{intl.get('hwfp.common.view.message.RejectJumpPath').d('审批路径')}</a>
                </Tooltip>
              )}
          </>
        ) : ['startEvent', 'endEvent'].includes(record?.get('actType')) ? (
          approveNameRender(record?.get('actType'))
        ) : (
          <Tag color="geekblue">{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>
        ),
    },
    {
      name: 'assigneeName',
      renderer: ({ value, record }) => {
        const employeeResign = record?.get('employeeResign');
        const startDelegateNodes = record?.get('startDelegateNodes');
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
                content={renderDelegateRecords(startDelegateNodes)}
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
      name: 'comment',
      renderer: ({ value, record }) => {
        const carbonCopyInfo = record?.get('carbonCopyInfo');
        return carbonCopyInfo ? (
          <CarbonCopyTag carbonCopyInfo={carbonCopyInfo} showRowTooltip />
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
    { name: 'endTime' },
    { name: 'approveDuration' },
    { name: 'attachmentUuid' },
  ];
  return (
    <>
      <Spin spinning={loading}>
        <Content style={{ marginTop: 0, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles['page-title']}>
              {intl.get(`sinv.receiptWorkbench.view.title.detail.workflowApproval`).d('流程记录')}
            </h3>
          </div>
          <Table columns={columns} dataSet={workFlowDs} customizedCode="work_flow" />
        </Content>
      </Spin>
    </>
  );
};

export default formatterCollections({
  code: ['sinv.receiptWorkbench', 'hwfp.common', 'hwfp.monitor'],
})(WorkFlowCmp);

// export default WorkFlowCmp;
