import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { PayDocRecordCustCode } from "../../utils/type";

export default (paperId: string | number): DataSetProps => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'payNum',
      label: intl.get('sbsm.bankBillPool.model.bankBillPool.payDocNum').d('支付单编号'),
    },
    {
      name: 'statementLineNum',
      label: intl.get('sbsm.bankBillPool.model.bankBillPool.payDocSettlementLineNum').d('支付单流水行号'),
    },
    {
      name: 'statusCode',
      label: intl.get('sbsm.bankBillPool.model.bankBillPool.useStatus').d('使用状态'),
      lookupCode: 'SBSM.BANK_PAPER_RECORD_STATUS',
    },
    {
      name: 'createdByName',
      label: intl.get('sbsm.bankBillPool.model.bankBillPool.createdBy').d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get('sbsm.bankBillPool.model.bankBillPool.creationTime').d('创建时间'),
    },
  ],
  queryParameter: {
    customizeUnitCode: PayDocRecordCustCode,
  },
  transport: {
    read: {
      url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/associate-record/${paperId}`,
      method: 'GET',
    },
  },
});