import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default function tableDs(searchCode) {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'applyStatus',
      },
      {
        name: 'applyStatusMeaning',
        label: intl.get('smpc.ShelfApply.model.applyStatusMeaning').d('状态'),
      },
      {
        name: 'operation',
        label: intl.get('smpc.ShelfApply.model.operation').d('操作'),
        ignore: 'always',
      },
      {
        name: 'applyCode',
        label: intl.get('smpc.ShelfApply.model.applyCode').d('申请编码'),
      },
      {
        name: 'applyType',
      },
      {
        name: 'applyTypeMeaning',
        label: intl.get('smpc.ShelfApply.model.applyTypeMeaning').d('申请类型'),
      },
      {
        name: 'applyUserName',
        label: intl.get('smpc.ShelfApply.model.applyUserName').d('申请人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('smpc.ShelfApply.model.applyDate').d('申请时间'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smpc.ShelfApply.model.supplierCompanyName').d('供应商'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('smpc.ShelfApply.model.attachment').d('附件'),
        type: 'attachment',
        // ignore: 'always',
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `/smpc/v1/${organizationId}/sku-shelve-apply-headers`,
          method: 'GET',
          data: {
            customizeUnitCode: searchCode,
            ...data,
          },
        };
      },
      destroy({ data }) {
        return {
          url: `/smpc/v1/${organizationId}/sku-shelve-apply-headers`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
}
