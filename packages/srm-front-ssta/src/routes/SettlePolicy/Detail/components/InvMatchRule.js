/*
 * @Description: 结算策略详情-发票匹配规则
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, useCallback } from 'react';
import { Table, useModal, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from './CardTitle';
import { useModalOpen } from '../hooks';
import { Store } from '../StoreProvider';
import CheckRuleModal from './CheckRuleModal';
import InspectRuleConfigModal from './InspectRuleConfigModal';

/**
 * @description: 发票匹配规则
 * @param {*}
 * @return {ReactNode}
 */
export default observer(() => {
  const { headerDs, editFlag, collectRef } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const { invoiceMatchRuleCode, directInvoiceType, directInvoicePoint } = headerDs.current.get([
    'invoiceMatchRuleCode',
    'directInvoiceType',
    'directInvoicePoint',
  ]);

  const isConfirmColShow =
    invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
    directInvoiceType === 'INVOICE_PLATFORM' &&
    directInvoicePoint === 'APPROVED';

  const inspectRuleConfigProps = useMemo(
    () => ({
      editFlag,
      size: 'small',
      title: intl.get(`ssta.settleStrategy.view.settleStrategy.ruleSet`).d('查验规则设置'),
      children: <InspectRuleConfigModal headerDs={headerDs} editFlag={editFlag} />,
    }),
    [editFlag, headerDs]
  );
  const checkRuleConfigProps = useMemo(
    () => ({
      editFlag,
      size: 'large',
      title: intl.get(`ssta.settleStrategy.view.settleStrategy.checkRuleSet`).d('校验规则设置'),
      children: <CheckRuleModal headerDs={headerDs} editFlag={editFlag} />,
    }),
    [editFlag, headerDs]
  );
  // 目前二次审批方式只开放功能审批
  const optionsFilter = useCallback((option) => {
    return option.get('value') === 'FUNCTIONAL';
  }, []);
  // 先过滤审批通过
  const optionsFilterDirectInvoicePoint = useCallback((option) => {
    return option.get('value') !== 'APPROVED';
  }, []);
  const columns = useMemo(() => {
    return [
      {
        width: 120,
        name: 'invoiceMatchRuleCode',
        editor: editFlag,
      },
      {
        name: 'enableCheckFlag',
        width: 120,
        editor: editFlag,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'inspectRuleConfig',
        width: 100,
        renderer: ({ record }) =>
          record.get('enableCheckFlag') === 1 ? (
            <a onClick={() => modalOpen(inspectRuleConfigProps)}>
              {intl.get(`hzero.common.button.setting`).d('设置')}
            </a>
          ) : null,
      },
      {
        name: 'checkRuleConfig',
        width: 100,
        renderer: () => (
          <a onClick={() => modalOpen(checkRuleConfigProps)}>
            {intl.get(`hzero.common.button.setting`).d('设置')}
          </a>
        ),
      },
      {
        name: 'directInvoiceType',
        width: 120,
        editor: (record) => editFlag && record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING',
        renderer: ({ text, record }) => {
          if (record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING') {
            return text;
          } else {
            return null;
          }
        },
      },
      {
        name: 'directInvoicePoint',
        width: 120,
        editor: (record) => {
          // 【发票匹配规则】= 【直连开票】且【直连开票类型】=【开票平台】
          return (
            (editFlag &&
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoiceType') === 'INVOICE_PLATFORM') ? <Select optionsFilter={option => optionsFilterDirectInvoicePoint(option)} /> : false
          );
        },
        renderer: ({ record, text }) => {
          if (
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoiceType') === 'INVOICE_PLATFORM'
          ) {
            return text;
          } else {
            return null;
          }
        },
      },
      {
        name: 'invoiceSettleCancelFlag',
        width: 120,
        editor: (record) => {
          // 调整为：当发票匹配规则=直连开票 且 直连开票类型=开票平台 或 电商时，可维护，非必输
          return (
            editFlag &&
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            ['INVOICE_PLATFORM', 'EC'].includes(record.get('directInvoiceType'))
          );
        },
        renderer: ({ record, text }) => {
          if (
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            ['INVOICE_PLATFORM', 'EC'].includes(record.get('directInvoiceType'))
          ) {
            return text;
          } else {
            return null;
          }
        },
      },
      {
        name: 'confirmAgainFlag',
        width: 120,
        editor: (record) =>
          // 直连开票】且【直连开票类型】=【开票平台】且【直连开票节点】=【审批通过】的时候显示
          record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
          record.get('directInvoiceType') === 'INVOICE_PLATFORM' &&
          record.get('directInvoicePoint') === 'APPROVED' &&
          editFlag,
        hidden: !isConfirmColShow,
        renderer: ({ record, text }) => {
          if (
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoiceType') === 'INVOICE_PLATFORM' &&
            record.get('directInvoicePoint') === 'APPROVED'
          ) {
            return text;
          } else {
            return null;
          }
        },
      },
      {
        name: 'confirmAgainApprovedMethodCode',
        width: 150,
        editor: (record) =>
          // 直连开票】且【直连开票类型】=【开票平台】且【直连开票节点】=【审批通过】的时候显示
          record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
          record.get('directInvoiceType') === 'INVOICE_PLATFORM' &&
          record.get('directInvoicePoint') === 'APPROVED' &&
          record.get('confirmAgainFlag') === '1' &&
          editFlag ? (
            <Select optionsFilter={(option) => optionsFilter(option, record)} />
          ) : (
            false
          ),
        hidden: !isConfirmColShow,
        renderer: ({ record, text }) => {
          if (
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoiceType') === 'INVOICE_PLATFORM' &&
            record.get('directInvoicePoint') === 'APPROVED'
          ) {
            return text;
          } else {
            return null;
          }
        },
      },
    ];
  }, [
    isConfirmColShow,
    editFlag,
    modalOpen,
    optionsFilter,
    checkRuleConfigProps,
    inspectRuleConfigProps,
    optionsFilterDirectInvoicePoint,
  ]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      ref={(dom) => collectRef(dom, 'invMatchRule')}
      title={
        <CardTitle
          title={intl.get('ssta.settleStrategy.view.title.invMatchRule').d('发票匹配规则')}
          help={intl
            .get(`ssta.settleStrategy.view.help.invMatchRule`)
            .d('设置税务发票开具方式，对发票查验、直连开票等相关配置')}
          effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
          effectiveTip={intl
            .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
            .d('点击单据提交按钮时生效')}
        />
      }
    >
      <Table
        dataSet={headerDs}
        columns={columns}
        autoValidationLocate={false}
        customizedCode="SSTA_STRATEGY_DETAIL.INV_MATCH_RULE"
      />
    </Card>
  );
});
