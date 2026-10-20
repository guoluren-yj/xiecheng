import React, { useMemo, useEffect, useState } from 'react';
import { Modal, Button, DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SMPC } from '_utils/config';
import ImageMatain from '../../SkuCreate/SkuInfo/ImageMatain';
import { batchUploadImage } from '../api';

const organizationId = getCurrentOrganizationId();

const getSkuFields = () => [
  { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
  { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
  {
    name: 'thirdSkuCode',
    label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
  },
  { name: 'categoryName', label: intl.get('smpc.product.view.platformCategory').d('平台分类') },
  { name: 'catalogName', label: intl.get('smpc.product.model.catalog').d('目录') },
  { name: 'itemCode', label: intl.get('smpc.product.model.itemCode').d('物料编码') },
  { name: 'itemName', label: intl.get('smpc.product.model.itemName').d('物料名称') },
  {
    name: 'itemCategoryCode',
    label: intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
  },
  {
    name: 'itemCategoryName',
    label: intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
  },
  {
    name: 'supplierCompanyName',
    label: intl.get('smpc.product.view.supplier').d('供应商'),
  },
];

const getSkuSelectDsProps = (skuIds) => ({
  autoQuery: true,
  queryFields: [
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    {
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
    },
    {
      label: intl.get('smpc.product.model.item').d('物料'),
      name: 'itemLov',
      type: 'object',
      ignore: 'always',
      valueField: 'itemId',
      textField: 'itemName',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      label: intl.get('smpc.product.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'object',
      lovCode: 'SMPC.CATALOG_THREE',
      textField: 'catalogName',
      valueField: 'catalogId',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      label: intl.get('smpc.product.view.itemCategory').d('物料品类'),
      name: 'itemCategoryLov',
      type: 'object',
      lovCode: 'SMDM.ITEM_CATEGORY_BY_ITEM_ID',
      textField: 'categoryName',
      valueField: 'categoryCode',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'itemCategoryId',
      type: 'string',
      bind: 'itemCategoryLov.categoryId',
    },
  ],
  fields: getSkuFields(),
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SMPC}/v1/${organizationId}/sku-image-imports/sku-list`,
      method: 'POST',
      data: { skuIds, ...data },
    }),
  },
});

function BatchUpload({ data, isSup, modal, onSuccess }) {
  const [isError, setError] = useState(false);
  const dataSet = useMemo(() => new DataSet({ paging: false, fields: getSkuFields() }), []);
  const imageDataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
        selection: false,
        fields: [
          {
            name: 'mediaType',
            type: 'number',
          },
          {
            name: 'mediaPath',
            type: 'string',
            required: true,
            label: intl.get('smpc.product.model.imageUrl').d('图片链接'),
          },
        ],
      }),
    []
  );

  useEffect(() => {
    data.forEach((f) => {
      dataSet.create(f);
    });
    modal.handleOk(() => handleSubmit());
  }, [data]);

  function multFields(record, fields) {
    return fields.reduce((res, field) => {
      return res && record.get(field) ? `${res}-${record.get(field)}` : res ?? record.get(field);
    }, undefined);
  }

  function handleAdd() {
    const skuIds = dataSet.map((m) => m.get('skuId'));
    const selectSkuDs = new DataSet(getSkuSelectDsProps(skuIds));
    const selectColumns = [
      { name: 'skuCode', width: 120 },
      { name: 'skuName', width: 200 },
      { name: 'thirdSkuCode', width: 130 },
      { name: 'supplierCompanyName', width: 160, show: !isSup },
      {
        name: 'catalogName',
        width: 200,
        renderer: ({ record }) => multFields(record, ['catalogCode', 'catalogName']),
      },
      {
        name: 'itemCode',
        width: 200,
        header: intl.get('smpc.product.model.item').d('物料'),
        renderer: ({ record }) => multFields(record, ['itemCode', 'itemName']),
      },
      {
        name: 'itemCategoryCode',
        width: 200,
        header: intl.get('smpc.product.view.itemCategory').d('物料品类'),
        renderer: ({ record }) => multFields(record, ['itemCategoryCode', 'itemCategoryName']),
      },
    ].filter((f) => f.show !== false);
    Modal.open({
      title: intl.get('smpc.product.view.selectSku').d('选择商品'),
      style: { width: 1090 },
      drawer: true,
      children: <Table dataSet={selectSkuDs} columns={selectColumns} />,
      onOk: () => {
        selectSkuDs.selected.forEach((f) => {
          dataSet.create(f.toData());
        });
      },
    });
  }

  async function handleSubmit() {
    const skuList = dataSet.toData();
    const flag = await imageDataSet.validate();
    if (!flag) return false;
    const skuMediaList = imageDataSet.toData();
    if (skuList.length < 1 || skuMediaList.length < 1) {
      notification.error({
        message: intl.get('smpc.product.view.message.skuImgNotNull').d('商品、图片不能为空'),
      });
      return false;
    }
    const pathIndex = skuMediaList.findIndex((f) => f.mediaType === 2);
    if (pathIndex !== -1) {
      skuMediaList[pathIndex].primaryFlag = 1;
    } else {
      skuMediaList[0].primaryFlag = 1;
    }
    const params = {
      skuDTOS: skuList,
      skuMediaList,
    };
    const res = getResponse(await batchUploadImage(params));
    if (res) {
      const { batchStatus, batchResult, imageUploadSkuDTOList = [] } = res;
      // 0失败 1部分成功 2 全部成功
      const info = { message: batchResult };
      if (batchStatus === 2) {
        onSuccess();
        notification.success(info);
      } else if (batchStatus === 1) {
        onSuccess();
        notification.warning(info);
        setError(true);
        dataSet.loadData(imageUploadSkuDTOList);
        return false;
      } else {
        notification.error(info);
        setError(true);
        dataSet.loadData(imageUploadSkuDTOList);
        dataSet.forEach((r) => {
          Object.assign(r, { status: 'add' });
        });
        return false;
      }
    } else {
      return false;
    }
  }

  const columns = [
    {
      name: 'success',
      width: 80,
      show: isError,
      header: intl.get('smpc.product.view.submitRes').d('提交结果'),
      renderer: ({ value }) => {
        return value
          ? intl.get('hzero.common.status.success').d('成功')
          : value === false
          ? intl.get('hzero.common.status.error').d('失败')
          : null;
      },
    },
    {
      name: 'errorMsg',
      width: 160,
      show: isError,
      header: intl.get('smpc.product.view.errorReason').d('失败原因'),
    },
    { name: 'skuCode', width: 120 },
    { name: 'skuName', width: 200 },
    { name: 'thirdSkuCode', width: 130 },
    { name: 'categoryName', width: 140 },
    { name: 'catalogName', width: 140 },
    { name: 'itemCode', width: 140 },
    { name: 'itemName', width: 140 },
    { name: 'itemCategoryCode', width: 140 },
    { name: 'itemCategoryName', width: 140 },
    { name: 'supplierCompanyName', width: 160, show: !isSup },
  ].filter((f) => f.show !== false);

  const buttons = [
    <Button funcType="flat" color="primary" icon="playlist_add" onClick={handleAdd}>
      {intl.get('smpc.product.model.add').d('新增')}
    </Button>,
    'delete',
  ];

  return (
    <div>
      <Table
        dataSet={dataSet}
        style={{ maxHeight: 450, marginBottom: 16 }}
        columns={columns}
        buttons={buttons}
      />
      <ImageMatain dataSet={imageDataSet} />
    </div>
  );
}

export default function uploadImg({ data = [], isSup, onSuccess = (e) => e }) {
  Modal.open({
    title: intl.get('smpc.product.view.batchUploadImg').d('批量上传图片'),
    style: { width: 1090 },
    drawer: true,
    okText: intl.get('hzero.common.button.submit').d('提交'),
    children: <BatchUpload data={data} isSup={isSup} onSuccess={onSuccess} />,
  });
}
