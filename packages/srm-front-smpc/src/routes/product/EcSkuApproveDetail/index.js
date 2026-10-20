import React, { useEffect, useMemo } from 'react';
import { Tag, Collapse } from 'choerodon-ui';
import { Button, Form, DataSet, Output, Table, Spin } from 'choerodon-ui/pro';
import qs from 'qs';
import { observer } from 'mobx-react';
import { flowRight } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import c7nModal from '@/utils/c7nModal';
import HtmlView from '@/components/HtmlView';
import Image from '@/components/Image';
import { SkuLabels } from '@/routes/product/SkuPreview/SkuInfo';
import operateRenderer from '@/routes/product/SkuWorkbench/records/operateRenderer';
import { openRecordTabs } from '@/routes/product/SkuWorkbench/drawers';

import styles from './index.less';

const SkuHeaderTitle = observer(({ ds }) => {
  return (
    <div className="sku-header-title">
      <>
        <span className="product-name">
          {ds?.current?.get('skuName')} - {ds?.current?.get('skuCode')}
        </span>
        <Tag color="gray" className="sku-header-tag">
          {intl.get('smpc.product.view.ecSku').d('电商商品')}
        </Tag>
      </>
      <div className="create-time">
        <span>{intl.get('smpc.workbench.model.creationDate').d('创建时间')}: </span>
        <span>{ds?.current?.get('creationDate')}</span>
      </div>
    </div>
  );
});

const Imag = observer(({ ds }) => {
  return <Image width={96} height={96} value={ds?.current?.get('imagePath')} />;
});

const SkuAttr = observer(({ ds, attrDs }) => {
  const skuAttrList = ds?.current?.get('skuAttrList') || [];
  const skuAttrExtendList = ds?.current?.get('skuAttrExtendList') || [];
  const attrList = [...skuAttrList, ...skuAttrExtendList];
  const attrData = {};
  attrList.forEach((attr) => {
    const { attrCode, attrName, attrValueName, attrValue, description } = attr;
    attrData[attrCode || attrName] = attrValueName || description || attrValue;
    attrDs.addField(attrCode || attrName, { label: attrName });
  });
  attrDs.loadData([attrData]);
  return (
    <Form
      dataSet={attrDs}
      columns={3}
      className="c7n-pro-vertical-form-display"
      labelLayout="vertical"
      useWidthPercent
    >
      {attrList.map((n) => (
        <Output name={n.attrCode || n.attrName} />
      ))}
    </Form>
  );
});

function EcSkuApproveDetail(props) {
  const { onFormLoaded, customizeForm } = props;
  const { skuId } = qs.parse(props.history.location.search.substr(1));
  const formDs = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        selection: false,
        paging: false,
        fields: [
          {
            name: 'supplierCompanyName',
            label: intl.get('smpc.product.model.supplier').d('供应商'),
          },
          {
            name: 'categoryName',
            label: intl.get('sagm.common.model.plateformCategory').d('平台分类'),
          },
          {
            name: 'catalogName',
            label: intl.get('smpc.product.model.productCatalog').d('商品目录'),
          },
          {
            name: 'introductions',
            label: intl.get('smpc.product.view.title.skuDescription').d('商品描述'),
          },
          {
            name: 'labels',
            label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
          },
          {
            name: 'shelfRemark',
            label: intl.get('smpc.workbench.view.confirm.shelfReason').d('上架原因'),
          },
          // 价格信息
          {
            label: intl.get('smpc.product.model.marketPrice').d('市场价'),
            type: 'number',
            name: 'marketPrice',
            transformResponse: (_, data) => data?.skuPreviewInfoDTO?.platPrice,
          },
          {
            name: 'agreementTaxedPrice',
            type: 'number',
            label: intl.get('smpc.product.model.taxAgreementPrice').d('协议价格(含税)'),
          },
          {
            name: 'agreementPrice',
            type: 'number',
            label: intl.get('smpc.product.model.noTaxPlatPrice').d('协议价格(不含税)'),
          },
          {
            name: 'tax',
            type: 'number',
            label: intl.get('smpc.product.model.tax').d('税率'),
          },
          {
            name: 'currencyName',
            label: intl.get('smpc.product.model.currency').d('币种'),
          },
          {
            name: 'allUnitFlag',
            label: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
          },
          {
            label: intl.get('smpc.product.model.deliveryDay').d('供货周期(天)'),
            name: 'deliveryDay',
            type: 'number',
          },
          // 商品属性
          {
            name: 'brandName',
            label: intl.get('smpc.product.view.brand').d('品牌'),
          },
          // 物料信息
          {
            label: intl.get('smpc.product.model.itemCode').d('物料编码'),
            name: 'itemCode',
          },
          {
            label: intl.get('smpc.product.model.itemName').d('物料名称'),
            name: 'itemName',
          },
          {
            name: 'itemCategoryCode',
            label: intl.get('smpc.product.view.itemCategoryCode').d('物料品类编码'),
          },
          {
            name: 'itemCategoryName',
            label: intl.get('smpc.product.view.itemCategoryName').d('物料品类名称'),
          },
        ],
        transport: {
          read: () => {
            return {
              url: `/smec/v1/${getCurrentOrganizationId()}/pur-skus/preview-info/${skuId}`,
              method: 'POST',
              transformResponse: (res) => {
                let parsedData = {};
                try {
                  parsedData = JSON.parse(res);
                } catch (e) {
                  // do nothing, use default error deal
                }
                if (parsedData) {
                  return {
                    ...parsedData?.skuSalesInfos?.[0],
                    ...parsedData,
                  };
                }
              },
            };
          },
        },
      }),
    []
  );
  const attrDs = useMemo(() => new DataSet());

  useEffect(() => {
    formDs.query().then(() => {
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    });
  }, []);

  const columns = [
    {
      name: 'marketPrice',
    },
    {
      name: 'agreementTaxedPrice',
    },
    {
      name: 'agreementPrice',
    },
    {
      name: 'tax',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'allUnitFlag',
      renderer: ({ value }) =>
        value === 1 ? intl.get('smpc.product.model.allOrg').d('所有组织') : '-',
    },
    {
      name: 'deliveryDay',
    },
  ];

  // 预览
  function handlePreview() {
    const { sourceFrom } = formDs?.current?.toData() || {};
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

  function handleViewIntro(intro) {
    c7nModal({
      title: intl.get('smpc.product.view.title.skuDescription').d('商品描述'),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <HtmlView _html={intro} name="sku-detail-intro" />,
    });
  }

  const operateRecord = (record) => {
    openRecordTabs({
      rowRecord: record,
      leftOperateArg: {
        url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
        queryParams: {
          skuId,
        },
        operateRenderer,
        partLoad: true,
      },
      isHasFlow: false,
    });
  };

  return (
    <div className={styles['ec-sku-approve-detail']}>
      <Spin dataSet={formDs}>
        <div className="sku-header">
          <SkuHeaderTitle ds={formDs} />
          <div className="sku-header-operation">
            <Button
              color="dark"
              funcType="flat"
              icon="operation_service_request"
              onClick={() => operateRecord(formDs.current)}
            >
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </Button>
            <Button color="dark" funcType="flat" icon="find_in_page" onClick={handlePreview}>
              {intl.get('hzero.common.button.preview').d('预览')}
            </Button>
          </div>
        </div>
        <div className="sku-base-info card">
          <p className="content-box-title">
            {intl.get('hzero.common.view.baseInfo').d('基本信息')}
          </p>
          <div className="sku-base-info-content">
            {customizeForm(
              { code: 'SMPC.WORKFLOW.EC_APPROVE.BASE_INFO' },
              <Form
                dataSet={formDs}
                columns={3}
                className="c7n-pro-vertical-form-display"
                labelLayout="vertical"
                useWidthPercent
              >
                <Output name="supplierCompanyName" />
                <Output name="categoryName" />
                <Output name="skuImage" rowSpan={2} renderer={() => <Imag ds={formDs} />} />
                <Output name="catalogName" />
                <Output
                  name="introductions"
                  renderer={({ record }) => {
                    if (record) {
                      const intro = record.get('introduction');
                      if (!intro) return '-';
                      return (
                        <a onClick={() => handleViewIntro(intro)}>
                          {intl.get('hzero.common.button.look').d('查看')}
                        </a>
                      );
                    }
                  }}
                />
                <Output
                  name="labels"
                  renderer={({ value }) => (value ? <SkuLabels labels={value || []} /> : '-')}
                />
                <Output name="shelfRemark" />
              </Form>
              // <Imag ds={formDs} />
            )}
          </div>
        </div>
        <div className="price-info card">
          <p className="content-box-title">
            {intl.get('smpc.product.view.priceInfo').d('价格信息')}
          </p>
          <Table dataSet={formDs} columns={columns} customizedCode="SMPC.EC.SKU.APPROVE.PRICE" />
        </div>
        <Collapse bordered={false} expandIconPosition="text-right" defaultActiveKey={['skuAttr']}>
          <Collapse.Panel
            header={
              <span className="content-box-title">
                {intl.get('smpc.product.view.productAttr').d('商品属性')}
              </span>
            }
            key="skuAttr"
          >
            <SkuAttr ds={formDs} attrDs={attrDs} />
          </Collapse.Panel>
        </Collapse>
        <div className="sku-item-info card">
          <p className="content-box-title">
            {intl.get('smpc.product.model.itemInfo').d('物料信息')}
          </p>
          <Form
            dataSet={formDs}
            columns={3}
            className="c7n-pro-vertical-form-display"
            labelLayout="vertical"
            useWidthPercent
          >
            <Output name="itemCode" />
            <Output name="itemName" />
            <Output name="itemCategoryCode" />
            <Output name="itemCategoryName" />
          </Form>
        </div>
      </Spin>
    </div>
  );
}

export default flowRight(
  formatterCollections({ code: ['smpc.product', 'sagm.common', 'smpc.workbench'] }),
  withCustomize({ unitCode: ['SMPC.WORKFLOW.EC_APPROVE.BASE_INFO'] })
)(EcSkuApproveDetail);
