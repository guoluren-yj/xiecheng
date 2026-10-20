// import { isNil } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const modelPrompt = 'sinv.common.model.common';

const bomDataSet = () => ({
  dataToJSON: 'dirty',
  primaryKey: 'index',
  selection: false,
  modifiedCheck: false,
  forceValidate: true,
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`entity.item.code`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`entity.item.name`).d('物料名称'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`entity.item.type`).d('物料类型'),
    },
    {
      name: 'refQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.refQuantity`).d('参考数量'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.needQuantity`).d('需求数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`${modelPrompt}.uomName`).d('单位'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
    },
    {
      name: 'needByDate',
      type: 'date',
      label: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const queryData = filterNullValueObject({ ...data });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { bomDataSet };
