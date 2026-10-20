import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Spin } from 'choerodon-ui/pro';
import qs from 'qs';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import Image from '@/components/Image';
import OverflowTip from '@/components/OverflowTip';
import SkuImage from './SkuImage';
import SkuInfo from './SkuInfo';
import SkuDesc from './SkuDesc';
import { fetchSku } from './api';
import styles from './index.less';

// const Tips = () => {
//   const [closed, setClosed] = useState(false);
//   return (
//     !closed && (
//       <div className={styles['sku-preview-tips']}>
//         <div className="tips-left">
//           <Icon type="help" />
//           <OverflowTip className="tips-text">
//             {intl
//               .get('smpc.product.view.title.skuPreview.tips')
//               .d(
//                 '预览界面仅作为该商品在商城大致展示效果，部分字段因商品未上架而无法准确获取，将会使用虚拟值代替'
//               )}
//           </OverflowTip>
//         </div>
//         <Icon type="close" onClick={() => setClosed(true)} />
//       </div>
//     )
//   );
// };

function SkuPreview(props) {
  const {
    location: { search, pathname },
  } = props;
  const { skuId } = qs.parse(search.substr(1));
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const prefixPath = pathname.split('/preview')[0];

  useEffect(() => {
    setLoading(true);
    fetchSku({ skuId })
      .then((result) => {
        const res = getResponse(result);
        if (res) {
          if (Object.keys(res).length === 0) {
            notification.warning({
              message: intl.get('smpc.product.view.product.notExit').d('商品不存在'),
            });
            return false;
          }
          setData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skuId]);

  const storeSkus = useMemo(() => {
    const skus = data?.recommendSku || [];
    while (skus.length < 2) {
      skus.push(data || {});
    }
    return skus;
  }, [data]);

  return (
    <Fragment>
      <Header
        title={intl.get('srm.common.view.skuPreview').d('商品预览')}
        backPath={`${prefixPath}/list`}
      />
      <Content className={styles['sku-preview-container']}>
        <Spin spinning={loading}>
          {/* <Tips /> */}
          <div className="sku-preview-wrapper">
            <div className="sku-base-info">
              <SkuImage skuImageList={data?.skuMedias} />
              <SkuInfo data={data} />
              <div className="sku-store-recommend">
                <div className="sku-store-header">
                  <span className="sku-store-title">
                    {intl.get('smkt.selection.view.title.storeRecommend').d('店铺好物')}
                  </span>
                  <span className="sku-store-adver">
                    {intl.get('smpc.product.view.advertisement').d('广告')}
                  </span>
                </div>
                {storeSkus.map((m) => {
                  return (
                    <div className="store-sku-content">
                      <Image value={m.primaryPath} width="100%" />
                      <OverflowTip className="store-sku-price">{m.proposedPrice}</OverflowTip>
                      <OverflowTip className="store-sku-name">{m.skuName}</OverflowTip>
                    </div>
                  );
                })}
              </div>
            </div>
            <SkuDesc attributes={data?.attributes} skuDetail={data?.skuDetail} />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
}

export default formatterCollections({ code: ['smpc.product', 'smkt.selection'] })(SkuPreview);
