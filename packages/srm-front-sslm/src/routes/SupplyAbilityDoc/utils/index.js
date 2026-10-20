import React from 'react';
import { isNil, isEmpty, toString, isUndefined } from 'lodash';
import moment from 'moment';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

// 明细头标题
export const getHeaderTitle = status => {
  switch (status) {
    case 'create':
      return intl.get('sslm.supplyAbilityDoc.view.title.createApplication').d('新建供货能力申请单');
    case 'edit':
      return intl.get('sslm.supplyAbilityDoc.view.title.editApplication').d('编辑供货能力申请单');
    default:
      return intl.get('sslm.supplyAbilityDoc.view.title.viewApplication').d('查看供货能力申请单');
  }
};

// 获取采购方、供应商单元编码
export const getUnitCodeByRole = (purchaserFlag = true) => {
  let changeItemTableCode = '';
  let changeItemSearchCode = '';
  let batchEditFormCode = '';
  if (purchaserFlag) {
    changeItemTableCode = 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CHANGE_EXIST_TABLE';
    changeItemSearchCode = 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CHANGE_EXIST_SEARCH';
    batchEditFormCode = 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.BATCH_EDIT';
  } else {
    changeItemTableCode = 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CHANGE_EXIST_TABLE';
    changeItemSearchCode = 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CHANGE_EXIST_SEARCH';
    batchEditFormCode = 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.BATCH_EDIT';
  }
  return { changeItemTableCode, changeItemSearchCode, batchEditFormCode };
};

// 获取筛选器参数
export const getCommonParams = () => ({
  regionId: {
    computedProps: {
      disabled: ({ record }) => !record.get('countryId'),
      lovPara: ({ record }) => {
        const country = record.get('countryId') || {};
        const { countryId } = country;
        return {
          countryId,
        };
      },
    },
  },
  cityId: {
    computedProps: {
      disabled: ({ record }) => !record.get('regionId'),
      lovPara: ({ record }) => {
        const region = record.get('regionId') || {};
        const { regionId } = region;
        return {
          parentRegionId: regionId,
        };
      },
    },
  },
  itemCategoryId: {
    lovPara: {
      enabledFlag: 1,
      businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
    },
    optionsProps: {
      paging: 'server',
      idField: 'categoryId',
      parentIdField: 'parentCategoryId',
      record: {
        dynamicProps: {
          selectable: record => record.get('isCheck') !== false,
        },
      },
    },
  },
});

// 国家地区切换
export const hanldeCountryChange = ({ record, name } = {}) => {
  if (name === 'countryId') {
    record.set({
      regionId: null,
      cityId: null,
    });
  }
  if (name === 'regionId') {
    record.set({
      cityId: null,
    });
  }
};

// 获取筛选器组件组件属性
export const getCommonEditorProps = () => ({
  itemCategoryId: {
    onOption: ({ record: optionRecord }) => {
      return {
        disabled: optionRecord.get('isCheck') === false,
      };
    },
    tableProps: {
      onRow: ({ record }) => {
        const nodeProps = {};
        if (record.get('hasChild') === '0') {
          nodeProps.isLeaf = true;
        }
        return nodeProps;
      },
    },
  },
});

// 此处不能改成小红点展示，不然修改前展示内容有问题
export function formatYesOrNo(val) {
  return Number(val)
    ? intl.get('hzero.common.status.yes').d('是')
    : intl.get('hzero.common.status.no').d('否');
}

export const renderNode = ({ value, record, name, type, displayField }) => {
  const { changeFieldMap } = record.get(['changeFieldMap']);
  let redFlag = false;
  let toolTipText = '';
  let oldValue = null;
  let oldText = null;
  const dataKey = displayField || `${name}Meaning`;

  if (changeFieldMap) {
    oldValue = changeFieldMap[name];
    redFlag = isUndefined(oldValue) ? false : oldValue !== value;
    oldText = changeFieldMap[dataKey] || changeFieldMap[name];
  }
  let newText = record.get(dataKey) || value;

  if (record) {
    switch (type) {
      case 'date':
        newText = newText && moment(newText).format(DEFAULT_DATE_FORMAT);
        break;
      case 'CHECKBOX':
        newText = isNil(value) ? null : formatYesOrNo(value);
        oldText = isNil(oldValue) ? null : oldText || formatYesOrNo(oldValue);
        break;
      default:
        break;
    }
  }
  oldText = isNil(oldText) || isEmpty(oldText) ? '-' : toString(oldText);
  if (redFlag) {
    toolTipText = `${intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：')}${oldText}`;
  }
  return (
    <Tooltip placement="top" title={toolTipText}>
      <span style={{ color: redFlag && 'red' }}>
        {isNil(newText) || isEmpty(newText) ? '-' : newText}
      </span>
    </Tooltip>
  );
};

// 处理多选字段
export const getMultipleFieldProps = (isEdit = false) => {
  let props = {};
  if (isEdit) {
    props = {
      lovCode: 'SSLM.INV_ORGANIZATION',
      multiple: true,
      transformRequest: value =>
        isEmpty(value) ? null : value.map(n => n.organizationId).join(','),
      transformResponse: (value, data) => {
        const { inventoryOrganizationMeaning } = data;
        const inventoryOrganizationIdList = [];
        if (inventoryOrganizationMeaning) {
          Object.keys(inventoryOrganizationMeaning).forEach(key => {
            const obj = {
              organizationId: key,
              organizationName: inventoryOrganizationMeaning[key],
            };
            inventoryOrganizationIdList.push(obj);
          });
        }
        return inventoryOrganizationIdList;
      },
    };
  } else {
    props = {
      type: 'string',
    };
  }
  return props;
};

// 个性化字段变更标红
export const handleExtTextRenderIntercept = ({ name, record, value }, node) => {
  const { changeFieldMap } = record.get(['changeFieldMap']);
  let redFlag = false;
  let toolTipText = '';
  let oldValue = null;
  let oldText = null;

  if (changeFieldMap) {
    oldValue = changeFieldMap[name];
    redFlag = isUndefined(oldValue) ? false : oldValue !== value;
    oldText = changeFieldMap[`${name}Meaning`] || changeFieldMap[name];
  }
  oldText = isNil(oldText) || isEmpty(oldText) ? '-' : toString(oldText);
  if (redFlag) {
    toolTipText = `${intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：')}${oldText}`;
  }
  return (
    <Tooltip placement="top" title={toolTipText}>
      <span style={{ color: redFlag && 'red' }}>{node || '-'}</span>
    </Tooltip>
  );
};
