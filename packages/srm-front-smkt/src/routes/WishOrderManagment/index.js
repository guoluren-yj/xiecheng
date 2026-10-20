import React, { useRef, useMemo, useEffect } from 'react';
import { flowRight } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import Image from '@/components/Image';
// import QueryField from '@/components/QueryField';
import c7nModal from '@/utils/c7nModal';
import AccountDetail from './AccountDetail/index';
import SortFilter from '@/components/SortFilter';
import withEmbedModal, { EmbedContent } from '@/components/Embed';
import useSkuDetail from '../SkuInfo/useSkuDetail';
import { wishOrderDs } from './ds';

import './index.less';

const organizationId = getCurrentOrganizationId();

function WishOrder({ Modal }) {
  const queryRef = useRef();
  const viewSkuDetail = useSkuDetail(Modal);

  const ds = useMemo(() => new DataSet(wishOrderDs()), []);
  useEffect(() => {
    ds.setQueryParameter('sort', 'nums,ss.sku_id,ASC');
    ds.query();
  }, []);

  const viewAccountDetail = (record) => {
    c7nModal({
      style: { width: 450 },
      closable: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      drawer: true,
      okCancel: false,
      title: intl.get('smkt.wishOder.view.accountDetail').d('账户详情'),
      children: <AccountDetail record={record} />,
      onOk: () => true,
    });
  };

  // function handleSkuPreview(record) {
  //   props.history.push(`/smkt/wish-order-manage/preview?skuId=${record.get('skuId')}`);
  // }

  const columns = useMemo(() => {
    return [
      {
        name: 'primaryMediaPath',
        width: 120,
        renderer: ({ record, value }) => {
          const primaryThumbnailPath = record.get('primaryThumbnailPath');
          return <Image value={primaryThumbnailPath || value} width={32} height={32} />;
        },
      },
      {
        name: 'skuCode',
        width: 130,
        renderer: ({ value, record }) => <a onClick={() => viewSkuDetail(record)}>{value}</a>,
      },
      {
        name: 'skuName',
        minWidth: 150,
      },
      {
        name: 'catalogName',
        minWidth: 150,
      },
      {
        name: 'proposedPrice',
        width: 120,
        // renderer: ({ text }) => <a>{text}</a>,
      },
      {
        name: 'supplierCompanyName',
        minWidth: 150,
      },
      {
        name: 'nums',
        width: 100,
        renderer: ({ text, record }) => (
          <div className="wish-num" onClick={() => viewAccountDetail(record)}>
            <Icon type="portrait-o" />
            {text}
          </div>
        ),
      },
    ];
  }, []);

  const searchBarProps = {
    cacheState: true,
    searchCode: 'SMKT.WISH_ORDER_MANAGE.SEARCHBAR',
    rowHeight: 38,
    searchBarConfig: {
      fieldProps: {
        supplierId: { lovPara: { tenantId: organizationId } },
        catalogId: { lovPara: { tenantId: organizationId } },
      },
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      // left: {
      //   render: () => (
      //     <div className="wish-order-searchbar">
      //       <QueryField
      //         name="skuCode"
      //         dataSet={ds}
      //         onRef={(ref) => {
      //           queryRef.current = ref;
      //         }}
      //         placeholder={intl.get('smkt.wishOder.view.queryMsg.skuCode').d('请输入商品编码查询')}
      //       />
      //       <QueryField
      //         name="skuName"
      //         dataSet={ds}
      //         onRef={(ref) => {
      //           queryRef.current = ref;
      //         }}
      //         placeholder={intl.get('smkt.wishOder.view.queryMsg.skuName').d('请输入商品名称查询')}
      //       />
      //     </div>
      //   ),
      // },
      right: {
        render: () => (
          <SortFilter
            name="nums"
            otherName="ss.sku_id"
            dataSet={ds}
            text={intl.get('smkt.wishOder.view.wishNumFilter').d('按心愿人次')}
            onRef={(ref) => {
              queryRef.current = ref;
            }}
          />
        ),
      },
    },
  };
  return (
    <>
      <Header title={intl.get('smkt.wishOder.view.title.wishOrderManagment').d('心愿单管理')} />
      <EmbedContent>
        <SearchBarTable
          dataSet={ds}
          columns={columns}
          customizedCode="SMKT.WISH_ORDER_MANAGE_LIST"
          {...searchBarProps}
          style={{ maxHeight: 'calc(100vh - 340px)' }}
        />
      </EmbedContent>
    </>
  );
}

export default flowRight(
  //   withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({ code: ['smkt.wishOder', 'smkt.selection', 'smpc.product'] })
)(withEmbedModal(WishOrder));
