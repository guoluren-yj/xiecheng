/**
 * HeaderShipInfoForm - 送货单创建明细页面 - 明细信息Form - 发货
 * @date: 2020-11-27
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Row, Col, DatePicker } from 'hzero-ui';
// import { isNumber } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import classnames from 'classnames';
import ValueList from 'components/ValueList';
import {
  EDIT_FORM_ROW_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { showBigNumber } from '@/routes/components/utils';

import styles from '../../components/index.less';

// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
const { TextArea } = Input;
const FormItem = Form.Item;

/**
 * HeaderInfoForm - 送货单创建明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class HeaderShipInfoForm extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, dataSource = {}, customizeForm, dataSourceLoading } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    const {
      asnNum,
      asnTypeCodeMeaning,
      supplierCompanyName,
      supplierSiteName,
      remark,
      immedShippedFlag,
      expectedArriveDate,
      shipDate,
      transportType,
      transportTypeMeaning,
      totalQuantity,
      taxIncludedAmount,
      financialPrecision,
    } = dataSource;
    return customizeForm(
      {
        dataSourceLoading,
        form,
        dataSource,
        // code: 'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
        code: 'SINV.DELIVERY_CREATION_DETAIL.HEADER',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
            >
              {getFieldDecorator('asnNum', {
                initialValue: asnNum,
              })(<span>{asnNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
            >
              {getFieldDecorator('asnTypeCodeMeaning', {
                initialValue: asnTypeCodeMeaning,
              })(<span>{asnTypeCodeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.supplier.tag`).d('供应商')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: supplierCompanyName,
              })(<span>{supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发')}
            >
              {getFieldDecorator('immedShippedFlag', {
                initialValue: immedShippedFlag,
              })(<span>{yesOrNoRender(immedShippedFlag)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.shipAddress`).d('发货地点')}
            >
              {getFieldDecorator('supplierSiteName', {
                initialValue: supplierSiteName,
              })(<span>{supplierSiteName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.shipDate`).d('发货日期')}
            >
              {getFieldDecorator('shipDate', {
                initialValue: shipDate ? moment(shipDate) : moment(),
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`hzero.common.validation.notNull`, {
                        name: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
                      })
                      .d(`${intl.get(`sinv.common.model.common.shipDate`).d('发货日期')}不能为空`),
                  },
                ],
              })(
                <DatePicker
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('expectedArriveDate') &&
                    moment(getFieldValue('expectedArriveDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间')}
            >
              {getFieldDecorator('expectedArriveDate', {
                initialValue: expectedArriveDate ? moment(expectedArriveDate) : undefined,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sinv.common.model.common.expectedArriveTime`)
                          .d('预计到货时间'),
                      })
                      .d(
                        `${intl
                          .get(`sinv.common.model.common.expectedArriveTime`)
                          .d('预计到货时间')}不能为空`
                      ),
                  },
                ],
              })(
                <DatePicker
                  format={DEFAULT_DATETIME_FORMAT}
                  placeholder={null}
                  showTime
                  disabledDate={(currentDate) =>
                    getFieldValue('shipDate') &&
                    moment(getFieldValue('shipDate')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.shipmentsTotalQuantity`).d('发货总数')}
            >
              {getFieldDecorator('totalQuantity', {
                initialValue: totalQuantity,
              })(<span>{showBigNumber(totalQuantity)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.transportType`).d('运输类型')}
            >
              {getFieldDecorator('transportType', {
                initialValue: transportType,
              })(
                <ValueList
                  lovCode="SINV.ASN_TRANSPORT_TYPE"
                  textValue={transportTypeMeaning}
                  queryParams={{ organizationId: getCurrentOrganizationId() }}
                  allowClear
                  onChange={(val) => this.props.handleRules(val)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              className={styles.sinvRemark}
              label={intl.get(`sinv.common.model.common.remark`).d('备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} style={{ height: '56px' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.taxIncludedAmount`).d('汇总金额')}
            >
              {getFieldDecorator('taxIncludedAmount', {
                initialValue: taxIncludedAmount,
              })(<span>{showBigNumber(taxIncludedAmount, financialPrecision)}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
