/*
 * @Date: 2022-06-09 14:41:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import moment from 'moment';
import { forEach, isEmpty, isNil, isUndefined, round } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';

import {
  getSaveUrl,
  getDataSetType,
  getOperationUrl,
  rowKeys,
  getComponentProps,
  questionnaireForm,
  handleRequired,
  getCascadeParams,
  handleLovDefaultValue,
  hanldeMultipleLovMeaning,
  handleValueListDefaultValue,
  handlePattern,
  handleDisabled,
  handleFinanceData,
  getAttachmentTypeOption,
} from '../utils';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
// 单位为"万元"的字段集合
const thousandFields = [
  'totalAssets',
  'totalLiabilities',
  'currentAssets',
  'currentLiabilities',
  'revenue',
  'netProfit',
  'registeredCapital',
];

// field自定义校验规则
const getFieldsValidator = (value, name, record) => {
  switch (name) {
    case 'regionId': {
      const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
        'countryCode',
        'quickIndex',
        'isLeaf',
        'regionId',
      ]);
      if (countryCode === 'CN' || quickIndex === 'CN') {
        if (!isLeaf && regionId) {
          return intl.get('sslm.common.view.message.lastRegion').d('地区须选择填写至最末级地区');
        }
        return true;
      }
      return true;
    }
    case 'zipCode': {
      const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
      if ((countryCode === 'CN' || quickIndex === 'CN') && !isEmpty(value)) {
        const zipCodeReg = /^[0-9]{6,6}$/;
        if (!zipCodeReg.test(value)) {
          return intl.get('sslm.common.view.validate.atLeastSixNumber').d('请输入6位数字');
        }
        return true;
      }
      return true;
    }
    default:
      break;
  }
};

// 处理响应值
const handleTransformResponse = (value, type, fieldCode, commonProps) => {
  const { defaultValue } = commonProps;
  if (thousandFields.includes(fieldCode)) {
    // 处理英文环境下，万元的显示问题
    return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
  } else if (type === 'boolean' && !isNil(value)) {
    return +value;
  } else {
    // 接口未返回值时，展示默认值
    return isNil(value) && !isEmpty(defaultValue) ? defaultValue : value;
  }
};

// 获取lov fields
const getLovFields = (line, componentProps) => {
  const {
    fieldCode,
    requiredFlag,
    fieldDescription,
    tenantId,
    lovCode = '',
    valueField = '',
    displayField = '',
    componentType = '',
  } = line;
  const isMultiple = componentType === 'TransferLov';
  const otherComponentProps = {};
  const defaultValue = handleLovDefaultValue({
    isMultiple,
    valueField,
    displayField,
    componentProps,
  });
  if (!isEmpty(defaultValue)) {
    otherComponentProps.defaultValue = defaultValue;
  }
  return [
    {
      ...componentProps,
      ...otherComponentProps,
      name: `${fieldCode}Lov`,
      type: 'object',
      label: fieldDescription,
      lovCode,
      ignore: 'always',
      required: requiredFlag,
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => {
              switch (fieldCode) {
                case 'categoryCode':
                  return !!record.get('checkFlag');
                default:
                  return record.get('isCheck') !== false;
              }
            },
          },
        },
      },
      computedProps: {
        required: ({ record }) => handleRequired({ record, line }),
        lovPara: ({ record }) => {
          const cascadeParams = getCascadeParams(componentProps, record);
          const otherLovPara = {
            hzeroUIFlag: 1,
          };
          if (fieldCode === 'productCategoryId') {
            // 品类值集需要传业务规则定义中的配置
            otherLovPara.businessObjectCode = 'SRM_C_SRM_SSLM_INVESTG_PROSERVICE';
          }

          const queryParams = { tenantId, ...cascadeParams, ...otherLovPara };
          return queryParams;
        },
        disabled: ({ record }) => handleDisabled({ record, line }),
      },
      lovDefineAxiosConfig: (code, config) => {
        const lovConfig = lovDefineAxiosConfig(code, config);
        return {
          ...lovConfig,
          params: { tenantId },
        };
      },
      transformResponse: (value, record) => {
        const fieldCodeValue = (record || {})[fieldCode];
        if (isMultiple) {
          return hanldeMultipleLovMeaning({
            record,
            fieldCode,
            valueField,
            displayField,
            defaultValue,
          });
        } else if (isUndefined(fieldCodeValue)) {
          // 当后端接口返回当前字段是undefined时默认值生效
          if (!isEmpty(defaultValue)) {
            return defaultValue;
          }
          return value;
        }
      },
    },
    {
      name: `${fieldCode}Meaning`,
      bind: `${fieldCode}Lov.${displayField}`,
      transformRequest: value => (isMultiple ? (isEmpty(value) ? null : value.join(',')) : value),
    },
    {
      name: `${fieldCode}`,
      bind: `${fieldCode}Lov.${valueField}`,
      transformRequest: value => (isMultiple ? (isEmpty(value) ? null : value.join(',')) : value),
    },
  ];
};

// 获取ValueList fields
const getValueListFields = (line, componentProps) => {
  const { fieldDescription, fieldCode, lovCode, tenantId } = line;
  const { multiple } = componentProps;
  const isMultiple = multiple;
  const otherComponentProps = {};
  const defaultValue = handleValueListDefaultValue({
    isMultiple,
    componentProps,
  });
  if (!isEmpty(defaultValue)) {
    otherComponentProps.defaultValue = defaultValue;
  }
  return {
    ...componentProps,
    ...otherComponentProps,
    label: fieldDescription,
    name: fieldCode,
    noCache: true,
    lookupCode: lovCode,
    computedProps: {
      required: ({ record }) => handleRequired({ record, line }),
      lovPara: ({ record }) => {
        const cascadeParams = getCascadeParams(componentProps, record);
        const queryParams = { tenantId, ...cascadeParams };
        return queryParams;
      },
      disabled: ({ record }) => handleDisabled({ record, line }),
    },
    transformRequest: value => (isMultiple ? (isEmpty(value) ? null : value.join(',')) : value),
    transformResponse: (value, data) => {
      const curValue = data && data[fieldCode];
      // 接口未返回值时，展示默认值
      if (isNil(curValue) && !isEmpty(defaultValue)) {
        return defaultValue;
      }
      if (isMultiple) {
        if (!isEmpty(data)) {
          const val = data[fieldCode];
          return val ? val.split(',') || [] : [];
        } else {
          return [];
        }
      } else {
        return value;
      }
    },
  };
};

// 获取Cascader fields
const getCascaderFields = (line, componentProps) => {
  const { fieldDescription, fieldCode, tenantId } = line;
  if (fieldCode !== 'attachmentType') {
    return {};
  }
  return [
    {
      ...componentProps,
      label: fieldDescription,
      name: `${fieldCode}Merge`,
      computedProps: {
        required: ({ record }) => handleRequired({ record, line }),
        disabled: ({ record }) => handleDisabled({ record, line }),
      },
      options: getAttachmentTypeOption({ tenantId }),
      textField: 'meaning',
      valueField: 'value',
      transformResponse: (value, record) => {
        const { attachmentType, parentAttachmentType } = record;
        if (parentAttachmentType && attachmentType) {
          return [parentAttachmentType, attachmentType];
        } else if (attachmentType) {
          return [attachmentType];
        } else {
          return value;
        }
      },
      ignore: 'always',
    },
    {
      name: fieldCode,
    },
    {
      name: 'parentAttachmentType',
    },
  ];
};

// 获取ds的fields
const getDataSetFields = lines => {
  const fields = [];
  forEach(lines, line => {
    const { fieldDescription, fieldCode, componentType } = line;
    const componentProps = getComponentProps(componentType, line);
    const {
      mobilephoneFlag,
      pattern,
      dynamicProps,
      computedProps,
      ...commonProps
    } = componentProps;
    // 手机号组件
    const mobilephoneProps = {};
    if (mobilephoneFlag) {
      fields.push({
        name: 'internationalTelCode',
        defaultValue: '+86',
        lookupCode: 'HPFM.IDD',
        required: true,
      });
      mobilephoneProps.type = 'tel';
      mobilephoneProps.regionField = 'internationalTelCode';
    }
    const type = getDataSetType(componentType, fieldCode);
    switch (componentType) {
      case 'TransferLov':
      case 'Lov': {
        const lovFields = getLovFields(line, componentProps);
        fields.push(...lovFields);
        break;
      }
      case 'ValueList': {
        const valueListFields = getValueListFields(line, componentProps);
        fields.push(valueListFields);
        break;
      }
      case 'Cascader': {
        const cascaderFields = getCascaderFields(line, componentProps);
        if (!isEmpty(cascaderFields)) {
          fields.push(...cascaderFields);
        }
        break;
      }
      default:
        fields.push({
          ...commonProps,
          label: fieldDescription,
          name: fieldCode,
          type,
          ...mobilephoneProps,
          validator: getFieldsValidator,
          computedProps: {
            required: ({ record }) => handleRequired({ record, line, lines }),
            pattern: ({ record }) => {
              const patternFlag = handlePattern({ record, componentProps, line });
              if (patternFlag) {
                return new RegExp(pattern, 'g');
              } else if (!patternFlag && mobilephoneFlag) {
                // 手机号没配置正则，则按照标准生效
                return (record.get('internationalTelCode') || '+86') === '+86'
                  ? PHONE
                  : NOT_CHINA_PHONE;
              } else {
                return null;
              }
            },
            disabled: ({ record }) => handleDisabled({ record, line }),
            ...(computedProps || {}),
          },
          transformRequest: value =>
            type === 'date' ? value && moment(value).format(DEFAULT_DATE_FORMAT) : value,
          // 处理预留字段返回字符串问题
          transformResponse: value => handleTransformResponse(value, type, fieldCode, commonProps),
        });
        break;
    }
  });
  // fields.push({
  //   name: 'aiApproveResult',
  //   ignore: 'always',
  //   lookupCode: 'SSLM.AI_APPROVE_RESULT',
  //   label: intl.get('sslm.common.model.ai.approveResult').d('AI审批结果'),
  // });
  return fields;
};

// 获取ds
// type 用于区分接口 360查询的产品及服务不分页
export const getInvestigationDS = ({
  config,
  previewFlag,
  allowDeleteAllLineFlag = true,
  type = 'query',
} = {}) => {
  const { configName, lines = [] } = config;
  return {
    paging: type === '360QUERY' ? false : ['sslmInvestgProservice'].includes(configName), // 仅产品及服务需要分页
    pageSize: 20,
    autoCreate: Boolean(questionnaireForm[configName]),
    forceValidate: true,
    fields: getDataSetFields(lines),
    transport: {
      read: ({ data: { queryParam = {}, ...rest } = {} }) => {
        const interfaceName = getOperationUrl(configName, type);
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
          method: 'GET',
          data: { ...rest, ...queryParam },
        };
      },
      destroy: ({ data }) => {
        const interfaceName = getOperationUrl(configName, 'destroy');
        const rowKey = rowKeys[configName];
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
          method: 'DELETE',
          data: data.map(n => n[rowKey]),
        };
      },
      submit: ({ dataSet, data }) => {
        const queryParams = dataSet.getQueryParameter('queryParam') || {};
        const newData = data.map(item => ({ ...item, ...queryParams }));
        let saveData = newData;
        const interfaceName = getSaveUrl(configName);
        if (configName === 'sslmInvestgFin') {
          saveData = newData.map(item => handleFinanceData(item));
        }
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
          method: 'POST',
          data: saveData,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        switch (configName) {
          case 'sslmInvestgAttachment':
            dataSet.forEach(record => {
              if (record.data.purchaserFlag || previewFlag) {
                Object.assign(record, { selectable: false });
              }
            });
            break;
          case 'sslmInvestgBankAccount':
            dataSet.forEach(record => {
              if (record.get('extSourceAccountFlag')) {
                Object.assign(record, { selectable: false });
              }
            });
            break;
          default:
            break;
        }
        if (
          !allowDeleteAllLineFlag &&
          ['sslmInvestgContact', 'sslmInvestgAddress', 'sslmInvestgBankAccount'].includes(
            configName
          )
        ) {
          dataSet.forEach(record => {
            const {
              mainDataFlag,
              supplierBankAccountId,
              supplierContactId,
              supplierAddressId,
            } = record.get([
              'mainDataFlag',
              'supplierBankAccountId',
              'supplierContactId',
              'supplierAddressId',
            ]);
            // 主数据标识
            const notSelectableFlag =
              mainDataFlag || supplierBankAccountId || supplierContactId || supplierAddressId;
            if (notSelectableFlag) {
              Object.assign(record, { selectable: false });
            }
          });
        }
      },
      update: ({ name, record }) => {
        if (configName === 'sslmInvestgAuth' && name === 'longEffectiveFlag') {
          record.set('expirationDate', null);
        }
      },
    },
  };
};
