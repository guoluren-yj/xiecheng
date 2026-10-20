import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

const organizationId = getCurrentOrganizationId();

const BasicInfoDS = (isEdit) => ({
  autoCreate: true,
  fields: [
    {
      name: 'formulaStatusCode',
      label: intl.get('hzero.common.templateStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_STATUS',
    },
    {
      name: 'formulaCode',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.pcName`).d('公式编码'),
    },
    {
      name: 'formulaName',
      type: FieldType.intl,
      label: intl.get(`spc.formulaManage.model.formulaName`).d('公式名称'),
      required: isEdit,
    },
    {
      name: 'formulaStatusCode',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.formulaStatusCode`).d('公式状态'),
      lookupCode: 'SSRC.FORMULA_STATUS_CODE',
    },
    {
      name: 'bomStructureId',
      type: 'object',
      lovCode: 'SPC.PRICE_BOM_LOV',
      label: intl.get('spc.formulaManage.model.bomStructureId').d('BOM结构'),
      transformResponse: (value, record) => {
        const { bomStructureId, bomTemplateName } = record;
        return value
          ? {
              bomTemplateId: bomStructureId,
              bomTemplateName,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.bomTemplateId;
      },
      required: isEdit,
    },
    {
      name: 'bomTemplateCode',
      bind: 'bomStructureId.bomTemplateCode',
    },
    {
      name: 'bomTemplateName',
      bind: 'bomStructureId.bomTemplateName',
    },
    {
      name: 'formulaTypeCode',
      type: 'string',
      label: intl.get('spc.formulaManage.model.formulaTypeCode').d('公式类型'),
      lookupCode: 'SSRC.FORMULA_TYPE_CODE',
      required: isEdit,
    },
    // {
    //   name: 'ladderQuotationFlag',
    //   type: 'boolean',
    //   label: intl.get('spc.formulaManage.model.ladderQuotationFlag').d('是否阶梯价'),
    //   trueValue: 1,
    //   falseValue: 0,
    //   defaultValue: 0,
    // },
    {
      name: 'configLadder',
      type: 'string',
      label: intl.get('spc.formulaManage.view.title.configLadder').d('配置阶梯'),
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdBy',
    },
    {
      name: 'versionNum',
      label: intl.get('spc.formulaManage.model.versionNum').d('版本'),
    },
    {
      name: 'operationalFormula',
      dynamicProps: {
        required: ({ record }) => record.get('formulaId'),
      },
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formulas/detail`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formulas`,
        method: 'POST',
        data,
      };
    },
  },
  feedback: {
    submitSuccess: () => { },
  },
});

export default BasicInfoDS;
