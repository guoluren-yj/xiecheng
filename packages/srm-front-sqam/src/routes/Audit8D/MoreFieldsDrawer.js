import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Select, DatePicker, Input, InputNumber, Row, Col } from 'hzero-ui';
import moment from 'moment';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const prefix = `sqam.common.model.qualityRectification`;

export default class MoreFieldsDrawer extends PureComponent {
  renderForm() {
    const {
      form,
      dateFormat,
      timeFormat,
      tenantId,
      issueType,
      significance,
      rectifyTypeCode,
      urgency,
      status,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };
    return customizeForm(
      { code: 'SQAM.AUDIT_8D_LIST.QUERY_FORM', form },
      <Form className="more-fields-form">
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.code`).d('整改报告编号')} {...formLayout}>
              {getFieldDecorator('problemNum', {
                rules: [
                  {
                    max: 20,
                    message: intl.get('hzero.common.validation.max', {
                      max: 20,
                    }),
                  },
                ],
              })(<Input trim inputChinese={false} typeCase="upper" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.title`).d('整改报告标题')} {...formLayout}>
              {getFieldDecorator('problemTitle', {
                rules: [
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(<Input trim />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.status`).d('状态')} {...formLayout}>
              {getFieldDecorator(
                'problemStatus',
                {}
              )(
                <Select allowClear mode="multiple">
                  {status
                    .filter((i) =>
                      [
                        'ICA_SUBMITTED',
                        'PCA_SUBMITTED',
                        'PCA_FEEDBACKING',
                        'PCA_REJECTED',
                        'PUBLISHED',
                        'ICA_REJECTED',
                      ].includes(i.value)
                    )
                    .map((item) => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get('entity.supplier.code').d('供应商编码')} {...formLayout}>
              {getFieldDecorator(
                'supplierNum',
                {}
              )(
                <Lov
                  code="SPUC.DEDUCTION_SUPPLIER"
                  queryParams={{ tenantId }}
                  lovOptions={{
                    displayField: 'erpSupplierNum',
                  }}
                  textField="erpSupplierNum"
                  onChange={(val, record) => {
                    registerField('supplierId');
                    registerField('extSupplierId');
                    registerField('supplierCompanyId');
                    registerField('supplierCompanyNum');
                    setFieldsValue({
                      extSupplierId: record.supplierId,
                      supplierId: record.supplierId,
                      supplierCompanyId: record.supplierCompanyId,
                      supplierCompanyNum: record.supplierNum,
                    });
                    if (!record.erpSupplierNum) {
                      setFieldsValue({ erpSupplierNum: record.supplierNum });
                    }
                  }}
                  textValue={getFieldValue('supplierNum')}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get('entity.company.tag').d('公司')} {...formLayout}>
              {getFieldDecorator(
                'companyId',
                {}
              )(<Lov code="HPFM.COMPANY" queryParams={{ tenantId }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get('entity.organization.class.inventory').d('库存组织')}
              {...formLayout}
            >
              {getFieldDecorator(
                'invOrganizationId',
                {}
              )(
                <Lov
                  code="SQAM.INVORGNIZATION"
                  queryParams={{ companyId: getFieldValue('companyId') }}
                  disabled={getFieldValue('companyId') === undefined}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get('entity.item.tag').d('物料')} {...formLayout}>
              {getFieldDecorator(
                'itemCode',
                {}
              )(
                <Lov
                  code="SQAM.ITEM"
                  queryParams={{ tenantId }}
                  onChange={(val, record) => {
                    registerField('itemId');
                    setFieldsValue({ itemId: record.itemId });
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.issue`).d('问题类型')} {...formLayout}>
              {getFieldDecorator(
                'problemTypeCode',
                {}
              )(
                <Select allowClear>
                  {issueType.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.significance`).d('重视度')} {...formLayout}>
              {getFieldDecorator(
                'problemImportanceCode',
                {}
              )(
                <Select allowClear>
                  {significance.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.urgency`).d('紧急度')} {...formLayout}>
              {getFieldDecorator(
                'problemUrgencyCode',
                {}
              )(
                <Select allowClear>
                  {urgency.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.open.date.gt`).d('开放天数(≥天)')}
              {...formLayout}
            >
              {getFieldDecorator(
                'openDays',
                {}
              )(<InputNumber min={0.1} precision={1} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.icaDemandDateFrom`).d('ICA要求时间从')}
              {...formLayout}
            >
              {getFieldDecorator('icaDemandDateAfter')(
                <DatePicker
                  showTime
                  placeholder=""
                  format={timeFormat}
                  disabledDate={(currentDate) =>
                    getFieldValue('icaDemandDateBefore') &&
                    moment(getFieldValue('icaDemandDateBefore')).isBefore(currentDate, 'second')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.icaDemandDateTo`).d('ICA要求时间至')}
              {...formLayout}
            >
              {getFieldDecorator('icaDemandDateBefore')(
                <DatePicker
                  showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                  placeholder=""
                  format={timeFormat}
                  disabledDate={(currentDate) =>
                    getFieldValue('icaDemandDateAfter') &&
                    moment(getFieldValue('icaDemandDateAfter')).isAfter(currentDate, 'second')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.pcaDemandDateFrom`).d('PCA要求日期从')}
              {...formLayout}
            >
              {getFieldDecorator('pcaDemandDateAfter')(
                <DatePicker
                  placeholder=""
                  format={dateFormat}
                  disabledDate={(currentDate) =>
                    getFieldValue('pcaDemandDateBefore') &&
                    moment(getFieldValue('pcaDemandDateBefore')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.pcaDemandDateTo`).d('PCA要求日期至')}
              {...formLayout}
            >
              {getFieldDecorator('pcaDemandDateBefore')(
                <DatePicker
                  format={dateFormat}
                  placeholder=""
                  disabledDate={(currentDate) =>
                    getFieldValue('pcaDemandDateAfter') &&
                    moment(getFieldValue('pcaDemandDateAfter')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={`${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}(≥${intl
                .get(`hzero.common.date.unit.day`)
                .d('天')})`}
              {...formLayout}
            >
              {getFieldDecorator(
                'icaDelayDays',
                {}
              )(<InputNumber min={0.1} precision={1} step={0.1} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={`${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}(≥${intl
                .get(`hzero.common.date.unit.day`)
                .d('天')})`}
              {...formLayout}
            >
              {getFieldDecorator(
                'pcaDelayDays',
                {}
              )(<InputNumber min={0} precision={0} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`entity.roles.creator`).d('创建人')} {...formLayout}>
              {getFieldDecorator('createdName', {})(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.publishedName`).d('发布人')} {...formLayout}>
              {getFieldDecorator('publishedName', {})(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.sourceNum`).d('来源单据编号')} {...formLayout}>
              {getFieldDecorator('inspectionNum', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.rectifyTypeCode`).d('整改单类型')}
              {...formLayout}
            >
              {getFieldDecorator(
                'rectifyTypeCode',
                {}
              )(
                <Select allowClear>
                  {rectifyTypeCode.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.erpProblemNum`).d('外部系统单据编号')}
              {...formLayout}
            >
              {getFieldDecorator('erpProblemNum', {})(<Input />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer, onSearch, onReset } = this.props;
    const drawerProps = {
      title: intl.get('hzero.common.button.viewMore').d('更多查询'),
      visible,
      mask: true,
      onClose: () => onHideDrawer(),
      width: 450,
      style: {
        overflowX: 'hidden',
        height: 'calc(100% - 103px)',
        padding: '12px',
      },
    };
    return (
      <Drawer {...drawerProps}>
        {this.renderForm()}
        <footer
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'right',
            padding: '12px 24px',
            borderTop: '1px solid #f5f5f5',
            backgroundColor: '#fff',
          }}
        >
          <Button htmlType="submit" type="primary" onClick={onSearch} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button onClick={onReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
        </footer>
      </Drawer>
    );
  }
}
