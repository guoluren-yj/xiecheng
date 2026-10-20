import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';

const organizationId = getCurrentOrganizationId();

const outsourcingBomDs = ({
  headerDs,
  lineRecord,
  type,
  readOnly,
  prLineId,
  custCode,
  ...others
}) => {
  return {
    autoQuery: false,
    pageSize: 20,
    paging: !(type === 'change' && !readOnly),
    selection: !readOnly ? 'multiple' : false,
    cacheSelection: true,
    cacheModified: true,
    primaryKey: 'prLineBomId',
    fields: [
      {
        name: 'lineNum',
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
      },
      {
        name: 'itemId',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        transformRequest: (value) => value?.itemId || value,
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        transformResponse(value, data) {
          if (value) {
            return {
              itemCode: data.itemCode,
              itemId: data.itemId,
            };
          } else {
            return null;
          }
        },
        dynamicProps: {
          lovPara() {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: headerDs?.current?.get('companyId'),
            };
            return params;
          },
        },
      },
      {
        name: 'itemCode',
        label: intl.get('entity.item.code').d('物料编码'),
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get('entity.item.name').d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        transformRequest: (value) => value?.categoryId,
        transformResponse(value, data) {
          if (value) {
            return {
              ...data,
              categoryId: data.categoryId,
              categoryName: data.categoryName,
            };
          } else {
            return null;
          }
        },
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        dynamicProps: {
          lovPara({ dataSet, record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              tiledFlag: 1,
              module: 'PR',
              purchaseOrgId: headerDs.current?.get('purchaseOrgId'),
              queryCategoryId: dataSet.parent?.current?.get('categoryId'),
              itemId: record.get('itemId')?.itemId,
              prTypeId: dataSet.parent?.current?.get('prTypeId'),
              businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER',
            };
          },
        },
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
      },
      {
        name: 'quantity',
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
        required: true,
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'uomId',
        type: 'object',
        lovCode: 'SMDM.DUAL_UOM_ID',
        label: intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        textField: 'uomCodeAndName',
        required: true,
        transformRequest: (value) => value?.uomId,
        transformResponse(value, data) {
          if (value) {
            return {
              ...data,
              uomCodeAndName: data.uomCodeAndName || data.uomName,
              uomId: data.uomId,
              uomCode: data.uomCode,
              uomPrecision: data.uomPrecision,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'uomCodeAndName',
        bind: 'uomId.uomCodeAndName',
      },
      {
        name: 'uomCodeAndName',
        bind: 'uomId.uomCodeAndName',
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        required: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              ouId: dataSet.parent?.current?.get('ouId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        transformRequest: (value) => value?.organizationId,
        transformResponse(value, data) {
          if (value) {
            return {
              ...data,
              organizationId: data.invOrganizationId,
              organizationName: data.invOrganizationName,
            };
          } else {
            return null;
          }
        },
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        required: true,
        min: moment('1970-01-01'),
        type: 'date',
      },
    ],
    transport: {
      read: ({ data }) => {
        if (prLineId) {
          const { itemId, quantity } = lineRecord.get(['itemId', 'quantity']);
          return {
            url:
              type === 'change'
                ? `${SRM_SPRM}/v1/${organizationId}/pr-line-bom/list-change`
                : `${SRM_SPRM}/v1/${organizationId}/pr-line-bom/list`,
            method: 'GET',
            data: {
              ...data,
              prLineId,
              prLineItemId: itemId,
              prLineQuantity: quantity,
              customizeUnitCode: custCode,
            },
          };
        }
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/pr-line-bom`,
          method: 'POST',
          data,
          params: { ...others, customizeUnitCode: custCode },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (type === 'change' && !readOnly) {
          // eslint-disable-next-line no-unused-expressions
          lineRecord?.set({ prLineBomList: dataSet.toData() });
          const { quantity } = lineRecord.get(['itemId', 'quantity']);
          dataSet.forEach((ele) => {
            if (ele.get('changeType') && ele.get('changeType') !== 'NEWLINE') {
              // eslint-disable-next-line no-param-reassign
              ele.selectable = false;
              ele.init('prLineQuantity', quantity);
            }
          });
        } else {
          const { quantity } = lineRecord.get(['quantity']);
          dataSet.forEach((ele) => {
            ele.init('prLineQuantity', quantity);
          });
        }
      },
      update: ({ record, name, value = {} }) => {
        if (name === 'itemId' && value) {
          const {
            itemCategoryId,
            itemName,
            itemCode,
            itemCategoryName,
            uomId,
            uomName,
            uomCode,
            uomPrecision,
          } = value || {};
          const uomCodeAndName = uomCode && uomName ? `${uomCode}/${uomName}` : uomName || uomCode;
          record.set({
            itemName,
            itemCode,
            categoryId: itemCategoryId
              ? { categoryId: itemCategoryId, categoryName: itemCategoryName }
              : null,
            uomId: uomId
              ? {
                  uomId,
                  uomName,
                  uomCode,
                  uomCodeAndName,
                  uomPrecision,
                }
              : null,
          });
        }
        if (name === 'quantity' && value) {
          const toFixedNum = (num, precision) =>
            new BigNumber(math.toFixed(num, Number(precision)));
          record.set({
            unitQuantity: toFixedNum(
              math.div(value, lineRecord?.get('quantity')),
              record?.get('uomPrecision') || 10
            ),
          });
        }
      },
    },
  };
};

export { outsourcingBomDs };
