import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import { yesOrNoRender, dateTimeRender, dateRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
// import CPopover from '@/routes/components/CPopover';
import { noop } from 'lodash';
// import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

class ItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      custLoading,
      // quotationHeader = {},
      organizationId,
      customizeForm = noop,
      form,
      form: { getFieldDecorator },
      quotationItemDto = {},
      formLayout = {},
      quotationLineStatusTableColor = noop,
      // viewApplicationOrgModal = noop,
      handleFloatingWay = noop,
      handleQuotationRange = noop,
      lineStatusTableColor = noop,
      itemViewDate = {},
    } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: 'SSRC.SUPPLIER_QUOTATION_RFA.ITEM_FORM',
            form,
            dataSource: quotationItemDto,
            readOnly: true,
          },
          <Form custLoading={custLoading}>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号')}
                  {...formLayout}
                >
                  {getFieldDecorator('rfxLineItemNum', {
                    initialValue: quotationItemDto.rfxLineItemNum,
                  })(<span>{quotationItemDto.rfxLineItemNum}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.lineStatus`).d('行状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('lineStatus', {
                    initialValue: quotationItemDto.lineStatus,
                  })(<span>{lineStatusTableColor(quotationItemDto)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.quotationStatus`)
                    .d('报价状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('quotationLineStatus', {
                    initialValue: quotationItemDto.quotationLineStatus,
                  })(<span>{quotationLineStatusTableColor(quotationItemDto)}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式')}
                  {...formLayout}
                >
                  {getFieldDecorator('floatType', {
                    initialValue: quotationItemDto.floatType,
                  })(<span>{handleFloatingWay(quotationItemDto.floatType)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.quotationRange`)
                    .d('报价幅度')}
                  {...formLayout}
                >
                  {getFieldDecorator('quotationRange', {
                    initialValue: quotationItemDto.quotationRange,
                  })(
                    <span>
                      {handleQuotationRange(
                        quotationItemDto.quotationRange,
                        quotationItemDto.floatType
                      )}
                    </span>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item label={intl.get('hzero.common.startDate').d('开始时间')} {...formLayout}>
                  {getFieldDecorator('quotationStartDate', {
                    initialValue: quotationItemDto.quotationStartDate,
                  })(<span>{dateTimeRender(quotationItemDto.quotationStartDate)}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.endDate`).d('结束时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('quotationEndDate', {
                    initialValue: quotationItemDto.quotationEndDate,
                  })(
                    <span>
                      {itemViewDate.quotationEndDate
                        ? dateTimeRender(itemViewDate.quotationEndDate)
                        : dateTimeRender(quotationItemDto.quotationEndDate)}
                    </span>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期')}
                  {...formLayout}
                >
                  {getFieldDecorator('demandDate', {
                    initialValue: quotationItemDto.demandDate,
                  })(<span>{dateRender(quotationItemDto.demandDate)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量')}
                  {...formLayout}
                >
                  {getFieldDecorator('rfxQuantity', {
                    initialValue: quotationItemDto.rfxQuantity,
                  })(<span>{quotationItemDto.rfxQuantity}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位')}
                  {...formLayout}
                >
                  {getFieldDecorator('uomName', {
                    initialValue: quotationItemDto.uomName,
                  })(<span>{quotationItemDto.uomName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxIncludedFlag', {
                    initialValue: quotationItemDto.taxIncludedFlag,
                  })(<span>{yesOrNoRender(quotationItemDto.taxIncludedFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.includingFreight`)
                    .d('是否含运费')}
                  {...formLayout}
                >
                  {getFieldDecorator('freightIncludedFlag', {
                    initialValue: quotationItemDto.freightIncludedFlag,
                  })(<span>{yesOrNoRender(quotationItemDto.freightIncludedFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxRate', {
                    initialValue: quotationItemDto.taxRate,
                  })(<span>{quotationItemDto.taxRate}</span>)}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.rfxLineAttachment`)
                    .d('询价单行附件')}
                  {...formLayout}
                >
                  {getFieldDecorator('rfxAttachmentUuid', {
                    initialValue: quotationItemDto.rfxAttachmentUuid,
                  })(
                    <span>
                      {
                        <Upload
                          filePreview
                          bucketName={PRIVATE_BUCKET}
                          bucketDirectory="ssrc-rfx-rfxitem"
                          attachmentUUID={quotationItemDto.rfxAttachmentUuid}
                          tenantId={organizationId}
                          viewOnly
                          icon="download"
                        />
                      }
                    </span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(Com);
};

export default hocComponent(ItemForm);
