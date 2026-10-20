import React, { useRef, useMemo } from 'react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import HistoryRecord from '../../../../components/HistoryRecord';
import { OperationIconType } from "../../../../components/HistoryRecord/enum";

const actionEnum = {
  NEW: {
    icon: OperationIconType.Add,
  },
  SUBMITED: {
    icon: OperationIconType.Submit,
  },
  CANCELED: {
    icon: OperationIconType.Cancel,
  },
  APPROVED: {
    icon: OperationIconType.Approve,
  },
  CONFIRMED: {
    icon: OperationIconType.Confirm,
  },
  REJECTED: {
    icon: OperationIconType.Return,
  },
  REVOKEED: {
    icon: OperationIconType.Revoke,
  },
};

const fieldsConfig = {
  userName: {
    alias: 'processUser',
  },
  typeCode: {
    alias: 'processStatus',
  },
  typeName: {
    alias: 'processStatusMeaning',
  },
  time: {
    alias: 'processDate',
  },
  remark: {
    alias: 'processRemark',
  },
};

interface OperationRecordProps {
  balHeaderId: string | number;
}

const OperationRecord = (props: OperationRecordProps) => {

  const historyRef = useRef<any>();
  const { balHeaderId } = props;

  const operationProps = useMemo(() => {
    return {
      actionEnum,
      primaryKey: 'recordId',
      documentName: intl.get('sbsm.fundPlan.view.message.prepSumDoc').d('编制汇总单'),
      fieldsConfig,
      readTransport: {
        url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-header-actions/${balHeaderId}`,
        method: 'GET',
      } as const,
    };
  }, [balHeaderId]);

  const approvalProps = useMemo(() => {
    return {
      categoryLovCode: 'SBSM.APPROVE_CATEGORY',
      readTransport: {
        url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/approve-records`,
        method: 'GET',
        params: { balHeaderId },
      } as const,
    };
  }, [balHeaderId]);

  return (
    <HistoryRecord
      ref={historyRef}
      approvalProps={approvalProps}
      operationProps={operationProps}
    />
  );

};

export default OperationRecord;