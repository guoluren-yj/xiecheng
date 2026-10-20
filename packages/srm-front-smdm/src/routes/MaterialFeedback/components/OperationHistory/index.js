import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Tabs, Timeline, Icon, Spin } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { getCurrentOrganizationId } from 'utils/utils';

import { fetchActionHistory } from '@/services/materialFeedbackService';
import { operateDS } from './indexDS';

import styles from './index.less';

const commonPrompt = 'smdm.common.model.common';
const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Item } = Timeline;
// const { Panel } = Collapse;
const OperationHistory = ({ nodeCodeMeaning, itemAuthFeeHeaderId, isFilterFlag, modal }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [approveData] = useState([]);
  const [approveLoading] = useState(false);
  const [operaLoading, setOperaLoading] = useState(false);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  const operateLineDs = useMemo(() => new DataSet(operateDS({ itemAuthFeeHeaderId })), [itemAuthFeeHeaderId]);
  // useEffect(() => {
  //   // 审批记录
  //   // setApproveLoading(true);
  //   // fetchApproveHistory(itemAuthFeeHeaderId)
  //   //   .then((res) => {
  //   //     if (res && isArray(res)) {
  //   //       let allHistoricTaskExtList = [];
  //   //       res.forEach((ele) => {
  //   //         allHistoricTaskExtList = allHistoricTaskExtList.concat(ele.historicTaskExtList || []);
  //   //       });
  //   //       setApproveData(
  //   //         allHistoricTaskExtList.reverse().map((e) => ({
  //   //           ...e,
  //   //           name: e.nodeStatus ? (
  //   //             <span id={e.id} style={{ marginRight: e.name ? '0px' : '-0.04rem' }}>
  //   //               {e.name}
  //   //             </span>
  //   //           ) : (
  //   //             e.name
  //   //           ),
  //   //         }))
  //   //       );
  //   //     }
  //   //   })
  //   //   .finally(() => setApproveLoading(false));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [itemAuthFeeHeaderId]);

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
    fetchActionHistory(itemAuthFeeHeaderId, queryParams)
      .then((res) => {
        if (res && isArray(res)) {
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              res.map((ele) => {
                return ele.creationDate;
              })
            )
          );
          batchNoArray.forEach((item) => {
            const data = res.filter((ele) => ele.creationDate === item);
            const aloneData = data.filter((ele) =>
              [
                'AUTHENTICATION_APPROVED',
                'SUBMITTED',
                'APPROVED',
                'INPUT_SUBMISSION',
                'INITIATE_SAMPLE_SUBMISSION',
                'FEEDBACK_REJECTED',
              ].includes(ele.processType)
            );
            // 将独立操作单独拿出来
            if (data.length > 1 && aloneData?.length) {
              if (aloneData?.length > 1) {
                const approvedData = data.find((ele) =>
                  [
                    'AUTHENTICATION_APPROVED',
                    'APPROVED',
                    'INITIATE_SAMPLE_SUBMISSION',
                    'INPUT_SUBMISSION',
                    'FEEDBACK_REJECTED',
                  ].includes(ele.processType)
                );
                if (approvedData) {
                  currentItem.push([approvedData]);
                  currentItem.push(
                    aloneData.filter(
                      (ele) =>
                        ![
                          'AUTHENTICATION_APPROVED',
                          'APPROVED',
                          'INPUT_SUBMISSION',
                          'INITIATE_SAMPLE_SUBMISSION',
                          'FEEDBACK_REJECTED',
                        ].includes(ele.processType)
                    )
                  );
                } else {
                  currentItem.push(aloneData);
                }
              } else {
                currentItem.push(aloneData);
              }

              const otherData = data.filter(
                (ele) =>
                  ![
                    'AUTHENTICATION_APPROVED',
                    'SUBMITTED',
                    'APPROVED',
                    'INPUT_SUBMISSION',
                    'FEEDBACK_REJECTED',
                    'INITIATE_SAMPLE_SUBMISSION',
                  ].includes(ele.processType)
              );
              if (otherData?.length) {
                currentItem.push(otherData);
              }
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
                  // 'APPROVE',
                  // 'APPROVED',
                  // 'REJECT',
                  // 'REJECTED',
                  'RELEASE',
                  'DELETE',
                  // 'CANCEL',
                  'REVOKE',
                  // 'SKIP',
                  'AUTHENTICATION_APPROVAL',
                  // 'AUTHENTICATION_APPROVED',
                  // 'AUTHENTICATION_REJECTED',
                  // 'EARLY_TERMINATION',
                  'INITIATE_SAMPLE_SUBMISSION',
                  'INPUT_SUBMISSION',
                  'SCUX_ATT_CONFIRM',
                  'SCUX_ATT_REJECT',
                  'SCUX_ATT_SUBMIT',
                ].includes(ele[0].processType)
              ) {
                const { processType, processTypeMeaning } = ele[0];
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  ...ele[0],
                  ...iconAndProcessMeaning,
                  list: [],
                };
                // 'UPDATE', 'UPDATE_LINE', 'DEL_LINE' 'NEW_LINE',
                // 会展示多行 更新、更新行、变更 新增行 删除行
              } else {
                const parentData = ele.find((e) => e.processType === 'PENDING') || ele[0];
                const { processType, processTypeMeaning } = parentData || {};
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  processDirections: parentData?.processDirections,
                  processType: parentData?.processType,
                  creationDate: ele[0]?.creationDate,
                  processUserName: ele[0]?.processUserName,
                  attachmentCodeAndName: parentData?.attachmentCodeAndName,
                  // feeLineNum: ele[0].feeLineNum,
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
  }, [itemAuthFeeHeaderId]);

  useEffect(() => {
      handleUpdateFooterBtn();
    }, [handleUpdateFooterBtn, activeKey]);

    const getQueryParams = useCallback(() => {
      return {
        ...(operateLineDs.getState('queryParams')),
        itemAuthFeeHeaderId,
      };
    }, [itemAuthFeeHeaderId, operateLineDs]);

    const handleUpdateFooterBtn = useCallback(() => {
      if (modal && isFilterFlag) {
        if (activeKey === 'operator') {
          modal.update({
            footer: (okBtn) => [
              okBtn,
              <ExcelExportPro
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                templateCode='SMDM_ITEM_AUTH_FEE_ACTION_EXPORT' // 导出模板编码
                exportAsync
                otherButtonProps={{
                  type: 'c7n-pro',
                }}
                requestUrl={`/smdm/v1/${getCurrentOrganizationId()}/item-auth-fee-actions/record/export`}
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
        'INITIATE_SAMPLE_SUBMISSION',
        'AUTHENTICATION_APPROVED',
        'AUTHENTICATION_REJECTED',
        'FEEDBACK_REJECTED',
      ].includes(type):
        icon = 'authorize';
        break;
      case ['SUBMIT', 'EARLY_TERMINATION', 'SKIP', 'SCUX_AUTHENTICATION_APPROVAL'].includes(type):
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
      case ['CANCEL', 'CLOSED', 'CLOSEDING'].includes(type):
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

        // 查找距离操作记录工作流审批距离最近的审批阶段，即对应的审批阶段

        // 操作记录的阶段时间 大于 审批记录的阶段时间
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
          // 跳转到具体对应的阶段

          const down = document.createElement('a');
          down.href = `#${approveNodeArr[index]?.id}`;
          down.click();
          down.remove();
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(classifiedData);

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
                {['FEEDBACK_REJECTED'].includes(item.processType) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status">
                      <a>{intl.get(`${commonPrompt}.feadBackReject`).d('反馈拒绝了')}</a>
                    </span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
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

                {[
                  'APPROVE',
                  'APPROVED',
                  'REJECTED',
                  'REJECT',
                  'AUTHENTICATION_APPROVED',
                  'AUTHENTICATION_REJECTED',
                ].includes(item.processType) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status">
                      <a
                        onClick={() => onViewDetail(item.processType, item)}
                        className={
                          ['APPROVE', 'APPROVED', 'AUTHENTICATION_APPROVED'].includes(
                            item.processType
                          )
                            ? 'operating-timeline-info-item-adopt'
                            : 'operating-timeline-info-item-reject'
                        }
                      >
                        {item.processTypeMeaning}
                      </a>
                    </span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
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
                              {intl.get(`${commonPrompt}.approvalComment`).d('审批意见')}:
                              {ele.processDirections || '-'}
                            </span>
                          </div>
                        );
                      })}
                  </>
                )}

                {item.processType === 'RETURN_TO_PRE_APPROVAL' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.itemFeeToPreApproval`).d('物料认证反馈单至预审')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnFeePreApprovalInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证反馈单的【${nodeCodeMeaning}】阶段至预审，原因是 ${
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
                        .get(`${commonPrompt}.itemFeeToTestResult`)
                        .d('物料认证反馈单至检测结果待录入')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnFeeTestResultInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证反馈单的【${nodeCodeMeaning}】阶段至检测结果待录入，原因是 ${
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
                        .get(`${commonPrompt}.itemFeeToFeedback`)
                        .d('物料认证反馈单至供应商反馈')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.returnFeeFeedbackInfo`, {
                              value: item.processDirections || '-',
                              node: nodeCodeMeaning,
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 退回 物料认证反馈单的【${nodeCodeMeaning}】阶段至供应商反馈，原因是 ${
                                item.processDirections || '-'
                              }`
                            )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {['CLOSED', 'CLOSEDING'].includes(item.processType) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialFedAuthDoc`).d('物料认证反馈单')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
                      <div className="date">
                        <span className="status gray">
                          {intl
                            .get(`${commonPrompt}.closedFeeFeedbackInfo`, {
                              userName: item.processUserName || externalProcessUserName,
                            })
                            .d(
                              `${
                                item.processUserName || externalProcessUserName
                              } 关闭 物料认证反馈单`
                            )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {item.processType === 'REVOKE' && (
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

                {item.processType === 'SCUX_AUTHENTICATION_APPROVAL' && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
                    </span>
                    <Icon
                      type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                      style={{ fontSize: 14, marginTop: '2px' }}
                    />
                    {dataKey[index] === 'on' && (
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
                        .get(`${commonPrompt}.materialFeedbackDocStageAtt`)
                        .d('物料认证反馈单阶段附件')}
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
                  'REVOKE',
                  'APPROVE',
                  'APPROVED',
                  'REJECT',
                  'REJECTED',
                  'AUTHENTICATION_APPROVED',
                  'AUTHENTICATION_REJECTED',
                  'FEEDBACK_REJECTED',
                  'RE_TO_TEST_RESULTS_TO_BE_ENTER',
                  'RETURN_TO_PRE_APPROVAL',
                  'SCUX_AUTHENTICATION_APPROVAL',
                  'SCUX_ATT_CONFIRM',
                  'SCUX_ATT_REJECT',
                  'SCUX_ATT_SUBMIT',
                  'RETURN_TO_VENDOR_FEEDBACK',
                  'CLOSED',
                  'CLOSEDING',
                ].includes(item.processType) && (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                    </span>
                    <span className="status gray">{item.processTypeMeaning}</span>
                    <span className="result">
                      {intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
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

                              {ele.feeLineNum &&
                                ['UPDATE', 'UPDATE_LINE'].includes(ele.processType) && (
                                  <span className="status gray">
                                    {`${intl
                                      .get(`${commonPrompt}.detailInfoLine`)
                                      .d('明细信息行')} ${intl
                                      .get(`${commonPrompt}.lineNum`)
                                      .d('行号')}:${ele.feeLineNum}`}
                                  </span>
                                )}
                              {ele.attachmentCodeAndName &&
                                ['UPDATE', 'UPDATE_ATTACHMENT'].includes(ele.processType) && (
                                  <span className="status gray">
                                    {intl.get(`${commonPrompt}.nodeInfoLine`).d('阶段信息行')}【
                                    {ele.attachmentCodeAndName}】
                                  </span>
                                )}
                              {ele.feeSampleNum && ['UPDATE'].includes(ele.processType) && (
                                <span className="status gray">
                                  {`${intl
                                    .get(`${commonPrompt}.sampleLine`)
                                    .d('样品信息行')} ${intl
                                    .get(`${commonPrompt}.lineNum`)
                                    .d('行号')}:${ele.feeSampleNum || ''}`}
                                </span>
                              )}
                            </div>
                          );
                        } else if (['NEW_LINE', 'DEL_LINE'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName} ${ele.processTypeMeaning} ${intl
                                  .get(`${commonPrompt}.detailInfoLine`)
                                  .d('明细信息行')} ${intl
                                  .get(`${commonPrompt}.lineNum`)
                                  .d('行号')}:${ele.feeLineNum}`}
                              </span>
                            </div>
                          );
                        } else if (['NEW_ATTACHMENT', 'DEL_ATTACHMENT'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName} ${ele.processTypeMeaning} ${intl
                                  .get(`${commonPrompt}.nodeInfoLine`)
                                  .d('阶段信息行')}【${ele.attachmentCodeAndName}】`}
                              </span>
                            </div>
                          );
                        } else if (['NEW_SAMPLE', 'DEL_SAMPLE'].includes(ele.processType)) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {`${ele.processUserName} ${ele.processTypeMeaning} ${intl
                                  .get(`${commonPrompt}.sampleLine`)
                                  .d('样品信息行')} ${intl
                                  .get(`${commonPrompt}.lineNum`)
                                  .d('行号')}:${ele.feeSampleNum || ''}`}
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
  code: ['hzero.common', 'smdm.common'],
})(OperationHistory);
