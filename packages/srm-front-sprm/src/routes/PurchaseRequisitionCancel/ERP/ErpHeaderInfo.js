/*
 * NonErpHeaderInfo - Erp采购申请头信息
 * @date: 2019-07-16
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { dateTimeRender } from 'utils/renderer'; // 日期时间格式化
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

// import DisplayFormItem from '../../components/DisplayFormItem';

const FormItem = Form.Item;
const commonPrompt = 'sprm.common.model.common';

export default class ErpHeaderInfo extends Component {
  render() {
    const {
      headerInfo = {},
      form,
      form: { getFieldDecorator },
      customizeForm,
    } = this.props;
    const {
      remark,
      displayPrNum,
      creationDate,
      createByName,
      prSourcePlatform,
      prSourcePlatformMeaning,
      sourceCodeMeaning,
    } = headerInfo;
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER_ERP',
        dataSource: headerInfo,
        form,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
              {getFieldDecorator('displayPrNum', {
                initialValue: displayPrNum,
              })(<span>{displayPrNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.roles.creator`).d('创建人')}>
              {getFieldDecorator('createByName', {
                initialValue: createByName,
              })(<span>{createByName}</span>)}
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
            <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
              {getFieldDecorator('prSourcePlatform')(<span>{prSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        {prSourcePlatform === 'ERP' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.externalSystemName`).d('外部系统名称')}>
                {getFieldDecorator('sourceCode')(<span>{sourceCodeMeaning}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
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
