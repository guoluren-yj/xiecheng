import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const OverlappingSupplierDS = ({
  rfxLineSupplierId,
  quotationHeaderId,
  whetherIpCoincide,
  sourceHeaderId,
}) => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'quotationIpAddress',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationIpAddress`).d('报价IP'),
    },
    {
      name: 'operateIpNodesMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operateIpNodes`).d('操作IP节点'),
    },
    {
      name: 'coincideSupplier',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincideSupplier`).d('重合供应商'),
    },
    {
      name: 'coincideNodeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincideNode`).d('重合节点'),
    },
    {
      name: 'ipAcquisitionDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ipAcquisitionDate`).d('IP获取时间'),
      type: 'dateTime',
    },
    {
      name: 'ipAddressLocation',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ipAddressLocation`).d('IP地址归属地'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/supplier/ip/check/detail`,
        method: 'GET',
        data: {
          ...data,
          rfxLineSupplierId,
          quotationHeaderId,
          whetherIpCoincide,
          rfxHeaderId: sourceHeaderId,
          checkIpType: 'SINGLE_IP_CHECK_COINCIDE',
        },
      };
    },
  },
});

const NoOverlappingSupplierDS = ({
  rfxLineSupplierId,
  quotationHeaderId,
  whetherIpCoincide,
  sourceHeaderId,
}) => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商'),
    },
    {
      name: 'operateIpNodesMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operateIpNodes`).d('操作IP节点'),
    },
    {
      name: 'ipAddress',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ipAddress`).d('IP'),
    },
    {
      name: 'ipAcquisitionDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ipAcquisitionDate`).d('IP获取时间'),
    },
    {
      name: 'ipAddressLocation',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ipAddressLocation`).d('IP地址归属地'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/supplier/ip/check/detail`,
        method: 'GET',
        data: {
          ...data,
          rfxLineSupplierId,
          quotationHeaderId,
          whetherIpCoincide,
          rfxHeaderId: sourceHeaderId,
          checkIpType: 'SINGLE_IP_CHECK_COINCIDE',
        },
      };
    },
  },
});

export { OverlappingSupplierDS, NoOverlappingSupplierDS };
