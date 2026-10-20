/**
 * ModalContent
 * 操作记录组件弹框内容
* @date: 2022-03-02
 * @author: zxy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useMemo } from 'react';
import {Tabs, Timeline, Collapse, Icon, Spin } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import FilterBar from '../FilterBarTable/FilterBar';

import { queryActions, fetchHistoryApproval } from './operationRecordService';
import { actionTypeGetActionIcon } from './utils';
import ApproveRecord from '../ApproveRecord';
import operaTableDS from './store/operationDS';
import CuxExcelExportPro from './CuxExcelExportPro';


interface ModalContentProps {
  modal?: any;
  businessKey?: string;
  operationUrl?: string;
  operationParams?: any,
  commentRecordFlag?: boolean;
  commentStartFlag?: boolean;
  templateCode?: string | null | undefined;
  lovParams?: object | null | undefined;
  lookupCode?: string | null | undefined;
  exportUrl?: string | null | undefined;
  exportParams?: object | null | undefined;
}

const { TabPane } = Tabs;
const { Item } = Timeline;
const { Panel } = Collapse;

function ModalContent(props: ModalContentProps) {
  const {
    modal,
    businessKey,
    operationUrl,
    operationParams,
    commentRecordFlag,
    commentStartFlag,
    lookupCode,
    lovParams = {},
    exportParams,
    templateCode,
    exportUrl,
  } = props;

  const [actionRecords, setActionRecords] = useState([]);
  const [actionTabLoading, handleActionTabLoading] = useState(false);
  const [approvalRecords, setApprovalRecords] = useState([] as any[]);
  const [approveTabLoading, handleApproveTabLoadingLoading] = useState(false);
  const [queryParms, setQueryParams] = useState({});

  const operaTableDs = useMemo(() => new DataSet(operaTableDS({ lookupCode, lovParams })), []);

  useEffect(() => {
    if (templateCode) {
      modal.update({
        footer: (okBtn) => {
          return (
            <>
              {okBtn}
              <CuxExcelExportPro
                exportUrl={exportUrl}
                exportParams={exportParams}
                templateCode={templateCode}
                queryParms={queryParms}
              />
            </>
          );
        },
      });
    }
  }, [templateCode, queryParms]);

  useEffect(() => {
    handleQuery({params: {}});
  }, []);

  const handleQuery = ({ params = {} }) => {
    try {
      handleActionTabLoading(true);
      setQueryParams(params);
      queryActions({operationUrl, operationParams: {...operationParams, ...params}}).then(res => {
        if(getResponse(res)) {
          setActionRecords(res);
        }
      }).finally(() => {
        handleActionTabLoading(false);
      });
    } catch (e) {
      throw e;
    } finally {
      handleActionTabLoading(false);
    }
  };

  const handleClear = () => {
    handleQuery({params: {}});
  };

  useEffect(() => {
    if(businessKey) {
      try {
        handleApproveTabLoadingLoading(true);
        fetchHistoryApproval({businessKey, commentRecordFlag, commentStartFlag}).then(res => {
          if(getResponse(res)) {
            setApprovalRecords([...(res || [])].reverse());
          }
        }).finally(() => {
          handleApproveTabLoadingLoading(false);
        });
      } catch (e) {
        throw e;
      } finally {
        handleApproveTabLoadingLoading(false);
      }
    }
  }, [businessKey]);

  const renderActionHeader = (action) => {
    let title;
    switch (action.approveType) {
      case 'action':
        title = (
          <div className='actionTab-header'>
            <span>{action.operator}</span>
            <span className='action-words'>{action.fieldMeaning}</span>
            <span>【{action.name}】</span>
          </div>
        );
        break;
      case 'approval':
      case 'export':
        title = (
          <div className='actionTab-header'>
            <span>{action.operator}</span>
            <span className='action-words'>{action.fieldMeaning}</span>
            <span>【{action.name}】</span>
          </div>
        );
        break;
      case 'workflow':
        title = (
          <div className='actionTab-header'>
            <span>{action.fieldMeaning}</span>
          </div>
        );
        break;
      case 'ext-system':
        title = (
          <div className='actionTab-header'>
            <span>{action.fieldMeaning}</span>
          </div>
        );
        break;
      default:
        title = (
          <div className='actionTab-header' />
        );
        break;
    }
    return (
      <>
        <Icon className='actionTab-header-icon' type={actionTypeGetActionIcon(action.fieldValue) || 'disabled_by_default'} />
        {title}
      </>
    );
  };

  const renderActionDetail = (action) => {
    if(action.list && action.list.length > 0) {
      switch (action.approveType) {
        case 'approval':
        case 'action':
          return action.list.map(li => {
            if(li.oldValue || li.newValue) {
              return (
                <div className='actionTab-detail-ul'>
                  <span>{action.operator}</span>
                  <span>{intl.get('component.operationRecord.view.action.target').d('将')}</span>
                  <span>【{li.fieldName}】</span>
                  <span>{intl.get('component.operationRecord.view.action.from').d('由')}</span>
                  <span>【{li.oldValue}】</span>
                  <span>{intl.get('component.operationRecord.view.action.to').d('改变为')}</span>
                  <span>【{li.newValue}】</span>
                  {li.displayLineNum && (<span>{intl.get('component.operationRecord.view.action.lineNum').d('行')}【{li.displayLineNum}】</span>)}
                </div>
              );
            } else {
              return (
                <div className='actionTab-detail-ul'>
                  <span>{action.operator}</span>
                  <span>【{li.fieldMeaning}】</span>
                  <span>【{li.name}】</span>
                  {li.displayLineNum && (<span>{intl.get('component.operationRecord.view.action.lineNum').d('行')}【{li.displayLineNum}】</span>)}
                </div>
              );
            }
          });
        default:
          return null;
      }
    } else if(['ext-system', 'workflow'].includes(action.approveType) && !!action.approveComment) {
      return (
        <div className='actionTab-detail-ul'>
          <span>{intl.get('component.operationRecord.view.action.approveComment').d('审批意见')}：</span>
          <span>{action.approveComment}</span>
        </div>
      );
    }
    else {
      return null;
    }
  };

  const renderAction = (actions) => {
    return (
      <Timeline>
        {
          actions.map(action => {
            const isActive: boolean = !!(action.list && action.list.length > 0);
            return (
              <Item color='#E5E5E5'>
                <Collapse
                  defaultActiveKey={['1']}
                  bordered={false}
                  expandIconPosition='text-right'
                  className='actionTab-collapse'
                >
                  <Panel header={renderActionHeader(action)} key="1" showArrow={isActive} disabled={!isActive}>
                    {renderActionDetail(action)}
                  </Panel>
                  <div className='actionTab-date'>{dateTimeRender(action?.createDate)}</div>
                </Collapse>
              </Item>
            );
          })
        }
      </Timeline>
    );
  };
  const renderTabPane = () => {
    if (approvalRecords && approvalRecords.length > 0) {
      return (
        <Tabs>
          <TabPane tab={intl.get('component.operationRecord.view.button.btnText').d('操作记录')} key="action" className="operation-record-modal-actionTab">
            <Spin spinning={actionTabLoading}>
              <FilterBar
                dataSet={[operaTableDs]}
                onQuery={handleQuery}
                onClear={handleClear}
                autoQuery={false}
                expandable={false}
              />
              {renderAction(actionRecords)}
            </Spin>
          </TabPane>;
          <TabPane tab={intl.get('component.operationRecord.view.tabs.approval').d('审批记录')} key='approval' className="operation-record-modal-approvalTab">
            <Spin spinning={approveTabLoading}>
              {approvalRecords.map((ele) => (
                <Collapse
                  expandIconPosition="text-right"
                  bordered={false}
                  defaultActiveKey={[ele.id]}
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
                    header={
                      <h3 style={{ fontWeight: 500, display: 'inline-block' }}>
                        {ele.processName}
                      </h3>
              }
                    key={ele.id}
                    style={{
                border: 0,
                color: '#2C50C7',
                fontWeight: 500,
              }}
                  >
                    <ApproveRecord data={[...(ele.historicTaskExtList || [])].reverse()} />
                  </Panel>
                </Collapse>
        ))}
            </Spin>
          </TabPane>
        </Tabs>
      );
    }
    return (
      <div
        className="operation-record-modal-actionTab"
        style={{overflowX: 'hidden', paddingTop: '4px'}}
      >
        <Spin spinning={actionTabLoading}>
          <FilterBar
            dataSet={[operaTableDs]}
            onQuery={handleQuery}
            onClear={handleClear}
            autoQuery={false}
            expandable={false}
          />
          {renderAction(actionRecords)}
        </Spin>
      </div>
    );
  };
  return (
    <>
      {renderTabPane()}
    </>
    // <Tabs>
    //   <TabPane tab={intl.get('component.operationRecord.view.button.btnText').d('操作记录')} key="action" className="operation-record-modal-actionTab">
    //     <Spin spinning={actionTabLoading}>{renderAction(actionRecords)}</Spin>
    //   </TabPane>
    //   {
    //     businessKey && (
    //       <TabPane tab={intl.get('component.operationRecord.view.tabs.approval').d('审批记录')} key='approval' className="operation-record-modal-approvalTab">
    //         <Spin spinning={approveTabLoading}>
    //           {approvalRecords && approvalRecords.length > 0 ? approvalRecords.map((ele) => (
    //             <Collapse
    //               expandIconPosition="text-right"
    //               bordered={false}
    //               defaultActiveKey={[ele.id]}
    //               expandIcon={({ isActive }) => {
    //                 return (
    //                   <Icon
    //                     type={isActive ? 'expand_less' : 'expand_more'}
    //                     style={{ marginBottom: '2px' }}
    //                   />
    //                 );
    //               }}
    //               className="approve-header"
    //             >
    //               <Panel
    //                 header={
    //                   <h3 style={{ fontWeight: 500, display: 'inline-block' }}>
    //                     {ele.processName}
    //                   </h3>
    //                 }
    //                 key={ele.id}
    //                 style={{
    //                   border: 0,
    //                   color: '#2C50C7',
    //                   fontWeight: 500,
    //                 }}
    //               >
    //                 <ApproveRecord data={[...(ele.historicTaskExtList || [])].reverse()} />
    //               </Panel>
    //             </Collapse>
    //           )) : (
    //             <div className='approve-header-empty'>
    //               <EmptySvg />
    //               <span className='desc'>
    //                 {intl.get('component.operationRecord.view.tabs.approval.empty').d('暂无审批记录')}
    //               </span>
    //             </div>
    //           )}
    //         </Spin>
    //       </TabPane>
    //     )
    //   }
    // </Tabs>
  );
}

export default ModalContent;
