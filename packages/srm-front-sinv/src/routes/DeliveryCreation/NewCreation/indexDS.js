import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  // filterNullValueObject,
  // parseParameters,
  getUserOrganizationId,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const creationDataSet = (object) => ({
  autoQuery: false,
  primaryKey: +object.planFlag ? 'planId' : 'poLineLocationId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'serialNumber',
      type: 'string',
      label: intl.get(`sinv.common.model.common.serialNumber`).d('序号'),
      fixed: 'left',
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
      fixed: 'left',
      align: 'left',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
      fixed: 'left',
      align: 'left',
    },
    {
      name: 'poSourcePlatformMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.sourcePlatform`).d('订单来源'),
      align: 'left',
    },
    {
      name: 'orderTypeName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.orderTypeName`).d('订单类型'),
      align: 'left',
    },
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'displayReleaseNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'displayLineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'displayLineLocationNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
      align: 'left',
    },
    {
      name: 'canAsnQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.canAsnQuantity`).d('可发货数量'),
      align: 'left',
    },
    {
      name: 'netReceivedQuantity',
      type: 'string',
      label: intl.get(`sinv.common.model.common.netReceivedQuantity`).d('净接收'),
      align: 'left',
    },
    {
      name: 'onWayQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.onWayQuantity`).d('在途数量'),
      align: 'left',
    },
    {
      name: 'shippedQuantity',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shippedQuantity`).d('累计发货'),
      align: 'left',
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
      align: 'left',
    },
    {
      name: 'needByDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
      align: 'left',
      sorter: true,
    },
    {
      name: 'exemptInspectionFlag',
      type: 'number',
      label: intl.get(`sinv.common.model.common.exemptInspectionFlag`).d('是否免检'),
      align: 'left',
    },
    {
      name: 'immedShippedFlag',
      type: 'number',
      label: intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发'),
      align: 'left',
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      align: 'left',
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      align: 'left',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`entity.customer.tag`).d('客户'),
      align: 'left',
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.invOrganizationName`).d('收货组织名称'),
      align: 'left',
    },
    {
      name: 'shipToThirdPartyAddress',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipToThirdPartyAddress`).d('收货地点名称'),
      align: 'left',
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
      align: 'left',
    },
    {
      name: 'locationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.locationName`).d('库位'),
      align: 'left',
    },
    {
      name: 'shipToThirdPartyName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
      align: 'left',
    },
    {
      name: 'shipToThirdPartyContact',
      type: 'string',
      label: intl.get(`sinv.common.model.message.contactInfo`).d('联系人信息'),
      align: 'left',
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
      align: 'left',
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
      align: 'left',
    },
    {
      name: 'catalogName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
      align: 'left',
    },
    {
      name: 'lineLocationRemark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
      align: 'left',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`entity.company.tag`).d('公司'),
      align: 'left',
    },
    {
      name: 'supplierSiteName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.companySiteName`).d('公司地点'),
      align: 'left',
    },
    {
      name: 'commonName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.commonName`).d('通用名'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.categoryNames`).d('物料类别'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, queryParams, ...other } = data;
      // const queryData = filterNullValueObject(
      //   parseParameters({
      //     supplierTenantId: getUserOrganizationId(),
      //     ...params,
      //     ...queryParams,
      //     ...other,
      //   })
      // );
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/can-create-asn`,
        method: 'GET',
        data: {
          ...params,
          ...queryParams,
          ...other,
          supplierTenantId: getUserOrganizationId(),
        },
      };
    },
  },
});

export { creationDataSet };
