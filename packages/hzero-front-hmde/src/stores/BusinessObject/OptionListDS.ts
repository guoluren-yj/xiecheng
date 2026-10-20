/*
 * @Descripttion: 值列表相关DataSet配置
 * @Date: 2021-08-10 16:07:25
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentLanguage, getResponse } from 'utils/utils';
import moment from 'moment';

// TODO: 提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL, uuid } from '@/utils/common';

import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  DataSetSelection,
  DataToJSON,
  FieldIgnore,
  FieldType,
} from 'choerodon-ui/pro/lib/data-set/enum';
import { isBracketsValid } from '@/routes/Modeler/ModelDesigner/utils/utils';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

interface IFormProps {
  domainId: string;
  boId: string;
  businessObjectCode: string;
  optionId?: string;
  domainCode?: any;
  businessObjectTenantId?: any;
  copy?: boolean;
}

const tableDs = (businessObjectCode): any => ({
  autoCreate: false,
  autoQuery: !!businessObjectCode,
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
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options`,
      method: 'DELETE',
      params: { businessObjectOptionId: data[0].businessObjectOptionId },
      data: data[0], // 后端校验
    }),
  },
  fields: [
    {
      label: intl.get('hmde.bo.option.code').d('值列表编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      maxLength: 32,
      readOnly: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.name').d('值列表名称'),
      name: 'businessObjectOptionName',
      type: FieldType.string,
      maxLength: 32,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.displayField').d('显示字段'),
      name: 'displayFieldCode',
      type: FieldType.string,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldCode',
      lookupAxiosConfig: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-options/display-field/list`,
          method: 'GET',
          params: {
            businessObjectCode,
          },
        };
      },
    },
    {
      label: intl.get('hmde.bo.option.type').d('值列表类型'),
      name: 'businessObjectOptionType',
      type: FieldType.string,
      transformResponse: (_, { tenantId }) => {
        return tenantId === 0
          ? intl.get('hmde.bo.option.type.platform').d('平台标准')
          : intl.get('hmde.bo.option.type.tenant').d('自定义');
      },
      ignore: FieldIgnore.always,
    },
    {
      label: intl.get('hmde.common.tenant').d('所属租户'),
      name: 'tenant',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      textField: 'tenantName',
      valueField: 'tenantId',
      ignore: FieldIgnore.always,
    },
    {
      name: 'tenantId',
      type: FieldType.number,
      bind: 'tenant.tenantId',
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      bind: 'tenant.tenantName',
    },
    {
      label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
      name: 'enabledFlag',
      type: FieldType.boolean,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.string,
    },
  ],
  queryFields: [
    {
      label: intl.get('hmde.bo.option.nameOrCode').d('值列表名称/编码'),
      name: 'keyword',
      merge: true,
    },
  ],
});

const formDs = ({
  domainId,
  boId,
  businessObjectCode,
  optionId,
  domainCode,
  businessObjectTenantId,
  copy,
}: IFormProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options/${optionId}`,
      method: 'GET',
      params: {
        ...params,
        businessObjectId: boId,
        businessObjectTenantId,
      },
    }),
    update: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options`,
      method: 'PUT',
      data: {
        ...data[0],
        businessObjectOptionCondList: data[0].businessObjectOptionCondList.filter(
          (item) => item._status !== 'delete'
        ),
        businessObjectId: boId,
        businessObjectCode,
        domainId,
      },
    }),
    submit: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options`,
      method: 'POST',
      data: {
        ...data[0],
        businessObjectOptionCondList: data[0].businessObjectOptionCondList.filter(
          (item) => item._status !== 'delete'
        ),
        businessObjectId: boId,
        businessObjectCode,
        domainId,
        businessObjectOptionCode:
          !optionId || copy
            ? `${domainCode}_${data[0].businessObjectOptionCode}`
            : data[0].businessObjectOptionCode,
      },
    }),
  },
  fields: [
    {
      label: intl.get('hmde.bo.option.name').d('值列表名称'),
      name: 'businessObjectOptionName',
      type: FieldType.intl,
      maxLength: 32,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.option.code').d('值列表编码'),
      name: 'businessObjectOptionCode',
      type: FieldType.string,
      maxLength: 32,
      required: true,
      unique: true,
    },
    {
      label: intl.get('hmde.common.tenant').d('所属租户'),
      name: 'tenant',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      textField: 'tenantName',
      valueField: 'tenantId',
      ignore: FieldIgnore.always,
    },
    {
      name: 'tenantId',
      type: FieldType.number,
      bind: 'tenant.tenantId',
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      bind: 'tenant.tenantName',
    },
    {
      label: intl.get('hmde.bo.option.displayField').d('显示字段'),
      name: 'displayFieldCode',
      type: FieldType.string,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldCode',
      defaultValue: '',
      lookupAxiosConfig: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-options/display-field/list`,
          method: 'GET',
          params: {
            // businessObjectId: boId,
            businessObjectCode,
          },
        };
      },
    },
    {
      label: intl.get('hmde.bo.option.title').d('标题名称'),
      name: 'title',
      type: FieldType.intl,
    },
    {
      label: intl.get('hmde.bo.option.pageSize').d('每页条数'),
      name: 'pageSize',
      type: FieldType.number,
      defaultValue: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.intl,
    },
    {
      label: intl.get('hmde.bo.option.optionFields').d('视图字段'),
      name: 'businessObjectOptionFieldList',
      type: FieldType.auto,
      required: true,
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
      label: intl.get('hzero.common.status.enableFlag').d('是否启用'),
      name: 'enabledFlag',
      type: FieldType.boolean,
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
                (record?.get('optionSettings') === '_valueList' || record?.get('lovCode')) &&
                record.get('valueType') === 'FIXED'
              ) {
                return record?.get('lovCode');
              }
            },
            options: ({ record }) => {
              if (
                record &&
                (record?.get('optionSettings') === '_custom' ||
                  !!record?.get('customOptionList')) &&
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
          name: 'lovCode',
          type: FieldType.string,
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

const treeDs = (businessObjectCode): DataSetProps => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options/drill`,
      method: 'GET',
      params: {
        // businessObjectId: boId,
        businessObjectCode,
      },
      transformResponse: (_res) => {
        const res = JSON.parse(_res);
        if (getResponse(res)) {
          return res.businessObjectFields?.map((item) => ({
            ...item,
            businessObjectCode: item.businessObjectCode,
            businessObjectName: item.businessObjectName,
            // drillFlag: !item.drillFlag,
            drillFlag: true, // 临时调整不钻取
            parentId: undefined,
            id: uuid(),
          }));
        }
      },
    }),
  },
  parentField: 'parentId',
  idField: 'id',
  fields: [
    {
      name: 'businessObjectId',
    },
    {
      name: 'businessObjectFieldId',
    },
    {
      name: 'businessObjectFieldName',
    },
    {
      name: 'drillFlag',
    },
    {
      name: 'componentType',
    },
  ],
});

const optionFieldDs = (): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: DataSetSelection.single,
  fields: [
    {
      label: intl.get('hmde.bo.field.code').d('字段编码'),
      name: 'businessObjectFieldCode',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.field.name').d('字段名称'),
      name: 'businessObjectFieldName',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
      name: 'displayName',
      type: FieldType.string,
      maxLength: 30,
    },
    {
      label: intl.get('hmde.bo.field.componentType').d('字段类型'),
      name: 'componentType',
      type: FieldType.string,
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
    },
    {
      label: intl.get('hmde.bo.option.field.width').d('列宽度'),
      name: 'tableFieldWidth',
      type: FieldType.number,
      defaultValue: 200,
      step: 1,
      min: 1,
    },
    {
      label: intl.get('hmde.bo.option.queryField').d('查询域字段'),
      name: 'queryFieldFlag',
      type: FieldType.boolean,
      defaultValue: false,
    },
    {
      name: 'tableFieldFlag',
      type: FieldType.boolean,
      defaultValue: true,
    },
    {
      name: 'orderSeq',
      type: FieldType.number,
      unique: true,
    },
    {
      name: 'queryOrderSeq',
      type: FieldType.number,
      unique: true,
    },
  ],
});

export { tableDs, formDs, treeDs, optionFieldDs };
