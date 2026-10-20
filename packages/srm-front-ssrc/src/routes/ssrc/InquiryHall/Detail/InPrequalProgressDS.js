import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const tableDS = ({ prequalHeaderId = '', supplierCompanyId = '' }) => {
  return {
    autoQuery: true,
    primaryKey: 'prequalMemberId',
    paging: false,
    selection: false,
    fields: [
      {
        name: 'loginName',
        label: intl.get('ssrc.common.account').d('账号'),
      },
      {
        name: 'realName',
        label: intl.get('ssrc.common.realName').d('名称'),
      },
      {
        name: 'leaderFlagMeaning',
        label: intl.get('ssrc.common.duty').d('职责'),
      },
      {
        label: intl.get(`ssrc.common.operationTime`).d('操作时间'),
        name: 'approvedDate',
        showType: 'dateTime',
      },
      {
        name: 'lineApprovedStatusMeaning',
        label: intl.get('ssrc.qualiExam.model.qualiExam.lineApprovedAdvice').d('预审建议结果'),
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'approvedRemark',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/prequal/RFX/summary-supplier`,
          method: 'GET',
          params: {
            prequalHeaderId,
            supplierCompanyId,
          },
        };
      },
    },
  };
};

export { tableDS };
