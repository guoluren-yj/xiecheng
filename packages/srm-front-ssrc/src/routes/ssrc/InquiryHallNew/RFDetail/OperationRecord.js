/*
 * @Descripttion: 操作记录
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-10-18 10:28:31
 * @LastEditors: yiping.liu
 */
import React, { useState, useCallback, useEffect, useImperativeHandle } from 'react';
import intl from 'utils/intl';
import { Tabs, Spin, Icon } from 'choerodon-ui';
import ApproveRecord from '_components/ApproveRecord';
import { isNil } from 'lodash';

import OperationList from '@/routes/components/OperationRecord/OperationList';
import { rfOperation, fetchApprovalRecords } from '@/services/inquiryHallNewService';
import RFFilter from '@/routes/components/OperationRecordFilter/RFFilter';
import {
  getComputedRegExpValue,
  getProcessOperationAction,
} from '@/routes/components/OperationRecord/utils';

import styles from './index.less';

const { TabPane } = Tabs;

const OperationRecord = (props) => {
  const [activeKey, setActiveKey] = useState('operation');
  const [iconDirection, setIconDirection] = useState({});
  const [operationList, setOperationList] = useState([]);
  const [initOperationList, setInitOperationList] = useState([]); // 用于缓存初始查询处理后的数据
  const [approvalList, setApprovalList] = useState([]);
  const [fetchOperationLoading, setOperationLoading] = useState(false);
  const [fetchApprovalLoading, setFetchApprovalLoading] = useState(false);

  const { rfHeaderId = '', rfTitle, handleOperationRef = React.createRef } = props;

  useEffect(() => {
    fetchOperation({ init: true });
    fetchApprovalRecord();
  }, []);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(handleOperationRef, () => ({
    operationList: initOperationList,
  }));

  // 操作记录
  const fetchOperation = (payload) => {
    const { filterParams = {}, init = true } = payload || {};
    setOperationLoading(true);
    rfOperation({ rfHeaderId, ...(filterParams || {}) })
      .then((res) => {
        if (res && !res.failed) {
          const newOperationList = dealOperationList({
            filterParams,
            list: res,
            init,
            descriptionFilter: filterParams?.description ? true : false,
          });
          if (init) {
            setInitOperationList(newOperationList);
          }
          setOperationList(newOperationList);
        }
      })
      .finally(() => setOperationLoading(false));
  };

  // 重新组装列表数据
  const dealOperationList = ({ filterParams = {}, list = [], init = false, descriptionFilter = false, }) => {
    if (!list?.length) return list;
    const newList = [];
    list.forEach((record) => {
      const actionList = filterOperationList({ filterParams, list: record.actionList || [], init, descriptionFilter, });
      if (actionList.length) {
        newList.push({
          ...(record || {}),
          actionList,
        });
      }
    });
    return newList;
  };

  // 到发版前最后两天，后端说处理不了😓😓，要放到前端进行搜索过滤骚操作
  // 根据描述过滤数据
  const filterOperationList = ({ list = [], filterParams = [], init = false, descriptionFilter = false, }) => {
    if (!list?.length) return list;
    const { description: filterDescription = "" } = filterParams || {};
    let actionList = [];

    list.forEach((operation) => {
      // 若修改getProcessOperationAction的参数，请关注下渲染的地方也有这个方法需要处理
      const operationDescArr =
        getProcessOperationAction(
          operation.processOperation,
          operation.processSystemCode,
          operation.realName,
          operation.processOperationMeaning,
          'rf',
          rfTitle,
          '',
          operation.actionExpandParam,
          {
            secondarySourceCategory: operation.secondarySourceCategory,
            processRemark: operation.processRemark,
            opener: operation.opener,
            operation,
          }
        ) || [];
      // 将渲染页面的那一套逻辑拿到这里进行处理
      let newOperationDescArr = '';
      if (operation.processOperation === 'DOC_DELIVER') {
        newOperationDescArr = [
          getComputedRegExpValue(operationDescArr[0], operation),
          operationDescArr[1],
          `${operation.deliverFromUserName} (${operation.deliverFromUserLoginName}) `,
          operationDescArr[2],
          `${operation.deliverToUserName} (${operation.deliverToUserLoginName}) `,
        ]
          .filter(Boolean)
          .join('');
      } else {
        newOperationDescArr = operationDescArr
          .map((desc, index) => {
            if (index === 0 || index === 1) {
              return getComputedRegExpValue(desc, operation);
            }
            return desc;
          })
          .filter(Boolean)
          .join('');
      }

      const descriptionFilterMatch = newOperationDescArr.indexOf(filterDescription) > -1;

      // 筛选器有description,但是前端没有匹配到
      if (descriptionFilter && !descriptionFilterMatch) {
        return;
      }

      // 如果描述包含过滤条件，则添加到列表中
      actionList.push({
        ...(operation || {}),
        description: newOperationDescArr,
      });
    });
    return actionList;
  };

  // 审批记录
  const fetchApprovalRecord = () => {
    setFetchApprovalLoading(true);
    fetchApprovalRecords({ rfHeaderId })
      .then((res) => {
        if (res && !res.failed) {
          const list = res
            .map((item) => {
              return {
                historicTaskExtList: [].concat(
                  ...(item.approvalHistories
                    .reverse()
                    .map((hisItem) => hisItem.historicTaskExtList) || [])
                ),
                processType: item.processType,
                processTypeMeaning: item.processTypeMeaning,
              };
            })
            .reverse();
          setApprovalList(list);
        }
      })
      .finally(() => setFetchApprovalLoading(false));
  };

  // 切换tab
  const handleChangeTab = useCallback(
    (tabKey) => {
      if (tabKey === activeKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  // 点击头
  const handleOpen = useCallback(
    (sourceNode) => {
      setIconDirection({ ...iconDirection, [sourceNode]: !iconDirection[sourceNode] });
    },
    [iconDirection]
  );

  const handleViewDetail = useCallback(() => {
    setActiveKey('approval');
  }, []);

  return (
    <Spin spinning={fetchOperationLoading}>
      {approvalList?.length ? (
        <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
          <TabPane
            key="operation"
            tab={intl.get('ssrc.common.view.title.operationRecord').d('操作记录')}
          >
            <RFFilter onQuery={fetchOperation} />
            {operationList?.map((ele) => {
              return (
                <div key={ele.rfActionId} className={styles['operation-wrapper']}>
                  <span className={styles['operation-record']}>{ele.sourceNodeMeaning}</span>
                  <Icon
                    className={styles['operation-icon']}
                    onClick={() => handleOpen(ele.sourceNode)}
                    type={!iconDirection[ele.sourceNode] ? 'expand_less' : 'expand_more'}
                  />
                  <div
                    className={
                      !iconDirection[ele.sourceNode]
                        ? styles['operation-content']
                        : styles['operation-content-closed']
                    }
                  >
                    <OperationList
                      onViewDetail={handleViewDetail}
                      dataSource={ele.actionList}
                      dataType="rf"
                      rfTitle={rfTitle}
                    />
                  </div>
                </div>
              );
            })}
          </TabPane>
          <TabPane
            key="approval"
            tab={intl.get('ssrc.common.view.title.approvalRecord').d('审批记录')}
          >
            <Spin spinning={fetchApprovalLoading}>
              {approvalList?.length ? (
                approvalList?.map((ele) => {
                  return (
                    <div key={ele.processType} className={styles['operation-wrapper']}>
                      <span className={styles['operation-record']}>{ele.processTypeMeaning}</span>
                      <Icon
                        className={styles['operation-icon']}
                        onClick={() => handleOpen(ele.processType)}
                        type={!iconDirection[ele.processType] ? 'expand_less' : 'expand_more'}
                      />
                      <div
                        className={
                          !iconDirection[ele.processType]
                            ? styles['operation-content']
                            : styles['operation-content-closed']
                        }
                      >
                        <ApproveRecord data={ele.historicTaskExtList} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles['empty-wrapper']}>
                  <span>{intl.get('ssrc.common.view.message.emptyData').d('暂无数据')}</span>
                </div>
              )}
            </Spin>
          </TabPane>
        </Tabs>
      ) : (
        <>
          <RFFilter onQuery={fetchOperation} />
          {operationList?.map((ele) => {
            return (
              <div key={ele.sourceNode} className={styles['operation-wrapper']}>
                <span className={styles['operation-record']}>{ele.sourceNodeMeaning}</span>
                <Icon
                  className={styles['operation-icon']}
                  onClick={() => handleOpen(ele.sourceNode)}
                  type={!iconDirection[ele.sourceNode] ? 'expand_less' : 'expand_more'}
                />
                <div
                  className={
                    !iconDirection[ele.sourceNode]
                      ? styles['operation-content']
                      : styles['operation-content-closed']
                  }
                >
                  <OperationList
                    onViewDetail={handleViewDetail}
                    dataSource={ele.actionList}
                    dataType="rf"
                    rfTitle={rfTitle}
                  />
                </div>
              </div>
            );
          })}
        </>
      )}
    </Spin>
  );
};

export default OperationRecord;
