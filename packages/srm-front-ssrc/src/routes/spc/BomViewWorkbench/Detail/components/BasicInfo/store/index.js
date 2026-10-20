import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray } from 'lodash';

const organizationId = getCurrentOrganizationId();

const BasicInfoDS = (bomViewId, isEdit) => ({
  autoCreate: true,
  fields: [
    {
      name: 'bomViewStatus',
      label: intl.get('hzero.common.templateStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_STATUS',
    },
    {
      name: 'bomViewCode',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewCode`).d('价格BOM编码'),
    },
    {
      name: 'bomViewName',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewName`).d('价格BOM名称'),
      required: isEdit,
    },
    // {
    //   name: 'companyId',
    //   label: intl.get(`spc.bomViewWorkbench.model.bomViewScope`).d('公司'),
    //   type: 'object',
    //   lovCode: 'SPFM.USER_AUTH.COMPANY',
    //   transformResponse: (value, record) => {
    //     const { companyId, companyName } = record;
    //     return value
    //       ? {
    //           companyId,
    //           companyName,
    //         }
    //       : null;
    //   },
    //   transformRequest: (value) => value?.companyId,
    // },
    // {
    //   name: 'bomViewItemId',
    //   label: intl.get('spc.bomViewWorkbench.model.bomViewItemId').d('主物料'),
    //   type: 'object',
    //   required: isEdit,
    //   lovCode: 'SSRC.PRICE_LIB_ITEM',
    //   dynamicProps: {
    //     disabled: ({ record }) => (record?.get('bomViewVersion') || 1) !== 1,
    //   },
    //   transformResponse: (value, record) => {
    //     const { bomViewItemId, bomViewItemName, bomViewItemCode } = record;
    //     return value
    //       ? {
    //           itemId: bomViewItemId,
    //           partnerItemId: bomViewItemId,
    //           itemName: bomViewItemName,
    //           itemCode: bomViewItemCode,
    //         }
    //       : null;
    //   },
    //   transformRequest: (value) => {
    //     return value?.partnerItemId;
    //   },
    // },
    {
      name: 'bomViewValidDate',
      ignore: 'always',
      type: 'date',
      range: true,
      label: intl.get('spc.bomViewWorkbench.model.bomViewValidDate').d('有效期'),
      transformResponse: (_, record) => {
        const { bomViewValidDateFrom = null, bomViewValidDateTo = null } = record;
        return bomViewValidDateFrom || bomViewValidDateTo
          ? [bomViewValidDateFrom, bomViewValidDateTo]
          : null;
      },
    },
    // {
    //   name: 'bomViewSupplierId',
    //   label: intl.get('spc.bomViewWorkbench.model.bomViewSupplierId').d('供应商'),
    //   type: 'object',
    //   lovCode: 'SPFM.USER_AUTH.SUPPLIER',
    //   transformResponse: (value, record) => {
    //     const { bomViewSupplierId, bomViewSupplierName, supplierId } = record;
    //     return value
    //       ? {
    //           supplierId,
    //           supplierCompanyId: bomViewSupplierId,
    //           supplierCompanyName: bomViewSupplierName,
    //         }
    //       : null;
    //   },
    //   transformRequest: (value) => {
    //     return value?.supplierCompanyId;
    //   },
    // },
    {
      name: 'supplierId',
      bind: 'bomViewSupplierId.supplierId',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdBy',
    },
    {
      name: 'bomViewType',
      label: intl.get('spc.bomViewWorkbench.model.bomViewType').d('价格BOM类型'),
      lookupCode: 'SPC.PRICE_BOM_VIEW_TYPE',
      defaultValue: 'HIERARCHY',
    },
    {
      name: 'bomTemplateId',
      label: intl.get('spc.bomViewWorkbench.model.bomTemplateId').d('BOM结构'),
      type: 'object',
      required: isEdit,
      lovCode: 'SPC.PRICE_BOM_LOV',
      transformResponse: (value, record) => {
        const { bomTemplateId, bomTemplateName, bomTemplateCode } = record;
        return value
          ? {
              bomTemplateId,
              bomTemplateName,
              bomTemplateCode,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.bomTemplateId;
      },
    },
    {
      name: 'bomTemplateName',
      bind: 'bomTemplateId.bomTemplateName',
    },
    {
      name: 'bomTemplateCode',
      bind: 'bomTemplateId.bomTemplateCode',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'creationDate',
    },
    {
      name: 'bomViewVersion',
      label: intl.get('spc.bomViewWorkbench.model.bomViewVersion').d('版本'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      switch (name) {
        case 'bomViewValidDate':
          if (value && isArray(value) && value.length === 2) {
            record.set({
              bomViewValidDateFrom: value[0],
              bomViewValidDateTo: value[1],
            });
          }
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/${bomViewId}`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/save`,
        method: 'POST',
        data,
      };
    },
  },
});

export default BasicInfoDS;
