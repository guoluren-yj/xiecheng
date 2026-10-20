import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, Timeline, Icon, Spin, Collapse } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchActionHistory, fetchExternalHistory } from '@/services/RequisitionPlanServices';

import styles from './index.less';

const commonPrompt = 'srpm.common.model.common';
const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Item } = Timeline;
// const { Panel } = Collapse;
const OperationHistory = ({ rpHeaderId }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [approveData, setApproveData] = useState([]);
  const [approveLoading, setApproveLoading] = useState(false);
  const [operaLoading, setOperaLoading] = useState(false);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  useEffect(() => {
    // 操作记录
    setOperaLoading(true);
    fetchActionHistory(rpHeaderId)
      .then((res) => {
        if (res && isArray(res)) {
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              res.map((ele) => {
                if (ele.batchNo) {
                  return ele.batchNo;
                } else {
                  return ele.creationDate;
                }
              })
            )
          );
          batchNoArray.forEach((item) => {
            currentItem.push(
              res.filter((ele) => ele.batchNo === item || ele.creationDate === item)
            );
          });
          const classified = currentItem.map((ele, index) => {
            dataKey[index] = 'off';
            // 只会展示1行动作的, 新建 ,审批通过,审批拒绝,删除,取消,撤回
            if (
              ele.length === 1 &&
              [
                'NEW',
                'APPROVE',
                'REJECT',
                'EXTERNAL_APPROVE',
                'EXTERNAL_REJECT',
                'DELETE',
                'SUBMIT',
              ].includes(ele[0].processType)
            ) {
              const { processType, processTypeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list: [],
              };
              // 'UPDATE', 'UPDATE_LINE', 'DELETE_LINE', 'NEW_LINE', 'CANCEL_LINE'
              // 会展示多行 更新、更新行、变更 新增行 删除行
            } else {
              const { processType, processTypeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
              return {
                processType: ele[0].processType,
                creationDate: ele[0].creationDate,
                processRemark: ele[0].processRemark,
                processUserName: ele[0].processUserName,
                // lineNum: ele[0].lineNum,
                cancelRemark: ['CANCEL', 'LINE_CANCEL'].includes(processType)
                  ? ele[0].processRemark
                  : '',
                icon: 'mode_edit',
                ...iconAndProcessMeaning,
                list: ele,
              };
            }
          });
          setClassified(classified);
        }
      })
      .finally(() => setOperaLoading(false));
    // 审批记录
    setApproveLoading(true);
    fetchExternalHistory(rpHeaderId)
      .then((res) => {
        if (res && isArray(res)) {
          const allHistoricTaskExtList = res.map((ele) => {
            return {
              id: ele.id,
              approvalType: ele.approvalType,
              approvalTypeMeaning: ele.approvalTypeMeaning,
              rpPlanHistoricTaskExpandDTOList: ele.rpPlanHistoricTaskExpandDTOList
                .reverse()
                .map((e) => ({
                  ...e,
                  name: e.nodeStatus ? (
                    <span id={e.id} style={{ marginRight: e.name ? '0px' : '-0.04rem' }}>
                      {e.name}
                    </span>
                  ) : (
                    e.name
                  ),
                })),
            };
          }); // historicTaskExtListf rpPlanHistoricTaskExpandDTOList
          setApproveData(allHistoricTaskExtList);
        }
      })
      .finally(() => setApproveLoading(false));
  }, [rpHeaderId]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    switch (true) {
      case ['NEW', 'NEW_LINE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_LINE'].includes(type):
        icon = 'delete';
        break;
      case ['UPDATE', 'UPDATE_LINE'].includes(type):
        icon = 'mode_edit';
        break;
      case ['APPROVE', 'REJECT', 'EXTERNAL_APPROVE', 'EXTERNAL_REJECT'].includes(type):
        icon = 'authorize';
        break;
      case ['SUBMIT'].includes(type):
        icon = 'done_all';
        break;
      case ['REVOKE'].includes(type):
        icon = 'reply';
        break;
      case ['CANCEL', 'LINE_CANCEL'].includes(type):
        icon = 'cancel';
        break;
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  // const renderIcon = useCallback(
  //   ({ isActive }) => <Icon type={isActive ? 'expand_more' : 'navigate_next'} />,
  //   []
  // );

  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  const onViewDetail = useCallback((type, data) => {
    if (!type.includes('EXTERNAL')) {
      setActiveKey('approved');

      setTimeout(() => {
        const nowTime = data.creationDate;
        // 先从审批记录里面过滤出审批节点
        const approveNodeArr = approveArr.length
          ? approveArr
          : approveData
              .filter((ele) => ele.nodeStatusCode)
              .sort((a, b) => (a.endTime > b.endTime ? 1 : -1));
        setApproveArr(approveNodeArr);

        // 查找距离操作记录工作流审批距离最近的审批节点，即对应的审批节点

        // 操作记录的节点时间 大于 审批记录的节点时间
        let index = null;

        for (let i = 0; i < approveNodeArr.length; i++) {
          if (i === approveNodeArr.length - 1 && approveNodeArr[i].startTime < nowTime) {
            index = i;
          }
          if (approveNodeArr[i].startTime > nowTime && index === null) {
            index = i - 1;
          }
        }

        if (index !== -1) {
          // 跳转到具体对应的节点

          const down = document.createElement('a');
          down.href = `#${approveNodeArr[index]?.id}`;
          down.click();
          down.remove();
        }
      }, 0);
    }
  });

  const getRemarkLabel = (processType) => {
    if (['CANCEL', 'LINE_CANCEL'].includes(processType)) {
      return intl.get(`${commonPrompt}.cancelRemark`).d('取消原因');
    } else if (processType === 'LINE_SUSPEND') {
      return intl.get('srpm.common.model.common.holdReason').d('暂挂原因');
    }
    return '';
  };

  const renderOperateHistory = () => {
    return (
      <Spin spinning={operaLoading}>
        <Timeline className="operating-timeline">
          {classifiedData.map((item, index) => (
            <Item
              color={item.color || '#E5E5E5'}
              onClick={() => {
                const [...current] = dataKey;
                current[index] = current[index] === 'on' ? 'off' : 'on';
                setDataKey(current);
              }}
            >
              <Icon type={item.icon} style={{ fontSize: 14 }} />
              <div className="operating-timeline-info">
                {['APPROVE', 'REJECT', 'EXTERNAL_APPROVE', 'EXTERNAL_REJECT'].includes(
                  item.processType
                ) && (
                  <>
                    <span>
                      <a
                        onClick={() => onViewDetail(item.processType, item)}
                        className={
                          item.processType === 'APPROVE' || item.processType === 'EXTERNAL_APPROVE'
                            ? 'operating-timeline-info-item-adopt'
                            : 'operating-timeline-info-item-reject'
                        }
                      >
                        {item.processTypeMeaning}
                      </a>
                    </span>
                  </>
                )}

                {!['APPROVE', 'REJECT', 'EXTERNAL_APPROVE', 'EXTERNAL_REJECT'].includes(
                  item.processType
                ) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.requisitionPlan`).d('【需求计划】')}
                    </span>
                    {/* {['MODIFY'].includes(item.processType) && (
                      <span className="status gray">
                        {intl.get(`${commonPrompt}.lineNum`).d('版本')}:[{item.lineNum}]
                      </span>
                    )} */}
                    {!isEmpty(item.list) && (
                      <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
                    )}
                    {item.list &&
                      dataKey[index] === 'on' &&
                      item.list.map((ele) => {
                        if (ele.processType === 'UPDATE' || ele.processType === 'UPDATE_LINE') {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {ele.processUserName || externalProcessUserName}
                              </span>
                              <span className="status gray">
                                {['UPDATE_LINE'].includes(item.processType)
                                  ? intl
                                      .get('srpm.common.model.common.changeToPlusLine', {
                                        processRemark: ele?.processRemark ?? '',
                                        oldValue: ele?.oldValue ?? '',
                                        newValue: ele?.newValue ?? '',
                                        lineNum: ele?.lineNum ?? '',
                                      })
                                      .d(
                                        `将行号【{ele.lineNum}】的【{ele.processRemark}】由【{ele.oldValue}】改成【{ele.newValue}`
                                      )
                                  : intl
                                      .get('srpm.common.model.common.changeTo', {
                                        processRemark: ele?.processRemark ?? '',
                                        oldValue: ele?.oldValue ?? '',
                                        newValue: ele?.newValue ?? '',
                                      })
                                      .d(
                                        `将【{ele.processRemark}】由【{ele.oldValue}】改成【{ele.newValue}】`
                                      )}
                              </span>
                            </div>
                          );
                        } else if (
                          ele.processType === 'NEW_LINE' ||
                          ele.processType === 'LINE_CANCEL' ||
                          ele.processType === 'DELETE_LINE' ||
                          ele.processType === 'LINE_SUSPEND' ||
                          ele.processType === 'LINE_ENABLE'
                        ) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {intl.get(`${commonPrompt}.lineNum`).d('行号')}:{ele.lineNum}
                              </span>
                            </div>
                          );
                        } else {
                          return <div />;
                        }
                      })}
                  </>
                )}
                {['CANCEL', 'LINE_CANCEL', 'LINE_SUSPEND'].includes(item.processType) &&
                  item.processRemark && (
                    <div className="date gray">
                      <span className="status gray">
                        {getRemarkLabel(item.processType)}:&nbsp;
                        {item.processRemark}
                      </span>
                    </div>
                  )}
                <div className="date gray">{dateTimeRender(item.creationDate)}</div>
              </div>
            </Item>
          ))}
        </Timeline>
      </Spin>
    );
  };

  return (
    <div className={styles.operating}>
      {approveData?.length ? (
        <div className={styles['operating-content']}>
          <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane
              tab={intl.get('hzero.common.view.message.operateHistory').d('操作记录')}
              key="operator"
            >
              <div className={styles['scroll-content']}>{renderOperateHistory()}</div>
            </TabPane>
            {approveData?.length > 0 && (
              <TabPane
                tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
                key="approved"
              >
                <div className={styles['scroll-content']}>
                  <Spin spinning={approveLoading}>
                    <div className={styles['approve-list-new']}>
                      {approveData.map((ele) => (
                        <>
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
                                  {ele.approvalTypeMeaning}
                                </h3>
                              }
                              key={ele.id}
                              style={{
                                border: 0,
                                color: '#2C50C7',
                                fontWeight: 500,
                              }}
                            >
                              <ApproveRecord data={ele.rpPlanHistoricTaskExpandDTOList} />
                            </Panel>
                          </Collapse>
                        </>
                      ))}
                    </div>
                  </Spin>
                </div>
              </TabPane>
            )}
          </Tabs>
        </div>
      ) : (
        renderOperateHistory()
      )}
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'srpm.common', 'component.operationRecord'],
})(OperationHistory);
