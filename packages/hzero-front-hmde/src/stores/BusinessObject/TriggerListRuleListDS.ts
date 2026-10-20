import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataToJSON, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { isBracketsValid } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

const tenantId = getCurrentOrganizationId();

// interface IFormProps {
//   domainId: string;
//   boId: string;
//   optionId?: string;
//   domainCode?: any;
//   businessObjectTenantId?: any;
//   copy?: boolean;
// }

// 触发器规则列表
const triggerRuleListDs = (businessObjectCode): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options/page`,
      method: 'GET',
      params: {
        ...params,
        businessObjectCode,
      },
    }),
    submit: ({ data }) => ({
      url: ``,
      method: 'POST',
      data: {
        ...data[0],
      },
    }),
    destroy: ({ data }) => ({
      url: ``,
      method: 'DELETE',
      params: {},
      data: data[0], // 后端校验
    }),
  },
  queryFields: [
    {
      label: intl.get('hmde.bo.option.nameOrCode').d('触发规则名称/编码'),
      name: 'nameOrCode',
      type: FieldType.string,
      labelWidth: '120',
    },
  ],
  fields: [
    {
      label: intl.get('hmde.bo.option.code').d('触发规则编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      readOnly: true,
      unique: true,
    },
    {
      name: 'businessObjectOptionName',
      type: FieldType.string,
      label: intl.get('hmde.common.view.message.displayName').d('触发规则名称'),
    },
    {
      label: intl.get('hzero.common.status.enableFlag').d('是否启用'),
      name: 'enabledFlag',
      type: FieldType.boolean,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.option.displayField').d('触发时机'),
      name: 'displayFieldId',
      type: FieldType.string,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldId',
      defaultValue: '',
      lookupAxiosConfig: () => {
        return {
          // url: `${lowcodeOrganizationURL({
          //   route: HZERO_HMDE,
          // })}/business-object-options/display-field/list`,
          // method: 'GET',
          // params: {
          //   // businessObjectId: boId,
          // },
        };
      },
    },
    {
      label: intl.get('hmde.bo.option.conditions').d('触发条件'),
      name: 'businessObjectOptionCondList',
      type: FieldType.auto,
    },
    {
      label: intl.get('hmde.bo.option.logicFormula').d('条件关系'),
      name: 'logicFormula',
      type: FieldType.string,
      format: 'uppercase',
      validator: async (value = '', _, record) => {
        const regNum = new RegExp('[0-9]+', 'g');
        const regBrackets = new RegExp('[()]', 'g');
        const regStr = new RegExp('[A-Z ]+', 'g');
        const regBracketsPro = new RegExp('[{[}]|]', 'g');
        let message: boolean | string = true;

        if (
          (value && !value?.match?.(regNum)) ||
          value
            ?.match?.(regNum)
            ?.some((_key) => Number(_key) > (record as Record)?.get('conditions')?.length)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (
          value?.match(regStr) &&
          !value?.match?.(regStr)?.every((str) => str === ' AND ' || str === ' OR ')
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (regBracketsPro.test(value)) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracketMatch')
            .d('校验不通过，请按照参考示例输写，当前仅支持“()”');
        }
        if (
          value?.match?.(regBrackets) &&
          !isBracketsValid(value?.match?.(regBrackets)?.join() as string)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracket')
            .d('校验不通过，你输入的括号匹配错误！');
        }
        return message;
      },
    },
    {
      label: intl.get('hmde.bo.trigger.afterRule').d('触发规则执行后'),
      name: 'businessObjectOptionType',
      type: FieldType.string,
      labelWidth: '120',
      // lookupCode: 'HIPSWC.CERTIFICATE_REASON',
      // textField: 'text',
      // valueField: 'value',
    },
  ],
  children: {
    businessObjectOptionCondList: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'orderSeq',
          type: FieldType.number,
          transformRequest: (_, record) => record.index + 1,
        },
        {
          name: 'fieldPath',
          type: FieldType.string,
          required: true,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'operatorType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION',
          computedProps: {
            required: ({ record }) => record.get('fieldPath'),
          },
        },
        {
          name: 'valueType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) =>
              record.get('operatorType') &&
              !['IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE'].includes(
                record.get('operatorType')
              ),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'optionSettings',
          type: FieldType.string,
          bind: 'attributeJson.optionSettings',
          ignore: FieldIgnore.always,
        },
        {
          name: 'valueList',
          type: FieldType.string,
          bind: 'attributeJson.valueList',
          ignore: FieldIgnore.always,
        },
        {
          name: 'lovCode',
          type: FieldType.string,
          bind: 'valueList.lovCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'customOptionList',
          type: FieldType.object,
          bind: 'attributeJson.customOptionList',
          ignore: FieldIgnore.always,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'fieldPath') record.set('operatorType', '');
          if (name === 'operatorType') record.set('valueType', '');
          if (name === 'valueType') record.set('value', '');
        },
      },
    }),
  },
});

// 触发器头信息
const triggerRuleDs = (): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  transport: {
    read: ({ params }) => ({
      url: ``,
      method: 'GET',
      params: {
        ...params,
      },
    }),
    update: ({ data }) => ({
      url: ``,
      method: 'PUT',
      data: {
        ...data[0],
      },
    }),
    submit: ({ data }) => ({
      url: ``,
      method: 'POST',
      data: {
        ...data[0],
      },
    }),
  },
  fields: [
    {
      label: intl.get('hmde.bo.option.name').d('触发规则名称'),
      name: 'businessObjectOptionName',
      type: FieldType.intl,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.code').d('触发规则编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.displayField').d('触发时机'),
      name: 'displayFieldId',
      type: FieldType.string,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldId',
      defaultValue: '',
      lookupAxiosConfig: () => {
        return {
          // url: `${lowcodeOrganizationURL({
          //   route: HZERO_HMDE,
          // })}/business-object-options/display-field/list`,
          // method: 'GET',
          // params: {
          //   // businessObjectId: boId,
          // },
        };
      },
    },
    {
      label: intl.get('hzero.common.status.enableFlag').d('是否启用'),
      name: 'enabledFlag',
      type: FieldType.boolean,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.intl,
    },
    {
      label: intl.get('hmde.bo.option.conditions').d('触发条件'),
      name: 'businessObjectOptionCondList',
      type: FieldType.auto,
    },
    {
      label: intl.get('hmde.bo.option.logicFormula').d('条件关系'),
      name: 'logicFormula',
      type: FieldType.string,
      format: 'uppercase',
      validator: async (value = '', _, record) => {
        const regNum = new RegExp('[0-9]+', 'g');
        const regBrackets = new RegExp('[()]', 'g');
        const regStr = new RegExp('[A-Z ]+', 'g');
        const regBracketsPro = new RegExp('[{[}]|]', 'g');
        let message: boolean | string = true;

        if (
          (value && !value?.match?.(regNum)) ||
          value
            ?.match?.(regNum)
            ?.some((_key) => Number(_key) > (record as Record)?.get('conditions')?.length)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (
          value?.match(regStr) &&
          !value?.match?.(regStr)?.every((str) => str === ' AND ' || str === ' OR ')
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (regBracketsPro.test(value)) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracketMatch')
            .d('校验不通过，请按照参考示例输写，当前仅支持“()”');
        }
        if (
          value?.match?.(regBrackets) &&
          !isBracketsValid(value?.match?.(regBrackets)?.join() as string)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracket')
            .d('校验不通过，你输入的括号匹配错误！');
        }
        return message;
      },
    },
    {
      label: intl.get('hmde.bo.trigger.afterRule').d('触发规则执行后'),
      name: 'businessObjectOptionType',
      type: FieldType.string,
      labelWidth: '120',
      // lookupCode: 'HIPSWC.CERTIFICATE_REASON',
      // textField: 'text',
      // valueField: 'value',
    },
  ],
  children: {
    businessObjectOptionCondList: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'orderSeq',
          type: FieldType.number,
          transformRequest: (_, record) => record.index + 1,
        },
        {
          name: 'fieldPath',
          type: FieldType.string,
          required: true,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'operatorType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION',
          computedProps: {
            required: ({ record }) => record.get('fieldPath'),
          },
        },
        {
          name: 'valueType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) =>
              record.get('operatorType') &&
              !['IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE'].includes(
                record.get('operatorType')
              ),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'optionSettings',
          type: FieldType.string,
          bind: 'attributeJson.optionSettings',
          ignore: FieldIgnore.always,
        },
        {
          name: 'valueList',
          type: FieldType.string,
          bind: 'attributeJson.valueList',
          ignore: FieldIgnore.always,
        },
        {
          name: 'lovCode',
          type: FieldType.string,
          bind: 'valueList.lovCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'customOptionList',
          type: FieldType.object,
          bind: 'attributeJson.customOptionList',
          ignore: FieldIgnore.always,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'fieldPath') record.set('operatorType', '');
          if (name === 'operatorType') record.set('valueType', '');
          if (name === 'valueType') record.set('value', '');
        },
      },
    }),
  },
});

// 触发事件列表
const triggerEventDs = (businessObjectCode): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  fields: [
    {
      label: intl.get('hmde.bo.option.code').d('事件编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      readOnly: true,
      unique: true,
    },
    {
      name: 'businessObjectOptionName',
      type: FieldType.string,
      label: intl.get('hmde.common.view.message.displayName').d('事件名称'),
    },
    {
      label: intl.get('hmde.common.label.remark').d('类型'),
      name: 'displayFieldId',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.string,
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options/page`,
      method: 'GET',
      params: {
        ...params,
        businessObjectCode,
      },
    }),
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options`,
      method: 'DELETE',
      params: { businessObjectOptionId: data[0].businessObjectOptionId },
      data: data[0], // 后端校验
    }),
  },
});

// 触发事件详情
const triggerEventInfoDs = (): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  transport: {
    read: ({ params }) => ({
      url: ``,
      method: 'GET',
      params: {
        ...params,
      },
    }),
    update: ({ data }) => ({
      url: ``,
      method: 'PUT',
      data: {
        ...data[0],
      },
    }),
    submit: ({ data }) => ({
      url: ``,
      method: 'POST',
      data: {
        ...data[0],
      },
    }),
  },
  fields: [
    {
      label: intl.get('hmde.bo.option.name').d('事件名称'),
      name: 'businessObjectOptionName',
      type: FieldType.intl,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.code').d('事件编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.trigger.displayField').d('类型'),
      name: 'displayFieldId',
      type: FieldType.string,
      required: true,
      // textField: 'businessObjectFieldName',
      // valueField: 'businessObjectFieldId',
      defaultValue: '',
      // lookupAxiosConfig: () => {
      // return {
      //   url: `${lowcodeOrganizationURL({
      //     route: HZERO_HMDE,
      //   })}/business-object-options/display-field/list`,
      //   method: 'GET',
      //   params: {
      //     businessObjectId: boId,
      //   },
      // };
      // },
    },
    {
      label: intl.get('hmde.bo.trigger.addMethod').d('新增方式'),
      name: 'businessObjectOptionType',
      type: FieldType.string,
      defaultValue: 'relation',
      // lookupCode: 'HIPSWC.CERTIFICATE_REASON',
      // textField: 'text',
      // valueField: 'value',
    },
    {
      label: intl.get('hmde.bo.trigger.modifyMethod').d('修改方式'),
      name: 'modifyMethod',
      type: FieldType.string,
      defaultValue: 'current',
      // lookupCode: 'HIPSWC.CERTIFICATE_REASON',
      // textField: 'text',
      // valueField: 'value',
    },
    {
      label: intl.get('hmde.bo.trigger.associatedField').d('关联字段'),
      name: 'associatedFieldObject',
      type: FieldType.object,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldId',
      ignore: FieldIgnore.always,
      lookupAxiosConfig: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-options/display-field/list`,
          method: 'GET',
          params: {
            // businessObjectId: boId,
          },
        };
      },
    },
    {
      name: 'associatedField',
      type: FieldType.string,
      label: '关联字段',
      bind: 'associatedFieldObject.businessObjectFieldId',
    },
    {
      name: 'associatedBusinessObject',
      type: FieldType.string,
      label: '业务对象',
      bind: 'associatedFieldObject.businessObjectName',
    },
    {
      name: 'businessObject',
      type: FieldType.object,
      label: '业务对象',
      required: true,
      lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
      lovPara: {},
      ignore: FieldIgnore.always,
    },
    {
      name: 'businessObjectCode',
      type: FieldType.string,
      label: '业务对象code',
      bind: 'businessObject.businessObjectCode',
    },
    {
      name: 'businessObjectName',
      type: FieldType.string,
      label: '业务对象name',
      bind: 'businessObject.businessObjectName',
    },
    {
      name: 'businessObjectId',
      type: FieldType.string,
      label: '业务对象id',
      bind: 'businessObject.businessObjectId',
    },
    {
      name: 'relationBusinessObject',
      type: FieldType.object,
      label: '关联业务对象',
      required: true,
      lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
      lovPara: {},
      ignore: FieldIgnore.always,
    },
    {
      name: 'relationBusinessObjectCode',
      type: FieldType.string,
      label: '关联业务对象code',
      bind: 'businessObject.businessObjectCode',
    },
    {
      name: 'relationBusinessObjectName',
      type: FieldType.string,
      label: '关联业务对象name',
      bind: 'businessObject.businessObjectName',
    },
    {
      name: 'relationBusinessObjectId',
      type: FieldType.string,
      label: '关联业务对象id',
      bind: 'businessObject.businessObjectId',
    },
    {
      name: 'executeParameters',
      label: '字段赋值',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
    {
      label: intl.get('hmde.bo.option.conditions').d('过滤条件'),
      name: 'businessObjectOptionCondList',
      type: FieldType.auto,
    },
    {
      label: intl.get('hmde.bo.option.logicFormula').d('条件关系'),
      name: 'logicFormula',
      type: FieldType.string,
      format: 'uppercase',
      validator: async (value = '', _, record) => {
        const regNum = new RegExp('[0-9]+', 'g');
        const regBrackets = new RegExp('[()]', 'g');
        const regStr = new RegExp('[A-Z ]+', 'g');
        const regBracketsPro = new RegExp('[{[}]|]', 'g');
        let message: boolean | string = true;

        if (
          (value && !value?.match?.(regNum)) ||
          value
            ?.match?.(regNum)
            ?.some((_key) => Number(_key) > (record as Record)?.get('conditions')?.length)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (
          value?.match(regStr) &&
          !value?.match?.(regStr)?.every((str) => str === ' AND ' || str === ' OR ')
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.example')
            .d('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (regBracketsPro.test(value)) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracketMatch')
            .d('校验不通过，请按照参考示例输写，当前仅支持“()”');
        }
        if (
          value?.match?.(regBrackets) &&
          !isBracketsValid(value?.match?.(regBrackets)?.join() as string)
        ) {
          message = intl
            .get('hmde.bo.option.validation.logicFormula.bracket')
            .d('校验不通过，你输入的括号匹配错误！');
        }
        return message;
      },
    },
    {
      name: 'message',
      type: FieldType.object,
      label: '消息配置',
      lovCode: 'HMDE.MSG_SENG_CONFIG',
      lovPara: {
        tenantId,
      },
      required: true,
      ignore: FieldIgnore.always,
    },
    {
      name: 'messageCode',
      type: FieldType.string,
      label: '消息通知',
      bind: 'message.code',
    },
    {
      name: 'templateParams',
      label: '模板参数配置',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
    {
      name: 'receiver',
      type: FieldType.object,
      label: '接收人',
      lovCode: 'HMDE.MSG_RECEIVER_GROUP',
      ignore: FieldIgnore.always,
      multiple: true,
    },
    {
      name: 'receiverCode',
      type: FieldType.string,
      bind: 'receiver.code',
    },
    {
      name: 'script',
      type: FieldType.object,
      label: '脚本',
      textField: 'scriptName',
      valueField: 'scriptCode',
      lookupCode: 'HMDE.SCRIPT',
      ignore: FieldIgnore.always,
    },
    {
      name: 'scriptCode',
      type: FieldType.string,
      label: '消息通知',
      bind: 'script.scriptCode',
    },
    {
      name: 'setParams',
      label: '设置参数',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  children: {
    executeParameters: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'orderSeq',
          type: FieldType.number,
          transformRequest: (_, record) => record.index + 1,
        },
        {
          name: 'fieldCode',
          type: FieldType.string,
          required: true,
        },
        {
          name: 'businessObjectFieldCode',
          type: FieldType.string,
        },
        {
          name: 'businessObjectFieldName',
          type: FieldType.string,
        },
        {
          name: 'requiredFlag',
          type: FieldType.boolean,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'valueType', // 值来源
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          // lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) => record.get('requiredFlag'),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'fieldPath') record.set('operatorType', '');
          if (name === 'valueType') record.set('value', '');
        },
      },
    }),
    businessObjectOptionCondList: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'orderSeq',
          type: FieldType.number,
          transformRequest: (_, record) => record.index + 1,
        },
        {
          name: 'fieldPath',
          type: FieldType.string,
          required: true,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'operatorType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION',
          computedProps: {
            required: ({ record }) => record.get('fieldPath'),
          },
        },
        {
          name: 'valueType',
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) =>
              record.get('operatorType') &&
              !['IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE'].includes(
                record.get('operatorType')
              ),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'optionSettings',
          type: FieldType.string,
          bind: 'attributeJson.optionSettings',
          ignore: FieldIgnore.always,
        },
        {
          name: 'valueList',
          type: FieldType.string,
          bind: 'attributeJson.valueList',
          ignore: FieldIgnore.always,
        },
        {
          name: 'lovCode',
          type: FieldType.string,
          bind: 'valueList.lovCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'customOptionList',
          type: FieldType.object,
          bind: 'attributeJson.customOptionList',
          ignore: FieldIgnore.always,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'fieldPath') record.set('operatorType', '');
          if (name === 'operatorType') record.set('valueType', '');
          if (name === 'valueType') record.set('value', '');
        },
      },
    }),
    templateParams: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'templateName',
          type: FieldType.string,
        },
        {
          name: 'templateArgs',
          type: FieldType.object,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'valueType', // 值来源
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          // lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) => record.get('requiredFlag'),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
      ],
    }),
    setParams: new DataSet({
      autoCreate: false,
      autoQuery: false,
      dataToJSON: DataToJSON.normal,
      fields: [
        {
          name: 'code',
          type: FieldType.string,
        },
        {
          name: 'type',
          type: FieldType.string,
        },
        {
          name: 'componentType',
          type: FieldType.string,
          transformResponse: (value, object) => {
            if (value === 'FORMULA') {
              const resultTypes = new Map([
                ['Long', 'NUMBER_FIELD'],
                ['BigDecimal', 'FLOAT'],
                ['String', 'TEXT_FIELD'],
                ['LocalDate', 'DATE_SELECTION_BOX'],
                ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                ['Boolean', 'SWITCH'],
              ]);
              return resultTypes.get(object?.attributeJson?.resultType);
            } else {
              return value;
            }
          },
        },
        {
          name: 'valueType', // 值来源
          type: FieldType.string,
          textField: 'meaning',
          valueField: 'value',
          // lookupCode: 'HMDE.FILTER_CONDITION_VALUE_TYPE',
          computedProps: {
            required: ({ record }) => record.get('requiredFlag'),
          },
        },
        {
          name: 'value',
          type: FieldType.auto,
          computedProps: {
            required: ({ record }) => record.get('valueType'),
            lookupCode: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_valueList' &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                record?.get('optionSettings') === '_custom' &&
                record.get('valueType') === 'FIXED'
              ) {
                return new DataSet({
                  data: (record?.get('customOptionList') || [])?.map((item) => ({
                    meaning: item?.meaning?.[getCurrentLanguage()],
                    value: item?.value,
                    order: item?.order,
                  })),
                });
              }
            },
            format: ({ record }) => {
              const componentType = record.get('componentType');
              const valueType = record.get('valueType');
              if (valueType === 'FIXED') {
                if (componentType === 'DATE_SELECTION_BOX') {
                  return 'YYYY-MM-DD';
                } else if (componentType === 'DATETIME_SELECTION_BOX') {
                  return 'YYYY-MM-DD HH:mm:ss';
                }
              }
            },
          },
          transformRequest: (value, record) => {
            if (Array.isArray(value)) {
              return value
                .map((item) => {
                  if (moment.isMoment(item)) {
                    const componentType = record?.get('componentType');
                    return item.format(
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    );
                  } else {
                    return item;
                  }
                })
                .join(',');
            }
            if (moment.isMoment(value)) {
              const componentType = record?.get('componentType');
              return value.format(
                componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
              );
            }
            return value;
          },
          transformResponse: (value, object) => {
            const { componentType, valueType, operatorType } = object || {};
            if (
              ['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                return value
                  ?.split(',')
                  ?.map((item) =>
                    moment(
                      item,
                      componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                    )
                  );
              } else {
                return moment(
                  value,
                  componentType === 'DATE_SELECTION_BOX' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                );
              }
            } else if (
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType) &&
              valueType === 'FIXED'
            ) {
              if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                return value?.split(',');
              }
            }
            return value;
          },
        },
        {
          name: 'attributeJson',
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
      ],
    }),
  },
});

export { triggerRuleListDs, triggerRuleDs, triggerEventDs, triggerEventInfoDs };
