/*
 * @Description: 金额默认值规则与校验规则
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

const AmountRule = () => {

  const {
    editFlag,
    changeFlag,
    amountRuleDs,
    customizeTable,
  } = useContext<StoreValueType>(Store);

  const editorFlag = editFlag || changeFlag;

  useEffect(() => {
    amountRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      amountRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [amountRuleDs]);

  const onRecordUpdate = ({ name, value, record }) => {
    // 关闭启用清楚影响因素
    if (name === 'enableFlag' && Number(value) !== 1) {
      record.set({
        defaultRuleCode: undefined,
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
        name: 'checkLevel',
        width: 180,
        editor: editorFlag,
      },
      {
        name: 'checkPosition',
        width: 150,
        editor: editorFlag,
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
        { code: DetailCustomizeCode.StageAmountCode, readOnly: !editorFlag },
        <Table
          columns={columns}
          dataSet={amountRuleDs}
        />
      )}
    </Fragment>
  );
};

export default AmountRule;