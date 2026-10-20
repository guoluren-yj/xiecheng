import classnames from 'classnames';
import React, { Fragment, useState, useCallback } from 'react';
import {
  isUndefined,
  isNumber,
  isObject,
  isNil,
  toString,
  isEmpty,
  head,
  forEach,
  isArray,
} from 'lodash';
import { Tag, Badge } from 'choerodon-ui';
import {
  NumberField,
  Icon,
  Attachment,
  Tooltip,
  SecretField,
  notification,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET, SRM_PLATFORM } from '_utils/config';
import {
  getCurrentOrganizationId,
  getAccessToken,
  isTenantRoleLevel,
  getCurrentUser,
  getAttachmentUrl,
} from 'utils/utils';
import { queryLovData } from 'services/api';

import styles from '@/routes/index.less';

const organizationId = getCurrentOrganizationId();
const previewUrl = isTenantRoleLevel()
  ? `${HZERO_FILE}/v1/${organizationId}/file/preview`
  : `${HZERO_FILE}/v1/file/preview`;
const previewUrl2 = `${HZERO_FILE}/v1/${organizationId}/file-preview`;
const bucketName = PRIVATE_BUCKET;
const statusMap = ['error', 'success'];

const { additionInfo: { enableDesensitize } = {} } = getCurrentUser();

// 整合state
export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

/**
 * 格式化国际化手机号格式
 * internationalTelMeaning 国别码meaning字段
 * phone 手机号码
 * secretFlag 是否脱敏
 * name 字段名称
 */
export function formatInternationalTel(
  internationalTelMeaning,
  phone,
  record,
  name = '',
  secretFlag = false
) {
  let value = phone;
  if (internationalTelMeaning && phone) {
    value = `${internationalTelMeaning} | ${phone}`;
  }
  if (name && secretFlag && enableDesensitize && record) {
    return value ? (
      <>
        <span>{internationalTelMeaning ? `${internationalTelMeaning} | ` : ''}</span>
        <SecretField name={name} record={record} displayOutput tooltip={false} />
      </>
    ) : (
      '-'
    );
  }
  return <span>{value || '-'}</span>;
}

/**
 * 格式化是／否
 * @param {*} val
 */
export function formatYesOrNo(val) {
  return isNil(val) ? '-' : yesOrNoRender(Number(val));
}

// 渲染修改前的是/否文本，此处不能加小红点
export function renderTextYesOrNo(val) {
  return Number(val)
    ? intl.get('hzero.common.status.yes').d('是')
    : intl.get('hzero.common.status.no').d('否');
}

/**
 * 格式化启用／禁用
 */
export function formatEnable(val) {
  return val
    ? intl.get('hzero.common.status.enable').d('启用')
    : intl.get('hzero.common.status.disable').d('禁用');
}

// 渲染可操作数据总数
export function renderTotal(total) {
  return total ? <span style={{ marginLeft: 4 }}>{total > 99 ? '99+' : total}</span> : null;
}

// 绿色状态集合
const greenStatus = [
  'FEEDBACK_BAK',
  'SCORED',
  'COMPLETED',
  'CONFIRMED',
  'APPROVED',
  'EFFECTED',
  'TERMINATION_CONFIRM',
  'HAVE_ALTERATION',
  'ARCHIVE',
  'APPROVE',
  'SYSTEM_COMPLETE',
  'MANUAL_COMPLETE',
  'FINAL_COLLECTED',
  'FEEDBACK',
  'UN_SOURCE',
  'OPENED',
  'POSTQUAL_CUTOFF',
  'FINISHED',
  'PUBLISHED',
  'VALIDATED',
  'REVIEWED',
  'REGISTERED',
  'PASS',
  'CERTIFICATED',
  'RELEASED',
  'COMPLETE',
  // 调查表模板生效状态为1
  1,
  '1',
  '5',
  5,
  'EVALUATED',
  'AUTHENTICATION_APPROVED',
  'EARLY_TERMINATION',
  'FINAL_AUTHENTICATION_COMPLETE',
  'SUBMITTED',
  'SUPPLIER_REJECTED',
  'SUPPLEMENT_COMPLETE',
  'REISSUED',
  'CREATE',
  'SUBMIT',
  'FINISHED@WFL',
  'APPROVING@WFL',
  'FUNC_APPROVE',
  'FEEDBACK_BAK',
  'ICA_SUBMITTED',
  'PCA_SUBMITTED',
  'SUPPLIER_CONFIRMED',
  'supplierConfirmed',
  'NEW_APPROVED',
  'published',
  'PARTIAL_PUBLISHED',
  'linked',
  'SUCCESS',
  'FIELD_ENABLE',
  'RESPONSED',
  'COOPERATED',
  'CANDIDATED',
  'APPROVED_SUGGEST',
];

// 红色状态集合
const redStatus = [
  'BACK',
  'REJECTED',
  'REJECT',
  'SYSTEM_FAIL',
  'RETURNED',
  'RELEASE_REJECT',
  'CONFIRM_REJECT',
  'BACK_SCORE',
  'RELEASE_REJECTED',
  'LACK_QUOTED',
  'CHECK_REJECTED',
  'PAUSED',
  'ICA_REJECTED',
  'PCA_REJECTED',
  'CANCEL FINISH APPROVAL REJECT',
  'PUBULISH APPROVAE REJECT',
  'FAIL',
  'WFL_REJECT',
  'REG_REJECT',
  'AUTHENTICATION_REJECTED',
  'CONFIRM_REJECTED',
  'REJECTED@WFL',
  'BACK',
  'NEW_REJECTED',
  '6',
  'SCORE_REJECTED',
  'TEMPT_DISABLED',
  'FAILED',
  // 调查表模板详情-启用字段
  'FIELD_DISABLE',
  'REJECTED_WFL',
  'NEW_EXT_REJECTED',
  'CONFIRM_EXT_REJECTED',
  'RESULT_REJECTED',
];

// 灰色状态集合
const grayStatus = [
  'EXPIRED',
  'DELETED',
  'TERMINATION',
  'CANCELLATION',
  'CANCEL',
  'DISCARDED',
  'CLOSED',
  'CANCELED',
  'CANCELLED',
  'ABANDON',
  'RETAIN',
  'UNCERTIFIED',
  'UNREGISTERED',
  'UNSTART', // 未开始
  'UN_START',
  'REGISTER',
  'DISABLED',
  'OBSOLETE',
  'OBSOLETED',
  'UNCHANGED',
  'DELETE',
  '2',
  'STAY_REVIEW',
  'NO_PARTNER',
  4,
  '4',
  'WITHDREW',
];

// 获取状态字体、背景颜色
export function getStatusClassName(status) {
  const className = greenStatus.includes(status)
    ? styles['success-color'] // 绿色
    : redStatus.includes(status)
    ? styles['error-color'] // 红色
    : grayStatus.includes(status)
    ? styles['gray-color'] // 灰色
    : styles['warning-color']; // 橙色
  return className;
}

// 获取Tag组件color
export function getTagColor(status) {
  const color = greenStatus.includes(status)
    ? 'green' // 绿色
    : redStatus.includes(status)
    ? 'red' // 红色
    : grayStatus.includes(status)
    ? 'gray' // 灰色
    : 'yellow'; // 橙色
  return color;
}

// 渲染单据状态
export function renderStatus({ value, name = '', record = {}, iconType = '', IconComp }) {
  const fieldCode = name.replace('Meaning', '');
  const status = record.get && record.get(fieldCode);
  const description = (record.get && record.get(`${fieldCode}Meaning`)) || value;
  const color = getTagColor(status);
  return description ? (
    <Tag color={color} style={{ border: 'none' }}>
      {description}
      {iconType && (
        <Icon
          type={iconType}
          style={{
            fontSize: 14,
            cursor: 'pointer',
            position: 'relative',
            margin: '-3px 0px 0 4px',
          }}
        />
      )}
      {IconComp && <IconComp style={{ marginLeft: '4px', verticalAlign: 'sub' }} />}
    </Tag>
  ) : (
    '-'
  );
}

// 渲染启用、禁用状态
export function renderEnable({ value }) {
  const color = +value ? 'green' : 'red';
  return (
    <Tag color={color} style={{ border: 'none' }}>
      {+value === 1
        ? intl.get('hzero.common.status.enable').d('启用')
        : intl.get('hzero.common.status.disable').d('禁用')}
    </Tag>
  );
}

// 支持附件预览的类型
export const supportPreviewList = [
  '.doc',
  '.docx',
  '.docm',
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  '.pdf',
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
  '.jpeg',
  '.jpg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
];

export const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  // ".pdf",
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];

// 判断是否可预览
export function isReview(attachmentDesc) {
  const fileExtMatch = attachmentDesc?.match(/(.[^.]+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
  return supportPreviewList.includes(fileExt);
}

// 附件预览
export function reviewFile(attachmentDesc, attachmentUrl) {
  const fileExtMatch = attachmentDesc.match(/(.[^.]+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
  const url = newUrlPreviewList.includes(fileExt) ? previewUrl : previewUrl2;
  window.open(
    `${url}?url=${encodeURIComponent(
      attachmentUrl
    )}&bucketName=${bucketName}&access_token=${getAccessToken()}`
  );
}

// 附件下载
export function downLoadFile(params) {
  const { tenantId, attachmentUrl } = params;
  const url = getAttachmentUrl(attachmentUrl, bucketName, tenantId);
  return url;
}

// c7n table 最大高度
export const c7nTableMaxHeight = 430;

export const tableMaxHeight = {
  hasTab: `calc(100% - 22px)`,
  fixedHeight: `calc(100% - 22px)`,
  hasGroupTab: `calc(100% - 22px)`,
};

export const tableHeight = {
  hasTab: `calc(100vh - 246px)`,
  fixedHeight: `calc(100vh - 194px)`,
  hasGroupTab: `calc(100vh - 254px)`,
};

/**
 * 千位分隔符
 * @param {String} val - 需要千分位分割
 */
export function numberSeparatorRender(val, precision) {
  if (!val && val !== 0) return val;
  const locale = getCurrentUser()?.language?.replace('_', '-');
  const minimumFractionDigits =
    isUndefined(precision) || !isNumber(precision) ? math.dp(val) : precision;
  return NumberField.format(val, locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}

/**
 *  公共值集查询默认值
 * @param {*} params lovCode: 值集编码，serverCode: 服务简码
 */
export function handleDefaultLovData(params = {}) {
  const { serverCode = SRM_PLATFORM, lovCode = '', page = 0, size = 10 } = params;
  return queryLovData(`${serverCode}/v1/lovs/sql/data`, {
    lovCode,
    page,
    size,
  });
}

// 渲染附件文本
export function renderAttachmentText({ editable, fileCount, linkColor }) {
  return (
    <Fragment>
      {editable
        ? intl.get('hzero.common.upload.text').d('上传附件')
        : intl.get('hzero.common.upload.view').d('查看附件')}
      <Tag
        color={linkColor || '#108ee9'}
        style={{ height: 'auto', lineHeight: '15px', marginLeft: 4, fontWeight: 400 }}
      >
        {fileCount || 0}
      </Tag>
    </Fragment>
  );
}

// 渲染c7n附件文本
export function renderC7NAttachmentText({ editable, fileCount }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Icon
        type={editable ? 'file_upload' : 'attach_file'}
        style={{ fontSize: 14, fontWeight: 400, marginRight: 5 }}
      />
      <span>
        {editable
          ? intl.get('hzero.common.upload.text').d('上传附件')
          : intl.get('hzero.common.upload.view').d('查看附件')}
      </span>
      <span style={{ marginLeft: 2 }}>{fileCount || 0}</span>
    </div>
  );
}

export const defaultMaxFileSize = 500 * 1024 * 1024;

// 粗略计算字符串宽度，更优方法可替换
export const getTooltipShow = (value = '', fontSize = 12, maxWidth = 0) => {
  if (value) {
    // 总字节个数
    const charCount = value.split('').reduce((prev, curr) => {
      // 英文字母和数字等算一个字符
      if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(curr)) {
        return prev + 1;
      }
      // 其他的算是2个字符
      return prev + 2;
    }, 0);
    // 字符串长度
    const strLength = Math.ceil(charCount / 2);
    // 字符串宽度
    const strWidth = strLength * fontSize;
    // 字符串宽度大于外层容器宽度则使用tooltip显示
    const showTooltipFlag = strWidth > maxWidth;
    return (
      <Tooltip placement="topLeft" title={showTooltipFlag ? value : ''}>
        {value}
      </Tooltip>
    );
  }
};

export function renderTabPaneTitle({
  editable,
  configName,
  configNames = [],
  configDescription,
  validated = false,
  showTag = false,
}) {
  const showValidateMessage = showTag && !validated;
  const maxWidth = showValidateMessage ? 155 : 220;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: editable ? 'space-between' : 'normal',
      }}
    >
      <div
        style={{
          maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'noWrap',
        }}
      >
        {/* 展示【待填写】时，使用自定义tooltip，此时组件的tooltip不生效 */}
        {showValidateMessage ? getTooltipShow(configDescription, 14, maxWidth) : configDescription}
      </div>
      {showValidateMessage && (
        <Tag color="yellow" style={{ border: 'none', marginLeft: 4, marginRight: 0 }}>
          {intl.get('sslm.common.view.message.toFilled').d('待填写')}
        </Tag>
      )}
      {!editable && configNames.includes(configName) && <Badge dot style={{ marginLeft: 10 }} />}
    </div>
  );
}

// 渲染必输/不必输
export function renderRequired(value) {
  return (
    <Badge
      status={statusMap[value]}
      text={
        value === 1
          ? intl.get(`sslm.common.model.common.required`).d('必输')
          : intl.get(`sslm.common.model.common.notRequired`).d('不必输')
      }
    />
  );
}

// 渲染允许/不允许
export function renderAllow(value) {
  return (
    <Badge
      status={statusMap[value]}
      text={
        value === 1
          ? intl.get(`sslm.common.model.common.allow`).d('允许')
          : intl.get(`sslm.common.model.common.notAllow`).d('不允许')
      }
    />
  );
}

// 处理c7n多选lov翻译取值问题(因后端数据要兼顾老的穿梭框多选组件)
export const hanldeC7nMultipleLovMeaning = value => {
  const arr = [];
  if (isObject(value)) {
    for (const key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        const element = value[key];
        arr.push(element);
      }
    }
  }
  return arr;
};

/**
 * 判断是否是json数据
 * @param {String} str
 */
export const isJSON = str => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
};

// 对比标红标识
export const getRedFlag = ({ name, record }) => {
  let flag = false;
  if (record) {
    flag =
      ['CREATE', 'DELETE'].includes(record.get('objectFlag')) ||
      ['insert', 'CREATE', 'DELETE'].includes(record.get('firmChangeBeanStateFlag')) ||
      record.get(`${name}Flag`) === 'UPDATE' ||
      ['insert', 'delete'].includes(record.get('supChangeBeanStateFlag')) ||
      ['update', 'insert', 'delete', 'UPDATE', 'DELETE', 'INSERT'].includes(
        record.get(`${name}StateFlag`)
      );
  }
  return flag;
};

// 个性化字段变更标红
export const handleExtTextRenderIntercept = ({ name, record }, node) => {
  const redFlag = getRedFlag({ name, record });
  return <span style={{ color: redFlag && 'red' }}>{node || '-'}</span>;
};

// 版本对比渲染
export const handleCompareRender = ({
  value,
  record,
  name,
  type,
  displayField,
  toolTipPrefix = '',
  showInsert = false, // 新增数据显示tip
  showInsertTip = '', // 新增数据tip描述
}) => {
  let renderValue;
  let redFlag = false;
  let toolTipText = '';
  let oldValueMeaning = null;
  let oldValue = null;
  let renderOldValue = null;
  let deleteDataFlag = false;
  let showToolTipFlag = false;
  let insertFlag = false;
  if (record) {
    deleteDataFlag =
      ['DELETE', 'delete'].includes(record.get('objectFlag')) ||
      ['DELETE', 'delete'].includes(record.get('firmChangeBeanStateFlag'));
    redFlag =
      record.get('objectFlag') === 'CREATE' ||
      ['insert', 'CREATE'].includes(record.get('firmChangeBeanStateFlag')) ||
      record.get(`${name}Flag`) === 'UPDATE' ||
      ['insert', 'delete'].includes(record.get('supChangeBeanStateFlag')) ||
      ['update', 'insert', 'delete', 'UPDATE', 'DELETE', 'INSERT'].includes(
        record.get(`${name}StateFlag`)
      ) ||
      deleteDataFlag;
    oldValue = record.get(`${displayField}Old`) || record.get(`${name}Old`);
    oldValueMeaning = record.get(`${displayField}MeaningOld`) || record.get(`${name}MeaningOld`);
    renderOldValue = oldValueMeaning || oldValue;
    // 新增行，删除行悬浮不提示
    insertFlag =
      ['insert', 'CREATE'].includes(record.get('firmChangeBeanStateFlag')) ||
      record.get('objectFlag') === 'CREATE';
    const noTooltipFlag = deleteDataFlag || (!showInsert && insertFlag);
    showToolTipFlag = (toolTipPrefix || showInsertTip) && !noTooltipFlag && redFlag;
  }
  if (record && !['attachment', 'Upload'].includes(type)) {
    switch (type) {
      case 'Lov':
      case 'select':
      case 'ValueList':
      case 'LOV':
      case 'SELECT':
        // 兼容调查表的附件类型
        renderValue = record.get(displayField) || record.get(`${name}Meaning`) || value;
        break;
      case 'TransferLov':
        renderValue = hanldeC7nMultipleLovMeaning(record.get(`${name}Meaning`)).join();
        break;
      case 'date':
      case 'DatePicker':
        renderValue = dateRender(value);
        break;
      case 'boolean':
      case 'Switch':
      case 'Checkbox':
      case 'CHECKBOX':
        renderValue = isNil(value) ? null : formatYesOrNo(value);
        renderOldValue = isNil(oldValue) ? null : oldValueMeaning || renderTextYesOrNo(oldValue);
        break;
      case 'phone':
        renderValue = formatInternationalTel(record.get('internationalTelMeaning'), value);
        break;
      default:
        renderValue = isObject(value) ? value[displayField] : value;
        break;
    }
    renderOldValue =
      isNil(renderOldValue) || renderOldValue === '' ? '-' : toString(renderOldValue);
    // 处理提示
    if (showInsert && insertFlag) {
      toolTipText = showToolTipFlag ? `${showInsertTip}` : '';
    } else {
      toolTipText = showToolTipFlag ? `${toolTipPrefix}${renderOldValue}` : '';
    }
    return (
      <Tooltip placement="top" title={toolTipText}>
        <span
          style={{ color: redFlag && 'red' }}
          className={classnames({
            [styles['sslm-table-field-delete']]: deleteDataFlag,
          })}
        >
          {isNil(renderValue) || renderValue === '' ? '-' : renderValue}
        </span>
      </Tooltip>
    );
  } else if (['attachment', 'Upload'].includes(type)) {
    return (
      <Attachment
        readOnly
        name={name}
        funcType="flat"
        viewMode="popup"
        bucketName={PRIVATE_BUCKET}
        className={classnames(styles['sslm-attachment-wrap'], {
          [styles['sslm-compare-info-style']]: redFlag,
          [styles['sslm-table-field-delete']]: deleteDataFlag,
        })}
      />
    );
  }
};

// 获取策略逻辑
export const getConditionType = () => ({
  TRUE: intl.get('sslm.common.model.select.true').d('无条件限制'),
  OR: intl.get('sslm.common.model.select.or').d('满足任一条件'),
  AND: intl.get('sslm.common.model.select.and').d('满足所有条件'),
  CUSTOMIZE: intl.get('sslm.common.model.select.customize').d('自定义组合规则'),
});

// 获取策略特性条件
export const getOperatorType = () => ({
  LESS: intl.get('sslm.common.model.rulesDefinition.less').d('小于'),
  LESSOREQUAL: intl.get('sslm.common.model.rulesDefinition.lessOrEqual').d('小于等于'),
  EQUALS: intl.get('sslm.common.model.rulesDefinition.equals').d('等于'),
  MOREOREQUAL: intl.get('sslm.common.model.rulesDefinition.more').d('大于等于'),
  MORE: intl.get('sslm.common.model.rulesDefinition.moreOrEqual').d('大于'),
  IN: intl.get('sslm.common.model.rulesDefinition.in').d('包含'),
  NOT_IN: intl.get('sslm.common.model.rulesDefinition.notIn').d('不包含'),
  NOTEQUALS: intl.get('sslm.common.model.rulesDefinition.notequals').d('不等于'),
  EXISTS: intl.get('sslm.common.model.rulesDefinition.exists').d('不为空'),
  NOT_EXISTS: intl.get('sslm.common.model.rulesDefinition.not_exists').d('为空'),
});

// 获取表单信息变更隐藏字段
export const getFieldHiddenProps = ({ record, name, hidden = false }) => {
  let props = {};
  if (hidden) {
    props = {
      hidden,
    };
    return props;
  }
  if (record && name) {
    const changeFlag = toString(record.get(`${name}StateFlag`) || '');
    const showFlag =
      record.get(`${name}Flag`) === 'UPDATE' ||
      ['update', 'insert'].includes(changeFlag.toLowerCase());
    props = {
      hidden: !showFlag,
    };
  }
  return props;
};

// 处理业务信息公司logo
export const handleCompanyLogoUrl = logoUrl => {
  let companyLogoUrl = '';
  if (logoUrl) {
    // 处理附件格式
    const temp = logoUrl.split('/');
    if (isEmpty(temp)) {
      return '';
    }
    const fileFullName = temp[temp.length - 1];
    const index = fileFullName.indexOf('@');
    if (index === -1) {
      return '';
    }
    const finallFileName = fileFullName.substring(index + 1);
    if (!/.(jpeg|jpg|png)$/i.test(finallFileName)) {
      return '';
    }
    companyLogoUrl = getAttachmentUrl(logoUrl, PRIVATE_BUCKET, 0, 'rel_folder');
  }
  return companyLogoUrl;
};

// 调查表页签
export const INVESTG_CONFIG_NAME = {
  SSLM_INVESTG_CONTACT: 'sslmInvestgContact',
  SSLM_INVESTG_ADDRESS: 'sslmInvestgAddress',
  SSLM_INVESTG_BANK_ACCOUNT: 'sslmInvestgBankAccount',
  SSLM_INVESTG_ATTACHMENT: 'sslmInvestgAttachment',
  SSLM_INVESTG_FIN: 'sslmInvestgFin',
};

// 个性化重合页签
export const PERSONALIZE_COINCIDE_TABS = Object.values(INVESTG_CONFIG_NAME);

// 防XSS漏洞，供应商认证附件目录名
export const FILE_BUCKET_DIRECTORY = 'spfm-business-license';

export const BANK_ACCOUNT_CONSTANT = {
  DUPLICATE: 'duplicate',
};

export function getBankAccountTips(type = '') {
  return type === BANK_ACCOUNT_CONSTANT.DUPLICATE
    ? intl
        .get('sslm.common.view.message.bankDuplicateTips')
        .d('存在银行账户重复的数据，请检查数据，确认是否继续提交')
    : intl
        .get('sslm.common.view.message.bankAccountDifferentTips')
        .d('银行账户名称与公司名称不一致，请确认是否继续提交');
}

/**
 * 获取校验ds报错
 * @param {*} dataSet dataSet: [] | object
 * dataSet 传入单个dataSet时只需传入ds对象
 * 当一个页签包含多个ds时需处理成[{ subDataSet: [] , subTabName: string | unddefined }]
 * subDataSet 页签ds集合
 * subTabName 页签名称
 * @returns
 */
export const getDsValidationErrors = dataSet => {
  const errorsMsg = [];
  if (!dataSet) {
    return errorsMsg;
  }
  let newDsList = dataSet;
  if (!isArray(newDsList)) {
    newDsList = [
      {
        subDataSet: [dataSet],
      },
    ];
  }
  // 遍历页签
  newDsList.forEach(i => {
    const { subDataSet = [], subTabName } = i;
    const fieldErrors = [];
    // 变量页签ds
    subDataSet.forEach(ds => {
      if (ds) {
        const { errors = [] } = head(ds.getValidationErrors()) || {};
        if (!isEmpty(errors)) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              fieldErrors.push(<div>{validationMessage}</div>);
            }
          });
        }
      }
    });
    if (!isEmpty(fieldErrors)) {
      if (subTabName) {
        // 设置子页签名称
        errorsMsg.push(<div style={{ fontWeight: 600, fontSize: 14 }}>{subTabName}</div>);
      }
      errorsMsg.push(...fieldErrors);
    }
  });
  return errorsMsg;
};

// 校验多个页签报错提示
/**
 * @param {*} validateList 校验集合 [{ dataSet: ds | [{ subDataSet: [] , subTabName: string }], tabName: string }]
 * dataSet 传入单个dataSet时只需传入ds对象，传入多个时需处理成[{ subDataSet: [] , subTabName: string }]
 * subDataSet: [ds1, ds2, ...]
 * tabName 页签名称
 */
export const getTabValidationErrors = (validateList = []) => {
  validateList.forEach(i => {
    const { dataSet, tabName } = i;
    const errorsMsg = getDsValidationErrors(dataSet);
    if (!isEmpty(errorsMsg)) {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.common.view.warn.dataNotFilled', {
            name: tabName,
          })
          .d(`【${tabName}】未填写`),
        description: errorsMsg,
      });
    }
  });
};

// 电子签章认证状态
export const renderThirdServiceAuthStatus = (record = {}) => {
  const {
    thirdServiceAuthStatus,
    thirdServiceAuthorizeStatus,
    thirdServiceAuthStatusMeaning,
    thirdServiceAuthorizeStatusMeaning,
  } = record || {};
  const firstFieldColor = getTextColor(thirdServiceAuthStatus, true);
  const secondFieldColor = getTextColor(thirdServiceAuthorizeStatus, false);
  const firstFieldColorProps = getTextColorProps(firstFieldColor) || {};
  const secondFieldColorProps = getTextColorProps(secondFieldColor) || {};
  return (
    <span>
      <span
        style={{
          padding: '2px 4px',
          borderRadius: '2px',
          ...firstFieldColorProps,
        }}
      >
        {thirdServiceAuthStatusMeaning ||
          intl.get('sslm.common.view.message.notCertified').d('未认证')}
      </span>
      <span
        style={{
          padding: '2px 4px',
          borderRadius: '2px',
          ...secondFieldColorProps,
          margin: '0 5px',
        }}
      >
        {thirdServiceAuthorizeStatusMeaning ||
          intl.get('sslm.common.view.message.unauthorized').d('未授权')}
      </span>
    </span>
  );
};

const getTextColor = (status, firstFlag = false) => {
  let textColor;
  switch (status) {
    case 0:
      textColor = 'gray';
      break;
    case 3:
      textColor = 'yellow';
      break;
    case 1:
      textColor = 'green';
      break;
    case 2:
    case 4:
      textColor = firstFlag ? 'red' : 'gray';
      break;
    default:
      textColor = 'gray';
      break;
  }
  return textColor;
};

const getTextColorProps = status => {
  let color;
  let backgroundColor;
  switch (status) {
    case 'gray':
      color = 'rgba(0,0,0,0.65)';
      backgroundColor = 'rgba(0,0,0,0.06)';
      break;
    case 'yellow':
      color = '#F88D10';
      backgroundColor = 'rgba(252,160,0,0.10)';
      break;
    case 'green':
      color = '#47B881';
      backgroundColor = 'rgba(71,184,129,0.10)';
      break;
    case 'red':
      color = '#F56349';
      backgroundColor = 'rgba(245,99,73,0.10)';
      break;
    default:
      color = 'rgba(0,0,0,0.65)';
      backgroundColor = 'rgba(0,0,0,0.06)';
      break;
  }
  return {
    color,
    backgroundColor,
  };
};
