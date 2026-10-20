import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const BasicInfoDS = (bomTemplateId, isEdit) => ({
  autoCreate: true,
  paging: false,
  fields: [
    {
      name: 'bomTemplateStatus',
      label: intl.get('hzero.common.templateStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_STATUS',
    },
    {
      name: 'bomTemplateCode',
      label: intl.get(`spc.bomDimConfig.model.bomTemplateCode`).d('结构编码'),
    },
    {
      name: 'bomTemplateName',
      label: intl.get(`spc.bomDimConfig.model.bomTemplateName`).d('结构名称'),
      required: isEdit,
    },
    {
      name: 'bomTemplateVersion',
      label: intl.get('spc.bomDimConfig.model.bomTemplateVersion').d('版本'),
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdName',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'creationDate',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-template/${bomTemplateId}`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-template/save`,
        method: 'POST',
        data,
      };
    },
  },
});

export default BasicInfoDS;
