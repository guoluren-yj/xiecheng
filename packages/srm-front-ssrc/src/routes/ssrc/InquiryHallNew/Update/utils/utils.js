import uuidv4 from 'uuid/v4';
import { isEmpty, isNil, difference, xorBy } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getClearLogic } from '@/services/inquiryHallNewService';

const organizationId = getCurrentOrganizationId();

// 批量维护物料行更新数据(特殊处理业务实体、库存组织)
function updateItemSpecial(params = {}) {
  const { batchEditRfxLineItemDTO, record, itemRelatedInfoClearFlag = 0 } = params;
  if (isEmpty(record)) return;
  const itemId = record.get('itemId');
  const keys = Object.keys(batchEditRfxLineItemDTO);

  // 需要先执行更新的字段，由于物料编码可以带出单位，如果批量编辑里只选择了物料编码则带出单位，同时选择了物料编码和单位，则单位值优先
  keys.forEach((key) => {
    const value = batchEditRfxLineItemDTO[key];
    if (!key || key === '__dirty') {
      return;
    }
    updateFiledData({ key, value, ...params });
  });

  if (!isEdit({ record, key: 'invOrganizationIdLov' })) return;
  // 如果选择了业务实体，没有选择库存组织，则清空原有库存组织
  if (batchEditRfxLineItemDTO?.ouId && !batchEditRfxLineItemDTO?.invOrganizationId) {
    record.set('invOrganizationName', null);
    record.set('invOrganizationId', null);
  }
  if (!isEdit({ record, key: 'itemIdLov' })) return;
  // 如果物料清空标识为1，则需要清空物料
  if (itemRelatedInfoClearFlag && itemId) {
    clearItemFiled(record);
  }
}

// 批量更新物料行数据
// 个性化方案变更时候这里需要每次适配重写，逻辑不确定性
function updateFiledData({ key, value = null, record, batchMaintainItemDS, rfxInfoDS }) {
  if (isNil(value)) return;
  const lovCode = isLovCode(batchMaintainItemDS, key);

  // // 行上如果字段不能编辑，批量编辑不更新值
  // const disabledFlag = currentField?.get('disabled');
  // const readOnlyFlag = currentField?.get('readOnly');
  // const disabledBatchFlag = disabledFlag || readOnlyFlag;
  // if (disabledBatchFlag) {
  //   return;
  // }

  // if (currentField && !lovCode) {
  //   record.set(key, value);
  //   // if (key === 'taxId' && value) {
  //   //   record.set('taxIncludedFlag', 1);
  //   // }
  //   if (key === 'batchPrice') {
  //     const batchPriceValue = value <= 0 || value === '0' ? null : value;
  //     record.set('batchPrice', batchPriceValue);
  //   }
  //   return;
  // }

  if (key === 'ouIdLov' || key === 'ouId' || key === 'ouName') {
    if (!isEdit({ record, key: 'ouIdLov' })) return;
    if (lovCode) {
      updateOuIdFiled({ value, record });
      return;
    }
    record.set(key, value);
  } else if (
    key === 'invOrganizationIdLov' ||
    key === 'invOrganizationId' ||
    key === 'invOrganizationName'
  ) {
    if (!isEdit({ record, key: 'invOrganizationIdLov' })) return;
    if (lovCode) {
      updateInvOrganizationFiled({ value, record });
      return;
    }
    record.set(key, value);
  } else if (key === 'taxIdLov' || key === 'taxId' || key === 'taxRate') {
    if (batchMaintainItemDS.get('taxIncludedFlag') === 0) {
      record.set({
        taxIdLov: null,
        taxId: null,
        taxRate: null,
      });
      return;
    }
    if (lovCode) {
      record.set({
        taxIncludedFlag: 1,
        taxIdLov: value,
        taxId: value.taxId,
        taxRate: value.taxRate,
      });
      return;
    }
    record.set({
      taxIncludedFlag: 1,
      key: value,
    });
  } else if (key === 'itemId' || key === 'itemIdLov' || key === 'itemCode') {
    if (!isEdit({ record, key: 'itemIdLov' })) return;
    if (lovCode) {
      record.set({
        temId: value.partnerItemId,
        itemCode: value.itemCode,
        itemName: value.itemName,
        itemIdLov: value,
      });
      return;
    }
    record.set(key, value);
  } else if (
    key === 'itemCategoryId' ||
    key === 'itemCategoryIdLov' ||
    key === 'itemCategoryName'
  ) {
    if (!isEdit({ record, key: 'itemCategoryIdLov' })) return;
    if (lovCode) {
      record.set({
        itemCategoryId: value.categoryId,
        itemCategoryName: value.categoryName,
        itemCategoryIdLov: value,
      });
      return;
    }
    record.set(key, value);
  } else if (
    key === 'secondaryUomId' ||
    key === 'secondaryUomIdLov' ||
    key === 'secondaryUomName'
  ) {
    if (!isEdit({ record, key: 'secondaryUomIdLov' })) return;
    if (lovCode) {
      record.set({
        secondaryUomId: value.uomId,
        secondaryUomName: value.uomName,
        secondaryUomIdLov: value,
      });
      return;
    }
    record.set(key, value);
  } else if (key === 'uomId' || key === 'uomIdLov' || key === 'uomName') {
    if (!isEdit({ record, key: 'uomIdLov' })) return;
    if (lovCode) {
      record.set({
        uomId: value.uomId,
        uomName: value.uomName,
        uomIdLov: value,
      });
      return;
    }
    record.set(key, value);
  } else if (
    key === 'quotationTemplateId' ||
    key === 'quotationTemplateIdLov' ||
    key === 'templateName'
  ) {
    if (!isEdit({ record, key: 'quotationTemplateIdLov' })) return;
    if (lovCode) {
      record.set({
        quotationTemplateId: value.templateId,
        templateName: value.templateName,
        quotationTemplateIdLov: value,
      });
      return;
    }
    record.set(key, value);
  } else if (key === 'projectTaskId' || key === 'projectTaskName') {
    if (!isEdit({ record, key: 'projectTaskId' })) return;
    record.set(key, value);
  } else {
    if (!isEdit({ record, key })) return;
    if (key === 'batchPrice') {
      const batchPriceValue = value <= 0 || value === '0' ? null : value;
      record.set('batchPrice', batchPriceValue);
      return;
    }
    if (key === 'floatType' && record.get('floatType') !== value) {
      record.set('floatType', value);
      const { sourceCategory, biddingFlag } =
        rfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
      if (
        sourceCategory === 'RFA' &&
        biddingFlag === 1 &&
        isNil(batchMaintainItemDS.get('quotationRange'))
      ) {
        // 新竞价时候切换浮动方式 & 批量编辑未维护报价幅度 - 清空报价幅度
        record.set('quotationRange', null);
      }
      return;
    }
    if (key === 'taxIncludedFlag') {
      if (value === 0) {
        record.set({
          taxIdLov: null,
          taxId: null,
          taxRate: null,
        });
      }
    }
    if (!isEdit({ record, key })) return;
    record.set(key, value);
  }
}

// 行上如果字段不能编辑，批量编辑不更新值
function isEdit({ record, key }) {
  const currentField = record.getField(key);
  if (!currentField) return false;
  const disabledFlag = currentField.get('disabled');
  const readOnlyFlag = currentField.get('readOnly');
  const disabledBatchFlag = disabledFlag || readOnlyFlag;
  if (disabledBatchFlag) {
    return false;
  }
  return true;
}

// 更新业务实体字段
export function updateOuIdFiled({ currentValue = {}, record = {} }) {
  if (isEmpty(record)) return;
  const curValue = currentValue ?? {};
  record.set({
    ouName: curValue.ouName,
    ouId: curValue.ouId,
    invOrganizationName: curValue.invOrganizationName,
    invOrganizationId: curValue.invOrganizationId,
    biUomId: null,
    biUomName: null,
    uomConversionRate: null,
  });
}

// 更新库存组织字段的其他字段相关逻辑
export function updateInvOrganizationFiled({ currentValue = {}, record = {} }) {
  if (isEmpty(record)) return;
  const curValue = currentValue ?? {};
  record.set({
    invOrganizationName: curValue.organizationName,
    invOrganizationId: curValue.organizationId,
    biUomId: null,
    biUomName: null,
    uomConversionRate: null,
  });
  if (!isEmpty(curValue) && curValue?.ouId) {
    record.set('ouName', currentValue.ouName);
    record.set('ouId', currentValue.ouId);
  }
}

// 清除物料及单位相关信息
function clearItemFiled(record = {}) {
  if (isEmpty(record)) return;
  record.set({
    itemId: null,
    itemName: null,
    itemCode: null,
    itemCategoryId: null,
    itemCategoryName: null,
    secondaryUomId: null,
    secondaryUomName: null,
    uomId: null,
    uomName: null,
    uomIdLov: null,
    secondaryUomIdLov: null,
    biUomId: null,
    biUomName: null,
    uomConversionRate: null,
    drawingNum: null,
    drawingVersionNumber: null,
    commonName: null,
    referencePrice: null,
    specs: null,
    supplierItemNumDesc: null,
    model: null,
  });
}

/**
 * 批量更新数据
 * @param {object} payload
 * {
 *   batchEditRfxLineItemDTO - 批量编辑框中的ds数据
 *   itemLineDS - 物料行DS
 *   rfxInfoDS - 头信息DS
 * }
 * allEditFlag 全量编辑1/批量编辑0/初始化为-1
 */
export function batchUpdateLines(payload = {}) {
  const { batchEditRfxLineItemDTO, itemLineDS, rfxInfoDS, allEditFlag } = payload;

  let itemLines = [];
  if (allEditFlag !== 1) {
    // 批量编辑则只处理勾选数据
    itemLines = itemLineDS.selected;
  } else {
    itemLines = [...(itemLineDS?.cachedRecords || []), ...(itemLineDS?.records || [])];
  }
  // 过滤数据 如果物料行没有物料则不需要清空物料
  const sourceLineItemDTOList = [];
  itemLines.forEach((record) => {
    const { ouId, itemId, requestKey } = record.get(['ouId', 'itemId', 'requestKey']) || {};
    // 如果业务实体与之前的相同的，则不需要更新
    if (ouId !== batchEditRfxLineItemDTO?.ouId) {
      if (itemId) {
        // 如果物料行没有物料则不需要清空物料
        if (!requestKey) record.set('requestKey', uuidv4());
        sourceLineItemDTOList.push({
          requestKey: record.get('requestKey'),
          itemId,
        });
      }
    }
  });

  // 更新数据
  const fetchData = async () => {
    const companyId = rfxInfoDS?.current?.get('companyId');
    const params = {
      organizationId,
      ouId: batchEditRfxLineItemDTO?.ouId,
      invOrganizationId: batchEditRfxLineItemDTO?.invOrganizationId,
      companyId,
      sourceLineItemDTOList,
    };
    await getClearLogic({ ...params, organizationId }).then((res) => {
      const getNeedUpdateList = getResponse(res);
      // 根据获取的数据确定物料是否需要清空 如果选中的唯一标识requestKey与返回数据的相同并且清空标识为1，则物料需要清空，否则正常赋值即可
      itemLines.forEach((recordSel) => {
        let flag = true;
        if (isEmpty(getNeedUpdateList)) return;
        getNeedUpdateList.forEach((recordNeedUpdate) => {
          const requestKey = recordSel?.get('requestKey');
          if (
            requestKey &&
            requestKey === recordNeedUpdate.requestKey &&
            recordNeedUpdate.itemRelatedInfoClearFlag
          ) {
            flag = false;
            updateItemSpecial({
              record: recordSel,
              itemRelatedInfoClearFlag: recordNeedUpdate.itemRelatedInfoClearFlag,
              ...payload,
            });
          }
        });
        if (flag) {
          updateItemSpecial({ record: recordSel, ...payload });
        }
      });
    });
  };

  // 如果批量维护中选择了业务实体并且物料行中物料编码有值，才调用此更新方法，否则不调用接口 直接处理
  if (batchEditRfxLineItemDTO?.ouId && sourceLineItemDTOList.length) {
    fetchData();
  } else {
    itemLines.forEach((record) => {
      updateItemSpecial({ record, ...payload });
    });
  }
}

/**
 * 操作单个物料行
 * 选择业务实体或者库存组织去判断下面是否有行上已选择的物料，如有-不清空物料，如无-清空物料。
 * @param {Boolean} isInvOrgId - 是否传库存组织：选择业务实体-不传；选择库存组织-传
 */
export function isClearMaterial({ value, isInvOrgId = false, record, rfxInfoDS }) {
  const companyId = rfxInfoDS?.current?.get('companyId');
  const templateNum = rfxInfoDS?.current?.get('templateNum') || null;
  const { requestKey, itemId } = record.get(['invOrganizationId', 'requestKey', 'itemId']);
  if (!requestKey) record.set('requestKey', uuidv4());
  const judgeParams = {
    organizationId,
    ouId: value?.ouId,
    invOrganizationId: isInvOrgId ? value?.organizationId : null,
    companyId,
    templateNum,
    sourceLineItemDTOList: [
      {
        requestKey: record.get('requestKey'),
        itemId,
      },
    ],
  };
  getClearLogic(judgeParams).then((res) => {
    const getNeedUpdateList = getResponse(res);
    if (!isEmpty(getNeedUpdateList)) {
      const updateRecord = getNeedUpdateList[0];
      const requestKeyOrigin = record.get('requestKey');
      if (
        requestKeyOrigin &&
        requestKeyOrigin === updateRecord.requestKey &&
        updateRecord.itemRelatedInfoClearFlag &&
        itemId
      ) {
        clearItemFiled(record);
      }
    }
  });
}

/**
 * 将行上有的标准字段进行特殊处理，防止用户错配少配个性化保存时将部分数据传给后端导致脏数据或数据错误
 * @param {*} batchMaintainItemDS-批量编辑form DS
 */
export function getBatchMainItemData({ batchMaintainItemDS } = {}) {
  const dsCurrent = batchMaintainItemDS?.current;
  if (!dsCurrent) return;
  const {
    itemId,
    itemIdLov,
    itemCategoryId,
    itemCategoryIdLov,
    secondaryUomId,
    secondaryUomIdLov,
    uomId,
    uomIdLov,
    quotationTemplateId,
    quotationTemplateIdLov,
  } = dsCurrent.get([
    'itemId',
    'itemIdLov',
    'itemCategoryId',
    'itemCategoryIdLov',
    'secondaryUomId',
    'secondaryUomIdLov',
    'uomId',
    'uomIdLov',
    'quotationTemplateId',
    'quotationTemplateIdLov',
  ]);

  if (itemId || itemIdLov) {
    let currentValue = {};
    if (itemId && isLovCode(batchMaintainItemDS, 'itemId')) {
      currentValue = itemId;
    } else {
      currentValue = itemIdLov || {};
    }
    dsCurrent.set({
      itemId: currentValue.itemId,
      itemCode: currentValue.itemCode,
      itemName: currentValue.itemName,
    });
  }

  if (itemCategoryId || itemCategoryIdLov) {
    let currentValue = {};
    if (itemCategoryId && isLovCode(batchMaintainItemDS, 'itemCategoryId')) {
      currentValue = itemCategoryId;
    } else {
      currentValue = itemCategoryIdLov || {};
    }
    dsCurrent.set({
      itemCategoryId: currentValue.categoryId,
      itemCategoryName: currentValue.categoryName,
    });
  }

  if (secondaryUomId || secondaryUomIdLov) {
    let currentValue = {};
    if (secondaryUomId && isLovCode(batchMaintainItemDS, 'secondaryUomId')) {
      currentValue = secondaryUomId;
    } else {
      currentValue = secondaryUomIdLov || {};
    }
    dsCurrent.set({
      secondaryUomId: currentValue.uomId,
      secondaryUomName: currentValue.uomName,
    });
  }

  if (uomId || uomIdLov) {
    let currentValue = {};
    if (uomId && isLovCode(batchMaintainItemDS, 'uomId')) {
      currentValue = uomId;
    } else {
      currentValue = uomIdLov || {};
    }
    dsCurrent.set({
      uomId: currentValue.uomId,
      uomName: currentValue.uomName,
    });
  }

  if (quotationTemplateId || quotationTemplateIdLov) {
    let currentValue = {};
    if (quotationTemplateId && isLovCode(batchMaintainItemDS, 'quotationTemplateId')) {
      currentValue = quotationTemplateId;
    } else {
      currentValue = quotationTemplateIdLov || {};
    }
    dsCurrent.set({
      quotationTemplateId: currentValue.templateId,
      templateName: currentValue.templateName,
    });
  }
}

// 判断是否是lovCode
function isLovCode(record, key) {
  const currentField = record?.getField(key);
  const lovCode = currentField ? currentField.get('lovCode') : null;
  return lovCode;
}

// 竞价时间计算 ------------------------  开始  ------------------------------
// 计算并赋值截止时间
function calculateTimeAssignEndDate(payload = {}) {
  const { startField, durationField, endField, record } = payload || {};
  const { [startField]: startFieldDate, [durationField]: durationFieldTime } =
    record?.get([startField, durationField]) || {};
  // const startFieldR = record.getField(startField);
  // const durationFieldR = record.getField(durationField);
  // // 若开始时间不存在，并且运行时间有值，则截止时间为null
  // if (startFieldR.isDirty(record) || durationFieldR.isDirty(record)) {
  if (!startFieldDate && durationFieldTime > 0) {
    record.set(endField, null);
    return;
  }
  // 根据运行时间计算截止时间
  if (startFieldDate && durationFieldTime > 0) {
    const startTimeStamp = moment(startFieldDate).valueOf() + durationFieldTime * 60000;
    const endDate = moment(startTimeStamp).format(DEFAULT_DATETIME_FORMAT);
    record.set(endField, endDate);
  }
}

// 计算竞价时间后面字段时间
export function calculateLatterFieldTime(payload = {}) {
  const { record, name } = payload || {};
  // const value = record.get(name);
  const {
    biddingOnlineSignInFlag, // 是否有签到节点
    biddingTrialBiddingFlag, // 是否有试竞价节点
    // signInStartFlag, // 签到开始时间标识
    signInRunningDurationFlag, // 签到截止运行时间
    startingTrialBiddingStartFlag, // 试竞价开始时间标识
    startingTrialBiddingRunningDurationFlag, // 试竞价截止运行标识
    // startingTrialBiddingStartDate, // 试竞价开始时间
    startFlag, // 正式竞价开始标识
    startingBiddingRunningDurationFlag, // 正式竞价截止运行标识
    biddingSupplementPriceRunningDurationFlag, // 补充单价截止运行时间标识
  } = record.get([
    'biddingOnlineSignInFlag',
    'biddingTrialBiddingFlag',
    // 'signInStartFlag',
    'signInRunningDurationFlag',
    'startingTrialBiddingStartFlag',
    'startingTrialBiddingRunningDurationFlag',
    // 'startingTrialBiddingStartDate',
    'startFlag',
    'startingBiddingRunningDurationFlag',
    'biddingSupplementPriceRunningDurationFlag',
  ]);

  // 设置前端自定义时间字段，用于与当前时间的校验
  record.set('ssrcCustomCurrentNewDateTime', new Date());

  // 计算并赋值签到时间
  const calculateSignInTime = () => {
    if (biddingOnlineSignInFlag) {
      if (signInRunningDurationFlag) {
        calculateTimeAssignEndDate({
          startField: 'signInStartDate',
          durationField: 'signInRunningDuration',
          endField: 'signInEndDate',
          record,
        });
      }
    }
  };

  // 计算并赋值试竞价时间
  const calculateTrailBiddingTime = () => {
    const { signInEndDate } = record.get(['signInEndDate']);
    if (biddingTrialBiddingFlag) {
      // 如果有试竞价并且 试竞价是签到截止即开始,否则 若是自定义时间后续无需计算
      if (biddingOnlineSignInFlag && startingTrialBiddingStartFlag === 1) {
        record.set('startingTrialBiddingStartDate', signInEndDate);
      }
      if (startingTrialBiddingRunningDurationFlag) {
        // const {
        //   startingTrialBiddingStartDate,
        //   startingTrialBiddingRunningDuration,
        //   quotationOrderType,
        //   quotationInterval,
        // } = record.get([
        //   'startingTrialBiddingStartDate',
        //   'startingTrialBiddingRunningDuration',
        //   'quotationOrderType',
        //   'quotationInterval',
        // ]);
        // if (!startingTrialBiddingStartDate && startingTrialBiddingRunningDuration > 0) {
        //   record.set('startingTrialBiddingEndDate', null);
        //   return;
        // }
        // if (startingTrialBiddingStartDate && startingTrialBiddingRunningDuration > 0) {
        //   if (quotationOrderType === 'SEQUENCE' && (itemLineCount > 0 || quotationInterval)) {
        //     // 真正的截止时间 开始时间 + (物料数 * 运行时间) + (物料数 * 间隔时间)
        //     const itemCountRunningDuration = (itemLineCount || 0) * startingTrialBiddingRunningDuration;
        //     let itemCountInterval = 0;
        //     if (itemLineCount > 0 && quotationInterval) {
        //       itemCountInterval = quotationInterval * (itemLineCount - 1);
        //     }
        //     let acutalQuotationEndDate = moment(startingTrialBiddingStartDate).valueOf() + (itemCountRunningDuration + itemCountInterval) * 60 * 1000;
        //     acutalQuotationEndDate = moment(acutalQuotationEndDate).format(DEFAULT_DATETIME_FORMAT);
        //     record.set('startingTrialBiddingEndDate', acutalQuotationEndDate);
        //   } else {
        //     const startTimeStamp = moment(startingTrialBiddingStartDate).valueOf() + startingTrialBiddingRunningDuration * 60000;
        //     const endDate = moment(startTimeStamp).format(DEFAULT_DATETIME_FORMAT);
        //     record.set('startingTrialBiddingEndDate', endDate);
        //   }
        // }
        calculateTimeAssignEndDate({
          startField: 'startingTrialBiddingStartDate',
          durationField: 'startingTrialBiddingRunningDuration',
          endField: 'startingTrialBiddingEndDate',
          record,
        });
      }
    }
  };
  // 计算并赋值正式竞价时间
  const calculateFormalBiddingTime = () => {
    const { startingTrialBiddingEndDate, signInEndDate } = record.get([
      'startingTrialBiddingEndDate',
      'signInEndDate',
    ]);
    // 正式竞价是非自定义时间，否则无需计算
    if (biddingTrialBiddingFlag && startFlag === 1) {
      record.set('quotationStartDate', startingTrialBiddingEndDate);
    } else if (!biddingTrialBiddingFlag && biddingOnlineSignInFlag && startFlag === 1) {
      record.set('quotationStartDate', signInEndDate);
    }
    if (startingBiddingRunningDurationFlag) {
      // const {
      //   quotationStartDate,
      //   quotationRunningDuration,
      //   quotationOrderType,
      //   quotationInterval,
      // } = record.get([
      //   'quotationStartDate',
      //   'quotationRunningDuration',
      //   'quotationOrderType',
      //   'quotationInterval',
      // ]);
      // if (!quotationStartDate && quotationRunningDuration > 0) {
      //   record.set('startingTrialBiddingEndDate', null);
      //   return;
      // }
      // if (quotationStartDate && quotationRunningDuration > 0) {
      //   if (quotationOrderType === 'SEQUENCE' && (itemLineCount || quotationInterval)) {
      //     // 真正的截止时间 开始时间 + (物料数 * 运行时间) + (物料数 * 间隔时间)
      //     const itemCountRunningDuration = (itemLineCount || 0) * quotationRunningDuration;
      //     let itemCountInterval = 0;
      //     if (itemLineCount > 0 && quotationInterval) {
      //       itemCountInterval = quotationInterval * (itemLineCount - 1);
      //     }
      //     let acutalQuotationEndDate = moment(quotationStartDate).valueOf() + (itemCountRunningDuration + itemCountInterval) * 60 * 1000;
      //     acutalQuotationEndDate = moment(acutalQuotationEndDate).format(DEFAULT_DATETIME_FORMAT);
      //     record.set('quotationEndDate', acutalQuotationEndDate);
      //   } else {
      //     const startTimeStamp = moment(quotationStartDate).valueOf() + quotationRunningDuration * 60000;
      //     const endDate = moment(startTimeStamp).format(DEFAULT_DATETIME_FORMAT);
      //     record.set('quotationEndDate', endDate);
      //   }
      // }
      calculateTimeAssignEndDate({
        startField: 'quotationStartDate',
        durationField: 'quotationRunningDuration',
        endField: 'quotationEndDate',
        record,
      });
    }
  };

  // 计算并赋值补充单价时间
  const calculateBiddingSupplementPrice = () => {
    const {
      quotationEndDate,
      autoDeferFlag, // 延时flag
      autoDeferDuration, // 延时时长
      biddingSupplementPriceStartFlag,
    } = record.get([
      'quotationEndDate',
      'autoDeferFlag',
      'autoDeferDuration',
      'biddingSupplementPriceStartFlag',
    ]);
    // 补充单价为非自定义时间
    if (biddingSupplementPriceStartFlag === 1) {
      if (autoDeferFlag && quotationEndDate && autoDeferDuration) {
        // 如果开启了延时，则 真正的截止时间是 quotationEndDate + autoDeferDuration
        // 补充单价为非自定义时间
        record.set(
          'biddingSupplementPriceStartDate',
          moment(quotationEndDate).add(autoDeferDuration, 'm')
        );
      } else {
        // 补充单价为非自定义时间
        record.set('biddingSupplementPriceStartDate', quotationEndDate);
      }
    }
    // 如果运行标识为1，则计算
    if (biddingSupplementPriceRunningDurationFlag) {
      calculateTimeAssignEndDate({
        startField: 'biddingSupplementPriceStartDate',
        durationField: 'biddingSupplementPriceRunningDuration',
        endField: 'biddingSupplementPriceEndDate',
        record,
      });
    }
  };

  // 【签到开始时间、签到运行时间】字段变更，则重新计算后续所有时间
  if (['signInStartDate', 'signInRunningDuration'].includes(name)) {
    // 计算签到时间
    calculateSignInTime();
    // 计算试竞价
    calculateTrailBiddingTime();
    // 计算正式竞价
    calculateFormalBiddingTime();
    // 计算补充单价
    calculateBiddingSupplementPrice();
  }
  // 【签到截止、试竞价开始、试竞价截止】字段变更，则重新计算试竞价以及后续所有时间
  if (
    [
      'signInEndDate',
      'startingTrialBiddingStartDate',
      'startingTrialBiddingRunningDuration',
    ].includes(name)
  ) {
    // 计算试竞价
    calculateTrailBiddingTime();
    // 计算正式竞价
    calculateFormalBiddingTime();
    // 计算补充单价
    calculateBiddingSupplementPrice();
  }
  // 【试竞价截止、竞价开始、竞价截止】字段变更，则重新计算竞价后续所有时间
  if (
    ['startingTrialBiddingEndDate', 'quotationStartDate', 'quotationRunningDuration'].includes(name)
  ) {
    // 计算正式竞价时间
    calculateFormalBiddingTime();
    // 计算补充单价
    calculateBiddingSupplementPrice();
  }
  // 【竞价截止、补充单价开始、补充单价运行】字段变更，则重新计算补充单价时间
  if (
    [
      'quotationEndDate',
      'biddingSupplementPriceStartDate',
      'biddingSupplementPriceRunningDuration',
    ].includes(name)
  ) {
    // 补充单价
    calculateBiddingSupplementPrice();
  }
}

// 竞价时间计算 ------------------------   截止   ------------------------------

// 更新拓展库存组织逻辑
export function updateExpandInvOrganizationFiled({
  value = [],
  oldValue = [],
  record = {},
  sourceResultsData = [],
}) {
  if (isEmpty(record)) return;
  // 清除对应公司下的库存组织
  // 删除操作(小删除和大清除)
  const { expandInvOrganization = [] } = record?.get(['expandInvOrganization']) || {};
  // 大清除
  if (value === null) {
    record.set({
      expandInvOrganization: [],
    });
  } else if (value?.length < oldValue?.length) {
    // 小删除
    // sourceResultsData关联关系为空 不作匹配
    if (isEmpty(sourceResultsData)) return;
    const differenceKey = ((xorBy(value, oldValue, 'companyId') || [])?.[0] || {})?.companyId;
    const expandInvOrganizationIds = expandInvOrganization?.map((i) => i.organizationId);
    const invOrganizationIds =
      sourceResultsData?.find((i) => i.companyId === differenceKey)?.invOrganizationIds || [];
    const differenceIds = difference(expandInvOrganizationIds, invOrganizationIds) || [];

    const _expandInvOrganization =
      expandInvOrganization?.filter((i) => differenceIds.includes(i.organizationId)) || [];
    record.set({
      expandInvOrganization: _expandInvOrganization,
    });
  }
}
