/**
 * CalibrationManagementYes - 寻源服务/询价大厅-分标段定标管理
 * @date: 2018-12-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import classNames from 'classnames';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
} from 'utils/constants';

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'] })
export default class BidInfoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      match,
      organizationId,
      header,
      editBidMembers,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const isDisabled = match.path === '/pub/ssrc/bid-hall/calibration-managementyes/:bidId'; // 工作流只读
    return customizeForm(
      {
        code: 'SSRC.BID_HALL_CHECK_PRICE.HEADER',
        form: this.props.form,
        dataSource: header,
      },
      <Form>
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
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: header.bidTitle,
              })(<span>{header.bidTitle}</span>)}
            </FormItem>
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
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidMembers', {
                initialValue: header.bidMembers,
              })(
                <a onClick={editBidMembers}>
                  {intl.get(`ssrc.bidHall.view.message.button.view`).d('查看')}
                </a>
              )}
            </FormItem>
          </Col>
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
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalBudget', {
                initialValue: header.totalBudget,
              })(<span>{numberSeparatorRender(header.totalBudget)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            {isDisabled ? (
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.calibrationRemark`).d('定标备注')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('bidEvaluationRemark', {
                  initialValue: header.bidEvaluationRemark,
                })(<span>{header.bidEvaluationRemark}</span>)}
              </FormItem>
            ) : (
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.calibrationRemark`).d('定标备注')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('bidEvaluationRemark', {
                  initialValue: header.bidEvaluationRemark,
                })(<TextArea rows={2} />)}
              </FormItem>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
