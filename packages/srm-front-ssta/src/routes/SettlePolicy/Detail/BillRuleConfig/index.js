/*
 * @Description: 结算策略详情-对账单规则配置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, memo, useMemo } from 'react';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { useModalOpen } from '../hooks';
import { Store } from '../StoreProvider';
import AutoFill from '../components/AutoFill';
import Dimension from '../components/Dimension';
import SyncErpModal from '../components/SyncErpModal';
import ApproveMethod from '../components/ApproveMethod';
import SelectBoxCard from '../components/SelectBoxCard';
import AmountHideModal from '../components/AmountHideModal';
import LinesLimitModal from '../components/LinesLimitModal';
import PricingModeModal from '../components/PricingModeModal';
import CollaborativeMode from '../components/CollaborativeMode';
import BillPriceAdjustModal from '../components/BillPriceAdjustModal';
import ElectronicSealModal from '../components/ElectronicSealModal';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import ErrorsAlert from '../components/ErrorsAlert';

/**
 * @description: 对账单规则配置
 * @param {Object} props
 * @return {ReactNode}
 */
const BillRuleConfig = () => {
  const {
    editFlag,
    billDimensionDs,
    billApproveMethodDs,
    billCollaborativeModeDs,
    headerDs,
    collectRef,
    documentLineConfig,
  } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const amountHideProps = {
    editFlag,
    size: 'medium',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.amountHides`).d('金额隐藏'),
    children: <AmountHideModal />,
  };
  const linesLimitProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.billLinesLimit`).d('对账单行数控制'),
    children: <LinesLimitModal name="enableBillLineLimitFlag" />,
  };
  const syncErpProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.syncErpConfig`).d('同步ERP设置'),
    children: <SyncErpModal name="enableBillErpSyncFlag" />,
  };

  const billPriceAdjustProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.priceAdjustFlag`).d('单价调整'),
    children: <BillPriceAdjustModal />,
  };

  const pricingModelProps = {
    editFlag,
    size: 'medium',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.pricingModel`).d('取价模式'),
    children: <PricingModeModal />,
  };

  const autoFillProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.view.title.billAutoFill`).d('对账自动填单'),
    children: <AutoFill documentType="BILL" />,
  };

  const electronicSealProps = {
    editFlag,
    size: 'small',
    title: intl.get(`ssta.settleStrategy.model.settleStrategy.electronicealRule`).d('电子签章规则'),
    children: <ElectronicSealModal documentType="BILL" />,
    onOk: () =>
      new Promise(async (resolve) => {
        // 校验关键字和签章顺序是否填写
        const {
          eSignOrder,
          purchaserESignKeyword,
          supplierESignKeyword,
          sealTimestampCode,
          billSilentSignatureFlag,
          billSealType,
        } = headerDs.current?.get([
          'eSignOrder',
          'purchaserESignKeyword',
          'supplierESignKeyword',
          'sealTimestampCode',
          'billSilentSignatureFlag',
          'billSealType',
        ]);
        // 记录值，当点击取消的时候还原上次记录的值
        headerDs.current.set('purchaserESignKeyword', purchaserESignKeyword);
        headerDs.current.set('supplierESignKeyword', supplierESignKeyword);
        headerDs.current.set('eSignOrder', eSignOrder);
        headerDs.current.set('sealTimestampCode', sealTimestampCode);
        headerDs.current.set('billSilentSignatureFlag', billSilentSignatureFlag);
        headerDs.current.set('billSealType', billSealType);
        await headerDs.current?.validate('eSignOrder');
        if (!eSignOrder || !sealTimestampCode) {
          resolve(false);
        } else {
          resolve();
        }
      }),
    onCancel: () =>
      new Promise(async (resolve) => {
        const purchaserESignKeyword = headerDs.current?.getPristineValue('purchaserESignKeyword');
        const supplierESignKeyword = headerDs.current?.getPristineValue('supplierESignKeyword');
        const eSignOrder = headerDs.current?.getPristineValue('eSignOrder');
        const sealTimestampCode = headerDs.current?.getPristineValue('sealTimestampCode');
        const billSilentSignatureFlag = headerDs.current?.getPristineValue(
          'billSilentSignatureFlag'
        );
        const billSealType = headerDs.current?.getPristineValue('billSealType');
        headerDs.current.set({
          purchaserESignKeyword,
          supplierESignKeyword,
          eSignOrder,
          sealTimestampCode,
          billSilentSignatureFlag,
          billSealType,
        });
        resolve();
      }),
  };

  const lineCount = useMemo(() => {
    const counts = documentLineConfig.filter((v) => ['BILL', 'ALL_BILL'].includes(v?.documentType))?.map((v) => v?.limitNum);
    return Math.min(...counts?.map(Number));
  }, [documentLineConfig]);

  return (
    <div className="strategy-panel-wrapper">
      <ErrorsAlert />
      <h3 className="ssta-form-title">
        {intl.get(`ssta.settleStrategy.view.title.billWholeConfig`).d('对账单整单配置')}
      </h3>
      <DynamicAlert
        message={intl
          .get(`ssta.settleStrategy.view.message.billConfigTip`)
          .d('「 依赖=否」的整单配置将作为创建单据的主策略，决定该单据的整体流程&配置	编辑删除')}
      />
      {/* 是否依赖 */}
      <SelectBoxCard
        name="billDependencyFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.billDependencyFlag')
          .d(
            '多个不同策略的结算事务合并创建对账单时，以唯一的「依赖=否」的结算策略作为对账单整单配置策略，对账单行配置不受该配置影响'
          )}
        wrapperStyle={{ marginTop: 0 }}
      />
      {/* 协同模式 */}
      <CollaborativeMode name="billCollaborativeModes" tableDs={billCollaborativeModeDs} />
      {/* 审批方式 */}
      <ApproveMethod name="billApprovalConfigs" tableDs={billApproveMethodDs} />
      {/* 对账维度 */}
      <Dimension name="billDimensionList" tableDs={billDimensionDs} />
      {/* 金额隐藏 */}
      <SelectBoxCard
        name="enableAmountHiddenFlag"
        onSuffixClick={() => modalOpen(amountHideProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.realTimeEffectiveBaseLastVersion')
          .d('根据最新版本结算策略配置，实时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.realTimeEffective').d('实时生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.amountHelp')
          .d(
            '	启用并定义规则后，所定义的内部角色/外部供应商在对账单相关界面的单价、总额等金额相关字段将显示为***'
          )}
      />
      {/* 自动出单 */}
      <SelectBoxCard
        name="autoIssueCode"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        suffixHelp={{
          EC_BILL: intl
            .get('ssta.settleStrategy.view.help.autoIssueDs')
            .d('该配置适用于「电商线上对账」场景'),
        }}
        help={intl.get('ssta.settleStrategy.view.help.autoIssue').d('配置是否自动生成对账单')}
        onSuffixClick={() => {}}
      />
      {/* 自动提交 */}
      <SelectBoxCard
        name="autoSubmitFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        suffixHelp={{
          1: intl
            .get('ssta.settleStrategy.view.help.autoSubmitFlag')
            .d('该配置适用于「ERP导入创建对账单」场景'),
        }}
        help={intl
          .get('ssta.settleStrategy.view.help.autoSubmit')
          .d('配置是否自动提交外部系统导入对账单')}
        optionFuncs={[{ option: '1' }, { option: '0' }]}
      />
      {/* 对账单行数控制 */}
      <SelectBoxCard
        name="enableBillLineLimitFlag"
        onSuffixClick={() => modalOpen(linesLimitProps)}
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
          .d('点击单据提交按钮时生效')}
        effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableBillLineLimitFlagTips', { lineCount })
          .d(
            '该配置适用于系统对接时，数据量过大导致的处理超时问题，可按对方系统处理速度调整SRM侧行数控制；选否，默认{lineCount}行'
          )}
      />
      {/* 同步ERP设置 */}
      <SelectBoxCard
        name="enableBillErpSyncFlag"
        onSuffixClick={() => modalOpen(syncErpProps)}
        effectiveTip={intl
          .get(`ssta.settleStrategy.view.message.turntEffectiveTip`)
          .d(
            '自动同步在触发接口时生效，通常为用户点击确认/取消按钮时，修改配置可动态控制可同步页签数据展示；手工同步在确认或者取消节点，根据当前最新已生效版本的策略更新同步状态'
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
      {/* 是否显示UX标题 */}
      <SelectBoxCard
        name="billUxFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
      />
      <SelectBoxCard
        name="billQuantitySumFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.realTimeEffectiveBaseLastVersion')
          .d('根据最新版本结算策略配置，实时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.realTimeEffective').d('实时生效')}
      />
      {/* 电子签章 */}
      <SelectBoxCard
        ref={(dom) => collectRef(dom, 'eSignFlag')}
        name="eSignFlag"
        effectiveText={intl
          .get('ssta.settleStrategy.view.message.confirmOrInteractEffective')
          .d('确认生效/触发系统间交互时生效')}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.confirmOrInteractEffectiveTips')
          .d('电子签章规则在触发应用商店接口时生效，通常为用户点击签章按钮')}
        onSuffixClick={() => modalOpen(electronicSealProps)}
      />

      <div className="strategy-horizontal-line" />
      <h3 className="ssta-form-title">
        {intl.get(`ssta.settleStrategy.view.title.billLineConfig`).d('对账单行配置')}
      </h3>
      {/* 对账公司 */}
      <SelectBoxCard
        name="billCompany"
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
          .get('ssta.settleStrategy.view.help.billCompany')
          .d('事务接入结算池时，可通过该配置设置该事务的对账主体')}
        wrapperStyle={{ marginTop: 0 }}
      />
      {/* 对账供应商 */}
      <SelectBoxCard
        name="billSupplier"
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
          .get('ssta.settleStrategy.view.help.billCompany')
          .d('事务接入结算池时，可通过该配置设置该事务的对账主体')}
      />
      {/* 单价调整 */}
      <SelectBoxCard
        name="enableBillPriceAdjustFlag"
        onSuffixClick={() => modalOpen(billPriceAdjustProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.enableBillPriceAdjustFlag')
          .d('结合「结算基准价」可控制对账时，该策略下的结算事务是否允许修改含税/不含税单价、数量')}
      />
      {/* 部分匹配 */}
      <SelectBoxCard
        name="billPartMatchFlag"
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
          .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
          .d('创建生效，提交更新')}
        help={intl
          .get('ssta.settleStrategy.view.help.billPartMatchFlag')
          .d(
            '控制该策略下的结算事务是否允许进行部分对账，系统体现在按「结算匹配维度」配置，对账数量/金额是否允许调整'
          )}
      />
      {/* 取价模式 */}
      <SelectBoxCard
        name="priceSource"
        option="PRICE_LIB"
        suffixHelp={{
          PRICE_LIB: intl
            .get('ssta.settleStrategy.view.help.priceSourceLib')
            .d('可选择点击「价格库取价」按钮或者结算池接入时获取价格库价格作为对账价格'),
          SETTLE: intl
            .get('ssta.settleStrategy.view.help.priceSourceSettle')
            .d('以事务接入结算池时的上游数据金额作为对账价格'),
        }}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
        help={intl
          .get('ssta.settleStrategy.view.help.priceSource')
          .d('控制策略下的事务创建单据时的价格取值来源')}
        onSuffixClick={() => modalOpen(pricingModelProps)}
      />
      {/* 是否启用对账行自动填单 */}
      <SelectBoxCard
        name="billAutoFillFlag"
        onSuffixClick={() => modalOpen(autoFillProps)}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.createEffectivePool')
          .d('选择事务创建单据、单据内新增行时生效')}
        effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
      />
    </div>
  );
};

export default memo(BillRuleConfig);
