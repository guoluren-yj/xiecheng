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

  eventTarget: EventTarget | null = null;

  @observable approveDataMap: ObservableMap<string, any> = observable.map();

  @observable historyDataMap: ObservableMap<string, any> = observable.map();

  @observable revokeDataMap: ObservableMap<string, any> = observable.map();

  constructor(dataSet: DataSet) {
    this.dataSet = dataSet;
    try {
        this.eventTarget = new EventTarget();
    } catch (error) {
        // console.log(error); // Re-throw the error after logging it
    }
    this.bindDataSet();
  }

  bindDataSet = () => {
    this.dataSet.addEventListener('load', this.load);
  }

  destroy = () => {
    this.dataSet.removeEventListener('load', this.load);
  }

  addEventListener = (type, callback) => {
    // eslint-disable-next-line no-unused-expressions
    this.eventTarget?.addEventListener(type, callback); // 监听事件
  }

  removeEventListener = (type, callback) => {
    // eslint-disable-next-line no-unused-expressions
    this.eventTarget?.removeEventListener(type, callback); // 移除监听事件
  }

  load = ({ dataSet }: { dataSet: DataSet }) => {
    const workflowBussinessKeyList = dataSet.all.reduce<string[]>((totalKeyList, currentRecord) => {
      const bussinessKey = currentRecord?.get('batchApproveBussinessKey') || currentRecord.get('bussinessKey');
      return bussinessKey ? [...totalKeyList, bussinessKey] : totalKeyList;
    }, []);
    if (isEmpty(workflowBussinessKeyList)) {
      const event = new CustomEvent('load', { detail: { dataSet, workflowCaller: this } });
      // eslint-disable-next-line no-unused-expressions
      this.eventTarget?.dispatchEvent(event); // 触发事件
      return;
    }
    Promise.all([
      queryBatchApprovaFlag(workflowBussinessKeyList),
      queryBatchSimpleApprovalHistory(workflowBussinessKeyList),
      queryRevokeData(workflowBussinessKeyList),
    ]).then(([approveDataMap, historyDataMap, revokeDataMap]) => {
      if (approveDataMap) this.approveDataMap = approveDataMap;
      if (historyDataMap) this.historyDataMap = historyDataMap;
      if (revokeDataMap) this.revokeDataMap = revokeDataMap;
      const event = new CustomEvent('load', { detail: { dataSet, workflowCaller: this } });
      // eslint-disable-next-line no-unused-expressions
      this.eventTarget?.dispatchEvent(event); // 触发事件
    });
  }

  getBussinessKey = (record?: DSRecord): string | null => {
    const currentRecord = record || this.dataSet.current;
    const bussinessKey = currentRecord?.get('batchApproveBussinessKey') || currentRecord?.get('bussinessKey');
    return bussinessKey;
  }


  getApproveData = (record?: DSRecord): Record<string, any> | null => {
    const bussinessKey = this.getBussinessKey(record);
    if (!bussinessKey) return null;
    return this.approveDataMap[bussinessKey];
  }

  getApproveFlag = (record?: DSRecord): Boolean => {
    return Boolean(this.getApproveData(record));
  }

  getRevokeFlag = (record?: DSRecord): Boolean => {
    const bussinessKey = this.getBussinessKey(record);
    if (!bussinessKey) return false;
    return this.revokeDataMap[bussinessKey]?.REVOKE;
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
    const bussinessKey = this.getBussinessKey(record);
    if (!bussinessKey) return null;
    return <ApproveRecordSimple data={this.historyDataMap[bussinessKey]} />;
  }

}
