import React from 'react';
import intl from 'utils/intl';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { observer } from 'mobx-react-lite';

const BtnApprovalCmp = observer(({ props, dataSet }) => {
  const {
    record,
    isSupplier,
    handleApprovalList = (e) => e,
    handleRevokeApprovalList = (e) => e,
  } = props;
  const approvaFlags = dataSet?.getState('approvaFlags');
  const operationFlags = dataSet?.getState('operationFlags');
  const businessKeys = record?.get('businessKey');
  const rcvStatusCode = record?.get('rcvStatusCode');
  const approvaFlag = approvaFlags?.[businessKeys];
  const operationFlag = operationFlags?.[businessKeys] || {};
  const { taskId, processInstanceId } = approvaFlag || {};
  if (isSupplier) {
    return (
      <>
        {rcvStatusCode === '20_SUBMITTED' && operationFlags && operationFlag?.REVOKE && (
          <PermissionButton
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleRevokeApprovalList({ record })}
            permissionList={[
              {
                code: `srm.logistics.receive.supplier-receipt-workbench.button.line.revokeapproval`,
                type: 'button',
                meaning: '审批',
              },
            ]}
          >
            {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
          </PermissionButton>
        )}
      </>
    );
  }
  return (
    <>
      {approvaFlags && approvaFlag && (
        <PermissionButton
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleApprovalList({ record, taskId, processInstanceId })}
          permissionList={[
            {
              code: `srm.logistics.receive.workbench.button.line.approval`,
              type: 'button',
              meaning: '审批',
            },
          ]}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </PermissionButton>
      )}
      {operationFlags && operationFlag?.REVOKE && (
        <PermissionButton
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleRevokeApprovalList({ record })}
          permissionList={[
            {
              code: `srm.logistics.receive.workbench.button.line.revokeapproval`,
              type: 'button',
              meaning: '审批',
            },
          ]}
        >
          {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
        </PermissionButton>
      )}
    </>
  );
});

export default BtnApprovalCmp;
