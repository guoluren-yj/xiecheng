import { map, forEach, isEmpty, omit, isArray, isFunction, isNil } from 'lodash';

import intl from 'utils/intl';

const promptCode = 'ssrc.inquiryHall';

const generateItemLinesInitData = (allItemIds, allrfxLineSupplierIds) => {
  const initData = [];
  allrfxLineSupplierIds.forEach((supplier) => {
    allItemIds.forEach((item) => {
      const combineKey = `${supplier}#${item}`;
      initData.push({
        combineKey,
        rfxLineItemId: item,
        rfxLineSupplierId: supplier,
      });
    });
  });
  return initData;
};

/**
 * 生成物料数据
 */
const generateItemLines = (suppliers = [], preQueryItemFlag) => {
  // 外层供应商, 内层物料行
  const itemLines = {};
  let itemIds = []; // 物料ids
  const supplierLines = [];
  // const combineKeys = [];
  let allItemIds = [];
  let allrfxLineSupplierIds = [];
  forEach(suppliers, (supplier, supplierIndex) => {
    if (!supplier) {
      return;
    }
    const { rfxLineSupplierId } = supplier || {};
    const supplierOmitValues =
      omit(supplier, 'summaryScoreDetailDTO', 'checkQuotationLineDTOS') || {};
    supplierLines.push(supplierOmitValues);
    const { checkQuotationLineDTOS = [] } = supplier || {};

    checkQuotationLineDTOS.forEach((item, itemIndex) => {
      const combineKey = `${rfxLineSupplierId}#${item.rfxLineItemId}`;
      // if (itemIndex < itemLinePageSize) {
      //   combineKeys.push({value: combineKey, rfxLineItemId: item.rfxLineItemId});
      // }
      const itemData = {
        isGroupRecord: itemIndex === 0, // 下标为0时,代表为分组record, 其余为正常record, 后续整合数据需要用到
        ...supplierOmitValues,
        combineKey,
        ...item,
        allocationMethodRatio: item.allocationMethod,
        allocationMethodQuantity: item.allocationMethod,
      };
      itemLines[item.rfxLineItemId] = [...(itemLines[item.rfxLineItemId] || []), itemData];
    });

    if (supplierIndex === 0 && checkQuotationLineDTOS) {
      itemIds = checkQuotationLineDTOS.map((item) => item.rfxLineItemId);
    }
  });
  if (preQueryItemFlag) {
    allItemIds = suppliers[0]?.itemIds || [];
    allrfxLineSupplierIds = suppliers[0]?.rfxLineSupplierIds || [];
  }

  return {
    itemLines,
    // combineKeys,
    supplierLines,
    itemIds,
    allItemIds,
    allrfxLineSupplierIds,
  };
};

const getCurrentKeys = (group = [], itemPosition = {}, supplierPosition = {}, scrollerType) => {
  const combineKeys = [];
  if (scrollerType === 'ITEM') {
    group.slice(itemPosition.start, itemPosition.end).forEach((item) => {
      const rfxLineItemId = item.value;
      item.subGroups.slice(supplierPosition.start, supplierPosition.end).forEach((supplier) => {
        combineKeys.push(`${supplier.value}#${rfxLineItemId}`);
      });
    });
  } else {
    group.slice(supplierPosition.start, supplierPosition.end).forEach((supplier) => {
      const rfxLineSupplierId = supplier.value;
      supplier.subGroups.slice(itemPosition.start, itemPosition.end).forEach((item) => {
        combineKeys.push(`${rfxLineSupplierId}#${item.value}`);
      });
    });
  }
  return { combineKeys };
};

// 实时坐标计算
const getCurrentPosiztion = (start, end) => {
  const res = [];
  let init = start;
  do {
    res.push(init);
    init++;
  } while (init < end);
  return res;
};

const constructorValidScoreLines = ({
  list,
  scoreLines,
  supplierBasicInfo,
  sourceRuleType,
  type,
  totalScore,
  candidateSuggestion,
}) => {
  forEach(list, (parentIndicate, index) => {
    const {
      summary,
      evaluateIndicId,
      indicScore,
      weight,
      indicateName,
      sumPassStatus,
      sumPassStatusMeaning,
      evaluateScoreLineDtlList = [],
    } = parentIndicate;

    const parentIndicateBasicInfo = omit(parentIndicate, 'evaluateScoreLineDtlList');
    scoreLines.push({
      ...supplierBasicInfo,
      ...parentIndicateBasicInfo,
      score: evaluateScoreLineDtlList.length ? summary : indicScore || sumPassStatusMeaning,
      scoreMeaning: `${indicateName}${!isNil(weight) && !sumPassStatus ? `(${weight}%)` : ''}`,
      sourceRuleType,
      parentIndicateId: type === 'NONE' ? null : `${type}`,
      tempIndicateId: `${type}_${evaluateIndicId}`,
      showInHeader: type === 'NONE' && index === 0,
      totalScore,
      sumPassStatus,
      candidateSuggestion,
    });
    const childIndicateLines = map(evaluateScoreLineDtlList, (childIndicate) => {
      const {
        twoIndicateScore,
        twoIndicateName,
        indicateId: twoIndicateId,
        twoWeight,
      } = childIndicate;
      if (!twoIndicateId) {
        return null;
      }
      return {
        ...supplierBasicInfo,
        ...childIndicate,
        sourceRuleType,
        parentIndicateId: `${type}_${evaluateIndicId}`,
        score: twoIndicateScore,
        scoreMeaning: `${twoIndicateName}${!isNil(twoWeight) ? `(${twoWeight}%)` : ''}`,
        tempIndicateId: `${type}_${twoIndicateId}`,
      };
    }).filter(Boolean);
    scoreLines.push(...childIndicateLines);
  });
};

const constructorInValidScoreLines = ({
  list,
  scoreLines,
  supplierBasicInfo,
  sourceRuleType,
  type,
}) => {
  forEach(list, (parentIndicate, index) => {
    const { evaluateIndicId, indicateName, evaluateScoreLineDtlList = [] } = parentIndicate;
    scoreLines.push({
      ...supplierBasicInfo,
      score: '-',
      scoreMeaning: `${indicateName}`,
      sourceRuleType,
      parentIndicateId: `${type}`,
      tempIndicateId: `${type}_${evaluateIndicId}`,
      showInHeader: type === 'NONE' && index === 0,
      totalScore: type === 'NONE' ? '-' : '',
    });
    // 构造技术组要素树
    const childIndicateLines = map(evaluateScoreLineDtlList, (childIndicate) => {
      const { indicateId: twoIndicateId } = childIndicate;
      if (!twoIndicateId) {
        return null;
      }
      return {
        ...supplierBasicInfo,
        ...childIndicate,
        sourceRuleType,
        parentIndicateId: `${type}_${evaluateIndicId}`,
        score: '-',
        tempIndicateId: `${type}_${twoIndicateId}`,
      };
    }).filter(Boolean);
    scoreLines.push(...childIndicateLines);
  });
};

/**
 * 生成评分数据
 */
const generateScoreLines = (suppliers) => {
  // 外层供应商, 内层物料行
  const scoreLines = [];
  const baseSupplier = suppliers[0]?.summaryScoreDetailDTO; // 取数据的第一条，若有评分要素 则加到无效供应商上
  forEach(suppliers, (supplier) => {
    const { summaryScoreDetailDTO, ...supplierBasicInfo } = omit(
      supplier,
      'checkQuotationLineDTOS'
    );
    const omitSummaryScoreDetailDTO = omit(summaryScoreDetailDTO, 'sourceRuleType');
    // 有效的供应商
    if (!isEmpty(omitSummaryScoreDetailDTO)) {
      const {
        technologyTotal,
        businessTotal,
        technologyWeight,
        businessWeight,
        score: totalScore, // 总分
        candidateSuggestion, // 推荐理由
        technologyScoreLineList = [],
        businessScoreLineList = [],
        syncScoreLineList = [],
        sourceRuleType,
        businessPassStatus,
        technologyPassStatus,
        sumPassStatus,
        approvedCount,
        businessApprovedCount,
        technologyApprovedCount,
      } = summaryScoreDetailDTO || {};

      // 判断是否区分商务/技术
      if (sourceRuleType === 'DIFF') {
        // 构造技术组评分副标题
        const techLineTotal = {
          ...supplierBasicInfo,
          sumPassStatus,
          totalScore: sumPassStatus || totalScore,
          sourceRuleType,
          candidateSuggestion,
          showInHeader: true,
          approvedCount,
          technologyApprovedCount,
          score: technologyPassStatus || technologyTotal,
          tempIndicateId: 'TECH',
          indicateId: `TECH_${supplierBasicInfo.rfxLineSupplierId}`,
          scoreMeaning: sumPassStatus
            ? intl.get(`${promptCode}.model.inquiryHall.technologyScore`).d('技术分')
            : `${intl
                .get(`${promptCode}.view.message.title.technologyScoreWeight`, {
                  weight: technologyWeight,
                })
                .d('技术分 ({weight}%)')}`,
          titleMeaning: sumPassStatus
            ? intl.get(`${promptCode}.model.inquiryHall.technologyScoreSummary`).d('技术分汇总')
            : intl.get(`${promptCode}.model.inquiryHall.technologyScore`).d('技术分'),
        };
        scoreLines.push(techLineTotal);

        constructorValidScoreLines({
          list: technologyScoreLineList,
          scoreLines,
          supplierBasicInfo,
          sourceRuleType,
          type: 'TECH',
        });

        // 构造商务组评分副标题
        const businessLineTotal = {
          ...supplierBasicInfo,
          showInHeader: true,
          sumPassStatus,
          approvedCount,
          businessApprovedCount,
          totalScore: sumPassStatus || totalScore,
          sourceRuleType,
          score: businessPassStatus || businessTotal,
          tempIndicateId: 'BUSINESS',
          indicateId: `BUSINESS_${supplierBasicInfo.rfxLineSupplierId}`,
          scoreMeaning: sumPassStatus
            ? intl.get(`${promptCode}.model.inquiryHall.businessScore`).d('商务分')
            : `${intl
                .get(`${promptCode}.view.message.title.businessScoreWeight`, {
                  weight: businessWeight,
                })
                .d('商务分 ({weight}%)')}`,
          titleMeaning: sumPassStatus
            ? intl.get(`${promptCode}.model.inquiryHall.businessScoreSummary`).d('商务分汇总')
            : intl.get(`${promptCode}.model.inquiryHall.businessScore`).d('商务分'),
        };
        scoreLines.push(businessLineTotal);

        // 构造商务组要素树
        constructorValidScoreLines({
          list: businessScoreLineList,
          scoreLines,
          supplierBasicInfo,
          sourceRuleType,
          type: 'BUSINESS',
        });
      } else {
        constructorValidScoreLines({
          list: syncScoreLineList,
          scoreLines,
          supplierBasicInfo,
          sourceRuleType,
          type: 'NONE',
          totalScore: sumPassStatus || totalScore,
          candidateSuggestion,
        });
      }
    } else {
      const { sourceRuleType } = summaryScoreDetailDTO || {};
      const { technologyScoreLineList = [], businessScoreLineList = [], syncScoreLineList = [] } =
        baseSupplier || {};
      const omitBaseSupplier = omit(baseSupplier, 'sourceRuleType');
      // 如果第一个供应商是有效的
      if (!isEmpty(omitBaseSupplier)) {
        // 判断是否区分商务/技术
        if (sourceRuleType === 'DIFF') {
          // 构造技术组评分副标题
          const techLineTotal = {
            ...supplierBasicInfo,
            totalScore: null,
            sourceRuleType,
            candidateSuggestion: null,
            showInHeader: true,
            score: null,
            tempIndicateId: 'TECH',
            evaluateLineId: `TECH_${supplierBasicInfo.rfxLineSupplierId}`,
            scoreMeaning: `${intl
              .get(`${promptCode}.view.message.title.technologyScoreWeight`, {
                weight: null,
              })
              .d('技术分 ({weight}%)')}`,
          };
          scoreLines.push(techLineTotal);
          // 技术树
          constructorInValidScoreLines({
            list: technologyScoreLineList,
            scoreLines,
            supplierBasicInfo,
            sourceRuleType,
            type: 'TECH',
          });

          // 构造商务组评分副标题
          const businessLineTotal = {
            ...supplierBasicInfo,
            showInHeader: true,
            score: null,
            sourceRuleType,
            tempIndicateId: 'BUSINESS',
            evaluateLineId: `BUSINESS_${supplierBasicInfo.rfxLineSupplierId}`,
            scoreMeaning: `${intl
              .get(`${promptCode}.view.message.title.businessScoreWeight`, {
                weight: null,
              })
              .d('商务分 ({weight}%)')}`,
          };
          scoreLines.push(businessLineTotal);

          // 构造商务组要素树
          constructorInValidScoreLines({
            list: businessScoreLineList,
            scoreLines,
            supplierBasicInfo,
            sourceRuleType,
            type: 'BUSINESS',
          });
        } else {
          constructorInValidScoreLines({
            list: syncScoreLineList,
            scoreLines,
            supplierBasicInfo,
            sourceRuleType,
            type: 'NONE',
          });
        }
      } else {
        scoreLines.push({
          ...supplierBasicInfo,
          score: null,
          scoreMeaning: null,
          tempIndicateId: `NONE_${null}`,
          evaluateLineId: `NONE_${supplierBasicInfo.rfxLineSupplierId}`,
          showInHeader: true,
          totalScore: null,
          candidateSuggestion: null,
        });
      }
    }
  });
  return scoreLines;
};

// 计算单元格是否可编辑
const computedColumnCellEditable = (record) => {
  return !record.get('rankTeam') && record.get('validDataFlag') !== 0;
};

// 计算表头是否可编辑
const computedColumnHeaderEditable = (record) => {
  const rankTeam = record.get('rankTeam');
  return !rankTeam;
};

/**
 * 生成维度数组
 * @param {!Array} collection - 集合
 * @param {!Array|Function|Object|string|} iteratee - 这个迭代函数用来转换key (暂时只考虑函数/字符串)
 * @param {!Array} parentFieldNames 外层数组item字段名称集合
 * @param {!string} childFieldName - 子字段名称
 */
const generateTreeByGroup = (collection, iteratee, parentFieldNames, childFieldName) => {
  if (!isArray(collection)) return [];
  const tempTreeMap = {};
  const groupKey = isFunction(iteratee) ? iteratee() : iteratee;
  collection.forEach((item) => {
    const groupKey2Value = item[groupKey];
    if (!tempTreeMap[groupKey2Value]) tempTreeMap[groupKey2Value] = {};
    let groupParent = tempTreeMap[groupKey2Value];
    if (!isEmpty(groupParent)) {
      if (item.isGroupRecord) {
        // 正常来说, 进入此 if, 即为已分组非第一条数据, 理论上, 无需覆盖头字段, 但为了不可控因素还是判断一下
        parentFieldNames.forEach((fieldName) => {
          Object.assign(groupParent, { [fieldName]: item[fieldName] });
        });
      }
      if (!item.customizeFieldDirty) return;
      const childrenList = groupParent[childFieldName];
      groupParent = {
        ...groupParent,
        [childFieldName]: [...childrenList, item],
      };
      tempTreeMap[groupKey2Value] = groupParent;
    } else {
      if (item.isGroupRecord) {
        // 正常来说, 进入此 else, 即为新的分组第一条数据, 但为了不可控因素还是判断一下
        parentFieldNames.forEach((fieldName) => {
          Object.assign(groupParent, { [fieldName]: item[fieldName] });
        });
      }
      groupParent[childFieldName] = item.customizeFieldDirty ? [item] : [];
    }
  });
  return Object.values(tempTreeMap);
};

// 计算勾选框状态
const computedCheckBoxIsChecked = ({
  headerGroup,
  record: currentRecord,
  totalRecords,
  dimensionCode,
  type,
}) => {
  if (dimensionCode === 'ITEM') {
    if (['colHeader', 'rowHeader'].includes(type)) {
      const recordsLength = totalRecords.length;
      const selectedLength = totalRecords.filter((record) => record.getState('cellSelected'))
        .length;
      return {
        indeterminate: selectedLength > 0 && selectedLength < recordsLength,
        checked: selectedLength > 0 && recordsLength === selectedLength,
      };
    } else {
      return {
        indeterminate: false,
        checked: currentRecord.getState('cellSelected'),
      };
    }
    // switch (type) {
    //   case 'colHeader':
    //     const { subGroups } = headerGroup;
    //     const subGroupsLength = subGroups.length;
    //     const selectedLength = subGroups.filter(subGroup => subGroup.getState('cellSelected')).length;
    //     return {
    //       indeterminate: selectedLength > 0 && selectedLength < subGroupsLength,
    //       checked: subGroupsLength === selectedLength,
    //     };
    //   case 'rowHeader':
    //     return headerGroup.getState('rowAllSelected');
    //   case 'cell':
    //     return false;
    //   default:
    //     return totalRecords.some(r => r.getState('cellSelected'));
    // }
  } else {
    return {
      indeterminate: false,
      checked: headerGroup.getState('colAllSelected'),
    };
  }
};

export {
  getCurrentKeys,
  generateItemLines,
  getCurrentPosiztion,
  generateScoreLines,
  computedColumnCellEditable,
  computedColumnHeaderEditable,
  generateTreeByGroup,
  computedCheckBoxIsChecked,
  generateItemLinesInitData,
};
