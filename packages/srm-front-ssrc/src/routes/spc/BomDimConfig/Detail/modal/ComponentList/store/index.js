import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TableDS = ({ bomDimensionConfigId, bomTemplateId, isEdit }) => ({
  primaryKey: 'bomGroupId',
  autoQuery: false,
  paging: false,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'bomDimensionConfigId',
      defaultValue: bomDimensionConfigId,
    },
    {
      name: 'bomLineName',
      type: 'object',
      label: intl.get(`spc.bomDimConfig.model.bomLineName`).d('BOM行字段名'),
      lovCode: 'SSRC.PRICE_BOM_DIM_LIST',
      required: true,
      dynamicProps: {
        lovPara: () => {
          return {
            bomTemplateId,
          };
        },
      },
      transformRequest: (value) => {
        return value && value.bomDimensionName;
      },
      transformResponse: (value, obj) => {
        const { bomLineCode } = obj;
        return (
          value && {
            bomDimensionName: value,
            bomDimensionCode: bomLineCode,
          }
        );
      },
    },
    {
      name: 'bomLineCode',
      label: intl.get(`spc.bomDimConfig.model.bomLineCode`).d('BOM行字段编码'),
      bind: 'bomLineName.bomDimensionCode',
    },
    {
      name: 'groupListCode',
      type: 'object',
      label: intl.get(`spc.bomDimConfig.model.groupListCode`).d('组件清单字段编码'),
      required: true,
      lovCode: 'SSRC_PRICE_ITEM_GROUP_COLUMN',
      transformResponse: (value, record) => {
        const { groupListName } = record;
        return (
          value && {
            businessObjectFieldCode: value,
            businessObjectFieldName: groupListName,
          }
        );
      },
      transformRequest: (value) => value?.businessObjectFieldCode,
    },
    {
      name: 'groupListName',
      label: intl.get(`spc.bomDimConfig.model.groupListName`).d('组件清单字段名称'),
      bind: 'groupListCode.businessObjectFieldName',
    },
  ],
  queryParameter: {
    bomDimensionConfigId,
  },
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-group-mappings/${bomDimensionConfigId}`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-group-mappings`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-group-mappings`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { TableDS };
