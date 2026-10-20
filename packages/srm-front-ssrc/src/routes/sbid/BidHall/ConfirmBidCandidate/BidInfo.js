/**
 * bidHall - 招投标－确认招标候选人－基本信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

import styles from './BidInfo.less';

const FormItem = Form.Item;

@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.common'] })
export default class BidInfo extends Component {
  render() {
    const {
      header,
      organizationId,
      viewBidMembers,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;

    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

    return customizeForm(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.HEADER',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="read-row-custom">
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidNum`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: header.bidNum,
              })(<span>{header.bidNum}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项')}
              value={header.bidTitle}
              {...formsLayouts}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: header.bidTitle,
              })(<span style={{ marginLeft: '6%' }}>{header.bidTitle}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName', {
                initialValue: header.templateName,
              })(<span>{header.templateName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationTypeMeaning', {
                initialValue: header.quotationTypeMeaning,
              })(<span>{header.quotationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purceOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: header.purOrganizationName,
              })(<span>{header.purOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`ssrc.common.company`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<span>{header.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTypeMeaning', {
                initialValue: header.bidTypeMeaning,
              })(<span>{header.bidTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: header.sourceMethodMeaning,
              })(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.subjectMatterRule`).d('标的规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('subjectMatterRuleMeaning', {
                initialValue: header.subjectMatterRuleMeaning,
              })(<span>{header.subjectMatterRuleMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourceStage`).d('招标阶段')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceStageMeaning', {
                initialValue: header.sourceStageMeaning,
              })(<span>{header.sourceStageMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.maxBidNumber`).d('最大中标数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: header.maxBidNumber,
              })(<span>{header.maxBidNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationStartDate`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: header.quotationStartDate,
              })(<span>{header.quotationStartDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationEndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: header.quotationEndDate,
              })(<span>{header.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: header.bidOpenDate,
              })(<span>{header.bidOpenDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classNames(styles.rowNew, 'read-row')}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidMembers')(
                <a onClick={viewBidMembers}>
                  {intl.get(`ssrc.bidHall.view.message.button.view`).d('查看')}
                </a>
              )}
            </FormItem>
          </Col>
          {header.businessAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidusinessFile`).d('招标商务文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('businessAttachmentUuid', {
                  initialValue: header.businessAttachmentUuid,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(header.businessAttachmentUuid)
                        ? undefined
                        : header.businessAttachmentUuid
                    }
                    tenantId={organizationId}
                    viewOnly
                    filePreview
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
          {header.techAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidTechFile`).d('招标技术文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('techAttachmentUuid', {
                  initialValue: header.techAttachmentUuid,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(header.techAttachmentUuid) ? undefined : header.techAttachmentUuid
                    }
                    tenantId={organizationId}
                    viewOnly
                    filePreview
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
        </Row>
      </Form>
    );
  }
}
