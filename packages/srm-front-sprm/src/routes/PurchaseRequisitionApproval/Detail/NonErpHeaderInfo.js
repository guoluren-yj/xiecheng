/*
 * NonErpHeaderInfo - 非Erp采购申请头信息
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Spin } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';

import styles from './Header.less';

const commonPrompt = 'sprm.common.model.common';

const FormItem = Form.Item;

// const oneThirdOfInputSpan = 15;

export default class NonErpHeaderInfo extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {
      collapseKeys: {},
    };
  }

  /**
   * 送货单明细折叠
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      headerInfo = {},
      loading,
      customizeForm,
    } = this.props;
    const {
      paymentMethodName,
      ouName,
      amount,
      remark,
      lotNum,
      unitName,
      // freight,
      purchaseOrgName,
      // contactTelNum,
      companyName,
      displayPrNum,
      creationDate,
      purchaseAgentName,
      title,
      createByName,
      prSourcePlatform,
      prSourcePlatformMeaning,
      // splitFreightFlag,
      requestDate,
      financialPrecision,
      originalCurrency,
      cancelledRemark,
      closedRemark,
      approvalPendingStatus,
      headerPriceHiddenFlag,
      amountMeaning,
    } = headerInfo;
    return (
      <Spin spinning={loading}>
        {customizeForm(
          {
            code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_SRM',
            dataSource: headerInfo,
            form: this.props.form,
          },
          <Form className={styles['detail-purchase-header']}>
            {approvalPendingStatus === 'CANCELLEDING' && (
              <Row className="items-row" gutter={48}>
                <Col span={24}>
                  <FormItem label={intl.get(`sprm.common.view.message.cancelReason`).d('取消原因')}>
                    {getFieldDecorator('cancelledRemark', {
                      initialValue: cancelledRemark,
                    })(<span>{cancelledRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
            )}
            {approvalPendingStatus === 'CLOSEDING' && (
              <Row className="items-row" gutter={48}>
                <Col span={24}>
                  <FormItem label={intl.get(`sprm.common.view.message.closeReason`).d('关闭原因')}>
                    {getFieldDecorator('closedRemark', {
                      initialValue: closedRemark,
                    })(<span>{closedRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row className="items-row" gutter={48}>
              <Col span={24}>
                <FormItem label={intl.get(`${commonPrompt}.title`).d('标题')}>
                  {getFieldDecorator('title', {
                    initialValue: title,
                  })(<span>{title}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="items-row" gutter={48}>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
                  {getFieldDecorator('displayPrNum', {
                    initialValue: displayPrNum,
                  })(<span>{displayPrNum}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}>
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{dateTimeRender(creationDate)}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.amount`).d('申请总额')}>
                  {getFieldDecorator('amount', {
                    initialValue: amount,
                  })(
                    <span>
                      {headerPriceHiddenFlag === 1
                        ? amountMeaning
                        : thousandBitSeparator(
                            amount,
                            financialPrecision,
                            prSourcePlatform !== 'SRM'
                          )}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row className="items-row" gutter={48}>
              <Col span={8}>
                <FormItem label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('createByName', {
                    initialValue: createByName,
                  })(<span>{createByName}</span>)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                      <FormItem label={intl.get(`${commonPrompt}.contactTelNum`).d('联系电话')}>
                        {getFieldDecorator('contactTelNum', {
                          initialValue: contactTelNum,
                        })(<span>{contactTelNum}</span>)}
                      </FormItem>
                    </Col> */}
              <Col span={8}>
                <FormItem label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyName', {
                    initialValue: companyName,
                  })(<span>{companyName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="items-row" gutter={48}>
              <Col span={8}>
                <FormItem label={intl.get(`entity.business.tag`).d('业务实体')}>
                  {getFieldDecorator('ouName', {
                    initialValue: ouName,
                  })(<span>{ouName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
                  {getFieldDecorator('purchaseOrgName', {
                    initialValue: purchaseOrgName,
                  })(<span>{purchaseOrgName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}>
                  {getFieldDecorator('purchaseAgentName', {
                    initialValue: purchaseAgentName,
                  })(<span>{purchaseAgentName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="items-row" gutter={48}>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
                  {getFieldDecorator('prSourcePlatform', {
                    initialValue: prSourcePlatformMeaning,
                  })(<span>{prSourcePlatformMeaning}</span>)}
                </FormItem>
              </Col>
              {prSourcePlatform === 'E-COMMERCE' && (
                <Col span={8}>
                  <FormItem label={intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式')}>
                    {getFieldDecorator('paymentMethodName', {
                      initialValue: paymentMethodName,
                    })(<span>{paymentMethodName}</span>)}
                  </FormItem>
                </Col>
              )}
              {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) && (
                <Col span={8}>
                  <FormItem label={intl.get(`${commonPrompt}.lotNum`).d('批次号')}>
                    {getFieldDecorator('lotNum', {
                      initialValue: lotNum,
                    })(<span>{lotNum}</span>)}
                  </FormItem>
                </Col>
              )}
              {prSourcePlatform === 'SRM' && (
                <Col span={8}>
                  <FormItem label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}>
                    {getFieldDecorator('unitName', {
                      initialValue: unitName,
                    })(<span>{unitName}</span>)}
                  </FormItem>
                </Col>
              )}
            </Row>
            {/* {prSourcePlatform === 'E-COMMERCE' && (
                    <Row className="items-row" gutter={48}>
                      <Col span={8}>
                        <FormItem label={intl.get(`${commonPrompt}.freight`).d('运费')}>
                          {getFieldDecorator('freight')(
                            splitFreightFlag === 1 ? (
                              <span>
                                <span>{numberRender(freight, 2)}</span>
                                <span>({intl.get(`${commonPrompt}.share`).d('已分摊')})</span>
                              </span>
                            ) : (
                              <span>{numberRender(freight, 2)}</span>
                            )
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  )} */}
            <Row className="items-row" gutter={48}>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.requestDate`).d('申请日期')}>
                  {getFieldDecorator('requestDate', {
                    initialValue: requestDate,
                  })(<span>{dateRender(requestDate)}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${commonPrompt}.originalCurrency`).d('原币币种')}>
                  {getFieldDecorator('originalCurrency', {
                    initialValue: originalCurrency,
                  })(<span>{originalCurrency}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="items-row" gutter={48}>
              <Col span={24}>
                <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
                  {getFieldDecorator('remark', {
                    initialValue: remark,
                  })(<span>{remark}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    );
  }
}
