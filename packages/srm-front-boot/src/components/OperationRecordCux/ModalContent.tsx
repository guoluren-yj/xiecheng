import React, { useMemo, useEffect, useState } from 'react';
import { Tabs, Timeline, Icon, Collapse } from 'choerodon-ui';
import { DataSet, Spin, Table } from 'choerodon-ui/pro';
import type { Record } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';

import intl from 'utils/intl';

import { tableData } from './dataSourceDs';
import { actionTypeGetActionIcon, fetchHistoryApproval } from './utils';
import type { ModalContentProps } from './interfaceAll';
import './index.less';
import ApproveRecord from '../ApproveRecord';

const { TabPane } = Tabs;
const { Item } = Timeline;
const { Panel } = Collapse;

const columns = [
  {
    name: 'processUserIdMeaning',
  },
  {
    name: 'processDate',
  },
  {
    name: 'processStatusMeaning',
  },
  {
    name: 'remark',
  },
];

function ModalContent(props: ModalContentProps) {
  const {
    modalContentType,
    tableUrl,
    statusIconTypes,
    tableOtherParams,
    recordName,
    approvalShowFlag,
    businessKey,
    fetchApprovalUrl,
    method,
  } = props;

  const tableDataDs = useMemo(() => new DataSet(tableData()), []);

  const [approvalTabLoading, setApprovalTabLoading] = useState(false);
  const [approvalReocrd, setApprovalRecord] = useState([] as any[]);

  useEffect(() => {
    tableDataDs.setQueryParameter('url', tableUrl);
    tableDataDs.setQueryParameter('parmasOther', tableOtherParams);
    tableDataDs.query();
  }, []);

  useEffect(() => {
    if (approvalShowFlag) {
      try {
        setApprovalTabLoading(true);
        fetchHistoryApproval(fetchApprovalUrl, method, businessKey).then(res => {
          if(getResponse(res)) {
            setApprovalRecord([...(res || [])]);
          }
        }).finally(() => {
          setApprovalTabLoading(false);
        });
      } catch (e) {
        throw e;
      } finally {
        setApprovalTabLoading(false);
      }
    }
  }, [approvalShowFlag]);

  const getApprovalColor = (status: string) => {
    return status === 'APPROVED' ? '#47B881' : status === 'APPROVE_REJECTED' ? '#F56349' : '';
  };

  /**
   * processedByName - 操作人
   * processStatus - 操作动作(英文大写)
   * processStatusMeaning  - 操作动作翻译
   * name | recordName - 具体名称【比如单据名称，模块名称】 recordName: 自定义名称
   * receiptName - 接收人名称 【例如 A(processedByName) 提交了【单据】给 B(receiptName)】
   * processDate：操作时间
   */

  const renderActionHeader = (record: Record) => {
    const {
      processStatus = '',
      processedByName = '',
      processStatusMeaning = '',
      name = '',
      receiptName = '',
    } = record.get(['processStatus', 'processedByName', 'processStatusMeaning', 'name', 'processDate', 'receiptName']);
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <>
        <Icon
          type={
            actionTypeGetActionIcon(processStatus, statusIconTypes) || 'disabled_by_default'
          }
        />
        <div className="actionTab-header">
          <span className='action-name'>{processedByName}</span>
          <span className="action-words" style={{ color: getApprovalColor(processStatus) }}>
            {processStatusMeaning}{intl.get('scux.operationRecordNew.model.le').d('了')}
          </span>
          <span style={{ fontSize: '13px' }}>【{name || recordName}】</span>
          {receiptName && <span>{intl.get('scux.operationRecordNew.model.gei').d('给')}{receiptName}</span>}
        </div>
      </>
    );
  };

  const renderActionDetail = (record: Record) => {
    return (
      <div className="action-words" style={{marginLeft: '16px'}}>
        <span>{intl.get('scux.operationRecordNew.model.remark').d('备注')}</span>
        <span>{record.get('remark')}</span>
      </div>
    );
  };

  const OperationRender = observer((props1: {dataSet: DataSet}) => {
    return (
      <Spin dataSet={props1.dataSet}>
        <Timeline className='common-timeline-sitf'>
          {props1.dataSet.map((record: Record) => {
            const {processDate, remark} = record.get(['processDate', 'remark']);
            return (
              <Item color='#E5E5E5'>
                <Collapse bordered={false} expandIconPosition="right">
                  <Panel header={renderActionHeader(record)} key={record.get('id')} showArrow={!isEmpty(remark)} disabled={isEmpty(remark)}>
                    {renderActionDetail(record)}
                  </Panel>
                  <div className="action-words" style={{marginLeft: '33px', paddingBottom: '10px', borderBottom: '0.01rem solid #e0e0e0'}}>{processDate}</div>
                </Collapse>
              </Item>
            );
          })}
        </Timeline>
      </Spin>
    );
  });

  // 渲染审批记录
  const renderApprovalContent = () => {
    if (approvalReocrd && approvalReocrd.length > 0) {
      const historicTaskExtLists = [].concat(...approvalReocrd.map(item => item.historicTaskExtList || []));
      return (
        <Spin spinning={approvalTabLoading}>
          {/* {approvalReocrd.map((ele) => ( */}
          <Collapse
            expandIconPosition="text-right"
            bordered={false}
            defaultActiveKey={[approvalReocrd[0].id]}
            expandIcon={({ isActive }) => {
                return (
                  <Icon
                    type={isActive ? 'expand_less' : 'expand_more'}
                    style={{ marginBottom: '2px' }}
                  />
                );
              }}
            className="approve-header"
          >
            <Panel
              header={<h3 style={{ fontWeight: 500, display: 'inline-block' }}>{approvalReocrd[0].processName}</h3>}
              key={approvalReocrd[0].id}
              style={{
                  border: 0,
                  color: '#2C50C7',
                  fontWeight: 500,
                }}
            >
              <ApproveRecord data={historicTaskExtLists.reverse()} />
            </Panel>
          </Collapse>
          {/* ))} */}
        </Spin>
      );
    }
  };

  return modalContentType === 'notabs' ? (
    <Table dataSet={tableDataDs} columns={columns} />
  ) : (
    <Tabs>
      <TabPane tab={intl.get('scux.operationRecordNew.view.title.operation.record').d('操作记录')} key="action" className='operation-record-modal-actionTab'>
        <OperationRender dataSet={tableDataDs} />
      </TabPane>
      {approvalShowFlag && (
        <TabPane tab={intl.get('scux.operationRecordNew.view.title.approval.record').d('审批记录')} key="approval" className='operation-record-modal-actionTab'>
          {renderApprovalContent()}
        </TabPane>
      )}
    </Tabs>
  );
}

export default ModalContent;
