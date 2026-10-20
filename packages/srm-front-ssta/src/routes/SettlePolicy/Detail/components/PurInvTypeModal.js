/*
 * @Description: 对账规则/开票规则/付款规则-对账维度/开票维度/付款维度 库存组织侧弹框(带分页)
 */
import React, { useEffect, useMemo, useCallback, memo, Fragment, useState } from 'react';
import { CheckBox, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FilterBarTable from '_components/FilterBarTable';

import { purInvTypeDS } from '@/stores/SettleStrategyDS';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

export default memo((props) => {
  const { billDimensionId, editFlag, modal, platModalFlag } = props;

  const [allChecked, setAllChecked] = useState(false); // 校验字段是否全选中

  const purInvTypeDs = useMemo(() => new DataSet(purInvTypeDS(platModalFlag, setAllChecked)), [
    platModalFlag,
    setAllChecked,
  ]);

  useEffect(() => {
    if (billDimensionId) {
      purInvTypeDs.setQueryParameter('billDimensionId', billDimensionId);
      purInvTypeDs.query();
    }
    modal.handleOk(async () => {
      const res = await purInvTypeDs.submit();
      return res;
    });
  }, [billDimensionId, modal, purInvTypeDs]);

  useEffect(() => {
    purInvTypeDs.addEventListener('update', handleUpdate);
    return () => {
      purInvTypeDs.removeEventListener('update', handleUpdate);
    };
  }, [purInvTypeDs, handleUpdate]);

  const handleUpdate = useCallback(
    ({ name }) => {
      if (name === 'validateFlag') {
        setAllChecked(purInvTypeDs?.every((item) => item?.get('validateFlag')));
      }
    },
    [purInvTypeDs]
  );

  const onAllChange = useCallback(
    (value) => {
      purInvTypeDs.forEach((record) => {
        record.set('validateFlag', value ? 1 : 0);
      });
      setAllChecked(value);
    },
    [purInvTypeDs, setAllChecked]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'invOrganizationCode',
      },
      {
        name: 'rcvTrxTypeName',
      },
      {
        name: 'ouName',
      },
      {
        name: 'sourceCode',
      },
      {
        name: 'validateFlag',
        title: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
        header: ({ title }) => (
          <Fragment>
            {editFlag && purInvTypeDs.length ? (
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
  }, [editFlag, purInvTypeDs, allChecked, onAllChange]);

  return (
    <FilterBarTable
      dataSet={purInvTypeDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      customizedCode="SSTA_STRATEGY_DETAIL.PUR_ORGANIZATION_TYPE"
      filterBarConfig={{
        sortFieldName: 'orderField',
      }}
    />
  );
});
