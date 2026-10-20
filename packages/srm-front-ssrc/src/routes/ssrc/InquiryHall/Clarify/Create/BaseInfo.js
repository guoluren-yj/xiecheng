/**
 * BaseInfo - 澄清函基本信息
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getCurrentUser } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { INQUIRY } from '@/utils/globalVariable';
import LovMultiple from '@/routes/components/LovMultiple';

@Form.create({ fieldNameProp: null })
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      realName: getCurrentUser().realName,
      // supplier: getCurrentUser().tenantName,
    };
  }

  //
  getSelectRows(ids, names) {
    if (!ids) return [];
    const supplierCompanyNames = names.split(',');
    const aa = (ids?.split(',') || []).map((item, index) => {
      return { supplierCompanyId: Number(item), supplierCompanyName: supplierCompanyNames[index] };
    });
    console.log(aa);
    return aa;
  }

  render() {
    const { realName } = this.state;
    const {
      customizeForm,
      header,
      clarificationDetails = {},
      organizationId,
      clarifyStatus = [],
      sourceNum,
      matchDate,
      sourceKey = INQUIRY,
      headerInfo = {},
      sourceId,
      sourceCategory,
      supplierSelectRows,
      handleChangeVisibleSupplier = () => {},
    } = this.props;
    const { rfxTitle } = matchDate;
    const { sourceTitle } = headerInfo || {};
    const { getFieldDecorator } = this.props.form;
    const currentTitle = sourceTitle || rfxTitle;

    return customizeForm(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.PREVIEW`,
        form: this.props.form,
        dataSource: header || clarificationDetails || {},
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue:
                  clarificationDetails.title ||
                  intl
                    .get(`ssrc.clarify.model.clarify.bitTitleContext`, { bidTitle: currentTitle })
                    .d(`关于【${currentTitle}】的招标答疑审批`),
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', {
                      max: 480,
                    }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.clarify.model.clarify.title`).d('标题'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.clarifyNum`).d('澄清单号')}
            >
              {getFieldDecorator('clarifyNum', {
                initialValue: clarificationDetails.clarifyNum,
              })(<span>{clarificationDetails.clarifyNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('ssrc.common.company').d('公司')}>
              {getFieldDecorator('companyName', {
                initialValue: clarificationDetails.companyName || headerInfo.companyName,
              })(<span>{clarificationDetails.companyName || headerInfo.companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.clarifyStatus`).d('状态')}
            >
              {getFieldDecorator('clarifyStatus', {
                initialValue: clarificationDetails.clarifyStatus,
              })(<span>{valueMapMeaning(clarifyStatus, clarificationDetails.clarifyStatus)}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.submittedByUserName`).d('发布人')}
            >
              {getFieldDecorator('submittedByUserName', {
                initialValue: clarificationDetails.submittedByUserName || realName,
              })(<span>{clarificationDetails.submittedByUserName || realName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.sourceNum`).d('寻源单号')}
            >
              {getFieldDecorator('sourceNum', {
                initialValue: clarificationDetails.sourceNum || sourceNum,
              })(<span>{clarificationDetails.sourceNum || sourceNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.submittedDate`).d('发布时间')}
            >
              {getFieldDecorator('submittedDate', {
                initialValue: clarificationDetails.submittedDate,
              })(<span>{clarificationDetails.submittedDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.context`).d('澄清函文件')}
            >
              {getFieldDecorator('attachmentUuid', {
                initialValue: clarificationDetails.attachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={clarificationDetails.attachmentUuid}
                  tenantId={organizationId}
                  fileSize={FIlESIZE}
                  {...ChunkUploadProps}
                />
              )}
            </Form.Item>
          </Col>
          {/* 供应商=邀请 显示此字段 */}
          {(clarificationDetails?.sourceMethod || headerInfo?.sourceMethod) === 'INVITE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.clarify.model.clarify.visibleSupplier`).d('可见供应商')}
              >
                {getFieldDecorator('visibleSuppliers', {
                  initialValue: clarificationDetails.visibleSuppliers,
                })(
                  <LovMultiple
                    code="SSRC.CLARIFY_VISIBLE_SUPPLIER"
                    onChange={this.handleChangeCompany}
                    queryParams={{
                      sourceId,
                      sourceType: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
                    }}
                    lovOptions={{
                      displayField: 'supplierCompanyName',
                      valueField: 'supplierCompanyId',
                    }}
                    textField="supplierCompanyName"
                    selectedRows={supplierSelectRows}
                    textValue={clarificationDetails.visibleSuppliersMeaning}
                    changeSelectRows={handleChangeVisibleSupplier}
                  />
                )}
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    );
  }
}
