import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default function OperateRecordDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'operatorByMeaning',
        label: intl.get('smpc.product.view.operateName').d('操作人'),
      },
      {
        name: 'operateTypeMeaning',
        label: intl.get('smpc.product.view.operateType').d('操作类型'),
      },
      {
        name: 'operateDate',
        type: 'date',
        label: intl.get('smpc.product.view.operateTime').d('操作时间'),
      },
      {
        name: 'remark',
        label: intl.get('smpc.product.model.remark').d('备注'),
      },
    ],
    transport: {
      read: {
        url: `/smpc/v1/${organizationId}/ec-price-monitor-change-logs`,
        method: 'GET',
      },
    },
  };
}
