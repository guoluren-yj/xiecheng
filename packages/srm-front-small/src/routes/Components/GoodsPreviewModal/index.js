import React, { useState, useEffect, useRef } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Spin } from 'hzero-ui';
import styles from './index.less';
import ProductImg from './productImg';
import ProductInfo from './productInfo';
import ProductDesc from './productDesc';
import 'swiper/dist/css/swiper.min.css';
import notification from 'utils/notification';
import { getProductDetail } from '@/services/commomPreviewService';

function ProductDetail(props) {
  const [loading, setLoading] = useState(true);
  const catalogItems = useRef([]); // 商品分类
  const productName = useRef(''); // 商品名称
  const [imgList, setImgList] = useState([]); // 图片列表
  const [productData, setProductData] = useState({}); // 商品信息
  const stock = -1;
  const cartLoading = false;
  const { sourceFrom = 'CATA', productId, companyId, id, agreementLineId, isNew = false } = props;
  const stockEnough = !!(
    (sourceFrom === 'CATA' &&
      !!productData.shelfFlag &&
      !!productData.lockStatus &&
      !!productData.shelfStatus) ||
    (productData.ecProductCheckVO &&
      !productData.ecProductCheckVO.saleState &&
      sourceFrom !== 'CATA') ||
    stock === 0
  );
  useEffect(() => {
    setLoading(true);
    getProductDetail({
      isNew,
      sourceFrom,
      productId,
      companyId,
      agreementLineId,
    })
      .then((result) => {
        const res = getResponse(result);
        const detailData = res || {}; // 商品信息
        if (Object.keys(detailData).length === 0) {
          notification.warning({
            message: intl.get('small.common.view.product.notExit').d('商品不存在'),
          });
          return false;
        }
        catalogItems.current = detailData.catalogList;
        productName.current = detailData.ecProductName || detailData.cataProductName;
        setImgList(detailData.ecProductImageList || detailData.productImageList || []);
        setProductData(detailData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId, companyId, sourceFrom]);

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        <div className={styles['productDetail-page']}>
          <div className="product-detail-content">
            <div className="product-detail-wrapper">
              <div className="info-left">
                <ProductImg
                  imagePath={productData.imagePath}
                  productImgList={imgList}
                  productData={productData}
                  sourceFrom={sourceFrom}
                  id={id}
                />
              </div>
              <div className="info-center" id="info-center">
                <ProductInfo
                  productData={productData}
                  sourceFrom={sourceFrom}
                  productId={Number(productId)}
                  id={id}
                />
              </div>
              {/* <div className="info-right">
                {Hmall.getUserConfigInfo().userId && (
                      <ProductCompare
                        imgList={imgList}
                        productId={productId}
                        sourceFrom={sourceFrom}
                        invoiceOrgId={Hmall.getUserConfigInfo().invoiceOrgId}
                      />
                    )}
              </div> */}
            </div>
            <div className="product-desc-wrapper">
              {/* {Hmall.getUserConfigInfo().userId && <div className="desc-left" />} */}
              <div className="desc-right">
                <ProductDesc
                  imgList={imgList}
                  sourceFrom={sourceFrom}
                  stockEnough={stockEnough}
                  cartLoading={cartLoading}
                  productId={Number(productId)}
                  productData={productData}
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </React.Fragment>
  );
}

export default ProductDetail;
