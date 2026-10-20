/**
 * RFX头表单
 * @date: 2021-07-07
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
// import classnames from 'classnames';
import { isFunction } from 'lodash';
import { Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
// import { getCurrentOrganizationId } from 'utils/utils';
// import Upload from '_components/Upload';
// import { PRIVATE_BUCKET } from '_utils/config';

import { numberSeparatorRender } from '@/utils/renderer';

const { TextArea } = Input;
const FormItem = Form.Item;
// const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class HeaderForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    // eslint-disable-next-line no-unused-expressions
    isFunction(onRef) && onRef(this, 'headerFormRef');
  }

  render() {
    const {
      header,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning')(
                <span>{header.sourceCategoryMeaning || '-'}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName')(
                <span>{header.purOrganizationName || '-'}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName')(<span>{header.companyName || '-'}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitName')(<span>{header.unitName || '-'}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('budgetAmount')(
                <span>{header.budgetAmount && numberSeparatorRender(header.budgetAmount)}</span>
              )}
            </FormItem>
          </Col>
          {header.priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
                  .d('预估金额(含税)')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalEstimatedAmount')(
                  <span>{numberSeparatorRender(header.totalEstimatedAmount)}</span>
                )}
              </FormItem>
            </Col>
          ) : (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
                  .d('预估金额(不含税)')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalNetEstimatedAmount')(
                  <span>{numberSeparatorRender(header.totalNetEstimatedAmount)}</span>
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCodeMeaning')(
                <span>{header.currencyCodeMeaning || '-'}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.projectBudgetAmount`)
                .d('寻源项目预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectBudgetAmount')(
                <span>{numberSeparatorRender(header.projectBudgetAmount)}</span>
              )}
            </FormItem>
          </Col>
          {header.priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.projectEstimatedAmount`)
                  .d('寻源项目预估金额(含税)')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('projectEstimatedAmount')(
                  <span>{numberSeparatorRender(header.projectEstimatedAmount)}</span>
                )}
              </FormItem>
            </Col>
          ) : (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.projectNetEstimatedAmount`)
                  .d('寻源项目预估金额(不含税)')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('projectNetEstimatedAmount')(
                  <span>{numberSeparatorRender(header.projectNetEstimatedAmount)}</span>
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxRemark')(<span>{header.rfxRemark || '-'}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('internalRemark')(<span>{header.internalRemark || '-'}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注')}
            >
              {getFieldDecorator('pretrailRemark')(<span>{header.pretrailRemark || '-'}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`)
                .d('初审附件')}
            >
              {getFieldDecorator('pretrialUuid')(
                // <Upload
                //   bucketName="private-bucket"
                //   bucketDirectory="ssrc-rfx-pretrial"
                //   attachmentUUID={header.pretrialUuid ? header.pretrialUuid : undefined}
                //   tenantId={organizationId}
                //   filePreview
                //   viewOnly
                // />
                <Attachment
                  bucketName="private-bucket"
                  bucketDirectory="ssrc-rfx-pretrial"
                  value={header.pretrialUuid ? header.pretrialUuid : undefined}
                  readOnly
                />
              )}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, { checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID') })
                .d('{checkPriceName}附件')}
            >
              {getFieldDecorator('checkAttachmentUuid')(
                <Attachment
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationline"
                  value={header.checkAttachmentUuid ? header.checkAttachmentUuid : undefined}
                  readOnly
                />
              )}
            </FormItem>
          </Col> */}
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.checkRemark`).d('核价备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('checkRemark', { initialValue: header.checkRemark })(
                <TextArea maxLength={1000} />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
