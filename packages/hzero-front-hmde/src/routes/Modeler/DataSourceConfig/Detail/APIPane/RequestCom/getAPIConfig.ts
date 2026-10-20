import moment from 'moment';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

/**
 * 根据数据对象字段生成备注信息
 * @param {*} 数据对象字段
 * @returns 生成好的备注信息
 */
interface IGenerateComment {
  relationKey: number;
  primaryFlag: number;
  ruleCode: string;
  fieldName: string;
  fieldType: string;
}
export const generateComment = ({
  relationKey,
  primaryFlag,
  ruleCode,
  fieldName,
  fieldType,
}: IGenerateComment) => {
  let explanation = '';
  if (isPresetField(fieldName, ['others', ['OBJECT_VERSION_NUMBER']])) {
    explanation += '(乐观锁版本号)';
  }
  if (isPresetField(fieldName, ['TENANT_ID'])) {
    explanation += '(租户ID)';
  }
  if (primaryFlag === 1) {
    // 主键
    explanation += '(主键)';
  }
  if (relationKey === 1) {
    // 关联字段
    explanation += '(关联字段)';
  }
  if (ruleCode) {
    // 编码字段
    explanation += '(编码字段)';
  }
  if (isPresetField(fieldName, ['whoNameList'])) {
    // who字段
    explanation += '(who字段)';
  }
  if (fieldType === 'VIRTUAL_FIELD') {
    // 虚拟字段
    explanation += '(虚拟字段)';
  }
  return explanation;
};

/**
 * 根据数据源字段推断其默认值
 * @param {Object} 数据源字段
 * @returns 默认值
 */
const getDefaultValue = ({ dataType }: { dataType: string }) => {
  let defaultValue: any = null;
  switch (dataType) {
    case 'Boolean': {
      defaultValue = true;
      break;
    }
    case 'Byte':
    case 'Short':
    case 'Integer':
    case 'Long':
    case 'Float':
    case 'Double':
    case 'BigDecimal': {
      defaultValue = 0;
      break;
    }
    case 'LocalDate': {
      defaultValue = moment().format('YYYY-MM-DD');
      break;
    }
    case 'ZonedDateTime': {
      defaultValue = moment().format('YYYY-MM-DD HH:mm:ss');
      break;
    }
    case 'String': {
      defaultValue = 'string';
      break;
    }
    default:
      break;
  }
  return defaultValue;
};
/**
 * 根据数据源字段列表生成Demo请求Json
 * @param {*} fieldList 数据源字段列表
 * @returns Demo请求Json
 */
export const getDemoDmlJsonText = (
  fieldList: model.data.BaseDataObjectField[] = [],
  requestType: string = 'update'
) => {
  const obj = {};
  fieldList.forEach((field) => {
    if (requestType === 'update') {
      // 更新/新增时不处理的字段
      // 关联字段不处理
      if (field.relationKey === 1) {
        return;
      }
      // 虚拟字段不处理
      if (field.dataType === 'VIRTUAL_FIELD') {
        return;
      }
      // WHO字段不处理
      if (
        isPresetField(field.fieldName, [
          'others',
          ['LAST_UPDATE_DATE', 'LAST_UPDATED_BY', 'CREATION_DATE', 'CREATED_BY'],
        ])
      ) {
        return;
      }
      // 租户ID不处理
      if (isPresetField(field.fieldName, ['TENANT_ID'])) {
        return;
      }
    } else if (requestType === 'delete') {
      // 更新/新增时不处理的字段
      // 只处理主键
      if (field.primaryFlag !== 1) {
        return;
      }
    }
    obj[field.aliasName] = getDefaultValue(field);
  });
  return JSON.stringify([obj]);
};

const APIConfig = new Map([
  [
    'delete',
    () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/executor/#dataObjectCode#/batch-delete`,
      method: 'DELETE',
    }),
  ],
  [
    'update',
    () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/executor/#dataObjectCode#/batch-update`,
      method: 'POST',
    }),
  ],
  [
    'page',
    () => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/executor/#dataObjectCode#/page`,
      method: 'GET',
    }),
  ],
  [
    'query',
    () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/executor/#dataObjectCode#/query`,
      method: 'GET',
    }),
  ],
  [
    'list',
    () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/executor/#dataObjectCode#/list`,
      method: 'GET',
    }),
  ],
  [
    'aggregation',
    () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/executor/#dataObjectCode#/aggregation`,
      method: 'GET',
    }),
  ],
]);
export default APIConfig;
