import { isEmpty, isNil, difference, xorBy } from 'lodash';
import { getResponse } from 'utils/utils';

import { getClearLogic } from '@/services/quickInquiryService.js';

// 清除物料相关信息
function clearItemFiled(value = {}, record) {
  if (isEmpty(value)) return;
  const { ouIdRemoveFlag = 0, invOrganizationIdRemoveFlag = 0, itemIdRemoveFlag = 0 } = value || {};
  if (ouIdRemoveFlag) {
    // eslint-disable-next-line no-unused-expressions
    record?.set({
      ouId: {
        ouId: null,
        ouName: null,
      },
    });
  }
  if (invOrganizationIdRemoveFlag) {
    // eslint-disable-next-line no-unused-expressions
    record?.set({
      invOrganizationId: {
        organizationId: null,
        organizationName: null,
      },
    });
  }
  if (itemIdRemoveFlag) {
    // eslint-disable-next-line no-unused-expressions
    record?.set({
      itemId: {
        itemId: null,
        itemCode: null,
      },
      itemName: null,
      itemCategoryId: {
        categoryId: null,
        categoryName: null,
      },
      secondaryUomId: {
        uomId: null,
        uomName: null,
      },
      uomId: {
        uomId: null,
        uomName: null,
      },
      brand: null,
      specs: null,
    });
  }
}

/**
 * 操作单个物料行
 * 传参公司id 业务实体id 库存组织id 物料id
 * 根据返回RemoveFlag 判断是否清除对应信息
 */
export function isClearMaterial({ record = {}, basicFormDs }) {
  const companyId = getCompanyId({ record, basicFormDs });
  const { ouId, invOrganizationId, itemId } =
    record.get(['ouId', 'invOrganizationId', 'itemId']) || {};
  const judgeParams = {
    companyId,
    ouId: ouId?.ouId,
    invOrganizationId: invOrganizationId?.organizationId,
    itemId: itemId?.itemId,
  };
  getClearLogic(judgeParams).then((res) => {
    const result = getResponse(res);
    if (result) {
      clearItemFiled(result, record);
    }
  });
}

/**
 * 批量更新数据
 * @param {object} payload
 * {
 *   batchBodyItem - 批量编辑框中的ds数据
 *   itemLineDS - 物料行DS
 * }
 * allBatchEditFlag 全量编辑1/批量编辑0/初始化为-1
 */
export function batchUpdateLines(payload = {}) {
  const { itemLineDS, allBatchEditFlag } = payload;

  let itemLines = [];
  if (allBatchEditFlag !== 1) {
    // 批量编辑则只处理勾选数据
    itemLines = itemLineDS?.selected || [];
  } else {
    itemLines = [...(itemLineDS?.cachedRecords || []), ...(itemLineDS?.records || [])];
  }

  itemLines.forEach((record) => {
    updateItemSpecial({ record, ...payload });
  });
}

// 批量维护物料行更新数据
function updateItemSpecial(params = {}) {
  const { batchBodyItem = {}, record = {} } = params;
  if (isEmpty(record)) return;
  const keys = Object.keys(batchBodyItem);

  keys.forEach((key) => {
    const value = batchBodyItem[key];
    if (!key || key === '__dirty') {
      return;
    }
    updateFiledData({ key, value, ...params });
  });
}

// 批量更新物料行数据
function updateFiledData({ key, value = null, record }) {
  if (isNil(value)) return;

  if (!isEdit({ record, key })) return;
  record.set(key, value);
}

// 行上如果字段不能编辑，批量编辑不更新值
function isEdit({ record, key }) {
  const currentField = record.getField(key);
  if (!currentField) return false;
  const disabledFlag = currentField.get('disabled');
  const readOnlyFlag = currentField.get('readOnly');
  const disabledBatchFlag = disabledFlag || readOnlyFlag;
  if (disabledBatchFlag) {
    return false;
  }
  return true;
}

// 获取公司id
export function getCompanyId({ record, basicFormDs }) {
  if (isEmpty(record) && isEmpty(basicFormDs)) return;
  // 优先取物料行上companyId 再其次头上companyId
  return record?.get('companyId')?.companyId || basicFormDs?.current?.get('companyId')?.companyId;
}

// 更新拓展库存组织逻辑
export function updateExpandInvOrganizationFiled({
  value = [],
  oldValue = [],
  record = {},
  sourceResultsData = [],
}) {
  if (isEmpty(record)) return;
  // 清除对应公司下的库存组织
  // 删除操作(小删除和大清除)
  const { expandInvOrganization = [] } = record?.get(['expandInvOrganization']) || {};
  // 大清除
  if (value === null) {
    record.set({
      expandInvOrganization: [],
    });
  } else if (value?.length < oldValue?.length) {
    // 小删除
    // sourceResultsData关联关系为空 不作匹配
    if (isEmpty(sourceResultsData)) return;
    const differenceKey = ((xorBy(value, oldValue, 'companyId') || [])?.[0] || {})?.companyId;
    const expandInvOrganizationIds = expandInvOrganization?.map((i) => i.organizationId);
    const invOrganizationIds =
      sourceResultsData?.find((i) => i.companyId === differenceKey)?.invOrganizationIds || [];
    const differenceIds = difference(expandInvOrganizationIds, invOrganizationIds) || [];

    const _expandInvOrganization =
      expandInvOrganization?.filter((i) => differenceIds.includes(i.organizationId)) || [];
    record.set({
      expandInvOrganization: _expandInvOrganization,
    });
  }
}
