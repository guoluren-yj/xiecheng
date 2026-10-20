import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

const getLogisticsFormDS = params => ({
  fields: [
    {
      name: 'sendTypeCode',
      required: true,
      noCache: true,
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
      dynamicProps: {
        required: ({ record }) => record.get('sendTypeCode') === 'EXPRESS_DELIVERY',
        disabled: ({ record }) => record.get('sendTypeCode') !== 'EXPRESS_DELIVERY',
      },
    },
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sendUserName').d('送样人姓名'),
    },
    {
      name: 'sendUserPhone',
      type: 'tel',
      regionField: 'sendInternationalTelCode',
      label: intl.get('sslm.sample.model.sendUserPhone').d('送样人联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('sendInternationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'sendInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
      required: true,
    },
    {
      name: 'supplierRemark',
      label: intl.get('sslm.sample.model.supplierRemark').d('供应商备注'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/${params.detailReqId}`,
      method: 'get',
      // data: {},
      // params: {},
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/updateSendReq`,
        method: 'POST',
        data: data && data[0],
        params: {},
      };
    },
  },
  events: {
    update: ({ name, record }) => {
      if (name === 'sendTypeCode') {
        record.set('trackingNumber', null);
      }
    },
  },
});

const getLogisticsTableDS = params => ({
  paging: false,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'itemCode',
      label: intl.get('sslm.sample.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.sample.model.itemName').d('物料名称'),
    },
    {
      name: 'expectedDeliveryDate',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
      type: 'dateTime',
      required: true,
    },
    {
      name: 'sendTypeCode',
      required: true,
      noCache: true,
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
      dynamicProps: {
        required: ({ record }) => record.get('sendTypeCode') === 'EXPRESS_DELIVERY',
      },
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sslm.sample.model.upload.supplierAttachment').d('上传供应商附件'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/sample-infos/${params.detailReqId}/list`,
      method: 'get',
      data: {},
      params: {},
    },
  },
  events: {
    update: ({ name, record }) => {
      if (name === 'sendTypeCode') {
        record.set('trackingNumber', null);
      }
    },
  },
});

export { getLogisticsFormDS, getLogisticsTableDS };
