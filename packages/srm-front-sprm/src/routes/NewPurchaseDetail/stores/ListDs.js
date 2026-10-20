import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import moment from 'moment';
import { isFunction, isNumber } from 'lodash';
import { NOT_CHINA_PHONE } from 'utils/regExp';
import { fetchCategory, fetchQuantity } from '@/services/purchaseRequisitionCreationService';
import { amountFormatterOptions } from '@/routes/utils';
import { getResponse, getCurrentUser } from 'utils/utils';

import { math } from 'choerodon-ui/dataset';
// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

export default ({
  code,
  addLineDsFlag,
  source,
  urlflagIf,
  prHeaderId,
  pubPathFlag,
  organizationId,
  backViodPageFlag,
  customizeUnitCode,
  uomCodeAndNameRule = [],
  uomControl,
  setLineCompanyId,
  handleLineChange,
  cuxListField,
  limitAttr = (e) => e,
  cuxQueryUrl,
  updateLineInvOrganization,
  cuxQueryPageLineUrl,
  id, // 工作流审批的businessKey
  remote,
  location,
}) => {
  const precisionType = !urlflagIf && source === 'inquery' ? 'formatterOptions' : 'precision';
  return {
    pageSize: 20,
    autoQuery: false,
    selection: !backViodPageFlag ? 'multiple' : false,
    cacheSelection: true,
    cacheModified: true,
    primaryKey: 'displayLineNum',
    forceValidate: true,
    transport: {
      read: ({ data }) => {
        const { shieldedLineIds } = data;
        const cuxQueryUrlObj = isFunction(cuxQueryUrl)
          ? cuxQueryUrl({
              data,
              addLineDsFlag,
              prHeaderId,
              pubPathFlag,
              customizeUnitCode,
              id,
            })
          : null;
        const cuxQuery = isFunction(cuxQueryPageLineUrl)
          ? cuxQueryPageLineUrl({ code, customizeUnitCode, prHeaderId, id })
          : {};
        const { cuxParams = {} } = cuxQuery || {};
        let searchCode = customizeUnitCode ? `${customizeUnitCode}_SEARCHBAR` : '';
        if (customizeUnitCode && customizeUnitCode.startsWith('SPRM.PURCHASE_PLAFORM_CANCEL')) {
          searchCode = 'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE_SEARCHBAR';
        }
        return (
          cuxQueryUrlObj || {
            url:
              cuxQuery?.url ||
              `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines`,
            data: {
              ...data,
              closedFlag: [
                'SPRM.PR_ERP_CLOSE_DOC:PR_FROM',
                'SPRM.PR_SRM_CLOSE_DOC:PR_FROM',
                'SPRM.PR_SHOP_CLOSE_DOC:PR_FROM',
              ].includes(code)
                ? '2'
                : undefined,
              customizeUnitCode: [customizeUnitCode, searchCode].join(','),
              workFlowFlag: pubPathFlag ? undefined : '1',
              changeInsertFlag: addLineDsFlag,
              shieldedLineIds,
              ...(cuxParams || {}),
            },
            method: 'GET',
          }
        );
      },
    },
    events: {
      update: ({ name, record, value, dataSet }) => {
        const itemLimitRule = dataSet.getState('itemLimitRule') || [];
        const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
        const uomNameAndCodeShow = (uomNameShow, uomCodeShow) => {
          return uomCodeAndNameRule ? `${uomCodeShow}/${uomNameShow}` : uomNameShow;
        };

        if (name === 'invOrganizationIdLov') {
          if (isFunction(updateLineInvOrganization)) {
            updateLineInvOrganization({ name, record, value, dataSet });
            return;
          }
          if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
            if (value) {
              const { address } = value;
              record.set({
                receiveAddress:
                  prSourcePlatform === 'CATALOGUE' ? record.get('receiveAddress') : address,
              });
            }
            if (record.get('itemId')) {
              if (prSourcePlatform === 'SRM') {
                record.set({
                  itemCodeLov: null,
                  itemName: undefined,
                  poLineId: undefined,
                  lastPurchasePrice: undefined,
                  chartCode: undefined,
                  drawingVersion: undefined,
                  itemModel: undefined,
                  primaryUomId: undefined,
                  itemSpecs: undefined,
                  customMadeFlag: undefined,
                  customAttributeList: undefined,
                  uomLov: null,
                  categoryLov: null,
                  taxId: null,
                  taxCode: null,
                  taxRate: null,
                });
              }
            }
          } else {
            record.set({
              receiveAddress:
                prSourcePlatform === 'CATALOGUE' ? record.get('receiveAddress') : value?.address,
            });
          }
        }

        if (name === 'categoryLov') {
          if (itemLimitRule.find((rule) => rule === 'categoryId')) {
            if (prSourcePlatform === 'SRM' && record.get('itemId')) {
              // 新增判断非物料编码带出
              record.set({
                itemCodeLov: null,
                itemName: undefined,
                poLineId: undefined,
                lastPurchasePrice: undefined,
                chartCode: undefined,
                drawingVersion: undefined,
                itemModel: undefined,
                primaryUomId: undefined,
                itemSpecs: undefined,
                customMadeFlag: undefined,
                customAttributeList: undefined,
                uomLov: null,
              });
            }
          }
        }

        if (name === 'itemCodeLov') {
          const { itemSkip } = record.getField('itemCodeLov').get('lovPara', record) || {};
          if (value?.batchEdit) {
            return;
          }
          if (itemSkip && value) {
            record.set({ itemId: value.itemId || value.partnerItemId });
            return;
          }
          if (value) {
            const {
              chartCode,
              drawingVersion,
              partnerItemId,
              itemName,
              model,
              itemId,
              primaryUomId,
              specifications,
              lastPurchasePrice,
              uomCode,
              uomId,
              poLineId,
              secondaryUomId,
              secondaryUomCode,
              secondaryUomName,
              secondaryUomPrecision,
              customMadeFlag,
              uomName,
              taxId,
              taxCode,
              uomPrecision,
              taxRate,
              includedTaxFlag,
            } = value;
            if (!prSourcePlatform || prSourcePlatform === 'SRM' || prSourcePlatform === 'ERP') {
              if (prSourcePlatform === 'SRM' || !prSourcePlatform) {
                record.set({
                  prLineBomList: [],
                  itemName,
                  poLineId,
                  chartCode,
                  drawingVersion,
                  itemModel: model,
                  primaryUomId,
                  customMadeFlag,
                  itemSpecs: specifications,
                  taxId,
                  taxCode,
                  taxRate,
                  lastPurchasePrice,
                  taxLov: taxId
                    ? {
                        taxId,
                        taxCode,
                        taxRate,
                        includedTaxFlag,
                      }
                    : null,
                  uomLov: {
                    uomCode,
                    uomId,
                    uomCodeAndName: uomNameAndCodeShow(uomName, uomCode),
                    uomName,
                    uomPrecision,
                  },
                  // 业务规则定义(secondaryUomId)> 配置中心(orderUomId)> uomId
                  // 业务规则开启双单位，用secondaryUomId。 业务规则不开启双单位，配置中心开启单位控制用orderUomId，否则用UomId
                  secondaryUomId: uomControl
                    ? {
                        itemId,
                        uomId: secondaryUomId,
                        uomCode: secondaryUomCode,
                        uomCodeAndName: uomNameAndCodeShow(secondaryUomName, secondaryUomCode),
                        uomName: secondaryUomName,
                        uomPrecision: secondaryUomPrecision || uomPrecision,
                        secondaryUomPrecision: secondaryUomPrecision || uomPrecision,
                      }
                    : {
                        itemId,
                        uomId,
                        uomCode,
                        uomCodeAndName: uomNameAndCodeShow(uomName, uomCode),
                        uomPrecision,
                        secondaryUomPrecision: uomPrecision,
                      },
                });
              } else {
                record.set({
                  itemName,
                  prLineBomList: [],
                  uomLov: {
                    uomCode,
                    uomId,
                    uomCodeAndName: uomNameAndCodeShow(uomName, uomCode),
                    uomName,
                    uomPrecision: uomPrecision ? Number(uomPrecision) : undefined,
                  },
                  // 业务规则定义(secondaryUomId)> 配置中心(orderUomId)> uomId
                  // 业务规则开启双单位，用secondaryUomId。 业务规则不开启双单位，配置中心开启单位控制用orderUomId，否则用UomId
                  secondaryUomId: uomControl
                    ? {
                        itemId,
                        uomId: secondaryUomId,
                        uomCode: secondaryUomCode,
                        uomCodeAndName: uomNameAndCodeShow(secondaryUomName, secondaryUomCode),
                        uomName: secondaryUomName,
                        uomPrecision: secondaryUomPrecision || uomPrecision,
                        secondaryUomPrecision: secondaryUomPrecision || uomPrecision,
                      }
                    : {
                        itemId,
                        uomId,
                        uomCode,
                        uomCodeAndName: uomNameAndCodeShow(uomName, uomCode),
                        uomPrecision,
                        secondaryUomPrecision: uomPrecision,
                      },
                });
              }
            } else {
              record.set({
                itemName,
                // poLineId,
                chartCode,
                drawingVersion,
                // itemModel: model,
                primaryUomId,
                // customMadeFlag,
                // lastPurchasePrice,
                // itemSpecs: specifications,
                // uomLov: {
                //   uomCode,
                //   uomId,
                //   uomName,
                //   uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
                // },
              });
            }
            if (itemId && !itemLimitRule.find((rule) => rule === 'categoryId')) {
              const itemCategoryPrams = record.getField('categoryLov').get('lovPara', record) || {};
              fetchCategory({
                itemId: partnerItemId || itemId,
                enabledFlag: 1,
                defaultFlag: 1,
                querySourceFrom: 'PR',
                customizeUnitCode: 'SMDM.PURCHASE_CATEGORY_LIST.GRID',
              }).then((res) => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryCode, categoryName, ...others }] = res;
                  record.set({
                    categoryLov: {
                      categoryId,
                      categoryCode,
                      ...itemCategoryPrams,
                      categoryName,
                      ...others,
                      __source: 'itemCodeLov',
                    },
                  });
                }
                if (remote) {
                  // eslint-disable-next-line no-unused-expressions
                  remote?.event?.fireEvent('categoryQuerySetValue', {
                    res,
                    dataSet,
                    record,
                  });
                }
              });
            }
          } else if (!prSourcePlatform || prSourcePlatform === 'SRM') {
            record.set({
              itemName: undefined,
              poLineId: undefined,
              lastPurchasePrice: undefined,
              chartCode: undefined,
              drawingVersion: undefined,
              itemModel: undefined,
              primaryUomId: undefined,
              itemSpecs: undefined,
              customMadeFlag: undefined,
              customAttributeList: undefined,
              uomLov: null,
              categoryLov: null,
              taxId: null,
              secondaryUomId: null,
              taxCode: null,
              taxRate: null,
              taxLov: null,
              prLineBomList: null,
            });
          }
        }

        if (name === 'prRequestedLov' && value) {
          if (value) {
            record.set({
              prRequestedLov: {
                ...value,
                prRequestedNumAndName:
                  value && value.userId ? `${value.loginName}-${value.userName}` : null,
              },
            });
          }
        }
        if (name === 'secondaryQuantity' && value && uomControl) {
          const itemId = record.get('itemId');
          const doublePrimaryUomId = record.get('uomId');
          const secondaryUomId = record.get('secondaryUomId');
          if (itemId && doublePrimaryUomId && secondaryUomId && value) {
            fetchQuantity([
              {
                businessKey: 1,
                secondaryUomId: secondaryUomId.secondaryUomId || secondaryUomId.uomId,
                secondaryQuantity: value,
                doublePrimaryUomId,
                itemId,
              },
            ]).then((res) => {
              const result = getResponse(res);
              if (result && !res.failed) {
                record.set({ quantity: res[0].primaryQuantity });
              }
            });
          } else {
            record.set({ quantity: value });
          }
        }
        if (name === 'secondaryUomId' && value && uomControl) {
          const itemId = record.get('itemId');
          const doublePrimaryUomId = record.get('uomId');
          const secondaryQuantity = record.get('secondaryQuantity');
          // const primaryQuantity = record.get('quantity');
          if (itemId && doublePrimaryUomId && secondaryQuantity && value) {
            fetchQuantity([
              {
                businessKey: 1,
                secondaryQuantity,
                secondaryUomId: value.secondaryUomId || value.uomId,
                doublePrimaryUomId,
                itemId,
              },
            ]).then((res) => {
              const result = getResponse(res);
              if (result && !res.failed) {
                record.set({
                  quantity: res[0]?.primaryQuantity,
                  secondaryQuantity: record
                    .get('secondaryQuantity')
                    ?.toFixed(value.uomPrecision ?? 10),
                });
              }
            });
          }
          if (!itemId) {
            const { uomId, uomPrecision, uomCode, uomName, uomCodeAndName } = value;
            record.set({
              uomLov: {
                uomCode,
                uomId,
                uomPrecision,
                uomCodeAndName,
                uomName,
              },
              quantity: record.get('secondaryQuantity')?.toFixed(uomPrecision ?? 10),
              secondaryQuantity: record.get('secondaryQuantity')?.toFixed(uomPrecision ?? 10),
            });
          }
        }

        if (name === 'uomLov' && !uomControl) {
          if (value) {
            record.set({
              quantity: record.get('quantity')?.toFixed(value?.uomPrecision ?? 10),
              secondaryQuantity: record.get('quantity')?.toFixed(value?.uomPrecision ?? 10),
            });
          }
        }

        if (name === 'uomPrecision' && !uomControl) {
          if (value) {
            record.set({
              quantity: record.get('quantity')?.toFixed(value ?? 10),
              secondaryQuantity: record.get('quantity')?.toFixed(value ?? 10),
            });
          }
        }

        if (name === 'quantity' && value) {
          if (record?.get('prLineBomList')?.length > 0) {
            const prLineBomList = record?.get('prLineBomList');
            record.set({
              updateQuantityFlag: 1,
              prLineBomList: prLineBomList
                ? prLineBomList.map((i) => ({
                    ...i,
                    quantity: math.multipliedBy(i?.unitQuantity || 1, value),
                  }))
                : null,
            });
          }
        }

        if (isFunction(handleLineChange)) {
          handleLineChange({ name, record, value, dataSet, uomControl });
        }
        dataSet.setState('updated', true);
      },
      load: ({ dataSet }) => {
        dataSet.setState('updated', false);
        const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
        const cuxFieldBatchMapNoModal =
          dataSet.parent?.current?.get('cuxFieldBatchMapNoModal') || {};
        dataSet.forEach((record) => {
          if (urlflagIf && prSourcePlatform === 'ERP' && record?.get('companyId')) {
            setLineCompanyId(record?.get('companyId'));
          }
          record.init({
            ...(cuxFieldBatchMapNoModal || {}),
            dirtyFlag: null,
            uomCodeAndName: record?.get('uomCodeAndName') || record?.get('uomName'),
            prRequestedNumAndName: record.get('prRequestedNum')
              ? `${record.get('prRequestedNum')}-${record.get('prRequestedName')}`
              : null,
            displaySupplierName: record.get('supplierName') || record.get('supplierCompanyName'),
            // 不开启双单位的时候，数量，单位等字段默认基本数量，基本单位
            secondaryQuantity:
              !record.get('secondaryQuantity') && record.get('quantity') && !uomControl
                ? record.get('quantity')
                : record.get('secondaryQuantity'),
            secondaryTaxInUnitPrice:
              !record.get('secondaryTaxInUnitPrice') &&
              record.get('taxIncludedUnitPrice') &&
              !uomControl
                ? record.get('taxIncludedUnitPrice')
                : record.get('secondaryTaxInUnitPrice'),
          });
          if (!addLineDsFlag) {
            // eslint-disable-next-line no-param-reassign
            record.selectable = !record.get('changeInsertFlag');
          }
        });
        if (remote) {
          // eslint-disable-next-line no-unused-expressions
          remote?.event?.fireEvent('LineloadEvent', {
            dataSet,
            location,
          });
        }
      },
    },
    fields: [
      {
        name: 'displayLineNum',
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
      },
      {
        name: 'mallLineNum',
        label: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
      },
      {
        label: intl.get(`sprm.common.model.common.docFlow`).d('单据流'),
        type: 'string',
        name: 'docFlow',
      },
      {
        name: 'prLineStatusCodeMeaning',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'invOrganizationIdLov',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        ignore: 'always',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              ouId: dataSet.parent?.current?.get('ouId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required({ dataSet }) {
            return !(
              dataSet.parent?.current?.get('prSourcePlatform') &&
              dataSet.parent?.current?.get('prStatusCode') === 'reject'
            );
          },
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.organizationId',
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.organizationName',
      },
      {
        name: 'inventoryIdLov',
        type: 'object',
        lovCode: 'SPRM.INVENTORY',
        label: intl.get(`sprm.common.model.inventoryName`).d('库房'),
        valueField: 'inventoryId',
        textField: 'inventoryName',
      },
      {
        name: 'inventoryId',
        bind: 'inventoryIdLov.inventoryId',
      },
      {
        name: 'inventoryName',
        bind: 'inventoryIdLov.inventoryName',
      },
      {
        label: intl.get(`sprm.common.model.common.productNum`).d('商品编码'),
        name: 'productNum',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
        name: 'thirdSkuCode',
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
        name: 'thirdSkuName',
      },
      {
        label: intl.get(`sprm.common.model.common.changeInsertFlag`).d('是否变更新增'),
        name: 'changeInsertFlag',
      },
      {
        label: intl.get(`sprm.common.model.common.productName`).d('商品名称'),
        name: 'productName',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
        name: 'productBrand',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
        name: 'productModel',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
        name: 'packingList',
      },
      // {
      //   name: 'itemLimitRule',
      //   label: intl.get(`sprm.common.model.common.itemLimitRule`).d('物料限制条件'),
      // },
      {
        name: 'itemCodeLov',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        dynamicProps: {
          disabled({ record, dataSet }) {
            const itemLimitRule = dataSet.getState('itemLimitRule') || [];
            // 物料分类
            // console.log(other);
            const categoryId = record.get('categoryId');
            const invOrganizationId = record.get('invOrganizationId');
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              if (!categoryId) {
                return true;
              }
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              if (!invOrganizationId) {
                return true;
              }
            }

            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');

            return prSourcePlatform !== 'SRM' && prSourcePlatform && addLineDsFlag !== 1;
          },
          lovPara({ record, dataSet }) {
            const itemLimitRule = dataSet.getState('itemLimitRule') || [];
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: dataSet.parent?.current?.get('companyId'),
              headerCategoryId: dataSet.parent?.current?.get('categoryId'),
              lineCategoryId: record.get('categoryId'),
              prTypeId: dataSet.parent?.current?.get('prTypeId'),
            };
            // 物料分类
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId');
            }
            return params;
          },
        },
        optionsProps: {
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'itemCode',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        bind: 'itemCodeLov.itemCode',
      },
      {
        name: 'itemId',
        bind: 'itemCodeLov.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get('entity.item.name').d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
        name: 'customMadeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
        name: 'customAttributeList',
      },
      {
        label: intl.get(`sprm.common.model.common.itemModel`).d('型号'),
        name: 'itemModel',
        dynamicProps: {
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform && prSourcePlatform !== 'SRM';
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'),
        name: 'itemSpecs',
        dynamicProps: {
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'poLineId',
        label: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
      },
      {
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
        name: 'categoryLov',
        type: 'object',
        ignore: 'always',
        // lovCode: 'SMDM.TREE_ITEM_CATEGORY_TILED_NEW',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        dynamicProps: {
          lovPara({ dataSet, record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              tiledFlag: 1,
              module: 'PR',
              purchaseOrgId: dataSet.parent?.current?.get('purchaseOrgId'),
              queryCategoryId: dataSet.parent?.current?.get('categoryId'),
              itemId: record.get('itemId'),
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
          events: {
            load({ dataSet }) {
              const { current } = dataSet.queryDataSet || {};
              if (current?.dirty) {
                dataSet.forEach((record) => {
                  Object.assign(record, { isExpanded: true });
                });
              }
            },
          },
        },
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'categoryName',
        bind: 'categoryLov.categoryName',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`sprm.common.model.common.catalogName`).d('商品目录'),
        name: 'catalogName',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        required: true,
        min: moment('1970-01-01'),
        // min: moment().format(DATETIME_MIN),
        type: 'date',
      },
      {
        label: intl.get(`sprm.common.model.common.outsourcingBomFlag`).d('是否外协加工'),
        name: 'outsourcingBomFlag',
        defaultValue: 0,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`sprm.common.model.common.outsourcingBom`).d('外协BOM'),
        name: 'outsourcingBom',
        // min: moment().format(DATETIME_MIN),
        type: 'string',
      },
      {
        name: 'quantity',
        validator: (value, _, recrod) => {
          const { cancelledFlag, closedFlag } = recrod?.get(['closedFlag', 'cancelledFlag']) || {};
          if (
            isNumber(value) &&
            value <= 0 &&
            !['1', 1].includes(cancelledFlag) &&
            !['1', 1].includes(closedFlag)
          ) {
            return intl.get(`sprm.common.message.baseMustExceedZero`).d('基本数量必须大于零');
          } else {
            return true;
          }
        },
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
        dynamicProps: {
          required({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return !(prSourcePlatform === 'E-COMMERCE' || prSourcePlatform === 'CATALOGUE');
          },
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
          disabled: ({ dataSet }) => {
            const { prSourcePlatform, shopBudgetIgnoreFlag } = dataSet.parent?.current?.get([
              'prSourcePlatform',
              'shopBudgetIgnoreFlag',
            ]);
            return (
              ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
              uomControl === 1 ||
              (prSourcePlatform === 'SHOP' && [0, '0'].includes(shopBudgetIgnoreFlag))
            );
          },
        },
        type: 'number',
      },
      {
        name: 'secondaryQuantity',
        validator: (value, _, recrod) => {
          const { cancelledFlag, closedFlag } = recrod?.get(['closedFlag', 'cancelledFlag']) || {};
          if (
            isNumber(value) &&
            value <= 0 &&
            uomControl === 1 &&
            !['1', 1].includes(cancelledFlag) &&
            !['1', 1].includes(closedFlag)
          ) {
            return intl.get(`sprm.common.message.mustExceedZero`).d('数量必须大于零');
          } else {
            return true;
          }
        },
        dynamicProps: {
          required({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return (
              !(prSourcePlatform === 'E-COMMERCE' || prSourcePlatform === 'CATALOGUE') &&
              uomControl === 1
            );
          },
          precision: ({ record }) => {
            return record.get('secondaryUomPrecision') ?? 10;
          },
          disabled: ({ dataSet }) => {
            const { prSourcePlatform, shopBudgetIgnoreFlag } = dataSet.parent?.current?.get([
              'prSourcePlatform',
              'shopBudgetIgnoreFlag',
            ]);
            return (
              ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
              (prSourcePlatform === 'SHOP' && [0, '0'].includes(shopBudgetIgnoreFlag) && uomControl)
            );
          },
        },
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
        name: 'sourceOccupiedQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
        name: 'orderOccupiedQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
        name: 'restSourceQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
        name: 'restPoQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'secondLevelStrategyCode',
        label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
        type: 'string',
        lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
      },
      {
        name: 'secondaryTaxInUnitPrice',
        label: intl.get(`${commonPrompt}.secondaryTaxInUnitPrice`).d('预估单价(含税)'),
        type: 'number',
        numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('defaultPrecision') || record.get('defaultPrecision') === 0)
              ? record.get('defaultPrecision')
              : undefined;
          },
          disabled: ({ dataSet }) => {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
          },
        },
      },
      {
        name: 'uomLov',
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomCodeAndName',
        ignore: 'always',
        required: true,
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        dynamicProps: {
          disabled: () => uomControl === 1,
        },
        valueField: 'uomId',
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomLov.uomPrecision',
      },
      {
        name: 'uomId',
        bind: 'uomLov.uomId',
      },
      {
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        name: 'uomCodeAndName',
        bind: 'uomLov.uomCodeAndName',
      },
      {
        name: 'secondaryUomId',
        type: 'object',
        lovCode: 'SMDM_ITEM_ORG_UOM',
        label: intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        textField: 'uomCodeAndName',
        ignore: 'always',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              itemId: uomControl ? record.get('itemId') : null,
              tenantId: organizationId,
            };
          },
          disabled: ({ dataSet }) => {
            const { prSourcePlatform, shopBudgetIgnoreFlag } = dataSet.parent?.current?.get([
              'prSourcePlatform',
              'shopBudgetIgnoreFlag',
            ]);
            return (
              ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
              (prSourcePlatform === 'SHOP' && [0, '0'].includes(shopBudgetIgnoreFlag) && uomControl)
            );
          },
          required: () => uomControl === 1,
        },
        transformRequest: (value) => value?.uomId,
        transformResponse(value, data) {
          if (value) {
            return {
              ...data,
              uomCodeAndName: data.secondaryUomCodeAndName || data.secondaryUomName || data.uomName,
              uomId: data.secondaryUomId || data.uomId,
              uomCode: data.secondaryUomCode || data.uomCode,
              uomPrecision: data.secondaryUomPrecision || data.uomPrecision,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.uomName',
      },
      {
        name: 'secondaryUomCode',
        bind: 'secondaryUomId.uomCode',
      },
      {
        name: 'secondaryUomCodeAndName',
        bind: 'secondaryUomId.uomCodeAndName',
      },
      {
        name: 'secondaryUomPrecision',
        type: 'number',
        bind: 'secondaryUomId.secondaryUomPrecision',
      },
      {
        name: 'taxLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`sprm.common.model.common.taxType`).d('税种'),
      },
      {
        name: 'taxId',
        bind: 'taxLov.taxId',
      },
      {
        name: 'taxCode',
        bind: 'taxLov.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxLov.includedTaxFlag',
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        bind: 'taxLov.taxRate',
      },
      {
        name: 'currencyLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currenyCode',
        disabled: true,
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        name: 'currencyCode',
        bind: 'currencyLov.currencyCode',
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        name: 'taxIncludedUnitPrice',
        numberGrouping: true,
        type: 'number',
        label:
          uomControl === 1
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`${commonPrompt}.secondaryTaxInUnitPrice`).d('预估单价(含税)'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('defaultPrecision') || record.get('defaultPrecision') === 0)
              ? record.get('defaultPrecision')
              : undefined;
          },
          disabled: ({ dataSet }) => {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) || uomControl === 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
        name: 'lastPurPrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.unitPriceBatch`).d('每'),
        type: 'number',
        numberGrouping: true,
        name: 'unitPriceBatch',
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
        name: 'taxIncludedLineAmount',
        disabled: true,
        numberGrouping: true,
        type: 'number',
        computedProps: {
          formatterOptions: ({ record, name }) =>
            record.get('prSourcePlatform') === 'SRM'
              ? amountFormatterOptions({ record, name })
              : undefined,
        },
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('financialPrecision') || record.get('financialPrecision') === 0)
              ? record.get('financialPrecision') || 0
              : undefined;
          },
        },
      },
      {
        name: 'localCurrencyNoTaxSum',
        disabled: true,
        numberGrouping: true,
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxSum').d('本币金额(不含税)'),
        computedProps: {
          formatterOptions: ({ record, name }) =>
            record.get('prSourcePlatform') === 'SRM'
              ? amountFormatterOptions({ record, name })
              : undefined,
        },
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localFinancialPrecision') || record.get('localFinancialPrecision') === 0)
              ? record.get('localFinancialPrecision') || 0
              : undefined;
          },
        },
      },
      {
        name: 'localCurrencyNoTaxUnit',
        disabled: true,
        numberGrouping: true,
        type: 'number',
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxUnit').d('本币单价(不含税)'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localDefaultPrecision') || record.get('localDefaultPrecision') === 0)
              ? record.get('localDefaultPrecision')
              : undefined;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxSum`).d('本币金额(含税)'),
        name: 'localCurrencyTaxSum',
        disabled: true,
        numberGrouping: true,
        dynamicProps: {
          [precisionType]:
            precisionType === 'formatterOptions'
              ? amountFormatterOptions
              : ({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' &&
                    (record.get('localFinancialPrecision') ||
                      record.get('localFinancialPrecision') === 0)
                    ? record.get('localFinancialPrecision')
                    : undefined;
                },
          type: 'number',
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxUnit`).d('本币单价(含税)'),
        name: 'localCurrencyTaxUnit',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localDefaultPrecision') || record.get('localDefaultPrecision') === 0)
              ? record.get('localDefaultPrecision')
              : undefined;
          },
        },
        disabled: true,
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        name: 'supplierList',
        type: 'object',
        // ignore: 'always',
        multiple: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
        lovCode: 'SPRM.SUPPLIER',
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        name: 'supplierCompanyIdLov',
        type: 'object',
        ignore: 'always',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
        lovCode: 'SPRM.SUPPLIER',
        transformResponse: (value, data) => {
          if (data?.supplierName || data?.supplierCompanyName) {
            return {
              supplierName: data?.supplierName,
              supplierCompanyId: data?.supplierCompanyId,
              supplierCompanyName: data?.supplierCompanyName,
              supplierTenantId: data?.supplierTenantId,
              supplierId: data?.supplierId,
              supplierNum: data?.supplierCode,
              displaySupplierName: data?.supplierName || data?.supplierCompanyName,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierCompanyCode',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        name: 'supplierCode',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
      },
      {
        name: 'displaySupplierName',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
        bind: 'supplierCompanyIdLov.displaySupplierName',
      },
      {
        name: 'supplierName',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierName',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyName',
      },
      {
        name: 'referencePriceDisplayFlag',
        label: intl.get(`sprm.common.model.common.referPrice`).d('参考价格'),
      },
      {
        name: 'prRequestedLov',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPCM.ACCEPT_USER',
        valueField: 'requestedBy',
        textField: 'prRequestedNumAndName',
        lovPara: { tenantId: organizationId },
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'requestedBy',
        bind: 'prRequestedLov.userId',
      },
      {
        name: 'prRequestedNum',
        bind: 'prRequestedLov.loginName',
      },
      {
        name: 'prRequestedName',
        bind: 'prRequestedLov.userName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'prRequestedLov.prRequestedNumAndName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'purchaseAgentLov',
        lovCode: 'SPRM.PURCHASE_AGENT',
        type: 'object',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        name: 'purchaseAgentId',
        bind: 'purchaseAgentLov.purchaseAgentId',
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentLov.purchaseAgentName',
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        label: intl.get(`sprm.common.model.common.handlePerson`).d('需求执行人'),
        name: 'executorName',
      },
      {
        name: 'accountSubjectLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        valueField: 'accountSubjectId',
        textField: 'accountSubjectName',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'accountSubjectNum',
        bind: 'accountSubjectLov.accountSubjectNum',
      },
      {
        name: 'accountSubjectId',
        bind: 'accountSubjectLov.accountSubjectId',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        name: 'accountSubjectName',
        bind: 'accountSubjectLov.accountSubjectName',
      },
      {
        name: 'costLov',
        type: 'object',
        ignore: 'always',
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        lovCode: 'SPRM.COST_CENTER',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              ouId: dataSet.parent?.current?.get('ouId'),
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
        },
      },
      {
        name: 'costId',
        bind: 'costLov.costId',
      },
      {
        name: 'costCode',
        bind: 'costLov.costCode',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costName',
        bind: 'costLov.costName',
      },
      {
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        name: 'expBearDepLov',
        type: 'object',
        ignore: 'always',
        valueField: 'unitId',
        textField: 'unitName',
        lovCode: 'SPFM.UNIT_G_C',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              ouId: dataSet.parent?.current?.get('companyId'),
              unitCompanyId: dataSet.parent?.current?.get('parentUnitId'),
              unitTypeCode: 'D',
            };
          },
        },
      },
      {
        name: 'expBearDepName',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepLov.unitName',
      },
      {
        name: 'expBearDepId',
        bind: 'expBearDepLov.unitId',
      },
      {
        name: 'expBearDep',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepLov.unitName',
      },
      {
        label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
        name: 'projectNum',
      },
      {
        label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
        name: 'projectName',
      },
      {
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
        name: 'projectCategoryLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'projectCategory',
        bind: 'projectCategoryLov.value',
      },
      {
        name: 'projectCategoryMeaning',
        bind: 'projectCategoryLov.meaning',
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.WBS',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              ouId: dataSet.parent?.current?.get('ouId'),
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
        },
        valueField: 'wbsCode',
        textField: 'wbsName',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsCode',
        bind: 'wbsLov.wbsCode',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbs',
        bind: 'wbsLov.wbsName',
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        name: 'taxIncludedBudgetUnitPrice',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('defaultPrecision') || record.get('defaultPrecision') === 0)
              ? record.get('defaultPrecision')
              : undefined;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.budgetIoFlag`).d('预算外标识'),
        name: 'budgetIoFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        // transformResponse(data) {
        //   console.log(/pp/, data)
        //   const value = data ? data.toString() : '0';
        //   return value;
        // },
      },
      {
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.BUDGET_ACCOUNT',
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
        },
        // valueField: 'budgetAccountId',
        // textField: 'budgetAccountName',
      },
      {
        bind: 'budgetAccountLov.budgetAccountId',
        name: 'budgetAccountId',
      },
      {
        bind: 'budgetAccountLov.budgetAccountNum',
        name: 'budgetAccountNum',
      },
      {
        bind: 'budgetAccountLov.budgetAccountName',
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountName',
      },
      {
        label: intl.get(`sprm.common.model.common.xyNum`).d('协议编号'),
        name: 'pcNum',
      },
      {
        name: 'receiveAddress',
        label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
        dynamicProps: {
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveContactName',
        label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
        dynamicProps: {
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`sprm.common.model.common.internationalTelCode`).d('国别码'),
        lookupCode: 'HPFM.IDD',
        dynamicProps: {
          disabled: ({ record }) => record.getField('receiveTelNum').disabled,
          required: ({ record }) => record.getField('receiveTelNum').required,
        },
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
        type: 'tel',
        regionField: 'internationalTelCode',
        dynamicProps: {
          disabled({ dataSet }) {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
          pattern: ({ dataSet, record }) => {
            const prSourcePlatform = dataSet.parent?.current?.get('prSourcePlatform');
            if (prSourcePlatform === 'SRM') {
              return record?.get('internationalTelCode') === '+86' ? /^1\d{10}$/ : NOT_CHINA_PHONE;
            }
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.lineFreight`).d('行运费'),
        name: 'lineFreight',
        dynamicProps: {
          type: ({ record }) => (record.get('prSourcePlatform') === 'SRM' ? 'currency' : 'number'),
          [precisionType]:
            precisionType === 'formatterOptions'
              ? amountFormatterOptions
              : ({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' &&
                    (record.get('localFinancialPrecision') ||
                      record.get('financialPrecision') === 0)
                    ? record.get('financialPrecision')
                    : undefined;
                },

          disabled: ({ record }) => record.get('prSourcePlatform') !== 'SRM',
        },
      },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
      {
        label: intl.get('entity.attachment.tag').d('附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: limitAttr()?.bucketDirectory || 'sprm-pr',
        max: limitAttr()?.maxCount,
      },
      {
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'changeAttachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: limitAttr()?.bucketDirectory || 'sprm-pr',
        max: limitAttr()?.maxCount,
      },
      {
        label: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
        name: 'priceList',
      },
      {
        name: 'skuType',
        label: intl.get(`${commonPrompt}.skuTypeMark`).d('定制品标示'),
      },
      {
        label: intl.get(`${commonPrompt}.customUomName`).d('定制单位'),
        name: 'customUomName',
      },
      {
        label: intl.get(`${commonPrompt}.customQuantity`).d('定制数量'),
        name: 'customQuantity',
        type: 'number',
        // dynamicProps: {
        //   precision: ({ record }) => {
        //     return record.get('uomPrecision') ?? 10;
        //   },
        // },
      },
      {
        label: intl.get(`${commonPrompt}.packageQuantity`).d('份数'),
        name: 'packageQuantity',
        type: 'number',
      },
      {},
      {},
      {
        label: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
        name: 'customSpecsJson',
      },
      { name: 'defaultPrecision', type: 'number' },
      { name: 'financialPrecision', type: 'number' },
      {
        label: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
        name: 'productSpecsJson',
      },
      {
        label: intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情'),
        name: 'executionBillDetail',
      },
      {
        label: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        type: 'number',
        name: 'occupiedQuantity',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        type: 'number',
        name: 'changeQuantity',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.changeOrderFailCount`).d('自动转单失败次数'),
        type: 'number',
        name: 'changeOrderFailCount',
      },
      {
        name: 'operable',
        label: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
      },
      {
        name: 'budgetOccupyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetOccupyFlag`).d('预算占用标识'),
        lookupCode: 'SPUC.PR.LINE_BUDGET_OCCUPY_FLAG',
      },
      {
        name: 'orderExecuteStatus',
        lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
      },
      {
        name: 'sourceExecuteStatus',
        lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
      },
      {
        name: 'orderExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.orderExcessRuleCode`).d('订单超量规则'),
      },
      {
        name: 'sourceExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.sourceExcessRuleCode`).d('寻源超量规则'),
      },
      {
        name: 'contractExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.contractExcessRuleCode`).d('协议超量规则'),
      },
      {
        name: 'sourceDisposableExcessFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.sourceDisposableExcessFlag`).d('寻源新链路一次性超量标识'),
      },
      {
        name: 'rpSourceNum',
        label: intl.get(`${commonPrompt}.rpSourceNum`).d('来源需求计划行'),
      },
      {
        name: 'primaryUrl',
        label: intl.get(`${commonPrompt}.primaryUrl`).d('商品主图'),
      },
      {
        name: 'closeQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'sourceCloseQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'currentCloseQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'currentSourceCloseQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'downsStreamQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'sourceDownsStreamQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'defaultOrderingAddressId',
        label: intl.get(`${commonPrompt}.defaultOrderingAddressLov`).d('默认收货地址'),
        type: 'object',
        lovCode: 'SMCT.ADDRESS.NOT_ENCRYPT',
        transformRequest: (value) => value && value.addressId,
        transformResponse: (_, object) => {
          return object?.defaultOrderingAddressId
            ? {
                ...object,
                addressId: object?.defaultOrderingAddressId,
                fullAddress: object?.defaultOrderingAddress,
                contactName: object?.defaultContactPerson,
                mobile: object?.defaultContactPhone,
              }
            : null;
        },
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              userld: getCurrentUser()?.id,
              belongType: 1,
              tenantId: organizationId,
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
        },
      },
      {
        name: 'defaultOrderingAddress',
        label: intl.get(`${commonPrompt}.defaultOrderingAddressLov`).d('默认收货地址'),
        bind: 'defaultOrderingAddressId.fullAddress',
      },
      {
        name: 'defaultContactPerson',
        label: intl.get(`${commonPrompt}.defaultContactPersonBind`).d('默认联系人'),
        bind: 'defaultOrderingAddressId.contactName',
      },
      {
        name: 'defaultContactPhone',
        bind: 'defaultOrderingAddressId.mobile',
        label: intl.get(`${commonPrompt}.defaultContactPhoneBind`).d('默认联系电话'),
      },
      {
        name: 'projectTaskId',
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        label: intl.get(`${commonPrompt}.projectTaskId`).d('项目任务名称'),
        lovPara: { tileTreeFlag: 1, businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER' },
        optionsProps: (dsProps) => ({
          ...dsProps,
          paging: 'server',
          idField: 'taskId',
          parentField: 'parentTaskId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        }),
        dynamicProps: {
          disabled: ({ record }) => record.get('prSourcePlatform') === 'ERP', // 外部系统来源不允许编辑项目任务名称字段
        },
        transformRequest: (value) => value?.taskId,
        transformResponse: (value, object) => {
          return object?.projectTaskId
            ? {
                taskId: object?.projectTaskId,
                taskName: object?.projectTaskName,
              }
            : null;
        },
      },
      ...(typeof cuxListField === 'function' ? cuxListField() : []),
    ],
  };
};
