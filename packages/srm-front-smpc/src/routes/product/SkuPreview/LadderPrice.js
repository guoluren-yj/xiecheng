import React, { useEffect, useMemo, useState } from 'react';
import Swiper from 'swiper';
import { Icon } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { precisionRender } from '@/routes/product/utilsApi/precision';
import OverflowTip from '@/routes/components/OverflowTip';
import style from './index.less';

let swiper;
export default function RangePrice(props) {
  const { uomName, currencySymbol, skuSalesLadders, onChangePrice = (e) => e } = props;
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    swiper = new Swiper('#range-price', {
      navigation: {
        nextEl: `.price-next`,
        prevEl: `.price-prev`,
      },
      slidesPerView: 3,
      slidesPerGroup: 3,
      width: 450,
      height: 75,
      spaceBetween: 0,
      simulateTouch: false,
      observer: true,
      observeParents: true,
    });

    const { taxPrice } = skuSalesLadders?.[0] || {};
    setCurrentPrice(taxPrice);
    onChangePrice(skuSalesLadders?.[0]);

    setTimeout(() => {
      swiper.slideTo(0);
    });

    return () => {
      swiper.destroy();
    };
  }, [skuSalesLadders, skuSalesLadders?.length]);

  const priceRender = (showPrice) => (
    <OverflowTip>
      {currencySymbol && <span className="symbol">{currencySymbol}</span>}
      {showPrice}
      {uomName && <span className="uom">/{uomName}</span>}
    </OverflowTip>
  );

  const showDetailImgs = useMemo(() => {
    return skuSalesLadders.map((item) => {
      return (
        <div
          className={`swiper-slide ${item.taxPrice === currentPrice ? 'price-selected' : ''}`}
          onClick={() => {
            setCurrentPrice(item.taxPrice);
            onChangePrice(item);
          }}
        >
          <div className={`price ${item.taxPrice === currentPrice ? 'price-selected' : ''}`}>
            {priceRender(precisionRender({ name: 'taxPrice', recordData: item }))}
          </div>
          <OverflowTip className="number">
            {item.ladderFrom
              ? item.ladderTo
                ? `${item.ladderFrom}-${math.minus(item.ladderTo, 1)}`
                : `>=${item.ladderFrom}`
              : `<=${item.ladderTo}`}
            {uomName}
          </OverflowTip>
        </div>
      );
    });
  }, [currentPrice]);

  return (
    <div className={style['sku-ladder-price']}>
      <div className="price-prev">
        <Icon type="keyboard_arrow_left" />
      </div>
      <div id="range-price" className="swiper-container swiper">
        <div className="swiper-wrapper">{showDetailImgs}</div>
      </div>
      <div className="price-next">
        <Icon type="keyboard_arrow_right" />
      </div>
    </div>
  );
}
