import React, { useEffect, useCallback, useMemo } from 'react';
import { Spin, Icon, Tooltip, DataSet, Attachment } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import styles from '../index.less';
import { useSetState } from '../../../PPAPTemplate/utils/utils';
import { fetchDetailRecord } from '../../utils/api';
import { operationDS } from '../stores/indexDS';

const { Item: TimeItem } = Timeline;

const actionColorMap = {

};

const actioniconMap = {
  NEW: 'add', // 新建
  CHANGE: 'mode_edit', // 变更
  CANCEL: 'cancel', // 取消
  ALTER: 'mode_edit',
  CLOSED: 'not_interested',
  CANCELED: 'cancel',
  PUBLISH: 'publish2',
  PUBLISHED: 'publish2',
  IN_PROGRESS: 'finished',
  COMPLETED: 'check_circle',
  SUBMITTED: 'check',
  CLOSE: 'not_interested',
};

export interface OperationRecordProps {
  id: string,
  type: string,
  camp?: string,
  isExport?: boolean,
  modal?: any,
  activeKey?: any,
  activeTabKey?: any,
  documentInfoDs?: any,
  remoteProps?: any;
  record?: Record<string, any> | null;
}

const lookupCode = {
  'stage': 'SQAM.PROJECT.STAGE.RECORD.ACTION',
  'document': 'SQAM.PROJECT.DOCUMENT.RECORD.ACTION',
  'project': 'SQAM.PROJECT.RECORD.ACTION',
};
const fields: any = {
  'stage': 'stageId',
  'document': 'documentId',
  'project': 'projectHeaderId',
};
const exportCode = {
  'stage': 'SQAM_ACCESS_STAGE_ACTION_EXPORT',
  'document': 'SQAM_ACCESS_DOCUMENT_ACTION_EXPORT',
  'project': 'SRM_QAM_PROJECT_ACTION_EXPORT_RECORD',
};
const exportUrl = {
  'stage': `/sqam/v1/${getCurrentOrganizationId()}/access-stage-actions/record/export`,
  'document': `/sqam/v1/${getCurrentOrganizationId()}/access-document-actions/record/export`,
  'project': `/sqam/v1/${getCurrentOrganizationId()}/access-project-actions/record/export`,
};
const OperationRecord = (props: OperationRecordProps) => {

  const { id, type, camp, isExport, modal, activeKey, activeTabKey, documentInfoDs, remoteProps, record } = props;
  const operationDs = useMemo(() => new DataSet(operationDS({ lookupCode: lookupCode[type], lovPara: { [fields[type]]: id } })), [type, id]);
  const documentName = documentInfoDs?.current?.get('documentName');

  const [operationState, setOperationState] = useSetState({
    loading: true,
    operationData: [],
  });

  const { loading, operationData } = operationState;

  const handleUpdateFooterBtn =useCallback(() => {
    if (modal && isExport && (activeKey === 'operation' || !activeKey)) {
      const params = operationDs?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode={exportCode[type]} // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={exportUrl[type]}
            queryParams={{
              ...params,
              [fields[type]]: id,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  }, [modal, isExport, id, type, operationDs, activeKey]);

  useEffect(() => {
    handleUpdateFooterBtn();
  }, [handleUpdateFooterBtn]);

  const getOperationData = useCallback(async (field?: any) => {
    if (!id) return;
    const params = field?.params || {};
    const { dateRange, ...other } = params;
    const dateFromTo = dateRange?.split(',') || [];
    const queryParams = {
      ...other,
      processDateFrom: dateFromTo[0] ? moment(dateFromTo[0]).format(DATETIME_MIN) : undefined,
      processDateTo: dateFromTo[1] ? moment(dateFromTo[1]).format(DATETIME_MAX) : undefined,
    };
    // eslint-disable-next-line no-unused-expressions
    operationDs?.queryDataSet?.current?.reset();
    // eslint-disable-next-line no-unused-expressions
    operationDs?.queryDataSet?.current?.set(queryParams);
    handleUpdateFooterBtn();
    const res = getResponse(await fetchDetailRecord(id, type, queryParams));
    const newOperationState: Record<string, any> = { loading: false };
    if (res) newOperationState.operationData = res.content || [];
    setOperationState(newOperationState);
  }, [setOperationState, id, type, operationDs, handleUpdateFooterBtn]);

  useEffect(() => {
    getOperationData();
  }, [getOperationData]);

  // 显示操作人
  const formatRenderName = useCallback((item) => {
    // openApproveMethod 项目审批方式, closeApproveMethod 阶段关闭审批方式, approveMethod 交付物审批方式
    const { processStatus, processUserName, openApproveMethod, closeApproveMethod, approveMethod } = item || {};
    if (camp === 'SUPPLIER' && ((['PUBLISH_REJECTED', 'PUBLISHED', 'CLOSE_REJECTED', 'CLOSED'].includes(processStatus) && openApproveMethod === 'WORKFLOW') || (['COMPLETED', 'REJECTED'].includes(processStatus) && approveMethod === 'WORKFLOW') || (['CLOSED_REJECTED', 'CLOSED'].includes(processStatus) && closeApproveMethod === 'WORKFLOW'))) {
      return (
        <span className="record-action-operator">{intl.get('sqam.common.view.message.purchaser').d('采购方')}</span>
      );
    }
    return (
      <Tooltip placement="topLeft" title={processUserName}>
        <span className="record-action-operator">{processUserName}</span>
      </Tooltip>
    );
  }, [camp]);

  // 显示动作
  const formatRenderAction = useCallback((item) => {
    const { processStatus, processStatusMeaning, openApproveMethod, closeApproveMethod, approveMethod } = item || {};
    if ((['PUBLISH_REJECTED', 'PUBLISHED', 'CLOSE_REJECTED', 'CLOSED', 'ALTER_CONFIRM', 'ALTER_REJECT'].includes(processStatus) && openApproveMethod === 'WORKFLOW') || (['COMPLETED', 'REJECTED'].includes(processStatus) && approveMethod === 'WORKFLOW') || (['CLOSED_REJECTED', 'CLOSED'].includes(processStatus) && closeApproveMethod === 'WORKFLOW')) {
      // 区分不同类型的审批
      const _title = {
        'PUBLISH_REJECTED': intl.get('sqam.common.model.approvedPublishPass').d('审批发布拒绝'),
        'PUBLISHED': intl.get('sqam.common.model.approvedPublishReject').d('审批发布通过'),
        'CLOSE_REJECTED': intl.get('sqam.common.model.approvedCloseReject').d('审批关闭拒绝'),
        'CLOSED': intl.get('sqam.common.model.approvedClosePass').d('审批关闭通过'),
        'COMPLETED': intl.get('sqam.common.model.approvedPass').d('审批通过'),
        'REJECTED': intl.get('sqam.common.model.approvedReject').d('审批拒绝'),
        'CLOSED_REJECTED': intl.get('sqam.common.model.approvedCloseReject').d('审批关闭拒绝'),
        'ALTER_CONFIRM': intl.get('sqam.common.model.approvedPublishPassChange').d('变更审批通过'),
        'ALTER_REJECT': intl.get('sqam.common.model.approvedPublishRejectChange').d('变更审批拒绝'),
      };
      const title = remoteProps?.process ? remoteProps.process('PPAP_WORKBENCH_DETIAL_OPERATION_RECORD_TITLE', _title, { record, activeKey: activeTabKey }) : _title;

      return (
        <>
          <span className="record-action-text">
            {intl.get('sqam.common.view.message.approve').d('最终审批了')}
          </span>
          <span className="record-action-doc">
            【{documentName && type === 'document' ? documentName : intl.get('sqam.ppap.view.title.ppap').d('PPAP')}】
          </span>
          <span className='result'>
            <span className="gray">
              {intl.get('sqam.common.model.approvedResult').d('审批结果为')}：
            </span>
            <span className={['COMPLETED', 'PUBLISHED', 'CLOSED', 'ALTER_CONFIRM'].includes(processStatus) ? 'completed' : 'orange'}>
              【{title[processStatus] || processStatusMeaning}】
            </span>
            {
              ['ALTER_REJECT'].includes(processStatus) && (
                <span className="gray">
                  {intl.get('sqam.common.model.view.approvedPublishRejectRollBack').d('，单据回滚至变更前数据')}
                </span>
              )
            }
          </span>
        </>
      );
    }
    return (
      <>
        <span className="record-action-text">
          {intl.get('sqam.ppap.view.message.alreadyOperated', { operationName: processStatusMeaning }).d('{operationName}了')}
        </span>
        <span className="record-action-doc">
          【{documentName && type === 'document' ? documentName : intl.get('sqam.ppap.view.title.ppap').d('PPAP')}】
        </span>
      </>
    );
  }, [documentName, type]);
  // 显示审批意见
  const formatRenderRemark = useCallback((item) => {
    const { processStatus, processRemark, openApproveMethod, closeApproveMethod, approveMethod, attachmentUuid } = item || {};
    if (!processRemark) return null;
    if ((['PUBLISH_REJECTED', 'PUBLISHED'].includes(processStatus) && openApproveMethod === 'WORKFLOW') || (['COMPLETED', 'REJECTED'].includes(processStatus) && approveMethod === 'WORKFLOW') || (['CLOSED_REJECTED', 'CLOSED'].includes(processStatus) && closeApproveMethod === 'WORKFLOW')) {
      // 如果是供应商查看 审批通过的不显示审批意见
      if (camp === 'SUPPLIER' && (['PUBLISHED', 'COMPLETED', 'CLOSED'].includes(processStatus))) return null;
      return (
        <div>
          <div className="reamks">
            <span className="operator gray_remarks">{intl.get('sqam.ppap.view.title.approvalInfo').d('审批意见')}:</span>
            <span className="result gray_remarks">{processRemark}</span>
          </div>
          {
            attachmentUuid && type === 'document' && (
              <div className="reamks remarks_attachment">
                <span className="operator gray_remarks">{intl.get('sqam.ppap.view.title.attachmentVersionDocument').d('此版本交付物上传附件')}:</span>
                <Attachment
                  readOnly
                  downloadAll={false}
                  funcType={FuncType.link}
                  value={attachmentUuid}
                  showHistory
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                />
              </div>
            )
          }
        </div>
      );
    }
    if (processStatus === 'ALTER') {
      return (
        <div className="reamks">
          <span className="operator gray_remarks">
            {intl.get('sqam.ppap.model.template.alterRemark').d('变更意见')}:
          </span>
          <span className="result gray_remarks">{processRemark}</span>
        </div>
      );
    }
    return null;
  }, [camp, type]);

  return (
    <Spin spinning={loading}>
      <div className={styles['sqam-operation-record']}>
        {isExport && (<FilterBar dataSet={[operationDs]} onQuery={getOperationData} autoQuery={false} expandable={false} />)}
        {isEmpty(operationData) ? (
          <div className="record-empty">
            <span>{intl.get('sqam.ppap.view.message.noData').d('暂无数据')}</span>
          </div>
        ) : (
          <Timeline className="record-timeline">
            {
              operationData.map((item) => {
                const {
                  processDate,
                  processStatus,
                } = item;
                return (
                  <TimeItem color={actionColorMap[processStatus] || '#E5E5E5'}>
                    <Icon type={actioniconMap[processStatus] || 'authorize'} className="record-icon" />
                    {formatRenderName(item)}
                    {formatRenderAction(item)}
                    {formatRenderRemark(item)}
                    <div className="record-action-time">
                      {dateTimeRender(processDate)}
                    </div>
                    <div className="record-action-divide" />
                  </TimeItem>
                );
              })
            }
          </Timeline>
        )}
      </div>
    </Spin>
  );
};

export default OperationRecord;
