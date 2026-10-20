/*
 * HeaderInfo - 送货单审批详情头信息
 * @date: 2018-12-05 10:33:12
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Input, Collapse, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import intl from 'utils/intl';

import {
  DETAIL_DEFAULT_CLASSNAME,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { showBigNumber } from '@/routes/components/utils';

// import DisplayFormItem from '../../components/DisplayFormItem';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;

const { Panel } = Collapse;
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    collapseKeys: ['headerInfo'],
  };

  /**
   * 送货单明细折叠
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const {
      detailHeaderInfo = {},
      // interfaceLogs: { detail },
      // detail,
      // fetchDeliverOrderDetailLoading,
      form = {},
      customizeForm,
      approvedRemarkRequired,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { collapseKeys = [] } = this.state;
    const {
      remark,
      asnNum,
      asnTypeCodeMeaning,
      supplierCompanyName,
      shipDate,
      expectedArriveDate,
      immedShippedFlag,
      supplierSiteName,
      transportType,
      transportTypeMeaning,
      totalQuantity,
    } = detailHeaderInfo;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Row className="approve-header">
          <Col>
            {intl.get(`sinv.deliveryReview.model.deliveryReview.reviewRemark`).d('复审意见')}
          </Col>
        </Row>
        <Row className="approve-option">
          <Col>
            <FormItem>
              {getFieldDecorator('reviewRemark', {
                rules: [
                  {
                    max: 160,
                    message: intl
                      .get(`hzero.common.validation.max`, {
                        max: 160,
                      })
                      .d(`长度不能超过${160}个字符`),
                  },
                  {
                    required: approvedRemarkRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sinv.deliveryReview.model.deliveryReview.approveRemark`)
                        .d('审批意见'),
                    }),
                  },
                ],
              })(<TextArea rows={4} className={styles['textarea-bottom']} />)}
            </FormItem>
          </Col>
        </Row>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['headerInfo']}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>
                  {intl.get(`sinv.common.view.message.title.orderHeaderShipInfo`).d('发货信息')}
                </h3>
                <a className="expand-button">
                  {collapseKeys.includes('headerInfo')
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapseKeys.includes('headerInfo') ? 'up' : 'down'} />}
                </a>
              </Fragment>
            }
            key="headerInfo"
          >
            {customizeForm(
              {
                form,
                dataSource: detailHeaderInfo,
                code: 'SINV.DELIVERY_APPROVED_DETAIL.HEADER',
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
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.shipDate`).d('发货日期')}
                    >
                      {getFieldDecorator('shipDate', {
                        initialValue: shipDate,
                      })(<span>{dateRender(shipDate)}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.expectedArriveTime`)
                        .d('预计到货时间')}
                    >
                      {getFieldDecorator('expectedArriveDate', {
                        initialValue: expectedArriveDate,
                      })(<span>{dateTimeRender(expectedArriveDate)}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.shipmentsTotalQuantity`)
                        .d('发货总数')}
                    >
                      {getFieldDecorator('totalQuantity', {
                        initialValue: totalQuantity,
                      })(<span>{showBigNumber(totalQuantity)}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col span={8}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.transportType`).d('运输类型')}
                    >
                      {getFieldDecorator('transportType', {
                        initialValue: transportType,
                      })(<span>{transportTypeMeaning}</span>)}
                    </FormItem>
                  </Col>
                  {/* <Col span={8}>
                    <FormItem
                      label={intl.get(`sinv.common.model.common.receivingUnit`).d('第三方接收单位')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {form.getFieldDecorator('carriersCode', { initialValue: carriersCode })(
                        <span>{carriersName}</span>
                      )}
                    </FormItem>
                  </Col> */}
                </Row>
                <Row
                  {...EDIT_FORM_ROW_LAYOUT}
                  className={classnames('read-half-row', 'last-form-item')}
                >
                  <Col {...FORM_COL_2_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.remark`).d('备注')}
                    >
                      {getFieldDecorator('remark', {
                        initialValue: remark,
                      })(<span>{remark}</span>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </Panel>
        </Collapse>
      </Form>
    );
  }
}
