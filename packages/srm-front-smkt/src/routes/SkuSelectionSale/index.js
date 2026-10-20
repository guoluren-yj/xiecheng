import React, { useEffect } from 'react';
import { DataSet, Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import Image from '@/components/Image';
import TagPro from '@/components/TagPro';
import MobxButton from '@/components/MobxButton';
import DropdownPro from '@/components/DropdownPro';
import withEmbedModal, { EmbedContent } from '@/components/Embed';
import SkuInfo from '../SkuInfo';
import useSkuDetail from '../SkuInfo/useSkuDetail';
import { batchSkuShelf, batchSkuUnShelf } from './api';

const organizationId = getCurrentOrganizationId();

const searchCode = 'SMKT.SELECTION_SALE.SEARCH_BAR';

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
      url: `/smkt/v1/${organizationId}/skus/sale-list`,
      method: 'GET',
    },
  },
});

function SkuSelectionSale(props) {
  const { dataSet, history, Modal } = props;
  const viewSkuDetail = useSkuDetail(Modal);

  useEffect(() => {
    dataSet.setQueryParameter('customizeUnitCode', searchCode);
  }, [dataSet]);

  function handleSkuPreview(record) {
    history.push(`/smkt/sku-selection-sale/preview?skuId=${record.get('skuId')}`);
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
      width: 120,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() =>
              SkuInfo.edit({ record, onSaveSuccess: () => dataSet.query(dataSet.currentPage) })
            }
            disabled={record.get('sourceFrom') === 'EC'}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => handleSkuPreview(record)}>
            {intl.get('hzero.common.button.preview').d('预览')}
          </a>
        </span>
      ),
    },
  ];

  async function handleChangeSkuStatus({ api, loadingState, filterSkuStatus }) {
    dataSet.status = 'submitted';
    dataSet.setState(loadingState, true);
    const data = dataSet.selected
      .filter((f) => f.get('skuStatus') === filterSkuStatus)
      .map((m) => m.toData());
    const res = getResponse(await api(data));
    dataSet.status = 'ready';
    dataSet.setState(loadingState, false);
    if (res) {
      notification.success();
      dataSet.query(dataSet.currentPage);
    }
  }

  const shelfBtns = [
    {
      btnComp: MobxButton,
      btnText: intl.get('smpc.workbench.view.batchOnShelf').d('批量上架'),
      btnProps: {
        dataSet,
        loadingState: 'shelf',
        dynamicDisabled: (ds) => {
          const checkValid = ds.selected.some((s) => s.get('skuStatus') === 0);
          return !checkValid;
        },
        onClick: () =>
          handleChangeSkuStatus({ api: batchSkuShelf, filterSkuStatus: 0, loadingState: 'shelf' }),
      },
    },
    {
      btnComp: MobxButton,
      btnText: intl.get('smpc.workbench.view.batchUnShelf').d('批量下架'),
      btnProps: {
        dataSet,
        loadingState: 'unShelf',
        dynamicDisabled: (ds) => {
          const checkValid = ds.selected.some((s) => s.get('skuStatus') === 1);
          return !checkValid;
        },
        onClick: () =>
          handleChangeSkuStatus({
            api: batchSkuUnShelf,
            filterSkuStatus: 1,
            loadingState: 'unShelf',
          }),
      },
    },
  ];

  return (
    <>
      <Header title={intl.get('smkt.selection.view.title.selectionSku').d('甄选商品')}>
        <Button
          icon="add"
          color="primary"
          onClick={() => SkuInfo.create({ onSaveSuccess: () => dataSet.query() })}
        >
          {intl.get('smpc.workbench.view.createSku').d('新建商品')}
        </Button>
        <DropdownPro buttons={shelfBtns} width={130}>
          <Button icon="baseline-file_copy" funcType="flat">
            {intl.get('smkt.selection.view.button.batchOnOffShelf').d('批量上下架')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        </DropdownPro>
      </Header>
      <EmbedContent>
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={columns}
          rowHeight={38}
          searchCode={searchCode}
          customizedCode="SMKT.SELECTION_SALE.LIST"
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
  })(withEmbedModal(SkuSelectionSale))
);
