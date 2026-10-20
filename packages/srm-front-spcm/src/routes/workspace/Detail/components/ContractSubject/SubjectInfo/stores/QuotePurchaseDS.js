/**
 * 采购申请单据 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import qs from 'querystring';
import notification from 'utils/notification';

import { getDynamicLabel } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

export default (doubleUnitEnabled) => ({
  primaryKey: 'prLineId',
  pageSize: 20,
  cacheSelection: true,
  cacheModified: true, // 缓存修改过的数据
  modifiedCheck: false,
  transport: {
    read: ({ params, dataSet }) => {
      const { prLineIds } = dataSet;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/line/add?${qs.stringify({
          prLineIds,
        })}`,
        method: 'GET',
        params,
      };
    },
    submit: ({ data, params }) => {
      return {
        url: ``,
        data,
        params,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`spcm.common.model.common.prNumAndLine`).d('采购申请编号-行号'),
      name: 'prNum',
    },
    {
      label: intl.get(`spcm.common.model.lineNum`).d('行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`spcm.common.model.common.transferredDocumentType`).d('协议执行类型'),
      name: 'transferredDocumentTypeVOList',
    },
    {
      label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryName',
    },
    {
      // label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      label: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
      name: 'taxIncludedUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
      name: 'taxCode',
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
      name: 'taxRate',
    },
    {
      label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
      name: 'currencyCode',
    },
    {
      // label: intl.get(`spcm.common.model.common.base.unit`).d('单位'),
      label: getDynamicLabel(doubleUnitEnabled),
      name: 'uomName',
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      // label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      label: getDynamicLabel(doubleUnitEnabled, 'quantity'),
      name: 'quantity',
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
      name: 'availableQuantity',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.executionStatusCode`).d('执行状态'),
      name: 'executionStatusCodeMeaning',
    },
    {
      label: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
      name: 'reqTypeCode',
    },
    {
      label: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
      name: 'supplierCode',
    },
    {
      label: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get(`spcm.common.model.companyName`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrgName',
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购员'),
      name: 'agentName',
    },
    {
      label: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`spcm.common.model.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
      name: 'catalogName',
    },
    {
      label: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
    },
    {
      label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
      name: 'contactTelNum',
    },
    {
      label: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
      name: 'invoiceAddress',
    },
    {
      label: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
      name: 'companyOrgName',
    },
    {
      label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
      name: 'costAnchDepDesc',
    },
    {
      label: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
      name: 'expBearDep',
    },
    {
      label: intl.get(`spcm.common.model.location`).d('地点'),
      name: 'addressMeaning',
    },
    {
      label: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
      name: 'projectNum',
    },
    {
      label: intl.get(`spcm.common.model.projectName`).d('项目名称'),
      name: 'projectName',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    {
      label: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
      name: 'prSourcePlatformMeaning',
    },
    // {
    //   label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
    //   name: 'urgentFlag',
    // },
    {
      label: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
      name: 'urgentDate',
    },
    {
      label: intl.get('spcm.common.model.executorName').d('需求执行人'),
      name: 'executorName',
      type: 'date',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
      type: 'date',
    },
    {
      name: 'orderSupplierLov',
      label: intl.get('sodr.workspace.model.common.recommendedSupplier').d('推荐供应商'),
      type: 'object',
      lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
      ignore: 'always',
      dynamicProps: {
        lovPara({ record }) {
          return {
            itemId: record.get('itemId'),
            companyId: record.get('companyId'),
            ouId: record.get('ouId'),
            priceSortFlag: 1,
            purchaseOrgId: record.get('purchaseOrgId'),
            invOrganizationId: record.get('invOrganizationId'),
            uomId: record.get('uomId'),
            prLineId: record.get('prLineId'),
            orderTypeId: record.get('orderTypeId'),
            orderTypeCode: record.get('orderTypeCode'),
            categoryId: record.get('categoryId'),
          };
        },
      },
    },
    {
      name: 'selectSupplierCompanyId',
      bind: 'orderSupplierLov.supplierCompanyId',
    },
    {
      name: 'selectSupplierCode',
      bind: 'orderSupplierLov.supplierCompanyNum',
    },
    {
      name: 'selectSupplierCompanyName',
      bind: 'orderSupplierLov.supplierCompanyName',
    },
    {
      name: 'selectSupplierTenantId',
      bind: 'orderSupplierLov.supplierTenantId',
    },
    {
      name: 'selectLocalSupplierId',
      bind: 'orderSupplierLov.supplierId',
    },
    {
      name: 'selectLocalSupplierName',
      bind: 'orderSupplierLov.supplierName',
    },
    {
      name: 'priceLibraryId',
      bind: 'orderSupplierLov.priceLibraryId',
    },
    {
      name: 'priceLibId',
      bind: 'orderSupplierLov.priceLibId',
    },
    {
      name: 'selectDisplaySupplierCompanyName',
      ignore: 'always',
      bind: 'orderSupplierLov.displaySupplierCompanyName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.applyPoNum`).d('申请编码'),
      name: 'displayPrNum',
      merge: true,
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
      name: 'displayPrLineNum',
      display: true,
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'itemCodeLov',
      type: 'object',
      lovCode: 'SPRM.ITEM',
      ignore: 'always',
      display: true,
      lovPara: {
        tenantId: organizationId,
      },
    },
  ],
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) => {
        i.init({
          selectDisplaySupplierCompanyName: isNil(i.get('selectSupplierCompanyName'))
            ? i.get('selectLocalSupplierName')
            : i.get('selectSupplierCompanyName'),
        });
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'orderSupplierLov') {
        const {
          uomId,
          uomCode,
          uomName,
          uomPrecision,
          uomCodeAndName,
          currencyCode,
          taxId,
          taxRate,
          priceLibId,
          priceLibraryStatus,
          taxIncludedPrice,
          unitPrice,
          enteredTaxIncludedPrice,
          unitPriceBatch,
          supplierId,
          supplierName,
          supplierNum,
        } = value || {};
        if (value) {
          if ([0, 1, 2].includes(doubleUnitEnabled)) {
            const sodrEnabled = doubleUnitEnabled !== 0;
            if (uomId && sodrEnabled && record.getPristineValue('uomId') !== uomId) {
              notification.error({
                message: intl
                  .get(`spcm.common.view.message.validatePriceUomId`)
                  .d(
                    `自动带出价格失败，失败原因：该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作`
                  ),
              });
              record.reset();
              return;
            }
            if (!sodrEnabled) {
              record.set({
                secondaryUomId: uomId,
                secondaryUomName: uomName,
                secondaryUomCode: uomCode,
                secondaryUomCodeAndName: uomCodeAndName,
                secondaryUomPrecision: uomPrecision,
              });
            }
          }
          const setFields = {
            uomId,
            uomCode,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            priceLibId,
            priceLibraryStatus,
            selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
            selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
            selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
            unitPriceBatch,
            unitPrice,
            enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          };
          record.set(setFields);
        } else {
          record.reset();
          record.set({ orderSupplierLov: {}, unitPrice: null });
        }
      }
    },
  },
});
