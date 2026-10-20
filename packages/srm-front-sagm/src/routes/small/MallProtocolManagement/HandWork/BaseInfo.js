import React from 'react';
import { Form, Row, Col, Input, Select } from 'hzero-ui';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import { EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz';

import { dateTimeRender } from 'utils/renderer';
import { protocalUnitCode } from '../../const/uniCode';

import style from './index.less';

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

// const RadioGroup = Radio.Group;
@withCustomize({
  unitCode: [protocalUnitCode.edit],
})
@Form.create({ fieldNameProp: null })
export default class BaseInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      visible: false,
    };
  }

  handleToggleModal = (sure = false) => {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    this.setState({ visible: !this.state.visible }, () => {
      if (sure) {
        setFieldsValue({
          freightType: getFieldValue('freightType'),
        });
      }
    });
  };

  render() {
    const {
      initData,
      customizeForm,
      isDisabled,
      agreementId,
      agreementTypes,
      materialTypes,
      agreementFroms,
      paymentTypes,
      onChangeSupplier = (e) => e,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    return (
      <React.Fragment>
        {customizeForm(
          // {
          //   code:
          //     initData.sourceFrom === 'PRICE'
          //       ? 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_PRICE_LIB'
          //       : 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL',
          //   form: this.props.form,
          // },
          {
            code: protocalUnitCode.edit,
            form: this.props.form,
            dataSource: initData,
          },
          <Form className={style.form}>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementNum').d('协议编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementNumber', {
                    initialValue: initData.agreementNumber,
                    rules: [
                      {
                        // required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.agreementNum').d('协议编号'),
                        }),
                      },
                    ],
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementName').d('协议名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementName', {
                    initialValue: initData.agreementName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.agreementName').d('协议名称'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get('small.common.model.agreementName').d('协议名称')}
                      field="agreementName"
                      token={initData._token}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('small.common.model.version').d('版本')} {...formLayout}>
                  {getFieldDecorator('versionNum', {
                    initialValue: initData.versionNum ? `v${initData.versionNum}` : '',
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.documentSource').d('单据来源')}
                  {...formLayout}
                >
                  {getFieldDecorator('sourceFrom', {
                    initialValue: initData.sourceFrom || 'MANUAL',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.documentSource').d('单据来源'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      disabled={isDisabled || agreementId}
                    >
                      {agreementFroms &&
                        agreementFroms.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementStatus').d('协议状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementStatus', {
                    initialValue:
                      initData.agreementStatusMeaning ||
                      intl.get('small.common.model.create').d('新建'),
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.view.creationDate').d('创建时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: dateTimeRender(initData.creationDate),
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item label={intl.get('small.common.model.company').d('公司')} {...formLayout}>
                  {getFieldDecorator('companyId', {
                    initialValue: initData.companyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.company').d('公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      allowClear={false}
                      disabled={isDisabled || agreementId}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textValue={initData.companyName}
                      textField="companyName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        lovCode: 'SPFM.USER_AUTH.COMPANY',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.materialType').d('物资类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('materialType', {
                    initialValue: initData.materialType || 'COMMEN_MATERIAL',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.materialType').d('物资类型'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear style={{ width: '100%' }}>
                      {materialTypes &&
                        materialTypes.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementType').d('协议类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementType', {
                    initialValue: initData.agreementType || 'NORMAL',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.agreementType').d('协议类型'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear style={{ width: '100%' }} disabled={isDisabled}>
                      {agreementTypes &&
                        agreementTypes.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.supplier').d('供应商')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierTenantId', {
                    initialValue: initData.supplierTenantId,
                  })}
                  {getFieldDecorator('supplierCompanyId', {
                    initialValue: initData.supplierCompanyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.supplier').d('供应商'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      allowClear={false}
                      code="SMAL.SUPPLIER_BY_PUR"
                      textValue={initData.supplierCompanyName}
                      lovOptions={{
                        displayField: 'supplierName',
                        valueField: 'supplierId',
                      }}
                      onChange={(_, data) => {
                        const prevTenantId = getFieldValue('supplierTenantId');
                        if (prevTenantId !== data.supplierTenantId) {
                          onChangeSupplier(data.supplierTenantId);
                          setFieldsValue({ supplierTenantId: data.supplierTenantId });
                        }
                      }}
                      disabled={!getFieldValue('companyId') || isDisabled || agreementId}
                      queryParams={{
                        companyId: getFieldValue('companyId'),
                        tenantId: getCurrentOrganizationId(),
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.paymentMethod').d('支付方式')}
                  {...formLayout}
                >
                  {getFieldDecorator('paymentType', {
                    initialValue: initData.paymentType || 'PERIOD_PAYMENT',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.paymentMethod').d('支付方式'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear style={{ width: '100%' }}>
                      {paymentTypes &&
                        paymentTypes.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={48}
              style={{ marginTop: 6 }}
              // className="writable-row last-form-item half-row"
            >
              <Col span={8}>
                <Form.Item
                  // className={style.remark}
                  label={intl.get('small.common.model.markInfo').d('备注信息')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('remark', {
                    initialValue: initData.remarkMeaning || initData.remark,
                    rules: [
                      {
                        max: 60,
                        message: intl.get('hzero.common.validation.max', {
                          max: 60,
                        }),
                      },
                    ],
                  })(<Input.TextArea rows={4} />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
