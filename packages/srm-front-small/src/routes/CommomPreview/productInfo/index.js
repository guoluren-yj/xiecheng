import React, { useState, useEffect } from 'react';
import { Spin } from 'hzero-ui';

import Icons from 'components/Icons';
import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';
import { queryAddress, queryStock, queryPay } from '@/services/commomPreviewService';
import RangePrice from './rangePrice';
import Counter from '../Counter';

// import Spec from './spec';
import Price from './price';
import styles from './index.less';

let timer;
function ProductInfo(props) {
  const { userId } = {};
  const { sourceFrom, productId, productData } = props;
  // const [isCollect, setIsCollect] = useState(collectFlag);
  const [configFlag, setConfigFlag] = useState(false);
  const [addressInfo, setAddressInfo] = useState({
    addressName: '',
    addressId: undefined,
  });
  const [stockNumber, setStockNumber] = useState(undefined);
  const [stockStateDesc, setStockStateDesc] = useState('');
  const [deliveryPay, setDeliveryPay] = useState(undefined);
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [MinProductNumber, setMinProductNumber] = useState(1);
  const [MaxProductNumber, setMaxProductNumber] = useState(1);
  const [currentPrice, setCurrentPrice] = useState('');
  const [Initvisible, setInitvisible] = useState(false);
  const {
    // ecProductName, // 电商商品名
    // productName: cataProductName, // 目录化商品商品名
    // productNum: cataProductNum, // 目录化商品编码
    // brand, // 商品品牌
    // supplierName, // 供应商名称
    // wareQd, // 商品单位
    // primaryUomName, // 目录化商品单位
    // taxPrice, // 含税价
    // JDPrice,
    // ecPlatform, // 电商商品供应商
    // ecProductNum, // 电商商品编码
    agreementPrice, // 协议价
    minPurchaseQuantity, // 最小采购量
    lowestBuy, // 电商最小采购量
    shelfFlag, // 上下架状态
    shelfStatus, // 平台级上下架状态
    // collectFlag,
    ecProductCheckVO,
    ladderEnableFlag,
    productLadderPrices,
    skuName, // 商品名称
    price, // 新的价格字段
    supplierCompanyName, // 供应商公司名称
    skuCode, // 商品编号
    lockStatus, // 解锁状态
    effectiveFlag,
  } = productData;

  useEffect(() => {
    // setIsCollect(collectFlag);
    setQuantity(lowestBuy || minPurchaseQuantity || 1);
    setMinProductNumber(lowestBuy || minPurchaseQuantity || 1);
    // if (ladderEnableFlag === 1) setMinProductNumber(productLadderPrices[0].ladderFrom );
    setMaxProductNumber(sourceFrom === 'CATA' ? 999999999999 : 200);
    let currentUnit = '';
    // if (sourceFrom !== 'CATA' && ladderEnableFlag === 1) {
    if (ladderEnableFlag === 1) {
      productLadderPrices.forEach((item) => {
        const { ladderFrom, ladderTo, unitPrice } = item;
        if (minPurchaseQuantity >= ladderFrom && minPurchaseQuantity < ladderTo) {
          currentUnit = unitPrice;
        }
      });
    }
    setCurrentPrice(currentUnit);
    addressQuery();
  }, []);

  useEffect(() => {
    const currentUnit = agreementPrice !== 0 ? agreementPrice || price : 0;
    setCurrentPrice(currentUnit);
  }, [price, agreementPrice]);

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

  function openTable() {
    setInitvisible(!Initvisible);
  }

  function updatePrice() {
    if (ladderEnableFlag === 1) {
      if (
        productLadderPrices &&
        productLadderPrices[productLadderPrices.length - 1].ladderTo !== null &&
        quantity >= productLadderPrices[productLadderPrices.length - 1].ladderTo
      ) {
        setQuantity(productLadderPrices[productLadderPrices.length - 1].ladderTo - 1);
        setCurrentPrice(productLadderPrices[productLadderPrices.length - 1].unitPrice);
      } else {
        productLadderPrices.forEach((item) => {
          const { ladderFrom, ladderTo, unitPrice } = item;
          if (
            ladderTo === null
              ? quantity >= ladderFrom
              : quantity >= ladderFrom && quantity < ladderTo
          ) {
            setCurrentPrice(unitPrice);
          }
        });
      }
    }
  }

  function addressQuery() {
    const { companyId } = {};
    if (!getAccessToken()) {
      // 无法执行
      queryAddress({ addressType: 'RECEIVER', companyId }).then((res) => {
        const { addressId, fullAddress: addressName } = res;
        setAddressInfo({
          ...addressInfo,
          addressId,
          addressName: addressName || null,
        });
        stockQuery(addressId);
      });
    }
  }

  // function handleCollect(item) {
  //   setIsCollect(true);
  //   const productSource = sourceFrom === 'CATA' ? 'CATA' : 'EC';
  //   addCollect({ productSource, productId: item.ecProductId || item.productId }).then(() => {
  //     setIsCollect(true);
  //   });
  // }

  /**
   * 查询商品库存
   * @param {Number} addressId - 地址 id
   */
  const stockQuery = (addressId) => {
    // if (ecPlatform && addressId) {
    if (sourceFrom !== 'CATA' && addressId) {
      setAddCartLoading(true);
      const queryParams = { addressId, platformCode: sourceFrom };
      Promise.all([
        queryStock(queryParams, [{ num: 1, productId }]),
        queryPay(queryParams, [skuCode]),
      ])
        .then((res) => {
          const stockData = res[0] || {};
          const payData = res[1] || {};

          if (!stockData.code) {
            setStockNumber(stockData[0].stockNumber);
            setStockStateDesc(stockData[0].stockStateDesc);
          } else {
            // Swal(intl.get(`small.productDetail.queryStockFail`).d('查询库存失败'));
          }

          if (!payData.code) {
            setDeliveryPay(payData.result);
          }
        })
        .finally(() => {
          setAddCartLoading(false);
        });
    }

    if (sourceFrom === 'CATA') {
      setAddCartLoading(false);
      setStockNumber(-1);
    }
  };

  const changePrice = (tmp) => {
    setQuantity(tmp);
  };

  function minus() {
    let num = Number(quantity) - 1;
    num = num < MinProductNumber ? MinProductNumber : num;
    setQuantity(num);
  }

  function add() {
    let num = Number(quantity) + 1;
    num = num >= MaxProductNumber ? MaxProductNumber : num;
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

  function validateToCart() {
    // 加入购物车之前sku校验
    const isAdd = []; // 存储每一个规格是否选择
    const specRow = document.querySelectorAll('.spec-row') || []; // 获取每一个规格的行dom
    for (let i = 0; i < specRow.length; i++) {
      // 循环遍历
      if (
        specRow[i].querySelector('.product-active') &&
        !specRow[i].querySelector('.product-active.product-disable')
      ) {
        isAdd.push(true);
        specRow[i].classList.remove('active');
      } else {
        specRow[i].classList.add('active');
        isAdd.push(false);
      }
    }
    if (!isAdd.includes(false)) {
      // 每一行都有选择才能加入购物车
      // addCart();
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

  // const invoiceName = invoiceOrgName && invoiceOrgName !== 'null' ? invoiceOrgName : null;
  // const purchaseName = purchaseOrgName && purchaseOrgName !== 'null' ? purchaseOrgName : null;
  const { addressName, addressId } = addressInfo;

  return (
    <div className={styles['common-product-detail-content']}>
      <div className="product-title">
        <p className="p-name">{skuName}</p>
      </div>
      <div className="product-meta">
        <div className="p-code">
          <span className="meta-label">
            {intl.get(`small.common.model.productNum`).d('商品编码')}:{' '}
          </span>
          <span title={skuCode}>{skuCode}</span>
        </div>
        {/* <div className="p-brand">
          <span className="meta-label">{intl.get(`small.productDetail.brand`).d('品牌')}: </span>
          <span title={brand}>{brand}</span>
        </div> */}
        <div className="p-supplier">
          <span className="meta-label">
            {intl.get(`small.common.model.supplier`).d('供应商')}:{' '}
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
        />
      ) : (
        <Price {...priceProps} />
      )}
      {(getAccessToken() || userId) && (
        <div className="product-config-link">
          <div className="product-attr">
            <div className="p-label " style={{ verticalAlign: 'top' }}>
              {intl.get(`small.common.receiving.information`).d('收货信息')}
            </div>
            <div className="p-content">
              {/* 预留地址选择lov */}
              {/* <Lov
                linkStyle
                viewInfo={{
                  width: 940,
                  lovRowKey: 'addressId',
                  queryUrl: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list?addressType=RECEIVER&enabledFlag=1`,
                  columns: addressColumns,
                  title: intl.get(`small.productDetail.addressQuery`).d('地址查询'), // 地址查询
                  displayField: 'fullAddress',
                  valueField: 'addressId',
                  otherField: 'fullAddress',
                }}
                textValue={addressName}
                onOkCallback={chooseAddress}
                require
                width={300}
              /> */}
              <span style={{ marginRight: '20px', display: 'inline-block', width: '200px' }}>
                {addressName ||
                  intl.get('small.productDetail.model.addReceivingInfo').d('请添加收货信息')}
              </span>
              <span
                onClick={openTable}
                style={{
                  marginRight: '4px',
                  color: '#C9AA6D',
                  cursor: 'pointer',
                  verticalAlign: 'top',
                }}
              >
                修改
              </span>
            </div>
          </div>
          <div
            className="product-other-config"
            style={{
              display: configFlag ? 'block' : 'none',
            }}
          >
            <div className="product-attr">
              <div className="p-label-required" />
              <div
                className="p-label "
                title={intl.get(`small.productDetail.view.inventoryOrg`).d('库存组织')}
              >
                {intl.get(`small.productDetail.view.inventoryOrg`).d('库存组织')}
              </div>
              <div className="p-content">
                {/* 预留地址选择lov */}
                <span style={{ marginRight: '20px', display: 'inline-block', width: '200px' }}>
                  -
                </span>
                <span
                  onClick={openTable}
                  style={{
                    marginRight: '4px',
                    color: '#999',
                    cursor: 'pointer',
                    verticalAlign: 'top',
                  }}
                >
                  {intl.get('hzero.common.button.update').d('修改')}
                </span>
              </div>
            </div>
            <div className="product-attr">
              <div className="p-label-required" />
              <div
                className="p-label "
                title={intl.get(`small.productDetail.view.purchaseOrg`).d('采购组织')}
              >
                {intl.get(`small.productDetail.view.purchaseOrg`).d('采购组织')}
              </div>
              <div className="p-content">
                {/* 预留地址选择lov */}
                <span style={{ marginRight: '20px', display: 'inline-block', width: '200px' }}>
                  -
                </span>
                <span
                  onClick={openTable}
                  style={{
                    marginRight: '4px',
                    color: '#999',
                    cursor: 'pointer',
                    verticalAlign: 'top',
                  }}
                >
                  修改
                </span>
              </div>
            </div>
          </div>
          <div
            className="product-attr"
            style={
              {
                // display: purchaseType === 'COMPANY' ? 'block' : 'none',
              }
            }
          >
            <div className="p-label" />
            <div className="p-content product-detail-address">
              <div
                style={{
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onClick={() => {
                  setConfigFlag(!configFlag);
                }}
              >
                {configFlag
                  ? intl.get(`small.productDetail.model.retractInfo`).d('收起信息')
                  : intl.get(`small.productDetail.model.moreInfo`).d('更多信息')}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <div className="product-attr">
        <div className="p-label">{intl.get(`small.productDetail.unit`).d('单位')}</div>
        <div className="p-content">
          <span>{wareQd || primaryUomName}</span>
        </div>
      </div> */}
      <div className="product-attr product-counter" style={{ marginTop: 16 }}>
        <div className="p-label">{intl.get(`small.productDetail.view.count`).d('数量')}</div>
        <div className="p-content">
          <Counter
            id="add_icon"
            maxBtnClass={
              quantity >= MaxProductNumber ||
              (productLadderPrices &&
                productLadderPrices.length > 1 &&
                productLadderPrices[productLadderPrices.length - 1].ladderTo &&
                quantity >= productLadderPrices[productLadderPrices.length - 1].ladderTo - 1)
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
                {intl.get(`small.productDetail.view.lowestBuy`).d('最小采购量')}:{' '}
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
                        {intl.get(`small.productDetail.view.commodityNoSale`).d('该商品暂时不可售')}
                      </span>
                    ) : stockNumber === undefined ? (
                      intl.get(`small.productDetail.view.stockQueryIng`).d('库存查询中')
                    ) : (
                      <React.Fragment>
                        {sourceFrom === 'CATA' && (!shelfFlag || !shelfStatus) ? (
                          <span style={{ color: '#E85050' }}>
                            {intl.get(`small.productDetail.view.commodityShelf`).d('该商品已下架')}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: stockNumber !== 0 ? '#666666' : '#E85050',
                            }}
                          >
                            {stockNumber === 0
                              ? intl.get(`small.productDetail.view.noStock`).d('无货')
                              : stockNumber > 0 && stockNumber <= 50
                              ? intl
                                  .get(`small.productDetail.view.remainStock`, {
                                    value: stockNumber,
                                  })
                                  .d(`仅剩余${stockNumber}件`)
                              : stockNumber === -2
                              ? stockStateDesc
                              : intl.get(`small.productDetail.view.isStock`).d('有货')}
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
          <Spin
            key={addCartLoading}
            className="product-add-spin"
            spinning={addCartLoading}
            size="small"
          >
            {(sourceFrom === 'CATA' && !shelfFlag) ||
            (ecProductCheckVO && !ecProductCheckVO.saleState && sourceFrom !== 'CATA') ||
            stockNumber === 0 ||
            !shelfFlag ||
            !effectiveFlag ||
            shelfStatus !== 1 ||
            lockStatus !== 1 ? (
              <button type="button" id="product-add" className="off">
                {intl.get(`small.productDetail.model.addCartBtn`).d('加入购物车')}
              </button>
            ) : (
              <button
                type="button"
                id="product-add"
                className="product-add"
                onClick={() => {
                  validateToCart();
                }}
              >
                {intl.get(`small.productDetail.model.addCartBtn`).d('加入购物车')}
              </button>
            )}
          </Spin>
        </div>
        {/* {(getAccessToken() || userId) &&
          (!collectFlag && !isCollect ? (
            <button
              className="p-collect"
              type="button"
              onClick={() => {
                handleCollect(productData);
              }}
              style={{ border: '1px solid #ddd' }}
            >
              <Icons type="collection" style={{ paddingRight: 9 }} />
              {intl.get(`small.productDetail.addCollect`).d('收藏')}
            </button>
          ) : (
            <button type="button" className="p-collect collected">
              <Icons type="collection1" style={{ paddingRight: 9 }} />
              {intl.get(`small.productDetail.collected`).d('已收藏')}
            </button>
          ))} */}
        {ecProductCheckVO && (!!ecProductCheckVO.is7ToReturn || deliveryPay !== undefined) && (
          <div className="product-service">
            {!!ecProductCheckVO.is7ToReturn && (
              <div className="product-attr">
                <div className="p-label" style={{ top: '1px' }}>
                  {intl.get(`small.productDetail.view.tips`).d('提示')}
                </div>
                <div className="p-content">
                  <Icons
                    type="tianwuliyoutuihuo"
                    className="primary-color"
                    style={{ marginRight: '5px' }}
                  />
                  <span className="p-content-desc">
                    {intl.get(`small.productDetail.view.is7ToReturn`).d('支持 7 天无理由退货')}
                  </span>
                  {deliveryPay !== undefined ? (
                    deliveryPay ? (
                      <span
                        style={{
                          marginTop: '8px',
                          marginLeft: '20px',
                        }}
                      >
                        <Icons type="zhichihuodaofukuan" className="primary-color" />{' '}
                        <span className="p-content-desc">
                          {intl
                            .get(`small.productDetail.view.supportPayGoods`)
                            .d('该商品支持货到付款')}
                        </span>
                      </span>
                    ) : (
                      <span
                        style={{
                          color: '#E85050',
                          marginTop: '8px',
                          marginLeft: '20px',
                        }}
                      >
                        <Icons type="buzhichihuodaofukuan" />{' '}
                        <span className="p-content-desc">
                          {intl
                            .get(`small.productDetail.view.noSupportPayGoods`)
                            .d('该商品不支持货到付款')}
                        </span>
                      </span>
                    )
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default ProductInfo;
