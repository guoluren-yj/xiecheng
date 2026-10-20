import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Tabs, Timeline, Icon, Spin } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
// import ApproveRecord from '_components/ApproveRecord';
import ApproveRecordGroup from '_components/ApproveRecordGroup';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { getCurrentOrganizationId } from 'utils/utils';

import {
  fetchActionHistory,
  fetchApproveHistory,
} from '@/services/materialCertificationPoolService';

import { operateDS } from './indexDS';

import styles from './index.less';

const commonPrompt = 'smdm.common.model.common';
const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Item } = Timeline;
// const { Panel } = Collapse;
const OperationHistory = ({ nodeCodeMeaning, itemAuthReqHeaderId, authenticatedFlag, isFilterFlag, modal }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [approveData, setApproveData] = useState([]);
  const [approveLoading, setApproveLoading] = useState(false);
  const [operaLoading, setOperaLoading] = useState(false);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  const operateLineDs = useMemo(() => new DataSet(operateDS({ itemAuthReqHeaderId })), [itemAuthReqHeaderId]);
  useEffect(() => {
    // 审批记录
    setApproveLoading(true);
    fetchApproveHistory(itemAuthReqHeaderId)
      .then((res) => {
        if (res && isArray(res)) {
          const allHistoricTaskExtList = res?.reverse()?.map((ele = {}) => {
            const { historicTaskExtList = [] } = ele;
            return {
              id: ele.id,
              approvalType: ele.approvalType,
              approvalTypeMeaning: ele.documentDescription,
              prHistoricTaskExtList: historicTaskExtList.reverse()?.map((e) => ({
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
      .finally(() => setApproveLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemAuthReqHeaderId]);

  useEffect(() => {
    handleQuery({});
  }, [handleQuery]);

  const handleQuery = useCallback((params) => {
    // 操作记录
    setOperaLoading(true);
    const { processedDateRange, ...other } = params?.params || {};
    const [createDateStr, createDateEnd] = processedDateRange?.split(',') || [];
    const queryParams = { createDateStr, createDateEnd, ...other };
    operateLineDs.setState({ queryParams });
    fetchActionHistory({ itemAuthReqHeaderId, authenticatedFlag, ...queryParams })
      .then((res) => {
        if (res && isArray(res)) {
          const parentItem = res.filter((ele) => ele.parentFlag === 1);
          const otherItem = res.filter((ele) => ele.parentFlag !== 1);
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              otherItem.map((ele) => {
                return ele.uniqueKey || ele.creationDate;
              })
            )
          );
          batchNoArray.forEach((item) => {
            const data = otherItem.filter(
              (ele) =>
                ele.uniqueKey === item ||
                (!ele.uniqueKey && ele.creationDate === item && ele.processType !== 'UPDATE')
            );
            const aloneData = data.filter((ele) =>
              [
                'AUTHENTICATION_APPROVED',
                'SUBMITTED',
                'APPROVED',
                'RELEASE_COMPLETE',
                'FEEDBACK_COMPLETE',
                'APPROVED_REQ',
                'REJECTED_REQ',
                'INITIATE_SAMPLE_SUBMISSION',
                'INPUT_SUBMISSION',
                'FEEDBACK_REVOKE',
                'CLOSED_REJECTED',
              ].includes(ele.processType)
            );
            // 将独立操作单独拿出来
            if (data.length > 1 && aloneData?.length) {
              currentItem.push(...data.map((ele) => [ele]));
            } else {
              currentItem.push(data);
            }
          });
          const classified = currentItem
            .filter((item) => item?.length)
            .map((ele, index) => {
              dataKey[index] = 'off';
              // 只会展示1行动作的 ,审批通过,审批拒绝,删除,取消,撤回
              if (
                ele.length === 1 &&
                [
                  'SUBMITTED',
                  'APPROVE',
                  'APPROVED',
                  'REJECT',
                  'REJECTED',
                  'DELETE',
                  // 'CANCEL',
                  'REVOKE',
                  // 'SKIP',
                  'AUTHENTICATION_APPROVAL',
                  'AUTHENTICATION_APPROVED',
                  'CLOSED_REJECTED',
                  'AUTHENTICATION_REJECTED',
                  'PREAPPROVAL',
                  'RELEASE_COMPLETE',
                  'FEEDBACK_COMPLETE',
                  // 'EARLY_TERMINATION',
                  'APPROVED_REQ',
                  'REJECTED_REQ',
                  'INPUT_SUBMISSION',
                  'INITIATE_SAMPLE_SUBMISSION',
                  'FEEDBACK_REVOKE',
                  'SCUX_ATT_CONFIRM',
                  'SCUX_ATT_REJECT',
                  'SCUX_ATT_SUBMIT',
                ].includes(ele[0].processType)
              ) {
                const { processType, processTypeMeaning } = ele[0] || {};
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  ...ele[0],
                  ...iconAndProcessMeaning,
                  list: [],
                };
                // 'UPDATE', 'UPDATE_LINE', 'DEL_LINE' 'NEW_LINE',
                // 会展示多行 更新、更新行、变更 新增行 删除行
              } else {
                const parentData =
                  parentItem.find((e) => e.uniqueKey === ele[0]?.uniqueKey) || ele[0];
                const { processType, processTypeMeaning } = parentData || {};
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  processType: parentData?.processType,
                  creationDate: ele[0]?.creationDate,
                  processUserName: ele[0]?.processUserName,
                  processDirections: parentData?.processDirections,
                  // reqLineNum: ele[0].reqLineNum,
                  reason: parentData?.reason,
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
  }, [itemAuthReqHeaderId, authenticatedFlag, operateLineDs]);

  useEffect(() => {
    handleUpdateFooterBtn();
  }, [handleUpdateFooterBtn, activeKey]);

  const getQueryParams = useCallback(() => {
    return {
      ...(operateLineDs.getState('queryParams')),
      itemAuthReqHeaderId,
    };
  }, [itemAuthReqHeaderId, operateLineDs]);

  const handleUpdateFooterBtn = useCallback(() => {
    if (modal && isFilterFlag) {
      if (activeKey === 'operator') {
        modal.update({
          footer: (okBtn) => [
            okBtn,
            <ExcelExportPro
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              templateCode='SMDM_ITEM_AUTH_REQ_ACTION_EXPORT' // 导出模板编码
              exportAsync
              otherButtonProps={{
                type: 'c7n-pro',
              }}
              requestUrl={`/smdm/v1/${getCurrentOrganizationId()}/item-auth-req-actions/record/export`}
              queryParams={() => getQueryParams()}
              allBody
              method="POST"
            />,
          ],
        });
      } else {
        modal.update({
          footer: (okBtn) => [okBtn],
        });
      }
    }
  }, [modal, getQueryParams, activeKey, isFilterFlag]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    let newProcessTypeMeaning = processTypeMeaning;
    switch (true) {
      case ['PENDING', 'NEW_LINE', 'NEW_ATTACHMENT', 'NEW_SAMPLE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DEL_LINE', 'DEL_ATTACHMENT', 'DEL_SAMPLE'].includes(type):
        icon = 'delete';
        break;
      case ['UPDATE', 'UPDATE_LINE', 'UPDATE_ATTACHMENT'].includes(type):
        icon = 'mode_edit';
        break;
      case [
        'APPROVE',
        'APPROVED',
        'REJECT',
        'REJECTED',
        'AUTHENTICATION_APPROVED',
        'CLOSED_REJECTED',
        'AUTHENTICATION_REJECTED',
        'PREAPPROVAL_REJECTED',
        'PREAPPROVED',
        'FEEDBACK_REJECTED',
      ].includes(type):
        icon = 'authorize';
        break;
      case [
        'SUBMIT',
        'EARLY_TERMINATION',
        'SKIP',
        'FEEDBACK_REVOKE',
        'RELEASE_COMPLETE',
        'FEEDBACK_COMPLETE',
        'SCUX_RELEASE_COMPLETE',
      ].includes(type):
        icon = 'done_all';
        break;
      case [
        'RE_TO_TEST_RESULTS_TO_BE_ENTER',
        'RETURN_TO_PRE_APPROVAL',
        'RETURN_TO_VENDOR_FEEDBACK',
      ].includes(type):
        icon = 'done_all';
        newProcessTypeMeaning = intl.get('hzero.common.button.return').d('退回');
        break;
      case ['REVOKE'].includes(type):
        icon = 'reply';
        break;
      case ['CANCEL', 'CLOSED'].includes(type):
        icon = 'cancel';
        break;
      default:
        break;
    }
    return { icon, processTypeMeaning: newProcessTypeMeaning };
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
        // 先从审批记录里面过滤出审批阶段
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderOperateHistory = () => {
    return (
      <Spin spinning={operaLoading}>
        {
          isFilterFlag && (
            <FilterBar
              dataSet={[operateLineDs]}
              onQuery={handleQuery}
              autoQuery={false}
              expandable={false}
            />
          )
        }
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
                {[
                  'APPROVE',
                  'APPROVED',
                  'REJECTED',
                  'REJECT',
                  'AUTHENTICATION_APPROVED',
                  'AUTHENTICATION_REJECTED',
                  'CLOSED_REJECTED',
                  'CLOSED_APPROVED',
                ].includes(item.processType) && (
                  <>
                    <span>
                      <a
                        onClick={() => onViewDetail(item.processType, item)}
                        className={
                          [
                            'APPROVE',
                            'APPROVED',
                            'AUTHENTICATION_APPROVED',
                            'CLOSED_APPROVED',
                          ].includes(item.processType)
                            ? 'operating-timeline-info-item-adopt'
                            : 'operating-timeline-info-item-reject'
                        }
                      >
                        {item.processTypeMeaning}
                      </a>
                    </span>
                  </>
                )}

                {item.processType === 'RELEASE_COMPLETE' && (
                  <>
                    <span className="operator">{intl.get(`${commonPrompt}.system`).d('系统')}</span>
                    <span className="status gray">
                      {intl.get(`${commonPrompt}.autoPublish`).d('自动发布')}
                    </span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
                    </span>
                  </>
                )}

                {item.processType === 'FEEDBACK_COMPLETE' && (
                  <>
                    <span className="operator">
                      {`${intl.get(`${commonPrompt}.supplier`).d('供应商')}【${
                        item.processDirections
                      }】${intl.get(`${commonPrompt}.feadBackAction`).d('反馈了')}`}
                    </span>

                    <span className="result">
                      {intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
                    </span>
                  </>
                )}

                {item.processType === 'FEEDBACK_REJECTED' && (
                  <>
                    <span className="operator">
                      {`${intl.get(`${commonPrompt}.supplier`).d('供应商')}【${
                        item.processUserName
                      }】${intl.get(`${commonPrompt}.feadBackReject`).d('反馈拒绝了')}`}
                    </span>

                    <span className="result">
                      {intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
                    </span>

                    {!isEmpty(item.list) && (
                      <Icon
                        type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                        style={{ fontSize: 14, marginTop: '2px' }}
                      />
                    )}

                    {item.list &&
                      dataKey[index] === 'on' &&
                      item.list.map((ele) => {
                        return (
                          <div className="date">
                            <span className="status gray">
                              {intl.get(`${commonPrompt}.feedbackRejectedReason`).d('反馈拒绝原因')}
                              :{ele.processDirections || '-'}
                            </span>
                          </div>
                        );
                      })}
                  </>
                )}

                {item.processType === 'APPROVED_REQ' && (
                  <>
                    <span className="operator">
                      {intl
                        .get(`${commonPrompt}.materialFeedDocApproved`, {
                          value: item.nodeMeaning,
                        })
                        .d(`物料认证节点【${item.nodeMeaning}】反馈单已审批通过`)}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.approvedRemarkIs`, {
                              value: item.processDirections || '-',
                            })
                            .d(`审批意见为【${item.processDirections || '-'}】`)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'REJECTED_REQ' && (
                  <>
                    <span className="operator">
                      {intl
                        .get(`${commonPrompt}.materialFeedDocReject`, {
                          value: item.nodeMeaning,
                        })
                        .d(`物料认证节点【${item.nodeMeaning}】反馈单已审批拒绝`)}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.approvedRemarkIs`, {
                              value: item.processDirections || '-',
                            })
                            .d(`审批意见为【${item.processDirections || '-'}】`)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'RETURN_TO_PRE_APPROVAL' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.itemAuthToPreApproval`).d('物料认证申请单至预审')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnAuthPreApprovalInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证申请单的【${nodeCodeMeaning}】阶段至预审，原因是 ${
                                item.processDirections || '-'
                              }`
                            )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'RE_TO_TEST_RESULTS_TO_BE_ENTER' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl
                        .get(`${commonPrompt}.itemAuthToTestResult`)
                        .d('物料认证申请单至检测结果待录入')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnAuthTestResultInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证申请单的【${nodeCodeMeaning}】阶段至检测结果待录入，原因是 ${
                                item.processDirections || '-'
                              }`
                            )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'RETURN_TO_VENDOR_FEEDBACK' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl
                        .get(`${commonPrompt}.itemAuthToFeedback`)
                        .d('物料认证申请单至供应商反馈')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnAuthFeedbackInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证申请单的【${nodeCodeMeaning}】阶段至供应商反馈，原因是 ${
                                item.processDirections || '-'
                              }`
                            )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'FEEDBACK_REVOKE' && (
                  <>
                    <span className="operator">
                      {intl
                        .get(`${commonPrompt}.materialFeedDocRevoke`, {
                          value: nodeCodeMeaning,
                        })
                        .d(`物料认证节点【${nodeCodeMeaning}】反馈单已撤回`)}
                    </span>
                  </>
                )}

                {item.processType === 'SCUX_RELEASE_COMPLETE' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
                    </span>
                    {!isEmpty(item.list) && (
                      <Icon
                        type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                        style={{ fontSize: 14, marginTop: '2px' }}
                      />
                    )}
                    {item.list && dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="operator">
                          {item.processUserName || externalProcessUserName}
                        </span>
                        <span className="status gray">{item.processDirections}</span>
                      </div>
                    )}
                  </>
                )}
                {/* 绿联操作阶段附件信息 */}
                {['SCUX_ATT_CONFIRM', 'SCUX_ATT_REJECT', 'SCUX_ATT_SUBMIT'].includes(
                  item.processType
                ) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl
                        .get(`${commonPrompt}.materialAuthReqDocStageAtt`)
                        .d('物料认证申请单阶段附件')}
                    </span>
                    <span className="status gray">【{item.attachmentCodeAndName}】</span>
                    {item.processType === 'SCUX_ATT_REJECT' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`smdm.common.model.cux.rejectExplanationIs`, {
                              value: item.processDirections || '-',
                            })
                            .d(`驳回说明为【{value}】`)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {![
                  'APPROVE',
                  'APPROVED',
                  'REJECT',
                  'REJECTED',
                  'AUTHENTICATION_APPROVED',
                  'CLOSED_APPROVED',
                  'CLOSED_REJECTED',
                  'AUTHENTICATION_REJECTED',
                  'RELEASE_COMPLETE',
                  'FEEDBACK_COMPLETE',
                  'APPROVED_REQ',
                  'REJECTED_REQ',
                  'FEEDBACK_REVOKE',
                  'FEEDBACK_REJECTED',
                  'SCUX_RELEASE_COMPLETE',
                  'SCUX_ATT_CONFIRM',
                  'SCUX_ATT_REJECT',
                  'SCUX_ATT_SUBMIT',
                  'RE_TO_TEST_RESULTS_TO_BE_ENTER',
                  'RETURN_TO_PRE_APPROVAL',
                  'RETURN_TO_VENDOR_FEEDBACK',
                ].includes(item.processType) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {['PREAPPROVAL_REJECTED', 'PREAPPROVED'].includes(item.processType)
                        ? intl.get(`${commonPrompt}.materialFedAuthDoc`).d('物料认证反馈单')
                        : intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
                    </span>
                    {!isEmpty(item.list) && (
                      <Icon
                        type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                        style={{ fontSize: 14, marginTop: '2px' }}
                      />
                    )}
                    {item.list &&
                      dataKey[index] === 'on' &&
                      item.list.map((ele) => {
                        if (
                          ['UPDATE', 'UPDATE_LINE', 'UPDATE_ATTACHMENT'].includes(ele.processType)
                        ) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {ele.processUserName || externalProcessUserName}
                              </span>
                              <span className="status gray">
                                {intl.get(`${commonPrompt}.jiang`).d('将')}
                              </span>
                              <span className="status gray">【{ele.changeFieldName}】</span>
                              {intl.get(`${commonPrompt}.you`).d('由')}
                              <span className="status gray">【{ele.oldValue}】</span>
                              {intl.get(`${commonPrompt}.change`).d('改成')}
                              <span className="status gray">【{ele.newValue}】</span>

                              {ele.reqLineNum &&
                                ['UPDATE', 'UPDATE_LINE'].includes(ele.processType) && (
                                  <span className="status gray">
                                    {`${intl
                                      .get(`${commonPrompt}.detailInfoLine`)
                                      .d('明细信息行')} ${intl
                                      .get(`${commonPrompt}.lineNum`)
                                      .d('行号')}:${ele.reqLineNum}`}
                                  </span>
                                )}
                              {ele.attachmentCodeAndName &&
                                ['UPDATE', 'UPDATE_ATTACHMENT'].includes(ele.processType) && (
                                  <span className="status gray">
                                    {intl.get(`${commonPrompt}.nodeInfoLine`).d('阶段信息行')}【
                                    {ele.attachmentCodeAndName}】
                                  </span>
                                )}
                              {ele.reqSampleNum && ['UPDATE'].includes(ele.processType) && (
                                <span className="status gray">
                                  {`${intl
                                    .get(`${commonPrompt}.sampleLine`)
                                    .d('样品信息行')} ${intl
                                    .get(`${commonPrompt}.lineNum`)
                                    .d('行号')}:${ele.reqSampleNum || ''}`}
                                </span>
                              )}
                            </div>
                          );
                        } else if (['NEW_LINE', 'DEL_LINE'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName || externalProcessUserName} ${
                                  ele.processTypeMeaning
                                } ${intl
                                  .get(`${commonPrompt}.detailInfoLine`)
                                  .d('明细信息行')} ${intl
                                  .get(`${commonPrompt}.lineNum`)
                                  .d('行号')}:${ele.reqLineNum}`}
                              </span>
                            </div>
                          );
                        } else if (['NEW_ATTACHMENT', 'DEL_ATTACHMENT'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName || externalProcessUserName} ${
                                  ele.processTypeMeaning
                                } ${intl.get(`${commonPrompt}.nodeInfoLine`).d('阶段信息行')}【${
                                  ele.attachmentCodeAndName
                                }】`}
                              </span>
                            </div>
                          );
                        } else if (['NEW_SAMPLE', 'DEL_SAMPLE'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName || externalProcessUserName} ${
                                  ele.processTypeMeaning
                                } ${intl
                                  .get(`${commonPrompt}.sampleLine`)
                                  .d('样品信息行')} ${intl
                                  .get(`${commonPrompt}.lineNum`)
                                  .d('行号')}:${ele.reqSampleNum || ''}`}
                              </span>
                            </div>
                          );
                        } else if (
                          ['CANCEL', 'CLOSED', 'CLOSEDING', 'SKIP', 'EARLY_TERMINATION'].includes(
                            ele.processType
                          )
                        ) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName || externalProcessUserName} ${
                                  ele.processTypeMeaning
                                } ${intl
                                  .get(`${commonPrompt}.materialAuthDoc`)
                                  .d('物料认证申请单')} ${intl
                                  .get(`${commonPrompt}.de`)
                                  .d('的')}【${nodeCodeMeaning}】${intl
                                  .get(`${commonPrompt}.stage`)
                                  .d('阶段')}，${intl
                                  .get(`${commonPrompt}.reasonIs`)
                                  .d('原因是')}：${ele.processDirections || ''}`}
                              </span>
                            </div>
                          );
                        } else if (
                          ['PREAPPROVAL_REJECTED', 'PREAPPROVED'].includes(item.processType)
                        ) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {intl
                                  .get(`${commonPrompt}.preRemarkIs`, {
                                    value: item.processDirections || '',
                                  })
                                  .d(`预审意见为【${item.processDirections || ''}】`)}
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
                    {/* <ApproveRecord data={approveData} /> */}
                    <ApproveRecordGroup
                      group={approveData.map((ele) => ({
                        title: ele.approvalTypeMeaning,
                        children: ele.prHistoricTaskExtList,
                      }))}
                    />

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
  code: ['hzero.common', 'smdm.common'],
})(OperationHistory);
