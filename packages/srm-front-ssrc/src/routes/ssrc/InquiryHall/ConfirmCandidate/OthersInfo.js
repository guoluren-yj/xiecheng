/**
 * inquiryHall - 寻源服务/招标维护 - 其它信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { noop } from 'lodash';

import { getQuotationName } from '@/utils/globalVariable';

import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class OthersInfo extends Component {
  render() {
    const {
      header = {},
      form,
      form: { getFieldDecorator },
      customizeForm = noop,
    } = this.props;

    const bidFlag = header.secondarySourceCategory === 'NEW_BID';

    return customizeForm(
      {
        form,
        code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
        dataSource: header,
      },
      <Form className={common.headerInfo}>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('{quotationName}开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate')(<span>{header.quotationStartDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadline`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('{quotationName}截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate')(<span>{header.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceTypeMeaning')(<span>{header.sourceTypeMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName')(<span>{header.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('priceCategoryMeaning')(
                <span>{header.priceCategoryMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sealedQuotationFlag')(
                <span>{yesOrNoRender(header.sealedQuotationFlag)}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.sourceAnnouncementFlag`)
                .d('创建寻源公告')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceAnnouncementFlag')(
                <span>{yesOrNoRender(header.sourceAnnouncementFlag)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber')(<span>{header.roundNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
