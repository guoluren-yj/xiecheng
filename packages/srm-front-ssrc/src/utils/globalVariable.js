import { SRM_SSRC, SRM_HPFM } from '_utils/config';
import intl from 'utils/intl';

const Prefix = `${SRM_SSRC}/v1`;
const PrefixV2 = `${SRM_SSRC}/v2`;
const PrefixHpfmV1 = `${SRM_HPFM}/v1`;

/**
 * 获取当前模块对应的多语言
 * @param {Function} getName 传入的getName的方法
 * @returns name
 */
const getSourceCategoryName = (bidFlag) => {
  return bidFlag
    ? intl.get('ssrc.common.bid').d('招标')
    : intl.get('ssrc.common.inquiryPrice').d('询价');
};

const getDocumentTypeName = (bidFlag) => {
  return bidFlag
    ? intl.get('ssrc.common.view.message.bid').d('招标书')
    : intl.get('ssrc.common.view.message.rfx').d('询价单');
};

const getCheckPriceName = (bidFlag) => {
  return bidFlag
    ? intl.get('ssrc.common.view.message.target').d('定标')
    : intl.get('ssrc.common.view.message.nuclearPrice').d('核价');
};

const getOmitName = (bidFlag) => {
  return bidFlag ? '' : intl.get('ssrc.common.inquiryPrice').d('询价');
};

const getQuotationName = (bidFlag) => {
  return bidFlag
    ? intl.get('ssrc.common.model.common.tender').d('投标')
    : intl.get('ssrc.common.model.common.quotation').d('报价');
};

const getSourceName = (bidFlag) => {
  return bidFlag
    ? intl.get('ssrc.common.bid').d('招标')
    : intl.get('ssrc.common.model.common.source').d('寻源');
};

const getUnitCodePrefix = (bidFlag = false, rfxCode = '', bidCode = '') => {
  return bidFlag ? bidCode : rfxCode;
};

/**
 * 常用常量
 */
const BID = 'BID';
const BID_LOWERCASE = 'bid';
const INQUIRY = 'INQUIRY';
const INQUIRY_LOWERCASE = 'inquiry';
const INQUIRY_HALL = 'INQUIRY_HALL'; // 用于寻源明细-替换个性化
const INQUIRY_BID = 'INQUIRY_BID';
const RFX = 'RFX';
const RFX_LOWERCASE = 'rfx';
const INQUIRY_HALL_LOWERCASE = 'inquiryHall';
const NEW_BID_HALL_LOWERCASE = 'newBidHall';

const getCategoryCode = (bidFlag = false) => {
  return bidFlag ? BID : RFX;
};

export {
  Prefix,
  PrefixV2,
  PrefixHpfmV1,
  getSourceCategoryName,
  getCheckPriceName,
  getOmitName,
  getQuotationName,
  BID,
  BID_LOWERCASE,
  INQUIRY,
  INQUIRY_LOWERCASE,
  RFX,
  RFX_LOWERCASE,
  getDocumentTypeName,
  INQUIRY_HALL,
  INQUIRY_BID,
  getUnitCodePrefix,
  getCategoryCode,
  getSourceName,
  INQUIRY_HALL_LOWERCASE,
  NEW_BID_HALL_LOWERCASE,
};
