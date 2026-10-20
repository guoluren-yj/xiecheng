import intl from 'utils/intl';

const DeliverHeaderDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'asnNum',
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
    },
    {
      name: 'asnTypeCode',
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
    },
    {
      name: 'immedShippedFlag',
      label: intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get(`sinv.common.model.common.shipAddress`).d('发货地点'),
    },
    {
      name: 'shipDate',
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      type: 'date',
    },
    {
      name: 'expectedArriveDate',
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
      type: 'dateTime',
    },
    {
      name: 'totalQuantity',
      label: intl.get(`sinv.common.model.common.shipmentsTotalQuantity`).d('发货总数'),
      type: 'number',
    },
    {
      name: 'transportType',
      label: intl.get(`sinv.common.model.common.transportType`).d('运输类型'),
    },
    {
      name: 'remark',
      label: intl.get('sinv.common.model.common.remark').d('备注'),
    },
  ],
});

const ShipHeaderInfoDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'organizationName',
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
    },
    {
      name: 'actualReceiverName',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
    },
    {
      name: 'contactInfo',
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
    },
  ],
});

export { DeliverHeaderDataSet, ShipHeaderInfoDataSet };
