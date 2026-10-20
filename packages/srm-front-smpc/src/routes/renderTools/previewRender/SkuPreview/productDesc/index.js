import React, { useState } from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default function ProductDesc(props) {
  const {
    productData: {
      introduction = '',
      skuAttrList = [],
      skuAttrExtendList = [],
      packingList,
      afterSale = {},
    },
  } = props;

  const {
    returnDuration = '',
    changeDuration = '',
    qualityDuration = '',
    instruction = '',
    changeSpecial = 0,
    afsSpecial = 0,
    returnSpecial = 0,
  } = afterSale;
  const [activeDetailPanel, setActiveDetailPanel] = useState(1);

  function getAttrs() {
    const attrList = [...(skuAttrList || []), ...(skuAttrExtendList || [])];
    return attrList.map((item) => {
      const { attributeName, attrValueName, description, attrName, attrValue } = item;
      return (
        <Row className="des-row">
          <Col span={4} className="des-title">
            {attributeName || attrName}:{' '}
          </Col>
          <Col span={20} className="des-content">
            {attrValueName || attrValue || description}
          </Col>
        </Row>
      );
    });
  }

  function getAfs() {
    if (afsSpecial) {
      return (
        <>
          <Row className="des-row">
            {' '}
            {intl.get('smpc.product.view.specialSaleAfter').d('特殊售后说明')}:
          </Row>
          <Row className="des-row">{instruction}</Row>
        </>
      );
    } else {
      return (
        <>
          <Row className="des-row"> {intl.get('smpc.product.view.refunds').d('退货')}:</Row>
          <Row className="des-row">
            {returnSpecial === 2
              ? intl.get('smpc.product.view.noLimitRefunds').d('该商品支持不限次数退货')
              : returnSpecial === 1
              ? intl.get('smpc.product.view.noRefunds').d('特殊商品，一经签收不予退货')
              : `${intl
                  .get('smpc.product.view.confirmReceipt')
                  .d('确认收货后')}${returnDuration}${intl
                  .get('smpc.product.view.applyRefunds')
                  .d('日内出现质量问题可申请退货')}`}
          </Row>
          <Row className="des-row"> {intl.get('smpc.product.view.exchange').d('换货')}:</Row>
          <Row className="des-row">
            {changeSpecial === 2
              ? intl.get('smpc.product.view.noLimitExchange').d('该商品支持不限次数换货')
              : changeSpecial === 1
              ? intl.get('smpc.product.view.noExchange').d('特殊商品，一经签收不予换货')
              : `${intl
                  .get('smpc.product.view.confirmReceipt')
                  .d('确认收货后')}${changeDuration}${intl
                  .get('smpc.product.view.applyExchange')
                  .d('日内出现质量问题可申请换货')}`}
          </Row>
          <Row className="des-row"> {intl.get('smpc.product.view.warranty').d('质保')}:</Row>
          <Row className="des-row">
            {intl.get('smpc.product.view.warrantyPeriod').d('质保限期')}
            {qualityDuration}
            {intl.get('smpc.product.view.period').d('个月')}
          </Row>
          <Row className="des-row">
            {intl
              .get('smpc.product.view.warrantyDescription')
              .d(
                '如有任何售后问题请尽量在质保期内联系卖家协商处理，超过质保期卖家不保证受理，请知悉！'
              )}
            !
          </Row>
        </>
      );
    }
  }

  function getPackList(packListArray) {
    return packListArray.map((item) => {
      return (
        <Row className="des-row">
          <Col span={3} className="des-title">
            {item.split(',')[0]}:{' '}
          </Col>
          <Col span={21} className="des-content">
            {item.split(',')[1]}
          </Col>
        </Row>
      );
    });
  }

  const packListArray = packingList ? packingList.split(';') : [];

  return (
    <div className={styles['product-desc-content']}>
      <div className="p-container">
        <div className="p-detial">
          <div id="detail-head" className="p-detail-head">
            {/* <div className="brand-title1">商品详情</div> */}
            <div
              id="t1"
              className={`brand-title1${activeDetailPanel === 1 ? ' d-active' : ''}`}
              onClick={() => setActiveDetailPanel(1)}
            >
              {intl.get(`smpc.product.model.productDesc`).d('商品介绍')}
            </div>
            <div
              id="t2"
              className={`brand-title1${activeDetailPanel === 2 ? ' d-active' : ''}`}
              onClick={() => setActiveDetailPanel(2)}
            >
              {intl.get(`smpc.product.model.specifications`).d('规格参数')}
            </div>
            <div
              id="t4"
              className={`brand-title1${activeDetailPanel === 4 ? ' d-active' : ''}`}
              onClick={() => setActiveDetailPanel(4)}
            >
              {intl.get(`smpc.product.model.packList`).d('包装清单')}
            </div>
            <div
              id="t5"
              className={`brand-title1${activeDetailPanel === 5 ? ' d-active' : ''}`}
              onClick={() => setActiveDetailPanel(5)}
            >
              {intl.get(`smpc.product.model.afterSale`).d('售后服务')}
            </div>
            <div
              id="t3"
              className={`brand-title1${activeDetailPanel === 3 ? ' d-active' : ''}`}
              onClick={() => setActiveDetailPanel(3)}
            >
              {intl.get(`smpc.product.model.productComment`).d('商品评价')}
            </div>
          </div>
          <div id="content1" className="p-detail-img">
            {activeDetailPanel === 1 ? (
              introduction === null || introduction === undefined || introduction === '' ? (
                <div className="no-params">
                  <p>{intl.get(`smpc.product.model.noData`).d('暂无数据')}</p>
                </div>
              ) : (
                <div
                  style={{ minHeight: 243, overflow: 'auto' }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: introduction }}
                />
              )
            ) : activeDetailPanel === 2 ? (
              skuAttrList.length > 0 ? (
                <div style={{ minHeight: 243 }} className="parameters-box">
                  {getAttrs()}
                </div>
              ) : (
                <div className="no-params">
                  <p>{intl.get(`smpc.product.model.noData`).d('暂无数据')}</p>
                </div>
              )
            ) : activeDetailPanel === 3 ? (
              <div className="no-params">
                <p>{intl.get(`smpc.product.model.noData`).d('暂无数据')}</p>
              </div>
            ) : activeDetailPanel === 4 ? (
              packListArray.length > 0 ? (
                getPackList(packListArray)
              ) : (
                <div className="no-params">
                  <p>{intl.get(`smpc.product.model.noData`).d('暂无数据')}</p>
                </div>
              )
            ) : activeDetailPanel === 5 ? (
              getAfs()
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
