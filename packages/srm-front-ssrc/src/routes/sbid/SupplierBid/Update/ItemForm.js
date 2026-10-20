import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import { yesOrNoRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
// import CPopover from '@/routes/components/CPopover';
// import { noop } from 'lodash';
import { numberSeparatorRender } from '@/utils/renderer';
import { getUomName, getQtyName } from '@/utils/utils';
// import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const promptCode = 'ssrc.supplierBid';

class ItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      // organizationId,
      // form,
      form: { getFieldDecorator },
      biddingLine = {},
      sectionFlag,
      doubleUnitFlag,
    } = this.props;

    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码')}
              value={biddingLine.itemCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述')}
              value={biddingLine.itemName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类')}
              value={biddingLine.categoryName}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem label={getUomName(doubleUnitFlag)} value={biddingLine.uomName} />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={getQtyName(doubleUnitFlag)}
              value={numberSeparatorRender(biddingLine.bidQuantity)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxIncludedFlag', {
                initialValue: biddingLine.taxIncludedFlag,
              })(<span>{yesOrNoRender(biddingLine.taxIncludedFlag)}</span>)}
            </Form.Item>
          </Col>
        </Row>
        {doubleUnitFlag ? (
          <Row gutter={48} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl.get(`${promptCode}.model.supplierBid.unit`).d('单位')}
                value={biddingLine.uomName}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl.get(`${promptCode}.model.supplierBid.bidQuantity`).d('需求数量')}
                value={numberSeparatorRender(biddingLine.bidQuantity)}
              />
            </Col>
          </Row>
        ) : null}
        {sectionFlag === 0 && (
          <Row gutter={48} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}
              >
                {getFieldDecorator('lineAttachmentUuid', {
                  initialValue: biddingLine.lineAttachmentUuid,
                })(
                  <Upload
                    filePreview
                    viewOnly
                    icon="download"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-bidItem"
                    attachmentUUID={biddingLine.lineAttachmentUuid}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}

const hocComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(Com);
};

export default hocComponent(ItemForm);
