import React, { useEffect, useState, useCallback, useMemo } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Tabs, Timeline, Icon, Spin } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty, isArray, flowRight } from 'lodash';
import ApproveRecordGroup from '_components/ApproveRecordGroup';
// import MoreAndLess from './MoreAndLess';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPRM } from '_utils/config';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId } from 'utils/utils';

import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { queryApproveDate } from '@/services/purchasePlatformService';
import { line } from './store.js';
import style from './index.less';

const { TabPane } = Tabs;
// const { Panel } = Collapse;
const { Item } = Timeline;

const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const Index = ({ prHeaderId, handleCuxOperation, handleRenderCuxOperation, modal, remote }) => {
  const lineDs = useMemo(() => new DataSet(line(prHeaderId)), []);
  const [classifiedData, setClassified] = useState([]);
  const [approveData, setApproveData] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  useEffect(() => {
    setActionLoading(true);
    lineDs
      .query()
      .then((res) => {
        if (res && isArray(res)) {
          const currentItem = [];
          let batchNoArray = [];

          res.forEach((ele) => {
            if (ele.batchNo) {
              if (
                (ele.approveMethodCode && batchNoArray.includes(ele.batchNo)) ||
                ele.processTypeCode === 'SUBMITTED'
              ) {
                batchNoArray.push(ele.actionId);
              } else {
                batchNoArray.push(ele.batchNo);
              }
            } else if (['APPROVED', 'REJECTED'].includes(ele.processTypeCode)) {
              batchNoArray.push(ele.actionId);
            } else if (
              ['ASSIGNED', 'CANCELING', 'CANCEL', 'CLOSEING', 'CLOSEDING', 'CLOSED'].includes(
                ele.processTypeCode
              )
            ) {
              batchNoArray.push(ele.creationDate);
            } else {
              batchNoArray.push(ele.actionId);
            }
          });
          // 去重
          batchNoArray = Array.from(new Set(batchNoArray));

          batchNoArray.forEach((item) => {
            currentItem.push(
              res.filter(
                (ele) => ele.actionId === item || ele.batchNo === item || ele.creationDate === item
              )
            );
          });

          const classified = currentItem?.map((ele, index) => {
            dataKey[index] = 'off';
            // 只会展示1行动作的, 新建,提交,启用,加急,变更撤回
            if (
              ele.length === 1 &&
              [
                'PENDING',
                'RP_PENDING',
                'SUBMITTED',
                'AUTO_SUBMITTED',
                'URGENT',
                'URGENT_CANCEL',
                'CHANGE_REVOKE',
                'WITHDRAW',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list: [],
              };
            } else if (
              // 返回结果可能1条,可能多条的,但只展示 原因+动作
              [
                'APPROVED',
                'REJECTED',
                'AUTO_SUBMITTED_FAILED',
                'CANCEL_REJECTED',
                'SEND_BACK',
                'DOC_FORWARD',
                'SYNC',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode, processTypeCodeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode, processTypeCodeMeaning);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list:
                  ele[0].processRemark || ele[0].processTypeCode === 'DOC_FORWARD' ? [ele[0]] : [],
              };
            } else if (
              // 返回结果可能多条的
              [
                'CANCEL',
                'CANCELING',
                'CLOSED',
                'ENABLE',
                'CLOSEING',
                'ASSIGNED',
                'BACK_TO_UNASSIGN',
                'ERP_CANCEL',
                'ERP_CLOSED',
                'ERP_CANCEL_REVOKE',
                'SUSPEND',
                'NC_BACK',
                'ERP_CLOSED_REVOKE',
                'CLOSEDING',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode, processTypeCodeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode, processTypeCodeMeaning);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list: ele.length > 1 ? ele : [{ ...ele[0], ...iconAndProcessMeaning }],
              };
            } else {
              return {
                processTypeCode: ['UPDATE', 'NEWLINE', 'DELLINE'].includes(ele[0].processTypeCode)
                  ? 'UPDATE'
                  : ele[0].processTypeCode,
                creationDate: ele[0].creationDate,
                processUserName: ele[0].processUserName,
                processUserId: ele[0].processUserId,
                icon: 'mode_edit',
                processTypeCodeMeaning: ['UPDATE', 'NEWLINE', 'DELLINE', 'CLOSING'].includes(
                  ele[0].processTypeCode
                )
                  ? intl.get('sprm.common.view.edited').d('修改了')
                  : ele[0].processTypeCodeMeaning,
                list: ['CANCEL_REJECTED'].includes('type') ? ele[0] : ele,
              };
            }
          });
          setClassified(classified);
        }
      })
      .finally(() => {
        setActionLoading(false);
      });
    setApprovedLoading(true);
    queryApproveDate(prHeaderId)
      .then((res) => {
        if (res && !res.failed) {
          const allHistoricTaskExtList = res?.map((ele = {}) => {
            const { prHistoricTaskExtList = [] } = ele;
            return {
              id: ele.id,
              approvalType: ele.approvalType,
              approvalTypeMeaning: ele.approvalTypeMeaning,
              prHistoricTaskExtList: prHistoricTaskExtList.reverse()?.map((e) => ({
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
          }); // historicTaskExtListf prHistoricTaskExtList
          setApproveData(allHistoricTaskExtList);
        }
      })
      .finally(() => {
        setApprovedLoading(false);
      });
  }, [prHeaderId]);

  const handleQuery = (param) => {
    try {
      setActionLoading(true);
      lineDs.setState({ queryParams: param?.params || {} });
      lineDs.query(0, param?.params || {}).then((res) => {
        if (res && isArray(res)) {
          const currentItem = [];
          let batchNoArray = [];

          res.forEach((ele) => {
            if (ele.batchNo) {
              if (
                (ele.approveMethodCode && batchNoArray.includes(ele.batchNo)) ||
                ele.processTypeCode === 'SUBMITTED'
              ) {
                batchNoArray.push(ele.actionId);
              } else {
                batchNoArray.push(ele.batchNo);
              }
            } else if (['APPROVED', 'REJECTED'].includes(ele.processTypeCode)) {
              batchNoArray.push(ele.actionId);
            } else if (
              ['ASSIGNED', 'CANCELING', 'CANCEL', 'CLOSEING', 'CLOSEDING', 'CLOSED'].includes(
                ele.processTypeCode
              )
            ) {
              batchNoArray.push(ele.creationDate);
            } else {
              batchNoArray.push(ele.actionId);
            }
          });
          // 去重
          batchNoArray = Array.from(new Set(batchNoArray));

          batchNoArray.forEach((item) => {
            currentItem.push(
              res.filter(
                (ele) => ele.actionId === item || ele.batchNo === item || ele.creationDate === item
              )
            );
          });

          const classified = currentItem?.map((ele, index) => {
            dataKey[index] = 'off';
            // 只会展示1行动作的, 新建,提交,启用,加急,变更撤回
            if (
              ele.length === 1 &&
              [
                'PENDING',
                'RP_PENDING',
                'SUBMITTED',
                'AUTO_SUBMITTED',
                'URGENT',
                'URGENT_CANCEL',
                'CHANGE_REVOKE',
                'WITHDRAW',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list: [],
              };
            } else if (
              // 返回结果可能1条,可能多条的,但只展示 原因+动作
              [
                'APPROVED',
                'REJECTED',
                'CANCEL_REJECTED',
                'AUTO_SUBMITTED_FAILED',
                'SEND_BACK',
                'DOC_FORWARD',
                'SYNC',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode, processTypeCodeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode, processTypeCodeMeaning);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list:
                  ele[0].processRemark || ele[0].processTypeCode === 'DOC_FORWARD' ? [ele[0]] : [],
              };
            } else if (
              // 返回结果可能多条的
              [
                'CANCEL',
                'CANCELING',
                'CLOSED',
                'ENABLE',
                'CLOSEING',
                'ASSIGNED',
                'BACK_TO_UNASSIGN',
                'ERP_CANCEL',
                'ERP_CLOSED',
                'ERP_CANCEL_REVOKE',
                'SUSPEND',
                'NC_BACK',
                'ERP_CLOSED_REVOKE',
                'CLOSEDING',
              ].includes(ele[0].processTypeCode)
            ) {
              const { processTypeCode, processTypeCodeMeaning } = ele[0];
              const iconAndProcessMeaning = currentStatus(processTypeCode, processTypeCodeMeaning);
              return {
                ...ele[0],
                ...iconAndProcessMeaning,
                list: ele.length > 1 ? ele : [{ ...ele[0], ...iconAndProcessMeaning }],
              };
            } else {
              return {
                processTypeCode: ['UPDATE', 'NEWLINE', 'DELLINE'].includes(ele[0].processTypeCode)
                  ? 'UPDATE'
                  : ele[0].processTypeCode,
                creationDate: ele[0].creationDate,
                processUserName: ele[0].processUserName,
                processUserId: ele[0].processUserId,
                icon: 'mode_edit',
                processTypeCodeMeaning: ['UPDATE', 'NEWLINE', 'DELLINE', 'CLOSING'].includes(
                  ele[0].processTypeCode
                )
                  ? intl.get('sprm.common.view.edited').d('修改了')
                  : ele[0].processTypeCodeMeaning,
                list: ['CANCEL_REJECTED'].includes('type') ? ele[0] : ele,
              };
            }
          });
          setClassified(classified);
        }
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getQueryParams = () => {
    const { processedDateRange } = lineDs.getState('queryParams') || {};
    const [processDateStart, processDateEnd] = processedDateRange?.split(',') || [];
    return { ...lineDs.getState('queryParams'), processDateStart, processDateEnd };
  };

  const handleClear = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs?.queryDataSet?.current
      ? lineDs?.queryDataSet?.current?.reset()
      : lineDs?.queryDataSet?.loadData([{}]);
    handleQuery();
  };

  useEffect(() => {
    modal.update({
      footer: (okBtn) => {
        return (
          <>
            {okBtn}
            <ExcelExportPro
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              templateCode="SRM_C_SPRM_PR_ACTION_EXPORT" // 导出模板编码
              exportAsync // 是否异步
              otherButtonProps={{
                type: 'c7n-pro',
              }}
              requestUrl={`${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-requests/${prHeaderId}/actions/export`}
              queryParams={() => getQueryParams()}
              // allBody
              method="GET"
            />
          </>
        );
      },
    });
  }, [prHeaderId]);

  const currentStatus = (type, processTypeCodeMeaning) => {
    let currentProcessData = {};
    switch (true) {
      case ['PENDING'].includes(type):
        currentProcessData = {
          icon: 'add',
          processTypeCodeMeaning: intl.get('sprm.common.actions.add').d('新建了'),
        };
        break;
      case ['RP_PENDING'].includes(type):
        currentProcessData = {
          icon: 'add',
          processTypeCodeMeaning: intl.get('sprm.common.actions.rpAdd').d('创建了'),
        };
        break;
      case ['URGENT'].includes(type):
        currentProcessData = {
          icon: 'flash_on',
          processTypeCodeMeaning: intl.get('sprm.common.actions.urgent').d('加急了'),
        };
        break;
      case ['DOC_FORWARD'].includes(type):
        currentProcessData = {
          icon: 'call_missed_outgoing',
          processTypeCodeMeaning: intl.get('sprm.common.actions.forward').d('转交了'),
        };
        break;
      case ['URGENT_CANCEL'].includes(type):
        currentProcessData = {
          icon: 'flash_off',
          processTypeCodeMeaning: intl.get('sprm.common.actions.urgentCancel').d('取消了加急'),
        };
        break;
      case ['SUSPEND'].includes(type):
        currentProcessData = {
          icon: 'enhanced_encryption-o',
          processTypeCodeMeaning: intl.get('sprm.common.actions.suspend').d('暂挂了'),
          remarkReason: intl.get('sprm.common.model.common.suspendRemark').d('暂挂原因'),
        };
        break;
      case ['ENABLE'].includes(type):
        currentProcessData = {
          icon: 'finished',
          processTypeCodeMeaning: intl.get('sprm.common.actions.enable').d('启用了'),
        };
        break;
      case ['ERP_CANCEL_REVOKE', 'ERP_CLOSED_REVOKE'].includes(type):
        currentProcessData = {
          icon: 'finished',
          processTypeCodeMeaning: intl.get('sprm.common.actions.opened').d('打开了'),
          remarkReason: intl.get('sprm.common.model.common.reason').d('原因'),
        };
        break;
      case ['CANCEL', 'ERP_CANCEL'].includes(type):
        currentProcessData = {
          icon: 'cancel',
          processTypeCodeMeaning: intl.get('sprm.common.actions.cancel').d('取消了'),
          remarkReason: intl.get('sprm.common.view.message.cancelReason').d('取消原因'),
        };
        break;
      case ['CHANGE'].includes(type):
        currentProcessData = {
          icon: 'mode_edit',
          processTypeCodeMeaning: intl.get('sprm.common.actions.changed').d('变更了'),
        };
        break;
      case ['UPDATE', 'NEWLINE', 'DOC_FORWARD'].includes(type):
        currentProcessData = {
          icon: 'mode_edit',
          processTypeCodeMeaning: intl.get('sprm.common.actions.update').d('修改了'),
        };
        break;
      case ['CANCELING'].includes(type):
        currentProcessData = {
          icon: 'cancel',
          remarkReason: intl.get('sprm.common.view.message.cancelReason').d('取消原因'),
          processTypeCodeMeaning: intl.get('sprm.common.action.cacel').d('正在取消'),
        };
        break;
      case ['APPROVED', 'REJECTED', 'CANCEL_REJECTED'].includes(type):
        currentProcessData = {
          icon: 'authorize',
          color: type === 'APPROVED' ? 'rgb(71, 184, 131)' : 'rgb(245, 102, 73)',
          processTypeCodeMeaning: intl.get('sprm.common.button.approval').d('最终审批了'),
          approveCodeMeaning: processTypeCodeMeaning,
          remarkReason: intl.get('sprm.common.title.approveRemark').d('审批意见'),
        };
        break;
      case ['SYNC'].includes(type):
        currentProcessData = {
          icon: 'check',
          remarkReason: intl.get('sprm.common.title.syncResult').d('同步结果'),
        };
        break;
      case ['SUBMITTED'].includes(type):
        currentProcessData = {
          icon: 'check',
          processTypeCodeMeaning: intl.get('sprm.common.actions.submit').d('提交了'),
        };
        break;
      case ['AUTO_SUBMITTED'].includes(type):
        currentProcessData = {
          icon: 'check',
          processTypeCodeMeaning: intl.get('sprm.common.actions.autoSubmit').d('自动提交了'),
        };
        break;
      case ['AUTO_SUBMITTED_FAILED'].includes(type):
        currentProcessData = {
          icon: 'not_interested',
          processTypeCodeMeaning: intl.get('sprm.common.actions.autoSubmitFailed').d('自动提交失败了'),
          remarkReason: intl.get('sprm.common.model.common.reason').d('原因'),
        };
        break;
      case ['CLOSED', 'ERP_CLOSED'].includes(type):
        currentProcessData = {
          icon: 'not_interested',
          processTypeCodeMeaning: intl.get('sprm.common.actions.closed').d('关闭了'),
          remarkReason: intl.get('sprm.common.view.message.closeReason').d('关闭原因'),
        };
        break;
      case ['CLOSEDING'].includes(type):
        currentProcessData = {
          icon: 'not_interested',
          processTypeCodeMeaning: intl.get('sprm.common.actions.closeding').d('正在关闭'),
          remarkReason: intl.get('sprm.common.view.message.closeReason').d('关闭原因'),
        };
        break;
      case ['SEND_BACK', 'NC_BACK'].includes(type):
        currentProcessData = {
          icon: 'reply',
          processTypeCodeMeaning: intl.get('sprm.common.actions.sendBack').d('退回了'),
          remarkReason: intl.get('sprm.common.model.common.reason').d('原因'),
        };
        break;

      case ['CHANGE_REVOKE', 'WITHDRAW', 'BACK_TO_UNASSIGN'].includes(type):
        currentProcessData = {
          icon: 'reply',
        };
        break;
      case ['ASSIGNED'].includes(type):
        currentProcessData = {
          processTypeCodeMeaning: intl.get('sprm.common.actions.assigned').d('分配了'),
          icon: 'auto_complete',
        };
        break;
      default:
        currentProcessData = {
          icon: 'person_pin_circle',
        };
        return;
    }
    return currentProcessData;
  };

  //
  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  const onViewDetail = useCallback((data) => {
    setActiveKey('approved');

    setTimeout(() => {
      const nowTime = data.creationDate;
      // 先从审批记录里面过滤出审批节点
      const approveNodeArr = approveArr.length
        ? approveArr
        : approveData
            .reduce(
              (a, b) => a.concat(b.prHistoricTaskExtList.filter((ele) => ele.nodeStatusCode)),
              []
            )
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
        down.href =
          approveNodeArr[index] && approveNodeArr[index]?.id
            ? `#${approveNodeArr[index]?.id}`
            : null;
        down.click();
        down.remove();
      }
    }, 0);
  });

  const renderOperateHistory = () => {
    return (
      <Spin spinning={actionLoading}>
        <Timeline className="operating-timeline">
          {classifiedData?.map((item, index) => (
            <Item
              color={item.color || '#E5E5E5'}
              onClick={() => {
                const [...current] = dataKey;
                current[index] = current[index] === 'on' ? 'off' : 'on';
                setDataKey(current);
              }}
            >
              <Icon
                type={item.icon}
                style={{
                  fontSize: 14,
                  top: 2,
                  position: 'relative',
                }}
              />
              <div className="operating-timeline-info">
                {item.approveMethodCode === 'WORKFLOW' ||
                (isEmpty(item.processUserName) &&
                  item.approveMethodCode === 'EXTERNAL_APPROVAL') ? (
                    <>
                      {item.approveMethodCode === 'WORKFLOW' ? (
                        <span>
                          <a
                            onClick={() => onViewDetail(item)}
                            style={{
                            color: item.processTypeCode === 'APPROVED' ? '#47b881' : '#f56349',
                          }}
                          >
                            {item.processTypeCode === 'APPROVED'
                            ? intl.get(`sprm.common.status.workfolw.adopt`).d('工作流审批通过')
                            : intl.get(`sprm.common.status.workfolw.reject`).d('工作流审批拒绝')}
                          </a>
                        </span>
                    ) : (
                      <span>
                        <a
                          style={{
                            color: item.processTypeCode === 'APPROVED' ? '#47b881' : '#f56349',
                          }}
                        >
                          {item.processTypeCode === 'APPROVED'
                            ? intl.get(`sprm.common.status.external.adopt`).d('外部系统审批通过')
                            : intl.get(`sprm.common.status.external.reject`).d('外部系统审批拒绝')}
                        </a>
                      </span>
                    )}
                    </>
                 ) : ['AUTO_SUBMITTED', 'AUTO_SUBMITTED_FAILED'].includes(item.processTypeCode) ? (
                  <>
                    {/* 第一行：主描述（和审批通过 / 拒绝同一层级） */}
                    <span className="operator">{intl.get('sprm.common.system').d('系统')}</span>

                    <span className="status gray">
                      {intl.get('sprm.common.view.autoSubmit').d('自动提交了')}
                    </span>

                    <span className="result">
                      {intl.get('sprm.common.view.requisition').d('【申请单】')}
                    </span>

                    <span className="status gray">
                      {intl.get('sprm.common.view.submitResult').d('提交结果为')}
                    </span>

                    <span className="result">
                      <span
                        style={{
                          color:
                            item.processTypeCode === 'AUTO_SUBMITTED'
                              ? 'rgb(71, 184, 131)'
                              : 'rgb(245, 102, 73)',
                        }}
                      >
                        【
                        {item.processTypeCode === 'AUTO_SUBMITTED'
                          ? intl.get('sprm.common.status.success').d('成功')
                          : intl.get('sprm.common.status.failed').d('失败')}
                        】
                      </span>
                    </span>

                    {/* 第二行：失败原因（样式 = 审批意见） */}
                    {item.processTypeCode === 'AUTO_SUBMITTED_FAILED' && item.processRemark && (
                      <div className="date">
                        <span className="status" style={{ color: 'rgb(245, 102, 73)' }}>
                          {intl.get('sprm.common.view.failureReason').d('失败原因')}：
                          {item.processRemark}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    {['RP_PENDING'].includes(item.processTypeCode) && (
                      <>
                        <span className="status gray">
                          {intl.get('sprm.common.view.let').d('将')}
                        </span>
                        <span className="result">
                          {intl.get('sprm.common.view.requisitionplan').d('【需求计划单】')}
                        </span>
                      </>
                    )}
                    <span className="status gray">{item.processTypeCodeMeaning}</span>
                    <span className="result">
                      {intl.get('sprm.common.view.requisition').d('【申请单】')}
                    </span>
                    {['APPROVED', 'REJECTED', 'CANCEL_REJECTED'].includes(item.processTypeCode) && (
                      <>
                        <span className="status gray">
                          {intl.get('sprm.common.view.approveResult').d('审批结果为')}
                        </span>
                        <span className="result">
                          <span
                            style={{
                              color:
                                item.processTypeCode === 'APPROVED'
                                  ? 'rgb(71, 184, 131)'
                                  : 'rgb(245, 102, 73)',
                            }}
                          >
                            【{item.approveCodeMeaning}】
                          </span>
                        </span>
                      </>
                    )}
                    {!isEmpty(item.list) && (
                      <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
                    )}
                    {item.list &&
                      dataKey[index] === 'on' &&
                      item.list?.map((ele) => {
                        if (['DOC_FORWARD', 'CHANGE', 'UPDATE'].includes(ele.processTypeCode)) {
                          return typeof handleCuxOperation === 'function' &&
                            handleCuxOperation({ ele })
                            ? handleCuxOperation({ ele })
                            : ele.changeFieldMeaning
                            ? intl
                                .getHTML('sprm.common.view.message.actionRecord', {
                                  processUserName: ele.processUserName || externalProcessUserName,
                                  changeFieldMeaning: ele.changeFieldMeaning,
                                  oldValue: ele.oldValue,
                                  newValue: ele.newValue,
                                  lineNumber: ele.displayLineNum || '-',
                                })
                                .d(
                                  <div className="date">
                                    <span className="status gray">
                                      {ele.processUserName || externalProcessUserName}
                                    </span>
                                    将
                                    <span className="status gray">
                                      【{ele.changeFieldMeaning}】
                                    </span>
                                    由<span className="status gray">【{ele.oldValue}】</span>
                                    改成
                                    <span className="status gray">【{ele.newValue}】</span>
                                    <span>
                                      行号
                                      <span className="status gray">【{ele.displayLineNum}】</span>
                                    </span>
                                  </div>
                                )
                            : intl
                                .getHTML('sprm.common.view.message.act', {
                                  processUserName: ele.processUserName || externalProcessUserName,
                                  oldValue: ele.oldValue,
                                  newValue: ele.newValue,
                                })
                                .d(
                                  <div className="date">
                                    <span className="status gray">
                                      {ele.processUserName || externalProcessUserName}
                                    </span>{' '}
                                    将<span className="status gray">【{ele.oldValue}】</span>
                                    改成
                                    <span className="status gray">【{ele.newValue}】</span>
                                  </div>
                                );
                        } else if (
                          [
                            'ASSIGNED',
                            'NEWLINE',
                            'ENABLE',
                            'DELLINE',
                            'BACK_TO_UNASSIGN',
                            'SUSPEND',
                            'ERP_CLOSED_REVOKE',
                            'ERP_CANCEL_REVOKE',
                            'NC_BACK',
                          ].includes(ele.processTypeCode) ||
                          ([
                            'CLOSEING',
                            'CANCELING',
                            'CANCEL',
                            'ERP_CANCEL',
                            'ERP_CLOSED',
                            'CLOSE',
                          ].includes(ele.processTypeCode) &&
                            ele.length > 1)
                        ) {
                          return (
                            <>
                              {remote &&
                                remote.render(
                                  'SPRM_OPERATION_HISTORY_RENDER',
                                  <div className="date">
                                    <span className="status gray">
                                      {ele.processUserName || externalProcessUserName}
                                    </span>
                                    {ele.displayLineNum ? (
                                      <span className="gray">
                                        {ele.processTypeCodeMeaning}
                                        {intl.get('sprm.common.view.line').d('行')}【
                                        {ele.displayLineNum}】
                                      </span>
                                    ) : (
                                      <span className="gray">
                                        {ele.processTypeCodeMeaning}
                                        {intl.get('sprm.common.view.requisition').d('【申请单】')}
                                      </span>
                                    )}

                                    {[
                                      'SUSPEND',
                                      'ERP_CLOSED_REVOKE',
                                      'ERP_CANCEL_REVOKE',
                                      'BACK_TO_UNASSIGN',
                                      'NC_BACK',
                                    ].includes(ele.processTypeCode) && (
                                      <span className="status gray">
                                        {item.remarkReason}:{item.processRemark}
                                      </span>
                                    )}
                                    {ele.processTypeCode === 'ASSIGNED' && ele.multiExecutorName && (
                                      <span className="status gray">
                                        {intl
                                          .get('sprm.common.view.message.assignedToActor', {
                                            multiExecutorName: ele.multiExecutorName,
                                          })
                                          .d(`分配给${ele.multiExecutorName}`)}
                                      </span>
                                    )}
                                  </div>,
                                  { ele, externalProcessUserName, item }
                                )}
                            </>
                          );
                        } else if (typeof handleRenderCuxOperation === 'function') {
                          return handleRenderCuxOperation({ ele });
                        } else {
                          return <div />;
                        }
                      })}
                    {!isEmpty(item.list) &&
                      dataKey[index] === 'on' &&
                      [
                        'APPROVED',
                        'REJECTED',
                        'CANCEL_REJECTED',
                        'CANCELING',
                        'CANCEL',
                        'SEND_BACK',
                        'CLOSEING',
                        'CLOSED',
                        'ERP_CANCEL',
                        'ERP_CLOSED',
                        'SYNC',
                        'CLOSEDING',
                      ].includes(item.processTypeCode) &&
                      item.list?.map((ele) => (
                        <div className="date">
                          {ele.displayLineNum ? (
                            <span className="gray">
                              {`${ele.processTypeCodeMeaning} ${intl
                                .get('sprm.common.view.line')
                                .d('行')}【${ele.displayLineNum}】`}
                            </span>
                          ) : (
                            ''
                          )}
                          <span
                            className="status gray"
                            style={{
                              color: ['REJECTED', 'CANCEL_REJECTED'].includes(item.processTypeCode)
                                ? 'rgb(245, 102, 73)'
                                : item.processTypeCode === 'APPROVED'
                                ? 'rgb(71, 184, 131)'
                                : 'rgba(0, 0, 0, 0.45)',
                            }}
                          >
                            {item.remarkReason}:
                          </span>
                          <span
                            className="status gray"
                            style={{
                              color: ['REJECTED', 'CANCEL_REJECTED'].includes(item.processTypeCode)
                                ? 'rgb(245, 102, 73)'
                                : item.processTypeCode === 'APPROVED'
                                ? 'rgb(71, 184, 131)'
                                : 'rgba(0, 0, 0, 0.45)',
                            }}
                          >
                            {ele.processRemark}
                          </span>
                        </div>
                      ))}
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
    <div className={style.operating}>
      {approveData?.length ? (
        <div className={style['operating-content']}>
          <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane tab={intl.get(`hzero.common.button.operating`).d('操作记录')} key="operator">
              <FilterBar
                dataSet={[lineDs]}
                onQuery={handleQuery}
                onClear={handleClear}
                autoQuery={false}
                expandable={false}
              />

              <div className={style['scroll-content']}>{renderOperateHistory()}</div>
            </TabPane>
            {approveData?.length ? (
              <TabPane
                tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')}
                key="approved"
              >
                <div className={style['scroll-content']}>
                  <Spin spinning={approvedLoading}>
                    {/* {approveData?.map(ele => (
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
                            <ApproveRecord data={ele.prHistoricTaskExtList} />
                          </Panel>
                        </Collapse>
                      </>
                    ))} */}
                    <ApproveRecordGroup
                      group={approveData.map((ele) => ({
                        title: ele.approvalTypeMeaning,
                        children: ele.prHistoricTaskExtList,
                      }))}
                    />
                    {!approveData?.length && handleNoData()}
                  </Spin>
                </div>
              </TabPane>
            ) : null}
          </Tabs>
        </div>
      ) : (
        <div>
          <FilterBar
            dataSet={[lineDs]}
            onQuery={handleQuery}
            onClear={handleClear}
            autoQuery={false}
            expandable={false}
          />
          {renderOperateHistory()}
        </div>
      )}
    </div>
  );
};

export default flowRight(
  formatterCollections({
    code: ['sprm.common', 'hwfp.common', 'hwfp.task', 'hwfp.monitor', 'hpfm.organization'],
  }),
  cuxRemote(
    {
      code: 'SPRM_OPERATING_HISTORY_REMOTE',
      name: 'remote',
    },
    {
      process: {},
    }
  )
)(Index);
