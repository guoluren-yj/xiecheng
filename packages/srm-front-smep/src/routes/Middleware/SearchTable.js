import React, { useMemo, useRef, useEffect } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { DataSet, Button } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import SearchBarTable from '_components/SearchBarTable';
import { fetchDeletePolling } from '@/services/middware';
import { LovQueryField } from '@/components/SelectQueryField';
import styles from './index.less';

export default function SearchTable(props) {
  const {
    customizeUnitCode,
    dataSet,
    tabKey,
    searchBarCode,
    ecCode,
    handleCreate = (e) => e,
  } = props;
  const filterRef = useRef();
  const filterSearchDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'pullType',
            type: 'object',
            label: intl.get('smep.middlewarePolling.model.pullType').d('消息类型'),
            lovCode: 'SMEP.EC_MESSAGE_TYPE',
            textField: 'pullTypeMeaning',
            valueField: 'pullType',
            lovPara: {
              ecCode,
            },
          },
        ],
      }),
    []
  );

  useEffect(() => {
    const type = dataSet.getQueryParameter('ecCode');
    if (dataSet && dataSet.getState('queryStatus') === 'ready' && tabKey.includes(type)) {
      query();
    }
  }, [tabKey]);

  function query() {
    dataSet.query(dataSet.currentPage);
  }

  const columns = useMemo(() => {
    return [
      {
        name: 'pullTypeMeaning',
        minWidth: 250,
      },
      {
        name: 'messageEnum',
        width: 180,
      },
      {
        name: 'pullCoreMeaning',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
        show: tabKey.includes('tenant'),
      },
      {
        name: 'lastUpdateDate',
        width: 200,
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => (
          <span className="action-link">
            <Button funcType="link" color="primary" onClick={() => handleCreate(record.toData())}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Popconfirm
              title={intl.get('smep.middlewarePolling.view.confirm.delete').d('确认删除吗？')}
              onConfirm={() => handleDelete(record.toJSONData())}
            >
              <Button funcType="link" color="primary">
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ].filter((f) => f.show !== false);
  }, []);

  async function handleDelete(data) {
    const res = await fetchDeletePolling({
      ...data,
      type: tabKey.includes('tenant') ? 'TENANT' : '',
    });
    if (getResponse(res)) {
      query();
      notification.success();
    }
  }

  const searchBarProps = {
    searchBarConfig: {
      left: {
        render: () => (
          <LovQueryField
            name="pullType"
            dataSet={filterSearchDs}
            tableDs={dataSet}
            // eslint-disable-next-line no-return-assign
            onRef={(ref) => (filterRef.current = ref)}
            className={styles['custom-filter-search']}
            placeholder={intl
              .get('smep.middlewarePolling.view.placeholder.pullTypeMsg')
              .d('请输入消息类型查询')}
          />
        ),
      },
      onReset: () => {
        if (filterRef.current) filterRef.current.handleClear();
      },
      onClear: () => {
        if (filterRef.current) filterRef.current.handleClear();
      },
      defaultExpand: false,
      closeFilterSelector: true,
      expandable: false,
    },
    cacheState: true,
    searchCode: searchBarCode,
  };
  return (
    <SearchBarTable
      customizedCode={customizeUnitCode}
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
      {...searchBarProps}
    />
  );
}
