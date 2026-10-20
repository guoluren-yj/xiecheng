import React from 'react';
import intl from 'utils/intl';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { observer } from 'mobx-react-lite';

const BtnApprovalCmp = observer(({ props, dataSet }) => {
  const {
    record,
    nodeConfigCode,
    handleApprovalList = (e) => e,
    handleRevokeApprovalList = (e) => e,
    tableConfigRef,
  } = props;
  // const dataSet = tableConfigRef.dataSet[`${tableConfigRef.tabKey}_${tableConfigRef.hdKey}`];
  const approvaFlags = dataSet.getState('approvaFlags');
  const operationFlags = dataSet.getState('operationFlags');
  const businessKeys = record.get('businessKey');
  const approvaFlag = approvaFlags?.[businessKeys];
  const operationFlag = operationFlags?.[businessKeys];
  const { taskId, processInstanceId } = approvaFlag || {};
  const code = nodeConfigCode?.toLowerCase();
  // const [num, setNum] = useState(0);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setNum(1);
  //   }, 500);
  // }, [operationFlag, approvaFlag]);
  // console.log(num);
  if (
    ['PURCHASER_SUBMITTED', 'SUPPLIER_SUBMITTED', 'CLOSE_APPROVAL'].includes(
      record?.get('statusCode')
    )
  ) {
    return (
      <>
        {approvaFlags && approvaFlag && (
          <PermissionButton
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() =>
              handleApprovalList({ tableConfigRef, record, taskId, processInstanceId, dataSet })
            }
            permissionList={[
              {
                code: `srm.logistics.delivery.work.bench.button.${code}.approval`,
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
            onClick={() => handleRevokeApprovalList({ record, dataSet })}
            permissionList={[
              {
                code: `srm.logistics.delivery.work.bench.button.${code}.revokeapproval`,
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
  return <></>;
});

export default BtnApprovalCmp;

// {["PURCHASER_SUBMITTED", "SUPPLIER_SUBMITTED", "CLOSE_APPROVAL" ].includes(record?.get('statusCode'))}
