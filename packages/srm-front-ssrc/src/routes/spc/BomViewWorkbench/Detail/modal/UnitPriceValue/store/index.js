import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const FormDS = (bomDetailsLineId, isEdit) => {
  return {
    autoQuery: false,
    autoCreate: true,
    primaryKey: 'lineExtId',
    fields: [
      {
        name: 'dimensionCode',
        defaultValue: 'unitPrice',
      },
      {
        name: 'bomDetailsLineId',
        defaultValue: bomDetailsLineId,
      },
      {
        name: 'dimensionType',
        label: intl.get(`spc.bomViewWorkbench.model.unitPrice`).d('单价'),
        lookupCode: 'SSRC.PRICE_SOURCE_TYPE',
        defaultValue: 'FIXED',
      },
      {
        name: 'fixedValue',
        label: intl.get(`spc.bomViewWorkbench.model.fixedValue`).d('固定值'),
        type: 'number',
        dynamicProps: {
          required: ({ record }) => record.get('dimensionType') === 'FIXED' && isEdit,
        },
      },
      {
        name: 'templateIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.PRICE_LIB_TEMPLATE',
        label: intl.get('spc.bomViewWorkbench.model.sourcePricelib').d('来源价格库'),
        textField: 'templateName',
        valueField: 'templateCode',
        dynamicProps: {
          required: ({ record }) => record.get('dimensionType') === 'PRICE' && isEdit,
        },
      },
      {
        name: 'templateId',
        type: 'string',
        bind: 'templateIdLov.templateId',
      },
      {
        name: 'templateCode',
        type: 'string',
        bind: 'templateIdLov.templateCode',
      },
      {
        name: 'templateName',
        type: 'string',
        bind: 'templateIdLov.templateName',
      },
    ],
    events: {
      // query: ({ dataSet }) => {
      //   if (dataSet.length === 0) {
      //     dataSet.create({});
      //   }
      // },
      update: ({ record, name, value }) => {
        if (name === 'dimensionType') {
          switch (value) {
            case 'PRICE':
              record.set({
                fixedValue: '',
              });
              break;
            case 'FIXED':
              record.set({
                templateIdLov: {},
              });
              break;
            default:
              record.set({
                fixedValue: '',
                templateIdLov: {},
              });
          }
        }
      },
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/bom-line-ext/${bomDetailsLineId}/dim`,
          method: 'GET',
          query: data,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/bom-line-ext/save`,
          method: 'POST',
          data: data && data[0],
        };
      },
      // destroy: ({ data }) => {
      //   return {
      //     url: `${SRM_SPC}/v1/${organizationId}/bom-details-line-dim/delete`,
      //     method: 'DELETE',
      //     data,
      //   };
      // },
    },
  };
};

const InputParamsDS = ({ templateCode, bomDetailsLineId, lineExtId }) => {
  return {
    primaryKey: 'paramId',
    cacheSelection: true,
    paging: false,
    fields: [
      {
        name: 'bomDetailsLineId',
        defaultValue: bomDetailsLineId,
      },
      {
        name: 'templateCode',
        defaultValue: templateCode,
      },
      {
        name: 'lineExtId',
        defaultValue: lineExtId,
      },
      {
        name: 'dimensionCodeLov',
        type: 'object',
        lovCode: 'SSRC.PRICE_LIB_SERVICE_DIM',
        label: intl.get('ssrc.priceService.model.service.dimensionCode').d('参数编码'),
        textField: 'dimensionCode',
        valueField: 'dimensionCode',
        dynamicProps: {
          lovPara: ({ dataSet }) => ({
            templateCode: templateCode?.toString(),
            shieldDimCodes:
              dataSet.toData() &&
              dataSet.toData().filter((item) => item.dimensionCode) &&
              dataSet
                .toData()
                .filter((item) => item.dimensionCode)
                .map((item) => item.dimensionCode)
                .toString(),
          }),
        },
        required: true,
      },
      {
        name: 'dimensionCode',
        type: 'string',
        bind: 'dimensionCodeLov.dimensionCode',
      },
      {
        name: 'dimensionName',
        type: 'string',
        bind: 'dimensionCodeLov.dimensionName',
        label: intl.get('ssrc.priceService.model.service.dimensionName').d('参数名称'),
      },
      {
        name: 'fieldWidget',
        type: 'string',
        bind: 'dimensionCodeLov.fieldWidget',
      },
      {
        name: 'displayField',
        type: 'string',
        bind: 'dimensionCodeLov.displayField',
      },
      {
        name: 'valueField',
        type: 'string',
        bind: 'dimensionCodeLov.valueField',
      },
      {
        name: 'sourceCode',
        type: 'string',
        bind: 'dimensionCodeLov.sourceCode',
      },
      {
        name: 'defaultValue',
        transformResponse: (val, record) => {
          const { displayField, valueField, defaultValueMeaning } = record;
          if (val) {
            // LOV类型
            if (defaultValueMeaning) {
              return {
                [displayField]: defaultValueMeaning,
                [valueField]: val,
              };
            }
            // SELECT类型
            return val;
          }
          return null;
        },
        transformRequest: (value, record) => {
          if (value) {
            return record?.get('valueField') ? value[record.get('valueField')] : value;
          }
          return null;
        },
        computedProps: {
          type: ({ record }) => {
            return record?.get('fieldWidget') === 'LOV' ? 'object' : 'string';
          },
          lookupCode: ({ record }) => {
            return record?.get('fieldWidget') === 'SELECT' ? record?.get('sourceCode') : null;
          },
          lovCode: ({ record }) => {
            return record?.get('fieldWidget') === 'LOV' ? record?.get('sourceCode') : null;
          },
        },
        label: intl.get('ssrc.priceService.model.service.defaultValue').d('固定值'),
        // multiple: true,
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        switch (name) {
          case 'defaultValue':
            if (value && record?.get('fieldWidget') === 'LOV') {
              record.set({
                defaultValueMeaning: record?.get('displayField')
                  ? value[record.get('displayField')]
                  : value,
              });
            } else {
              record.set({
                defaultValueMeaning: null,
              });
            }
            break;
          case 'dimensionCodeLov':
            record.set({
              defaultValue: null,
            });
            break;
          default:
            break;
        }
      },
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/bom-details-line-dim/${lineExtId}/ext-dim`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/bom-details-line-dim/save-dim`,
          method: 'POST',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/bom-details-line-dim/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export { FormDS, InputParamsDS };
