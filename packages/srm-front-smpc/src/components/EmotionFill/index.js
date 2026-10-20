import React from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import { ReactComponent as PriceEmptySvg } from '@/assets/price_empty.svg';
import { ReactComponent as StockEmptySvg } from '@/assets/stock_empty.svg';
import { ReactComponent as SpecEmptySvg } from '@/assets/sales-specification.svg';

import style from './index.less';

const EmotionFill = ({ children, type = 'price', showEmotion = false, ds, emptyCom }) => {
  const getSvg = () => {
    if (type === 'price') {
      return {
        Com: PriceEmptySvg,
        emptyInfo: emptyCom || intl.get('smpc.product.view.noBlackListData').d('暂无价格记录'),
      };
    }
    if (type === 'stock') {
      return {
        Com: StockEmptySvg,
        emptyInfo:
          emptyCom ||
          intl.get('smpc.product.view.noStockEmotionINfo').d('请先至物料管理开启非生库存管理'),
      };
    }
    if (type === 'spec') {
      return {
        Com: SpecEmptySvg,
        emptyInfo: emptyCom,
      };
    }
    return {};
  };
  const { Com, emptyInfo } = getSvg();
  // 解决svg 闪现
  return showEmotion || (ds && ds.status !== 'loading' && ds.length === 0) ? (
    <div className={style['empty-warper']}>
      <p className={style['primary-color']}>{Com && <Com />}</p>
      <div className={style['empty-info']}>{emptyInfo}</div>
    </div>
  ) : (
    children
  );
};

export default observer(EmotionFill);
