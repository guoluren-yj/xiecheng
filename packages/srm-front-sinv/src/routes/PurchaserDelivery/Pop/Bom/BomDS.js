import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const BomDataSet = () => ({
  autoQuery: false,
  pageSize: 10,
  selection: false,
  fields: [
    {
      label: intl.get(`sinv.common.model.common.orderSeq`).d('序号'),
      name: 'orderSeq',
      width: 100,
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      align: 'center',
      name: 'itemCode',
      width: 100,
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'itemName',
      width: 120,
    },
    {
      label: intl.get(`entity.item.type`).d('物料类型'),
      width: 120,
      name: 'categoryName',
    },
    {
      label: intl.get(`sinv.common.model.common.refQuantity`).d('参考数量'),
      width: 120,
      name: 'refQuantity',
    },
    {
      label: intl.get(`sinv.common.model.common.needQuantity`).d('需求数量'),
      width: 100,
      name: 'quantity',
    },
    {
      label: intl.get(`sinv.common.model.common..uomName`).d('单位'),
      width: 120,
      name: 'uomName',
    },
    {
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
      width: 120,
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`sinv.common.model.common..needByDate`).d('需求日期'),
      width: 120,
      name: 'needByDate',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms`,
        method: 'GET',
      };
    },
  },
});

export { BomDataSet };
