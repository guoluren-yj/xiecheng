import type Field from 'choerodon-ui/dataset/data-set/Field';
import { filterNullValueObject } from 'utils/utils';
import { isObject, camelCase, isArray } from 'lodash';
import { DimensionType } from './BasicConfiguration/utils/type';




export interface SelfField
{
  field: Field,
  fieldCode: string
}

export interface SelfColumn
{
  name: string,

}


/**
 *
 * @param configFieldsArr
 * @param fieldCode 前端定义的字段名
 * 累计、适用维度：配置项中有6个字段，前端只有3个字段,并且字段名并不对应，需要区分开来
 * 配置项：['APPLICATION_DIMENSION_RANGE','APPLICATION_SPECIFIC_VALUE','APPLICATION_DIMENSION_VALUE','CUMULATIVE_DIMENSION_RANGE','CUMULATIVE_SPECIFIC_VALUE','CUMULATIVE_DIMENSION_VALUE']
 * 前端定义的字段:['dimensionCode','dimensionOperation','dimensionValue']
 */
// dimensionType区分适用维度和累计维度
export const getConfigByFeildCode = (configFieldsArr, fieldCode, dimensionType?: DimensionType) =>
{
  // 值集有可能是xxxLov结束，而配置项返回的字段没有Lov,需要另外处理
  const configFieldsList = isArray(configFieldsArr) ? configFieldsArr : [];
  return configFieldsList.find(field =>
  {
    const { scenarioInfoType } = field || {};
    const DimensionScenarioTypeMap = {
      [DimensionType.apply]: {
        'dimensionCode': 'APPLICATION_DIMENSION_RANGE',
        'dimensionOperation': 'APPLICATION_SPECIFIC_VALUE',
        'dimensionValue': 'APPLICATION_DIMENSION_VALUE',
      },
      [DimensionType.cumulative]: {
        'dimensionCode': 'CUMULATIVE_DIMENSION_RANGE',
        'dimensionOperation': 'CUMULATIVE_SPECIFIC_VALUE',
        'dimensionValue': 'CUMULATIVE_DIMENSION_VALUE',
      },
    };
    if (dimensionType)
    {
      // 累计、适用维度
      return DimensionScenarioTypeMap[dimensionType][fieldCode] === scenarioInfoType;

    } else
    {
      // 获取配置中的fieldCode
      const configFieldCode = camelCase(scenarioInfoType);

      let newFieldCode = fieldCode;
      // console.log('fieldCode', fieldCode)
      if (fieldCode.length > 3 && /Lov$/.test(fieldCode))
      {
        // fieldCode去掉Lov
        newFieldCode = fieldCode.slice(0, -3);
      }
      return configFieldCode === newFieldCode;
    }
  }) || {};

};

// 修改某个字段的属性
export const editFieldProps = (field: Field, newProps = {}) =>
{
  Object.keys(newProps).forEach((propsName) =>
  {
    field.set(propsName, newProps[propsName]);
  });
};

// 获取表单/表格定义的columns一行中的name--fieldCode
export const getFieldCode = (column) =>
{
  let name = '';
  if (isObject(column))
  {
    // eslint-disable-next-line prefer-destructuring
    name = (column as SelfColumn).name;
  } else
  {
    name = column;
  }
  return name;
};

// 表单/表格显示的字段
// dimensionType：用于区分适用范围和累计维度(通过dimensionType区分)
export const setNewDisplayColumns = (columns: any[], configFieldsArr, dimensionType?: DimensionType) =>
{
  let newColumns = columns;
  if (configFieldsArr.length > 0)
  {
    // 1.过滤不能显示的字段
    newColumns = columns.filter(column =>
    {
      // 获取字段原来是否可显示
      const { visible = true } = isObject(column) ? column as { visible } : {};
      // 字段，字段编码
      const fieldCode = getFieldCode(column);
      // 接口返回的新的字段属性的配置项
      const newFieldProps = getConfigByFeildCode(configFieldsArr, fieldCode, dimensionType);
      const {
        displayFlag = 1, // 是否展示,默认展示
      } = newFieldProps;
      return displayFlag === 1 && visible;
    });

  }

  return newColumns;

};

// 表单/表格字段列表属性更新
// dimensionType：用于区分适用范围和累计维度(通过dimensionType区分)
/**
 *
 * @param columns 表单/表格字段列表
 * @param dataSet
 * @param configFieldsArr
 * @returns
 */
export const setNewColumnsProps = (columns: any[], dataSet, configFieldsArr, dimensionType?: DimensionType) =>
{
  // // 1.过滤不能显示的字段
  // const newColumns = setNewDisplayColumns(columns, configFieldsArr, dimensionType);
  // 1.给字段赋值新的属性(必输，标签和禁用)
  columns.forEach(newColumn =>
  {
    // 获取字段原来是否可显示
    const { visible = true, aliasFieldName = '' } = isObject(newColumn) ? newColumn as { visible, aliasFieldName } : {};
    // 字段，字段编码
    const fieldCode = getFieldCode(newColumn);
    const field = dataSet?.getField(fieldCode);
    if (field)
    {
      // 标签
      const oldLabel = field?.get('label');
      // 接口返回的新的字段属性的配置项,根据接口返回的去匹配，如果有aliasFieldName，则使用aliasFieldName
      const matchCode = aliasFieldName || fieldCode;
      const newFieldProps = getConfigByFeildCode(configFieldsArr, matchCode, dimensionType);
      const {
        displayFlag = 1, // 是否展示
        requiredFlag, // 是否必输
        editFlag = 1, // 是否编辑，默认编辑
        displayName, // 字段别名
        // defaultValue, // 默认值
        scenarioInfoTypeMeaning, // 字段描述
        bubblePrompt,
      } = newFieldProps;

      const isShow = visible && displayFlag; // 确定字段是否显示
      const newProps = filterNullValueObject({
        label: displayName || scenarioInfoTypeMeaning || oldLabel, // 若配置项里面没有设置字段别名，则用代码里面写的label
        required: isShow && requiredFlag,
        disabled: isShow && !editFlag,
        help: isShow && !dimensionType && bubblePrompt ? bubblePrompt : undefined,
        bubblePrompt, // 自定义气泡属性值
        // defaultValue
      });

      // console.log('requiredFlag', fieldCode, requiredFlag, isShow && !editFlag, visible)
      // 给字段赋上新的属性
      editFieldProps(field, newProps);
    }
  });
  // 2.过滤不能显示的字段
  const newColumns = setNewDisplayColumns(columns, configFieldsArr, dimensionType);

  return newColumns;

};
