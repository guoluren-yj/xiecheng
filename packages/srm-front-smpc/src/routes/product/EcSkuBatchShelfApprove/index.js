import React, { useMemo, useEffect } from 'react';
import { flowRight } from 'lodash';
import intl from 'utils/intl';
import qs from 'qs';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import Image from '@/components/Image';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import FormPro from '@/components/FormPro';
import imgDefault from '@/assets/sku_default.svg';
import operateRenderer from '@/routes/product/SkuWorkbench/records/operateRenderer';
import { openRecordTabs } from '@/routes/product/SkuWorkbench/drawers';

import { priceFieldRender } from '../SkuWorkbench/tableColumns';
import { baseDs, skuDs } from './ds';
import styles from './index.less';

const { Panel } = Collapse;

function EcSkuBatchShelfApprove(props) {
  const { onFormLoaded, customizeForm, customizeTable } = props;
  const { batchId } = qs.parse(props.history.location.search.substr(1));

  const baseDS = useMemo(() => new DataSet(baseDs({ batchId })), []);
  const skuDS = useMemo(() => new DataSet(skuDs({ batchId })), []);

  useEffect(() => {
    baseDS.query().then(() => {
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    });
  }, [baseDS]);

  const baseFields = [{ name: 'batchNum' }, { name: 'createdByName' }, { name: 'creationDate' }];

  const getImagePath = (record) => {
    const skuImageList = record.get('skuImageList');
    const { mediaPath } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};
    return mediaPath || imgDefault;
  };

  const operateRecord = (record) => {
    openRecordTabs({
      rowRecord: record,
      leftOperateArg: {
        url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
        queryParams: {
          skuId: record.get('skuId'),
        },
        operateRenderer: (param, param1) => operateRenderer(param, param1),
        partLoad: true,
      },
      isHasFlow: false,
    });
  };

  // 预览
  function handlePreview(record) {
    const { sourceFrom, skuId } = record.toData() || {};
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          productId: skuId,
          sourceFrom,
        })
      ),
    });
  }

  const columns = useMemo(
    () => [
      {
        name: 'imagePath',
        renderer: ({ record }) => {
          const imagePath = getImagePath(record);
          return <Image value={imagePath} width={32} height={32} decoding="async" />;
        },
      },
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'categoryNamePath' },
      { name: 'catalogName' },
      { name: 'taxPrice', renderer: (params) => priceFieldRender(params) },
      { name: 'tax' },
      { name: 'currencyName' },
      { name: 'supplierCompanyName' },
      {
        name: 'options',
        width: 160,
        align: 'left',
        command: ({ record }) => [
          <Button funcType="link" onClick={() => operateRecord(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>,
          <Button funcType="link" onClick={() => handlePreview(record)}>
            {intl.get('hzero.common.button.preview').d('预览')}
          </Button>,
        ],
      },
    ],
    []
  );

  return (
    <>
      <Collapse
        bordered={false}
        expandIconPosition="text-right"
        defaultActiveKey={['baseInfo', 'skuInfo']}
        className={styles['ec-sku-batch-approve-collapse']}
      >
        <Panel
          id="BASE_INFO"
          key="baseInfo"
          header={
            <span className="content-box-title">
              {intl.get('smpc.product.view.baseInfo').d('基本信息')}
            </span>
          }
        >
          <FormPro
            columns={3}
            readOnly
            dataSet={baseDS}
            fields={baseFields}
            customizeCode="SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.BASIC_INFO"
            customizeForm={customizeForm}
          />
        </Panel>
        <Panel
          id="SKU_INFO"
          key="skuInfo"
          header={
            <span className="content-box-title">
              {intl.get('smpc.product.view.skuInfo').d('商品信息')}
            </span>
          }
        >
          {customizeTable(
            {
              code: 'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.LIST_EC_ALL',
            },
            <SearchBarTable
              dataSet={skuDS}
              columns={columns}
              searchCode="SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.SEARCH_BAR"
              customizedCode="SMPC.WORKFLOW.EC_BATCH_APPROVE.SKU_INFO"
              // style={{ maxHeight: 531 }}
              searchBarConfig={{
                closeFilterSelector: true,
                defaultExpand: true,
                expandable: false,
              }}
            />
          )}
        </Panel>
      </Collapse>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['smpc.product', 'smpc.import', 'sagm.common'],
  }),
  withCustomize({
    unitCode: [
      'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.BASIC_INFO',
      'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.SEARCH_BAR',
      'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.LIST_EC_ALL',
    ],
  })
)(EcSkuBatchShelfApprove);
