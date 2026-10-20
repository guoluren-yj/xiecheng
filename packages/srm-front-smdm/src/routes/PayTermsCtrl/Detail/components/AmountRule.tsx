/*
 * @Description: 金额默认值规则与校验规则
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-27 17:30:14
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useEffect, Fragment } from 'react';
import { Table, CheckBox } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import StatusTag from '../../components/StatusTag';
import { DetailCustomizeCode } from '../../utils/type';
import { stageLineNumsEditor } from '../../utils/renderer';

const AmountRule = () => {

  const { viewFlag, amountRuleDs, customizeTable } = useContext<StoreValueType>(Store);

  useEffect(() => {
    amountRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      amountRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [amountRuleDs]);

  const onRecordUpdate = ({ name, value, record }) => {
    // 关闭启用清楚影响因素
    if(name === 'enableFlag' && Number(value) !== 1) {
      record.set({
        // defaultRuleCode: undefined,
        checkLevel: undefined,
        checkPosition: undefined,
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
      // {
      //   name: 'defaultRuleCode',
      //   width: 200,
      //   editor: !viewFlag,
      //   help: intl.get('smdm.payTermsCtrl.view.help.amountDefaultRuleCode').d('启用后，可在付款/预付款申请创建时，根据阶段的金额计算方式带出默认比例/金额，默认可修改，可通过付款/预付款申请页面个性化配置为不可修改'),
      // },
      {
        name: 'checkLevel',
        width: 180,
        editor: !viewFlag,
      },
      {
        name: 'checkPosition',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'stageLineNums',
        width: 150,
        editor: (record) => !viewFlag && stageLineNumsEditor(record),
      },
    ];
  }, [viewFlag]);

  return (
    <Fragment>
      {customizeTable(
        {code: DetailCustomizeCode.StageAmountCode },
        <Table
          columns={columns}
          dataSet={amountRuleDs}
        />
      )}
    </Fragment>
  );
};

export default AmountRule;