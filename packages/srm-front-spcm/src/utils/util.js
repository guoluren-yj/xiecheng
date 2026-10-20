/*
 * @Description:
 * @Date: 2022-05-25 10:08:46
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useState, useCallback } from 'react';
import { getCurrentLanguage, getResponse } from 'utils/utils';
import { isNaN, isUndefined, isNumber, isEmpty, isNil, isArray, pickBy } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { DataSet, Modal as C7nModal, NumberField, Table } from 'choerodon-ui/pro';
import { Modal } from 'hzero-ui';
import BigNumber from 'bignumber.js';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import EmbedPage from '_components/EmbedPage';
import { filterNullValueObject } from 'utils/utils';

import {
  queryDoubleUomConfig,
  queryDoubleUnitConversion,
  checkPermisssions,
  pcBudgetCheck,
  referencePrmWhitelist,
} from '@/services/contractCommonService';

/**
 * 数字格式化千分位
 * @param {number|string} value
 * @param {number} minPrecision
 * @param {number} maxPrecision
 * @returns
 */
const renderThousandthNum = (value, precision) => {
  if ((!value && value !== 0) || isNaN(+value)) return value;
  let lang = getCurrentLanguage();
  lang = lang.replace('_', '-');
  const minimumFractionDigits =
    isUndefined(precision) || !isNumber(precision) ? math.dp(value) : precision;
  return NumberField.format(value, lang, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
};

/**
 * 科学计数法转化
 * @param {number} num 数值
 * @returns
 */
function toNonExponential(num) {
  const newNumber = new BigNumber(num);
  const m = newNumber.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return newNumber.toFixed(Math.max(0, (m?.[1] || '').length - (m?.[2] || 0)));
}

/**
 * 精度处理
 * @param {*} precision 精度数据
 * @returns number
 */
export function getPrecision(precision) {
  const _default = 10;
  const _precision = !isNil(precision) ? Number(precision) : _default;
  return _precision;
}

/**
 * 大数据提示校验
 * @param {stirng} value 输入值
 * @param {function} callback 校验函数
 * @param {boolean} decimal 是否校验小数位长度
 * @returns
 */
const validateBits = (value, callback, decimal) => {
  if (callback) {
    if (!isNaN(value) && value) {
      if (decimal && !/^\d{1,20}(\.\d{0,10})?$/g.test(toNonExponential(value))) {
        callback(
          intl
            .get('hzero.common.validation.new.maxFourteenIntAndSixDecimal')
            .d('该数值最大限制为二十位整数加十位小数')
        );
      } else if (!/^\d{1,20}(\.\d*)?$/g.test(toNonExponential(value))) {
        callback(intl.get('hzero.common.validation.new.maxTwentyBits').d('整数位最多不超过二十位'));
      }
    }
    callback();
  } else {
    if (isNaN(value) || !value) {
      return true;
    }
    if (!isNaN(value) && value && !/^\d{1,20}(\.\d*)?$/g.test(toNonExponential(value))) {
      return intl.get('hzero.common.validation.new.maxTwentyBits').d('整数位最多不超过二十位');
    }
  }
};

/**
 * 去除段落分隔符(2029)、行分隔符(2028)等一些不可见unicode编码
 * @param {stirng} s 待处理字符串
 * @returns 处理完之后的字符串
 */
export const tirmSpecialCode = (s) => {
  const str = JSON.stringify(s)?.replace(
    /\\u2006|\\u00a0|\\u0020|\\u0008|\\u0009|\\u000a|\\u000b|\\u000c|\\u000d|\\u2028|\\u2029|\\ufeff|\\u200e|\\u200d|\\u3000/g,
    ''
  );
  return JSON.parse(str);
};

// 公用获取双单位配置
const queryCommonDoubleUomConfig = async (params) => {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
};

/**
 * 拼接单位展示
 * @param {String} uomCode 单位编码
 * @param {String} uomName 单位名称
 * @returns uomCodeAndName
 */
const formatUom = (uomCode, uomName) => {
  if (uomCode || uomName) {
    return `${uomCode || ''}/${uomName || ''}`;
  }
};

/**
 * H0协议维护 物料变更时获取 辅助单位
 * @param {Object} basicUomObj 基本单位信息
 * @param {Boolean} spcmEnabled 协议是否开启双单位
 * @param {Object} lovRecord 选中的物料值集信息
 * @returns {Object}
 */
const getSecondaryUomFormItem = ({ spcmEnabled, lovRecord = {} }) => {
  const { uomId, uomCode, uomName, uomCodeAndName = formatUom(uomCode, uomName) } = lovRecord;
  const { secondaryUomId, secondaryUomCode, secondaryUomName, secondaryUomCodeAndName } = lovRecord;
  const unEnabledSecondaryObj = {
    secondaryUomId: uomId,
    secondaryUomCode: uomCode,
    secondaryUomName: uomName,
    secondaryUomCodeAndName: uomCodeAndName,
  };
  const _secondaryUomObj = {
    secondaryUomId,
    secondaryUomCode,
    secondaryUomName,
    secondaryUomCodeAndName,
  };
  let secondaryUomObj = {};
  secondaryUomObj = spcmEnabled
    ? secondaryUomId
      ? _secondaryUomObj
      : unEnabledSecondaryObj
    : unEnabledSecondaryObj;
  return secondaryUomObj;
};

/**
 * H0-数量换算接口更新
 * @param {Object} record
 * @param {Object} record 当前数据
 */
export async function conversionUpdateForH0({
  record,
  clearQuantity,
  lovRecord = {},
  doubleUnitEnabled,
  value,
  field = 'quantity',
}) {
  const spcmEnabled = doubleUnitEnabled !== 0;
  const { setFieldsValue = (e) => e, getFieldsValue = (e) => e } = record?.$form || {};
  const { itemId, uomId: doublePrimaryUomId, secondaryQuantity = -1, secondaryUomId } = {
    ...getFieldsValue(),
    ...lovRecord,
  };
  if (!(itemId && doublePrimaryUomId && (secondaryQuantity || value) > -1 && secondaryUomId)) {
    return;
  }
  const businessKey = '-9999';
  const itemOrgUom = {
    itemId,
    businessKey,
    secondaryUomId,
    secondaryQuantity: value || secondaryQuantity,
    doublePrimaryUomId,
  };
  if (spcmEnabled) {
    try {
      const list = await queryDoubleUnitConversion([itemOrgUom]);
      if (getResponse(list)) {
        if (!isEmpty(list)) {
          const target = list.find((j) => j.businessKey === businessKey);
          if (target && target.primaryQuantity > -1) {
            setFieldsValue({ [field]: target.primaryQuantity });
          }
          // eslint-disable-next-line no-param-reassign
          record.__calculateError__ = false;
          if (clearQuantity) {
            setFieldsValue({ [field]: undefined });
          }
          // setFieldsValue({ calculateError: true });
        }
        return Promise.resolve(list);
      } else {
        // eslint-disable-next-line no-param-reassign
        record.__calculateError__ = true;
        // setFieldsValue({ calculateError: true });
        return Promise.reject();
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * h0 辅助单位、辅助数量 字段变化换算
 * @param {Object} record 行数据
 * @param {String} fieldName 变动字段
 * @param {Object} fieldProps 当前字段变动传入数据
 * @param {Number} doubleUnitEnabled 双单位是否开启
 * @param {Function} calc 传入的计算方法
 */
export async function conversionUpdateUomIdForH0({
  record,
  fieldName = 'uom',
  fieldProps,
  doubleUnitEnabled,
}) {
  if (fieldName === 'uom') {
    const { uomId, uomCode, uomName, uomCodeAndName, secondaryUomPrecision } = fieldProps || {};
    const { setFieldsValue = (e) => e, getFieldValue = (e) => e } = record?.$form || {};
    if (!uomId) return;
    setFieldsValue({
      secondaryUomId: uomId,
      secondaryUomCode: uomCode,
      secondaryUomName: uomName,
      secondaryUomCodeAndName: uomCodeAndName,
      secondaryUomPrecision,
    });

    if (!getFieldValue('itemId')) {
      setFieldsValue({
        uomId,
        uomCode,
        uomName,
        uomCodeAndName,
        uomPrecision: secondaryUomPrecision,
      });
    } else if (doubleUnitEnabled && uomId) {
      conversionUpdateForH0({
        record,
        doubleUnitEnabled,
      });
    }
  }
}

/**
 * C7N-数量/单位字段换算更新
 * @param {Object} dataSet
 * @param {Object} record 当前数据
 */
const conversionUpdate = async ({
  dataSet,
  record,
  field = 'quantity',
  secField = 'secondaryQuantity',
  lovRecord = {},
  loading = (e) => e,
}) => {
  const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
  const spcmEnabled = doubleUnitEnabled !== 0;
  const businessKey = '-9999';
  const itemId = record.get('itemId') || lovRecord.itemId;
  const doublePrimaryUomId = record.get('uomId') || lovRecord.uomId;
  const secondaryQuantity = record.get(secField) || -1;
  const secondaryUomId =
    record.get('secondaryUomId')?.uomId || record.get('secondaryUomId') || lovRecord.secondaryUomId;
  if (!(itemId && doublePrimaryUomId && secondaryQuantity > -1 && secondaryUomId)) return;
  const itemOrgUom = {
    itemId,
    businessKey,
    secondaryUomId,
    secondaryQuantity,
    doublePrimaryUomId,
  };
  if (spcmEnabled) {
    try {
      loading({ conversionUpdate: true });
      const list = await queryDoubleUnitConversion([itemOrgUom]);
      if (getResponse(list)) {
        if (!isEmpty(list)) {
          const target = list.find((j) => j.businessKey === businessKey);
          if (target && target.primaryQuantity >= 0) {
            record.set({ [field]: target.primaryQuantity });
          }
          record.setState('__calculateError__', false);
          loading({ conversionUpdate: false });
        }
        return Promise.resolve(list);
      } else {
        record.setState('__calculateError__', true);
        return Promise.reject(list);
      }
    } catch (error) {
      loading({ conversionUpdate: false });
      return Promise.reject(error);
    } finally {
      loading({ conversionUpdate: false });
    }
  }
};

// 查询当前租户的个性化单元中是否包含该虚拟菜单
// 如果没有，则视为黑名单中的租户
// 默认一次只能查询一个菜单，否则无法处理数据集
const isBlackTenant = async (params) => {
  const permissionList = getResponse(await checkPermisssions(params)) || {};
  if (permissionList && Object.hasOwnProperty.call(permissionList, params[0])) {
    return !permissionList[params[0]];
  }
  return true;
};

// 双单位开启则校验
export const validateDoubleUom = ({ doubleUnitEnabled, priceUomId, uomId }) => {
  if (doubleUnitEnabled && priceUomId && priceUomId !== uomId) {
    notification.error({
      message: intl
        .get(`spcm.common.view.message.validatePriceUomId`)
        .d(
          `自动带出价格失败，失败原因：该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作`
        ),
    });
    return false;
  }
  return true;
};

// 根据双单位配置开启返回显示名称 开启:基本单位，基本数量, 不开启:单位,数量
export function getDynamicLabel(config = 0, field) {
  switch (field) {
    case 'quantity':
      return !config
        ? intl.get(`spcm.common.model.common.quantity`).d('数量')
        : intl.get(`spcm.common.model.common.base.quantity`).d('基本数量');
    case 'taxIncludedUnitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币单价(含税)')
        : intl.get(`spcm.common.model.common.base.inculdeTaxUnitPrice`).d('基本原币单价(含税)');
    case 'unitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.unitPrice`).d('原币单价(不含税)')
        : intl.get(`spcm.common.model.common.base.unitPrice`).d('基本原币单价(不含税)');
    case 'ladderFrom':
      return !config
        ? intl.get('spcm.common.model.common.quantityFrom').d('数量从(>=)')
        : intl.get('spcm.common.model.common.base.quantityFrom').d('基本数量从(>=)');
    case 'ladderTo':
      return !config
        ? intl.get('spcm.common.model.common.quantityTo').d('数量至(<=)')
        : intl.get('spcm.common.model.common.base.quantityTo').d('基本数量至(<=)');
    case 'validLadderPrice':
      return !config
        ? intl.get('spcm.common.model.new.price').d('单价(含税)')
        : intl.get('spcm.common.model.new.base.price').d('基本单价(含税)');
    case 'validNetLadderPrice':
      return !config
        ? intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)')
        : intl.get('spcm.common.model.base.ladderNetPrice').d('基本单价(不含税)');
    default:
      return !config
        ? intl.get(`spcm.common.model.common.unit`).d('单位')
        : intl.get(`spcm.common.model.common.base.unit`).d('基本单位');
  }
}

export function getPreferLabel(isRebate, field) {
  switch (field) {
    case 'create':
      return isRebate
        ? intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.createRebateRule`).d('新建返利规则')
        : intl
            .get(`spfp.ruleMaintenance.model.ruleMaintenance.createDiscountRule`)
            .d('新建折扣规则');
    case 'edit':
      return isRebate
        ? intl.get('spfp.ruleMaintenance.detail.title.editRebateRule').d('编辑返利规则')
        : intl.get('spfp.ruleMaintenance.detail.title.editDiscountRule').d('编辑折扣规则');
    case 'detail':
      return isRebate
        ? intl.get('spfp.ruleMaintenance.detail.title.viewRebateRule').d('查看返利规则')
        : intl.get('spfp.ruleMaintenance.detail.title.viewDiscountRule').d('查看折扣规则');
    case 'change':
      return isRebate
        ? intl.get('spfp.ruleMaintenance.detail.title.changeRebateRule').d('变更返利规则')
        : intl.get('spfp.ruleMaintenance.detail.title.changeDiscountRule').d('变更折扣规则');
    default:
      return isRebate
        ? intl.get('spfp.ruleMaintenance.view.title.create.generateRule').d('生成返利规则')
        : intl.get('spfp.ruleMaintenance.view.title.create.discountRule').d('生成折扣规则');
  }
}

/**
 * 协议提交校验预算
 * @param {Object} options 提交协议数据，可批量
 */
export async function preSubmitValidBudget(params = [], type = 'C7N') {
  const response = await pcBudgetCheck(params);

  const warningDs = new DataSet({
    paging: false,
    selection: false,
    primaryKey: 'pcHeaderId',
    pageSize: 10,
    fields: [
      {
        label: intl.get('spcm.common.model.common.pcNum').d('协议编号'),
        name: 'pcNum',
      },
      {
        label: intl.get('spcm.common.model.common.lineNumber').d('行号'),
        name: 'lineNum',
      },
      {
        label: intl.get('hzero.common.message.confirm.title').d('提示'),
        name: 'errorMessage',
      },
    ],
  });
  const columns = [
    {
      name: 'pcNum',
      width: 200,
    },
    {
      name: 'lineNum',
      width: 100,
    },
    {
      name: 'errorMessage',
    },
  ];
  // 提醒数据集合
  let warningList = [];
  if (getResponse(response) && isArray(response)) {
    warningList = (response || []).filter((item) => item.warnFlag === '1');
  } else {
    // 接口报错
    return undefined;
  }
  if (!isEmpty(warningList)) {
    warningDs.loadData(warningList, warningList.length);
    const renderContent = () => (
      <Table dataSet={warningDs} columns={columns} style={{ maxHeight: '300px' }} />
    );
    if (type === 'C7N') {
      const button = await C7nModal.confirm({
        key: C7nModal.key(),
        title: intl.get('spcm.common.view.title.continueSubmitConifm').d('请确认是否继续提交'),
        children: renderContent(),
        style: { width: '800px' },
      });
      if (button === 'ok') {
        return 'SUCCESS';
      }
    } else {
      return new Promise((resolve) => {
        Modal.confirm({
          title: intl.get('spcm.common.view.title.continueSubmitConifm').d('请确认是否继续提交'),
          content: renderContent(),
          width: '800px',
          onOk: () => {
            return resolve('SUCCESS');
          },
          onCancel: () => {
            return resolve();
          },
        });
      });
    }
  } else {
    return 'SUCCESS';
  }
}

/**
 * 付款计划弹窗
 * @param {Object} options 配置项（type：弹窗类型-根据入口 [submit 提交｜terminate 终止 | view 只读] record：数据源object  afterOk: onOk执行后回调  changeLoading: 关闭一些按钮loading）
 * @param {*} body 需要传给付款计划的参数
 * @param {Object} nextModalProps 下一步的弹窗props
 */
export async function openTermsModal(options = {}, body, nextModalProps = {}) {
  const { type, record, afterOk, onCancel, changeLoading } = options;
  if (!record) return;
  const { payPlanNum } = record;
  const config = [
    {
      type: 'submit',
      title: intl.get('spcm.common.model.termsModal.changeTitle').d('付款申请计划调整'),
    },
    // {
    //   type: 'terminate',
    //   title: intl.get('spcm.common.model.termsModal.cancleTitle').d('取消信息确认'),
    // },
  ];
  const currentConfig = config.find((i) => i.type === type) || {};
  const {
    title = intl.get('spcm.common.model.termsModal.readOnlyTitle').d('付款申请计划查询'),
    // method,
  } = currentConfig;
  // 当前所处步骤
  let step = 0;
  let currentModal;
  let onSave;
  // 可编辑的节点
  const isEdit = ['submit', 'terminate'].includes(type);
  // 获取弹窗内组件保存方法
  const onPartChildRef = ({ handleSave }) => {
    onSave = handleSave;
  };
  const onOk = async () => {
    const okRes = onSave && (await onSave());
    if (okRes && afterOk) {
      const afterOkRes = await afterOk();
      return afterOkRes;
    } else {
      if (changeLoading) {
        await changeLoading();
      }
      return okRes;
    }
  };
  const prevModalProps = {
    title,
    drawer: true,
    children: (
      <EmbedPage
        sourcePageData={body} // 协议传给付款计划的数据
        onPartChildRef={onPartChildRef}
        href={`/ssta/payment-plan/detail-by-num/${payPlanNum}?operate=${
          isEdit ? 'edit' : 'view'
        }&source=spcm`}
      />
    ),
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.confirm').d('确认'),
    cancelText: isEdit
      ? intl.get('hzero.common.btn.cancel').d('取消')
      : intl.get('hzero.common.btn.close').d('关闭'),
    cancelProps: {
      color: type ? 'default' : 'primary',
    },
    onCancel,
  };
  // 切换步骤
  const toggle = async () => {
    if (step === 0 ? onSave && (await onSave()) : true) {
      step = step ? 0 : 1;
      currentModal.update(
        step === 0 ? prevModalProps : { ...nextModalProps, style: { width: 1090 }, title }
      );
    }
  };
  const footer = (okBtn, cancelBtn) => {
    const fristStep = step === 0;
    const setpBtn = (
      <Button
        type="c7n-pro"
        funcType="raised"
        onClick={toggle}
        color={fristStep ? 'primary' : undefined}
      >
        {fristStep
          ? intl.get(`sodr.common.model.termsModal.next'}`).d('下一步')
          : intl.get(`sodr.common.model.termsModal.prev'}`).d('上一步')}
      </Button>
    );
    return isEdit
      ? ['submit', 'terminate'].includes(type)
        ? [okBtn, cancelBtn] // 变更展示按钮
        : fristStep
        ? [setpBtn, cancelBtn] // 可编辑弹窗第一页按钮
        : [okBtn, setpBtn, cancelBtn] // 可编辑弹窗第二页按钮
      : [cancelBtn]; // 只读弹窗按钮
  };
  Object.assign(prevModalProps, { footer, onOk });
  currentModal = C7nModal.open(prevModalProps);
}

/**
 * 获取满足条件的个性化数据
 * @param {Object} custConfig
 * @param {stirng} customizeCode
 * @param {string} fieldCode
 * @returns object 符合条件的个性化对象
 */
const getCustByFieldCode = (custConfig = {}, customizeCode, fieldCode) => {
  const fields = custConfig[customizeCode]?.fields || [];
  return fields.find((field) => field.fieldCode === fieldCode) || {};
};

// 所有签章类型
export const allSignList = ['ESIGN', 'FDD', 'QYS', 'ESIGN_SAAS', 'FDD_SAAS', 'QYS_SAAS', 'DOCUSIGN'];
// 跳转外部链接签署的签章类型
export const linkList = ['ESIGN_SAAS', 'FDD', 'QYS', 'FDD_SAAS', 'QYS_SAAS'];

export const transfromTreeSelectKey = ({
  dataList,
  childrenField = 'children',
  textField,
  valueField = 'pcHeaderId',
}) => {
  if (isEmpty(dataList)) {
    return [];
  }
  const result = [];
  dataList.forEach((item) => {
    const children = !isEmpty(item[childrenField])
      ? transfromTreeSelectKey({
          dataList: item[childrenField],
          childrenField,
          textField,
          valueField,
        })
      : [];
    result.push({
      key: item[valueField],
      title: textField
        ? item[textField]
        : `${item.pcNum} ${item.pcStatusCodeMeaning} ${item.creationDate}`,
      value: item[valueField],
      children,
    });
  });
  return result;
};

export {
  renderThousandthNum,
  toNonExponential,
  validateBits,
  queryCommonDoubleUomConfig,
  isBlackTenant,
  conversionUpdate,
  getSecondaryUomFormItem,
  getCustByFieldCode,
};

// 获取有值的个性化字段
export const getAttributeFields = (priceInfo = {}) => {
  const result = {};
  const newPriceInfo = filterNullValueObject(priceInfo);
  if(isEmpty(newPriceInfo)){
    return result;
  }
  Object.keys(newPriceInfo).forEach((key) => {
    if(key && key.startsWith('attribute')){
      result[key] = newPriceInfo[key];
    }
  });
  return result;
};

// 附件合同文件格式
export const textContractFileType = '.doc,.docx,.pdf';

export const textContractAccept =
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf';

// 表格自带的删除按钮，增加提示标题
export const dsDeleteData = ({ dataSet }) => {
  if (dataSet) {
    dataSet.delete(dataSet.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }
};

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

// 添加辅助函数：安全获取父窗口的 document（跨域时返回 null）
export const getParentDocumentSafe = () => {
  try {
    if (window.parent && window.parent === window) {
      return window.parent.document;
    }
  } catch (e) {
    // 跨域访问被浏览器阻止，返回 null 以便降级处理
    return null;
  }
  return null;
};

// 预览合同
export const previewContractByWindow = (res, pcHeaderId) => {
  const { processed } = res || {};
  if ((processed || getResponse(res)) && window?.open && res?.url) {
      if (res.version === 'V7' && res.componentType === 'new_wps') {
        window.open(
          `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${pcHeaderId}?previewUrl=${res?.url}`
        );
      } else {
        window.open(res?.url);
      }
    }
};



  /**
   * 查询是否在【申请转协议同名扩展字段值映射白名单】-白名单中，不在白名单则去掉扩展字段
   */
 export async function handlePurchaseNeedDTOs(pcSubjectDataSource) {
    const res = getResponse(await referencePrmWhitelist());
    // res?.content?.length > 0-在白名单，无需去掉扩展字段，!res?.content?.length-不在白名单，需要去掉扩展字段。
    if (res && !res?.content?.length) {
      // 过滤掉所有扩展字段
      return pcSubjectDataSource.map(row =>
        pickBy(row, (val, key) => !key.includes('attribute'))
      );
    }
    return pcSubjectDataSource;
  };
