/*
 * @Description: 对账规则/开票规则/付款规则-对账维度/开票维度/付款维度 物料编码侧弹框(带分页)
 */
import React, { useEffect, useMemo, useCallback, memo, Fragment, useState } from 'react';
import { CheckBox, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FilterBarTable from '_components/FilterBarTable';

import { itemTypeDS } from '@/stores/SettleStrategyDS';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

export default memo((props) => {
  const { billDimensionId, editFlag, modal, platModalFlag } = props;

  const [allChecked, setAllChecked] = useState(false); // 校验字段是否全选中

  const itemTypeDs = useMemo(
    () => new DataSet(itemTypeDS(platModalFlag, setAllChecked)),
    [platModalFlag, setAllChecked]
  );

  useEffect(() => {
    if (billDimensionId) {
      itemTypeDs.setQueryParameter('billDimensionId', billDimensionId);
      itemTypeDs.query();
    }
    modal.handleOk(async () => {
      const res = await itemTypeDs.submit();
      return res;
    });
  }, [billDimensionId, modal, itemTypeDs]);

  useEffect(() => {
    itemTypeDs.addEventListener('update', handleUpdate);
    return () => {
      itemTypeDs.removeEventListener('update', handleUpdate);
    };
  }, [itemTypeDs, handleUpdate]);

  const handleUpdate = useCallback(
    ({ name }) => {
      if (name === 'validateFlag') {
        setAllChecked(itemTypeDs?.every((item) => item?.get('validateFlag')));
      }
    },
    [itemTypeDs]
  );

  const onAllChange = useCallback(
    (value) => {
      itemTypeDs.forEach((record) => {
        record.set('validateFlag', value ? 1 : 0);
      });
      setAllChecked(value);
    },
    [itemTypeDs, setAllChecked]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
      },
      {
        name: 'externalSystemCode',
      },
      {
        name: 'validateFlag',
        title: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
        header: ({ title }) => (
          <Fragment>
            {editFlag && itemTypeDs.length ? (
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
  }, [editFlag, itemTypeDs, allChecked, onAllChange]);

  return (
    <FilterBarTable
      dataSet={itemTypeDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      customizedCode="SSTA_STRATEGY_DETAIL.ITEM_TYPE"
      filterBarConfig={{
        sortFieldName: 'orderField',
      }}
    />
  );
});
