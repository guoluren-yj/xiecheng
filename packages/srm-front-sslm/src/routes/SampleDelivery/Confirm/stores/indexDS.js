import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_CONFIRM.TABLE_LIST',
  'SSLM.SAMPLE_DELIVERY_CONFIRM.SEARCH_BAR',
];

const indexDS = () => ({
  primaryKey: 'reqId',
  cacheSelection: true,
  dataToJSON: 'selected',
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
      label: intl.get('sslm.sample.model.companyName').d('公司'),
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
      name: 'supplierNum',
      label: intl.get('sslm.sample.model.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCodeMeaning',
      label: intl.get('sslm.sample.model.supplierTypeMeaning').d('供应商类型'),
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
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
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.sample.releaseTime').d('发布时间'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.sample.feedbackTime').d('反馈时间'),
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
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/pageSampleSendReq/confirm`,
      method: 'GET',
      data: {
        ...data,
        customizeUnitCode: customizeUnitCode.join(),
      },
    }),
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!['FEEDBACKED', 'CONFIRM_REJECT'].includes(record.get('reqStatus'))) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { indexDS };
