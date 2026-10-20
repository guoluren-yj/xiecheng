import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import classnames from 'classnames';

import { EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer'; // yesOrNoRender

import { thousandBitSeparator } from '@/routes/utils.js';

// import DisplayFormItem from '../../components/DisplayFormItem';
const FormItem = Form.Item;

const commonPrompt = 'sprm.common.model.common';
const hcuzCode = 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER';
@Form.create({ fieldNameProp: null })
export default class HeadInfo extends PureComponent {
  render() {
    const { dataSource, customizeForm, form, dataSourceLoading } = this.props;
    const { getFieldDecorator } = form;
    const {
      prSourcePlatform,
      lotNum,
      title,
      prNum,
      displayPrNum,
      creationDate,
      amount,
      prRequestedName,
      // contactTelNum,
      companyName,
      ouName,
      purchaseOrgName,
      purchaseAgentName,
      prSourcePlatformMeaning,
      paymentMethodName,
      // freight,
      remark,
      unitName,
      financialPrecision,
      // 新增字段
      requestDate, // 申请日期
      prTypeName,
      prTypeId,
      // parentUnitName,
      // expenseUnitName,
      // invoiceTitle,
      // categoryName,
      // accepterUserName,
      // techGuidanceFlag,
      // techDirectorUserName,
      // inventoryName,
      // splitFreightFlag,
      createByName,
      originalCurrency,
      prRequestedNum,
      cancelledRemark,
      closedRemark,
      approvalPendingStatus,
      headerPriceHiddenFlag: priceHiddenFlag,
      amountMeaning,
      localCurrencyTaxSumMeaning,
      localCurrencyTaxSum,
      localCurrencyNoTaxSumMeaning,
      localCurrencyNoTaxSum,
      localFinancialPrecision,
    } = dataSource;
    return customizeForm(
      {
        code: hcuzCode, // 必传，和unitCode一一对应
        form: this.props.form, // 无论个性化单元是否只读，均必传
        dataSource, // 必传，从后端接口获取到的数据
        dataSourceLoading,
      },
      <Form>
        {(approvalPendingStatus === 'CANCELLEDING' || approvalPendingStatus === 'CANCELLED') && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem label={intl.get(`sprm.common.view.message.cancelReason`).d('取消原因')}>
                {getFieldDecorator('cancelledRemark', {
                  initialValue: cancelledRemark,
                })(<span>{cancelledRemark}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        {(approvalPendingStatus === 'CLOSEDING' || approvalPendingStatus === 'CLOSED') && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem label={intl.get(`sprm.common.view.message.closeReason`).d('关闭原因')}>
                {getFieldDecorator('closedRemark', {
                  initialValue: closedRemark,
                })(<span>{closedRemark}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue: title,
              })(<span>{title}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.sqType`).d('申请类型')}>
              {getFieldDecorator('prTypeId', {
                initialValue: prTypeId,
              })(<span>{prTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
              {getFieldDecorator('prNum', {
                initialValue: prNum,
              })(<span>{displayPrNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}>
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{dateTimeRender(creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.amount`).d('申请总额')}>
              {getFieldDecorator('amount', {
                initialValue: amount,
              })(
                <span>
                  {priceHiddenFlag === 1
                    ? amountMeaning
                    : thousandBitSeparator(amount, financialPrecision, prSourcePlatform !== 'SRM')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('entity.roles.creator').d('创建人')}>
              {getFieldDecorator('createByName', {
                initialValue: createByName,
              })(<span>{createByName}</span>)}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.contactTelNum`).d('联系电话')}>
              {getFieldDecorator('contactTelNum')(<span>{contactTelNum}</span>)}
            </FormItem>
          </Col> */}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('entity.company.tag').d('公司')}>
              {getFieldDecorator('companyName', {
                initialValue: companyName,
              })(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('entity.business.tag').d('业务实体')}>
              {getFieldDecorator('ouName', {
                initialValue: ouName,
              })(<span>{ouName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('entity.organization.class.purchase').d('采购组织')}>
              {getFieldDecorator('purchaseOrgName', {
                initialValue: purchaseOrgName,
              })(<span>{purchaseOrgName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}>
              {getFieldDecorator('purchaseAgentName', {
                initialValue: purchaseAgentName,
              })(<span>{purchaseAgentName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
              {getFieldDecorator('prSourcePlatform', {
                initialValue: prSourcePlatform,
              })(<span>{prSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.prMan`).d('申请人')}>
              {getFieldDecorator('prRequestedName', {
                initialValue: prRequestedName,
              })(
                <span>
                  {prRequestedNum ? `${prRequestedNum}-${prRequestedName}` : prRequestedName}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        {/* <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.companyTeam`).d('公司组织')}>
              {getFieldDecorator('parentUnitName')(<span>{parentUnitName}</span>)}
            </FormItem>
          </Col> */}
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.kpBody`).d('开票主体')}>
              {getFieldDecorator('invoiceTitle')(<span>{invoiceTitle}</span>)}
            </FormItem>
          </Col> */}
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.buyType`).d('采购品类')}>
              {getFieldDecorator('categoryName')(<span>{categoryName}</span>)}
            </FormItem>
          </Col>
        </Row> */}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.moneyPart`).d('费用挂靠部门')}>
              {getFieldDecorator('expenseUnitName')(<span>{expenseUnitName}</span>)}
            </FormItem>
          </Col> */}
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.departmentMan`).d('部门验收人')}>
              {getFieldDecorator('accepterUserName')(<span>{accepterUserName}</span>)}
            </FormItem>
          </Col> */}
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.techFlag`).d('是否需要技术指导')}>
              {getFieldDecorator('techGuidanceFlag')(
                <span>{yesOrNoRender(techGuidanceFlag)}</span>
              )}
            </FormItem>
          </Col> */}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.techloMan`).d('技术负责人')}>
              {getFieldDecorator('techDirectorUserName')(<span>{techDirectorUserName}</span>)}
            </FormItem>
          </Col> */}
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.interRoom`).d('库房')}>
              {getFieldDecorator('inventoryName')(<span>{inventoryName}</span>)}
            </FormItem>
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}>
              {getFieldDecorator('unitName', {
                initialValue: unitName,
              })(<span>{unitName}</span>)}
            </FormItem>
          </Col>
        </Row>
        {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ? (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            {prSourcePlatform === 'E-COMMERCE' ? (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem label={intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式')}>
                  {getFieldDecorator('paymentMethodName', {
                    initialValue: paymentMethodName,
                  })(<span>{paymentMethodName}</span>)}
                </FormItem>
              </Col>
            ) : null}
            {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ? (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem label={intl.get(`${commonPrompt}.lotNum`).d('批次号')}>
                  {getFieldDecorator('lotNum', {
                    initialValue: lotNum,
                  })(<span>{lotNum}</span>)}
                </FormItem>
              </Col>
            ) : null}
          </Row>
        ) : null}
        {/* {prSourcePlatform === 'E-COMMERCE' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.freight`).d('运费')}>
                {getFieldDecorator('splitFreightFlag')(
                  <span>
                    {splitFreightFlag === 1 ? (
                      <span>
                        <span>{numberRender(freight, 2)}</span>
                        <span>({intl.get(`${commonPrompt}.share`).d('已分摊')})</span>
                      </span>
                    ) : (
                      <span>{numberRender(freight, 2)}</span>
                    )}
                  </span>
                )}
              </FormItem>
            </Col>
          </Row>
        )} */}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.requestDate`).d('申请日期')}>
              {getFieldDecorator('requestDate', {
                initialValue: requestDate,
              })(<span>{dateRender(requestDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.originalCurrency`).d('原币币种')}>
              {getFieldDecorator('originalCurrency', {
                initialValue: originalCurrency,
              })(<span>{originalCurrency}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)')}
            >
              {getFieldDecorator('localCurrencyNoTaxSum', {
                initialValue: localCurrencyNoTaxSum,
              })(
                <span>
                  {priceHiddenFlag === 1
                    ? localCurrencyNoTaxSumMeaning
                    : thousandBitSeparator(
                        localCurrencyNoTaxSum,
                        localFinancialPrecision,
                        prSourcePlatform !== 'SRM'
                      )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)')}>
              {getFieldDecorator('localCurrencyTaxSum', {
                initialValue: localCurrencyTaxSum,
              })(
                <span>
                  {priceHiddenFlag === 1
                    ? localCurrencyTaxSumMeaning
                    : thousandBitSeparator(
                        localCurrencyTaxSum,
                        localFinancialPrecision,
                        prSourcePlatform !== 'SRM'
                      )}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
              {getFieldDecorator('remark', {
                initialValue: remark,
              })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
