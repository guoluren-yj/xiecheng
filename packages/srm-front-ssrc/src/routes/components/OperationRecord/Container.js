/**
 * 主容器组件
 */
import React, { useState, useCallback, useEffect, useMemo, useImperativeHandle } from 'react';
import { Tabs, Spin, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import remotes from 'hzero-front/lib/utils/remote';

import DynamicComponent from '@/routes/components/DynamicComponent';
import RFQFilter from '@/routes/components/OperationRecordFilter/RFQFilter';

import { fetchOperationRecords, fetchOperationRecord, fetchApprovalRecords } from './service';
import OperationList from './OperationList';
import { getComputedRegExpValue, getProcessOperationAction } from './utils';

import styles from './index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

function Container(props) {
  const {
    rfxHeaderId,
    rfx = {},
    header = {},
    remote,
    handleOperationRef = React.createRef,
  } = props;
  const [activeKey, setActiveKey] = useState('operation');
  const [operationList, setOperationList] = useState([]);
  const [initOperationList, setInitOperationList] = useState([]); // 用于缓存初始查询处理后的数据
  const [detailFlag, setDetailFlag] = useState(false); // 是否是从审批记录通过或者拒绝点进去的
  const [currentNodeId, setCurrentNodeId] = useState('');
  const [newFlag, setNewFlag] = useState(true); // 判断操作记录要不要分模块展示标识
  const [iconDirection, setIconDirection] = useState({}); // 分模块判断每个模块展开收起
  const [approvalList, setApprovalList] = useState();

  const [operationLoading, setOperationLoading] = useState(false);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    handleOperationRef,
    () => ({
      operationList: initOperationList,
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

  const getOperationRecords = (params) => {
    setOperationLoading(true);
    Promise.all([fetchOperationRecord(params), fetchApprovalRecords(params)])
      .then(([res1, res2]) => {
        const result1 = getResponse(res1);
        if (result1 && !result1.failed) {
          if (result1[0]?.sourceNode) {
            const newOperationList = dealOperationList({
              list: result1,
              init: true,
            });
            setInitOperationList(newOperationList);
            setOperationList(result1);
            updateDataIntoRef(newOperationList);
          } else {
            setNewFlag(false);
            fetchOperationRecords(params).then((result) => {
              if (getResponse(result)) {
                const newOperationList = filterOperationList({
                  list: result.content,
                  init: true,
                  clearSourceNodeFlag: true,
                });
                setInitOperationList(newOperationList);
                setOperationList(result.content);
              }
            });
          }
        }
        setApprovalList(getResponse(res2));
      })
      .finally(() => {
        setOperationLoading(false);
      });
  };

  useEffect(() => {
    const params = {
      organizationId,
      rfxHeaderId,
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

  /**
   * 重新组装列表数据
   * descriptionFilter 筛选器有description
   * */
  const dealOperationList = ({ filterParams = {}, list = [], init = false, descriptionFilter = false, }) => {
    if (!list?.length) return list;
    const newList = [];
    list.forEach((record) => {
      const actionList = filterOperationList({
        filterParams,
        list: record.rfxActionDTOList || [],
        init,
        descriptionFilter,
      });
      if (actionList.length) {
        newList.push({
          ...(record || {}),
          rfxActionDTOList: actionList,
        });
      }
    });
    return newList;
  };

  // 到发版前最后两天，后端说处理不了😓😓，要放到前端进行搜索过滤骚操作
  // 根据描述过滤数据
  const filterOperationList = ({
    list = [],
    filterParams = {},
    init = false,
    clearSourceNodeFlag = false,
    descriptionFilter = false,
  }) => {
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
          '',
          '',
          rfx,
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
      // 如果描述包含过滤条件，则添加到列表中
      // if (init || newOperationDescArr.indexOf(filterParams.description) > -1) {
      //   actionList.push({
      //     ...(operation || {}),
      //     description: newOperationDescArr,
      //     sourceNode: init && clearSourceNodeFlag ? null : operation.sourceNode, // 有的不分节点但是后端第一条数据返回了sourceNode，导致后端导出有问题（解决方案，后端说传给他的数据第一条sourceNode清空就行）
      //   });
      // }

      const descriptionFilterMatch = newOperationDescArr.indexOf(filterDescription) > -1;

      // 筛选器有description,但是前端没有匹配到
      if (descriptionFilter && !descriptionFilterMatch) {
        return;
      }

      actionList.push({
        ...(operation || {}),
        description: newOperationDescArr,
        sourceNode: init && clearSourceNodeFlag ? null : operation.sourceNode, // 有的不分节点但是后端第一条数据返回了sourceNode，导致后端导出有问题（解决方案，后端说传给他的数据第一条sourceNode清空就行）
      });
    });
    return actionList;
  };

  // 查询操作记录
  const onQueryOperationRecords = (payload) => {
    const params = {
      organizationId,
      rfxHeaderId,
      ...(payload || {}),
    };
    setOperationLoading(true);
    if (newFlag) {
      return fetchOperationRecord(params)
        .then((res1) => {
          const result1 = getResponse(res1);
          if (result1 && !result1.failed) {
            if (!result1.length || result1[0]?.sourceNode) {
              const newOperationList = dealOperationList({
                filterParams: payload,
                list: result1,
                init: true,
                descriptionFilter: payload?.description ? true : false
              });
              setOperationList(newOperationList);
              updateDataIntoRef(newOperationList);
            }
          }
        })
        .finally(() => {
          setOperationLoading(false);
        });
    }
    return fetchOperationRecords(params)
      .then((result) => {
        if (getResponse(result)) {
          const newOperationList = filterOperationList({
            filterParams: payload,
            list: result.content,
          });
          setOperationList(newOperationList || []);
        }
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
        '/ssrc/redevelop-route/approval-list?rfxHeaderId={rfxHeaderId}&detailFlag={detailFlag}',
      record: { rfxHeaderId, detailFlag, currentNodeId, approvalList },
    };
    return <DynamicComponent {...compProps} />;
  }, [detailFlag, approvalList]);

  // 点击头
  const handleOpen = useCallback(
    (sourceNode) => {
      setIconDirection({ ...iconDirection, [sourceNode]: !iconDirection[sourceNode] });
    },
    [iconDirection]
  );

  const operationProps = {
    dataSource: operationList,
    onViewDetail: handleViewDetail,
    rfx,
    newFlag,
    remote,
  };

  return (
    <Spin spinning={operationLoading}>
      <Tabs
        defaultActiveKey={activeKey}
        activeKey={activeKey}
        onChange={handleChangeTab}
        className={styles['approval-Tabs-wrapper']}
      >
        <TabPane
          key="operation"
          tab={intl.get('ssrc.common.view.title.operationRecord').d('操作记录')}
        >
          <RFQFilter onQuery={onQueryOperationRecords} header={header} />
          {newFlag ? (
            operationList?.map((ele) => {
              return (
                <div key={ele.rfxActionId} className={styles['operation-wrapper']}>
                  <span className={styles['operation-record']}>{ele.nodeStatusMeaning}</span>
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
                      dataSource={ele.rfxActionDTOList}
                      rfx={rfx}
                      newFlag={newFlag}
                      remote={remote}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <OperationList {...operationProps} />
          )}
        </TabPane>

        <TabPane
          key="approval"
          tab={intl.get('ssrc.common.view.title.approvalRecord').d('审批记录')}
        >
          {/* <ApprovalList {...approvalProps} /> */}
          {ApprovalListNode}
        </TabPane>
      </Tabs>
    </Spin>
  );
}

export default remotes({
  code: 'SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER',
  name: 'remote',
})(Container);
