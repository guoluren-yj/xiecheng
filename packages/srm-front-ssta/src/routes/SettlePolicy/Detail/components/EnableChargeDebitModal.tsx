/*
 * @Description: 结算策略详情-启用费用单账扣弹框
 * @Date: 2023-08-08 14:44:10
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useEffect, useMemo, useCallback } from 'react';
import { Select, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';

import { Store } from '../StoreProvider';
import EditorForm from '../../../Components/EditorForm';
import { unitValidate } from '../../../../utils/utils';


const EnableChargeDebitModal = observer((props) => {
  const { editFlag, headerDs } = useContext<any>(Store);

  const { debitEffectiveNode, debitCreatorType, debitCamp, autoInvoiceScenarioType } = headerDs?.current?.get(['debitEffectiveNode', 'debitCreatorType', 'debitCamp', 'autoInvoiceScenarioType']) || {};
  const { modal } = props;

  // 【创建人类型】为【指定账户】
  const isDesignateFlag = ['DESIGNATE_ACCOUNT'].includes(debitCreatorType);

  const hideDebitDocumentStatusFlag = useMemo(() => {
    return autoInvoiceScenarioType === 'DEBIT' && debitEffectiveNode === 'INVOICE_CREATE';
  }, [autoInvoiceScenarioType, debitEffectiveNode]);

  useEffect(() => {
    modal.handleOk(async () => {
      const validateFlag = await unitValidate(headerDs, [],
        ['autoInvoiceScenarioType', 'debitEffectiveNode',
          'debitDocumentStatus',
          'debitCamp',
          'debitCreatorType',
          'debitCreatedByLov',
        ]);
      if (!validateFlag) return false;

    });
  }, [modal, headerDs]);

  // 生节点提示语
  const getDebitEffectiveNodeTips = useCallback(() => {
    if (autoInvoiceScenarioType === 'DEBIT' && debitEffectiveNode === 'SETTLE_OR_BILLED') {
      return intl.get(`ssta.settleStrategy.view.message.settleDebitEffectiveNode`)
        .d('配置后，待结算数据处于可开票状态时，自动触发“账扣流程”，生成包含“账扣虚拟发票”的新建或者已提交状态的发票结算单。结合发票申请协同模式、审批方式配置，能够实现事务无需用户操作开票，可直接关联其他事务进行付款。注意：若您配置生成新建状态或者待审批状态的账扣发票结算单，对于审批退回或者取消等逆向场景以及提交前增删改结算单行以及税务发票行后，重新操作后将不会更新账扣虚拟发票，需您手工调整。');
    } else if (autoInvoiceScenarioType === 'DEBIT' && debitEffectiveNode === 'INVOICE_CREATE') {
      return intl
        .get(`ssta.settleStrategy.view.message.invoiceDebitEffectiveNode`)
        .d('配置后，当您勾选相关待结算数据创建发票结算单时，系统将自动按每一数据行匹配到的结算策略，自动生成对应的“账扣虚拟发票”税务发票行；由于发票结算单详情页支持新增、删除行，所以提交节点也会重新匹配生成“账扣虚拟发票”税务发票行。注意：您对“账扣虚拟发票”税务发票行的手工调整，将不生效。');
    } else if (autoInvoiceScenarioType === 'OFFLINE_INVOICE') {
      return intl
        .get(`ssta.settleStrategy.view.message.invoiceDebitOffLineEffectiveNode`)
        .d('配置后，待结算数据处于可开票状态时，自动触发“自动出单流程”，根据结算策略配置的并单、拆单规则生成新建状态的发票结算单');
    } else if (autoInvoiceScenarioType === 'EC') {
      return intl
        .get(`ssta.settleStrategy.view.message.invoiceDebitECEffectiveNode`)
        .d('配置后，待结算数据处于可开票状态时，自动触发“自动出单流程”，根据结算策略配置的并单、拆单规则生成新建或已提交的发票结算单；已提交状态的发票结算单将会自动提交给第三方电商进行开票。');
    } else if (autoInvoiceScenarioType === 'INVOICE_PLATFORM') {
      return intl
        .get(`ssta.settleStrategy.view.message.invoiceDebitInvPlatEffectiveNode`)
        .d('配置后，待结算数据处于可开票状态时，自动触发“自动出单流程“，根据结算策略配置的并单、拆单规则生成新建状态的发票结算单；供应商确认后将会自动提交给第三方开票平台进行开票。');
    }
    return intl
      .get(`ssta.settleStrategy.view.message.invDebitEffectiveNodeTips`)
      .d('事务推送至结算池后，系统每日闲时定时轮询可开票、结算策略启用自动出单，且生效节点=事务推入结算池或对账完成的数据，根据结算策略配置的并单、拆单规则自动生成开票结算。');
  }, [autoInvoiceScenarioType, debitEffectiveNode]);

  //  创建人类型提示语
  const getCreatorTypeTips = useCallback(() => {
    if (debitCreatorType === 'BILL_CREATOR') {
      return intl.get(`ssta.settleStrategy.view.message.debitCreatorTypeBillCreatorTips`)
        .d('对账单创建人：选择时请注意数据前序存在对账且对账单的创建方阵营和您当前配置的创建方阵营一致，若系统查询不到明确的对账单创建人或对账单和发票结算单创建方阵营冲突，则默认为系统；特别地，若数据前序存在多个对账单创建人，系统将任选一个作为发票申请创建人。');
    }
  }, [debitCreatorType]);

  const editorColumns = useMemo(
    () => [
      {
        name: 'autoInvoiceScenarioType',
        editor: Select,
        help: autoInvoiceScenarioType === 'DEBIT' && intl.get('ssta.settleStrategy.view.message.help.enableChargeDebitFlagTips')
          .d('账扣场景，即“ 按照订单全额开票，付款时扣减折扣金额付款”，因srm系统逻辑付款前必须完成发票结算流程，所以提供自动生成含账扣虚拟发票的发票结算单功能。'),
      },
      {
        name: 'debitEffectiveNode',
        editor: Select,
        help: getDebitEffectiveNodeTips(),
      },
      !hideDebitDocumentStatusFlag && {
        name: 'debitDocumentStatus',
        editor: Select,
        optionsFilter: (record) => ['NEW', 'SUBMITED'].includes(record.get('value')),
      },
      !hideDebitDocumentStatusFlag && {
        name: 'debitCamp',
        editor: Select,
      },
      !hideDebitDocumentStatusFlag && {
        name: "debitCreatorType",
        editor: Select,
        optionsFilter: record => debitCamp === 'PURCHASER'
          ? ['SETTLE_CREATOR', 'BILL_CREATOR', 'DESIGNATE_ACCOUNT', 'SYSTEM'].includes(record.get('value'))
          : ['SOURCE_RCV_CREATOR', 'SETTLE_CREATOR', 'BILL_CREATOR', 'SYSTEM'].includes(record.get('value')),
        help: getCreatorTypeTips(),
      },
      isDesignateFlag && {
        name: 'debitCreatedByLov',
        editor: Lov,
      },
    ],
    [
      isDesignateFlag,
      debitCamp,
      autoInvoiceScenarioType,
      hideDebitDocumentStatusFlag,
      getCreatorTypeTips,
      getDebitEffectiveNodeTips,
    ]
  );
  return (
    <EditorForm
      columns={1}
      dataSet={headerDs}
      editorFlag={editFlag}
      editorColumns={editorColumns}
    />
  );
});

export default EnableChargeDebitModal;
