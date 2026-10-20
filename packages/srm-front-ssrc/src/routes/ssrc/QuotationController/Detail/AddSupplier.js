/**
 * inquiryHall - 寻源服务/寻源大厅-新建/查看【添加供应商】功能
 * @date: 2019-2-13
 * @author: lbc <baocheng.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Button, Col, Drawer, Form, Icon, Input, InputNumber, Row } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const promptCode = 'ssrc.quoController';
@Form.create({ fieldNameProp: null })
export default class AddSupplier extends Component {
  /**
   * 保存供应商
   * saveSupplier
   */
  @Bind()
  @Throttle(1200)
  saveSupplier() {
    const {
      form: { validateFields },
      onSave,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        onSave(values);
      }
    });
  }

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList) {
    const { form } = this.props;
    const {
      supplierCompanyName,
      supplierCompanyCode,
      supplierTenantId,
      companyId,
      contactName,
      mobilephone,
      mail,
      supplierContactId,
      internationalTelCode,
    } = dataList;
    form.setFieldsValue({
      contactName,
      companyId,
      supplierTenantId,
      supplierCompanyName,
      supplierContactId,
      supplierCompanyNum: supplierCompanyCode,
      contactMobilephone: mobilephone,
      contactMail: mail,
      internationalTelCode,
    });
  }

  /**
   * 改变联系人-获取联系电话、电子邮件
   */
  @Bind()
  changeContactName(value, dataList) {
    const { form } = this.props;
    form.setFieldsValue({
      contactMobilephone: dataList.mobilephone,
      contactMail: dataList.mail,
    });
  }

  /**
   * 渲染供应商信息
   * renderSupplierForm
   */
  @Bind()
  renderSupplierForm() {
    const {
      userId,
      organizationId,
      companyId,
      sourceHeaderId,
      templateId,
      form: { getFieldDecorator, getFieldValue },
      header = {},
      remote,
    } = this.props;
    return (
      <Row type="flex" justify="start">
        <Col span={12}>
          <Form.Item
            label={intl.get(`${promptCode}.model.quoController.supplierCode`).d('供应商编码')}
            {...formLayout}
          >
            {getFieldDecorator('supplierCompanyId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.model.quoController.supplierCode`)
                      .d('供应商编码'),
                  }),
                },
              ],
            })(
              <Lov
                code="SSRC.SUPPLIER"
                onChange={(value, dataList) => this.changeSupplierCompanyNum(value, dataList)}
                queryParams={{
                  organizationId,
                  userId,
                  companyId,
                  sourceFrom: 'RFX',
                  sourceHeaderId,
                  templateId,
                }}
              />
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('supplierCompanyNum', {})(<div />)}
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('supplierTenantId', {})(<div />)}
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('supplierContactId', {})(<div />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={intl.get(`${promptCode}.model.quoController.supplierName`).d('供应商名称')}
            {...formLayout}
          >
            {getFieldDecorator('supplierCompanyName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.model.quoController.supplierName`)
                      .d('供应商名称'),
                  }),
                },
              ],
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={intl.get(`${promptCode}.model.quoController.contacts`).d('联系人')}
            {...formLayout}
          >
            {getFieldDecorator('contactName', {
              rules: [
                {
                  required: getFieldValue('supplierCompanyId') && true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.quoController.contacts`).d('联系人'),
                  }),
                },
              ],
            })(
              <Lov
                code="SSRC.SUPPLIER_CONTANCTS"
                textValue={getFieldValue('contactName')}
                queryParams={{ companyId, supplierCompanyId: getFieldValue('supplierCompanyId') }}
                onChange={(value, dataList) => this.changeContactName(value, dataList)}
                disabled={!getFieldValue('supplierCompanyId')}
              />
            )}
            {getFieldDecorator('companyId', {})(<div />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <React.Fragment>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.tel`).d('联系电话')}
              {...formLayout}
            >
              {getFieldDecorator('contactMobilephone', {
                rules: [
                  {
                    required: remote
                      ? remote.process(
                          'SSRC_QUOTATION_CONTROLLER_DETAIL_PROCESS_ADD_SUPPLIER_FORM_PHONE_REQUIRED',
                          true,
                          { header }
                        )
                      : true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.quoController.tel`).d('联系电话'),
                    }),
                  },
                ],
              })(
                <Input
                  addonBefore={getFieldValue('internationalTelCodeMeaning')}
                  disabled
                  {...(remote
                    ? remote.process(
                        'SSRC_QUOTATION_CONTROLLER_DETAIL_PROCESS_ADD_SUPPLIER_FORM_PHONE_INPUT_PROPS',
                        {
                          disabled: true,
                          addonBefore: getFieldValue('internationalTelCodeMeaning'),
                        },
                        { header }
                      )
                    : {})}
                />
              )}
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              {getFieldDecorator('internationalTelCode')(<div />)}
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              {getFieldDecorator('internationalTelCodeMeaning')(<div />)}
            </Form.Item>
          </React.Fragment>
        </Col>
        <Col span={12}>
          <Form.Item
            label={intl.get(`${promptCode}.model.quoController.Email`).d('电子邮件')}
            {...formLayout}
          >
            {getFieldDecorator('contactMail', {
              rules: [
                {
                  required: remote
                    ? remote.process(
                        'SSRC_QUOTATION_CONTROLLER_DETAIL_PROCESS_ADD_SUPPLIER_FORM_EMAIL_REQUIRED',
                        true,
                        { header }
                      )
                    : true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.quoController.Email`).d('电子邮件'),
                  }),
                },
              ],
            })(
              <Input
                disabled
                {...(remote
                  ? remote.process(
                      'SSRC_QUOTATION_CONTROLLER_DETAIL_PROCESS_ADD_SUPPLIER_FORM_EMAIL_INPUT_PROPS',
                      {
                        disabled: true,
                      },
                      { header }
                    )
                  : {})}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数')}
            {...formLayout}
          >
            {getFieldDecorator('priceCoefficient', {
              rules: [
                {
                  required: header.rankRule === 'WEIGHT_PRICE',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`)
                      .d('价格系数'),
                  }),
                },
              ],
            })(<InputNumber min={0} max={999999999} precision={4} style={{ width: '100%' }} />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={intl.get(`${promptCode}.model.quoController.appendRemark`).d('添加理由')}
            {...formLayout}
          >
            {getFieldDecorator('appendRemark', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.quoController.appendRemark`).d('添加理由'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
        </Col>
      </Row>
    );
  }

  render() {
    const { title, visible, dataSource, onCancel, loading, confirmLoading } = this.props;
    const style = {
      marginTop: '30px',
      marginBottom: '20px',
      fontSize: '15px',
    };
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get(`${promptCode}.model.quoController.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.minimumPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 100,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minLimitPrice', {
                initialValue: val,
              })(<InputNumber min={0} max={9999999999} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.maximumPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 100,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('maxLimitPrice', {
                initialValue: val,
              })(<InputNumber min={0} max={9999999999} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.inviteFlag`).d('是否可见'),
        dataIndex: 'inviteFlag',
        width: 100,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('inviteFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    return (
      <Drawer
        destroyOnClose
        width={700}
        visible={visible}
        title={title}
        placement="right"
        onClose={onCancel}
      >
        {this.renderSupplierForm()}
        <Icon style={{ ...style, marginRight: '10px' }} type="tool" />
        <span style={style}>
          {intl.get(`${promptCode}.view.message.title.assignVisibleItems`).d('分配可见物品')}
        </span>
        <EditTable
          bordered
          rowKey="rfxLineItemId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={onCancel}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button onClick={this.saveSupplier} loading={confirmLoading} type="primary">
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
