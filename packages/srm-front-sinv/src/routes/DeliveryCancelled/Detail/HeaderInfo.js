/*
 * HeaderInfo - 送货单明细头信息
 * @date: 2018-12-06 14:25:03
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { FORM_COL_2_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { showBigNumber } from '@/routes/components/utils';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends PureComponent {
  render() {
    // const { loading } = this.props;
    const { detailHeaderInfo = {}, customizeForm, form } = this.props;
    const {
      asnNum,
      asnTypeCodeMeaning,
      supplierCompanyName,
      immedShippedFlag,
      supplierSiteName,
      shipDate,
      expectedArriveDate,
      remark,
      asnTypeCode,
      transportTypeMeaning,
      totalQuantity,
    } = detailHeaderInfo;
    return customizeForm(
      {
        code: 'SODR.DELIVERY_CANCELLED_DETAIL.DETAIL.HEADER',
        form,
        dataSource: detailHeaderInfo,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
              {...formLayout}
            >
              {form.getFieldDecorator('asnNum', { initialValue: asnNum })(<span>{asnNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
              {...formLayout}
            >
              {form.getFieldDecorator('asnTypeCode', { initialValue: asnTypeCode })(
                <span>{asnTypeCodeMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.supplier.tag`).d('供应商')} {...formLayout}>
              {form.getFieldDecorator('supplierCompanyName', { initialValue: supplierCompanyName })(
                <span>{supplierCompanyName}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发')}
              {...formLayout}
            >
              {form.getFieldDecorator('immedShippedFlag', { initialValue: immedShippedFlag })(
                <span>{yesOrNoRender(immedShippedFlag)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipAddress`).d('发货地点')}
              {...formLayout}
            >
              {form.getFieldDecorator('supplierSiteName', { initialValue: supplierSiteName })(
                <span>{supplierSiteName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipDate`).d('发货日期')}
              {...formLayout}
            >
              {form.getFieldDecorator('shipDate', { initialValue: shipDate })(
                <span>{dateRender(shipDate)}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间')}
              {...formLayout}
            >
              {form.getFieldDecorator('expectedArriveDate', { initialValue: expectedArriveDate })(
                <span>{dateTimeRender(expectedArriveDate)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.shipmentsTotalQuantity`).d('发货总数')}
              {...formLayout}
            >
              {form.getFieldDecorator('totalQuantity', { initialValue: totalQuantity })(
                <span>{showBigNumber(totalQuantity)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`sinv.common.model.common.transportType`).d('运输类型')}
              {...formLayout}
            >
              {form.getFieldDecorator('transportTypeMeaning', {
                initialValue: transportTypeMeaning,
              })(<span>{transportTypeMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-half-row', 'last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`sinv.common.model.common.remark`).d('备注')} {...formLayout}>
              {form.getFieldDecorator('remark', { initialValue: remark })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
