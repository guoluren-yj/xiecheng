import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, Timeline, Icon, Spin } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchActionHistory, fetchApproveHistory } from '@/services/budgetService';

import styles from './index.less';

const commonPrompt = 'sbdm.common.model.common';
const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Item } = Timeline;
// const { Panel } = Collapse;
const OperationHistory = ({ budgetHeaderId, modal }) => {
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
    fetchActionHistory(budgetHeaderId)
      .then(res => {
        if (res && isArray(res)) {
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              res.map(ele => {
                if (ele.batchNo) {
                  return ele.batchNo;
                } else {
                  return ele.creationDate;
                }
              })
            )
          );
          batchNoArray.forEach(item => {
            const ele = res.filter(ele => ele.processType !== 'NEW' && (ele.batchNo === item || ele.creationDate === item));
            if (ele && !isEmpty(ele)) {
              currentItem.push(res.filter(ele => ele.processType !== 'NEW' && (ele.batchNo === item || ele.creationDate === item)));
            }
          });
          currentItem.push(res.filter(ele => ele.processType === 'NEW'));
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
                'CANCEL',
                'SUBMIT',
                'REVOKE',
              ].includes(ele[0]?.processType)
            ) {
              const { processType, processTypeMeaning } = ele[0] || {};
              const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
              return {
                ...(ele[0] || {}),
                ...iconAndProcessMeaning,
                list: [],
              };
              // 'UPDATE', 'UPDATE_LINE', 'DELETE_LINE' 'NEW_LINE',
              // 会展示多行 更新、更新行、变更 新增行 删除行
            } else {
              const { processType, processTypeMeaning } = ele[0] || {};
              const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
              return {
                processType,
                creationDate: ele[0]?.creationDate,
                processUserName: ele[0]?.processUserName,
                // lineNum: ele[0].lineNum,
                reason: ele[0]?.reason,
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
    fetchApproveHistory(budgetHeaderId)
      .then(res => {
        if (res && isArray(res)) {
          let allHistoricTaskExtList = [];
          res.forEach(ele => {
            allHistoricTaskExtList = allHistoricTaskExtList.concat(ele.historicTaskExtList || []);
          });
          if (!isEmpty(allHistoricTaskExtList) && modal) {
            modal.update({
              bodyStyle: { paddingTop: '20px', overflow: 'hidden' },
            });
          }
          setApproveData(
            allHistoricTaskExtList.reverse().map(e => ({
              ...e,
              name: e.nodeStatus ? (
                <span id={e.id} style={{ marginRight: e.name ? '0px' : '-0.04rem' }}>
                  {e.name}
                </span>
              ) : (
                e.name
              ),
            }))
          );
        }
      })
      .finally(() => setApproveLoading(false));
  }, [budgetHeaderId]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    switch (true) {
      case ['NEW', 'NEW_LINE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_LINE'].includes(type):
        icon = 'delete';
        break;
      case ['UPDATE', 'UPDATE_LINE', 'SUBMIT_EDIT'].includes(type):
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
      case ['CANCEL', 'CANCEL_LINE'].includes(type):
        icon = 'cancel';
        break;
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  // const renderIcon = useCallback(
  //   ({ isActive }) => <Icon type={isActive ? 'expand_more' : 'navigate_next'} />,
  //   []
  // );

  const handleChangeTab = useCallback(
    tabKey => {
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
            .filter(ele => ele.nodeStatusCode)
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
              <Icon type={item.icon} style={{ fontSize: 14, marginTop: '2px' }} />
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
                        {intl.get(`${commonPrompt}.BudgetTitle`).d('预算编制')}
                      </span>
                      {/* {['MODIFY'].includes(item.processType) && (
                      <span className="status gray">
                        {intl.get(`${commonPrompt}.lineNum`).d('版本')}:[{item.lineNum}]
                      </span>
                    )} */}
                      {!isEmpty(item.list) && (
                        <Icon
                          type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                          style={{ fontSize: 14 }}
                        />
                      )}
                      {item.list &&
                        dataKey[index] === 'on' &&
                        item.list.map(ele => {
                          if (
                            ele.processType === 'UPDATE' ||
                            ele.processType === 'UPDATE_LINE' ||
                            ele.processType === 'SUBMIT_EDIT'
                          ) {
                            return (
                              <div className="date">
                                <span className="status gray">
                                  {ele.processUserName || externalProcessUserName}
                                </span>
                                <span className="status gray">
                                  {intl.get(`${commonPrompt}.jiang`).d('将')}
                                </span>
                                {ele.lineNum &&
                                  ['UPDATE_LINE', 'SUBMIT_EDIT'].includes(item.processType) && (
                                    <span className="status gray">
                                      {intl.get(`${commonPrompt}.lineNum`).d('行号')}【{ele.lineNum}】
                                      {intl.get(`${commonPrompt}.of`).d('的')}
                                    </span>
                                  )}
                                <span className="status gray">【{ele.processRemark}】</span>
                                {intl.get(`${commonPrompt}.you`).d('由')}
                                <span className="status gray">【{ele.oldValue}】</span>
                                {intl.get(`${commonPrompt}.change`).d('改成')}
                                <span className="status gray">【{ele.newValue}】</span>
                              </div>
                            );
                          } else if (
                            ele.processType === 'NEW_LINE' ||
                            ele.processType === 'DELETE_LINE' ||
                            ele.processType === 'CANCEL_LINE'
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
            <TabPane
              tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
              key="approved"
            >
              <div className={styles['scroll-content']}>
                <Spin spinning={approveLoading}>
                  <div className={styles['approve-list-new']}>
                    <ApproveRecord data={approveData} />

                    {!approveData?.length && handleNoData()}
                  </div>
                </Spin>
              </div>
            </TabPane>
          </Tabs>
        </div>
      ) : (
        renderOperateHistory()
      )}
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'srpm.common'],
})(OperationHistory);
