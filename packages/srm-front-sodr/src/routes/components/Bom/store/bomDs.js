import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

const computedUnitQuantity = (record) => {
  const { quantity, unitQuantityUpdateFlag, historicalLineQuantity, unitQuantity } = record.get([
    'quantity',
    'unitQuantityUpdateFlag',
    'historicalLineQuantity',
    'unitQuantity',
  ]);
  const originUnitQuantity =
    unitQuantityUpdateFlag === 1
      ? historicalLineQuantity
        ? math.div(quantity, historicalLineQuantity)
        : 0
      : unitQuantity;
  return originUnitQuantity;
};

const bom = ({ isChange, code, quantity: orderQuantity, remote, readOnly }) => {
  return {
    paging: !isChange,
    dataToJSON: 'all',
    primaryKey: 'poItemBomId',
    cacheSelection: true,
    cacheModified: true,
    pageSize: 20,
    fields: [
      {
        name: 'orderSeq',
        label: intl.get(`sodr.workspace.model.common.orderSeq`).d('序号'),
      },
      {
        name: 'itemId',
        label: intl.get(`sodr.workspace.model.common.itemCode`).d('物料编码'),
        type: 'object',
        lovCode: 'SPUC.ITEM_PRICE_CODE',
        textField: 'itemCode',
        transformResponse: (value, object) => {
          return object?.itemId
            ? {
                itemId: object?.itemId,
              }
            : null;
        },

        transformRequest: (value) => {
          return value?.itemId;
        },
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      // {
      //   name: 'itemId',
      //   bind: 'itemLov.itemId',
      // },
      {
        name: 'itemName',
        required: true,
        label: intl.get(`sodr.workspace.model.common.itemName`).d('物料名称'),
        bind: 'itemId.itemName',
      },
      {
        name: 'categoryId',
        label: intl.get(`sodr.workspace.model.common.categoryLov`).d('物料类别'),
        type: 'object',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL',
        lovPara: {
          businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
        },
        optionsProps: {
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformResponse: (value, object) =>
          object?.categoryId
            ? {
                categoryId: object?.categoryId,
              }
            : null,
        transformRequest: (value) => {
          return value?.categoryId;
        },
      },
      // {
      //   name: 'categoryId',
      //   bind: 'categoryLov.categoryId',
      // },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
      },
      {
        name: 'quantity',
        required: true,
        label: intl.get(`sodr.workspace.model.common.demandQuantity`).d('需求数量'),
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('uomPrecision'),
          disabled: !!orderQuantity,
        },
      },
      {
        name: 'uomId',
        required: true,
        label: intl.get(`sodr.workspace.model.common.uomId`).d('单位'),
        type: 'object',
        lovCode: 'SMDM.UOM',
        transformResponse: (value, object) =>
          object?.uomId
            ? {
                uomId: object?.uomId,
              }
            : null,
        transformRequest: (value) => {
          return value?.uomId;
        },
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        name: 'uomCode',
        bind: 'uomId.uomCode',
      },
      {
        name: 'uomCodeAndName',
        bind: 'uomId.uomCodeAndName',
      },
      {
        name: 'uomPrecision',
        bind: 'uomId.uomPrecision',
      },
      {
        name: 'invOrganizationId',
        required: true,
        label: intl.get(`sodr.workspace.model.common.invOrganization`).d('收货组织'),
        type: 'object',
        lovCode: 'SPUC.SMDM.INV_ORG',
        transformResponse: (value, object) =>
          object?.invOrganizationId
            ? {
                organizationName: object?.invOrganizationName,
                organizationId: object?.invOrganizationId,
              }
            : null,
        transformRequest: (value) => value?.organizationId,
      },
      // {
      //   name: 'invOrganizationId',
      //   bind: 'invOrganizationLov.organizationId',
      // },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'needByDate',
        label: intl.get(`sodr.workspace.model.common.needByDate`).d('需求日期'),
        type: 'date',
      },
      {
        name: 'cancelledFlag',
        label: intl.get(`sodr.workspace.model.common.cancelledFlag`).d('是否取消'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'splQuantity',
        transformRequest: () => orderQuantity,
      },
      {
        name: 'historicalLineQuantity',
        type: 'number',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: readOnly
            ? `${SRM_SPUC}/v1/${organizationId}/po-item-boms/query`
            : isChange
            ? `${SRM_SPUC}/v1/${organizationId}/po-item-boms/change`
            : `${SRM_SPUC}/v1/${organizationId}/po-item-boms/pending`,
          method: readOnly ? 'GET' : 'POST',
          data,
          params: { ...params, customizeUnitCode: code },
        };
      },
      destroy: isChange // 变更页面仅前端删除
        ? undefined
        : () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms/delete`,
              method: 'DELETE',
            };
          },
      submit: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms/maintain`,
          method: 'PUT',
        };
      },
    },
    events: {
      load({ dataSet }) {
        if (isChange) {
          // 前端缓存的新增行bom信息没有序号 重新打开需要保留新增行标识
          dataSet.forEach((i) => {
            const { historicalLineQuantity } = i.get(['historicalLineQuantity']);
            if (!i.get('orderSeq')) {
              Object.assign(i, { status: 'add' });
            }
            if (historicalLineQuantity !== orderQuantity) {
              const computedQuantity = math.multipliedBy(
                remote
                  ? remote.process('transformBomUnitQuantity', computedUnitQuantity(i), {
                      record: i,
                    })
                  : computedUnitQuantity(i),
                orderQuantity
              );
              i.init({
                quantity: remote
                  ? remote.process('transformBomQuantity', computedQuantity, { record: i })
                  : computedQuantity,
              });
            }
          });
        }
      },
      update: ({ name, value, record }) => {
        if (name === 'itemId') {
          const {
            itemId,
            itemCode,
            itemName,
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
            uomPrecision,
            categoryId,
            categoryName,
          } = value || {};
          const itemObj = itemId ? { itemId, itemCode, itemName } : null;
          const uomObj = uomId
            ? {
                uomId,
                uomCode,
                uomName,
                uomCodeAndName,
                uomPrecision,
              }
            : null;
          record.set({
            itemId: itemObj,
            uomId: uomObj,
            categoryId: categoryId ? { categoryId, categoryName } : undefined,
          });
        }
        if (name === 'quantity') {
          const { unitQuantityUpdateFlag } = record.get(['unitQuantityUpdateFlag']);
          const bomQuantityUpdateFlag = Number(value !== record.getPristineValue('quantity'));
          record.set({
            bomQuantityUpdateFlag,
            unitQuantityUpdateFlag: unitQuantityUpdateFlag || bomQuantityUpdateFlag,
          });
        }
      },
    },
  };
};

export { bom, computedUnitQuantity };
