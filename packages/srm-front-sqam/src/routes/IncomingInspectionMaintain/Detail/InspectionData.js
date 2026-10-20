/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';
import UploadModal from '_components/Upload';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { thousandBitSeparator } from '@/routes/utils.js';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
const promptCode = 'sqam.incomingInspectionQuery';
const tenantId = getCurrentOrganizationId();
const { realName } = getCurrentUser();

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
// @withCustomize({
//   unitCode: ['SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA'],
// })
export default class PurchaseRequestHeader extends Component {
  state = {};

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      detailHeader = {},
      form,
      setModelDetailHeader,
      quoteFlag = false,
      customizeForm,
    } = this.props;
    const {
      startDate,
      endDate,
      responsiblePerson,
      itemName,
      sampleSize,
      batchQuantity,
      actualQuantity,
      destroyQuantity,
      badQuantity,
      itemCode,
      categoryId,
      categoryName,
      uomCode,
      uomCodeAndName,
      model,
      specifications,
    } = detailHeader;
    const { creationDateFrom = startDate, creationDateTo = endDate } = this.state;
    const { getFieldDecorator, setFieldsValue } = form;
    const uploadModalProps = {
      viewOnly: true,
      btnText: intl.get(`hzero.common.upload.view`).d('查看附件'),
      showFilesNumber: true,
      attachmentUUID: detailHeader.checkAttachmentUuid || uuid(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };
    return customizeForm(
      {
        code: 'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA',
        form,
        dataSource: detailHeader,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
                .d('检验开始日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
                        .d('检验开始日期'),
                    }),
                  },
                ],
                initialValue: startDate ? moment(startDate) : moment(),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) => {
                    if (isEmpty(creationDateTo)) {
                      return false;
                    }
                    return (
                      moment(currentDate).format('YYYYMMDD') >
                      moment(creationDateTo).format('YYYYMMDD')
                    );
                  }}
                  onChange={(date) => {
                    this.setState({ creationDateFrom: date });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
                .d('检验结束日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDate', {
                initialValue: endDate ? moment(endDate) : moment(),
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
                        .d('检验结束日期'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) => {
                    if (isEmpty(creationDateFrom)) {
                      return false;
                    }
                    return (
                      moment(currentDate).format('YYYYMMDD') <
                      moment(creationDateFrom).format('YYYYMMDD')
                    );
                  }}
                  onChange={(date) => {
                    this.setState({ creationDateTo: date });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.8d.chargeName`).d('责任人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('responsiblePerson', {
                initialValue: responsiblePerson || realName,
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`sqam.common.model.8d.chargeName`).d('责任人'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={quoteFlag ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.code`).d('物料编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemCode', {
                initialValue: itemCode,
              })(
                !quoteFlag ? (
                  <Lov
                    code="SQAM.ITEM"
                    textValue={itemCode}
                    queryParams={{ tenantId }}
                    onChange={(_, lovRecord) => {
                      const {
                        itemName: a,
                        itemId,
                        checkAttachmentUuid,
                        model: modelName,
                        specifications: specificationsName,
                      } = lovRecord;
                      setFieldsValue({
                        itemName: a,
                        model: modelName,
                        specifications: specificationsName,
                      });
                      setModelDetailHeader({ itemId, checkAttachmentUuid });
                    }}
                  />
                ) : (
                  <span>{itemCode}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.name`).d('物料名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemName', {
                initialValue: itemName,
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`entity.item.name`).d('物料名称'),
                    }),
                  },
                ],
              })(!quoteFlag ? <Input /> : <span>{itemName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.itemCatalog`)
                .d('物料分类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('categoryId', {
                    initialValue: categoryId,
                  })(
                    <Lov
                      code="SPRM.ITEM_CATEGOR"
                      textValue={categoryName}
                      queryParams={{ tenantId }}
                    />
                  )
                : getFieldDecorator('categoryId')(<span>{categoryName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`)
                .d('检验批数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('batchQuantity', {
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(
                              `${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`
                            )
                            .d('检验批数量'),
                        }),
                      },
                    ],
                    initialValue: batchQuantity,
                  })(<InputNumber style={{ width: '100%' }} allowThousandth />)
                : getFieldDecorator('batchQuantity', { initialValue: batchQuantity })(
                  <span>{thousandBitSeparator(batchQuantity)}</span>
                  )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.actualQuantity`)
                .d('实际批量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('actualQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(
                          `${promptCode}.view.message.model.incomingInspectionQuery.actualQuantity`
                        )
                        .d('实际批量'),
                    }),
                  },
                ],
                initialValue: actualQuantity || batchQuantity,
              })(<InputNumber style={{ width: '100%' }} allowThousandth />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.sampleSize`)
                .d('采样大小')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sampleSize', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.view.message.model.incomingInspectionQuery.sampleSize`)
                        .d('采样大小'),
                    }),
                  },
                ],
                initialValue: sampleSize,
              })(<InputNumber style={{ width: '100%' }} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.unitMeasurement`)
                .d('采样计量单位')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('uomCode', {
                initialValue: uomCode,
              })(
                <Lov
                  code="SMDM.UOM_CROSS_TENANT"
                  textValue={uomCodeAndName}
                  queryParams={{ tenantId }}
                />
              )}
              {/* // : getFieldDecorator('uomCode')(<span>{uomName}</span>)} */}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.destroyQuantity`)
                .d('检验破坏数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('destroyQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(
                          `${promptCode}.view.message.model.incomingInspectionQuery.destroyQuantity`
                        )
                        .d('检验破坏数量'),
                    }),
                  },
                ],
                initialValue: destroyQuantity,
              })(<InputNumber style={{ width: '100%' }} allowThousandth />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.badQuantity`)
                .d('不良品数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.model.incomingInspectionQuery.badQuantity`)
                        .d('不良品数量'),
                    }),
                  },
                ],
                initialValue: badQuantity,
              })(<InputNumber style={{ width: '100%' }} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.detectionGuide`)
                .d('检测指导')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('checkAttachmentUuid')(<UploadModal {...uploadModalProps} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.specifications`).d('规格')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('specifications', {
                initialValue: specifications,
              })(!quoteFlag ? <Input /> : <span>{specifications}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.model`).d('型号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('model', {
                initialValue: model,
              })(!quoteFlag ? <Input /> : <span>{model}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
