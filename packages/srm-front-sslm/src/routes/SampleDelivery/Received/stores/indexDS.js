import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_RECEIVED.LIST',
  'SSLM.SAMPLE_DELIVERY_RECEIVED.SEARCH_BAR',
];

const indexDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
    },
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.model.sample.customer').d('客户'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.model.ouName').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.sample.model.organizationName').d('库存组织'),
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get('sslm.sample.model.typeCodeMeaning').d('送样类型'),
    },
    {
      name: 'reqUserName',
      label: intl.get('sslm.sample.model.reqUserName').d('申请人'),
    },
    {
      name: 'reqInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'reqUserPhone',
      type: 'tel',
      regionField: 'reqInternationalTelCode',
      label: intl.get('sslm.sample.model.reqUserPhone').d('申请人联系电话'),
    },
    {
      name: 'recUserName',
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
    },
    {
      name: 'recInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'recUserPhone',
      type: 'tel',
      regionField: 'recInternationalTelCode',
      label: intl.get('sslm.sample.model.recUserPhone').d('接样人联系电话'),
    },
    {
      name: 'sampleSendAddress',
      label: intl.get('sslm.sample.model.sampleSendAddress').d('送样地址'),
    },
    {
      name: 'urgencyDegreeMeaning',
      label: intl.get('sslm.sample.model.urgencyDegreeMeaning').d('紧急程度'),
    },
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sample.sendUser').d('送样人'),
    },
    {
      name: 'sendInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'sendUserPhone',
      type: 'tel',
      regionField: 'sendInternationalTelCode',
      label: intl.get('sslm.sample.model.sendUserPhone').d('送样人联系电话'),
    },
    {
      name: 'sendTypeCodeMeaning',
      label: intl.get('sslm.sample.model.sendTypeCodeMeaning').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.releaseDate').d('发布时间'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'isPurchaseFlag',
      label: intl.get('sslm.sample.model.sampleInitiator').d('送样发起方'),
      lookupCode: 'SSLM.SAMPLE.IS_PURCHASE',
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.company').d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${tenantId}/sample-send-reqs/supplierSampleSendReq`,
      method: 'GET',
      data: {
        ...data,
        customizeUnitCode: customizeUnitCode.join(),
      },
    }),
  },
});

export { indexDS };
