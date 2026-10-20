import React from 'react';
import { Popconfirm } from 'choerodon-ui';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import Image from '@/components/Image';
import OverflowTip from '@/components/OverflowTip';
import SearchBarList from '@/components/SearchBarList';
import useQuerySearchBarProps from './useQuerySearchBarProps';
import BlackListEmpty from './BlackListEmpty';
import { deleteBlackList } from './api';
import styles from './style.less';

const SkuInfo = ({ data }) => {
  const renderItem = ({ label, value, name }) => {
    return (
      <OverflowTip className="sku-info-item">
        <div className="sku-info-item-label">{label}</div>
        <OverflowTip className="sku-info-item-value">{value || data?.[name] || '-'}</OverflowTip>
      </OverflowTip>
    );
  };

  return (
    <div className="balcklist-sku-info">
      <Image value={data?.mediaPath} width={84} height={84} />
      <div className="sku-info-list">
        {[
          { label: intl.get('smpc.product.view.skuCode').d('商品编码'), name: 'skuCode' },
          { label: intl.get('smpc.product.view.skuName').d('商品名称'), name: 'skuName' },
          {
            label: intl.get('smpc.product.view.platformCategory').d('平台分类'),
            name: 'categoryPath',
          },
          {
            label: intl.get('smpc.product.view.supplier').d('供应商'),
            name: 'supplierCompanyName',
          },
        ].map((m) => renderItem(m))}
      </div>
    </div>
  );
};

export default function SameSkuBlackList(props) {
  const { dataSet, searchCode } = props;
  const searchBarProps = useQuerySearchBarProps(dataSet);

  function itemRenderer({ record }) {
    const { fstSkuDTO, secSkuDTO } = record.get(['fstSkuDTO', 'secSkuDTO']);
    return (
      <div className={styles['black-list-wrapper']}>
        <div className="balck-list-item balck-list-item-compare">
          <SkuInfo data={fstSkuDTO} />
          <div className="icon-compare-box">
            <Icon type="sync_alt" />
          </div>
        </div>
        <div className="balck-list-item balck-list-item-delete">
          <SkuInfo data={secSkuDTO} />
          <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
            <Popconfirm
              placement="left"
              title={intl.get('smpc.product.view.message.confirmDelete').d('确认删除？')}
              onConfirm={() => handleDelete(record)}
            >
              <div className="icon-delete-box">
                <Icon type="delete" />
              </div>
            </Popconfirm>
          </Tooltip>
        </div>
      </div>
    );
  }

  async function handleDelete(record) {
    try {
      dataSet.status = 'loading';
      const params = record.toData();
      const res = getResponse(await deleteBlackList([params]));
      if (res) {
        notification.success();
        dataSet.query();
      }
    } finally {
      dataSet.status = 'ready';
    }
  }

  function emptyRenderer() {
    return <BlackListEmpty />;
  }

  return (
    <SearchBarList
      searchCode={searchCode}
      dataSet={dataSet}
      itemRenderer={itemRenderer}
      emptyRenderer={emptyRenderer}
      rowHeight={124}
      wrapperStyle={{ height: 'calc(100vh - 252px)' }}
      searchBarConfig={searchBarProps}
    />
  );
}
