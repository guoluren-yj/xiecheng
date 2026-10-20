import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import SubContent from '@/routes/product/SkuPreviewNew/SubContent';
import SkuImage from '@/routes/product/SkuPreviewNew/SkuImage';
import SkuInfo from '@/routes/product/SkuPreviewNew/SkuInfo';
import SkuDesc from '@/routes/product/SkuPreviewNew/SkuDesc';
import { fetchProductNew, fetchSkus } from '@/routes/product/SkuPreviewNew/api';
import styles from '@/routes/product/SkuPreviewNew/index.less';

function SkuPreview(props) {
  const { skuId = '' } = props;
  const [data, setData] = useState({});
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    currencySymbol,
    agreementPriceMeaning: unTaxedPrice, // 未税单价
    agreementTaxedPriceMeaning: unitPrice, // 含税单价
  } = data?.skuPreviewInfoDTO || {};

  useEffect(() => {
    setLoading(true);
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
  const {
    skuAttrList,
    skuAttrExtendList,
    itemName,
    itemCode,
    categoryCode,
    categoryName,
    uomName = '-',
  } = data;
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
    <Spin spinning={loading}>
      <div className={styles['new-sku-preview-container']}>
        <div
          className={[styles['new-sku-preview-wrapper'], styles['add-sku-preview-wrapper']].join(
            ' '
          )}
        >
          <SubContent showDivide={false} style={{ padding: 0 }}>
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
                  outSkuInfo={{
                    unitPrice: `${unitPrice}/${uomName}`,
                    currency: currencySymbol,
                    unTaxedPrice,
                  }}
                  selfSkuInfo={selfSkuInfo}
                />
              </div>
            </div>
          </SubContent>
          <SubContent
            showDivide={false}
            style={{ padding: '0 0 20px 0', marginTop: '32px', maxHeight: 'calc(100vh - 120px)' }}
          >
            <SkuDesc
              specAttrList={attrList}
              introduction={data?.introduction}
              inferenceList={inferenceList}
            />
          </SubContent>
        </div>
      </div>
    </Spin>
  );
}

export default formatterCollections({ code: ['smpc.product', 'srm.common'] })(SkuPreview);
