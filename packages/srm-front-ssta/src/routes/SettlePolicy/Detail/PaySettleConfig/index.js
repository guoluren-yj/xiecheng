/*
 * @Description: 结算策略详情-对账结算单规则配置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, Fragment, useMemo } from 'react';
import { useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { useModalOpen } from '../hooks';
import { Store } from '../StoreProvider';
import PayRule from '../components/PayRule';
import AutoFill from '../components/AutoFill';
import Dimension from '../components/Dimension';
import SyncErpModal from '../components/SyncErpModal';
import SelectBoxCard from '../components/SelectBoxCard';
import ApproveMethod from '../components/ApproveMethod';
import LinesLimitModal from '../components/LinesLimitModal';
import PayDefaultAmount from '../components/PayDefaultAmount';
import PayOprPermission from '../components/PayOprPermission';
import CollaborativeMode from '../components/CollaborativeMode';
import ShowUxTitleModal from '../components/ShowUxTitleModal';
import PaymentSyncPayPlat from '../components/PaymentSyncPayPlat';
import PaymentControl from '../components/PaymentControl';
import PaymentFundPlanControl from '../components/PaymentFundPlanControl';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import ErrorsAlert from '../components/ErrorsAlert';

/**
 * @description: 付款结算单规则配置
 * @param {*}
 * @return {*}
 */
const PaySettleConfig = () => {
  const {
    headerDs,
    editFlag,
    payRuleDs,
    payDimensionDs,
    payApproveMethodDs,
    payOprPermissionDs,
    payDefaultAmountDs,
    payCollaborativeModeDs,
    payEnableFlag,
    fundEnableFlag,
    supBankInfoValidityControlFlag,
    documentLineConfig,
  } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const linesLimitProps = {
    editFlag,
    size: 'small',
    title: intl
      .get(`ssta.settleStrategy.model.settleStrategy.settleLinesLimit`)
      .d('结算单行数控制'),
    children: <LinesLimitModal name="enablePaymentLineLimitFlag" />,
  };

  const syncErpProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.syncErpConfig`).d('同步ERP设置'),
    children: <SyncErpModal name="enablePaymentErpSyncFlag" />,
  };

  const autoFillProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.paymentApplyAutoFill`).d('付款申请自动填单'),
    children: <AutoFill documentType="PAYMENT" />,
  };
  // 配置Ux标题弹窗
  const showUxTitleConfigProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.uxTitleFlag`).d('显示UX标题'),
    children: <ShowUxTitleModal documentType="PAYMENT" />,
  };

  const PaymentSyncPayPlatProps = {
    editFlag,
    size: 'small',
    title: intl
      .get(`ssta.settleStrategy.model.settleStrategy.syncPayPoolConfig`)
      .d('同步支付池设置'),
    children: <PaymentSyncPayPlat />,
  };

  const paymentControlProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.paymentControl`).d('付款管控'),
    children: <PaymentControl name="enablePaymentControlFlag" />,
  };

  const paymentFundPlanFlag = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.paymentFundPlanControl`).d('资金计划管控'),
    children: <PaymentFundPlanControl name="enablePaymentFundPlanFlag" />,
  };

  const lineCount = useMemo(() => {
    const counts = documentLineConfig
      .filter((v) => ['PAYMENT', 'ALL_PAYMENT'].includes(v?.documentType))
      ?.map((v) => v?.limitNum);
    return Math.min(...counts?.map(Number));
  }, [documentLineConfig]);

  return (
    <div className="strategy-panel-wrapper">
      <ErrorsAlert />
      <SelectBoxCard
        firstLevelTitleFlag
        name="enablePaymentFlag"
        help={intl
          .get('ssta.settleStrategy.view.help.enablePaymentFlag')
          .d(
            '根据结算事务的结算策略最新版本配置，控制引用结算事务创建付款申请页面数据展示，当“启用付款配置=否”时，该页面不展示对应结算事务。特殊地，当发票申请下所有结算事务均“启用付款配置=否”时，引用发票申请创建付款申请页面不展示该发票，发票申请下存在任意结算事务“启用付款配置=是”，发票申请展示（防止用户找不到对应发票申请），但创建付款申请时会报错提示用户存在无需付款的结算事务，可通过引用事务创建付款申请路径创建付款申请'
          )}
      />
      {Number(headerDs.current.get('enablePaymentFlag')) === 1 && (
        <Fragment>
          <div className="strategy-horizontal-line" />
          <h3 className="ssta-form-title">
            {intl
              .get(`ssta.settleStrategy.view.title.paySettleWholeConifg`)
              .d('付款申请结算单整单配置')}
          </h3>
          <DynamicAlert
            message={intl
              .get(`ssta.settleStrategy.view.message.billConfigTip`)
              .d('「 依赖=否」的整单配置将作为创建单据的主策略，决定该单据的整体流程&配置')}
          />
          {/* 是否依赖 */}
          <SelectBoxCard
            name="paymentDependencyFlag"
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
              .d('创建生效，提交更新')}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
              .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentDependencyFlag')
              .d(
                '多个不同策略的结算事务合并创建结算单时，以唯一的「依赖=否」的结算策略作为结算单整单配置策略，结算单行配置不受该配置影响'
              )}
            wrapperStyle={{ marginTop: 0 }}
          />
          {/* 协同模式 */}
          <CollaborativeMode name="paymentCollaborativeModes" tableDs={payCollaborativeModeDs} />
          {/* 审批方式 */}
          <ApproveMethod name="paymentApprovalConfigs" tableDs={payApproveMethodDs} />
          {/* 结算维度 */}
          <Dimension name="paymentDimensionList" tableDs={payDimensionDs} isTextFlag={2} />
          {/* 结算单行数控制 */}
          <SelectBoxCard
            name="enablePaymentLineLimitFlag"
            onSuffixClick={() => modalOpen(linesLimitProps)}
            effectiveTip={intl
              .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
              .d('点击单据提交按钮时生效')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.submitEffective`)
              .d('提交生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.enablePaymentLineLimitFlagTips', { lineCount })
              .d(
                '该配置适用于系统对接时，数据量过大导致的处理超时问题，可按对方系统处理速度调整SRM侧行数控制'
              )}
          />
          {/* 发票智能审核 */}
          <SelectBoxCard
            name="paymentPreReviewFlag"
            effectiveTip={intl
              .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
              .d('点击单据提交按钮时生效')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.submitEffective`)
              .d('提交生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentPreReviewFlag')
              .d('配置用户提交付款申请结算单时是否需自动调用智能审核接口，智能预审单据信息')}
          />
          {/* 同步ERP设置 */}
          <SelectBoxCard
            name="enablePaymentErpSyncFlag"
            onSuffixClick={() => modalOpen(syncErpProps)}
            effectiveTip={intl
              .get(`ssta.settleStrategy.view.message.turntEffectiveTip`)
              .d(
                '自动同步在触发接口时生效，通常为用户点击确认/取消按钮时，修改配置可动态控制可同步页签数据展示'
              )}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.turntEffective`)
              .d('触发系统间交互时生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.turntEffectiveHelp')
              .d(
                '启用后，系统将在单据确认后自动触发同步，同步失败可至工作台可同步页签下进行重新同步，同时修改该配置可动态控制可同步页签的数据展示'
              )}
          />
          {/* 同步支付池设置 */}
          {Number(payEnableFlag) === 1 && (
            <SelectBoxCard
              name="paymentSyncPayPlatformFlag"
              onSuffixClick={() => modalOpen(PaymentSyncPayPlatProps)}
              effectiveTip={intl
                .get(`ssta.settleStrategy.view.message.enablePayPoolSyncEffectiveTip`)
                .d(
                  '自动同步在触发同步时生效，通常为付款申请变为已确认状态后/点击【重新同步】按钮时，会实时查询配置决定是否触发同步至【支付池】'
                )}
              effectiveText={intl
                .get(`ssta.settleStrategy.view.message.interBetweenFuncsEffective`)
                .d('触发功能间交互时生效')}
            />
          )}
          {/* 付款操作权限 */}
          <PayOprPermission tableDs={payOprPermissionDs} documentType="PAYMENT" />
          {/* 付款规则 */}
          <PayRule tableDs={payRuleDs} />
          {/* 付款/预付款核销默认金额 */}
          <PayDefaultAmount tableDs={payDefaultAmountDs} />
          {/* 是否显示STEP单据创建引导 */}
          <SelectBoxCard
            name="paymentStepFlag"
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.formAffairToDocEffective')
              .d('选择事务创建单据时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.stepFlagHelp')
              .d(
                '是，展示STEP；否，则勾选结算事务创建结算单点击下一步时，可跳过STEP中后续步骤，直接进入单据编辑维护页面'
              )}
          />
          {/* 是否显示UX标题 */}
          <SelectBoxCard
            name="paymentUxFlag"
            onSuffixClick={() => modalOpen(showUxTitleConfigProps)}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePool')
              .d('选择事务创建单据、单据内新增行时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
          />
          {/* 是否启用付款管控 */}
          <SelectBoxCard
            name="enablePaymentControlFlag"
            onSuffixClick={() => modalOpen(paymentControlProps)}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePool')
              .d('选择事务创建单据、单据内新增行时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
          />
          {/* 是否启用资金计划管控 */}
          {Number(fundEnableFlag) === 1 && (
            <SelectBoxCard
              name="enablePaymentFundPlanFlag"
              onSuffixClick={() => modalOpen(paymentFundPlanFlag)}
              effectiveTip={intl
                .get('ssta.settleStrategy.view.message.createEffectivePool')
                .d('选择事务创建单据、单据内新增行时生效')}
              effectiveText={intl
                .get('ssta.settleStrategy.view.message.createEffective')
                .d('创建生效')}
            />
          )}
          {Number(supBankInfoValidityControlFlag) === 1 && (
            <SelectBoxCard
              name="paymentSupplierBankValidatorType"
              effectiveTip={intl
                .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
                .d('点击单据提交按钮时生效')}
              effectiveText={intl
                .get(`ssta.settleStrategy.view.message.submitEffective`)
                .d('提交生效')}
              help={intl
                .get('ssta.settleStrategy.view.help.supplierBankInfoValidityControl')
                .d(
                  '结算单提交时，可配置校验当前结算单中维护的供应商银行信息是否更新，若选择的银行信息更新或失效，提示用户重新选择'
                )}
            />
          )}
          {/* 付款申请取消校验付款记录 */}
          <SelectBoxCard
            name="paymentCancelValidatorType"
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.formAffairCancelToDocEffective')
              .d('结算单发起取消时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.cancelEffective')
              .d('取消生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentCancelValidate')
              .d(
                '可配置付款申请发起取消时是否校验外部系统回传的付款记录：a）存在付款记录禁止发起取消：当前付款记录接口仅支持新增，暂不支持删除；b）付款记录「付款金额」合计非0禁止取消：付款记录「付款金额」字段可传正/负数，发起取消时，系统合计结算单付款记录中「付款金额」字段，若为0，允许取消，若不为0禁止取消；c）不校验'
              )}
          />
          <div className="strategy-horizontal-line" />
          <h3 className="ssta-form-title">
            {intl
              .get(`ssta.settleStrategy.view.title.paySettleLineConifg`)
              .d('付款申请结算单行配置')}
          </h3>
          {/* 结算公司 */}
          <SelectBoxCard
            name="paymentSettleCompanyCode"
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePool')
              .d('选择事务创建单据、单据内新增行时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
            suffixHelp={{
              SOURCE_COMPANY: intl
                .get('ssta.settleStrategy.view.help.billCompanySource')
                .d('上游数据中的主体公司'),
              SETTLE_COMPANY: intl
                .get('ssta.settleStrategy.view.help.billCompanySettle')
                .d(
                  '仅订单直接推结算池、物流事务同步结算池场景（且来源数据有传入订单id）支持将订单中维护的结算公司作为结算公司，其他来源暂不支持'
                ),
            }}
            onSuffixClick={() => {}}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentSettleCompanyCode')
              .d('事务接入结算池时，可通过该配置设置该事务的结算主体')}
            wrapperStyle={{ marginTop: 0 }}
          />
          {/* 结算供应商 */}
          <SelectBoxCard
            name="paymentSettleSupplierCode"
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePool')
              .d('选择事务创建单据、单据内新增行时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
            onSuffixClick={() => {}}
            suffixHelp={{
              SOURCE_SUPPLIER: intl
                .get('ssta.settleStrategy.view.help.supplierSource')
                .d('上游数据中的主体供应商'),
              SETTLE_SUPPLIER: intl
                .get('ssta.settleStrategy.view.help.supplierSettle')
                .d('结算池接入时，将获取订单中维护的结算供应商作为对账主体'),
            }}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentSettleSupplierCode')
              .d('事务接入结算池时，可通过该配置设置该事务的结算主体')}
          />
          {/* 部分付款 */}
          <SelectBoxCard
            name="paymentPartMatchFlag"
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
              .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
              .d('创建生效，提交更新')}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentPartMatchFlag')
              .d(
                '控制该策略下的结算事务是否允许进行部分付款，系统体现在按「结算匹配维度」配置，付款数量/金额是否允许调整'
              )}
          />
          {/* 是否启用付款申请行自动填单 */}
          <SelectBoxCard
            name="paymentAutoFillFlag"
            onSuffixClick={() => modalOpen(autoFillProps)}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.createEffectivePool')
              .d('选择事务创建单据、单据内新增行时生效')}
            effectiveText={intl
              .get('ssta.settleStrategy.view.message.createEffective')
              .d('创建生效')}
            help={intl
              .get('ssta.settleStrategy.view.help.paymentAutoFillFlag')
              .d('该配置用于付款申请（仅付款）结算单配置')}
          />
        </Fragment>
      )}
    </div>
  );
};

export default observer(PaySettleConfig);
