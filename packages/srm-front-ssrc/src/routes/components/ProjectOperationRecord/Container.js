/**
 * 主容器组件
 */
import React, { useState, useCallback, useEffect, useMemo, useImperativeHandle } from 'react';
import { Tabs, Spin, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';

import DynamicComponent from '@/routes/components/DynamicComponent';

import { fetchOperationRecords, fetchApprovalRecords } from './service';
import OperationList from './OperationList';
import OperationFilter from './OperationFilter';
import { getComputedRegExpValue, getProcessOperationAction, renderApproveNode } from './utils';

import styles from './index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

export default function Container(props) {
  const { sourceProjectId, handleOperationRef = React.createRef } = props;
  const [activeKey, setActiveKey] = useState('operation');
  const [operationList, setOperationList] = useState([]);
  const [initOperationList, setInitOperationList] = useState([]); // 用于缓存初始查询处理后的数据
  const [detailFlag, setDetailFlag] = useState(false); // 是否是从审批记录通过或者拒绝点进去的
  const [currentNodeId, setCurrentNodeId] = useState('');
  const [iconDirection, setIconDirection] = useState({}); // 分模块判断每个模块展开收起
  const [approvalList, setApprovalList] = useState();

  const [fetchOperationLoading, setOperationLoading] = useState(false);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    handleOperationRef,
    () => ({
      operationList,
      initOperationList,
      getCurrentOperationList,
    }),
    [operationList]
  );

  const getCurrentOperationList = () => {
    const { operationList: list } = handleOperationRef?.current || {};
    return list;
  };

  // update data to ref
  const updateDataIntoRef = (list = []) => {
    const { current } = handleOperationRef || {};

    if (current) {
      handleOperationRef.current.operationList = list;
    }
  };

  const getOperationRecords = async (params) => {
    setOperationLoading(true);
    try {
      Promise.all([fetchOperationRecords(params), fetchApprovalRecords(params)]).then(
        ([res1, res2]) => {
          const result = getResponse(res1);
          handleDealOperationRecord(result, { init: true });
          setApprovalList(getResponse(res2));
        }
      );
    } finally {
      setOperationLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      organizationId,
      sourceProjectId,
    };
    getOperationRecords(params);
  }, []);

  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
      if (tabKey !== 'approval') setDetailFlag(false);
    },
    [activeKey]
  );

  // 处理操作记录结果数据
  const handleDealOperationRecord = (result, otherPayload = {}) => {
    const { filterParams, init = false, descriptionFilter = false, } = otherPayload || {};
    if (result && !result.failed) {
      if (result?.[0]?.sourceNode) {
        const List = result.map((item) => {
          const newProjectActionDTOS = item.projectActionDTOS.map((dtos) => ({
            ...dtos,
            processOperation: dtos.processedOperation || dtos.afterProcessedOperation,
            processOperationMeaning:
              dtos.processedOperationMeaning || dtos.afterProcessedOperationMeaning,
          }));
          return { ...item, projectActionDTOS: newProjectActionDTOS };
        });
        const newOperationList = dealOperationList({ filterParams, list: List, init, descriptionFilter, });
        updateDataIntoRef(newOperationList);
        if (init) {
          setInitOperationList(newOperationList);
        }
        setOperationList(newOperationList);
        return;
      }
      const newOperationList = filterOperationList({ filterParams, list: result, init });
      if (init) {
        setInitOperationList(newOperationList);
      }
      setOperationList(newOperationList);
    }
  };

  // 重新组装列表数据
  const dealOperationList = ({ filterParams, list, init, descriptionFilter, }) => {
    if (!list?.length) return list;
    const newList = [];
    list.forEach((record) => {
      const actionList = filterOperationList({
        filterParams,
        list: record.projectActionDTOS,
        init,
        descriptionFilter,
      });
      if (actionList.length) {
        newList.push({
          ...(record || {}),
          projectActionDTOS: actionList,
        });
      }
    });
    return newList;
  };

  // 到发版前最后两天，后端说处理不了😓，要放到前端进行搜索过滤骚操作
  // 根据描述过滤数据
  const filterOperationList = ({ list, filterParams, init = false, descriptionFilter, }) => {
    if (!list?.length) return list;
    const { description: filterDescription = "" } = filterParams || {};
    let actionList = [];

    list.forEach((operation) => {
      // 若修改getProcessOperationAction的参数，请关注下渲染的地方也有这个方法需要处理
      const operationDescArr = getProcessOperationAction(operation) || [];
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
      } else if (
        ['APPROVE', 'REJECT', 'EXTERNAL_REJECT', 'EXTERNAL_APPROVE'].includes(
          operation.processOperation
        )
      ) {
        // 将页面渲染那一套特殊逻辑拿到这里，若改这里需要将页面渲染那里也改掉
        const { processSystemCode, processOperation, loginName } = operation;
        const realNameTitle = `${operation.realName ?? ''}${
          operation.loginName ? `（${operation.loginName}）` : ''
        }`;
        const status = ['APPROVE', 'EXTERNAL_APPROVE'].includes(processOperation)
          ? 'approved'
          : 'rejected';
        newOperationDescArr = renderApproveNode(
          processSystemCode,
          realNameTitle,
          `【${intl.get('ssrc.common.view.message.rfx').d('询价单')}】`,
          status,
          loginName || ''
        )
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

      actionList.push({
        ...(operation || {}),
        description: newOperationDescArr,
      });
    });
    return actionList;
  };

  // 查询操作记录
  const onQueryOperationRecords = (payload) => {
    const params = {
      organizationId,
      sourceProjectId,
      ...(payload || {}),
    };
    setOperationLoading(true);
    return fetchOperationRecords(params)
      .then((res) => {
        const result = getResponse(res);
        handleDealOperationRecord(result, { filterParams: payload, init: true, descriptionFilter: payload?.description ? true : false, });
      })
      .finally(() => {
        setOperationLoading(false);
      });
  };

  const handleViewDetail = useCallback((currentId) => {
    setDetailFlag(true);
    setCurrentNodeId(currentId);
    setActiveKey('approval');
  }, []);

  const ApprovalListNode = useMemo(() => {
    // 优先判断有没有二开, 如果有动态加载二开组件, 反之标准
    const compProps = {
      linkHref:
        '/ssrc/redevelop-route/project-approval-list?sourceProjectId={sourceProjectId}&detailFlag={detailFlag}',
      record: { sourceProjectId, detailFlag, currentNodeId, approvalList },
    };
    return <DynamicComponent {...compProps} />;
  }, [detailFlag]);

  // 点击头
  const handleOpen = useCallback(
    (sourceNode) => {
      setIconDirection({ ...iconDirection, [sourceNode]: !iconDirection[sourceNode] });
    },
    [iconDirection]
  );

  return (
    <Spin spinning={fetchOperationLoading}>
      {approvalList?.length ? (
        <Tabs
          defaultActiveKey={activeKey}
          activeKey={activeKey}
          onChange={handleChangeTab}
          className="approval-Tabs-wrapper"
        >
          <TabPane
            key="operation"
            tab={intl.get('ssrc.common.view.title.operationRecord').d('操作记录')}
          >
            <OperationFilter onQuery={onQueryOperationRecords} />
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
                      dataSource={ele.projectActionDTOS}
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
            {/* <ApprovalList {...approvalProps} /> */}
            {ApprovalListNode}
          </TabPane>
        </Tabs>
      ) : (
        <>
          <OperationFilter onQuery={onQueryOperationRecords} />
          {operationList?.map((ele) => {
            return (
              <div key={ele.projectActionId} className={styles['operation-wrapper']}>
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
                    dataSource={ele.projectActionDTOS}
                  />
                </div>
              </div>
            );
          })}
        </>
      )}
    </Spin>
  );
}
