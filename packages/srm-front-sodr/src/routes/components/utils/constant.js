import { PRIVATE_BUCKET } from '_utils/config';

const BUCKET_NAME = PRIVATE_BUCKET;
const BUCKET_DIRECTORY = 'sodr-order';
// const MAX_QUAN_NUMBER = '99999999999999999999.9999999999';
const MAX_QUAN_NUMBER = '99999999999999999999.9999999999';
const THROTTLE_TIME = 1500;

/**
 *  采购方内部附件目录名
 */
export const PURCHASER_INTERNAL_DIRECTORY = 'sodr-purchaser-internal';
/**
 *  采购方外部附件目录名
 */
export const PURCHASER_EXTERNAL_DIRECTORY = 'sodr-purchaser-external';
/**
 *  订单解约附件目录名
 */
export const TERMINATE_SIGN_DIRECTORY = 'sodr-terminate-sign';
/**
 *  供应商附件目录名
 */
export const SUPPLIER_DIRECTORY = 'sodr-supplier';
/**
 *  行附件目录名
 */
export const LINE_DIRECTORY = 'sodr-line';
/**
 *  留言板附件目录名
 */
export const MESSAGE_DIRECTORY = 'sodr-message';
/**
 * 标准SAAS签章AuthType的正则校验
 */
export const SAAS_SIGN = /_SAAS$/;
export { BUCKET_NAME, BUCKET_DIRECTORY, MAX_QUAN_NUMBER, THROTTLE_TIME };
