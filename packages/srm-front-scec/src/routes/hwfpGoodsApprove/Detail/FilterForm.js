/**
 * GoodsApprove -商品审批 detail 明细
 * @date: 2019-2-7
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import { EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import intl from 'utils/intl';
import PriceModal from './priceModal';

const UEDDisplayFormItem = props => {
  const { label, value } = props;
  return (
    <Form.Item label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      <div
        title={value}
        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {value}
      </div>
    </Form.Item>
  );
};

export default class FilterForm extends Component {
  // 含税/不含税单价，显示保留小数点2-5位小数
  @Bind()
  toFixedTax(price = '') {
    if (price === null || price === '' || isNaN(price)) {
      return '';
    } else {
      const value = price.toString();
      const ind = value.indexOf('.');
      const precision = ind === -1 ? 0 : Math.abs(value.length - ind);
      if (precision > 2) {
        return Math.round(price * 100000) / 100000;
      } else {
        return price.toFixed(2);
      }
    }
  }

  /**
   * 快码转换，将英文翻译成中文
   * @param {String} params 英文
   */
  @Bind()
  changeCreateParty(params = '') {
    if (params === 'SUPPLIER') {
      return intl.get('scec.common.model.provider').d('供应方');
    } else if (params === 'PURCHASE') {
      return intl.get('scec.common.model.purchaser').d('采购方');
    }
  }

  /**
   * 渲染查询条件
   */
  @Bind()
  renderForm() {
    const { detail = {}, viewLadderPrice, productId } = this.props;
    return (
      <React.Fragment>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.productNum').d('商品编码')}
              value={detail.productNum || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.productName').d('商品名称')}
              value={detail.productName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.productStatus').d('状态')}
              value={detail.productStatusMeaning || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.goodsApprove.model.goodsApprove.companyName').d('创建公司')}
              value={detail.companyName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.supplier').d('供应商')}
              value={detail.supplierName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.catalogName').d('目录名称')}
              value={detail.catalogName || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.sourceFromType').d('数据来源')}
              value={detail.sourceFromTypeMeaning || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.sourceFromNum').d('来源单号')}
              value={detail.sourceFromNum || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.createdParty').d('创建方')}
              value={this.changeCreateParty(detail.createdParty) || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.creationDate').d('创建日期')}
              value={detail.creationDate || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.effectiveDateFrom').d('有效期从')}
              value={detail.effectiveDateFrom || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.effectiveDateTo').d('有效期至')}
              value={detail.effectiveDateTo || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {detail.taxIncloudedFlag ? (
            <Col span={8}>
              <UEDDisplayFormItem
                label={intl.get('scec.common.model.taxPrice').d('含税单价')}
                value={this.toFixedTax(detail.taxPrice) || ''}
              />
            </Col>
          ) : (
            <Col span={8}>
              <UEDDisplayFormItem
                label={intl.get('scec.common.model.netPrice').d('不含税单价')}
                value={this.toFixedTax(detail.netPrice) || ''}
              />
            </Col>
          )}
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.currencyName').d('币种')}
              value={detail.currencyName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.primaryUomName').d('计量单位')}
              value={detail.primaryUomName || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <Form.Item
              label={intl.get('scec.common.model.taxIncloudedFlag').d('是否含税')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {detail.taxIncloudedFlag
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否') || ''}
            </Form.Item>
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.taxCode').d('税种')}
              value={detail.taxCode || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.taxRate').d('税率')}
              value={detail.taxRate || detail.taxRate === 0 ? detail.taxRate : ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <Form.Item
              label={intl.get('scec.common.model.enableLadderPrice').d('是否启用阶梯价格')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {detail.ladderFlag === 1
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否') || ''}
              {detail.ladderFlag && detail.ladderFlag === 1 ? (
                <a style={{ float: 'right' }} onClick={() => viewLadderPrice(productId)}>
                  {intl.get('scec.common.model.ladderPrice').d('阶梯价格')}
                </a>
              ) : (
                ''
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.specifications').d('规格')}
              value={detail.specifications || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.shelfLife').d('质保期')}
              value={detail.shelfLife || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.createdUserName').d('创建人')}
              value={detail.createdUserName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.minPurchaseQuantity').d('最小购买量')}
              value={detail.minPurchaseQuantity || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.brand').d('品牌')}
              value={detail.brand || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.common.model.frameAgreementNum').d('框架协议编号')}
              value={detail.frameAgreementNum || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
          <Col span={12}>
            <Form.Item
              label={intl.get('scec.common.model.remark').d('商品说明')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {(detail.productDetail && detail.productDetail.remark) || ''}
            </Form.Item>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const { productId, visible, hideModal, ladderPriceData = [] } = this.props;
    const ladderPriceModalProps = {
      productId,
      visible,
      hideModal,
      ladderPriceData,
    };
    return (
      <div className="table-list-search">
        {this.renderForm()}
        {visible && <PriceModal {...ladderPriceModalProps} />}
      </div>
    );
  }
}
