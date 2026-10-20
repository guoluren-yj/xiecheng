/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-14 11:44:24
 */

import React from 'react';
import intl from 'utils/intl';

import BudgetAmountIcon from '@/assets/budget_amount.svg';
import BudgetBalanceAmountIcon from '@/assets/budget_balance_amount.svg';
import BudgetWrttenOffIcon from '@/assets/budget_written_off.svg';
import BudgetWrttenOffSelectIcon from '@/assets/budget_wirtten_off_highlight.svg';
import BudgetNotWrttenOffIcon from '@/assets/budget_not_written_off.svg';
import BudgetNotWrttenOffISelectcon from '@/assets/budget_not_written_off_highlight.svg';
import FormulaItem from './formulaItem';

import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index(props) {
  const { amountObj = {}, occupiedModalFlag, ...others } = props;

  const {
    remainingAmount = 0,
    budgetAmount = 0,
    occupiedAmount = 0,
    appliedAmount = 0,
    origBudgetAmount = 0,
    adjustAmount = 0,
  } = amountObj;

  return (
    <>
      <div className={styles['occupied-or-applied-detail-formula']}>
        <FormulaItem
          {...others}
          key="budgetBalanceAmount"
          name="budgetBalanceAmount"
          title={occupiedModalFlag === 1 ? intl.get(`${commonPrompt}.availableBalance`).d('可用余额') : intl.get(`${commonPrompt}.budgetBalanceAmount`).d('预算余额')}
          amount={remainingAmount}
          imgSrc={BudgetBalanceAmountIcon}
          selectSrc={BudgetBalanceAmountIcon}
          disabled
        />

        <div className={styles['occupied-or-applied-detail-formula-symbol']}>=</div>

        <FormulaItem
          {...others}
          key="budgetAmount"
          name="budgetAmount"
          title={occupiedModalFlag === 1 ? intl.get(`${commonPrompt}.totalAvailableAmount`).d('可用总额') : intl.get(`${commonPrompt}.availableBudgetAmount`).d('可用预算总额')}
          amount={budgetAmount}
          imgSrc={BudgetAmountIcon}
          selectSrc={BudgetAmountIcon}
          disabled
        />

        <div className={styles['occupied-or-applied-detail-formula-symbol']}>-</div>

        <FormulaItem
          {...others}
          key="occupiedAmount"
          name="occupiedAmount"
          title={intl.get(`${commonPrompt}.occupiedAmount`).d('已占用金额')}
          amount={occupiedAmount}
          imgSrc={BudgetNotWrttenOffIcon}
          selectSrc={BudgetNotWrttenOffISelectcon}
          disabled
        />
        {/* 提供预算占用弹窗信息，无需显示已核销金额 */}
        {occupiedModalFlag !== 1 && <div className={styles['occupied-or-applied-detail-formula-symbol']}>-</div>}

        {occupiedModalFlag !== 1 && <FormulaItem
          {...others}
          key="appliedAmount"
          name="appliedAmount"
          title={intl.get(`${commonPrompt}.appliedAmount`).d('已核销金额')}
          amount={appliedAmount}
          imgSrc={BudgetWrttenOffIcon}
          selectSrc={BudgetWrttenOffSelectIcon}
          disabled
        />}
      </div>
      {adjustAmount < 0 && (
        <div className={styles['occupied-or-applied-detail-alert']}>
          <span className={styles['occupied-or-applied-detail-alert-message']}>
            {intl
              .get(`${commonPrompt}.occupiedOrAppliedHelp`, {
                budgetAmount,
                origBudgetAmount,
                adjustAmount: Math.abs(adjustAmount),
              })
              .d(
                `存在未审批且金额为负的预算调整单，因此：可用预算总额${budgetAmount}=已审批的预算总额${origBudgetAmount}-在途调整金额${Math.abs(
                  adjustAmount
                )}`
              )}
          </span>
        </div>
      )}
    </>
  );
};

export default Index;
