/*
 * @Description: 结算策略详情-开票结算单规则配置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, memo, useCallback, useMemo } from 'react';
import { useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { useModalOpen } from '../hooks';
import { Store } from '../StoreProvider';
import AutoFill from '../components/AutoFill';
import Dimension from '../components/Dimension';
import SyncErpModal from '../components/SyncErpModal';
import InvMatchRule from '../components/InvMatchRule';
import SelectBoxCard from '../components/SelectBoxCard';
import ApproveMethod from '../components/ApproveMethod';
import ToleAutoAdjust from '../components/ToleAutoAdjustModal';
import EnableInvAndPay from '../components/EnableInvAndPayModal';
import InvAmountAdjust from '../components/InvAmountAdjustModal';
import LinesLimitModal from '../components/LinesLimitModal';
import ToleManualAdjust from '../components/ToleManualAdjustModal';
import CollaborativeMode from '../components/CollaborativeMode';
import ShowUxTitleModal from '../components/ShowUxTitleModal';
import EnableChargeDebitModal from '../components/EnableChargeDebitModal';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import ErrorsAlert from '../components/ErrorsAlert';

/**
 * @description: 开票结算单规则配置
 * @param {*}
 * @return {ReactNode}
 */
const InvSettleConfig = () => {
  const {
    editFlag,
    invDimensionDs,
    invApproveMethodDs,
    invCollaborativeModeDs,
    settleConfigId,
    fundEnableFlag,
    documentLineConfig,
  } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const autoAdjustProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.toleAutoAdjust`).d('尾差自动调整'),
    children: <ToleAutoAdjust />,
  };

  const manualAdjustProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.toleManualAdjust`).d('尾差手动调整'),
    children: <ToleManualAdjust />,
  };

  const enableInvAndPayProps = useMemo(
    () => ({
      editFlag,
      size: 'large',
      title: intl.get(`ssta.settleStrategy.view.title.enableInvAndPay`).d('付款申请(含发票)配置'),
      children: <EnableInvAndPay />,
    }),
    [editFlag]
  );

  const openInvoicePayEnableModal = useCallback(() => {
    if (!settleConfigId) {
      notification.warning({
        message: intl
          .get(`ssta.settleStrategy.view.settleStrategy.not.modifiable`)
          .d('未保存或发布的单据不可维护'),
      });
      return;
    }
    modalOpen(enableInvAndPayProps);
  }, [settleConfigId, modalOpen, enableInvAndPayProps]);

  const invAmountAdjustProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.invAmountAdjust`).d('金额调整'),
    children: <InvAmountAdjust />,
  };

  const syncErpProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.syncErpConfig`).d('同步ERP设置'),
    children: <SyncErpModal name="enableInvoiceErpSyncFlag" />,
  };

  const linesLimitProps = {
    editFlag,
    size: 'small',
    title: intl
      .get(`ssta.settleStrategy.model.settleStrategy.settleLinesLimit`)
      .d('结算单行数控制'),
    children: <LinesLimitModal name="enableInvoiceLineLimitFlag" />,
  };

  const autoFillProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.invoiceApplyAutoFill`).d('发票申请自动填单'),
    children: <AutoFill documentType="INVOICE" />,
  };

  const taxLinesLimitProps = {
    editFlag,
    size: 'small',
    title: intl
      .get(`ssta.settleStrategy.model.settleStrategy.enableTaxInvoiceLineLimit`)
      .d('税务发票行数控制'),
    children: <LinesLimitModal name="enableTaxInvoiceLineLimitFlag" customKey="tax_invoice" />,
  };

  // 配置Ux标题弹窗
  const showUxTitleConfigProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.uxTitleFlag`).d('显示UX标题'),
    children: <ShowUxTitleModal documentType="INVOICE" />,
  };

  // 自动出单
  const enableChargeDebitProps = {
    editFlag,
    size: 'small',
    title: intl
      .get(`ssta.settleStrategy.model.settleStrategy.configAutoCreateInv`)
      .d('配置是否自动生成发票结算单'),
    children: <EnableChargeDebitModal />,
  };

  const lineCount = useMemo(() => {
    const counts = documentLineConfig
      .filter((v) => ['INVOICE', 'ALL_INVOICE'].includes(v?.documentType))
      ?.map((v) => v?.limitNum);
    return Math.min(...counts?.map(Number));
  }, [documentLineConfig]);

  return (
    <div className="strategy-panel-wrapper">
      <ErrorsAlert />
      <h3 className="ssta-form-title">
        {intl
          .get(`ssta.settleStrategy.view.title.invSettleWholeConifg`)
          .d('发票申请结算单整单配置')}
      </h3>
      <DynamicAlert
        message={intl
          .get(`ssta.settleStrategy.view.message.billConfigTip`)
          .d('「 依赖=否」的整单配置将作为创建单据的主策略，决定该单据的整体流程&配置')}
      />
      {/* 是否依赖 */}
      <SelectBoxCard
        name="invoiceDependencyFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoiceDependencyFlag')
          .d(
            '多个不同策略的结算事务合并创建对账单时，以唯一的「依赖=否」的结算策略作为对账单整单配置策略，对账单行配置不受该配置影响'
          )}
        wrapperStyle={{ marginTop: 0 }}
      />
      <SelectBoxCard
        name="enableChargeDebitFlag"
        onSuffixClick={() => modalOpen(enableChargeDebitProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.formAffairToDocEffective')
          .d('选择事务创建单据时生效')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
      />
      {/* 协同模式 */}
      <CollaborativeMode name="invoiceCollaborativeModes" tableDs={invCollaborativeModeDs} />
      {/* 审批方式 */}
      <ApproveMethod name="invoiceApprovalConfigs" tableDs={invApproveMethodDs} />
      {/* 结算维度 */}
      <Dimension name="invoiceDimensionList" tableDs={invDimensionDs} isTextFlag={1} />
      {/* 发票匹配规则 */}
      <InvMatchRule />
      {/* 发票尾差处理模式 */}
      <SelectBoxCard
        name="amountAdjustFlag"
        optionFuncs={[
          {
            option: '1',
            onSuffixClick: () => modalOpen(autoAdjustProps),
          },
          {
            option: '0',
            onSuffixClick: () => modalOpen(manualAdjustProps),
          },
        ]}
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.amountAdjustEffectTip`)
          .d(
            '尾差自动调整为创建生效，即选择事务创建单据、单据内新增行时生效；尾差手动调整为创建生效，提交更新，即点击单据提交按钮时获取最新配置校验'
          )}
        effectiveText={intl.get(`ssta.settleStrategy.view.message.seeDescForDetails`).d('详见描述')}
        suffixHelp={{
          1: intl
            .get('ssta.settleStrategy.view.help.autoHandle')
            .d(
              '启用后用户可通过点击编辑界面的「尾差调整」按钮触发系统自动调整，调整后系统含税总额/税额与填写的税务发票一致'
            ),
          0: intl
            .get('ssta.settleStrategy.view.help.handHandle')
            .d('启用手动调整后可配置允许允差，及超出允差范围时的校验节点、等级'),
        }}
      />
      {/* 结算单行数控制 */}
      <SelectBoxCard
        name="enableInvoiceLineLimitFlag"
        onSuffixClick={() => modalOpen(linesLimitProps)}
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
          .d('点击单据提交按钮时生效')}
        effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableInvoiceLineLimitFlagTips', { lineCount })
          .d(
            '该配置适用于系统对接时，数据量过大导致的处理超时问题，可按对方系统处理速度调整SRM侧行数控制'
          )}
      />
      {/* 发票智能审核 */}
      <SelectBoxCard
        name="invoicePreReviewFlag"
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
          .d('点击单据提交按钮时生效')}
        effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoicePreReviewFlag')
          .d('配置用户提交发票申请结算单时是否需自动调用智能审核接口，智能预审单据信息')}
      />
      {/* 同步ERP设置 */}
      <SelectBoxCard
        name="enableInvoiceErpSyncFlag"
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
      {/* 付款申请(含发票)配置 */}
      <SelectBoxCard
        name="invoicePayEnableFlag"
        onSuffixClick={openInvoicePayEnableModal}
        isShowText
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoicePayEnableFlag')
          .d(
            '该配置项仅针对新建「付款申请结算单（含发票）」场景，启用后，可在开票的同时进行付款操作'
          )}
      />
      {/* 是否显示STEP单据创建引导 */}
      <SelectBoxCard
        name="invoiceStepFlag"
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
      {/* 是否显示UX题 */}
      <SelectBoxCard
        name="invoiceUxFlag"
        onSuffixClick={() => modalOpen(showUxTitleConfigProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
      />
      {/* 税务发票行数控制 */}
      <SelectBoxCard
        name="enableTaxInvoiceLineLimitFlag"
        onSuffixClick={() => modalOpen(taxLinesLimitProps)}
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
          .d('点击单据提交按钮时生效')}
        effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableTaxInvoiceLineLimitFlag')
          .d('该配置适用于业务人员在维护发票申请结算单时，控制录入税务发票数量')}
      />
      {/* 是否允许手工录入税务发票行信息 */}
      <SelectBoxCard
        name="enableTaxInvoiceLineCreateFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.formAffairToDocEffective')
          .d('选择事务创建单据时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableTaxInvoiceLineCreateFlag')
          .d(
            '控制该策略下的单据是否可以通过手工录入的方式在新建&编辑弹窗内，录入税务发票头信息后点击下一步继续维护税务发票行信息；excel导入、ocr识别、ofd解析或发票查验等路径插入税务发票行不受影响'
          )}
      />
      {/* 发票申请取消校验付款记录 */}
      <SelectBoxCard
        name="invoiceCancelValidatorType"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.formAffairCancelToDocEffective')
          .d('结算单发起取消时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.cancelEffective').d('取消生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoiceCancelValidate')
          .d(
            '可配置发票申请发起取消时是否校验外部系统回传的付款记录：a）存在付款记录禁止发起取消：当前付款记录接口仅支持新增，暂不支持删除；b）付款记录「付款金额」合计非0禁止取消：付款记录「付款金额」字段可传正/负数，发起取消时，系统合计结算单付款记录中「付款金额」字段，若为0，允许取消，若不为0禁止取消；c）不校验'
          )}
      />
      {/* 是否启用发票申请行自动填单 */}
      {Number(fundEnableFlag) === 1 && (
        <SelectBoxCard
          name="invoiceSyncPrepFlag"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePool')
            .d('选择事务创建单据、单据内新增行时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        />
      )}
      <div className="strategy-horizontal-line" />
      <h3 className="ssta-form-title">
        {intl.get(`ssta.settleStrategy.view.title.invSettleLineConifg`).d('发票申请结算单行配置')}
      </h3>
      {/* 结算公司 */}
      <SelectBoxCard
        name="invoiceSettleCompanyCode"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        onSuffixClick={() => {}}
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
        help={intl
          .get('ssta.settleStrategy.view.help.invoiceSettleCompanyCode')
          .d('事务接入结算池时，可通过该配置设置该事务的结算主体')}
        wrapperStyle={{ marginTop: 0 }}
      />
      {/* 结算供应商 */}
      <SelectBoxCard
        name="invoiceSettleSupplierCode"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
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
          .get('ssta.settleStrategy.view.help.invoiceSettleSupplierCode')
          .d('事务接入结算池时，可通过该配置设置该事务的结算主体')}
      />
      {/* 金额调整 */}
      <SelectBoxCard
        name="enableInvoiceAmountAdjustFlag"
        onSuffixClick={() => modalOpen(invAmountAdjustProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableInvoiceAmountAdjustFlag')
          .d(
            '按结算事务策略，控制该策略下的结算单行是否允许进行单价、税率、税额的调整及对应控制类型、方案'
          )}
      />
      {/* 部分开票 */}
      <SelectBoxCard
        name="invoicePartMatchFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoicePartMatchFlag')
          .d(
            '控制该策略下的结算事务是否允许进行部分开票，系统体现在按「结算匹配维度」配置，开票数量/金额是否允许调整'
          )}
      />
      {/* 是否启用发票申请行自动填单 */}
      <SelectBoxCard
        name="invoiceAutoFillFlag"
        onSuffixClick={() => modalOpen(autoFillProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.invoiceAutoFillFlag')
          .d('该配置用于发票申请结算单和付款申请（含发票）结算单配置')}
      />
    </div>
  );
};

export default memo(InvSettleConfig);
