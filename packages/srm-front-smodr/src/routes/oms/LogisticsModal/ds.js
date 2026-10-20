import intl from 'utils/intl';

const baseDS = () => ({
  fields: [
    {
      name: 'logisticOrderNum',
      label: intl.get('smodr.common.view.courier.number').d('快递单号'),
    },
    {
      name: 'logisticCompanyMeaning',
      label: intl.get('smodr.common.view.logistics.company').d('物流公司'),
    },
    {
      name: 'srmConsignmentCode',
      label: intl.get('smodr.common.view.invoice.no').d('发货单号'),
    },
    {
      name: 'ecConsignmentCode',
      label: intl.get('smodr.common.view.common.subPoNum').d('子订单号'),
    },
    {
      name: 'logisticsStaff',
      label: intl.get('smodr.common.view.common.deliveryStaff').d('配送人员'),
    },
    {
      name: 'logisticsContactInfo',
      label: intl.get(`smodr.common.view.contactInformation`).d('联系方式'),
    },
  ],
});

export { baseDS };
