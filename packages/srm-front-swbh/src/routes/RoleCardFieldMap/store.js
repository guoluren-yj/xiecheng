import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId, isTenantRoleLevel, filterNullValueObject } from 'utils/utils';
// import { SRM_SWBH } from '../../components/utils/config';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'swbh.common.model.common';

const listDS = (params = null) => ({
  primaryKey: 'templateId',
  cacheSelection: params === 'quote',
  dataToJSON: 'all',
  selection: params === 'quote' ? 'multiple' : false,
  autoQuery: true,
  queryFields:
    params === 'quote'
      ? null
      : [
          {
            label: intl.get(`${commonPrompt}.combineCode`).d('单据对象编码'),
            name: 'combineCode',
            type: FieldType.object,
            lovCode: 'SWBH.COMBINE_OBJECT',
            valueField: 'combineCode',
            textField: 'combineName',
            labelWidth: '120',
            transformRequest: (value) => (value?.combineCode ? value?.combineCode : value?.value),
          },
          {
            label: intl.get(`${commonPrompt}.roleCombineName`).d('单据对象名称'),
            name: 'combineName',
            type: FieldType.string,
            labelWidth: '120',
          },
          {
            name: 'scene',
            label: intl.get(`${commonPrompt}.applicableScenes`).d('适用场景'),
            type: FieldType.string,
            lookupCode: 'SWBH.TEMPLATE_SCENE',
            labelWidth: '120',
          },
          // {
          //   name: 'cardType',
          //   label: intl.get(`${commonPrompt}.cardType`).d('卡片类型'),
          //   type: FieldType.object,
          //   lookupCode: 'SWBH.TEMPLATE_CARD_TYPE',
          //   transformRequest: value => (value?.cardType ? value?.cardType : value?.value),
          // },
          {
            name: 'cardCode',
            label: intl.get(`${commonPrompt}.card`).d('卡片'),
            type: FieldType.object,
            lovCode: 'SWBH.TEMPLATE_CARD',
            transformRequest: (value) => (value?.cardCode ? value?.cardCode : value?.value),
            dynamicProps: {
              lovPara: ({ record }) => {
                // if (record?.get('cardType')) {
                //   const cardTypeObj = record?.get('cardType') ?? {};
                //   const { value } = cardTypeObj;
                //   return {
                //     tenantId: organizationId,
                //     cardType: value,
                //   };
                // }

                return {
                  tenantId: organizationId,
                  // combineCode: record?.get('combineCode')?.combineCode,
                  // cardType: record.get('cardType'),
                };
              },
            },
            // textField: 'cardCode.cardName',
            // valueField: 'cardCode.cardCode',
          },
          {
            label: intl.get(`${commonPrompt}.status`).d('状态'),
            name: 'enabledFlag',
            type: FieldType.string,
            textField: 'text',
            valueField: 'value',
            options: new DataSet({
              selection: 'single',
              data: [
                {
                  text: intl.get('hzero.common.status.enabled').d('启用'),
                  value: 1,
                },
                {
                  text: intl.get('hzero.common.button.disable').d('禁用'),
                  value: 0,
                },
              ],
            }),
          },
        ],
  fields: [
    {
      name: 'docObjectId',
      type: FieldType.string,
    },
    {
      name: 'combineId',
      type: FieldType.string,
    },
    {
      name: 'combineName',
      type: 'object',
      label: intl.get(`${commonPrompt}.roleCombineName`).d('单据对象名称'),
    },
    {
      label: intl.get(`${commonPrompt}.combineName`).d('单据对象编码'),
      name: 'combineCode',
      type: FieldType.string,
    },
    {
      name: 'scene',
      label: intl.get(`${commonPrompt}.applicableScenes`).d('适用场景'),
      type: FieldType.string,
      lookupCode: 'SWBH.TEMPLATE_SCENE',
      labelWidth: '120',
      transformRequest: (value) => value?.value,
    },
    {
      name: 'cardName',
      label: intl.get(`${commonPrompt}.card`).d('卡片'),
      type: FieldType.string,
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
    {
      label: intl.get(`${commonPrompt}.operation`).d('操作'),
      name: 'operation',
      type: FieldType.string,
    },
  ],

  transport: {
    read: () => {
      const url =
        params === 'quote'
          ? `/swbh/v1/${organizationId}/template-header/siteList?enabledFlag=1`
          : isTenantRoleLevel()
          ? `/swbh/v1/${organizationId}/template-header/list`
          : `/swbh/v1/template-header/list`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

const formDs = () => ({
  fields: [
    {
      label: intl.get(`${commonPrompt}.combineName`).d('单据对象编码'),
      name: 'combineCode',
      type: FieldType.object,
      valueField: 'combineCode',
      textField: 'combineCode',
      lovCode: 'SWBH.COMBINE_OBJECT',
      required: true,
      transformResponse: (value, object) => {
        return object?.combineCode
          ? {
              combineCode: object?.combineCode,
              combineName: object?.combineName,
            }
          : {};
      },
      transformRequest: (value) => value?.combineCode,
    },
    {
      name: 'combineName',
      type: 'string',
      label: intl.get(`${commonPrompt}.roleCombineName`).d('单据对象名称'),
      disabled: true,
    },
    {
      name: 'scene',
      label: intl.get(`${commonPrompt}.applicableScenes`).d('适用场景'),
      type: FieldType.string,
      lookupCode: 'SWBH.TEMPLATE_SCENE',
      labelWidth: '120',
      // transformResponse: (value, object) => {
      //   return object?.scene
      //     ? {
      //         // ...object,
      //         meaning: object?.meaning,
      //         scene: object?.scene,
      //       }
      //     : {};
      // },
      // transformRequest: value => value?.value,
    },
    // {
    //   name: 'sceneList',
    //   label: intl.get(`${commonPrompt}.applicableScenes`).d('适用场景'),
    //   type: FieldType.object,
    //   required: true,
    //   lookupCode: 'SWBH.TEMPLATE_SCENE',
    //   valueField: 'value',
    //   multiple: true,
    //   transformResponse: (value, object) => {
    //     const newData = object?.sceneList?.map(item => ({
    //       ...item,
    //       value: item?.scene,
    //       meaning: item?.sceneMeaning,
    //       scene: item?.scenec ?? item?.value,
    //     }));
    //     return object?.sceneList ? newData : [];
    //   },
    //   transformRequest: value => {
    //     return value;
    //   },
    //   processValue: value => {
    //     const data = {
    //       ...value,
    //       scene: value?.value,
    //     };
    //     return data;
    //   },
    // },
    // {
    //   name: 'cardTypeLov',
    //   label: intl.get(`${commonPrompt}.cardType`).d('卡片类型'),
    //   type: FieldType.object,
    //   lookupCode: 'SWBH.TEMPLATE_CARD_TYPE',
    //   // textField: 'cardName',
    //   valueField: 'cardType',
    //   dynamicProps: {
    //     disabled: ({ record }) => {
    //       const filterAArr = record?.get('sceneList').filter((item) => item.value === 'WORKBENCH');
    //       const flag = record?.get('sceneList') && record?.get('sceneList')?.length === 1 && filterAArr.length === 1;
    //       if (flag) {
    //         return false;
    //       } else {
    //         return true;
    //       }
    //     },
    //     required: ({ record }) => {
    //       const filterAArr = record?.get('sceneList').filter((item) => item.value === 'WORKBENCH');
    //       const flag = record?.get('sceneList') && record?.get('sceneList')?.length === 1 && filterAArr.length === 1;
    //       if (flag) {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     },
    //   },
    //   transformRequest: (value) => (value?.sceneList ? value?.sceneList : value?.value),
    // },
    {
      name: 'cardCode',
      label: intl.get(`${commonPrompt}.card`).d('卡片'),
      lovCode: 'SWBH.TEMPLATE_CARD',
      type: FieldType.object,
      textField: 'cardName',
      transformRequest: (value) => value?.cardCode,
      transformResponse: (value, object) => {
        return object?.cardCode
          ? {
              ...object,
              cardName: object?.cardName,
              cardCode: object?.cardCode,
            }
          : {};
      },
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId: organizationId,
            combineCode: record?.get('combineCode')?.combineCode,
          };
        },
        disabled: ({ record }) => {
          return record.get('scene') !== 'WORKBENCH';
        },
      },
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'scene') {
        record.set({
          cardCode: null,
          cardName: null,
        });
      }
      if (name === 'combineCode') {
        const { combineName } = value || {};
        record.set({
          combineName,
        });
      }
    },
  },
  transport: {
    update: ({ data }) => {
      const { ...params } = data[0];
      const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-header` : `/swbh/v1/template-header`;
      return {
        url,
        method: 'POST',
        body: params,
      };
    },
  },
});

const fieldMapDs = (combineCode) => ({
  dataToJSON: 'all',
  // selection: true,
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'fieldNum',
      required: true,
      label: intl.get(`${commonPrompt}.fieldNum`).d('序号'),
      type: FieldType.number,
    },
    {
      name: 'fieldName',
      required: true,
      label: intl.get(`${commonPrompt}.fieldName`).d('展示字段名称'),
      type: 'intl',
    },
    {
      name: 'valueTypeLov',
      required: true,
      label: intl.get(`${commonPrompt}.valueType`).d('取值类型'),
      type: FieldType.object,
      valueField: 'value',
      textField: 'meaning',
      lookupCode: 'SWBH.TEMPLATE_VALUE_TYPE',
      transformRequest: (value) => value?.value,
      transformResponse: (value, object) => {
        return object?.valueType
          ? {
              ...object,
              value: object?.valueType,
              meaning: object?.valueTypeMeaning,
            }
          : {};
      },
    },
    {
      name: 'valueTypeMeaning',
      label: intl.get(`${commonPrompt}.valueType`).d('取值类型'),
      type: FieldType.string,
    },
    {
      name: 'valueField',
      label: intl.get(`${commonPrompt}.valueField`).d('取值字段'),
      lovCode: 'SWBH.OBJECT_FIELD',
      // valueField: 'fieldCode',
      textField: 'fieldName',
      type: FieldType.object,
      lovPara: { combineCode },
      dynamicProps: {
        disabled: ({ record }) => record?.get('valueType') !== 'FIELD',
        required: ({ record }) => record?.get('valueType') === 'FIELD',
      },
      transformResponse: (value, object) => {
        return object?.valueField
          ? {
              ...object,
              fieldCode: object?.valueField,
              fieldName: object?.valueFieldName,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldCode,
    },
    // {
    //   name: 'valueField',
    //   label: intl.get(`${commonPrompt}.valueField`).d('取值字段'),
    //   type: FieldType.string,
    // },
    {
      name: 'valueFieldName',
      bind: 'valueField.fieldName',
      label: intl.get(`${commonPrompt}.valueFieldName`).d('取值字段名称'),
      type: FieldType.string,
    },
    {
      name: 'fixedValue',
      label: intl.get(`${commonPrompt}.fixedValue`).d('固定值'),
      type: 'intl',
      dynamicProps: {
        disabled: ({ record }) => record?.get('valueType') !== 'FIXED',
        required: ({ record }) => record?.get('valueType') === 'FIXED',
      },
    },
    {
      name: 'specialStyle',
      label: intl.get(`${commonPrompt}.specialStyle`).d('特殊标识'),
      type: FieldType.string,
      lookupCode: 'SWBH.TEMPLATE_STYLE',
      // transformRequest: value => value?.value,
    },
    {
      name: 'specialStyleMeaning',
      label: intl.get(`${commonPrompt}.specialStyle`).d('特殊标识'),
      type: FieldType.string,
    },
    {
      name: 'prefix',
      label: intl.get(`${commonPrompt}.prefix`).d('前缀文本'),
      type: 'intl',
    },
    {
      name: 'suffix',
      label: intl.get(`${commonPrompt}.suffix`).d('后缀文本'),
      type: 'intl',
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'valueTypeLov') {
        const { meaning, value: typeValue } = value || {};
        record.set({
          valueType: typeValue,
          fixedValue: null,
          valueField: null,
        });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { templateHeaderId, ...otherData } = data;
      const url = isTenantRoleLevel()
        ? `/swbh/v1/${organizationId}/template-field/list`
        : `/swbh/v1/template-field/list`;
      return {
        url,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          templateHeaderId,
        }),
      };
    },
    update: ({ data }) => {
      const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-field` : `/swbh/v1/template-field`;
      return {
        url,
        method: 'POST',
        body: data,
      };
    },
    destroy: ({ data }) => {
      const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-field` : `/swbh/v1/template-field`;
      return {
        url,
        method: 'DELETE',
        body: data,
      };
    },
  },
});

const layoutDefinitionDs = (templateId) => ({
  // dataToJSON: 'all',
  // selection: false,
  // autoQuery: false,
  // paging: false,
  fields: [
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      type: FieldType.string,
    },
    {
      name: 'tradeBody1',
      label: intl.get(`${commonPrompt}.columns1-1`).d('列1-1'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.tradeBody1
          ? {
              ...object,
              fieldNum: object?.tradeBody1,
              fieldName: object?.tradeBodyName1 ?? object?.tradeBody1,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'tradeBody2',
      label: intl.get(`${commonPrompt}.columns1-2`).d('列1-2'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.tradeBody2
          ? {
              ...object,
              fieldNum: object?.tradeBody2,
              fieldName: object?.tradeBodyName2 ?? object?.tradeBody2,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'tradeBody3',
      label: intl.get(`${commonPrompt}.columns1-3`).d('列1-3'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.tradeBody3
          ? {
              ...object,
              fieldNum: object?.tradeBody3,
              fieldName: object?.tradeBodyName3 ?? object?.tradeBody3,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'tradeBody4',
      label: intl.get(`${commonPrompt}.columns1-4`).d('列1-4'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.tradeBody4
          ? {
              ...object,
              fieldNum: object?.tradeBody4,
              fieldName: object?.tradeBodyName4 ?? object?.tradeBody4,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'businessField1',
      label: intl.get(`${commonPrompt}.columns2-1`).d('列2-1'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.businessField1
          ? {
              ...object,
              fieldNum: object?.businessField1,
              fieldName: object?.businessFieldName1 ?? object?.businessField1,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'businessField2',
      label: intl.get(`${commonPrompt}.columns2-2`).d('列2-2'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.businessField2
          ? {
              ...object,
              fieldNum: object?.businessField2,
              fieldName: object?.businessFieldName2 ?? object?.businessField2,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'businessField3',
      label: intl.get(`${commonPrompt}.columns2-3`).d('列2-3'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: 'object',
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.businessField3
          ? {
              ...object,
              fieldNum: object?.businessField3,
              fieldName: object?.businessFieldName3 ?? object?.businessField3,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'businessField4',
      label: intl.get(`${commonPrompt}.columns2-4`).d('列2-4'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      type: FieldType.object,
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.businessField4
          ? {
              ...object,
              fieldNum: object?.businessField4,
              fieldName: object?.businessFieldName4 ?? object?.businessField4,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'contentBody1',
      label: intl.get(`${commonPrompt}.columns3-1`).d('列3-1'),
      type: FieldType.object,
      lovCode: 'SWBH.TEMPLATE_FIELD',
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.contentBody1
          ? {
              ...object,
              fieldNum: object?.contentBody1,
              fieldName: object?.contentBodyName1 ?? object?.contentBody1,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'contentBody2',
      label: intl.get(`${commonPrompt}.columns3-2`).d('列3-2'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.contentBody2
          ? {
              ...object,
              fieldNum: object?.contentBody2,
              fieldName: object?.contentBodyName2 ?? object?.contentBody2,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'contentBody3',
      label: intl.get(`${commonPrompt}.columns3-3`).d('列3-3'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.contentBody3
          ? {
              ...object,
              fieldNum: object?.contentBody3,
              fieldName: object?.contentBodyName3 ?? object?.contentBody3,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'contentBody4',
      label: intl.get(`${commonPrompt}.columns3-4`).d('列3-4'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.contentBody4
          ? {
              ...object,
              fieldNum: object?.contentBody4,
              fieldName: object?.contentBodyName4 ?? object?.contentBody4,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'otherField1',
      label: intl.get(`${commonPrompt}.columns4-1`).d('列4-1'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.otherField1
          ? {
              ...object,
              fieldNum: object?.otherField1,
              fieldName: object?.otherFieldName1 ?? object?.otherField1,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'otherField2',
      label: intl.get(`${commonPrompt}.columns4-2`).d('列4-2'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.otherField2
          ? {
              ...object,
              fieldNum: object?.otherField2,
              fieldName: object?.otherFieldName2 ?? object?.otherField2,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'otherField3',
      label: intl.get(`${commonPrompt}.columns4-3`).d('列4-3'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.otherField3
          ? {
              ...object,
              fieldNum: object?.otherField3,
              fieldName: object?.otherFieldName3 ?? object?.otherField3,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'otherField4',
      label: intl.get(`${commonPrompt}.columns4-4`).d('列4-4'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.otherField4
          ? {
              ...object,
              fieldNum: object?.otherField4,
              fieldName: object?.otherFieldName4 ?? object?.otherField4,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
  ],
  events: {
    // update: ({ name, value, record }) => {
    //   if (name === 'tradeBody1Lov') {
    //     const { fieldNum, fieldName = null } = value || {};
    //     record.set({
    //       tradeBodyName1: fieldName,
    //     });
    //   }
    // },
  },
  // transport: {
  //   read: ({ data }) => {
  //     const { templateHeaderId, ...otherData } = data;
  //     const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-line/list` : `/swbh/v1/template-line/list`;
  //     return {
  //       url,
  //       method: 'GET',
  //       data: filterNullValueObject({
  //         ...otherData,
  //         templateHeaderId,
  //       }),
  //     };
  //   },
  //   update: ({ data }) => {
  //     const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-line` : `/swbh/v1/template-line`;
  //     return {
  //       url,
  //       method: 'POST',
  //       body: data,
  //     };
  //   },
  // },
});

const titleFromDs = (templateId, layoutDefinitionTableDs) => ({
  dataToJSON: 'all',
  selection: false,
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'titleField1',
      label: intl.get(`${commonPrompt}.titleField1`).d('标题字段1'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.titleField1
          ? {
              ...object,
              fieldNum: object?.titleField1,
              fieldName: object?.titleFieldName1 ?? object?.titleField1,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'titleField2',
      label: intl.get(`${commonPrompt}.titleField2`).d('标题字段2'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.titleField2
          ? {
              ...object,
              fieldNum: object?.titleField2,
              fieldName: object?.titleFieldName2 ?? object?.titleField2,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'titleField3',
      label: intl.get(`${commonPrompt}.titleField3`).d('标题字段3'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.titleField3
          ? {
              ...object,
              fieldNum: object?.titleField3,
              fieldName: object?.titleFieldName3 ?? object?.titleField3,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
    {
      name: 'titleField4',
      label: intl.get(`${commonPrompt}.statusTitleField`).d('状态类字段'),
      lovCode: 'SWBH.TEMPLATE_FIELD',
      type: FieldType.object,
      lovPara: { templateHeaderId: templateId },
      textField: 'fieldName',
      transformResponse: (value, object) => {
        return object?.titleField4
          ? {
              ...object,
              fieldNum: object?.titleField4,
              fieldName: object?.titleFieldName4 ?? object?.titleField4,
            }
          : {};
      },

      transformRequest: (value) => value?.fieldNum,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { templateHeaderId, ...otherData } = data;
      const url = isTenantRoleLevel()
        ? `/swbh/v1/${organizationId}/template-header/detail/${templateId}`
        : `/swbh/v1/template-header/detail/${templateId}`;
      return {
        url,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          templateHeaderId,
        }),
      };
    },
    // update: ({ data }) => {
    //   const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-line` : `/swbh/v1/template-line`;
    //   return {
    //     url,
    //     method: 'POST',
    //     body: data,
    //   };
    // },
  },
  children: {
    templateLineList: layoutDefinitionTableDs,
  },
});

export { listDS, formDs, fieldMapDs, layoutDefinitionDs, titleFromDs };
