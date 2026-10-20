/*
 * @Description: 结算策略详情-采购事务类型弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useMemo, useCallback, memo, Fragment, useState } from 'react';
import { CheckBox, DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { purOrderTypeDS } from '@/stores/SettleStrategyDS';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

/**
 * @description: 采购事务类型弹框
 * @param {Obejct} props
 * @return {ReactNode}
 */
export default memo((props) => {
  const { billDimensionId, editFlag, modal, platModalFlag, dimension } = props;

  const [allChecked, setAllChecked] = useState(false); // 校验字段是否全选中

  const purOrderTypeDs = useMemo(() => new DataSet(purOrderTypeDS(platModalFlag, dimension)), [
    platModalFlag,
    dimension,
  ]);

  useEffect(() => {
    if (billDimensionId) {
      purOrderTypeDs.setQueryParameter('billDimensionId', billDimensionId);
      purOrderTypeDs.query().then((res) => {
        setAllChecked(res.every((item) => item.validateFlag));
        // 给每一行的billDimensionId赋值
        if (res) {
          purOrderTypeDs.forEach((record) => {
            record.init({
              billDimensionId,
            });
          });
        }
      });
    }
    modal.handleOk(async () => {
      const res = await purOrderTypeDs.submit();
      return res;
    });
  }, [billDimensionId, modal, purOrderTypeDs, setAllChecked]);

  const onAllChange = useCallback(
    (value) => {
      purOrderTypeDs.forEach((record) => {
        record.set('validateFlag', value ? 1 : 0);
      });
      setAllChecked(value);
    },
    [purOrderTypeDs, setAllChecked]
  );

  const columns = useMemo(() => {
    const orderFlag = ['orderType', 'RETURN_ORDER_TYPE'].includes(dimension);
    return [
      {
        name: 'rcvTrxTypeCode',
        title: orderFlag
          ? intl.get(`${commonPrompt}.rcvOrderTypeCode`).d('租户订单类型编码')
          : intl.get(`${commonPrompt}.rcvTrxTypeCode`).d('租户事务类型编码'),
      },
      {
        name: 'rcvTrxTypeName',
        title: orderFlag
          ? intl.get(`${commonPrompt}.rcvOrderTypeName`).d('租户订单类型名称')
          : intl.get(`${commonPrompt}.rcvTrxTypeName`).d('租户事务类型名称'),
      },
      {
        name: 'validateFlag',
        title: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
        header: ({ title }) => (
          <Fragment>
            {editFlag && purOrderTypeDs.length ? (
              <CheckBox onChange={onAllChange} checked={allChecked}>
                {title}
              </CheckBox>
            ) : (
              title
            )}
          </Fragment>
        ),
        editor: editFlag,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
  }, [editFlag, purOrderTypeDs, allChecked, dimension, onAllChange]);

  return (
    <Table
      columns={columns}
      dataSet={purOrderTypeDs}
      style={{ maxHeight: 'calc(100vh - 220px)' }}
      customizedCode="SSTA_STRATEGY_DETAIL.PUR_ORDER_TYPE"
    />
  );
});
