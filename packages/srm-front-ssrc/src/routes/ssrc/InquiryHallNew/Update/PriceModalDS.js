/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-10-12 14:17:37
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-10-21 10:47:49
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSRC}/v1`;

const PriceModalDS = () => {
  return {
    autoQuery: false,
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
        width: 110,
      },
      {
        label: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPriceUnTax`).d('单价(不含税)'),
        name: 'unitPrice',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxType`).d('税种'),
        name: 'taxCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRateUnSym`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceSource`).d('价格来源'),
        name: 'priceSourceMeaning',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${prefix}/${organizationId}/share/application/reference-price`,
          method: 'GET',
          data: parseParameters(data),
        };
      },
    },
  };
};

export default PriceModalDS;
