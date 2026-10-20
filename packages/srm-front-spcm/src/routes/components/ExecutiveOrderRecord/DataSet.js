import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const executiveRecordDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'seqNum',
      type: 'string',
      label: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
    },
    {
      name: 'orderStatus',
      type: 'string',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'poNum',
      type: 'string',
      label: intl.get(`sodr.common.model.common.poNum`).d('执行单据编号'),
    },
    {
      name: 'poTypeDesc',
      type: 'string',
      label: intl.get(`sodr.common.model.common.poTypeDesc`).d('执行单据类型'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sodr.common.model.common.executeQuantity`).d('执行数量'),
    },
    {
      name: 'executedAmount',
      type: 'number',
      label: intl.get(`sodr.common.model.common.executedAmount`).d('执行金额'),
    },
    {
      name: 'executeBy',
      type: 'string',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'executeDate',
      type: 'string',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'receiptsStatus',
      type: 'string',
      label: intl.get(`spcm.common.model.receiptsStatus`).d('执行状态'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/execute-bills/detail`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

export default executiveRecordDS;
