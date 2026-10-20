import React, { Component, Fragment } from 'react';
import { Form, Row, Col, Collapse, Icon, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import Switch from 'components/Switch';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

const promptCode = 'ssrc.supplierBid';
const FormItem = Form.Item;
const { Panel } = Collapse;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@formatterCollections({ code: ['ssrc.supplierBid'] })
export default class SectionHeaderUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: [`${props.item.bidLineItemId}`],
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const {
      item,
      organizationId,
      form = {},
      attachmentMethod,
      afterOpenUploadModal,
      abandonedForm,
      giveUp,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { collapseKeys } = this.state;
    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={collapseKeys}
        onChange={this.onCollapseChange}
      >
        <Panel
          showArrow={false}
          header={
            <Fragment>
              <h3>{intl.get(`${promptCode}.view.message.panel.sectionInfoView`).d('标段信息')}</h3>
              <a>
                {collapseKeys.includes(`${item.bidLineItemId}`)
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon type={collapseKeys.includes(`${item.bidLineItemId}`) ? 'up' : 'down'} />
            </Fragment>
          }
          key={`${item.bidLineItemId}`}
        >
          <Form>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionNum`).d('标段/包编号')}
                  value={item.sectionNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionName`).d('标段/包名称')}
                  value={item.sectionName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期')}
                  value={item.demandDate && moment(item.demandDate).format(DEFAULT_DATE_FORMAT)}
                />
              </Col>
            </Row>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.sectionAmount`)
                    .d('标段/包总金额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sectionAmount', {
                    initialValue: item.sectionAmount,
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      disabled={form.getFieldValue('abandonedFlag') === 1}
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.supplierLineAttachment`)
                    .d('标段/包投标文件')}
                >
                  {getFieldDecorator('currentAttachmentUuid', {
                    initialValue: item.currentAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={attachmentMethod(item)}
                      tenantId={organizationId}
                      fileSize={FIlESIZE}
                      afterOpenUploadModal={afterOpenUploadModal}
                      {...ChunkUploadProps}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={abandonedForm('abandonedFlag')}>
                  {getFieldDecorator('abandonedFlag', {
                    initialValue: item.abandonedFlag,
                  })(<Switch onChange={(type) => giveUp(type)} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  }
}
