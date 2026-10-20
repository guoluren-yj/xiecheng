import React, { useState, useEffect } from 'react';
import { Spin, Icon } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import Image from '@/components/Image';
import Card from '@/components/Card';
import FormPro from '@/components/FormPro';
import OverflowTip from '@/components/OverflowTip';
import { fetchSku } from './api';
import styles from './style.less';

function SkuIntro({ value }) {
  const cssurl = value?.match(/cssurl='(\S*)'>/)?.[1];
  const [cssData, setCssData] = useState('');
  const [more, setMore] = useState(false);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (cssurl) {
      fetch(`${window.location.protocol}${cssurl}`)
        .then((res) => res.text())
        .then((res) => setCssData(res));
    }
  }, [cssurl]);

  useEffect(() => {
    if (value) {
      setTimeout(() => {
        const container = document.querySelector('.sku-intro-content');
        const { clientHeight, scrollHeight } = container;
        setIsOver(scrollHeight > clientHeight);
      });
    }
  }, [value, cssData, cssurl]);

  return (
    <div className={styles['sku-intro-wrapper']}>
      <div className="sku-intro-content" style={more ? { height: 'auto' } : { maxHeight: 188 }}>
        <div
          className="sku-intro-value"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: cssurl ? `<style>${cssData}</style><br>${value}` : value,
          }}
        />
      </div>
      {isOver && (
        <div className="sku-intro-more">
          <span className="intro-more-btn" onClick={() => setMore((m) => !m)}>
            {more
              ? intl.get('smkt.selection.view.button.collectMore').d('收起更多')
              : intl.get('smkt.selection.view.button.viewMore').d('查看更多')}
            <Icon
              type={more ? 'expand_less' : 'expand_more'}
              style={{ fontWeight: 400, marginBottom: 4 }}
            />
          </span>
        </div>
      )}
    </div>
  );
}

export default function SkuDetail(props) {
  const { skuId } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    fetchSkuInfo();
  }, [skuId]);

  async function fetchSkuInfo() {
    setLoading(true);
    const res = getResponse(await fetchSku({ skuId }));
    setLoading(false);
    if (res) {
      setData(res);
    }
  }

  function getAttrFields() {
    const attrs = data.attributes || [];
    return attrs.map((m) => {
      const { attrName, attrValue } = m;
      return { name: attrName, label: attrName, renderer: () => attrValue };
    });
  }

  const attrFields = getAttrFields();

  return (
    <Spin spinning={loading}>
      <div className={styles['sku-info-wrapper']}>
        <Image value={data.thumbnailPath} width={122} height={122} />
        <div className="sku-info-content">
          <OverflowTip className="sku-name">{data.skuName}</OverflowTip>
          <div className="sku-price">
            <span className="price">{data.proposedPrice}</span>
            <span className="msg">
              ({intl.get('smpc.product.view.proposedPrice').d('参考价格')})
            </span>
          </div>
          <div className="sku-other">
            <span className="sku-info-label">
              {intl.get('smpc.product.view.supplier').d('供应商')}：
            </span>
            <span className="sku-info-value">{data.supplierName || '-'}</span>
          </div>
          <div className="sku-other">
            <span className="sku-info-label">
              {intl.get('smpc.product.view.skuCode').d('商品编码')}：
            </span>
            <span className="sku-info-value">{data.skuCode || '-'}</span>
          </div>
          <div className="sku-other">
            <span className="sku-info-label">
              {intl.get('smpc.product.view.skuCatalog').d('商品目录')}：
            </span>
            <span className="sku-info-value">{data.catalogName || '-'}</span>
          </div>
        </div>
      </div>
      <Card title={intl.get('smpc.product.model.productIntro').d('商品介绍')}>
        {data.skuDetail ? (
          <SkuIntro value={data.skuDetail} />
        ) : (
          <div className={styles['no-data']}>
            {intl.get(`smpc.product.model.noData`).d('暂无数据')}
          </div>
        )}
      </Card>
      <Card title={intl.get('smpc.product.view.specAttr').d('规格属性')}>
        {attrFields.length > 0 ? (
          <FormPro readOnly fields={getAttrFields()} columns={3} />
        ) : (
          <div className={styles['no-data']}>
            {intl.get(`smpc.product.model.noData`).d('暂无数据')}
          </div>
        )}
      </Card>
    </Spin>
  );
}
