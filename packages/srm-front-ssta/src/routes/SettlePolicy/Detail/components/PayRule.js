/*
 * @Description: 结算策略详情-付款规则弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, useCallback, memo, useEffect } from 'react';
import { Table, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { Store } from '../StoreProvider';
import CardTitle from './CardTitle';

/**
 * @description: 付款规则弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ tableDs, invDisabled }) => {
  const { editFlag, collectRef } = useContext(Store);

  const editable = editFlag && !invDisabled;

  useEffect(() => {
    tableDs.addEventListener('update', handleUpdate);
    return () => {
      tableDs.removeEventListener('update', handleUpdate);
    };
  }, [tableDs, handleUpdate]);

  const handleUpdate = useCallback(({ value, record, name }) => {
    if (name === 'prepaymentCheckLevel' && value === 'NONE') {
      record.set('prepaymentApplyContentType', null);
    }
  }, []);

  /**
   * 付款规则值集过滤
   * @param {*} option
   * @param {*} record
   * @returns
   */
  const optionsFilter = useCallback(
    (option, record) => record.get('paymentTypeCode') === option.get('parentValue'),
    []
  );

  const columns = useMemo(() => {
    return [
      { name: 'paymentTypeCode', width: 100 },
      {
        name: 'paymentRangeCode',
        width: 150,
        editor: (record) =>
          editable ? <Select optionsFilter={(option) => optionsFilter(option, record)} /> : false,
      },
      {
        name: 'invoiceCreatePayDimCode',
        width: 170,
        editor: editable,
      },
      { name: 'autoSplitRuleCode', width: 210, editor: editable },
      {
        name: 'prepaymentCheckLevel',
        width: 150,
        editor: editable,
        help: intl
          .get(`ssta.settleStrategy.view.help.prepaymentCheckLevel`)
          .d(
            '可在不同节点控制配置付款时，是否存在同维度的预付款未进行核销。预付款核销校验等级为警告，且校验节点为工作流审批时，不支持工作流批量审批，若用户启用工作流只读表单批量审批则系统不会警告提醒'
          ),
      },
      {
        name: 'prepaymentApplyContentType',
        width: 140,
        editor: editable,
        help: intl
          .get(`ssta.settleStrategy.view.message.prepaymentWriteOffContent`)
          .d(
            '根据「预付款核销维度」配置，校验是否存在同维度的，结算单状态为已确认、审批中的预付款预付款申请未核销，其中审批中状态包含已提交、取消中、提交审批中、提交审批中、外部系统审批中、外部系统取消审批中'
          ),
      },
      { name: 'prepaymentCheckPoint', width: 180, editor: editable },
      {
        name: 'autoApplyPrepaymentRuleCode',
        width: 160,
        editor: editable,
        help: intl
          .get(`ssta.settleStrategy.view.help.prepaymentAutoWriteOffRule`)
          .d(
            '预付款自动核销规则作用于多维度付款【一键预付款自动核销】按钮；发票结算单配置启用自动出单时，系统将会自动按照配置，执行核销逻辑，若需核实系统执行逻辑，付款操作权限中注意配置预付款核销相关权限可查看或可编辑'
          ),
      },
      {
        name: 'autoApplyPayAmountRuleCode',
        width: 200,
        editor: editable,
        help: intl
          .get(`ssta.settleStrategy.view.help.afterPrepayAutoWriteOffPayAmount`)
          .d(
            '预付款自动核销后付款金额作用于多维度付款【一键预付款自动核销】按钮；发票结算单配置启用自动出单时，系统将会自动按照配置，执行核销逻辑，若需核实系统执行逻辑，付款操作权限中注意配置预付款核销相关权限可查看或可编辑'
          ),
      },
    ];
  }, [editable, optionsFilter]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      title={
        <CardTitle
          title={tableDs.props.validationTitle}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePool')
            .d('选择事务创建单据、单据内新增行时生效')}
        />
      }
      ref={(dom) => collectRef(dom, 'paymentSettlePaymentRules')}
    >
      <Table dataSet={tableDs} columns={columns} customizedCode="SSTA_STRATEGY_DETAIL.PAY_RULE" />
    </Card>
  );
});
