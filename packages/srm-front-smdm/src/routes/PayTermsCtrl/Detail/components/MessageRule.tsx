/*
 * @Description: 消息提醒规则
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-27 17:26:46
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useEffect, Fragment } from 'react';
import { Table, Select, CheckBox } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import StatusTag from '../../components/StatusTag';
import { DetailCustomizeCode } from '../../utils/type';
import { getNumberSelectContent, stageLineNumsEditor } from '../../utils/renderer';

const MessageRule = () => {

  const { viewFlag, messageRuleDs, customizeTable } = useContext<StoreValueType>(Store);

  useEffect(() => {
    messageRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      messageRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [messageRuleDs]);

  const onRecordUpdate = ({ name, value, record }) => {
    // 关闭启用清楚影响因素
    if (name === 'enableFlag' && Number(value) !== 1) {
      record.set({
        messageCode: undefined,
        messageObject: undefined,
        messagePoint: undefined,
        frequency: undefined,
        stageLineNums: undefined,
      });
    }
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'enableFlag',
        width: 100,
        editor: !viewFlag && <CheckBox>{intl.get('hzero.common.status.enable').d('启用')}</CheckBox>,
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
        name: 'messageCode',
        width: 180,
        editor: !viewFlag,
      },
      {
        name: 'messageObject',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'messagePoint',
        width: 150,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={(popupProps) => getNumberSelectContent({ min: 0, max: 23, widthLength: 6, ...popupProps })} />,
      },
      {
        name: 'frequency',
        width: 150,
        editor: !viewFlag,
        align: ColumnAlign.right,
        help: intl.get('smdm.payTermsCtrl.view.help.msgRemindFrequency').d('请维护整数，提醒频率单位为「天」，多次提醒用英文逗号分割（,），如维护-5，-1，0，2，4则表示在付款计划日期前5天、1天、当前、后2天、4天发送消息提醒'),
      },
      {
        name: 'stageLineNums',
        width: 150,
        editor: (record) => !viewFlag && stageLineNumsEditor(record),
        help: intl.get('smdm.payTermsCtrl.view.help.msgRemindStageLineNums').d('系统将在配置的「消息发送时间」发送消息提醒'),
      },
    ];
  }, [viewFlag]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailCustomizeCode.StageMessageCode },
        <Table
          columns={columns}
          dataSet={messageRuleDs}
        />
      )}
    </Fragment>
  );
};

export default MessageRule;