import React from 'react';
import type { ObservableMap } from 'mobx';
import { observable } from 'mobx';
import { isEmpty, noop } from 'lodash';
import type { DataSet } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import {
  getResponse,
  getCurrentOrganizationId,
} from 'utils/utils';
import {
  queryBatchApprovaFlag,
  queryBatchSimpleApprovalHistory,
} from '_utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from "_components/ApproveRecordSimple";

const queryRevokeData = async (body: string[]) => {
  return getResponse(await request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
    method: 'POST',
    body,
    query: { revokeFlag: 1 },
  }));
};

export default class WorkflowCaller {

  dataSet: DataSet;

  @observable approveDataMap: ObservableMap<string, any> = observable.map();

  @observable historyDataMap: ObservableMap<string, any> = observable.map();

  @observable revokeDataMap: ObservableMap<string, any> = observable.map();

  constructor(dataSet: DataSet) {
    this.dataSet = dataSet;
    this.bindDataSet();
  }

  bindDataSet = () => {
    this.dataSet.addEventListener('load', this.load);
  }

  destroy = () => {
    this.dataSet.removeEventListener('load', this.load);
  }

  load = ({ dataSet }: { dataSet: DataSet }) => {
    const workflowBussinessKeyList = dataSet.all.reduce<string[]>((totalKeyList, currentRecord) => {
      const businessKey = currentRecord.get('businessKey');
      return businessKey ? [...totalKeyList, businessKey] : totalKeyList;
    }, []);
    if (isEmpty(workflowBussinessKeyList)) return;
    Promise.all([
      queryBatchApprovaFlag(workflowBussinessKeyList),
      queryBatchSimpleApprovalHistory(workflowBussinessKeyList),
      queryRevokeData(workflowBussinessKeyList),
    ]).then(([approveDataMap, historyDataMap, revokeDataMap]) => {
      if (approveDataMap) this.approveDataMap = approveDataMap;
      if (historyDataMap) this.historyDataMap = historyDataMap;
      if (revokeDataMap) this.revokeDataMap = revokeDataMap;
    });
  }

  getBussinessKey = (record?: DSRecord): string | null => {
    const currentRecord = record || this.dataSet.current;
    const businessKey = currentRecord?.get('businessKey');
    return businessKey;
  }


  getApproveData = (record?: DSRecord): Record<string, any> | null => {
    const businessKey = this.getBussinessKey(record);
    if (!businessKey) return null;
    return this.approveDataMap[businessKey];
  }

  getApproveFlag = (record?: DSRecord): Boolean => {
    return Boolean(this.getApproveData(record));
  }

  getRevokeFlag = (record?: DSRecord): Boolean => {
    const businessKey = this.getBussinessKey(record);
    if (!businessKey) return false;
    return this.revokeDataMap[businessKey]?.REVOKE;
  }

  goApprove = ({ record, onSuccess = noop }: { record?: DSRecord, onSuccess?: () => void }) => {
    const { taskId, processInstanceId } = this.getApproveData(record) || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess,
    });
  }

  renderProcess = (record?: DSRecord) => {
    const businessKey = this.getBussinessKey(record);
    if (!businessKey) return null;
    return <ApproveRecordSimple data={this.historyDataMap[businessKey]} />;
  }

  // 工作流撤回
  goRevoke = async(record?: DSRecord) => {
    const businessKey = this.getBussinessKey(record);
    if (!businessKey) return null;
    return getResponse(await request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`, {
      method: 'get',
    }));
  }
}
