import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import QuotationDirectLable from '@/utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
export default class HeaderForm extends PureComponent {
  render() {
    const {
      dataSource = {},
      organizationId,
      showPretrialPanel,
      form = {},
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        {customizeForm(
          { code: 'SSRC_PREQUAL.HEADER', form, dataSource },
          <Form>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.common.company').d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: dataSource.companyName,
                  })(<span>{dataSource.companyName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.purOrganizationName`)
                    .d('采购组织名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purOrganizationName', {
                    initialValue: dataSource.purOrganizationName,
                  })(<span>{dataSource.purOrganizationName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.templateName`).d('寻源模板')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('templateName', {
                    initialValue: dataSource.templateName,
                  })(<span>{dataSource.templateName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceCategoryMeaning', {
                    initialValue: dataSource.sourceCategory,
                  })(
                    <span>
                      {dataSource.sourceCategory === 'BID'
                        ? dataSource.sourceCategoryMeaning
                        : dataSource.secondarySourceCategoryMeaning ||
                          dataSource.sourceCategoryMeaning}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceMethodMeaning', {
                    initialValue: dataSource.sourceMethod,
                  })(<span>{dataSource.sourceMethodMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('auctionDirectionMeaning', {
                    initialValue: dataSource.auctionDirectionMeaning,
                  })(<span>{dataSource.auctionDirectionMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.qualificationType`).d('审查方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('reviewMethodMeaning', {
                    initialValue: dataSource.reviewMethodMeaning,
                  })(<span>{dataSource.reviewMethodMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.qualifiedLimit`).d('合格上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: dataSource.qualifiedLimit,
                  })(<span>{dataSource.qualifiedLimit}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pretrialPanel')(
                    <a onClick={() => showPretrialPanel(true)}>
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.prequalEndDate`)
                    .d('预审截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: dataSource.prequalEndDate,
                  })(<span>{dataSource.prequalEndDate}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.prequalAttachmentUuid`)
                    .d('资格预审文件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalAttachmentUuid', {
                    initialValue: dataSource.prequalAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      attachmentUUID={dataSource.prequalAttachmentUuid || ''}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalRemark', {
                    initialValue: dataSource.prequalRemark,
                  })(<span>{dataSource.prequalRemark}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
