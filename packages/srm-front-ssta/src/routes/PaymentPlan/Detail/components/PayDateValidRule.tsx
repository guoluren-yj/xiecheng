/*
 * @Description: 阶段付款日期校验规则
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-27 17:30:14
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useEffect, Fragment } from 'react';
import { CheckBox, Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import StatusTag from '../../../Components/StatusTag';
import { DetailCustomizeCode } from '../../utils/type';
import { stageLineNumsEditor } from '../../utils/renderer';

const PayDateValidRule = () => {

  const { editFlag, changeFlag, payDateValidRuleDs, customizeTable } = useContext<StoreValueType>(Store);

  const editorFlag = editFlag || changeFlag;

  useEffect(() => {
    payDateValidRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      payDateValidRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [payDateValidRuleDs]);

  const onRecordUpdate = ({ name, value, record }) => {
    // 关闭启用清除影响因素
    if (name === 'enableFlag' && Number(value) !== 1) {
      record.set({
        validLevel: undefined,
        validContext: undefined,
        notCalcPreExpPayDateProcessMode: undefined,
        validPosition: undefined,
        stageLineNums: undefined,
      });
    }
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'enableFlag',
        width: 100,
        editor: editorFlag && <CheckBox>{intl.get('hzero.common.status.enable').d('启用')}</CheckBox>,
        renderer: ({ value }) => {
          return Number(value) === 1 ? (
            <StatusTag
              color='green'
              text={intl.get('hzero.common.status.alreadyEnabled').d('已启用')}
            />
          ) : (
            <StatusTag
              color='red'
              text={intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
            />
          );
        },
      },
      {
        name: 'settleType',
        width: 120,
      },
      {
        name: 'validLevel',
        width: 130,
        editor: editorFlag,
        help: intl.get('ssta.paymentPlan.view.help.payDateValidRuleLevel').d('警告：在预付款、付款页面报错形式为中心弹窗提示，用户可选是否继续提交单据；禁止，在预付款、付款页面报错形式为右下角报错弹窗，禁止继续提交单据'),
      },
      {
        name: 'validContext',
        width: 180,
        editor: editorFlag,
        help: intl.get('ssta.paymentPlan.view.help.payDateValidRuleContext').d('对于付款申请，结算策略启用「是否预计期望付款日期」后，系统将在发票确认、付款提交等多个时点更新基于发票申请创建付款申请、基于结算事务创建付款申请页面的「预计期望付款日期」字段，若对应付款计划阶段配置启用「校验内容=早于预计付款日期（不包含等于）」，则当系统当前日期早于（不含等于）预计期望付款日期时报错'),
      },
      {
        name: 'notCalcPreExpPayDateProcessMode',
        width: 220,
        editor: editorFlag,
        help: intl.get('ssta.paymentPlan.view.help.payDateValidRuleNotCalcPreExpPayDateProcessMode').d('预计付款日期可能由于基准日期为空，或系统程序错误导致无法计算，针对该场景可选择报错提示禁止操作，或直接跳过阶段付款日期校验规则允许用户正常创建提交单据'),
      },
      {
        name: 'validPosition',
        width: 130,
        editor: editorFlag,
        help: intl.get('ssta.paymentPlan.view.help.payDateValidRulePosition').d('创建对应引用订单/协议/协议阶段创建预付款申请时点、引用发票/结算事务创建付款申请时点，包含行新增，提交对应预付款申请、付款申请提交'),
      },
      {
        name: 'stageLineNums',
        width: 150,
        editor: (record) => editorFlag && stageLineNumsEditor(record),
      },
    ];
  }, [editorFlag]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailCustomizeCode.StagePayDateValidCode },
        <Table
          columns={columns}
          dataSet={payDateValidRuleDs}
        />
      )}
    </Fragment>
  );
};

export default PayDateValidRule;