import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import { isNil, isArray } from 'lodash';

import intl from 'utils/intl';

import StatusTag from '../../../../Components/StatusTag';
import styles from './index.less';

interface CalcFormulaProps {
  topRecord: any,
};

const CalcFormula = (props: CalcFormulaProps) => {
  const { topRecord } = props;
  const { cumulativeRule, cumulativeNature, sourceFieldLabel } = topRecord?.get(['cumulativeRule', 'cumulativeNature', 'sourceFieldLabel']) || {};

  const { clacformulaList = [], alloFormulaList = [], variableList = [] } = getFormulaContent(cumulativeRule, cumulativeNature, sourceFieldLabel);

  return (
    <div className={styles['spfp-rebateCalcFormula-warpper']}>
      <div className="spfp-rebateCalcFormula-formula-warpper">
        <div className="spfp-rebateCalcFormula-formula-calc">
          {clacformulaList.map(({ value, condition }) => (
            <div className="spfp-rebateCalcFormula-formula" key={value}>
              {!isNil(condition) && (
                <div className='spfp-rebateCalcFormula-formula-condition'>
                  <Icon type="remove" className="spfp-rebateCalcFormula-formula-condition-sign" />
                  <span>{intl.get('spfp.common.view.message.ruo').d('若')}</span>
                  <span>{condition}</span>
                </div>
              )}
              <div className="spfp-rebateCalcFormula-formula-content">
                <StatusTag color='blue' text={intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.calculationFormula').d('计算公式')} />
                <div className='spfp-rebateCalcFormula-formula-value'>{value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="spfp-rebateCalcFormula-formula-divider" />
        <div className="spfp-rebateCalcFormula-formula-allo">
          {alloFormulaList.map(({ value, remark }) => (
            <div className="spfp-rebateCalcFormula-formula" key={value}>
              <div className="spfp-rebateCalcFormula-formula-content">
                <StatusTag color='gray' text={intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.allocationFormula').d('分摊公式')} />
                <div className='spfp-rebateCalcFormula-formula-value'>{value}</div>
              </div>
              {!isNil(remark) && <div className='spfp-rebateCalcFormula-formula-remark'>{remark}</div>}
            </div>
          ))}
        </div>
      </div>
      {isArray(variableList) && (
        <div className="spfp-rebateCalcFormula-variable-warpper">
          {variableList.map(({ label, value }) => `${label} = ${value}`).join('；')}
        </div>
      )}
    </div>
  );
};

const getFormulaContent = (cumulativeRule, cumulativeNature, sourceFieldLabel): any => {
  const basePromptMap = {
    sumResult: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.sumResult').d('累计结果'),
    calcResult: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.calculateResult').d('计算结果'),
    sumResultAfterDeductBaseValue: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.deductBaseAmountValue').d('扣除基准值后的累计结果'),
    baseValue: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.baseAmountValue').d('基准值'),
    per: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.fixedValue').d('每'),
    rebate: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebateValue').d('返利'),
    rebateResult: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebateValueResult').d('返利结果'),
    rebateRangeFrom: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebateRangeFromValue').d('返利范围从'),
    rebateRangeTo: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebateRangeToValue').d('返利范围至'),
    rebatePoint: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebatePoint').d('返点'),
    sumResultOfsumDimension: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.cumulativeResultCount').d('累计维度汇总的累计结果'),
    calcResultOfsumDimension: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.calculateResultCount').d('累计维度汇总的计算结果'),
    sumOfAlloAmountExcLastRow: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.exceptLastLineSummaryAmount').d('除最后一行外分摊金额的汇总'),
    roundDown: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.roundDown').d('向下取整'),
    round: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.round').d('四舍五入'),
    accumulateAmount: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.accumulateAmount').d('累计金额'),
    sumResultQuantity: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.sumResultQuantity').d('累计结果，基准单价*基准值（数量）'),
    sumResultAfterDeductBaseValueQuantity: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.sumResultAfterDeductBaseValueQuantity').d('扣除基准值后的累计结果，c = a-b'),
    rebatePointQuantity: intl.get('spfp.rebateOrderCaculate.model.rebateCalcFormula.rebatePointQuantity').d('返点,g = k*e*0.01'),
  };
  const dynamicPromptMap = {
    varPerExplain: intl.get('spfp.rebateOrderCaculate.view.message.varPerExplain', { per: basePromptMap.baseValue, sumResult: basePromptMap.sumResult }).d('{per}，筛选出所有【{per}】小于【{sumResult}】的固定规则，取【{per}】最大的固定优惠规则行的【{per}】'),
    varRebateExplain: intl.get('spfp.rebateOrderCaculate.view.message.varRebateExplain', { per: basePromptMap.baseValue, sumResult: basePromptMap.sumResult, rebate: basePromptMap.rebate }).d('{per}，筛选出所有【{per}】小于【{sumResult}】的固定规则，取【{per}】最大的固定优惠规则行的【{rebate}】'),
  };
  if (['FIXED_DISCOUNT', 'GIFT'].includes(cumulativeRule)) {
    return {
      clacformulaList: [
        { value: 'f = (⌊c/d⌋)*e' },
      ],
      alloFormulaList: [
        { value: 'f = round(a/h*i)' },
        { value: 'f = ⌊a/h*i⌋' },
        { value: 'f = i-j' },
      ],
      variableList: [
        { label: 'a', value: basePromptMap.sumResult },
        { label: 'b', value: basePromptMap.baseValue },
        { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
        { label: 'd', value: dynamicPromptMap.varPerExplain },
        { label: 'e', value: dynamicPromptMap.varRebateExplain },
        { label: 'f', value: basePromptMap.calcResult },
        { label: 'h', value: basePromptMap.sumResultOfsumDimension },
        { label: 'i', value: basePromptMap.calcResultOfsumDimension },
        { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
        { label: '⌊⌋', value: basePromptMap.roundDown },
        { label: 'round', value: basePromptMap.round },
      ],
    };
  };
  if (cumulativeRule === 'FIXED_REBATES') {
    if (sourceFieldLabel === 'QUANTITY') {
      return {
        clacformulaList: [
          { value: 'f = (⌊c/d⌋)*g' },
        ],
        alloFormulaList: [
          { value: 'f = round(a/h*i)' },
          { value: 'f = ⌊a/h*i⌋' },
          { value: 'f = i-j' },
        ],
        variableList: [
          { label: 'a', value: basePromptMap.sumResultQuantity },
          { label: 'b', value: basePromptMap.baseValue },
          { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
          { label: 'd', value: dynamicPromptMap.varPerExplain },
          { label: 'e', value: dynamicPromptMap.varRebateExplain },
          { label: 'g', value: basePromptMap.rebatePointQuantity },
          { label: 'f', value: basePromptMap.calcResult },
          { label: 'h', value: basePromptMap.sumResultOfsumDimension },
          { label: 'i', value: basePromptMap.calcResultOfsumDimension },
          { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
          { label: 'k', value: basePromptMap.accumulateAmount },
          { label: '⌊⌋', value: basePromptMap.roundDown },
          { label: 'round', value: basePromptMap.round },
        ],
      };
    } else {
      return {
        clacformulaList: [
          { value: 'f = (⌊c/d⌋)*e' },
        ],
        alloFormulaList: [
          { value: 'f = round(a/h*i)' },
          { value: 'f = ⌊a/h*i⌋' },
          { value: 'f = i-j' },
        ],
        variableList: [
          { label: 'a', value: basePromptMap.sumResult },
          { label: 'b', value: basePromptMap.baseValue },
          { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
          { label: 'd', value: dynamicPromptMap.varPerExplain },
          { label: 'e', value: dynamicPromptMap.varRebateExplain },
          { label: 'f', value: basePromptMap.calcResult },
          { label: 'h', value: basePromptMap.sumResultOfsumDimension },
          { label: 'i', value: basePromptMap.calcResultOfsumDimension },
          { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
          { label: '⌊⌋', value: basePromptMap.roundDown },
          { label: 'round', value: basePromptMap.round },
        ],
      };
    }
  }
  if (cumulativeRule === 'LADDER_DISCOUNT') {
    if (cumulativeNature === 'STEP') {
      return {
        clacformulaList: [
          { value: 'f(x) =(c-(d1-1))*e*0.01', condition: 'd1<c<d2' },
          { value: 'f(x) = (d2-(d1-1))*g', condition: 'd2<c' },
        ],
        alloFormulaList: [
          { value: 'f = round(a/h*i)' },
          { value: 'f = ⌊a/h*i⌋' },
          { value: 'f = i-j' },
        ],
        variableList: [
          { label: 'a', value: basePromptMap.sumResult },
          { label: 'b', value: basePromptMap.baseValue },
          { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
          { label: 'd1', value: basePromptMap.rebateRangeFrom },
          { label: 'd2', value: basePromptMap.rebateRangeTo },
          { label: 'e', value: basePromptMap.rebateResult },
          { label: 'f', value: basePromptMap.calcResult },
          { label: 'g', value: basePromptMap.rebatePoint },
          { label: 'h', value: basePromptMap.sumResultOfsumDimension },
          { label: 'i', value: basePromptMap.calcResultOfsumDimension },
          { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
          { label: '⌊⌋', value: basePromptMap.roundDown },
          { label: 'round', value: basePromptMap.round },
        ],
      };
    };
    if (cumulativeNature === 'REACH_VOLUME') {
      return {
        clacformulaList: [
          { value: 'f = e', condition: 'd2<c，d1<c<d2' },
        ],
        alloFormulaList: [
          { value: 'f = round(a/h*i)' },
          { value: 'f = ⌊a/h*i⌋' },
          { value: 'f = i-j' },
        ],
        variableList: [
          { label: 'a', value: basePromptMap.sumResult },
          { label: 'b', value: basePromptMap.baseValue },
          { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
          { label: 'd1', value: basePromptMap.rebateRangeFrom },
          { label: 'd2', value: basePromptMap.rebateRangeTo },
          { label: 'e', value: basePromptMap.rebateResult },
          { label: 'f', value: basePromptMap.calcResult },
          { label: 'h', value: basePromptMap.sumResultOfsumDimension },
          { label: 'i', value: basePromptMap.calcResultOfsumDimension },
          { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
          { label: '⌊⌋', value: basePromptMap.roundDown },
          { label: 'round', value: basePromptMap.round },
        ],
      };
    }
  }
  if (cumulativeRule === 'LADDER_REBATES') {
    if (cumulativeNature === 'STEP') {
      return {
        clacformulaList: [
          { value: 'f(x) =(c-(d1-1))*e*0.01', condition: 'd1<c<d2' },
          { value: 'f(x) = (d2-(d1-1))*g', condition: 'd2<c' },
        ],
        alloFormulaList: [
          { value: 'f = round(a/h*i)' },
          { value: 'f = ⌊a/h*i⌋' },
          { value: 'f = i-j' },
        ],
        variableList: [
          { label: 'a', value: basePromptMap.sumResult },
          { label: 'b', value: basePromptMap.baseValue },
          { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
          { label: 'd1', value: basePromptMap.rebateRangeFrom },
          { label: 'd2', value: basePromptMap.rebateRangeTo },
          { label: 'e', value: basePromptMap.rebateResult },
          { label: 'f', value: basePromptMap.calcResult },
          { label: 'g', value: basePromptMap.rebatePoint },
          { label: 'h', value: basePromptMap.sumResultOfsumDimension },
          { label: 'i', value: basePromptMap.calcResultOfsumDimension },
          { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
          { label: '⌊⌋', value: basePromptMap.roundDown },
          { label: 'round', value: basePromptMap.round },
        ],
      };
    }
    if (cumulativeNature === 'REACH_VOLUME') {
      if (sourceFieldLabel === 'QUANTITY') {
        return {
          clacformulaList: [
            { value: 'f = c*e*0.01', condition: 'd2<c，d1<c<d2' },
          ],
          alloFormulaList: [
            { value: 'f = round(a/h*i)' },
            { value: 'f = ⌊k/h*i⌋' },
            { value: 'f = i-j' },
          ],
          variableList: [
            { label: 'a', value: basePromptMap.sumResultQuantity },
            { label: 'b', value: basePromptMap.baseValue },
            { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
            { label: 'd1', value: basePromptMap.rebateRangeFrom },
            { label: 'd2', value: basePromptMap.rebateRangeTo },
            { label: 'e', value: basePromptMap.rebateResult },
            { label: 'f', value: basePromptMap.calcResult },
            { label: 'h', value: basePromptMap.sumResultOfsumDimension },
            { label: 'i', value: basePromptMap.calcResultOfsumDimension },
            { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
            { label: 'k', value: basePromptMap.accumulateAmount },
            { label: '⌊⌋', value: basePromptMap.roundDown },
            { label: 'round', value: basePromptMap.round },
          ],
        };
      } else {
        return {
          clacformulaList: [
            { value: 'f = c*e*0.01', condition: 'd2<c，d1<c<d2' },
          ],
          alloFormulaList: [
            { value: 'f = round(a/h*i)' },
            { value: 'f = ⌊a/h*i⌋' },
            { value: 'f = i-j' },
          ],
          variableList: [
            { label: 'a', value: basePromptMap.sumResult },
            { label: 'b', value: basePromptMap.baseValue },
            { label: 'c', value: basePromptMap.sumResultAfterDeductBaseValue },
            { label: 'd1', value: basePromptMap.rebateRangeFrom },
            { label: 'd2', value: basePromptMap.rebateRangeTo },
            { label: 'e', value: basePromptMap.rebateResult },
            { label: 'f', value: basePromptMap.calcResult },
            { label: 'h', value: basePromptMap.sumResultOfsumDimension },
            { label: 'i', value: basePromptMap.calcResultOfsumDimension },
            { label: 'j', value: basePromptMap.sumOfAlloAmountExcLastRow },
            { label: '⌊⌋', value: basePromptMap.roundDown },
            { label: 'round', value: basePromptMap.round },
          ],
        };
      }
    }
  }

  return {};
};


export default CalcFormula;
