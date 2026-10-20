import React, { useMemo } from 'react';
import { Popconfirm } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import useQuerySearchBarProps from './useQuerySearchBarProps';
import { skuInfoRenderer } from './renderer';
import { deleteWhiteList } from './api';

export default function UserWhiteList(props) {
  const { dataSet, searchCode, customizedCode } = props;
  const searchBarProps = useQuerySearchBarProps(dataSet);

  const columns = useMemo(() => {
    return [
      {
        name: 'realName',
        width: 140,
        renderer: ({ record, value }) => `${value}(${record.get('loginName')})`,
      },
      { name: 'skuCode', width: 120 },
      { name: 'skuInfo', minWidth: 200, renderer: skuInfoRenderer },
      { name: 'supplierCompanyName', minWidth: 200 },
      {
        name: 'action',
        lock: 'right',
        width: 100,
        tooltip: 'none',
        align: 'left',
        command: ({ record }) => {
          return [
            <Popconfirm
              placement="left"
              title={intl.get('smpc.product.view.message.confirmDelete').d('确认删除？')}
              onConfirm={() => handleDelete(record)}
            >
              <Button funcType="link" color="primary">
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Popconfirm>,
          ];
        },
      },
    ];
  }, []);

  async function handleDelete(record) {
    const params = record.toData();
    const res = getResponse(await deleteWhiteList([params]));
    if (res) {
      notification.success();
      dataSet.query();
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      <SearchBarTable
        searchCode={searchCode}
        dataSet={dataSet}
        columns={columns}
        rowHeight={44}
        customizedCode={customizedCode}
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchBarConfig={searchBarProps}
      />
    </div>
  );
}
