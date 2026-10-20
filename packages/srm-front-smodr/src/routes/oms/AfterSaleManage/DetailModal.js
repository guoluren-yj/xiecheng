import React from 'react';
import { Bind } from 'lodash-decorators';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import noProduct from '@/assets/no-product-img.png';

import { fetchSupSaleDetail } from './api';
import styles from './detailModal.less';

export default class DetailModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      loading: false,
      productInfo: [],
      saleInfo: {},
    };
  }

  componentDidMount() {
    const { afterSaleId } = this.props.record;
    this.fetchData(afterSaleId);
  }

  componentWillReceiveProps(nextProps) {
    const { afterSaleId } = nextProps.record;
    const { afterSaleId: prveAfterSaleId } = this.props.record;
    if (afterSaleId !== prveAfterSaleId) {
      this.fetchData(afterSaleId);
    }
  }

  @Bind()
  renderImgList(imgList) {
    const imgJsxList = (imgList || []).map((imag) => (
      <img style={{ width: 50, height: 50, border: '1px solid #eee' }} alt="" src={imag?.fileUrl} />
    ));
    return imgJsxList.length > 0 ? imgJsxList : '-';
  }

  @Bind()
  async fetchData(afterSaleId) {
    // const { afterSaleId } = this.props.record;
    this.setState({ loading: true });
    const res = await fetchSupSaleDetail(afterSaleId);
    this.setState({ loading: false });
    const result = getResponse(res);
    if (result) {
      const {
        afterSaleEntryList: items,
        remark,
        reason,
        // srmOrderCode,
        afterSaleTypeMeaning,
        afterSaleCode,
        afterSaleStatusMeaning,
        afterSaleStatus,
        supplierAddress,
      } = result;
      const products = (items || []).map((m) => ({
        ...m,
        remark,
        reason,
        // srmOrderCode,
        afterSaleCode,
        afterSaleTypeMeaning,
        afterSaleStatusMeaning,
        afterSaleStatus,
        supplierAddress,
      }));
      const { imageList, problemDesc } = products[0] || {};
      // this.setColumns(afterSaleStatus);
      this.setState({
        productInfo: products,
        saleInfo: { ...result, imageList, problemDesc },
      });
      // debugger;
    }
  }

  render() {
    const { productInfo = [], saleInfo = {}, loading } = this.state;
    const { receiptAddress = {}, pickUpAddress = {} } = saleInfo;
    const colorStyle = () => {
      const afterSaleStatus = productInfo?.[0]?.afterSaleStatus;
      if (['FINISH'].includes(afterSaleStatus)) {
        return {
          color: '#47B881',
          backgroundColor: 'rgba(71,184,129,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        }; // 绿
      } else if (
        ['APPROVING', 'WAIT_PROCESS', 'WAIT_SENT', 'WAIT_CONFIRM'].includes(afterSaleStatus)
      ) {
        return {
          color: '#F88D10',
          backgroundColor: 'rgba(252,160,0,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        }; // 黄
      } else if (['CANCELED'].includes(afterSaleStatus)) {
        return {
          color: 'rgba(0,0,0,0.65)',
          backgroundColor: 'rgba(0,0,0,0.06)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        }; // 灰
      } else {
        return {
          color: '#F56349',
          backgroundColor: 'rgba(245,99,73,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        }; // 红
      }
    };
    return (
      <Spin spinning={loading}>
        <div className={styles['detail-content']}>
          <div className="app-info">
            {intl.get('smodr.afterSaleManage.view.detail.requestTitle').d('申请单信息')}
          </div>
          <div className="info-flex">
            <div className="info-content">
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.afterSaleNumber').d('申请单号')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.afterSaleCode}</div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.malSrmNum').d('采购订单号')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.srmOrderCode}</div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.productName').d('商品名称')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.skuName}</div>
              </div>
              <div className="info-label" style={{ marginBottom: '32px' }}>
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.afterSaleTypeMeaning}</div>
              </div>
            </div>
            <div className="info-content">
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.mallPoNumber').d('商城订单编码')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.orderCode}</div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.productNum').d('商品编码')}
                </div>
                <div className="weight-tag">{productInfo?.[0]?.skuCode}</div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.quantity').d('数量')}
                </div>
                <div className="weight-tag">
                  {productInfo?.[0]?.realityQuantity || productInfo?.[0]?.applyQuantity}
                </div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.model.manageStatusName').d('售后状态')}
                </div>
                <div className="weight-tag" style={colorStyle()}>
                  {productInfo?.[0]?.afterSaleStatusMeaning}
                </div>
              </div>
            </div>
            <div className="info-content">
              <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                {intl.get('smodr.afterSaleManage.model.skuPic').d('商品图片')}
              </div>
              <img
                style={{ width: 100, height: 100 }}
                src={productInfo?.[0]?.productImagePath || noProduct}
                alt=""
              />
            </div>
          </div>
          <div className="app-info">
            {intl.get('smodr.afterSaleManage.view.detail.requestExplain').d('申请单说明')}
          </div>
          <div className="info-flex">
            <div className="info-content">
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.view.detail.fanjian').d('返件方式')}
                </div>
                <div className="weight-tag">{saleInfo?.pickWareTypeMeaning || '-'}</div>
              </div>
            </div>
            <div className="info-content">
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.view.detail.reason').d('售后原因')}
                </div>
                <div className="weight-tag">
                  {saleInfo?.returnReasonMeaning || saleInfo?.exchangeReasonMeaning || '-'}
                </div>
              </div>
            </div>
          </div>
          {productInfo?.[0]?.afterSaleStatus === 'REJECT' && (
            <div className="info-label">
              <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                {intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因')}
              </div>
              <div className="weight-tag">{saleInfo.remark || '-'}</div>
            </div>
          )}
          {productInfo?.[0]?.afterSaleStatus === 'PRODUCT_REJECT' && (
            <div className="info-label">
              <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                {intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因')}
              </div>
              <div className="weight-tag">{saleInfo.remark || '-'}</div>
            </div>
          )}
          <div className="info-label">
            <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
              {intl.get('smodr.afterSaleManage.view.detail.problem').d('问题描述')}
            </div>
            <div className="weight-tag">{saleInfo.reason || '-'}</div>
          </div>
          <div className="info-label">
            <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
              {intl.get('smodr.afterSaleManage.view.detail.personInfo').d('联系人信息')}
            </div>
            <div className="weight-tag">{receiptAddress.returnAddress || '-'}</div>
          </div>
          {saleInfo?.pickWareType === 'PICK_UP' && (
            <>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.view.detail.pickupInfo').d('上门取件地址')}
                </div>
                <div className="weight-tag">{pickUpAddress.returnAddress || '-'}</div>
              </div>
              <div className="info-label">
                <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
                  {intl.get('smodr.afterSaleManage.view.detail.pickupTime').d('预约取件时间')}
                </div>
                <div className="weight-tag">{`${saleInfo.reserveTimeBegin}-${saleInfo.reserveTimeEnd}`}</div>
              </div>
            </>
          )}
          <div className="info-label">
            <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
              {intl.get('smodr.afterSaleManage.view.detail.shouhou').d('售后图片')}
            </div>
            <div>{this.renderImgList(saleInfo.imageList || [])}</div>
          </div>
          <div className="info-label">
            <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
              {intl.get('smodr.afterSaleManage.view.detail.returnAdd').d('退货地址')}
            </div>
            <div className="weight-tag">{saleInfo?.supplierAddress?.returnAddress || '-'}</div>
          </div>
          <div className="info-label">
            <div className="label-title" style={{ color: 'rgb(0, 0, 0, 0.65)' }}>
              {intl.get('smodr.afterSaleManage.view.detail.yundan').d('运单信息')}
            </div>
            <div className="weight-tag">
              {saleInfo?.afterSaleWaybillList?.[0]?.dataSplice || '-'}
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
