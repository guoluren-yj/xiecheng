/**
 * 创建/补充物料
 */
import { runInAction } from 'mobx';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { ChineseReg } from '@/utils/constants';
import { Prefix } from '@/utils/globalVariable';

const promptCode = 'ssrc.inquiryHall';
const organizationId = getCurrentOrganizationId();
const chineseRegValidation = (value, name, record) => {
  if (ChineseReg.test(value)) {
    return intl
      .get(`${promptCode}.validation.notChinese`, {
        fieldLabel: record.dataSet && record.dataSet.getField(name).get('label'),
      })
      .d('{fieldLabel}不能为中文');
  } else {
    return true;
  }
};

// 提取 ds 公共配置
const generatorDataSetDefaultConfigs = (headerDs) => ({
  defaults: {
    // 默认配置
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    forceValidate: true,
    cacheModified: true,
    transport: {
      read({ dataSet: { queryParameter } }) {
        const { queryParams = {}, customizeUnitCode, sectionHeaderId } = queryParameter;
        const rfxHeaderId = sectionHeaderId || headerDs?.current?.get('rfxHeaderId');
        return {
          url: `${Prefix}/${organizationId}/rfx/items/${rfxHeaderId}/codeless`,
          method: 'GET',
          data: {
            rfxHeaderId,
            organizationId,
            ...queryParams,
            customizeUnitCode,
          },
        };
      },
      submit({ dataSet }) {
        const {
          queryParameter: {
            customizeUnitCode,
            commonData = {},
            checkPriceDTOLineList = [],
            sectionHeaderId,
          },
        } = dataSet;
        const rfxHeaderId = sectionHeaderId || headerDs?.current?.get('rfxHeaderId');
        const rfxLineItemList = (dataSet || []).map((record) => {
          return {
            ...record.toData(),
            checkFlag: Number(record.isSelected),
          };
        });
        const cachedModifiedData = (dataSet?.cachedModified || []).map((record) => {
          return {
            ...record.toData(),
            checkFlag: Number(record.isSelected),
          };
        });
        return {
          url: `${Prefix}/${organizationId}/rfx/item-snap/${rfxHeaderId}/codeless`,
          method: 'POST',
          data: {
            ...commonData,
            checkPriceDTOLineList,
            rfxLineItemList: [...rfxLineItemList, ...cachedModifiedData],
          },
          params: {
            customizeUnitCode,
          },
        };
      },
    },
  },
  fields: [
    {
      name: 'ouName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
    },
    {
      name: 'checkFlag',
      type: 'number',
    },
  ],
  events: {
    load({ dataSet }) {
      dataSet.forEach((record) => {
        // eslint-disable-next-line no-param-reassign
        record.isSelected = !!record.get('checkFlag');
      });
    },
    batchSelect({ records }) {
      runInAction(() => {
        records.forEach((record) => {
          record.set('checkFlag', 1);
        });
      });
    },
    batchUnSelect({ records }) {
      runInAction(() => {
        records.forEach((record) => {
          record.set('checkFlag', 0);
        });
      });
    },
  },
});

// 创建物料
const createItemDS = ({ headerDs, notSuggestRfxLineIds }) => {
  let shouldPreventDefaultQuery = false; // 阻止默认切换分页查询
  const { defaults, fields, events } = generatorDataSetDefaultConfigs(
    headerDs,
    notSuggestRfxLineIds
  );
  return {
    ...defaults,
    modifiedCheckMessage: {
      children: intl
        .get(`${promptCode}.view.message.changePaginationTips`)
        .d('切换分页自动保存变更数据, 是否继续?'),
      onOk: () => {
        shouldPreventDefaultQuery = true;
      },
    },
    fields: [
      {
        name: 'rfxLineItemNum',
        label: intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号'),
      },
      {
        name: 'itemCode',
        transformResponse: (val, record) => record.snapItemCode ?? val,
        maxLength: 500,
        validator: chineseRegValidation,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        type: 'string',
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategoryName`).d('物品分类'),
      },
      ...fields,
    ],
    events: {
      ...events,
      query() {
        if (shouldPreventDefaultQuery) {
          shouldPreventDefaultQuery = false;
          return false;
        }
      },
    },
  };
};

// 变更物料
const updateItemDS = ({ createItemFlag, headerDs, notSuggestRfxLineIds }) => {
  let shouldPreventDefaultQuery = false; // 阻止默认切换分页查询
  const { defaults, fields, events } = generatorDataSetDefaultConfigs(
    headerDs,
    notSuggestRfxLineIds
  );
  return {
    ...defaults,
    modifiedCheckMessage: {
      children: intl
        .get(`${promptCode}.view.message.changePaginationTips`)
        .d('切换分页自动保存变更数据, 是否继续?'),
      onOk: () => {
        shouldPreventDefaultQuery = true;
      },
    },
    fields: [
      {
        name: 'rfxLineItemNum',
        label: intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号'),
      },
      {
        name: 'itemCode',
        type: 'object',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          lovPara({ record }) {
            const { invOrganizationId, ouId } = record.get(['invOrganizationId', 'ouId']);
            return {
              companyId: headerDs?.current?.get('companyId'),
              invOrganizationId,
              ouId,
              asyncCountFlag: 'Y',
              from: 'RFX_CHECK_APPEND_ITEM_CODE',
              templateNum: headerDs?.current?.get('templateNum'),
            };
          },
        },
        required: createItemFlag === 3,
        transformResponse: (val, record) => ({
          itemCode: record.snapItemCode ?? val,
        }),
        transformRequest: (val) => val?.itemCode,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      },
      {
        name: 'itemId',
        transformResponse: (val, record) => record.snapItemId || val,
      },
      {
        name: 'itemName',
        disabled: true,
        transformResponse: (val, record) => record.snapItemName || val,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        disabled: true,
        transformResponse: (val, record) => record.snapItemCategoryName || val,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategoryName`).d('物品分类'),
      },
      {
        name: 'itemCategoryId',
        transformResponse: (val, record) => record.snapItemCategoryId || val,
      },
      ...fields,
    ],
    events: {
      ...events,
      query() {
        if (shouldPreventDefaultQuery) {
          shouldPreventDefaultQuery = false;
          return false;
        }
      },
      update: ({ record, name }) => {
        if (name === 'itemCode') {
          const itemCodeObj = record.get('itemCode');
          if (itemCodeObj) {
            record.set('itemId', itemCodeObj.partnerItemId);
            record.set('itemName', itemCodeObj.itemName);
            record.set('itemCategoryName', itemCodeObj.categoryName);
            record.set('itemCategoryId', itemCodeObj.categoryId);
          }
        }
      },
    },
  };
};

export { createItemDS, updateItemDS };
