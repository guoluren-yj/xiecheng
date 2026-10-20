import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import qs from 'qs';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import SubContent from './SubContent';
import SkuImage from './SkuImage';
import SkuInfo from './SkuInfo';
import SkuDesc from './SkuDesc';

import { fetchProductNew, fetchSkus } from './api';

import styles from './index.less';

function SkuPreview(props) {
  const {
    // backPath,
    // 外部携带的参数信息
    skuId = '', //
    unitPrice = '-',
    unTaxedPrice,
    uom = '-',
    // tax,
    currency,
    itemName,
    itemCode,
    categoryCode,
    categoryName,
  } = qs.parse(props.href?.split('/s2-mall/product/new-preview?')[1] || '');
  const [data, setData] = useState({});
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductNew({ productId: skuId })
      .then((result) => {
        const res = getResponse(result);
        if (res) {
          if (Object.keys(res).length === 0) {
            notification.warning({
              message: intl.get('smpc.product.view.product.notExit').d('商品不存在'),
            });
            return false;
          }
          setData(res || {});
        }
      })
      .finally(() => {
        setLoading(false);
      });
    getSkus();
  }, []);

  async function getSkus() {
    const res = getResponse(await fetchSkus({ productId: skuId }));
    if (res) {
      setSkuList(res);
    }
  }
  const { skuAttrList, skuAttrExtendList } = data;
  const selfSkuInfo = {
    skuId,
    skuList,
    ...data,
  };
  const attrList = [...(skuAttrList || []), ...(skuAttrExtendList || [])];
  const {
    changeSpecial = 0,
    afterSaleSpecial = 0,
    returnSpecial = 0,
    instruction = '',
    returnDuration = '',
    changeDuration = '',
    qualityDuration = '',
    // 电商推品售后信息
    changeDesc = '',
    returnDesc = '',
    qualityDesc = '',
  } = data?.afterSale || {};
  const inferenceList = [
    { label: intl.get('smpc.product.view.supplier').d('供应商'), value: data.supplierCompanyName },
    { label: intl.get('smpc.product.model.itemCode').d('物料编码'), value: itemCode },
    { label: intl.get('smpc.product.model.itemName').d('物料名称'), value: itemName },
    { label: intl.get('smpc.product.model.itemCategoryCode').d('品类编码'), value: categoryCode },
    { label: intl.get('smpc.product.model.itemCategoryName').d('品类名称'), value: categoryName },
    {
      label: intl.get('smpc.product.view.refundsInfo').d('退货信息'),
      getValue: () => {
        if (returnDesc) return returnDesc;
        else {
          return returnSpecial === 2
            ? intl.get('smpc.product.view.noLimitRefunds').d('该商品支持不限次数退货')
            : returnSpecial === 1
            ? intl.get('smpc.product.view.noRefunds').d('特殊商品，一经签收不予退货')
            : returnSpecial === 0 && returnDuration
            ? intl
                .get('smpc.product.view.returnDuration', { name: returnDuration })
                .d(`确认收货后${returnDuration}日内出现质量问题可申请退货`)
            : '-';
        }
      },
    },
    {
      label: intl.get('smpc.product.view.exchangeInfo').d('换货信息'),
      getValue: () => {
        if (changeDesc) return changeDesc;
        else {
          return changeSpecial === 2
            ? intl.get('smpc.product.view.noLimitExchange').d('该商品支持不限次数换货')
            : changeSpecial === 1
            ? intl.get('smpc.product.view.noExchange').d('特殊商品，一经签收不予换货')
            : changeSpecial === 0 && changeDuration
            ? intl
                .get('smpc.product.view.changeDuration', { name: changeDuration })
                .d(`确认收货后${changeDuration}日内出现质量问题可申请换货`)
            : '-';
        }
      },
    },
    {
      label: intl.get('smpc.product.view.warrantyInfo').d('质保信息'),
      getValue: () => {
        if (qualityDesc) return qualityDesc;
        else {
          return qualityDuration
            ? intl
                .get('smpc.product.view.qualityDuration', { name: qualityDuration })
                .d(`质保限期${qualityDuration}个月`)
            : '-';
        }
      },
    },
    {
      label: intl.get('smpc.product.view.specialAfs').d('特殊售后说明'),
      value: afterSaleSpecial ? instruction : '-',
    },
  ];
  return (
    <div className={styles['new-sku-preview-modal']}>
      <Header title={intl.get('smpc.product.view.viewSku').d('查看商品')} />
      <Content className={styles['new-sku-preview-container']}>
        <Spin spinning={loading}>
          <div className={styles['new-sku-preview-wrapper']}>
            <SubContent showDivide={false}>
              <div className={styles['main-info']}>
                <div className={styles['left-img-info']}>
                  <SkuImage
                    skuImageList={data?.skuImageList}
                    initMediaId={data?.mediaId}
                    initMediaPath={data?.mediaPath}
                    initLargeImagePath={data?.largeImagePath}
                  />
                </div>
                <div className={styles['right-sku-mian']}>
                  <SkuInfo
                    outSkuInfo={{ unitPrice: `${unitPrice}/${uom}`, currency, unTaxedPrice }}
                    selfSkuInfo={selfSkuInfo}
                  />
                </div>
              </div>
            </SubContent>
            <SubContent>
              <SkuDesc
                specAttrList={attrList}
                introduction={data?.introduction}
                inferenceList={inferenceList}
              />
            </SubContent>
          </div>
        </Spin>
      </Content>
    </div>
  );
}

export default formatterCollections({ code: ['smpc.product'] })(SkuPreview);
