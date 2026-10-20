/**
 * ommonPreview -商品详情-公共预览的页面
 * @date: 2019-12-16
 * @author DTM <tpeng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import Swiper from 'swiper';
import qs from 'querystring';
import { connect } from 'dva';
import { Spin } from 'hzero-ui';

import { jdConvertImg } from '_utils/utils';
import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import styles from './ProductDetail.less';
import Image from './Image';
import Count from './Count';

// 购买数量最大可选数量
const MaxProductNumber = 200;
@connect(({ loading, goodsPreview }) => ({
  goodsPreview,
  productPreviewLoading: loading.effects['goodsPreview/fetchDetail'],
}))
@withRouter
@formatterCollections({ code: ['scec.goodsPreview', 'scec.common'] })
export default class GoodsPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceFrom: 'CATA',
      baseInfoList: {},
      htmlList: {},
      productImageList: [],
      quantity: 1,
      selectImg: '',
      attrNotice: false,
      attrs: [],
      attrsMap: {},
      attrQualityMap: {},
      flashSaleProductsList: [],
      flashSaleSkuPojo: [],
      miniOrderQuantity: 1,
      activeDetailPanel: true,
      is7ToReturn: false,
      productId: qs.parse(location.search.substr(1)).productId,
    };
  }

  componentDidMount() {
    // 初始化上下滚动组件
    // eslint-disable-next-line no-new
    new Swiper('#detail-images', {
      // prevButton: '.detail-images-prev',
      // nextButton: '.detail-images-next',
      navigation: {
        nextEl: '.detail-images-next',
        prevEl: '.detail-images-prev',
      },
      slidesPerView: 4,
      slidesPerGroup: 4,
      direction: 'vertical',
      height: 400,
      spaceBetween: 0,
    });
    this.fetchCodeAndDetail();
  }

  @Bind()
  fetchCodeAndDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { type, productId, platformCode } = qs.parse(search.substr(1));
    if (platformCode) {
      this.fetchGoodsInfo(platformCode);
    } else if (type === 'CATALOGUE') {
      this.fetchGoodsInfo('CATA');
    } else if (type === 'E-COMMERCE') {
      dispatch({
        type: 'goodsPreview/fetchProductPlatFormCode',
        payload: { ecProductId: productId },
      }).then(res => {
        if (res) {
          this.fetchGoodsInfo(res);
        }
      });
    }
  }

  componentWillReceiveProps(props) {
    if (
      Number(qs.parse(props.location.search.substr(1)).productId) !== Number(this.state.productId)
    ) {
      this.setState(
        {
          productId: qs.parse(location.search.substr(1)).productId,
        },
        () => {
          this.fetchCodeAndDetail();
        }
      );
    }
  }

  @Bind()
  fetchGoodsInfo(code) {
    const { dispatch, location } = this.props;
    const { productId } = qs.parse(location.search.substr(1));
    dispatch({
      type: 'goodsPreview/fetchDetail',
      payload: {
        productId,
        platformCode: code,
      },
    }).then(res => {
      if (!res) {
        return false;
      }
      const { ecProduct = {}, productImageList = [], productDetail = {} } = res;
      const primaryImgIndex = productImageList.findIndex(item => !!item.ecPrimaryFlag);
      const newImageList =
        primaryImgIndex === -1
          ? productImageList
          : [
              productImageList[primaryImgIndex],
              ...productImageList.slice(0, primaryImgIndex),
              ...productImageList.slice(primaryImgIndex + 1),
            ];
      const selectImg = newImageList[0] && newImageList[0].imagePath;
      this.setState({
        baseInfoList: res,
        htmlList: productDetail,
        productImageList: newImageList,
        sourceFrom: ecProduct ? ecProduct.ecPlatform : 'CATA',
        selectImg,
        is7ToReturn: res.ecProductCheckVO ? res.ecProductCheckVO.is7ToReturn : undefined,
      });
    });
  }

  @Bind()
  onMouseMove(e) {
    return e;
    // const fixWidth =
    //   document.getElementsByClassName('ant-layout-sider-children')[0] &&
    //   document.getElementsByClassName('ant-layout-sider-children')[0].offsetWidth;
    // const fixHeight =
    //   document.body.clientHeight -
    //     document.getElementsByClassName('ant-layout-sider-children')[0] &&
    //   document.getElementsByClassName('ant-layout-sider-children')[0].offsetHeight;
    // const gbWrapper = document.getElementsByClassName('ant-layout-sider-children')[0];
    // const smallBox = document.getElementById('smallBox');
    // const bigBox = document.getElementById('bigBox');
    // const bigImg = document.getElementById('bigImg');
    // const span = document.getElementById('span');
    // const productInfo = document.getElementById('info-right');
    // const size = smallBox.offsetWidth - 2;

    // const size2 = 960;
    // bigBox.style.display = 'block';
    // productInfo.style.display = 'none';
    // const _event = e || window.event;

    // const scrollTop =
    //   (gbWrapper && gbWrapper.scrollTop) ||
    //   document.body.scrollTop ||
    //   document.documentElement.scrollTop;
    // const scrollLeft =
    //   (gbWrapper && gbWrapper.scrollLeft) ||
    //   document.body.scrollLeft ||
    //   document.documentElement.scrollLeft;
    // let left = _event.clientX - fixWidth - (smallBox.offsetLeft - scrollLeft) - size / 4;
    // let top = _event.clientY - fixHeight - (smallBox.offsetTop - scrollTop) - size / 4;

    // if (left <= 0) {
    //   left = 0;
    // }
    // if (top <= 0) {
    //   top = 0;
    // }
    // if (left >= size / 2) {
    //   left = size / 2;
    // }
    // if (top >= size / 2) {
    //   top = size / 2;
    // }

    // span.style.left = `${left}px`;
    // span.style.top = `${top}px`;

    // const x = (left / size) * size2;
    // const y = (top / size) * size2;

    // bigImg.style.left = `${-x}px`;
    // bigImg.style.top = `${-y}px`;
  }

  @Bind()
  onMouseOut() {
    const bigBox = document.getElementById('bigBox');
    const productInfo = document.getElementById('info-right');
    bigBox.style.display = 'none';
    productInfo.style.display = 'block';
  }

  // @Bind()
  // add() {
  //   const { skuProductId, isShow } = this.state;
  //   if (!isShow && skuProductId) {
  //     const num = Number(this.state.quantity) + 1;
  //     this.saleQuery(num > MaxProductNumber ? MaxProductNumber : num);
  //   }
  // }

  // @Bind()
  // minus() {
  //   if (this.state.skuProductId) {
  //     const num = Number(this.state.quantity) - 1;
  //     if (num > 0) {
  //       this.saleQuery(num);
  //     }
  //   }
  // }

  @Bind()
  changeVal(e) {
    const val = e.target.value;
    if (val >= this.state.miniOrderQuantity) {
      if (!isNaN(val) && val > 0) {
        this.saleQuery(Number(val) > MaxProductNumber ? MaxProductNumber : Number(val));
      } else if (val === '') {
        this.setState({ quantity: '' });
      }
    }
  }

  @Bind()
  checkVal(e) {
    const val = e.target.value;
    if (val === '') {
      this.setState({ quantity: 1 });
    }
  }

  @Bind()
  saleQuery(num) {
    this.setState({ quantity: num });
    const { attrsMap, attrs } = this.state;
    if (attrs.length > 0) {
      this.getproductStock(attrsMap, num);
    } else {
      this.stockQuery(num);
    }
  }

  // @Bind()
  // setProductNotAllow(attrId) {
  //     const {attrs, attrQualityMap} = this.state;
  //     attrs.map(item => {
  //         if (item.attributeId !== attrId) {
  //             item.values.map(v => {
  //                 attrQualityMap[v.valeuId] = {saleQuantity: 0};
  //             });
  //         }
  //     });
  //     this.setState({attrQualityMap});
  // }

  @Bind()
  getProductDetail() {
    const {
      htmlList: { introduction = '' },
    } = this.state;
    return { __html: introduction };
  }

  // @Bind()
  // getProductImgs() {
  //     const imgs = [];
  //     const {productDetailUrl} = this.state.productInfo;
  //     if (productDetailUrl) {
  //         productDetailUrl.array.forEach((item, i) => {
  //             imgs.push(
  //               <Image key={item.productImageId} width="100%" value={item} style={{verticalAlign: 'top'}} />
  //             );
  //         });
  //     }
  //     return imgs;
  // }

  @Bind()
  checkAttrs(attrsMap) {
    for (const attrId in attrsMap) {
      if (attrsMap[attrId] === '') {
        this.setState({ attrNotice: true });
        return false;
      }
    }
    this.setState({ attrNotice: false });
    return true;
  }

  @Bind()
  changeImgUrl(url) {
    this.setState({ selectImg: url });
  }

  @Bind()
  checkFlashSaleInfo() {
    const { flashSaleProductsList, attrsMap } = this.state;
    let cnt = 0;
    let find = false;
    if (flashSaleProductsList) {
      flashSaleProductsList.forEach(sku => {
        const { attributes } = sku;
        for (let i = 0; !find && i < attributes.length; i++) {
          const { attributeId, values } = attributes[i];
          if (values[0].valeuId === attrsMap[attributeId][0]) {
            cnt++;
          }
        }
        if (cnt === attributes.length) {
          find = true;
          this.setState({ flashSaleSkuPojo: sku });
        }
      });
    }
    if (!find) {
      this.setState({ flashSaleSkuPojo: [] });
    }
  }

  @Bind()
  selectAttr(attrId, item) {
    const { attrsMap, quantity, attrNotice, attrs, attrQualityMap, flashSaleSkuPojo } = this.state;
    const valueId = item.valeuId;
    const value = item.valeu;
    if (item.imagePath) {
      this.setState({ selectImg: item.imagePath });
    }
    if (valueId === attrsMap[attrId][0] && !flashSaleSkuPojo) {
      attrsMap[attrId] = '';
      this.setState({
        attrsMap,
        quantity: 1,
      });
      let flag = true;
      for (const i in attrsMap) {
        if (attrsMap[i]) {
          attrs.forEach(o => {
            if (o.attributeId !== attrId) {
              o.values.forEach(vId => {
                attrQualityMap[vId.valeuId] = null;
              });
            }
          });
          this.setState({ attrQualityMap });
          flag = false;
        }
      }
      if (flag) {
        this.setState({ attrQualityMap: {} });
      }
    } else {
      attrsMap[attrId] = [valueId, value];
      this.setState({
        attrsMap,
        quantity: 1,
      });
      if (attrNotice) {
        this.checkAttrs(attrsMap);
      }
      if (attrs.length === 1) {
        this.getproductStock(attrsMap, 1);
      }
      if (attrQualityMap[valueId] && attrQualityMap[valueId].productId) {
        this.setStock(
          Number(attrQualityMap[valueId].saleQuantity),
          Number(attrQualityMap[valueId].saveQuantity),
          quantity
        );
      }
    }
    this.checkFlashSaleInfo();
  }

  @Bind()
  setStock(saleQuantity, num) {
    if (num > Number(saleQuantity)) {
      this.setState({
        quantity: saleQuantity,
      });
    }
  }

  @Bind()
  closeAttrNotice() {
    this.setState({ attrNotice: false });
  }

  @Bind()
  showAttr(attr) {
    const values = attr;
    const { attrsMap, attrQualityMap } = this.state;
    const arr = [];
    if (values) {
      values.forEach(item => {
        let b;
        if (attrQualityMap[item.productImageId]) {
          b = Number(attrQualityMap[item.productImageId].saleQuantity) !== 0;
        } else {
          b = true;
        }
        arr.push(
          <div
            id="size1"
            key={item.productImageId}
            onClick={() => {
              if (b) {
                this.selectAttr(attr.productImageId, item);
              }
            }}
            className="left"
          >
            {item.mediaUrl ? (
              <div className="color-img-box">
                <Image
                  title={item.imagePath}
                  value={item.imagePath}
                  width={46}
                  height={46}
                  className={
                    b
                      ? attrsMap[attr.productImageId] === item.productImageId
                        ? 'p-every-img2'
                        : 'p-every-img'
                      : 'p-every-img3'
                  }
                />
                <div className={b ? 'hidden' : 'not-allow-img'} />
              </div>
            ) : (
              <div
                className={
                  b
                    ? attrsMap[attr.productImageId] === item.productImageId
                      ? 'p-every-size2'
                      : 'p-every-size'
                    : 'p-every-size3'
                }
              >
                {item.valeu}
              </div>
            )}

            <div
              className={
                attrsMap[attr.productImageId] === item.productImageId ? 'select-icon2' : ''
              }
            />
          </div>
        );
      });
    }
    return arr;
  }

  @Bind()
  showDetailImgs() {
    const arr = [];
    const { selectImg, productImageList = [], sourceFrom } = this.state;

    if (productImageList && productImageList.length > 0) {
      productImageList.forEach(detailImg => {
        arr.push(
          <div
            className="swiper-slide"
            key={detailImg.productImageId || detailImg.ecProductImageId}
            onFocus={() => {
              this.changeImgUrl(detailImg.imagePath);
            }}
            onMouseOver={() => {
              this.changeImgUrl(detailImg.imagePath);
            }}
          >
            <Image
              className={
                selectImg === detailImg.imagePath ? 'small-img small-img-box' : 'small-img'
              }
              value={
                sourceFrom === 'CATA' ? detailImg.imagePath : jdConvertImg(detailImg.imagePath, 4)
              }
              width={80}
              height={80}
            />
          </div>
        );
      });
    }
    return arr;
  }

  @Bind()
  showAttrs() {
    const { arr = [] } = this.state;
    const { productImageList = [] } = this.state;
    if (productImageList) {
      productImageList.forEach(item => {
        arr.push(
          <li key={item.productImageId} className="p-size">
            <div className="p-label2">{item.imagePath}</div>
            <div className="p-sizes">{this.showAttr(productImageList)}</div>
          </li>
        );
      });
      return arr;
    }
  }

  @Bind()
  handleMouseEnter() {}

  @Bind()
  handleMouseLeave() {
    setTimeout(
      () => {
        this.close();
      },
      1000,
      this
    );
  }

  @Bind()
  close() {}

  // @Bind()
  // showPanel(value, id1, id2) {
  //   const panel1 = document.getElementById(id1);
  //   const panel2 = document.getElementById(id2);
  //   panel1.style.display = 'block';
  //   panel2.style.display = 'none';

  //   const prev = document.getElementsByClassName('d-active')[0];
  //   prev.classList.remove('d-active');
  //   document.getElementById(value).classList.add('d-active');
  // }

  @Bind()
  getParams() {
    // const { parametersDisplay } = this.state.productInfo;
    // // let lineNum = 3;
    // if (parametersDisplay) {
    //   parametersDisplay(item => {
    //     if (item.displayType === 'pc') {
    //       lineNum = item.lineNumber;
    //     }
    //   });
    // }
    // const width = `${(100 / lineNum).toFixed(2)}%`;
    // const { sourceFrom } = this.state;
    // if (sourceFrom === 'CATA') {
    //   return (
    //     parameters &&
    //     parameters.map(item => {
    //       return (
    //         <div key={item.paraId} className="parameters-item" style={{ width }}>
    //           {item.paraName}：{item.paraValue}
    //         </div>
    //       );
    //     })
    //   );
    // } else {
    const { htmlList } = this.state;
    const detail = htmlList || {};
    return { __html: detail.specificationsParam };
    // }
  }

  @Bind()
  changeActivePanel(flag) {
    this.setState({
      activeDetailPanel: flag,
    });
  }

  render() {
    const { productImageList = [], is7ToReturn } = this.state;
    const { baseInfoList = {}, selectImg, sourceFrom, activeDetailPanel } = this.state;
    const imageProPath = productImageList.length > 0 ? productImageList[0].imagePath : '';
    const isCATA = sourceFrom === 'CATA';
    const sourceFromCatePro = sourceFrom === 'CATA' ? selectImg : jdConvertImg(selectImg, 1); // 目录化商品
    const {
      productName: cataProductName, // 目录化商品商品名
      productNum: cataProductNum, // 目录化商品编码
      primaryUomName, // 单位名称
      minPurchaseQuantity, // 最小采购量
      ecProduct,
    } = baseInfoList;
    const {
      ecProductName, // 电商商品名
      ecProductNum, // 电商商品编码
      jdPrice, // 京东价格
      agreementPrice, // 协议价
    } = ecProduct || {};
    const name = ecProductName || cataProductName;
    const productNum = ecProductNum || cataProductNum;
    // 商品品牌
    const brand = baseInfoList.brand || (ecProduct || {}).brand;
    // 供应商名称
    const supplierName = baseInfoList.supplierName || (ecProduct || {}).supplierName;
    // 商品单位
    const wareQd = baseInfoList.wareQd || (ecProduct || {}).wareQd;
    // 框架协议编号
    const frameAgreementNum = baseInfoList.frameAgreementNum || (ecProduct || {}).frameAgreementNum;
    // 含税价
    const taxPrice = baseInfoList.taxPrice || (ecProduct || {}).taxPrice;

    if (name) {
      document.title = name;
    }

    const symbol = '￥';
    return (
      <React.Fragment>
        <Header title={intl.get('scec.common.view.previewGoods').d('商品预览')} />
        <Content>
          <Spin spinning={this.props.productPreviewLoading}>
            <div className={styles['preview-info']}>
              <div className="productDetail-page">
                <div className="product-detail">
                  <div className="product-detail-info">
                    <div className="detail-images-wrapper">
                      <div className="detail-images-prev" />
                      <div id="detail-images" className="swiper-container swiper imageSwiper">
                        <div className="product-detail-imgs swiper-wrapper">
                          {this.showDetailImgs()}
                        </div>
                      </div>
                      <div className="detail-images-next" />
                    </div>
                    <div className="info-left">
                      <div
                        id="smallBox"
                        className="main-img-box"
                        onMouseOut={() => this.onMouseOut()}
                        onBlur={() => this.onMouseOut()}
                        onMouseMove={e => this.onMouseMove(e)}
                      >
                        <Image
                          className="main-img"
                          width="100%"
                          height="100%"
                          value={sourceFromCatePro || imageProPath}
                        />
                        <span id="span" />
                      </div>
                    </div>
                    <div id="bigBox" className="big-img-Box">
                      <Image
                        width={960}
                        height={960}
                        id="bigImg"
                        value={sourceFromCatePro || imageProPath}
                      />
                    </div>
                    <div className="info-right" id="info-right">
                      <ul>
                        <li className="product-title">
                          <p className="p-name" title={name}>
                            {name}
                            {!isCATA && (
                              <span className="platform-jd">
                                {intl
                                  .get('scec.goodsPreview.model.goodsPreview.platformJd')
                                  .d('京东供应')}
                              </span>
                            )}
                          </p>
                        </li>
                        <li className="product-meta data-num">
                          <ul>
                            <li>
                              <span className="meta-label">
                                {intl
                                  .get('scec.goodsPreview.model.goodsPreview.productNum')
                                  .d('商品编码')}
                                :
                              </span>
                              {productNum}
                            </li>
                            <li>
                              <span className="meta-label">
                                {intl.get('scec.goodsPreview.model.goodsPreview.brand').d('品牌')}:
                              </span>
                              <span title={brand}>{brand}</span>
                            </li>
                            <li>
                              <span className="meta-label">
                                {intl
                                  .get('scec.goodsPreview.model.goodsPreview.supplier')
                                  .d('供应商')}
                                :{' '}
                              </span>
                              <span title={supplierName}>{supplierName}</span>
                            </li>
                            {frameAgreementNum && (
                              <li>
                                <span className="meta-label">
                                  {intl
                                    .get('scec.goodsPreview.model.goodsPreview.frameAgreementNum')
                                    .d('框架协议编号')}
                                  :{' '}
                                </span>
                                <span title={frameAgreementNum}>{frameAgreementNum}</span>
                              </li>
                            )}
                          </ul>
                        </li>
                        <li
                          className="product-attr product-price-attr"
                          style={{
                            marginTop: 16,
                            paddingLeft: 0,
                          }}
                        >
                          {!isCATA && (
                            <div className="jd-price-label">
                              {intl
                                .get('scec.goodsPreview.model.goodsPreview.platformCompany')
                                .d('企业专享')}
                            </div>
                          )}
                          <div className="p-content" style={{ marginLeft: isCATA ? 0 : 24 }}>
                            <span className="product-price">
                              {symbol}
                              {numberRender(agreementPrice || jdPrice || taxPrice, 2, false)}
                            </span>
                            {!isCATA && (
                              <span className="product-jd-price">
                                {symbol}
                                {numberRender(agreementPrice || jdPrice || taxPrice, 2, false)}
                              </span>
                            )}
                          </div>
                        </li>
                        {/* <li className="p-counter">
                        <div className="p-label">数量</div>
                        <Count />
                        <div className="p-size">
                          <div>单位:</div>
                          <div>{baseInfoList.primaryUomId}</div>
                        </div>
                      </li> */}
                        <div id="selectAttrs-box">
                          {/* {this.showAttrs()} */}
                          <li className="product-attr">
                            <div className="p-label p-label-required">
                              {intl.get('scec.common.model.organizaiton').d('库存组织')}
                            </div>
                            <div className="p-content">
                              <div className="h-lov" style={{ height: 'auto' }}>
                                <a className="lov-link">
                                  {intl.get('scec.goodsPreview.button.goodsPreview.edit').d('修改')}
                                </a>
                              </div>
                            </div>
                          </li>
                          <li className="product-attr">
                            <div className="p-label p-label-required">
                              {intl.get('scec.goodsPreview.model.goodsPreview.address').d('地址')}
                            </div>
                            <div className="p-content">
                              <div className="h-lov" style={{ height: 'auto' }}>
                                <a className="lov-link">
                                  {intl.get('scec.goodsPreview.button.goodsPreview.edit').d('修改')}
                                </a>
                              </div>
                            </div>
                          </li>
                          <li className="product-attr">
                            <div className="p-label p-label-required">
                              {intl
                                .get('scec.goodsPreview.model.goodsPreview.purchase')
                                .d('采购组织')}
                            </div>
                            <div className="p-content">
                              <div className="h-lov" style={{ height: 'auto' }}>
                                <a className="lov-link">
                                  {intl.get('scec.goodsPreview.button.goodsPreview.edit').d('修改')}
                                </a>
                              </div>
                            </div>
                          </li>
                          <li className="product-attr">
                            <div className="p-label">
                              {intl.get('scec.common.model.uomName').d('单位')}
                            </div>
                            <div className="p-content">{wareQd || primaryUomName}</div>
                          </li>
                          <li className="product-attr" style={{ marginTop: '16px' }}>
                            <div className="p-label">
                              {intl.get('scec.goodsPreview.model.goodsPreview.count').d('数量')}
                            </div>
                            <div className="p-content">
                              <Count />
                              <span className="product-ware">
                                {/* <span className="ware-label">单位: </span> */}
                                {minPurchaseQuantity && (
                                  <span className="product-ware">
                                    <span className="ware-label">
                                      {intl
                                        .get(
                                          'scec.goodsPreview.model.goodsPreview.minPurchaseQuantity'
                                        )
                                        .d('最小采购量')}{' '}
                                    </span>
                                    {minPurchaseQuantity}
                                  </span>
                                )}
                              </span>
                            </div>
                          </li>
                          <li className="stock">
                            <div className="buttons">
                              <div className="h-spin product-add-spin">
                                <button type="button" id="product-add" className="product-add">
                                  {intl
                                    .get('scec.goodsPreview.model.goodsPreview.addCarts')
                                    .d('加入购物车')}
                                </button>
                              </div>
                            </div>
                            <div className="product-service">
                              {!!is7ToReturn &&
                                intl
                                  .get('scec.goodsPreview.view.goodsPreview.goodsWarning')
                                  .d('温馨提示：该商品支持 7 天无理由退货')}
                            </div>
                          </li>
                          {/* <li>
                          <Image
                            value={selectGoodsInfo}
                            width={420}
                            style={{ marginLeft: '-3px' }}
                          />
                        </li> */}
                        </div>
                      </ul>
                    </div>
                    <div className="clear-both" />
                  </div>
                  <div className="p-container">
                    <div className="p-detial">
                      <div id="detail-head" className="p-detail-head">
                        <div
                          id="t1"
                          className={`brand-title1${activeDetailPanel ? ' d-active' : ''}`}
                          onClick={() => this.changeActivePanel(true)}
                        >
                          {intl
                            .get('scec.goodsPreview.model.goodsPreview.goodsInstroduction')
                            .d('商品介绍')}
                        </div>
                        <div
                          id="t2"
                          className={`brand-title1${!activeDetailPanel ? ' d-active' : ''}`}
                          onClick={() => this.changeActivePanel(false)}
                        >
                          {intl
                            .get('scec.goodsPreview.model.goodsPreview.goodsSpecification')
                            .d('规格参数')}
                        </div>
                      </div>
                      <div id="content1" className="p-detail-img">
                        {activeDetailPanel ? (
                          <div dangerouslySetInnerHTML={this.getProductDetail()} />
                        ) : (
                          <div
                            className="parameters-box"
                            dangerouslySetInnerHTML={this.getParams()}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
