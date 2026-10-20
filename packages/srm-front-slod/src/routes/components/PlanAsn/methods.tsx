import intl from 'utils/intl';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SLOD } from '_utils/config';

const organizationId = getCurrentOrganizationId();


export const columns = [
    {
        name: 'confirmArrivalDate',
        type: 'date',
        label: intl.get('slod.deliveryWorkbench.model.common.confirmArrivalDate').d('确认到货日期'),
    },
    {
        name: 'canOccupyQuantity',
        type: 'number',
        label: intl.get('slod.deliveryWorkbench.model.common.canOccupyQuantity').d('剩余可送货数量'),
    },
];



export const fetchLineChange = (data) => {
    const { params, ...other } = data;
    const { nodeConfigId } = params || {};
    const queryData = filterNullValueObject({ ...params, ...other });
    return {
      url: `${SRM_SLOD}/v1/${organizationId}/delivery/plan/${nodeConfigId}/last-roll-plan`,
      method: 'GET',
      data: {
        ...queryData,
      },
    };
  };