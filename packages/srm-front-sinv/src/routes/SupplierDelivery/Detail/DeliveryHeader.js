/*
 * DeliveryHeader - 送货单明细头信息
 * @date: 2018/11/14 14:29:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import intl from 'utils/intl';
// import { Bind } from 'lodash-decorators';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { showBigNumber } from '@/routes/components/utils';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
// const language = getCurrentLanguage().split('_').join('-');

@Form.create({ fieldNameProp: null })
export default class DeliveryHeader extends PureComponent {
  render() {
    const { dataSource, form, customizeForm, dataSourceLoading } = this.props;
    const {
      asnNum,
      asnTypeCodeMeaning,
      supplierCompanyName,
      immedShippedFlag,
      shipDate,
      expectedArriveDate,
      remark,
      transportType,
      transportTypeMeaning,
      totalQuantity,
      supplierSiteName,
    } = dataSource;
    return customizeForm(
      {
        code: 'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER',
        form,
        dataSource,
        dataSourceLoading,
      },
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
              label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
              {...formLayout}
            >
              {form.getFieldDecorator('asnTypeCode', {
                initialValue: dataSource.asnTypeCode,
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
              {...formLayout}
              label={intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发')}
            >
              {form.getFieldDecorator('immedShippedFlag', {
                initialValue: immedShippedFlag,
              })(<span>{yesOrNoRender(immedShippedFlag)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formLayout}
              label={intl.get(`sinv.common.model.common.shipAddress`).d('发货地点')}
            >
              {form.getFieldDecorator('supplierSiteName')(<span>{supplierSiteName}</span>)}
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
              {form.getFieldDecorator('transportType', { initialValue: transportType })(
                <span>{transportTypeMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row className="read-half-row last-form-item" gutter={48}>
          <Col span={12}>
            <FormItem label={intl.get('sinv.common.model.common.remark').d('备注')} {...formLayout}>
              {form.getFieldDecorator('remark', {
                initialValue: remark,
              })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
