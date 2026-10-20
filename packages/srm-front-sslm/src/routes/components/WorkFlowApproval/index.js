/*
 * Index - 工作流审批/撤销审批，审批详情组件
 * @Date: 2024-05-14 09:57:53
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { isEmpty, isFunction } from 'lodash';

import { Modal } from 'choerodon-ui/pro';
import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { queryRevokeDocument, revokeDocumentApprova } from '@/services/commonService';

/**
 * 查询所有审批操作
 * @param {*} param businessKeys: [] 工作流businessKey集合，revokeFlag 是否查询撤销审批操作, queryHistoryFlag 是否查询历史审批进度
 * @returns {}
 */
export const queryAllApprovalData = async ({
  businessKeys = [],
  revokeFlag = 1,
  queryHistoryFlag = true,
}) => {
  return Promise.all([
    queryBatchApprovaData(businessKeys),
    queryBatchRevokeDocument({ revokeFlag, businessKeys }),
    queryHistoryFlag ? queryBatchApprovalHistory(businessKeys) : false,
  ]).then(response => {
    const [approvaMap, revokeMap, approvalHistoryResp] = response;
    let approvalDataMap = {};
    let revokeDataMap = {};
    let approvalHistoryMap = {};
    if (approvaMap) {
      approvalDataMap = filterNullValueObject(approvaMap);
    }
    if (revokeMap) {
      revokeDataMap = revokeMap;
    }
    if (approvalHistoryResp) {
      approvalHistoryMap = filterNullValueObject(approvalHistoryResp);
    }
    return {
      approvalDataMap,
      revokeDataMap,
      approvalHistoryMap,
    };
  });
};

/**
 * 查询可以审批的单据
 * @param {array} businessKeys 多个businessKey
 * @return {map<string, object>} 返回每个businessKey对应的taskId和processInstanceId,若为null表示businessKey对应的流程不可审批
 */
export const queryBatchApprovaData = async (params = []) => {
  if (!isEmpty(params)) {
    const res = await queryBatchApprovaFlag(params);
    if (getResponse(res)) {
      return res;
    }
  }
};

/**
 *  查询可以撤销审批的单据
 * @param {*} params { revokeFlag = 1,// 1: 查询能不能撤销操作； businessKeys = [] }
 * @returns
 */
export const queryBatchRevokeDocument = async (params = []) => {
  const { businessKeys } = params;
  if (isEmpty(businessKeys)) {
    return;
  }
  const res = await queryRevokeDocument(params);
  if (getResponse(res)) {
    const result = {};
    // 过滤可以撤销审批的单据
    if (res && Object.keys(res).length >= 1) {
      Object.keys(res).forEach(key => {
        if (res[key] && res[key].REVOKE) {
          result[key] = res[key];
        }
      });
    }
    return result;
  }
};

/**
 * 查询审批进度
 */
export const queryBatchApprovalHistory = async (businessKeys = []) => {
  if (isEmpty(businessKeys)) {
    return;
  }
  const res = await queryBatchSimpleApprovalHistory(businessKeys);
  return filterNullValueObject(res);
};

/**
 * 处理审批/撤销按钮
 * @param {*} processDataMap {approvalDataMap: {},// 审批数据 revokeDataMap: {} // 撤销审批数据} onSuccess 操作成功回调 permissionListMap 权限集集合
 * @returns
 */
export const renderApprovaBtn = ({
  processDataMap = {},
  record,
  onSuccess = () => {},
  permissionListMap = {},
}) => {
  if (!record || isEmpty(processDataMap)) {
    return null;
  }
  const businessKey = record.get('businessKey');
  const { approvalDataMap, revokeDataMap } = processDataMap;
  if (isEmpty(approvalDataMap) && isEmpty(revokeDataMap)) {
    return null;
  }
  const approvaConfig = approvalDataMap[businessKey];
  const revokeConfig = revokeDataMap[businessKey];
  // 单据不能审批也不能撤销不展示按钮
  if (!approvaConfig && !revokeConfig) {
    return null;
  }
  const approvaProps = {
    ...approvaConfig,
    onSuccess,
  };
  const revokeProps = {
    businessKey,
    onSuccess,
  };
  const { approvaPermission, revokePermission } = permissionListMap;
  return (
    <>
      <ApprovalBtn
        hidden={!approvaConfig}
        funcType="link"
        showIcon={false}
        approveProps={approvaProps}
        permissionList={approvaPermission}
      />
      <RevokeApprovalBtn
        hidden={!revokeConfig}
        funcType="link"
        showIcon={false}
        approveProps={revokeProps}
        permissionList={revokePermission}
      />
    </>
  );
};

/**
 * 审批进度组件
 * @param {*} param
 * @returns
 */
export const renderApproveProgress = ({ approvalHistoryMap = {}, record } = {}) => {
  if (!record || isEmpty(approvalHistoryMap)) {
    return '-';
  }
  const businessKey = record.get('businessKey');
  const data = approvalHistoryMap[businessKey];
  if (isEmpty(data)) {
    return '-';
  }
  return <ApproveRecordSimple data={data} />;
};

// 审批按钮
export const ApprovalBtn = (props = {}) => {
  const { showIcon = true, loading = false, ...others } = props;
  const btnProps = filterNullValueObject({ ...others, loading });
  // const { onSuccess, ...otherApproveProps } = approveProps;
  return (
    <PermissionButton
      type="c7n-pro"
      icon={showIcon ? 'authorize' : ''}
      funcType="flat"
      {...btnProps}
      onClick={() => handleApprove(props)}
    >
      {intl.get('hzero.common.button.approval').d('审批')}
    </PermissionButton>
  );
};

// 撤销审批按钮
export const RevokeApprovalBtn = (props = {}) => {
  const { approveProps = {}, showIcon = true, loading = false, ...others } = props;
  const btnProps = filterNullValueObject({ ...others, loading });
  return (
    <PermissionButton
      type="c7n-pro"
      icon={showIcon ? 'reply' : ''}
      funcType="flat"
      {...btnProps}
      onClick={() => {
        handleRevokeApprova(approveProps);
      }}
    >
      {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
    </PermissionButton>
  );
};

// 审批通过
export const handleApprove = (params = {}) => {
  const { modalProps = {}, approveProps = {} } = params;
  const { onSuccess, ...otherApproveProps } = approveProps;
  openApproveModal({
    modalProps: {
      title: intl.get('sslm.common.view.title.process.detail').d('流程明细'),
      closable: true,
      ...modalProps,
    },
    ...otherApproveProps,
    onSuccess: () => {
      if (isFunction(onSuccess)) {
        onSuccess();
      }
    },
  });
};

// 撤销审批
export const handleRevokeApprova = (params = {}) => {
  const { businessKey, onSuccess } = params || {};
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sslm.common.view.message.revokeWorkFlowTips')
      .d('是否确认撤销审批？撤销后您仍可再次提交发起审批'),
    onOk: () => {
      return revokeDocumentApprova({ businessKey }).then(res => {
        // 工作流撤销接口报错会返回string类型，成功返回的不是string, 需要特殊处理
        const resp = getJSON(res);
        if (resp) {
          if (getResponse(resp)) {
            notification.success();
            if (isFunction(onSuccess)) {
              onSuccess();
            }
          }
          return;
        }
        if (res) {
          notification.error({
            description: res,
          });
        }
      });
    },
  });
};

const getJSON = str => {
  if (typeof str === 'object') {
    return str;
  }
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return obj;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
};
