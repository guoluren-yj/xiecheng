import React, { useEffect, useState, useCallback, useMemo } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Tabs, Icon, Spin, Collapse } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { SRM_SIEC } from '_utils/config';
import ApproveRecord from '_components/ApproveRecord';
import { queryApproveDate } from '@/services/projectSpaceService.js';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import style from './index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Item } = Timeline;

const operateDs = ({ id, type, field }) => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  queryFields: [
    {
      name: 'processType',
      display: true,
      noCache: true,
      type: 'string',
      lookupCode: type === 'projectId' ? 'SIEC.PROJECT.ACTION.STATUS' : 'SIEC.PROJECT.REQ.ACTION.STATUS',
      lovPara: { [field || type]: id },
      label: intl.get('hzero.common.components.operationAudit.operatedCode').d('操作节点'),
    },
    {
      name: 'processedDateRange',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
    },
    {
      name: 'processUserId',
      type: 'object',
      lovPara: { tenantId: getCurrentOrganizationId() },
      display: true,
      lovCode: 'HIAM.TENANT.USER',
      valueField: 'id',
      textField: 'realName',
      label: intl.get('hzero.common.components.operationAudit.operationBy').d('操作人'),
    },
    {
      name: 'processInstructions',
      type: 'string',
      range: true,
      display: true,
      label: intl.get('hzero.common.view.description').d('描述'),
    },
  ],
  fields: [],
  transport: {
    read: {
      url:
        type === 'projectId'
          ? `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project/action/${id}`
          : `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project-req/action/${id}`, // 获取历史版本数据接口名
      method: 'GET',
      transformResponse: value => {
        const content = value ? JSON.parse(value) : {};
        const allBatch = Array.from(new Set(content?.map(e => e.processBatch)));
        const allData = allBatch?.map(e => {
          const updates = content?.filter(item => item?.processBatch === e);
          const index = updates?.length - 1 >= 0 ? updates?.length - 1 : 0;
          const {
            lastUpdateDate,
            processTabMeaning,
            processType,
            processTab,
            approvalMethod,
            processTypeMeaning,
            processUserName,
            processTabUniqueDesc,
            processInstructions,
          } = updates[index];
          return {
            updates: [
              'APPROVAL_REJECTED',
              'APPROVED',
              'PROJECT_REQ',
              'CHANGE',
              'SUSPEND',
              'REBOOT',
              'CONFIRM',
              'SUBMITTED',
              'REJECTED',
            ].includes(processType)
              ? []
              : updates,
            processTab,
            approvalMethod,
            processTabMeaning,
            processBatch: e,
            lastUpdateDate,
            processInstructions,
            processType,
            processTypeMeaning,
            processUserName,
            processTabUniqueDesc,
          };
        });
        return allData;
      },
    },
  },
});

const Index = ({ id, type, modal, field }) => {
  const [loading, setLoading] = useState(false);
  const [approveData, setApproveData] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const operateLineDs = useMemo(() => new DataSet(operateDs({ id, type, field })), [id, type, field]);
  const [actionData, setActionData] = useState([]);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  const operation = {
    UPDATE: { icon: 'mode_edit' },
    DELETE: { icon: 'delete' },
    NEW: { icon: 'add' },
    SUBMITTED: { icon: 'check' },
    APPROVED: { icon: 'authorize', color: '#47b881' },
    APPROVAL_REJECTED: { icon: 'authorize' },
    CANCEL_REVOKE: { icon: 'reply' },
    CANCEL: { icon: 'cancel' },
    SUSPEND: { icon: 'cancel' },
    CHANGE: { icon: 'cancel' },
    CONFIRM: { icon: 'check_circle' },
    INVALID: { icon: 'cancel' },
    REBOOT: { icon: 'autorenew' },
    REJECTED: { icon: 'authorize', color: '#f56349' },
  };
  useEffect(() => {
    queryApproveDate({ type, id })
      .then(res => {
        if (res && !res.failed) {
          const allHistoricTaskExtList = res.reverse().map((ele = {}) => {
            const { historicTaskExtList = [] } = ele;
            return {
              id: ele.id,
              approvalType: ele.approvalType,
              approvalTypeMeaning: ele.approvalTypeMeaning,
              prHistoricTaskExtList: historicTaskExtList.reverse()?.map(e => ({
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
  }, [id]);

  useEffect(() => {
    handleQuery({});
  }, [handleQuery]);

  const handleQuery = useCallback((params) => {
    setLoading(true);
    const { processedDateRange, ...other } = params?.params || {};
    const [createDateStr, createDateEnd] = processedDateRange?.split(',') || [];
    const queryParams = { createDateStr, createDateEnd, ...other };
    operateLineDs.setState({ queryParams });
    operateLineDs
      .query(0, queryParams)
      .then(res => {
        setActionData(res);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    handleUpdateFooterBtn();
  }, [handleUpdateFooterBtn]);

  const getQueryParams = useCallback(() => {
    return {
      ...(operateLineDs.getState('queryParams')),
      [field || type]: id,
    };
  }, [id, type, operateLineDs, field]);

  const handleUpdateFooterBtn =useCallback(() => {
    if (modal) {
      if (activeKey === 'operator') {
        modal.update({
          footer: (okBtn) => [
            okBtn,
            <ExcelExportPro
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              templateCode={type === 'projectId' ? 'SIEC_PROJECT_ACTION_RECORD_EXPORT' : 'SIEC_PROJECT_REQ_ACTION_EXPORT'} // 导出模板编码
              exportAsync
              otherButtonProps={{
                type: 'c7n-pro',
              }}
              requestUrl={type === 'projectId' ? `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project/record/export` : `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project-req/action/record/export`}
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
  }, [modal, getQueryParams, activeKey]);

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const handleChangeTab = useCallback(
    tabKey => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  const onViewDetail = useCallback(data => {
    setActiveKey('approved');
    setTimeout(() => {
      const nowTime = data.creationDate;
      // 先从审批记录里面过滤出审批节点
      const approveNodeArr = approveArr.length
        ? approveArr
        : approveData
            .reduce(
              (a, b) => a.concat(b.historicTaskExtList?.filter(ele => ele.nodeStatusCode)),
              []
            )
            .sort((a, b) => (a.endTime > b.endTime ? 1 : -1));
      setApproveArr(approveNodeArr);

      // 查找距离操作记录工作流审批距离最近的审批节点，即对应的审批节点

      // 操作记录的节点时间 大于 审批记录的节点时间
      let index = null;

      for (let i = 0; i < approveNodeArr.length; i++) {
        if (
          approveNodeArr[i] &&
          i === approveNodeArr.length - 1 &&
          approveNodeArr[i] &&
          approveNodeArr[i].startTime < nowTime
        ) {
          index = i;
        }
        if (approveNodeArr[i] && approveNodeArr[i]?.startTime > nowTime && index === null) {
          index = i - 1;
        }
      }

      if (index !== -1 && index) {
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
    const key = {
      TASK: intl.get('sprm.project.model.common.taskNum').d('任务编号'),
      PURCHASE_ITEM: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
      SUPPLIER: intl.get(`entity.supplier.supplierCompanyNum`).d('供应商编码'),
      UPDATEPAGE:
        type === 'projectId'
          ? intl.get(`sprm.common.model.common.projectInfoGroup`).d('项目信息')
          : intl.get('sprm.common.model.common.projectChangeInfoAct').d('项目控制申请单'),
    };
    return (
      <Spin spinning={loading}>
        <FilterBar
          dataSet={[operateLineDs]}
          onQuery={handleQuery}
          autoQuery={false}
          expandable={false}
        />
        {actionData.length > 0 && (
          <Timeline className={style['sprm-project-timeline']}>
            {actionData.map(ele => (
              <Item color="#e5e5e5">
                {([
                  'UPDATE',
                  'APPROVAL_REJECTED',
                  'DELETE',
                  'APPROVED',
                  'REBOOT',
                  'CONFIRM',
                  'REJECTED',
                  'SUSPEND',
                  'CHANGE',
                ].includes(ele.processType) &&
                  ele.approvalMethod !== 'WORKFLOW') ||
                ele.updates.length > 1 ||
                !['PROJECT', 'PROJECT_REQ'].includes(ele.processTab) ? (
                  <Collapse
                    ghost
                    expandIconPosition="text-right"
                    expandIcon={panelProps => (
                      <Icon type={panelProps?.isActive ? 'expand_less' : 'expand_more'} />
                    )}
                    trigger="text-icon"
                  >
                    <Panel
                      key={ele.processBatch}
                      header={
                        <span>
                          <Icon type={operation[ele.processType]?.icon} />
                          <span className="c7n-timeline-item">
                            <span className="operator">{ele.processUserName}</span>
                            <span className="actions">
                              {['PURCHASE_ITEM', 'TASK', 'BASE', 'SUPPLIER'].includes(
                                ele.processTab
                              )
                                ? intl.get('sprm.project.modal.updateFlag').d('更新了')
                                : ele.processTypeMeaning}
                            </span>
                            <span className="operator">
                              {['PURCHASE_ITEM', 'TASK', 'BASE', 'SUPPLIER'].includes(
                                ele.processTab
                              )
                                ? key.UPDATEPAGE
                                : ele.processTabMeaning || ''}
                            </span>
                          </span>
                        </span>
                      }
                    >
                      {/* 审批意见类 */}
                      {['APPROVAL_REJECTED', 'APPROVED', 'REJECTED'].includes(ele.processType) && (
                        <span className="actions-line">
                          <span className="actions" style={{ paddingLeft: 0 }}>
                            {intl.get('sprm.common.title.approveRemark').d('审批意见')}:
                          </span>
                          <span className="actions">{ele.processInstructions}</span>
                        </span>
                      )}
                      {/* 变更申请理由类 */}
                      {['CHANGE', 'SUSPEND', 'REBOOT', 'SUBMITTED', 'CONFIRM'].includes(
                        ele.processType
                      ) && (
                        <span className="actions-line">
                          <span className="actions" style={{ paddingLeft: 0 }}>
                            {intl.get('hzero.common.reqReason').d('申请理由')}:
                          </span>
                          <span className="actions">{ele.processInstructions}</span>
                        </span>
                      )}
                      {/* 操作：新增，删除，修改类 */}
                      {ele?.updates?.map(item => {
                        const {
                          processUserName = '',
                          processType = '',
                          processTabMeaning = '',
                          oldValue = '',
                          newValue = '',
                          processFieldMeaning = '',
                          processTabUniqueDesc,
                        } = item;
                        const processTab = key[item.processTab] || '';
                        return processType === 'UPDATE' ? (
                          <span className="actions-line">
                            {processTabUniqueDesc
                              ? intl
                                  .get('sprm.project.modal.changeInfo.detial', {
                                    processUserName,
                                    processTabMeaning,
                                    processTab,
                                    processTabUniqueDesc,
                                    processFieldMeaning,
                                    oldValue,
                                    newValue,
                                  })
                                  .d(
                                    `${processUserName}将【${processTabMeaning}】页签 ${processTab}【${processTabUniqueDesc}】【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`
                                  )
                              : intl
                                  .get('sprm.project.modal.changeInfo.headerDetial', {
                                    processUserName,
                                    processTabMeaning,
                                    processFieldMeaning,
                                    oldValue,
                                    newValue,
                                  })
                                  .d(
                                    `${processUserName}将【${processTabMeaning}】页签【${processFieldMeaning}}】由【${oldValue}】改为【${newValue}】`
                                  )}
                          </span>
                        ) : (
                          <span className="actions-line">
                            <span>{item.processUserName}</span>
                            <span>{` ${item.processTypeMeaning}`}</span>
                            <span>
                              【{item.processTabMeaning || ''}】
                              {intl.get('sprm.project.modal.tabName').d(`页签`)}
                              {` ${key[item.processTab] || ''}`}【{item.processTabUniqueDesc || ''}
                              】
                            </span>
                          </span>
                        );
                      })}
                    </Panel>
                  </Collapse>
                ) : (
                  <span>
                    <Icon
                      type={operation[ele.processType]?.icon}
                      style={{ color: operation[ele.processType]?.color }}
                    />
                    {ele.approvalMethod !== 'WORKFLOW' ? (
                      <span className="c7n-timeline-item">
                        <span className="operator">{ele.processUserName}</span>
                        <span className="actions">{ele.processTypeMeaning}</span>
                        <span className="operator">
                          {ele.processTabMeaning || ''}
                          {ele.processTabUniqueDesc ? `-${ele.processTabUniqueDesc}` : ''}
                        </span>
                      </span>
                    ) : (
                      <a
                        onClick={() => onViewDetail(ele)}
                        style={{
                          color: ele.processType === 'APPROVED' ? '#47b881' : '#f56349',
                        }}
                      >
                        {ele.processType === 'APPROVED'
                          ? intl.get(`sprm.common.status.workfolw.adopt`).d('工作流审批通过')
                          : intl.get(`sprm.common.status.workfolw.reject`).d('工作流审批拒绝')}
                      </a>
                    )}
                  </span>
                )}

                <div className="operating-timeline-info">
                  <div className="date">{dateTimeRender(ele.lastUpdateDate)}</div>
                </div>
              </Item>
            ))}
          </Timeline>
        )}
        {!actionData?.length && handleNoData()}
      </Spin>
    );
  };

  return approveData?.length ? (
    <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
      <TabPane tab={intl.get(`hzero.common.button.operating`).d('操作记录')} key="operator">
        <div className={style['scroll-content']}>{renderOperateHistory()}</div>
      </TabPane>
      <TabPane tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')} key="approved">
        <div className={style['scroll-content']}>
          <Spin spinning={approvedLoading}>
            {approveData.map(ele => (
              <ApproveRecord data={ele.prHistoricTaskExtList} />
            ))}
            {!approveData?.length && handleNoData()}
          </Spin>
        </div>
      </TabPane>
    </Tabs>
  ) : (
    <div>{renderOperateHistory()}</div>
  );
};

export default formatterCollections({
  code: ['sprm.project', 'hzero.common'],
})(Index);
