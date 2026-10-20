import React, { useState, useEffect } from 'react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import RangePrice from './rangePrice';
import Counter from '../Counter';

// import Spec from './spec';
import Price from './price';
import styles from './index.less';

let timer;
function ProductInfo(props) {
  const { sourceFrom, productData, id } = props;
  const [addressInfo] = useState({
    addressName: '',
    addressId: undefined,
  });
  const [stockNumber] = useState(undefined);
  const [stockStateDesc] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [MinProductNumber, setMinProductNumber] = useState(1);
  const [MaxProductNumber, setMaxProductNumber] = useState(1);
  const [currentPrice, setCurrentPrice] = useState('');
  const {
    minPurchaseQuantity, // 最小采购量
    lowestBuy, // 电商最小采购量
    shelfFlag, // 上下架状态
    shelfStatus, // 平台级上下架状态
    ecProductCheckVO,
    ladderEnableFlag,
    productLadderPrices,
    skuName, // 商品名称
    price, // 新的价格字段
    supplierCompanyName, // 供应商公司名称
    skuCode, // 商品编号
    lockStatus, // 解锁状态
    skuSalesInfos,
  } = productData;

  const { platPrice } = (skuSalesInfos || [])[0] || {};

  useEffect(() => {
    setQuantity(lowestBuy || minPurchaseQuantity || 1);
    setMinProductNumber(lowestBuy || minPurchaseQuantity || 1);
    setMaxProductNumber(sourceFrom === 'CATA' ? 999999999999 : 200);
    let currentUnit = '';
    if (ladderEnableFlag === 1) {
      productLadderPrices.forEach((item) => {
        const { ladderFrom, ladderTo, unitPrice } = item;
        if (math.gte(minPurchaseQuantity, ladderFrom) && math.lt(minPurchaseQuantity, ladderTo)) {
          currentUnit = unitPrice;
        }
      });
    }
    setCurrentPrice(currentUnit);
  }, []);

  useEffect(() => {
    const currentUnit = platPrice !== 0 ? platPrice || price : 0;
    setCurrentPrice(currentUnit);
  }, [platPrice]);

  useEffect(() => {
    timer = setTimeout(() => {
      if (quantity > MaxProductNumber) {
        setQuantity(MaxProductNumber);
      }
      if (quantity < MinProductNumber) {
        setQuantity(MinProductNumber);
      }
      updatePrice();
    }, 500);
  }, [quantity]);

  function updatePrice() {
    if (ladderEnableFlag === 1) {
      if (
        productLadderPrices &&
        productLadderPrices[productLadderPrices.length - 1].ladderTo !== null &&
        math.gte(quantity, productLadderPrices[productLadderPrices.length - 1].ladderTo)
      ) {
        setQuantity(math.minus(productLadderPrices[productLadderPrices.length - 1].ladderTo, 1));
        setCurrentPrice(productLadderPrices[productLadderPrices.length - 1].unitPrice);
      } else {
        productLadderPrices.forEach((item) => {
          const { ladderFrom, ladderTo, unitPrice } = item;
          if (
            ladderTo === null
              ? math.gte(quantity, ladderFrom)
              : math.gte(quantity, ladderFrom) && math.lt(quantity, ladderTo)
          ) {
            setCurrentPrice(unitPrice);
          }
        });
      }
    }
  }

  const changePrice = (tmp) => {
    setQuantity(tmp);
  };

  function minus() {
    let num = math.minus(quantity, 1);
    num = math.lt(num, MinProductNumber) ? MinProductNumber : num;
    setQuantity(num);
  }

  function add() {
    let num = math.plus(quantity, 1);
    num = math.gte(num, MaxProductNumber) ? MaxProductNumber : num;
    setQuantity(num);
  }

  function changeVal(e) {
    const val = e.target.value;
    clearTimeout(timer);
    if (!isNaN(val) && val > 0) {
      setQuantity(+val > MaxProductNumber ? MaxProductNumber : +val);
    } else if (val === '') {
      setQuantity('');
    }
  }

  function checkVal(e) {
    const val = e.target.value;
    if (val === '') {
      setQuantity(1);
    }
  }

  // 商品品牌+商品广义分类+商品型号+商品关键属性信息
  // const name = ecProductName || cataProductName;
  if (skuName) document.title = skuName;
  // const productNum = ecProductNum || cataProductNum;
  const priceProps = {
    currentPrice,
    sourceFrom,
    prePrice: price,
  };

  const { addressId } = addressInfo;

  return (
    <div className={styles['product-detail-content']}>
      <div className="product-title">
        <p className="p-name">{skuName}</p>
      </div>
      <div className="product-meta">
        <div className="p-code">
          <span className="meta-label">
            {intl.get(`smpc.product.model.skuCode`).d('商品编码')}:{' '}
          </span>
          <span title={skuCode}>{skuCode}</span>
        </div>
        {/* <div className="p-brand">
          <span className="meta-label">{intl.get(`smpc.product.brand`).d('品牌')}: </span>
          <span title={brand}>{brand}</span>
        </div> */}
        <div className="p-supplier">
          <span className="meta-label">
            {intl.get(`smpc.product.model.supplier`).d('供应商')}:{' '}
          </span>
          <span title={supplierCompanyName}>{supplierCompanyName}</span>
        </div>
      </div>
      {ladderEnableFlag ? (
        <RangePrice
          {...priceProps}
          productLadderPrices={productLadderPrices}
          onChangePrice={changePrice}
          quantity={quantity}
          setQuantity={setQuantity}
          id={id}
        />
      ) : (
        <Price {...priceProps} />
      )}
      {/* <div className="product-attr">
        <div className="p-label">{intl.get(`smpc.product.unit`).d('单位')}</div>
        <div className="p-content">
          <span>{wareQd || primaryUomName}</span>
        </div>
      </div> */}
      <div className="product-attr product-counter" style={{ marginTop: 8 }}>
        <div className="p-label">{intl.get(`smpc.product.view.count`).d('数量')}</div>
        <div className="p-content">
          <Counter
            id="add_icon"
            maxBtnClass={
              quantity >= MaxProductNumber ||
              (productLadderPrices &&
                productLadderPrices.length > 1 &&
                productLadderPrices[productLadderPrices.length - 1].ladderTo &&
                math.gte(
                  quantity,
                  math.minus(productLadderPrices[productLadderPrices.length - 1].ladderTo, 1)
                ))
                ? 'disable-button'
                : ''
            }
            minBtnClass={quantity <= MinProductNumber ? 'disable-button' : ''}
            changeVal={(event) => changeVal(event)}
            minus={minus}
            add={add}
            value={quantity}
            onBlur={(e) => {
              checkVal(e);
            }}
          />
          {(minPurchaseQuantity > 1 || lowestBuy > 1) && (
            <span className="product-ware">
              <span className="ware-label">
                {intl.get(`smpc.product.view.lowestBuy`).d('最小采购量')}:{' '}
              </span>
              {minPurchaseQuantity || lowestBuy}
            </span>
          )}
          <div className="product-count" style={{ lineHeight: '28px', display: 'inline-block' }}>
            <div className="p-content">
              <div className="stock-info">
                {addressId && (
                  <span key={addressId} className="product-stock">
                    {(ecProductCheckVO && !ecProductCheckVO.saleState && sourceFrom !== 'CATA') ||
                    lockStatus !== 1 ? (
                      <span style={{ color: '#E85050' }}>
                        {intl.get(`smpc.product.view.commodityNoSale`).d('该商品暂时不可售')}
                      </span>
                    ) : stockNumber === undefined ? (
                      intl.get(`smpc.product.view.stockQueryIng`).d('库存查询中')
                    ) : (
                      <React.Fragment>
                        {sourceFrom === 'CATA' && (!shelfFlag || !shelfStatus) ? (
                          <span style={{ color: '#E85050' }}>
                            {intl.get(`smpc.product.view.commodityShelf`).d('该商品已下架')}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: stockNumber !== 0 ? '#666666' : '#E85050',
                            }}
                          >
                            {stockNumber === 0
                              ? intl.get(`smpc.product.view.noStock`).d('无货')
                              : stockNumber > 0 && stockNumber <= 50
                              ? intl
                                  .get(`smpc.product.remainStock`, {
                                    value: stockNumber,
                                  })
                                  .d(`仅剩余${stockNumber}件`)
                              : stockNumber === -2
                              ? stockStateDesc
                              : intl.get(`smpc.product.view.isStock`).d('有货')}
                          </span>
                        )}
                      </React.Fragment>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="stock">
        <div className="addSpin">
          <button type="button" id="product-add" className="off">
            {intl.get(`smpc.product.btn.addCart`).d('加入购物车')}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProductInfo;
