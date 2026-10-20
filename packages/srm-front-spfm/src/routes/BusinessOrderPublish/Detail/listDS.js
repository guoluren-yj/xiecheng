import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export default function ListDS() {
  return {
    autoQuery: false,
    paging: false,
    primaryKey: 'supplierCompanyId',
    forceValidate: true,
    fields: [
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyCode',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('spfm.businessOrder.model.businessOrder.contactId').d('联系人'),
        name: 'contactId',
        type: 'object',
        lovCode: 'SPFM.SUPPLIER_CONTANCTS',
        required: true,
        textField: 'name',
        transformResponse(value, data) {
          if (value) {
            return {
              companyContactId: value,
              name: data.contactName,
            };
          } else {
            return null;
          }
        },
        lovPara: {
          tenantId: getCurrentOrganizationId(),
        },
        transformRequest: (value) => value && value.companyContactId,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: getCurrentOrganizationId(),
            supplierCompanyId: record.get('supplierCompanyId'),
            supplierTenantId: record.get('supplierTenantId'),
            supplierContactFlag: record?.dataSet?.getState('supplierContactFlag'),
            companyId: record?.dataSet?.getState('companyId'),
          }),
        },
      },
      {
        label: intl.get('spfm.businessOrder.model.businessOrder.contactId').d('联系人'),
        name: 'contactName',
        bind: 'contactId.name',
      },
      {
        label: intl.get('spfm.businessOrder.model.businessOrder.contactPhone').d('联系电话'),
        name: 'contactPhone',
      },
      {
        label: intl.get('hzero.common.email').d('邮箱'),
        name: 'contactEmail',
      },
      {
        label: intl.get('spfm.businessOrder.model.businessOrder.receiveFlag').d('是否签收'),
        name: 'receiveFlag',
      },
      {
        label: intl.get('spfm.businessOrder.model.businessOrder.receiveDate').d('签收时间'),
        name: 'receiveDate',
        type: 'dateTime',
        render: (val) => dateTimeRender(val)
      },
      {
        label: intl
          .get('spfm.businessOrder.model.businessOrder.requireAttachmentFlag')
          .d('供应商是否附件必输'),
        name: 'requireAttachmentFlag',
        type: 'string',
        required: true,
        lookupCode: 'HPFM.FLAG',
      },
      {
        label: intl
          .get('spfm.businessOrder.model.businessOrder.businessOrderFile')
          .d('供应商签署附件'),
        name: 'receivesAttachmentUuid',
        type: 'attachment',
        viewMode: 'popup',
        bucketDirectory: 'spfm-business-order',
        bucketName: PRIVATE_BUCKET,
      },
    ],
  };
}
