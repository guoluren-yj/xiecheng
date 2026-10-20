import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import c7nModal from '@/utils/c7nModal';
import HtmlView from '@/components/HtmlView';
import FormPro from '../SkuDetail/FormPro';
import ImageList from '../SkuDetail/ImageList';
import Detail from '../CustomTemplate/Detail';
import { SkuLabels } from '../SkuPreview/SkuInfo';
import { baseInfoDs } from './ds';
import customStore from './customStore';

export default function BaseInfo(props) {
  const { title, sku: skuInfo } = props;
  const { sourceFrom, spuId } = skuInfo || {};
  const dataSet = useMemo(() => new DataSet(baseInfoDs()), []);
  const prexCode = sourceFrom === 'CATA' ? 'CATA' : 'EC';
  const { customizeForm } = customStore.getCustFuncs();
  const customizeCode = customStore.getCustomCode(`${prexCode}_BASE_INFO`);

  useEffect(() => {
    dataSet.loadData([skuInfo]);
  }, [skuInfo]);

  function handleViewIntro(intro) {
    const introTitle = intl.get('smpc.product.view.title.skuDescription').d('商品描述');
    c7nModal({
      title: introTitle,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <HtmlView _html={intro} name="sku-detail-intro" />,
    });
  }

  function handleViewCustomAttr() {
    const _title = intl.get('smpc.product.view.customInfo').d('定制品信息');
    c7nModal({
      title: _title,
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail readOnly spuId={spuId} entrance="spu" />,
    });
  }

  const renderImage = ({ record }) => {
    const initList = toJS(record.get('skuImageList')) || [];
    const imgList =
      initList?.map((m) => ({
        ...m,
        fileUrl: m.largeImagePath || m.mediaPath,
        minUrl: m.mediaPath,
      })) || [];
    return <ImageList width={100} height={100} imgList={imgList} />;
  };

  function getField() {
    return [
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'primaryImagePath', rowSpan: 2, renderer: renderImage },
      { name: 'supplierCompanyName' },
      {
        name: 'catalogName',
      },
      {
        name: 'customFlag',
        show: sourceFrom === 'CATA',
        renderer: ({ value }) =>
          value ? (
            <a onClick={handleViewCustomAttr}>{intl.get('hzero.common.button.look').d('查看')}</a>
          ) : (
            '-'
          ),
      },
      {
        name: 'introductions',
        colSpan: 2,
        renderer: ({ record }) => {
          if (record) {
            const intro = record.get('introduction');
            if (!intro) return '-';
            return (
              <a onClick={() => handleViewIntro(intro)}>
                {intl.get('hzero.common.button.look').d('查看')}
              </a>
            );
          }
        },
      },
      {
        name: 'labels',
        renderer: ({ value = [] }) => (value.length > 0 ? <SkuLabels labels={value} /> : '-'),
        colSpan: 2,
      },
    ].filter((f) => f.show || !('show' in f));
  }

  return (
    <Content>
      <div className="sku-info-wrapper">
        <div className="part-title">{title}</div>
        <FormPro
          readOnly
          dataSet={dataSet}
          columns={3}
          customizeForm={customizeForm}
          customizeCode={customizeCode}
          fields={getField()}
        />
      </div>
    </Content>
  );
}
