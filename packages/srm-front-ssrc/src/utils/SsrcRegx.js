/**
 * 验证 手机,
 * 提示: intl.get('hzero.common.validation.phone').d('手机格式不正确')
 */
export const PHONE_TELEPHONE = /^(134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0-8]\d{8}$|^18[\d]{9}$|^19[8,9]\d{8})$|^(0\d{2,3}-?|\(0\d{2,3}\))?[1-9]\d{6,7}(-\d{1,4})?$/;

// 附件大小
const FIlESIZE = null; // 上传附件大小控制

// 断点上传-common props
const ChunkUploadProps = {
  useChunk: true, // C7N 是否开启断点续传模式
  chunkUpload: true, // 是否开启断点续传模式
  chunkSize: 100 * 1024 * 1024, // 文件分片大小
  fileSize: null,
};

const FILE_SIZE = 1024 * 1024 * 1024; // 上传文件1g大小限制 (招标大厅)

// 字段匹配末尾数字
// demo11 => demo
export const MatchStringEndNumReg = /([a-zA-Z_]*)(\d+)$/g;

// 匹配所有attribute属性
export const FilterAttribute = /^(attribute)\w/i;

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

//
const DayMillisecond = 86_400_000;

const CHINESEREG = /[\u4e00-\u9fa5]/gm;

const TAIWAN_PASSAGE = /^[0-9]{8}([0-9]{2})?$/;

export {
  FIlESIZE,
  FILE_SIZE,
  ChunkUploadProps,
  urlReg,
  DayMillisecond,
  CHINESEREG,
  TAIWAN_PASSAGE,
};
