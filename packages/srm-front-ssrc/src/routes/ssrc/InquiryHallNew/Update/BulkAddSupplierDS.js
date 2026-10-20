import intl from 'utils/intl';
import { uniqWith } from 'lodash';
import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';

const BulkAddSupplierDS = () => {
  return {
    primaryKey: 'companyId',
    autoQuery: false,
    dataToJSON: 'selected',
    cacheSelection: true,
    selection: 'multiple',
    pagesize: 20,
    queryFields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        name: 'itemCategoryIds',
        type: 'object',
        multiple: true,
        lovCode: 'SMDM.TREE_ITEM_CATEGORY',
        optionsProps: {
          childrenField: 'children',
        },
        transformRequest: (value = {}) => {
          const categoryIds = [];
          if (value.length > 0) {
            value.forEach((item) => {
              categoryIds.push(item.categoryId);
            });
          }
          return categoryIds.length > 0 ? categoryIds : null;
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'categoryId',
        lovCode: 'SSLM.SUPPLIER_CATEGORY',
        type: 'object',
        lovPara: {
          isCategoryEnabledFlag: 1,
        },
        valueField: 'categoryId',
        transformRequest: (value = {}) => {
          return value ? value.categoryId : null;
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageId',
        type: 'string',
        lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'queryItemIds',
        type: 'object',
        lovCode: 'SMDM.CUSTOMER_ITEM',
        multiple: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              invOrganizationId: record.get('invOrganizationId') || null,
              ouId: record.get('ouId') || null,
            };
          },
        },
        transformRequest: (value = {}) => {
          const queryItemIds = [];
          if (value.length > 0) {
            value.forEach((item) => {
              queryItemIds.push(item.itemId);
            });
          }
          return queryItemIds.length > 0 ? queryItemIds : null;
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.registeredCapitalTenThousand`)
          .d('注册资本(万)'),
        name: 'registeredCapital',
        type: 'number',
        min: 0.0000001,
        defaultValue: null,
      },
    ],
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        type: 'string',
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.certified`).d('通过启信宝认证'),
      //   name: 'passedQiXinBao',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
        type: 'string',
      },
    ],
    transport: {
      read: ({ dataSet, params, data }) => {
        const { itemCategoryIds, queryItemIds, ...restSearchParams } = data;
        const itemCategoryIdString = JSON.stringify(itemCategoryIds);
        const queryItemIdString = JSON.stringify(queryItemIds);
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, userId, companyId } = commonProps || {};
        if (!companyId || !userId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers/lovForSupplier`,
          method: 'GET',
          data: {
            ...params,
            itemCategoryIdString,
            queryItemIdString,
            ...restSearchParams,
            ...commonProps,
            organizationId,
            companyId,
            userId,
          },
        };
      },
    },
  };
};

const SupplierBulkExpiredModalDS = () => {
  return {
    primaryKey: 'index',
    autoQuery: false,
    selection: 'multiple',
    dataToJSON: 'selected',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        name: 'attachmentDesc',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        name: 'expirationDate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
      },
    ],
  };
};

// 供应商筛选物料ds
const SupplierFilterItemDS = (options = {}) => {
  const { sourceKey } = options;
  return {
    primaryKey: 'rfxLineItemId',
    paging: true,
    cacheSelection: true,
    cacheModified: true,
    dataToJSON: 'all',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.miniMumPrice`).d('最低限价'),
        name: 'minLimitPrice',
        type: 'number',
        min: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxiMumPrice`).d('最高限价'),
        name: 'maxLimitPrice',
        type: 'number',
        // min: 'minLimitPrice',
        validator: (value, name, record) => {
          const minValue = record.get('minLimitPrice');
          if ((value || value === 0) && value <= minValue) {
            return intl
              .get('ssrc.inquiryHall.view.inquiryHall.validate.maxLimitPrice', {
                minValue,
              })
              .d(`最高限价必须大于${minValue}。`);
          }
          return true;
        },
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
      //   name: 'inviteFlag',
      //   type: 'boolean',
      //   trueValue: 1,
      //   falseValue: 0,
      //   defaultValue: 1,
      // },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps || {};

        return {
          url: `${Prefix}/${organizationId}/rfx/item-sup-assign/items`,
          method: 'GET',
          data: {
            ...commonProps,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEM_SUP_ASSIGN`,
          },
        };
      },
    },
    events: {
      update: ({ record, name }) => {
        if (name === 'minLimitPrice') {
          // 设置自身 为了触发自定义校验
          record.set('maxLimitPrice', record.get('maxLimitPrice'));
        }
      },
      load: ({ dataSet }) => {
        if (!dataSet) return;
        const selectDataListIds = new Set(dataSet.getState('selectDataListIds') || []);
        // const unSelectDataListIds = new Set(dataSet.getState('unSelectDataListIds') || []);
        const selectAllManually = dataSet.getState('selectAllManually');
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const unSelectDataListIds = new Set(
          cacheUnSelectedRecords.map((record) => record.get('rfxLineItemId')) || []
        ); // 未选中ids

        dataSet.forEach((record) => {
          if (selectAllManually === 0) {
            if (selectDataListIds.has(record.data.rfxLineItemId)) {
              Object.assign(record, { isSelected: true });
            }
          } else if (selectAllManually === 1) {
            if (!unSelectDataListIds.has(record.data.rfxLineItemId)) {
              Object.assign(record, { isSelected: true });
            }
          } else if (
            (selectDataListIds.size === 0 && unSelectDataListIds.size === 0) ||
            (!selectDataListIds.has(record.data.rfxLineItemId) &&
              !unSelectDataListIds.has(record.data.rfxLineItemId))
          ) {
            if (record.data.inviteFlag) {
              Object.assign(record, { isSelected: true });
            } else {
              Object.assign(record, { isSelected: false });
            }
          } else if (selectDataListIds.has(record.data.rfxLineItemId)) {
            Object.assign(record, { isSelected: true });
          }
        });
      },
      // 先这样写 手动记下未选择记录  因为ds.unSelected(目前只能拿到当前页数据)
      // 如果后续平台修复了，再修改回来，把注释的放开，把下面选中记录删掉 然后在提交地方获取unSelected数据
      batchSelect: ({ dataSet, records: selectRecords }) => {
        // 选中的ids
        const selectDataListIds = dataSet.getState('selectDataListIds') || [];
        const currentSelectedIds = selectRecords.map((record) => record.get('rfxLineItemId'));
        dataSet.setState('selectDataListIds', [...selectDataListIds, ...currentSelectedIds]);

        // 未选中的ids
        // const unSelectDataListIds = dataSet.getState('unSelectDataListIds') || []; // 未选中ids
        const setCurrentSelectedIds = new Set(currentSelectedIds);
        // 剔除勾选的
        // const diffCurrentUnSelectedIds = unSelectDataListIds.filter(unSelIds => !setCurrentSelectedIds.has(unSelIds));
        // dataSet.setState('unSelectDataListIds', diffCurrentUnSelectedIds);

        // 未选中记录
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const diffUnSelectedRecords = cacheUnSelectedRecords.filter(
          (record) => !setCurrentSelectedIds.has(record.get('rfxLineItemId'))
        );
        dataSet.setState('cacheUnSelectedRecords', diffUnSelectedRecords);
      },
      batchUnSelect: ({ dataSet, records: unSelectedRecords }) => {
        // 选中的ids
        const selectDataListIds = dataSet.getState('selectDataListIds') || [];
        const currentUnSelectedIds = unSelectedRecords.map((record) => record.get('rfxLineItemId'));
        // 剔除去掉勾掉选中的
        const setCurrentUnSelectedIds = new Set(currentUnSelectedIds);
        const diffCurrentSelectedIds = selectDataListIds.filter(
          (selIds) => !setCurrentUnSelectedIds.has(selIds)
        );
        dataSet.setState('selectDataListIds', diffCurrentSelectedIds);

        // 未选中的ids
        // const unSelectDataListIds = dataSet.getState('unSelectDataListIds') || []; // 未选中ids
        // dataSet.setState('unSelectDataListIds', [...unSelectDataListIds, ...currentUnSelectedIds]);

        // 未选中记录
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const newUnselectedRecords = uniqWith(
          [...cacheUnSelectedRecords, ...unSelectedRecords],
          (arrVal, othVal) => arrVal.get('rfxLineItemId') === othVal.get('rfxLineItemId')
        );
        dataSet.setState('cacheUnSelectedRecords', newUnselectedRecords);
      },
      unSelectAllPage: ({ dataSet }) => {
        // 取消全选设置标志
        dataSet.setState('selectAllManually', 0);

        const { currentUnSelected } = dataSet;
        const currentUnSelectedIds = currentUnSelected.map((record) => record.get('rfxLineItemId'));
        dataSet.setState('selectDataListIds', []);
        dataSet.setState('unSelectDataListIds', currentUnSelectedIds);
        dataSet.setState('cacheUnSelectedRecords', currentUnSelected);
      },
      selectAllPage: ({ dataSet }) => {
        // 全选设置标志
        dataSet.setState('selectAllManually', 1);

        const { currentSelected } = dataSet;
        const currentSelectedIds = currentSelected.map((record) => record.get('rfxLineItemId'));
        dataSet.setState('selectDataListIds', currentSelectedIds);
        // dataSet.setState('unSelectDataListIds', []);
        dataSet.setState('cacheUnSelectedRecords', []);
      },
      reset: ({ dataSet }) => {
        dataSet.setAllPageSelection(false);
        dataSet.setState('selectDataListIds', []);
        // dataSet.setState('unSelectDataListIds', []);
        dataSet.setState('selectAllManually', undefined);
        dataSet.setState('cacheUnSelectedRecords', []);
      },
    },
  };
};

// 供应商筛选标段ds
const SupplierFilterSectionDS = (options = {}) => {
  const { sourceKey } = options;
  return {
    primaryKey: 'rfxLineItemId',
    paging: true,
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionCode`).d('标段编码'),
        name: 'sectionCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
        name: 'sectionName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remark`).d('备注'),
        name: 'sectionRemark',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        name: 'inviteFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps || {};
        return {
          url: `${Prefix}/${organizationId}/rfx/item-sup-assign/sections`,
          method: 'GET',
          data: {
            ...commonProps,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION.LINE`,
          },
        };
      },
    },
  };
};

export {
  BulkAddSupplierDS,
  SupplierBulkExpiredModalDS,
  SupplierFilterItemDS,
  SupplierFilterSectionDS,
};
