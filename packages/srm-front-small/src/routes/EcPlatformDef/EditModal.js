/**
 * EcPlatformDef -前置机定义modal 编辑页
 * @date: 2018-9-13
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, InputNumber, Checkbox, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Attachment, Modal } from 'choerodon-ui/pro';

import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from '_utils/config';
import RichTextEditor from 'components/RichTextEditor';

const FormItem = Form.Item;

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSaveFrontCompter - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FrontComputerModal extends Component {
  constructor(props) {
    super(props);
    this.refCurrent = React.createRef();
    this.state = {
      attachmentUuid: this.props.tableRecord.attachmentUuid,
    };
  }
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveEcDef, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      const { tenantId } = values;
      if (isEmpty(err)) {
        console.log();
        onHandleSaveEcDef({
          ...tableRecord,
          ...values,
          ecService: values.ecService ? 1 : 0,
          tenantId: tenantId === tableRecord.tenantName ? tableRecord.tenantId : tenantId,
          ecGift: values.ecGift ? 1 : 0,
          cancelAfterSale: values.cancelAfterSale ? 1 : 0,
          feedbackFlag: values.feedbackFlag ? 1 : 0,
          afterSaleType: values.afterSaleType ? 1 : 0,
          aggregationProduct: values.aggregationProduct ? 1 : 0,
          freightQueryEnabled: values.freightQueryEnabled ? 1 : 0,
          batchBill: values.batchBill ? 1 : 0,
          telPhoneRequired: values.telPhoneRequired ? 1 : 0,
          remainLimit: values.remainLimit ? 1 : 0,
          onlineServiceFlag: values.onlineServiceFlag ? 1 : 0,
          cancelBillingRequestFlag: values.cancelBillingRequestFlag ? 1: 0,
          ecIntroduction: this.refCurrent.current.getContent(),
          attachmentUuid: this.state.attachmentUuid,
        });
      }
    });
  }

  render() {
    const { loading, visible, anchor, tableRecord = {}, onCancel, interfaceType } = this.props;
    const { getFieldDecorator } = this.props.form;
    const staticTextProps = {
      content: tableRecord.ecIntroduction,
      data: tableRecord.ecIntroduction,
      ref: this.refCurrent,
      bucketName: PUBLIC_BUCKET,
      config: {
        allowedContent: true,
        removeButtons:
          'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
      },
    };
    return (
      <Modal
        drawer
        destroyOnClose
        maskClosable
        title={intl.get('small.ecplatformDef.view.Ec.platform.maintain').d('维护电商平台')}
        width={540}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl.get('small.ecplatformDef.model.Ec.platform.coding').d('电商平台编码')}
            {...formLayout}
          >
            {getFieldDecorator('ecPlatformCode', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('small.ecplatformDef.model.Ec.platform.coding')
                      .d('电商平台编码'),
                  }),
                },
              ],
              initialValue: tableRecord.ecPlatformCode,
            })(
              <Input
                disabled={tableRecord.ecPlatformCode}
                typeCase="upper"
                trim
                inputChinese={false}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.Ec.platform.name').d('电商平台名称')}
            {...formLayout}
          >
            {getFieldDecorator('ecPlatformName', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecplatformDef.model.Ec.platform.name').d('电商平台名称'),
                  }),
                },
              ],
              initialValue: tableRecord.ecPlatformName,
            })(<TLEditor field="ecPlatformName" token={tableRecord._token} />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.ecplatformDef.tenant').d('租户')}
            {...formLayout}
          >
            {getFieldDecorator('tenantId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecplatformDef.model.ecplatformDef.tenant').d('租户'),
                  }),
                },
              ],
              initialValue: tableRecord.tenantName,
            })(<Lov code="HPFM.TENANT" textValue={tableRecord.tenantName} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('small.ecplatformDef.model.ecplatformDef.purchaseQuantity')
              .d('单次采购最大购买量')}
            {...formLayout}
          >
            {getFieldDecorator('purchaseQuantity', {
              rules: [],
              initialValue: tableRecord.purchaseQuantity,
            })(<InputNumber max={99999} min={1} style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.ecplatformDef.remark').d('备注')}
            {...formLayout}
          >
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.form.interface.type').d('接口类型')}
            {...formLayout}
          >
            {getFieldDecorator('interfaceType', {
              initialValue: tableRecord.interfaceType,
            })(
              <Select allowClear>
                {interfaceType.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <Form.Item {...formLayout} label={intl.get('small.common.table.column.ecGift').d('赠品')}>
            {getFieldDecorator('ecGift', {
              initialValue: !!tableRecord.ecGift,
            })(<Checkbox />)}
          </Form.Item>
          <FormItem
            label={intl.get('small.ecplatformDef.model.ecplatformDef.ecService').d('电商服务')}
            {...formLayout}
          >
            {getFieldDecorator('ecService', {
              initialValue: tableRecord.ecService === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl
              .get('small.ecplatformDef.model.ecplatformDef.cancelAfterSale')
              .d('取消售后')}
            {...formLayout}
          >
            {getFieldDecorator('cancelAfterSale', {
              initialValue: tableRecord.cancelAfterSale === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.feedbackFlag').d('商品反馈')}
            {...formLayout}
          >
            {getFieldDecorator('feedbackFlag', {
              initialValue: tableRecord.feedbackFlag === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl
              .get('small.ecplatformDef.model.ecplatformDef.afterSaleType')
              .d('售后类型查询')}
            {...formLayout}
          >
            {getFieldDecorator('afterSaleType', {
              initialValue: tableRecord.afterSaleType === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl
              .get('small.ecplatformDef.model.ecplatformDef.aggregationProduct')
              .d('商品聚合查询')}
            {...formLayout}
          >
            {getFieldDecorator('aggregationProduct', {
              initialValue: tableRecord.aggregationProduct === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.feight.query').d('运费查询')}
            {...formLayout}
          >
            {getFieldDecorator('freightQueryEnabled', {
              initialValue: tableRecord.freightQueryEnabled === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.batchBill').d('批量差异反馈')}
            {...formLayout}
          >
            {getFieldDecorator('batchBill', {
              initialValue: tableRecord.batchBill === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.telPhoneRequired').d('座机号维护')}
            {...formLayout}
          >
            {getFieldDecorator('telPhoneRequired', {
              initialValue: tableRecord.telPhoneRequired === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.remainLimit').d('查询账户余额')}
            {...formLayout}
          >
            {getFieldDecorator('remainLimit', {
              initialValue: tableRecord.remainLimit === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.onlineService').d('查询在线客服入口')}
            {...formLayout}
          >
            {getFieldDecorator('onlineServiceFlag', {
              initialValue: tableRecord.onlineServiceFlag === 1,
            })(<Checkbox />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecplatformDef.model.cancelBillingRequestFlag').d('取消发票申请')}
            {...formLayout}
            style={{ marginBottom: 0 }}
          >
            {getFieldDecorator('cancelBillingRequestFlag', {
              initialValue: tableRecord.cancelBillingRequestFlag === 1,
            })(<Checkbox />)}
          </FormItem>
          <div className="ant-row ant-form-item" style={{ margin: '16px 0' }}>
            <div className="ant-col-6 ant-form-item-label">
              <label>{intl.get('small.ecplatformDef.model.ecLogo').d('电商Logo')}</label>
            </div>
            <div className="ant-col-12">
            <Attachment
              labelLayout="float"
              accept={['image/*']}
              listType="picture-card"
              max={1}
              bucketName={PUBLIC_BUCKET}
              bucketDirectory='small'
              value={tableRecord.attachmentUuid}
              onChange={v => {
                this.setState({
                  attachmentUuid: v,
                })
              }}
            />
            </div>
          </div>

          <div className="ant-row ant-form-item" style={{ margin: '16px 0' }}>
            <div className="ant-col-6 ant-form-item-label">
              <label>{intl.get('small.ecplatformDef.model.ecIntroduction').d('电商介绍')}</label>
            </div>
          </div>
          <RichTextEditor {...staticTextProps} />
        </Form>
      </Modal>
    );
  }
}
