import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Icon, List } from 'choerodon-ui';

import intl from 'utils/intl';

import SortFilter from '@/components/SortFilter';
import Image from '@/components/Image';
import { accountDetailDs } from '../ds';

import style from './index.less';

export default function AccountDetail({ record: r }) {
  const { nums, skuId } = r.get(['nums', 'skuId']);
  const ds = useMemo(() => new DataSet(accountDetailDs()), []);

  useEffect(() => {
    ds.setQueryParameter('skuId', skuId);
    ds.setQueryParameter('sort', 'swo.creationDate,ASC');
    ds.query();
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'list',
        // width: 120,
        renderer: ({ record }) => {
          const { imageUrl, realName, creationDate } = record.get([
            'imageUrl',
            'realName',
            'creationDate',
          ]);
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Image value={imageUrl} width={40} height={40} />}
                title={<p>{realName}</p>}
                description={creationDate}
              />
            </List.Item>
          );
        },
      },
    ];
  }, []);
  return (
    <Table
      header={
        <div className={style['table-header']}>
          <span className={style['header-left']}>
            <Icon type="portrait-o" />
            {intl.get('smkt.wishOder.view.childAccount', { value: nums }).d(`子账户（${nums}）`)}
          </span>
          <SortFilter
            name="creationDate"
            filterSuffix="swo"
            style={{ fontSize: 12, fontWeight: 400, display: 'flex' }}
            dataSet={ds}
            text={intl.get('smkt.wishOder.view.createTimeFilter').d('按加入时间')}
          />
        </div>
      }
      dataSet={ds}
      columns={columns}
      showHeader={false}
      pagination={{ showQuickJumper: false }}
      className={style['wish-column-cell']}
      style={{ maxHeight: 'calc(100vh - 240px)' }}
    />
  );
}
