import React, { useMemo, useRef, useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { observer, Observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import QueryField from '@/routes/sstk/components/QueryField';
import { openItemRageModal } from '../drawer';

export default observer(function ItemRange(props) {
  const { readOnly, strategyId, itemRangeDs } = props;
  const queryRef = useRef();

  useEffect(() => {
    itemRangeDs.selection = readOnly ? false : 'multiple';
  }, [readOnly]);

  const handleDelete = async () => {
    const selectData = itemRangeDs.selected;
    if (selectData.length > 0) {
      itemRangeDs.delete(selectData, {
        title: (
          <span>
            {intl.get('hzero.common.message.confirm.title').d('提示')}
          </span>
        ),
        children: (
          <span>
            {intl.get('sagm.common.modal.confirm.content').d('是否确定删除?')}
          </span>
        ),
      });
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'itemCode',
        // width: 200,
      },
      {
        name: 'itemName',
        // width: 200,
      },
    ];
  }, [readOnly]);
  const buttons = useMemo(() => {
    if (readOnly) return [];
    return [
      <Button
        icon="playlist_add"
        funcType="flat"
        onClick={() => openItemRageModal(strategyId, () => {
          itemRangeDs.query(itemRangeDs.currentPage);
        })}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Observer>
        {
          () => (
            <Button
              funcType="flat"
              icon="delete_sweep"
              disabled={itemRangeDs.selected.length === 0}
              onClick={handleDelete}
            >
              {intl.get('sstk.common.button.batchDelete').d('批量删除')}
            </Button>
          )
        }
      </Observer>,
    ];
  }, [readOnly]);
  return (
    <div>
      <SearchBarTable
        style={{ width: '75%' }}
        dataSet={itemRangeDs}
        columns={columns}
        searchCode='SSTK.STOCK_STRATEGY_CONFIG.ITEM.SEARCHBAR'
        customizedCode='SSTK.STOCK_STRATEGY_CONFIG.DETAIL.ITEM_TABLE'
        cacheState
        buttons={buttons}
        searchBarConfig={{
          autoQuery: false,
          closeFilterSelector: true,
          defaultExpand: true,
          onClear: () => {
            if (queryRef.current) queryRef.current.handleClear();
          },
          onReset: () => {
            if (queryRef.current) queryRef.current.handleClear();
          },
          left: {
            render: () => (
              <QueryField
                name="itemNameCode"
                dataSet={[itemRangeDs]}
                onRef={ref => {
                  queryRef.current = ref;
                }}
                placeholder={intl
                  .get('sstk.stockConfig.view.query.itemNameCode')
                  .d('请输入物料编码、名称查询')}
              />
            ),
          },
        }}
      />
    </div>

  );
});