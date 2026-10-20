/*
 * DeliveryHeader - 送货单明细头信息
 * @date: 2018/11/14 14:29:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { showBigNumber } from '@/routes/components/utils';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
export default class DeliveryHeader extends PureComponent {
  render() {
    const { dataSource, form, customizeForm } = this.props;
    const {
      asnNum,
      asnTypeCode,
      transportType,
      asnTypeCodeMeaning,
      supplierCompanyName,
      shipDate,
      expectedArriveDate,
      supplierSiteName,
      immedShippedFlag,
      remark,
      buyerRemark,
      transportTypeMeaning,
      totalQuantity,
    } = dataSource;
    return customizeForm(
      { code: 'SINV.PURCHASER_DELIVERY.DETAIL.HEADER', form, dataSource },
      <Form className={styles['information-item']}>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
              {...formLayout}
            >
              {form.getFieldDecorator('asnNum', {
                initialValue: asnNum,
              })(<span>{asnNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.purchaserDelivery.asnTypeCode`).d('送货单类型')}
              {...formLayout}
            >
              {form.getFieldDecorator('asnTypeCode', {
                initialValue: asnTypeCode,
              })(<span>{asnTypeCodeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`entity.supplier.tag`).d('供应商')} {...formLayout}>
              {form.getFieldDecorator('supplierCompanyName', {
                initialValue: supplierCompanyName,
              })(<span>{supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发')}
              {...formLayout}
            >
              {form.getFieldDecorator('immedShippedFlag', {
                initialValue: immedShippedFlag,
              })(
                <span>
                  {immedShippedFlag === 1
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipAddress`).d('发货地点')}
              {...formLayout}
            >
              {form.getFieldDecorator('supplierSiteName', {
                initialValue: supplierSiteName,
              })(<span>{supplierSiteName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipDate`).d('发货日期')}
              {...formLayout}
            >
              {form.getFieldDecorator('shipDate', {
                initialValue: shipDate,
              })(<span>{dateRender(shipDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="item-rows" gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间')}
              {...formLayout}
            >
              {form.getFieldDecorator('expectedArriveDate', {
                initialValue: expectedArriveDate,
              })(<span>{dateTimeRender(expectedArriveDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipmentsTotalQuantity`).d('发货总数')}
              {...formLayout}
            >
              {form.getFieldDecorator('totalQuantity', {
                initialValue: totalQuantity,
              })(<span>{showBigNumber(totalQuantity)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`sinv.common.model.common.transportType`).d('运输类型')}
              {...formLayout}
            >
              {form.getFieldDecorator('transportType', {
                initialValue: transportType,
              })(<span>{transportTypeMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="read-half-row last-form-item" gutter={48}>
          <Col span={12}>
            <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
              {form.getFieldDecorator('remark', {
                initialValue: remark,
              })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="item-rows" gutter={48}>
          <Col span={12}>
            <FormItem label={intl.get('hzero.common.buyerRemark').d('采购方备注')}>
              {form.getFieldDecorator('buyerRemark', {
                initialValue: buyerRemark,
                rules: [
                  {
                    max: 480,
                    message: intl.get(`hzero.common.validation.max`, { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} className={styles['textarea-bottom']} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
