/*
 * @Description: 日期默认值规则
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-27 17:30:14
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useEffect } from 'react';
import { CheckBox, Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import StatusTag from '../../components/StatusTag';
import { stageLineNumsEditor } from '../../utils/renderer';

const DateRule = () => {

  const { viewFlag, dateRuleDs } = useContext<StoreValueType>(Store);

  useEffect(() => {
    dateRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      dateRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [dateRuleDs]);

  const onRecordUpdate = ({ name, value, record }) => {
    // 关闭启用清楚影响因素
    if(name === 'enableFlag'&& Number(value) !== 1) {
      record.set({
        defaultRuleCode: undefined,
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
        name: 'defaultRuleCode',
        width: 200,
        editor: !viewFlag,
        help: intl.get('smdm.payTermsCtrl.view.help.dateDefaultRuleCode').d('控制结算单「期望付款日期」默认值取值逻辑'),
      },
      {
        name: 'stageLineNums',
        width: 150,
        editor: (record) => !viewFlag && stageLineNumsEditor(record),
      },
    ];
  }, [viewFlag]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      title={intl.get('smdm.payTermsCtrl.view.title.dateDefaultValidRule').d('日期默认值规则')}
    >
      <Table
        columns={columns}
        dataSet={dateRuleDs}
      />
    </Card>
  );
};

export default DateRule;