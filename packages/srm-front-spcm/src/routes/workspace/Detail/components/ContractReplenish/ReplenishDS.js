import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 补充协议
const ReplenishDS = (props) => {
  const { pcHeaderId } = props;
  return {
    paging: false,
    selection: false,
    primaryKey: 'replenishId',

    fields: [
      {
        name: 'pcStatusCodeMeaning',
        type: 'string',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'pcNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.replenishContract`).d('补充协议编号'),
      },
      {
        name: 'version',
        type: 'string',
        label: intl.get(`spcm.common.model.common.version`).d('版本号'),
      },
      {
        name: 'createdName',
        type: 'string',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      },
      {
        name: 'effectDate',
        type: 'date',
        label: intl.get(`spcm.purchaseContractView.model.startDateActive`).d('生效日期'),
      },
      {
        name: 'fieldComparison',
        label: intl.get(`spcm.common.model.fieldComparison`).d('字段对比'),
      },
      {
        name: 'viewCertificate',
        label: intl.get('spcm.common.view.title.viewCertificate').d('查看存证'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-supplements/${pcHeaderId}/page`,
          method: 'GET',
          data: queryParams,
        };
      },
    },
  };
};

export default ReplenishDS;
