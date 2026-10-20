import React, { useMemo, useState, useEffect } from 'react';
import { useDataSet, Dropdown } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '../components/SearchBarTable';
import { listDS, aggregationMethodList } from './stores/indexDs';
import { fetchLineAmount } from './occupiedService.js';
import Formula from './../Budget/components/OccupiedOrAppliedDetail/Formula';
import styles from './../Budget/components/OccupiedOrAppliedDetail/index.less';

const commonPrompt = 'sbdm.common.model.common';
const OccupiedOrApplied = ({ budgetLineId }) => {
  const [aggregationMethod, setAggregationMethods] = useState('detail');
  const [amountObj, setAmountObj] = useState({});
  const listDs = useDataSet(() => listDS({ budgetLineId }), [budgetLineId]);
  const viewList = useMemo(() => aggregationMethodList(), []);

  const swap = (arr, a, b) => {
    const temp = arr[a];
    // eslint-disable-next-line no-param-reassign
    arr[a] = arr[b];
    // eslint-disable-next-line no-param-reassign
    arr[b] = temp;
  };

  const columns = useMemo(() => {
    const amountHeader = intl.get(`${commonPrompt}.occupyAmount`).d('占用金额');

    const lindColumns = [
      {
        name: 'documentDate',
        width: 150,
      },
      {
        name: 'documentNum',
        width: 180,
      },
      {
        name: 'documentTypeMeaning',
        width: 150,
      },
      {
        header: amountHeader,
        name: 'amount',
        width: 120,
      },
      {
        name: 'incomingIdentityMeaning',
        width: 120,
      },
      {
        name: 'lotNum',
        width: 200,
      },
      {
        name: 'operatorName',
        width: 120,
      },
    ];

    if (aggregationMethod === 'document') {
      swap(lindColumns, 0, 1);
    }

    if (aggregationMethod === 'batch') {
      const index = 4;
      swap(lindColumns, 1, index);
      swap(lindColumns, 0, 1);
    }


    return lindColumns;
  }, [aggregationMethod]);

  const handleSelectView = ({ key }) => {
    setAggregationMethods(key);
    listDs.unSelectAll();
    listDs.clearCachedSelected();
    listDs.setQueryParameter('aggregationMethod', key);
    listDs.query();
  };

  const overlayMenu = useMemo(() => {
    const list = viewList;
    return (
      <Menu
        onClick={handleSelectView}
        className={styles['occupied-or-applied-aggregation-view-menu']}
        defaultSelectedKeys={[aggregationMethod]}
      >
        {list.map((item) => (
          <Menu.Item
            key={item.value}
            className={styles['occupied-or-applied-aggregation-view-menu-item']}
          >
            {item.meaning}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [aggregationMethod]);

  const aggregationView = useMemo(() => {
    return (
      <div className={styles['occupied-or-applied-aggregation-view']}>
        <Dropdown overlay={overlayMenu} trigger={['click']}>
          <span className={styles['occupied-or-applied-aggregation-view-control']}>
            {viewList.find((ele) => ele.value === aggregationMethod)?.meaning}
            <Icon
              type="expand_more"
              className={styles['occupied-or-applied-aggregation-view-expand']}
            />
          </span>
        </Dropdown>
      </div>
    );
  }, [aggregationMethod, overlayMenu]);

  useEffect(() => {
    if (budgetLineId) {
      fetchLineAmount(budgetLineId).then((res) => {
        if (getResponse(res)) {
          setAmountObj(res);
        }
      });
    }
    listDs.setQueryParameter('dataSources', 'occupy');
    listDs.setQueryParameter('aggregationMethod', 'detail');
    listDs.query();
  }, []);

  useEffect(() => {
    setAggregationMethods('detail');
    listDs.unSelectAll();
    listDs.clearCachedSelected();
    listDs.setQueryParameter('aggregationMethod', 'detail');
    listDs.query();

  }, [listDs]);

  return (
    <>
      <div className={styles['occupied-or-applied-modal-content']}>
        <Formula activeKey={null} amountObj={amountObj} name="dataSources" occupiedModalFlag={1} />
        <SearchBarTable
          style={{ maxHeight: '720px' }}
          dataSet={listDs}
          columns={columns}
          mode={aggregationMethod === 'detail' ? '' : 'tree'}
          searchBarConfig={{
            fuzzyQueryCode: 'documentNum',
            fuzzyQueryName: intl.get(`${commonPrompt}.documentNumAndLineNum`).d('单据编码-行号'),
            right: {
              render: () => aggregationView,
            },
          }}
        />
      </div>
    </>
  );
};

export default OccupiedOrApplied;