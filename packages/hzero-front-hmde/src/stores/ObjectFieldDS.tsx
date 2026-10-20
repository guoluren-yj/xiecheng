import React from 'react';
import { get, isEmpty } from 'lodash';
import intl from 'hzero-front/lib/utils/intl';
import {
  DataSet,
  TextField,
  NumberField,
  Select,
  SelectBox,
  Tooltip,
  Output,
  Lov,
  IntlField,
  Icon,
  CheckBox,
} from 'choerodon-ui/pro';
import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
// import DrillComponent from '@/components/DrillComponent';
import DrillComponent from '@/businessComponents/DrillComponent';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import MultiIntlField from '@/businessComponents/MultiIntlField';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import ImgIcon from '@/utils/ImgIcon';
import styles from '@/routes/BusinessObject/Detail/FieldsList/FieldComponents/CommonField/index.less';

const { language } = window.dvaApp._store.getState().global || {};
const isTenant = isTenantRoleLevel();
const _validator = (value, customPrimaryKeyCode, isExtensionField) => {
  // const pattern = /^[_a-z][0-9a-zA-Z]{0,}([0-9a-zA-Z]{0,}|[_]{0,})$/;
  const pattern = /^[a-z][0-9a-zA-Z]{0,}$/;
  if (!pattern.test(value)) {
    return intl.get('hmde.bo.field.code.patternValidation').d(
      // '支持小写字母或“_”开头，字母/数字或“_”结尾，编码中间支持使用大写字母/小写字母且不支持使用“_”'
      '支持小写字母开头，中间支持大写字母、小写字母、数字; 推荐使用小驼峰'
    );
  } else if (!isExtensionField && customPrimaryKeyCode && value === customPrimaryKeyCode) {
    return intl
      .get('hmde.bo.field.code..notSamePrimaryKey')
      .d('字段编码和业务对象的基础信息的“自定义主键编码”不能相同');
  } else if (!isExtensionField && !customPrimaryKeyCode && value.toLowerCase() === 'id') {
    return intl.get('hmde.bo.field.code.patternValidation.noValidFieldCode').d('字段编码不能等于"id"');
  }
};
const tenantId = getCurrentOrganizationId();
const MeaningConfig = {
  yes: { zh_CN: '是', en_US: 'Yes' },
  no: { zh_CN: '否', en_US: 'No' },
};
const [
  CONSTANT, // 前置条件类型标识
  FIELD, // 关联字段类型标识
] = ['CONSTANT', 'FIELD'];

export default ({
  businessObjectId,
  isEditMode,
  isExtensionField,
  businessObjectCode,
  isFromDomain,
  customPrimaryKeyCode,
  componentType,
  // standardFlag
}) => {
  let codeDisabled = false;
  return {
    autoCreate: true,
    paging: false,
    transport: {
      tls: isTenant
        ? ({ dataSet, name }) => {
          return {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HMDE,
            })}/business-object-fields/multi-language`,
            params: {
              ...dataSet?.getState('tlsParams'),
              fieldName: name,
            },
          };
        }
        : undefined,
    },
    fields: [
      {
        name: 'attributeJson',
        type: 'object',
      },
      {
        name: 'businessObjectFieldName',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        type: 'intl',
        required: true,
        maxLength: 300,
        unique: true,
        Render: props => {
          return (
            <IntlField
              key="businessObjectFieldName"
              disabled={props?.disabled}
              name="businessObjectFieldName"
              suffix={<Icon type="language" />}
            />
          );
        },
      },
      {
        name: 'inheritFieldName',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        type: 'intl',
        required: true,
        maxLength: 300,
        unique: true,
        Render: props => {
          return (
            <IntlField
              key="inheritFieldName"
              disabled={props?.disabled}
              name="inheritFieldName"
              suffix={<Icon type="language" />}
            />
          );
        },
      },
      // 领域新增的模板字段 名称编码 start
      {
        name: 'templateFieldName',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        type: 'intl',
        required: true,
        maxLength: 30,
        unique: true,
        Render: props => {
          return (
            <IntlField
              key="templateFieldName"
              disabled={props?.disabled}
              name="templateFieldName"
              suffix={<Icon type="language" />}
            />
          );
        },
      },
      {
        name: 'templateFieldCode',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        type: 'string',
        required: true,
        unique: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
        Render: props => {
          return (
            <TextField
              key="templateFieldCode"
              name="templateFieldCode"
              disabled={
                codeDisabled || props?.disabled || (isTenant && !isExtensionField && isEditMode)
              }
            />
          );
        },
      },
      // end
      {
        name: 'businessObjectFieldCode',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        type: 'string',
        required: true,
        unique: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
        Render: props => {
          return (
            <TextField
              key="businessObjectFieldCode"
              name="businessObjectFieldCode"
              disabled={
                codeDisabled || props?.disabled || (isTenant && !isExtensionField && isEditMode)
              }
            />
          );
        },
      },
      {
        name: 'businessObjectField',
        label: intl.get('hmde.bo.field.extendField.select').d('选择扩展字段'),
        type: 'object',
        required: true,
        unique: true,
        ignore: 'always',
        lovCode: 'HMDE.EXTEND_FIELD',
        lovQueryAxiosConfig: {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-extend-field/extend-fields/list`,
          method: 'GET',
        },
        Render: props => <Lov disabled={props?.disabled} name="businessObjectField" />,
      },
      {
        name: 'extendFieldId',
        type: 'string',
        ignore: 'never',
        bind: 'businessObjectField.extendFieldId',
      },
      // 租户继承扩展字段的 code
      {
        name: 'inheritFieldCode',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        type: 'string',
        required: true,
        unique: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
        Render: props => {
          return (
            <TextField
              key="inheritFieldCode"
              name="inheritFieldCode"
              disabled={
                codeDisabled || props?.disabled || (isTenant && !isExtensionField && isEditMode)
              }
            />
          );
        },
      },
      // 平台新增扩展字段的 code
      {
        name: 'extendFieldCode',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        type: 'string',
        required: true,
        unique: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
        Render: props => {
          return (
            <TextField
              key="extendFieldCode"
              name="extendFieldCode"
              disabled={codeDisabled || props?.disabled}
            />
          );
        },
      },
      {
        name: 'helpText',
        type: 'object',
        textField: language,
        bind: 'attributeJson.helpText',
        ignore: 'always',
        label: (
          <span>
            {intl.get('hmde.bo.field.help').d('帮助文本')}
            <Tooltip
              placement="top"
              title={intl
                .get('hmde.bo.field.help.help')
                .d('当用户悬停在此字段旁的问号图标时，会在表单字段下方显示该提示文本内容')}
            >
              <Icon type="help_outline" style={{ fontSize: 16 }} />
            </Tooltip>
          </span>
        ),
        required: false,
        Render: ({ currentHelpText, disabled, preDisabled }) => {
          return (
            <MultiIntlField
              name="helpText"
              // record={record}
              init={currentHelpText}
              textFieldStyle={{ height: '85px' }}
              disabled={
                // record?.getField('helpText')?.disabled ||
                disabled ||
                preDisabled ||
                (isTenant && !isExtensionField)
              }
            />
            // <Output
            //   name="helpText"
            //   key="helpText"
            //   newLine
            //   renderer={({ record }) => {
            //     console.log(
            //       record?.getField('helpText')?.disabled,
            //       disabled,
            //       preDisabled,
            //       (isTenant && !isExtensionField)
            //     )
            //     return (
            //       <MultiIntlField
            //         name="helpText"
            //         record={record}
            //         init={currentHelpText}
            //         textFieldStyle={{ height: '85px' }}
            //         disabled={
            //           record?.getField('helpText')?.disabled ||
            //           disabled ||
            //           preDisabled ||
            //           (isTenant && !isExtensionField)
            //         }
            //       />
            //     );
            //   }}
            // />
          );
        },
      },
      {
        name: 'remark',
        label: intl.get('hmde.common.label.remark').d('描述'),
        type: 'intl',
        required: false,
        Render: props => {
          return (
            <IntlField
              key="remark"
              name="remark"
              disabled={props?.disabled || (isTenant && isEditMode && !isExtensionField)}
              style={{ height: '85px' }}
              suffix={<Icon type="language" />}
            />
          );
        },
      },
      {
        name: 'maxLength',
        label: intl.get('hmde.bo.field.maxLength').d('最大长度'),
        type: 'number',
        required: true,
        Render: props => {
          return (
            <NumberField disabled={props?.disabled} key="maxLength" name="maxLength" step={1} />
          );
        },
      },
      {
        name: 'maxValue',
        label: intl.get('hzero.common.title.individuation.formInputPropsMax').d('最大值'),
        type: 'number',
        required: false,
        Render: props => {
          return <NumberField disabled={props?.disabled} key="maxValue" name="maxValue" step={1} />;
        },
      },
      {
        name: 'minValue',
        label: intl.get('hzero.common.title.individuation.formInputPropsMin').d('最小值'),
        type: 'number',
        required: false,
        Render: props => {
          return <NumberField disabled={props?.disabled} key="minValue" name="minValue" step={1} />;
        },
      },
      {
        name: 'digitalAccuracy',
        label: intl.get('hmde.bo.field.digitalAccuracy').d('小数位数'),
        type: 'number',
        required: true,
        defaultValue: 2,
        Render: props => {
          return (
            <NumberField
              disabled={props?.disabled}
              key="digitalAccuracy"
              name="digitalAccuracy"
              step={1}
            />
          );
        },
      },
      {
        name: 'displayFormat',
        type: 'string',
        label: intl.get('hmde.bo.field.displayFormat').d('显示格式'),
        bind: 'attributeJson.displayFormat',
        ignore: 'always',
        required: true,
        textField: 'text',
        valueField: 'value',
        // defaultValue: 'YYYY-MM-DD',
        transformResponse: value => {
          if (value === undefined || value === null) {
            return 'YYYY-MM-DD';
          } else {
            return value;
          }
        },
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl.get('hmde.common.format.yyyy-mm-dd').d('年-月-日（YYYY-MM-DD）'),
                value: 'YYYY-MM-DD',
              },
              {
                text: intl.get('hmde.common.format.mmdd').d('月-日（MM-DD）'),
                value: 'MM-DD',
              },
              {
                text: intl.get('hmde.common.format.dd').d('日（DD）'),
                value: 'DD',
              },
            ],
          });
        })(),
        Render: () => {
          // return <Select disabled={props?.disabled} key="displayFormat" name="displayFormat" />;
        },
      },
      {
        name: 'fixDateTime',
        label: intl.get('hmde.bo.field.defaultValue').d('默认值'),
        type: 'string',
        required: false,
        textField: 'text',
        valueField: 'value',
        defaultValue: 'none',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl.get('hmde.bo.field.defaultValue.none').d('无'),
                value: 'none',
              },
              {
                text: intl.get('hmde.bo.field.defaultValue.currentDate').d('系统当前日期'),
                value: 'CURRENT_TIMESTAMP',
              },
              {
                text: intl.get('hmde.bo.field.defaultValue.fix').d('固定值'),
                value: 'fix',
              },
              {
                text: intl.get('hmde.bo.field.defaultValue.express').d('表达式'),
                value: 'EXPRESSION',
              },
            ],
          });
        })(),
        Render: props => {
          return (
            <SelectBox
              colSpan={2}
              disabled={props?.disabled}
              key="fixDateTime"
              name="fixDateTime"
              optionsFilter={record => {
                if (isFromDomain && record?.get('value') === 'EXPRESSION') {
                  return false;
                }
                return true;
              }}
            />
          );
        },
      },
      {
        name: 'format',
        type: 'string',
        required: false,
        lookupCode: 'HMDE.DATA_FOMRAT',
      },
      {
        name: 'timeZoneConvertFlag',
        label: intl.get('hmde.bo.view.message.timeZoneConvertFlag').d('是否时区转换'),
        type: 'boolean',
        defaultValue: true,
        transformRequest: (value) => !!value,
        Render: props => {
          return (
            <CheckBox disabled={props?.disabled || (isTenant && !props?.isExtensionField)} key="maxLength" name="timeZoneConvertFlag" />
          );
        },
      },
      {
        name: 'meaningConfig',
        label: intl.get('hmde.bo.field.meaningConfig').d('含义配置'),
        defaultValue: !isEditMode ? 'valueList' : 'selfConfig',
        type: 'string',
        required: true,
        textField: 'text',
        valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              isEditMode && {
                text: intl.get('hmde.bo.field.defaultValue.selfConfig').d('自定义'),
                value: 'selfConfig',
              },
              {
                text: intl.get('hmde.bo.field.defaultValue.valueList').d('值集'),
                value: 'valueList',
              },
            ].filter(Boolean) as any[],
          });
        })(),
        Render: props => {
          return (
            <SelectBox
              disabled={props?.disabled}
              key="meaningConfig"
              name="meaningConfig"
              optionsFilter={(record) => {
                // 编辑时，若原配置为值集，则不显示自定义
                if (isEditMode && record.get('value') === 'selfConfig' && props.record && props.record.getPristineValue('meaningConfig') === 'valueList') {
                  return false;
                }
                return true;
              }}
            />
          );
        },
      },
      {
        name: 'valueList',
        type: 'object',
        label: intl.get('hmde.bo.field.valueList').d('值集'),
        ignore: 'always',
        lovCode: isTenant ? 'HPFM.LOV_IDP' : 'HPFM.SITE.LOV_IDP',
        valueField: 'lovCode',
        textField: 'lovName',
        dynamicProps: {
          required: ({ record }) => record.get('meaningConfig') === 'valueList',
        },
        lovQueryAxiosConfig: function lovQueryAxiosConfig(_, __, { params }) {
          return {
            url: `${lowcodeOrganizationURL({ route: HZERO_HPFM })}/lov-headers`,
            method: 'GET',
            params: {
              ...params,
              enabledFlag: 1,
              tenantId: getCurrentOrganizationId(),
            },
          };
        },
      },
      {
        name: 'lovCode',
        type: 'string',
        bind: 'valueList.lovCode',
      },
      {
        name: 'defaultValueType',
        label: intl.get('hmde.bo.field.defaultValueType').d('默认值类型'),
        type: 'string',
        required: false,
        defaultValue: 'none',
        lookupCode: 'HMDE.BO_FIELD.DEFAULT_VALUE_TYPE',
        Render: props => {
          return (
            <SelectBox
              disabled={props?.disabled}
              key="defaultValueType"
              name="defaultValueType"
              optionsFilter={record => {
                if (isFromDomain && record?.get('value') === 'EXPRESSION') {
                  return false;
                }
                return true;
              }}
            />
          );
        },
      },
      {
        name: 'trueMeaning',
        label: '',
        type: 'object',
        defaultValue: MeaningConfig.yes,
        dynamicProps: {
          required: ({ record }) => record.get('meaningConfig') === 'selfConfig',
        },
      },
      {
        name: 'falseMeaning',
        label: '',
        type: 'object',
        defaultValue: MeaningConfig.no,
        dynamicProps: {
          required: ({ record }) => record.get('meaningConfig') === 'selfConfig',
        },
      },
      {
        name: 'defaultValue',
        label: intl.get('hmde.bo.field.defaultValue').d('默认值'),
        type: 'string',
        dynamicProps: {
          required: ({ record }) => {
            const val = record.get('defaultValueType');
            return val === 'NORMAL';
          },
        },
        Render: props => {
          return <TextField disabled={props?.disabled} key="defaultValue" name="defaultValue" />;
        },
      },
      {
        name: 'thousandsFlag',
        // label: intl.get('hmde.bo.field.title.thousands').d('千分位'),
        type: 'boolean',
        // bind: 'attributeJson.thousandsFlag',
        // ignore: 'always',
        // required: false,
        // defaultValue: true,
        transformResponse: () => {
          // if (value === undefined || value === null) {
          //   return true;
          // } else {
          //   return value;
          // }
          return true;
        },
        // Render: (props) => {
        //   return <Switch disabled={props?.disabled} key="thousandsFlag" name="thousandsFlag" />;
        // },
      },
      {
        name: 'areaCode',
        label: intl.get('hmde.bo.field.areaCode').d('国际区号'),
        bind: 'attributeJson.areaCode',
        ignore: 'always',
        type: 'boolean',
        required: false,
        Render: props => {
          return <CheckBox disabled={props?.disabled} key="areaCode" name="areaCode" />;
        },
      },
      {
        name: 'masterBusinessObject',
        label: intl.get('hmde.bo.field.masterObject').d('关联对象'),
        required: true,
        type: 'object',
        ignore: 'always',
        textField: 'businessObjectName',
        lovCode: isTenant ? 'HMDE.BUSINESS_OBJECT' : 'HMDE.BUSINESS_OBJECT.SITE',
        lovPara: isFromDomain ? { sourceType: 'PREDEFINE' } : {},
        Render: ({ disabled }) => {
          return <Lov disabled={disabled} key="masterBusinessObject" name="masterBusinessObject" />;
        },
      },
      {
        name: 'masterBusinessObjectId',
        type: 'string',
        bind: 'masterBusinessObject.businessObjectId',
      },
      {
        name: 'masterBusinessObjectCode',
        type: 'string',
        bind: 'masterBusinessObject.businessObjectCode',
        ignore: 'always',
      },
      {
        name: 'refBusinessObjectName',
        type: 'string',
        bind: 'masterBusinessObject.businessObjectName',
      },
      {
        name: 'refBusinessObject',
        label: intl.get('hmde.bo.field.refObject.select').d('选择关联关系'),
        required: true,
        type: 'object',
        ignore: 'always',
        textField: 'refBusinessObjectFieldName',
        valueField: 'refBusinessObjectFieldId',
        // lovPara: { businessObjectId },
        options: new DataSet({
          paging: false,
          // data: groupData,
          // queryUrl: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/reference-field/list?businessObjectId=${businessObjectId}`,
          transport: {
            read: {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/business-object-fields/reference-field/list?businessObjectId=${businessObjectId}&tenantId=${tenantId}`,
              method: 'get',
              transformResponse: data => {
                if (!data) return null;
                try {
                  const originData = JSON.parse(data);
                  return originData;
                } catch (e) {
                  return null;
                }
              },
            },
          },
          autoQuery: businessObjectId !== undefined || false,
          fields: [
            {
              name: 'refTypeMeaning',
              type: 'string',
              group: true,
            },
          ],
        } as DataSetProps),
        // lookupCode: isTenant ? 'HMDE.REFERENCE_FIELD' : 'HMDE.REFERENCE_FIELD.SITE',
        // lookupAxiosConfig: {
        //   url: `${lowcodeOrganizationURL({
        //     route: HZERO_HMDE,
        //   })}/business-object-fields/reference-field/list`,
        //   method: 'GET',
        // },
        Render: ({ disabled }) => {
          return (
            <Select
              key="refBusinessObject"
              disabled={disabled}
              name="refBusinessObject"
              noCache
              searchMatcher={({ record, text, textField }) => {
                if (typeof text === 'string') {
                  return (
                    record
                      .get(textField)
                      .toLocaleLowerCase()
                      .indexOf(text?.toLocaleLowerCase()) !== -1
                  );
                }
                return false;
              }}
              searchable
            />
          );
        },
      },
      {
        name: 'refBusinessObjectCode',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectCode',
      },
      {
        name: 'refBusinessObjectFieldCode',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectFieldCode',
      },
      {
        name: 'refBusinessObjectFieldId',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectFieldId',
      },
      {
        name: 'refBusinessObjectId',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectId',
      },
      {
        name: 'refBusinessObjectFieldName',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectFieldName',
      },
      {
        name: 'refBusinessObjectAssociateCode',
        type: 'string',
        bind: 'refBusinessObject.refBusinessObjectAssociateCode',
      },
      {
        name: 'refType',
        type: 'string',
        bind: 'refBusinessObject.refType',
      },
      {
        name: 'businessObjectId',
        type: 'string',
      },
      {
        name: 'formula',
        label: intl.get('hmde.bo.field.refField').d('引用字段'),
        required: true,
        type: 'string',
        Render: ({ currentFormula, disabled, refState }) => {
          return (
            <Output
              name="formula"
              key="formula"
              style={{ border: 'none' }}
              renderer={({ record }) => {
                const handleOk = value => {
                  const str = ((value && value.match(/CASCADE\(.*?\)/g) || [])[0] || "").replace(/CASCADE\(|\)$/g, "");
                  // eslint-disable-next-line no-unused-expressions
                  record?.set('formula', value?.value);
                  const refBusinessObject = record?.get('refBusinessObject');
                  const businessObjectAssociateFieldList =
                    refBusinessObject?.businessObjectAssociateFieldList ||
                    record?.get('businessObjectAssociateFieldList'); // 二次编辑时未点击选择关联关系 时从详情中取上次保存的关系字段列表
                  const refType = refBusinessObject.refType || record?.get('refType'); // 选择关联关系时会带出引用字段类型 // 二次编辑时未点击选择关联关系 时从详情中取上次保存的引用字段类型
                  if (refType === 'ASSOCIATE') {
                    let associationStr = '';
                    let masterBusinessObjectFieldCode = '';
                    let associateValue = '';
                    // 如果是高级关系字段
                    const preCondition = businessObjectAssociateFieldList.find(
                      advanceField => advanceField?.associateFieldType === CONSTANT
                    );
                    masterBusinessObjectFieldCode = preCondition?.masterBusinessObjectFieldCode;
                    associateValue = preCondition?.associateValue;
                    let associationRelationCodeList = businessObjectAssociateFieldList
                      .filter(advanceField => advanceField?.associateFieldType === FIELD)
                      .map(associateField => associateField?.masterBusinessObjectFieldCode); // 关联关系标识
                    associationRelationCodeList = associationRelationCodeList.join('|');
                    if (!isEmpty(associationRelationCodeList)) {
                      associationStr = masterBusinessObjectFieldCode
                        ? `|${masterBusinessObjectFieldCode}=${associateValue}|${associationRelationCodeList}`
                        : `|${associationRelationCodeList}`;
                    } else if (masterBusinessObjectFieldCode) {
                      associationStr = `|${masterBusinessObjectFieldCode}=${associateValue}`;
                    }
                    // eslint-disable-next-line no-unused-expressions
                    record?.set(
                      'newFormula',
                      `CASCADE(${businessObjectCode}.${associationStr},${str})`
                    );
                  } else {
                    // 如果是普通关联字段字段
                    // eslint-disable-next-line no-unused-expressions
                    record?.set(
                      'newFormula',
                      `CASCADE(${businessObjectCode}.${record?.get('refBusinessObject')
                        ?.refBusinessObjectFieldCode ||
                      record.get('refBusinessObjectFieldCode')},${str})`
                    );
                  }
                };
                const handleClear = () => record?.set('formula', null);
                return (
                  <div>
                    <DrillComponent
                      businessObjectCode={record?.get('refBusinessObjectCode')}
                      onOk={handleOk}
                      readOnly={disabled}
                      onClear={handleClear}
                      name="formula"
                      initValue={currentFormula}
                      drillDownFlag
                    />
                    {!refState && (
                      <div className={styles['tip-contain-warn']}>
                        <div>
                          <ImgIcon name="publish_fail_icon.svg" size={14} />
                          <span>
                            {intl.get('hmde.refErrorMessage').d('引用了不存在的字段，请重新选择')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          );
        },
      },
      {
        name: 'aggregateObject',
        label: intl.get('hmde.aggregateObject').d('汇总对象'),
        type: 'string',
        required: true,
        textField: 'id',
        valueField: 'name',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
          });
        })(),
        Render: props => {
          return <Select disabled={props?.disabled} key="aggregateObject" name="aggregateObject" />;
        },
      },
      {
        name: 'aggregateFiled',
        label: intl.get('hmde.bo.field.aggregateFiled').d('汇总字段'),
        type: 'string',
        required: true,
        textField: 'text',
        valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl.get('hmde.bo.field.componentType.float').d('浮点'),
                value: 'float',
              },
              {
                text: intl.get('hmde.bo.field.componentType.int').d('整数'),
                value: 'int',
              },
              {
                text: intl.get('hmde.bo.field.componentType.money').d('金额'),
                value: 'money',
              },
            ],
          });
        })(),
        Render: props => {
          return <Select disabled={props?.disabled} key="aggregateFiled" name="aggregateFiled" />;
        },
      },
      {
        name: 'aggregateType',
        label: intl.get('hmde.bo.field.aggregateType').d('汇总类型'),
        type: 'string',
        required: false,
        textField: 'text',
        valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl
                  .get('hmde.bo.field.aggregateType.max')
                  .d('MAX：计算某数值型字段的最大值'),
                value: 'MAX',
              },
              {
                text: intl
                  .get('hmde.bo.field.aggregateType.min')
                  .d('MIN：计算某数值型字段的最大值'),
                value: 'MIN',
              },
              {
                text: intl
                  .get('hmde.bo.field.aggregateType.sum')
                  .d('SUM：计算某数值型字段的汇总值'),
                value: 'SUM',
              },
              {
                text: intl
                  .get('hmde.bo.field.aggregateType.count')
                  .d('COUNT：计算子对象的记录总数'),
                value: 'COUNT',
              },
              {
                text: intl
                  .get('hmde.bo.field.aggregateType.avg')
                  .d('AVG：计算某数值型字段的平均值'),
                value: 'AVG',
              },
            ],
          });
        })(),
        Render: props => {
          return <SelectBox disabled={props?.disabled} key="aggregateType" name="aggregateType" />;
        },
      },
      {
        name: 'precision',
        label: intl.get('hmde.bo.field.precision').d('精度'),
        type: 'string',
        required: true,
        Render: props => {
          return (
            <NumberField disabled={props?.disabled} key="precision" name="precision" step={1} />
          );
        },
      },
      {
        name: 'fileTypes',
        type: 'string',
        label: intl.get('hmde.bo.field.fileType').d('支持文件类型'),
        bind: 'attributeJson.fileTypes',
        ignore: 'always',
        required: false,
        lookupCode: 'HFLE.CONTENT_TYPE',
        multiple: true,
        Render: props => {
          return <Select disabled={props?.disabled} key="fileTypes" name="fileTypes" multiple />;
        },
      },
      {
        name: 'fileFormats',
        bind: 'attributeJson.fileFormats',
        label: intl.get('hmde.bo.field.fileExt').d('文件格式'),
        required: false,
        multiple: true,
        lookupCode: 'HMDE.FILE_FORMAT',
        Render: props => {
          const optionsFilter = (record) => {
            const fileTypes = props?.record?.get('fileTypes');
            if (fileTypes && fileTypes.length) {
              return fileTypes.includes(record.get('parentValue'));
            }
            return false;
          };
          return (
            <Select
              disabled={props?.disabled}
              key="fileFormats"
              name="fileFormats"
              multiple
              maxTagCount={100}
              searchable
              optionsFilter={optionsFilter}
            />
          );
        },
      },
      {
        name: 'multipleFlag',
        type: 'boolean',
        bind: 'attributeJson.multipleFlag',
        ignore: 'always',
        label: intl.get('hmde.bo.field.multiple').d('是否支持多选'),
        required: true,
        textField: 'text',
        valueField: 'value',
        defaultValue: false,
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl.get('hmde.bo.field.multiple.single').d('单选'),
                value: false,
              },
              {
                text: intl.get('hmde.bo.field.multiple.multiple').d('多选'),
                value: true,
              },
            ],
          });
        })(),
        Render: props => {
          return <SelectBox disabled={props?.disabled} key="multipleFlag" name="multipleFlag" />;
        },
      },
      {
        name: 'maxFileSize',
        type: 'number',
        label: intl.get('hmde.bo.field.fileLimit').d('文件大小限制'),
        bind: 'attributeJson.maxFileSize',
        ignore: 'always',
        required: false,
        Render: props => {
          return (
            <NumberField
              disabled={props?.disabled}
              key="maxFileSize"
              name="maxFileSize"
              addonAfter="MB"
              step={0.1}
            />
          );
        },
      },
      {
        name: 'maxFileCount',
        type: 'number',
        bind: 'attributeJson.maxFileCount',
        ignore: 'always',
        label: intl.get('hmde.bo.field.maxUpload').d('文件上传最大数量'),
        required: false,
        Render: props => {
          return (
            <NumberField
              disabled={props?.disabled || (isTenant && isEditMode && !isExtensionField)}
              key="maxFileCount"
              name="maxFileCount"
              step={1}
            />
          );
        },
      },
      {
        name: 'linkRelationType',
        type: 'string',
        label: intl.get('hmde.bo.field.linkRelationType').d('关联方式'),
        required: true,
        textField: 'text',
        valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl
                  .get('hmde.bo.field.linkRelationType.oneToMany')
                  .d('关联对象 1 条记录对应当前对象的多条记录'),
                value: 'ONE_TO_MANY',
              },
              {
                text: intl
                  .get('hmde.bo.field.linkRelationType.oneToOne')
                  .d('关联对象 1 条记录对应当前对象的 1 条记录'),
                value: 'ONE_TO_ONE',
              },
            ],
          });
        })(),
        Render: ({ disabled }) => {
          return <Select disabled={disabled} key="linkRelationType" name="linkRelationType" />;
        },
      },
      // 引用值列表字段
      {
        name: 'refValueListBusinessObject',
        label: intl.get('hmde.bo.field.refValueListId').d('引用值列表'),
        // required: true,
        type: 'object',
        ignore: 'always',
        textField: 'businessObjectOptionName',
        lovCode: isTenant
          ? 'HMDE.BUSINESS_OBJECT_FIELD.AVAILABLE.OPTION'
          : 'HMDE.BUSINESS_OBJECT_FIELD.AVAILABLE.OPTION.SITE',
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.get('masterBusinessObjectId');
          },
          lovPara: ({ record }) => ({
            businessObjectCode: record.get('masterBusinessObjectCode'),
          }),
        },
        Render: props => {
          return (
            <Lov
              disabled={props?.disabled}
              key="refValueListBusinessObject"
              name="refValueListBusinessObject"
            />
          );
        },
      },
      {
        name: 'businessObjectOptionId',
        type: 'string',
        bind: 'refValueListBusinessObject.businessObjectOptionId',
      },
      {
        name: 'businessObjectOptionCode',
        type: 'string',
        bind: 'refValueListBusinessObject.businessObjectOptionCode',
      },
      {
        name: 'businessObjectOptionName',
        type: 'string',
        bind: 'refValueListBusinessObject.businessObjectOptionName',
      },
      // end
      {
        name: 'lovDisplayType',
        bind: 'attributeJson.lovDisplayType',
        label: intl.get('hmde.bo.field.lovDisplayType').d('显示样式'),
        ignore: 'always',
        textField: 'text',
        valueField: 'value',
        defaultValue: 'modal',
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
            {
              text: intl.get('hmde.bo.field.lovDisplayType.modal').d('弹窗选择'),
              value: 'modal',
            },
            {
              text: intl.get('hmde.bo.field.lovDisplayType.dropdown').d('下拉选择'),
              value: 'dropdown',
            },
          ],
        }),
        Render: () => {
          return <Select disabled key="lovDisplayType" name="lovDisplayType" />;
        },
      },
      {
        name: 'readOnlyFlag',
        type: 'boolean',
        bind: 'attributeJson.readOnlyFlag',
        ignore: 'always',
        label: intl.get('hmde.bo.field.readOnly').d('字段只读'),
        defaultValue: false,
        transformResponse: value => {
          if (value === undefined || value === null) {
            return false;
          } else {
            return value;
          }
        },
        Render: () => {
          // return <Switch disabled={props?.disabled} key="readOnlyFlag" name="readOnlyFlag" />;
        },
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.field.requiredFlag').d('字段必输'),
        defaultValue: false,
        Render: props => {
          return (
            <CheckBox
              disabled={
                props?.disabled ||
                (isEditMode && isTenant && !isExtensionField && props?.requireFlag)
              }
              key="requiredFlag"
              name="requiredFlag"
            />
          );
        },
        // dynamicProps: {
        //   readOnly: ({ record }) => {
        //     // 租户编辑平台标准字段必输时如果是必输不能改成非必输
        //     if (isTenant && isEditMode && !isExtensionField) {
        //       return !record.get('requiredFlagUpdated') && record.get('tenantRequiredControl');
        //     }
        //     return false;
        //   },
        // },
      },
      {
        name: 'exportableFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.field.exportableFlag').d('是否可导出'),
        required: true,
        transformResponse: value => {
          if (value === undefined || value === null) {
            return true; // 默认值true
          } else {
            return value;
          }
        },
        // defaultValue: true,
        Render: () => {
          return (
            <CheckBox
              disabled={isEditMode && isTenant && !isExtensionField}
              key="exportableFlag"
              name="exportableFlag"
            />
          );
        },
      },
      {
        name: 'multiLanguageFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.field.multiLanguageFlag').d('是否多语言'),
        // defaultValue: false, // defaultValue和transformResponse不能共用 当前版本c7n有回显Bug
        // required: true,
        transformResponse: value => {
          if (value === undefined || value === null) {
            return false;
          } else {
            return value;
          }
        },
        Render: props => {
          return (
            <CheckBox disabled={props?.disabled} key="multiLanguageFlag" name="multiLanguageFlag" />
          );
        },
      },
    ],
    events: {
      update: ({ name, value, record, oldValue, dataSet }) => {
        codeDisabled = record.get('codeDisabled');
        const isInitFlag = oldValue === undefined; // 第一次初始化的时候，这个字段是没有值的
        if (name === 'fixDateTime') {
          const originDefaultValue = record.getPristineValue('defaultValue', '');
          const originDefaultValueType = record.getPristineValue('defaultValueType', '');

          if (value === 'CURRENT_TIMESTAMP') {
            record.set('defaultValue', 'CURRENT_TIMESTAMP');
            record.set('defaultValueType', 'NORMAL');
          } else if (value === 'fix') {
            record.set('defaultValue', isInitFlag ? originDefaultValue : '');
            record.set('defaultValueType', 'NORMAL');
          } else if (value === 'none') {
            record.set('defaultValue', 'none');
            record.set('defaultValueType', 'NORMAL');
          } else if (value === 'EXPRESSION') {
            record.set(
              'defaultValue',
              originDefaultValueType === 'EXPRESSION' ? originDefaultValue : ''
            );
            record.set('defaultValueType', 'EXPRESSION');
          }
        }
        if (name === 'businessObjectField' && value) {
          record.set('inheritFieldCode', value?.extendFieldCode);
          record.set('remark', value?.remark);
          if (value?.maxLength) {
            record.set('maxLength', value?.maxLength);
            record.getField('maxLength').set('validator', recordValue => {
              if (recordValue || recordValue === 0) {
                if (recordValue > value?.maxLength || recordValue < 1) {
                  return intl
                    .get('hmde.bo.validation.range.minmax', { name: `1-${value?.maxLength}` })
                    .d(`可填范围为 1-${value?.maxLength}`);
                }
              }
            });
          }
          if (value?.digitalAccuracy) {
            record.set('digitalAccuracy', value?.digitalAccuracy);
            // eslint-disable-next-line no-unused-expressions
            record.getField('digitalAccuracy')?.set('validator', recordValue => {
              if (recordValue || recordValue === 0) {
                if (recordValue > value?.digitalAccuracy || recordValue < 1) {
                  return intl
                    .get('hmde.bo.validation.range.minmax', { name: `1-${value?.digitalAccuracy}` })
                    .d(`可填范围为 1-${value?.digitalAccuracy}`);
                }
              }
            });
          }
        }
        if (name === 'masterBusinessObject' && value && record.get('refValueListBusinessObject')) {
          record.set('businessObjectOptionName', undefined);
          record.set('businessObjectOptionId', undefined);
          record.set('refValueListBusinessObject', null);
        }
        if (name === 'refBusinessObject' && value !== oldValue) {
          // eslint-disable-next-line no-unused-expressions
          record?.set('formula', null);
        }
        if (name === 'defaultValueType') {
          const _componentType = componentType || dataSet.get('componentType');
          const originValueType = record.getPristineValue('defaultValueType'); // 原始值
          const currentValueType = record.get('defaultValueType');
          if (originValueType === currentValueType) {
            // eslint-disable-next-line no-unused-expressions
            record?.set('defaultValue', record.getPristineValue('defaultValue') as string);
          } else if (_componentType === 'SWITCH') {
            // 开关类型的默认值比较特殊，需要特殊处理
            record.set('defaultValue', value === 'EXPRESSION' ? '' : value);
          } else {
            record.set('defaultValue', '');
          }
        }
        if (name === 'meaningConfig') {
          if (value === 'selfConfig' && !record.get('trueMeaning')) {
            record.set('trueMeaning', MeaningConfig.yes);
          }
          if (value === 'selfConfig' && !record.get('falseMeaning')) {
            record.set('falseMeaning', MeaningConfig.no);
          }
        }
        if (name === 'fileTypes') {
          const fileTypes = value;
          if (!fileTypes || !fileTypes.length) {
            record.set('fileFormats', undefined);
          } else {
            const oldFileTypes = oldValue && oldValue.length ? oldValue : [];
            let supportFileFormats: any[] = record.get('fileFormats') || [];
            const options = dataSet.getField('fileFormats', record)?.getOptions(record)?.toData();
            if (options) {
              // 新增类型，只添加新增类型对应的格式
              fileTypes.filter(type => !oldFileTypes.includes(type)).forEach(type => supportFileFormats.push(...options.filter(i => i.parentValue === type).map(i => i.value)));
              // 删除类型，只删除删除类型对应的格式
              oldFileTypes.filter(type => !fileTypes.includes(type)).forEach(type => {
                supportFileFormats = supportFileFormats.filter(format => !options.filter(i => i.parentValue === type).map(i => i.value).includes(format));
              });
              supportFileFormats = [...new Set(supportFileFormats)];
              record.set('fileFormats', supportFileFormats);
            }
          }
        }
      },
      load: ({ dataSet }) => {
        if (dataSet?.current?.get('componentType') === 'DATETIME_SELECTION_BOX') {
          if (dataSet?.current?.get('defaultValue') === 'CURRENT_TIMESTAMP') {
            dataSet.current.set('fixDateTime', 'CURRENT_TIMESTAMP');
          } else if (!dataSet?.current?.get('defaultValue')) {
            dataSet.current.set('fixDateTime', 'none');
          } else if (dataSet?.current?.get('defaultValueType') === 'EXPRESSION') {
            dataSet.current.set('fixDateTime', 'EXPRESSION');
          } else {
            dataSet.current.set('fixDateTime', 'fix');
          }
        } else if (dataSet?.current?.get('componentType') === 'SWITCH') {
          if (dataSet?.current?.get('lovCode')) {
            // 如果有这个code 那就是值集类型的描述
            dataSet.current.init('meaningConfig', 'valueList');
            dataSet.current.set('valueList', {
              lovCode: dataSet?.current?.get('lovCode'),
              lovName: dataSet?.current?.get('lovName'),
            });
          } else {
            // 那就是【自定义】类型的描述
            dataSet.current.init('meaningConfig', 'selfConfig');
            const preSetList = get(
              dataSet.toData(),
              ['0', 'attributeJson', 'customOptionList'],
              []
            );
            dataSet.current.set(
              'trueMeaning',
              preSetList.find(o => `${o.value}` === '1')?.meaning || MeaningConfig.yes
            );
            dataSet.current.set(
              'falseMeaning',
              preSetList.find(o => `${o.value}` === '0')?.meaning || MeaningConfig.no
            );
          }
          dataSet.current.set(
            'defaultValueType',
            dataSet?.current?.get('defaultValueType') === 'EXPRESSION'
              ? 'EXPRESSION'
              : dataSet?.current?.get('defaultValue')
          );
          if (dataSet?.current?.get('defaultValue') === undefined) {
            dataSet.current.set('defaultValue', '0');
          }
        } else if (dataSet?.current?.get('componentType') === 'APPENDIX') {
          const fileTypes = dataSet?.current?.get('fileTypes');
          if (fileTypes || fileTypes.length) {
            dataSet.current.init('fileTypes', fileTypes.map(type => type === 'pic' ? 'image' : type === 'file' ? 'application' : type));
          }
        }
        if (isTenant && isEditMode && !isExtensionField) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.set('tenantRequiredControl', dataSet?.current?.get('requiredFlag'));
        }
        const data = dataSet?.current?.toData();
        if (isExtensionField && data?.extendFieldMaxLength) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.getField('maxLength')?.set('validator', recordValue => {
            if (recordValue || recordValue === 0) {
              if (recordValue > data?.extendFieldMaxLength || recordValue < 1) {
                return intl
                  .get('hmde.bo.validation.range.minmax', { name: `1-${data?.extendFieldMaxLength}` })
                  .d(`可填范围为 1-${data?.extendFieldMaxLength}`);
              }
            }
          });
        }
        if (isExtensionField && data?.extendFieldDigitalAccuracy) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.getField('digitalAccuracy')?.set('validator', recordValue => {
            if (recordValue || recordValue === 0) {
              if (recordValue > data?.extendFieldDigitalAccuracy || recordValue < 1) {
                return intl
                  .get('hmde.bo.validation.range.minmax', { name: `1-${data?.extendFieldDigitalAccuracy}` })
                  .d(`可填范围为 1-${data?.extendFieldDigitalAccuracy}`);
              }
            }
          });
        }
        if (!isExtensionField && isTenant && isEditMode) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.getField('maxLength')?.set('validator', recordValue => {
            if (recordValue || recordValue === 0) {
              if (recordValue > data?.platformFieldMaxLength || recordValue < 1) {
                return intl
                  .get('hmde.bo.validation.range.minmax', { name: `1-${data?.platformFieldMaxLength}` })
                  .d(`可填范围为 1-${data?.platformFieldMaxLength}`);
              }
            }
          });
        }
      },
    },
  };
};
