// 字段映射
export const transformFields = [
  {
    name: 'bankCountryId',
    code: 'bankCountryObj',
  },
  {
    name: 'bankFirm',
    code: 'bankFirmObj',
  },
  {
    name: 'countryId',
    code: 'countryObj',
  },
  {
    name: 'regionId',
    code: 'regionPathName',
  },
  {
    name: 'currencyId',
    code: 'currencyLov',
  },
  {
    name: 'attachmentType',
    code: 'attachmentTypeMerge',
  },
  {
    name: 'supplierAttachmentUuid',
    code: 'attachmentUuid',
  },
  {
    name: 'paymentTypeId',
    code: 'paymentTypeLov',
  },
  {
    name: 'bankId',
    code: 'bankName',
  },
  {
    name: 'currencyCode',
    code: 'currencyObj',
  },
];

/**
 * 格式化国际化手机号格式
 * internationalTelMeaning 国别码meaning字段
 * phone 手机号码
 */
export function formatInternationalTel(internationalTelMeaning, phone) {
  let value = phone;
  if (internationalTelMeaning && phone) {
    value = `${internationalTelMeaning} | ${phone}`;
  }
  return value;
}
