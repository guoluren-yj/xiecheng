import React, { useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import Image from '@/components/Image';
import TagPro from '@/components/TagPro';
import withEmbedModal, { EmbedContent } from '@/components/Embed';
import useSkuDetail from '../SkuInfo/useSkuDetail';

const organizationId = getCurrentOrganizationId();

const searchCode = 'SMKT.SELECTION_PLATFORM.SEARCH_BAR';

const getDataSetProps = () => ({
  autoQuery: false,
  pageSize: 20,
  fields: [
    { name: 'skuStatus', label: intl.get('hzero.common.status').d('状态') },
    { name: 'primaryPath', label: intl.get('smpc.product.view.skuImage').d('商品图片') },
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    { name: 'catalogName', label: intl.get('smpc.product.view.skuCatalog').d('商品目录') },
    { name: 'proposedPrice', label: intl.get('smpc.product.view.proposedPrice').d('参考价格') },
    { name: 'supplierName', label: intl.get('smpc.product.view.supplier').d('供应商') },
    { name: 'sourceFromMeaning', label: intl.get('smpc.workbench.view.dataFrom').d('数据来源') },
    { name: 'creationDate', label: intl.get('smpc.workbench.model.creationDate').d('创建时间') },
  ],
  transport: {
    read: {
      url: `/smkt/v1/skus/platform-list`,
      method: 'GET',
    },
  },
});

function SkuSelectionPlatform(props) {
  const { dataSet, history, Modal } = props;
  const viewSkuDetail = useSkuDetail(Modal);

  useEffect(() => {
    dataSet.setQueryParameter('customizeUnitCode', searchCode);
  }, [dataSet]);

  function handleSkuPreview(record) {
    history.push(`/smkt/sku-selection-platform/preview?skuId=${record.get('skuId')}`);
  }

  const columns = [
    {
      name: 'skuStatus',
      width: 120,
      tooltip: 'none',
      renderer: ({ value, record }) => {
        return (
          <TagPro color={value === 1 ? 'success' : 'invalid'}>
            {record.get('skuStatusMeaning')}
          </TagPro>
        );
      },
    },
    {
      name: 'primaryPath',
      width: 100,
      renderer: ({ value, record }) => (
        <Image value={record.get('thumbnailPath') || value} width={32} height={32} />
      ),
    },
    {
      name: 'skuCode',
      width: 120,
      renderer: ({ value, record }) => <a onClick={() => viewSkuDetail(record)}>{value}</a>,
    },
    {
      name: 'skuName',
      minWidth: 180,
    },
    {
      name: 'catalogName',
      minWidth: 160,
    },
    {
      name: 'proposedPrice',
      width: 160,
    },
    {
      name: 'supplierName',
      minWidth: 160,
    },
    {
      name: 'sourceFromMeaning',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'action',
      header: intl.get('hzero.common.action').d('操作'),
      width: 100,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => handleSkuPreview(record)}>
            {intl.get('hzero.common.button.preview').d('预览')}
          </a>
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title={intl.get('smkt.selection.view.title.selectionSku').d('甄选商品')} />
      <EmbedContent>
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={columns}
          rowHeight={38}
          searchCode={searchCode}
          customizedCode="SMKT.SELECTION_PLATFORM.LIST"
          style={{ maxHeight: 'calc(100vh - 360px)' }}
          searchBarConfig={{
            fieldProps: {
              catalogId: { lovPara: { tenantId: organizationId } },
              supplierId: { lovPara: { tenantId: organizationId } },
            },
          }}
        />
      </EmbedContent>
    </>
  );
}

export default formatterCollections({ code: ['smkt.selection', 'smpc.product', 'smpc.workbench'] })(
  withProps(() => ({ dataSet: new DataSet(getDataSetProps()) }), {
    cacheState: true,
    keepOriginDataSet: true,
  })(withEmbedModal(SkuSelectionPlatform))
);
