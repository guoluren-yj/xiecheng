import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const commonOrganizationId = getCurrentOrganizationId();

const IPDS = (config = {}) => {
  const { sourceKey = INQUIRY, bidFlag } = config;
  return {
    primaryKey: 'id',
    paging: false,
    selection: false,
    fields: [
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`ssrc.common.company`).d('公司'),
      },
      {
        name: 'supplierCompanyIp',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonSupplierCompanyIp`, {
            quotationName: getQuotationName(sourceKey === BID || bidFlag),
          })
          .d('{quotationName}IP'),
      },
      {
        name: 'companyIpRate',
        label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.companyIpRate`).d('最高重合率')}(%)`,
      },
      {
        name: 'coincidenceCompanyName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincidenceCompanyName`).d('重合公司'),
      },
      {
        name: 'coincidenceSupplierIp',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincidenceSupplierIp`).d('重合IP'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { rfxHeaderId } = data;
        return {
          url: `${prefix}/${commonOrganizationId}/rfx/quotation/${rfxHeaderId}/Ip`,
          method: 'GET',
          data: {
            rfxHeaderId,
          },
        };
      },
    },
  };
};
export default IPDS;
