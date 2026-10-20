import React from 'react';
import { Tag } from 'choerodon-ui';
// import classnames from 'classnames';
import { isArray } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';

// tag颜色
export function colorRender(value, meaning) {
  if (!value) return;

  if (['NEW', 'EDIT_APPROVING', 'EDIT', 'APPROVING'].includes(value)) {
    // 橘色
    return <Tag color="yellow" style={{ border: 'none' }}>{meaning}</Tag>;
  }
  if (['APPROVED'].includes(value)) {
    // 绿色
    return <Tag color="green" style={{ border: 'none' }}>{meaning}</Tag>;
  }
  if (['REJECT', 'EDIT_REJECT'].includes(value)) {
    // 红色
    return <Tag color="red" style={{ border: 'none' }}>{meaning}</Tag>;
  } else {
    // 蓝色
    return <Tag color="gray" style={{ border: 'none' }}>{meaning}</Tag>;
  }
}
/**
 * 获取预算编制动态字段属性
 * @param {} item
 */
export function getBugetFieldsConfig(item) {
  const {
    queryFlag = 0, // 是否作为查询条件
    requiredFlag = 0, // 是否必输
    componentType = 'LOV', // 组件类型
    multipleFlag = 0, // 是否多选
    valueField, // 值字段
    budgetItemCode = '', // 字段名
    budgetItemName, // 列名
    gridSeq = 0, // 位置
    gridWidth = '240', // 列宽
    displayField,
  } = item;
  const label = budgetItemName;
  const name = budgetItemCode;
  let gridField = {};
  let queryField = {};
  const columnsConfig = {
    name,
    width: gridWidth,
    gridSeq,
  };

  switch (componentType) {
    case 'LOV':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'object',
          valueField,
          textField: displayField,
          required: Number(requiredFlag) === 1,
          lovCode,
          multiple: Number(multipleFlag) === 1,
          dynamicProps: {
            lovPara: ({ record }) => {
              const { companyId } = record.toData();
              // if (name === 'budgetAccountNum') {
              // 都需要公司Id
              return {
                tenantId: getCurrentOrganizationId(),
                companyId,
              };
            },
          },
          transformRequest: value => {
            return multipleFlag
              ? (value || []).map(v => v[valueField]).join(',')
              : (value || {})[valueField];
          },
          transformResponse: (value, object) => {
            if (value) {
              return multipleFlag
                ? (value?.split(',') || []).map((v, index) => {
                  return {
                    [displayField]: (object[`${name}Meaning`]?.split(',') || [])[index],
                    [valueField]: v,
                  };
                })
                : {
                  [displayField]: object[`${name}Meaning`],
                  [valueField]: value,
                };
            } else {
              return null;
            }
          },
        };

        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'object',
            lovCode,
            multiple: false,
            queryFlag: true,
            transformRequest: value => (value ? value[valueField] : null),
            dynamicProps: {
              lovPara: () => ({
                tenantId: getCurrentOrganizationId(),
              }),
            },
          };
        }
      }
      break;
    case 'SELECT':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'string',
          lookupCode: lovCode,
          multiple: Number(multipleFlag) === 1,
          required: Number(requiredFlag) === 1,
          transformRequest: value => (isArray(value) ? (value || []).join(',') : value),
          transformResponse: value => {
            if (value) {
              return value?.split(',') || [];
            } else {
              return null;
            }
          },
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'string',
            queryFlag: true,
            lookupCode: lovCode,
            multiple: false,
          };
        }
      }
      break;
    default:
      gridField = {
        name,
        label,
        type: 'string',
        required: Number(requiredFlag) === 1,
      };
      if (queryFlag) {
        queryField = {
          name,
          label,
          type: 'string',
        };
      }
      break;
  }

  return {
    gridField,
    queryField,
    columnsConfig,
  };
}
