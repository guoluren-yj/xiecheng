/*
 * @Description: 结算策略详情-启用开票并付款弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useEffect, useCallback, useContext, memo } from 'react';
import { useDataSet, useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import PayRule from './PayRule';
import { Store } from '../StoreProvider';
import PayOprPermission from './PayOprPermission';
import PayDefaultAmount from './PayDefaultAmount';
import { payOprPermissionDS } from '@/stores/SettleStrategyDS';
import SelectBoxCard from './SelectBoxCard';
import { useModalOpen } from '../hooks';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import ShowUxTitleModal from '../components/ShowUxTitleModal';

/**
 * @description: 启用开票并付款弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ modal }) => {
  const {
    headerDs,
    platModalFlag,
    settleConfigId,
    payRuleDs: invRuleDs,
    payDefaultAmountDs: invDefaultAmountDs,
    emitChangeModals,
    editFlag,
  } = useContext(Store);
  const invOprPermissionDs = useDataSet(() => payOprPermissionDS('INVOICE', platModalFlag), [
    platModalFlag,
  ]);

  const invDisabled = Number(headerDs.current.get('enablePaymentFlag')) === 1;

  const uxTitleodal = useModal();
  const modalOpen = useModalOpen(uxTitleodal);

  useEffect(() => {
    modal.handleOk(handleSubmit);
    invOprPermissionDs.setQueryParameter('settleConfigId', settleConfigId);
    invOprPermissionDs.query();
  }, [modal, handleSubmit, settleConfigId, invOprPermissionDs]);

  /**
   * @description: 弹窗确认回调
   * @param {*}
   * @return {Boolean} 是否都提交成功
   */
  const handleSubmit = useCallback(async () => {
    emitChangeModals('invoicePayEnableFlag');
    const dsMap = invDisabled
      ? [invOprPermissionDs]
      : [invRuleDs, invOprPermissionDs, invDefaultAmountDs];
    const validateRes = await Promise.all(dsMap.map((item) => item.validate()));
    if (validateRes.some((item) => !item)) return false;
    const submitRes = await Promise.all(dsMap.map((item) => item.submit()));
    return !submitRes.some((item) => !item);
  }, [invRuleDs, invOprPermissionDs, invDefaultAmountDs, invDisabled, emitChangeModals]);

  // 配置Ux标题弹窗
  const showUxTitleConfigProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.uxTitleFlag`).d('显示UX标题'),
    children: <ShowUxTitleModal documentType="INVOICE_PAYMENT" />,
  };

  return (
    <Fragment>
      {invDisabled && (
        <DynamicAlert
          placement="modal-top"
          message={intl
            .get(`ssta.settleStrategy.view.message.billConfigInfo`)
            .d(
              '当前策略已启用独立付款功能，本弹窗中的「付款规则」「付款/预付款核销默认金额」无需配置，至【付款申请结算单整单配置-付款规则&付款/预付款核销默认金额】配置即可'
            )}
        />
      )}
      <div>
        <PayOprPermission tableDs={invOprPermissionDs} documentType="INVOICE" />
        <PayRule tableDs={invRuleDs} invDisabled={invDisabled} />
        <PayDefaultAmount tableDs={invDefaultAmountDs} invDisabled={invDisabled} />
        <SelectBoxCard
          name="invoicePaymentStepFlag"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.formAffairToDocEffective')
            .d('选择事务创建单据时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
          help={intl
            .get('ssta.settleStrategy.view.help.stepFlagHelp')
            .d(
              '是，展示STEP；否，则勾选结算事务创建结算单点击下一步时，可跳过STEP中后续步骤，直接进入单据编辑维护页面'
            )}
        />
        <SelectBoxCard
          name="invoicePaymentUxFlag"
          onSuffixClick={() => modalOpen(showUxTitleConfigProps)}
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePool')
            .d('选择事务创建单据、单据内新增行时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        />
        <SelectBoxCard
          name="paymentAmountAdjustFlag"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePool')
            .d('选择事务创建单据、单据内新增行时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        />
        <SelectBoxCard
          name="defaultPaymentAmountType"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.defaultPaymentAmount')
            .d('该配置仅在创建发票结算单时生效，且不考虑预付款核销')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        />
      </div>
    </Fragment>
  );
});
