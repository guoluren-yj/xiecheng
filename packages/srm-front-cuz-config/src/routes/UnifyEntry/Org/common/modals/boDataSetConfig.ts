import { runInAction } from 'mobx';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import { Record } from 'choerodon-ui/dataset';

export default function boDataSetConfig(r): DataSetProps {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'componentType',
        label: intl.get('hmde.bo.field.componentType').d('字段类型'),
        options: new DataSet({
          paging: false,
          data: [
            {
              value: 'TEXT_FIELD',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.textField`).d('文本'),
            },
            {
              value: 'TEXT_AREA',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.textArea`)
                .d('多行文本'),
            },
            {
              value: 'NUMBER_FIELD',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.numberField`)
                .d('整数'),
            },
            {
              value: 'FLOAT',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.float`).d('浮点'),
            },
            {
              value: 'PERCENTAGE',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.percentage`)
                .d('百分数'),
            },
            {
              value: 'DATE_SELECTION_BOX',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.dateSelectionBox`)
                .d('日期'),
            },
            {
              value: 'DATETIME_SELECTION_BOX',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.dateTimeSelectionBox`)
                .d('日期时间'),
            },
            {
              value: 'SINGLE_SELECT',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.singleSelect`)
                .d('下拉单选'),
            },
            {
              value: 'MULTIPLE_SELECT',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.multipleSelect`)
                .d('下拉多选'),
            },
            {
              value: 'RADIO',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.radio`).d('单选'),
            },
            {
              value: 'CHECKBOX',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.checkbox`).d('复选'),
            },
            {
              value: 'SWITCH',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.switch`).d('开关'),
            },
            {
              value: 'MONEY',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.money`).d('金额'),
            },
            {
              value: 'PHONE_NUMBER',
              meaning: intl
                .get(`hmde.domainOwnBOList.view.message.fieldType.phoneNumber`)
                .d('手机号码'),
            },
            {
              value: 'EMAIL',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.mail`).d('电子邮箱'),
            },
            {
              value: 'APPENDIX',
              meaning: intl.get(`hmde.domainOwnBOList.view.message.fieldType.appendix`).d('附件'),
            },
          ],
        }),
      },
      {
        name: 'inheritSourceType',
        label: intl.get('hpfm.customize.common.fieldSource').d('字段来源'),
        disabled: true,
        options: new DataSet({
          data: [
            {
              value: 'STANDARD',
              meaning: intl.get('hmde.bo.field.view.message.tab.standardField').d('标准字段'),
            },
            {
              value: 'EXTEND',
              meaning: intl.get('hmde.bo.field.view.message.tab.extendField').d('扩展字段'),
            },
          ],
        }),
      },
      {
        name: 'inheritFieldName',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        type: FieldType.intl,
        required: true,
        maxLength: 30,
      },
      {
        name: 'businessObjectField',
        type: FieldType.object,
        required: true,
        label: intl.get('hpfm.customize.common.fieldSelect').d('字段选择'),
        lovCode: 'HMDE.EXTEND_FIELD',
        dynamicProps: {
          lovPara: ({ record }) => {
            const modelSelect = r.getField('modelSelect');
            const modelCode = r.get('modelCode');
            let businessObjectCode;
            const innerRecord =
              // eslint-disable-next-line eqeqeq
              modelSelect && modelSelect.options.find((m) => m.get('value') == modelCode);
            if (innerRecord) businessObjectCode = innerRecord.get('relateBusinessObjectCode');
            return {
              businessObjectCode,
              componentType: record.get('componentType'),
              tenantId: getCurrentOrganizationId(),
            };
          },
          disabled: ({ record }) => {
            return record ? !record.get('componentType') : true;
          },
        },
      },
      {
        name: 'extendFieldId',
        type: FieldType.string,
        ignore: FieldIgnore.always,
        bind: 'businessObjectField.extendFieldId',
      },
      {
        name: 'inheritFieldCode',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        required: true,
        disabled: true,
        unique: true,
      },
      {
        name: 'maxLength',
        type: FieldType.number,
        label: intl.get('hpfm.individual.model.config.maxLength').d('最大长度'),
        dynamicProps: {
          required: ({ record }) =>
            [
              'TEXT_FIELD',
              'TEXT_AREA',
              'PHONE_NUMBER',
              'EMAIL',
              'SINGLE_SELECT',
              'MULTIPLE_SELECT',
            ].includes(record.get('componentType')),
        },
        min: 1,
        validator: (recordValue) => {
          if (recordValue || recordValue === 0) {
            if (recordValue > 2147483647 || recordValue < 1) {
              return intl
                .get('hmde.bo.validation.range.textArea')
                .d('可填范围为 1-2147483647 的整数');
            }
          }
        },
        defaultValue: 240,
        step: 1,
      },
      {
        name: 'helpText',
        label: intl.get('hmde.bo.field.helpText').d('帮助文本'),
        disabled: true,
        type: FieldType.intl,
      },
      {
        name: 'remark',
        label: intl.get('hmde.common.label.remark').d('描述'),
        type: FieldType.intl,
      },
      {
        name: 'requiredFlag',
        type: FieldType.boolean,
        label: intl.get('hmde.bo.field.requiredFlag').d('字段必输'),
        defaultValue: false,
      },
      {
        name: 'exportableFlag',
        type: FieldType.boolean,
        label: intl.get('hmde.bo.field.exportableFlag').d('是否可导出'),
        required: true,
        transformResponse: (value) => {
          if (value === undefined || value === null) {
            return true; // 默认值true
          } else {
            return value;
          }
        },
      },
      {
        name: 'optionSettings',
        label: intl.get('hmde.bo.field.optionSettings').d('选项设置'),
        defaultValue: '_valueList',
        disabled: true,
        transformResponse: (_, object) => {
          if (!object) return;
          if (
            ['SINGLE_SELECT', 'MULTIPLE_SELECT', 'RADIO', 'CHECKBOX'].includes(object.componentType)
          ) {
            return '_valueList';
          } else if (object.componentType) {
            return '_custom';
          }
        },
      },
      {
        name: 'optionDirection',
        type: FieldType.string,
        label: intl.get('hmde.bo.field.optionDirection').d('选项排序方式'),
        defaultValue: 'horizontal',
        transformResponse: (value) => {
          if (value === undefined || value === null) {
            return 'horizontal';
          } else {
            return value;
          }
        },
      },
      {
        name: 'meaningConfig',
        label: intl.get('hmde.bo.field.meaningConfig').d('含义配置'),
        defaultValue: 'selfConfig',
        type: FieldType.string,
        textField: 'text',
        valueField: 'value',
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
            {
              text: intl.get('hmde.bo.field.defaultValue.selfConfig').d('自定义'),
              value: 'selfConfig',
            },
            {
              text: intl.get('hmde.bo.field.defaultValue.valueList').d('值集'),
              value: 'valueList',
            },
          ],
        }),
      },
      {
        name: 'customOptionList',
        type: FieldType.object,
        transformRequest: (value, record) => {
          if (record.get('optionSettings') === '_valueList') {
            return undefined;
          } else {
            return value;
          }
        },
      },
      {
        name: 'valueList',
        type: FieldType.object,
        label: intl.get('hmde.bo.field.valueList').d('值集'),
        lovCode: 'HPFM.LOV_IDP',
        valueField: 'lovCode',
        textField: 'lovCode',
        dynamicProps: {
          required: ({ record }) =>
            ['SINGLE_SELECT', 'MULTIPLE_SELECT', 'RADIO', 'CHECKBOX'].includes(
              record.get('componentType')
            ) && record.get('optionSettings') === '_valueList',
        },
        lovQueryAxiosConfig: (_, __, { params }) => {
          return {
            url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lov-headers`,
            method: 'GET',
            params: {
              ...params,
              enabledFlag: 1,
              tenantId: getCurrentOrganizationId(),
            },
          };
        },
      } as FieldProps,
      {
        name: 'lovCode',
        bind: 'valueList.lovCode',
      },
      {
        name: 'lovType',
        bind: 'valueList.lovTypeCode',
      },
      {
        name: 'lovName',
        bind: 'valueList.lovName',
      },
      {
        name: 'format',
        type: FieldType.string,
        lookupCode: 'HMDE.DATA_FOMRAT',
      },
      {
        name: "timeZoneConvertFlag",
        label: intl.get("hpfm.customize.common.timeZoneConvertFlag").d("是否时区转换"),
        type: FieldType.boolean,
      },
      {
        name: 'maxValue',
        label: intl.get('hzero.common.title.individuation.formInputPropsMax').d('最大值'),
        type: FieldType.number,
        validator: (recordValue, _, record) => {
          if (recordValue && (record as Record).get('minValue')) {
            if (recordValue < (record as Record).get('minValue')) {
              return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
            }
          }
        },
      },
      {
        name: 'minValue',
        label: intl.get('hzero.common.title.individuation.formInputPropsMin').d('最小值'),
        type: FieldType.number,
        validator: (recordValue, _, record) => {
          if (recordValue && (record as Record).get('maxValue')) {
            if (recordValue > (record as Record).get('maxValue')) {
              return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
            }
          }
        },
      },
      {
        name: 'digitalAccuracy',
        label: intl.get('hmde.bo.field.digitalAccuracy').d('小数位数'),
        type: FieldType.number,
        defaultValue: 2,
        max: 10,
        min: 0,
        step: 1,
      },
      {
        name: 'multipleFlag',
        type: FieldType.boolean,
        label: intl.get('hmde.bo.field.multiple').d('是否支持多选'),
        textField: 'text',
        valueField: 'value',
        defaultValue: false,
        options: new DataSet({
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
        }),
      },
      {
        name: 'maxFileSize',
        type: FieldType.number,
        label: intl.get('hmde.bo.field.fileLimit').d('文件大小限制'),
        min: 1,
      },
      {
        name: 'fileTypes',
        type: FieldType.string,
        label: intl.get('hmde.bo.field.fileType').d('支持文件类型'),
        lookupCode: 'HFLE.CONTENT_TYPE',
        multiple: true,
      },
      {
        name: 'fileFormats',
        label: intl.get('hmde.bo.field.fileExt').d('文件格式'),
        multiple: true,
        lookupCode: 'HMDE.FILE_FORMAT',
      },
    ],
    events: {
      update: ({ name, value, record, oldValue, dataSet }) => {
        runInAction(() => {
          const {
            extendFieldCode,
            remark,
            businessObjectId,
            extendFieldId,
            extendCategory,
            maxLength,
          } = value || {};
          if (name === 'attributeJson') return;
          const obj = record.get([
            'helpText',
            'optionSettings',
            'optionDirection',
            'fileTypes',
            'multipleFlag',
            'maxFileSize',
            'maxFileCount',
            'fileFormats',
          ]);
          record.set('attributeJson', obj);
          switch (name) {
            case 'businessObjectField':
              record.set('inheritFieldCode', extendFieldCode);
              record.set('inheritFieldName', remark);
              record.set('remark', remark);
              record.set('maxLength', maxLength);
              // 默认带出，同时也是字段允许的最大值
              record.getField("maxLength").set("max", maxLength === undefined ? 240 : maxLength);
              record.set('businessObjectId', businessObjectId);
              record.set('extendFieldId', extendFieldId);
              record.set(
                'inheritSourceType',
                ['FLEX_FIELD', 'EXTEND_TABLE'].includes(extendCategory || '')
                  ? 'EXTEND'
                  : 'STANDARD'
              );
              break;
            case 'componentType':
              record.init('componentType', value);
              if (value === "DATETIME_SELECTION_BOX") {
                record.init('timeZoneConvertFlag', true);
              }
              record.reset();
              break;
            case 'fileTypes':
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
              break;
            default:
          }
        });
      },
    },
  };
}
