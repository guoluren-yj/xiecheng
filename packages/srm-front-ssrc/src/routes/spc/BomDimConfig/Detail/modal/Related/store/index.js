import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { runInAction } from 'mobx';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { BomDimensionWidgetCode } from '@/routes/spc/BomViewWorkbench/enum';

const organizationId = getCurrentOrganizationId();

const TableDS = ({
  isEdit,
  bomTemplateId,
  bomDimensionConfigId,
  bomDimensionWidgetCode,
  businessObject,
  bomDimensionCode,
}) => ({
  primaryKey: 'dimLovRelId',
  autoQuery: false,
  paging: false,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'bomDimensionConfigId',
      defaultValue: bomDimensionConfigId,
    },
    {
      name: 'bomDimensionCode',
      defaultValue: bomDimensionCode?.businessObjectFieldCode || bomDimensionCode,
    },
    {
      name: 'sourceFieldCode',
      label: intl.get('hpfm.individual.model.config.sourceGridField').d('Lov表字段'),
      type: FieldType.object,
      lovCode: 'HPFM.CUST.RELATE.FIELD.LIST',
      lovPara: { viewCode: bomDimensionWidgetCode },
      required: true,
      transformRequest: (value) => {
        return value && value.fieldCode;
      },
      transformResponse: (value, obj) => {
        return (
          value && {
            fieldCode: obj.sourceFieldCode,
            fieldName: obj.sourceFieldName,
          }
        );
      },
      optionsProps: {
        paging: false,
      },
    },
    {
      name: 'sourceFieldName',
      type: FieldType.string,
      bind: 'sourceFieldCode.fieldName',
    },
    {
      name: 'sourceFieldAlias',
      label: intl.get('hpfm.individual.model.config.sourceFieldAlias').d('Lov表字段别名'),
      type: FieldType.string,
    },
    {
      name: 'targetFieldId',
      label: intl.get('hpfm.individual.model.config.targetField').d('映射字段编码'),
      type: FieldType.object,
      lovCode: 'SPC.PRICE.BOM_DIM',
      lovPara: {
        bomTemplateId,
        businessObject,
        bomDimensionWidget: BomDimensionWidgetCode.INPUT,
        shieldBomDimensionConfigId: bomDimensionConfigId,
      },
      optionsProps: {
        paging: false,
      },
      required: true,
      transformRequest: (value) => {
        return value && value.bomDimensionConfigId;
      },
      transformResponse: (value, obj) => {
        return (
          value && {
            bomDimensionName: obj.targetFieldName,
            bomDimensionConfigId: obj.targetFieldId,
          }
        );
      },
    },
    // {
    //   name: "targetFieldCode",
    //   type: FieldType.string,
    //   bind: "targetFieldId.bomDimensionCode",
    // },
    // {
    //   name: "targetFieldName",
    //   type: FieldType.string,
    //   bind: "targetFieldId.fieldName",
    // },
    // {
    //   name: "targetModelCode",
    //   type: FieldType.string,
    //   bind: "targetFieldId.modelCode",
    // },
    // {
    //   name: "sourceDisplayField",
    //   type: FieldType.object,
    //   label: intl.get('hpfm.individual.model.config.sourceDisplayField').d('翻译字段'),
    //   lovCode: "HPFM.CUST.RELATE.FIELD.LIST",
    //   lovPara: { viewCode: bomDimensionWidgetCode },
    //   dynamicProps: {
    //     required: ({ record }) => record.get("targetFieldWidget") === "LOV",
    //   },
    //   transformRequest: (value) => {
    //     return value && value.fieldCode;
    //   },
    //   transformResponse: (_, obj) => {
    //     return {
    //       fieldCode: obj.sourceDisplayField,
    //       fieldName: obj.sourceDisplayFieldName,
    //     };
    //   },
    // },
  ],
  events: {
    update: ({ value, name, record }) => {
      runInAction(() => {
        switch (name) {
          case 'sourceFieldCode':
            record.set('sourceFieldAlias', value && value.fieldCode);
            break;
          case 'targetFieldId':
            record.set('targetFieldWidget', value && value.bomDimensionWidget);
            // record.set("sourceDisplayField", undefined);
            break;
          // case "sourceDisplayField":
          //   record.set("sourceDisplayFieldName", value && value.fieldName);
          //   break;
          default:
        }
      });
    },
  },
  queryParameter: {
    bomDimensionConfigId,
  },
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-lov-rels/${bomDimensionConfigId}`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-lov-rels`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-lov-rels`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { TableDS };
