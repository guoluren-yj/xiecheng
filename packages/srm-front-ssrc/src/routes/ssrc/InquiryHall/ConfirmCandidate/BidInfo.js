/**
 * inquiryHall - 寻源服务/招标维护 - 基本信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { noop } from 'lodash';

import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import { getCategoryCode, getDocumentTypeName } from '@/utils/globalVariable';

import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class BidInfo extends Component {
  render() {
    const {
      header,
      form,
      remote,
      form: { getFieldDecorator },
      customizeForm = noop,
    } = this.props;

    const bidFlag = header.secondarySourceCategory === 'NEW_BID';

    return customizeForm(
      {
        form,
        code: 'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE',
        dataSource: header,
      },
      <Form className={common.headerInfo}>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonRFXNo.`, {
                  categoryCode: getCategoryCode(bidFlag),
                })
                .d('{categoryCode}单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxNum', {
                initialValue: header.rfxNum,
              })(<span>{header.rfxNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, {
                  documentTypeName: getDocumentTypeName(bidFlag),
                })
                .d('{documentTypeName}标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxTitle', {
                initialValue: header.rfxTitle,
              })(<span>{header.rfxTitle}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName', {
                initialValue: header.templateName,
              })(<span>{header.templateName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning', {
                initialValue: header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning,
              })(
                <span>{header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: header.purOrganizationName,
              })(<span>{header.purOrganizationName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.company`).d('公司')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<span>{header.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: header.sourceMethodMeaning,
              })(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationTypeMeaning', {
                initialValue: header.quotationTypeMeaning,
              })(<span>{header.quotationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('auctionDirectionMeaning', {
                initialValue: header.auctionDirectionMeaning,
              })(<span>{header.auctionDirectionMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: header.budgetAmount,
              })(<span>{header.budgetAmount}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCodeMeaning', {
                initialValue: header.currencyCodeMeaning,
              })(<span>{header.currencyCodeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: header.exchangeRate,
              })(<span>{numberRender(header.exchangeRate, 8, false)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: header.creationDate,
              })(<span>{header.creationDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxRemark', {
                initialValue: header.rfxRemark,
              })(<span>{header.rfxRemark}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCreationDate', {
                initialValue: header.sourceCreationDate,
              })(<span>{header.sourceCreationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        {remote ? (
          remote.process('SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_PROCESS_BASIC', <></>, {
            form,
            header,
            getFieldDecorator,
          })
        ) : (
          <></>
        )}
      </Form>
    );
  }
}
