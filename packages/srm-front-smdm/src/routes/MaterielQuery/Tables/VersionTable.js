import React, { useMemo, useEffect } from 'react';
import { Table } from 'hzero-ui';
import { Link } from 'dva/router';
import { dateTimeRender } from 'utils/renderer'; // 日期时间格式化

import intl from 'utils/intl';

export default ({
  dataSource = {},
  handleFetchList = (e) => e,
  loading = false,
  onCancel = (e) => e,
}) => {
  useEffect(() => {
    handleFetchList();
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 120,
        dataIndex: 'reqStatusMeaning',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.version`).d('版本'),
        width: 150,
        dataIndex: 'versionNumber',
        render: (val, record) => (
          <Link
            onClick={onCancel}
            to={`/smdm/materiel-application/detail/${record.itemReqHeaderId}`}
          >
            {val}
          </Link>
        ),
      },
      {
        title: intl.get('smdm.materiel.model.materiel.lastUpdatedName').d('更新人'),
        dataIndex: 'lastUpdatedName',
        width: 150,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lastUpdateDate`).d('更新时间'),
        dataIndex: 'lastUpdateDate',
        render: (val) => dateTimeRender(val),
      },
    ];
  }, []);
  return (
    <Table
      dataSource={dataSource}
      bordered
      // scroll={{ x: 1500 }}
      pagination={false}
      loading={loading}
      columns={columns}
    />
  );
};
