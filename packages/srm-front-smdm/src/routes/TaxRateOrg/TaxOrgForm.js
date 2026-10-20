/**
 * taxRateOrg - 税率-租户级Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, InputNumber, Select, Row, Col } from 'hzero-ui';

import Switch from 'components/Switch';
import Lov from 'components/Lov';
import ModalForm from 'components/Modal/ModalForm';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 付款方式定义表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class TaxOrgForm extends ModalForm {
  renderForm() {
    const {
      data = {},
      form,
      language,
      taxTypeList = [],
      taxFromList = [],
      taxRateTypeList = [],
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { sourceCode } = data;
    const notEdit = sourceCode && sourceCode !== 'SRM';
    getFieldDecorator('refTaxCode', { initialValue: data.refTaxCode });
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: 'SMDM_TAXRATE_ORG.EDIT_FORM',
            form,
            dataSource: data,
          },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxCode', {
                    initialValue: data.taxCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码'),
                        }),
                      },
                      {
                        max: 20,
                        message: intl.get('hzero.common.validation.max', {
                          max: 20,
                        }),
                      },
                    ],
                  })(<Input disabled={!!data.taxId || notEdit} inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.description`).d('税率描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {
                    initialValue: data.description,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.description`).d('税率描述'),
                        }),
                      },
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get(`smdm.taxRateOrg.model.taxRate.description`).d('税率描述')}
                      disabled={notEdit}
                      field="description"
                      token={data._token}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.taxType`).d('税种')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxType', {
                    initialValue: data.taxType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.taxType`).d('税种'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }}>
                      {taxTypeList.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.taxFrom`).d('税率形式')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxFrom', {
                    initialValue: data.taxFrom || 'RATIO',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.taxFrom`).d('税率形式'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      style={{ width: '100%' }}
                      onChange={() => {
                        setFieldsValue({
                          quotaValue: null,
                          quotaCurrencyId: null,
                          quotaUomId: null,
                        });
                      }}
                    >
                      {taxFromList.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.company`).d('公司')}
                  {...formLayout}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: data.companyId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textValue={data.companyName}
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.taxRateType`).d('税率类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxRateType', {
                    initialValue: data.taxRateType,
                  })(
                    <Select style={{ width: '100%' }}>
                      {taxRateTypeList.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.refTaxCode`).d('平台税率代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('refTaxId', {
                    initialValue: data.refTaxId,
                  })(
                    <Lov
                      code="HPFM.TAX"
                      disabled={notEdit}
                      textValue={data.refTaxCode}
                      queryParams={{ enabledFlag: 1, lang: language }}
                      onChange={(text, record) => {
                        setFieldsValue({
                          refTaxCode: record.taxCode,
                          refDescription: record.description,
                          refTaxRate: record.taxRate,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.taxRateOrg.model.taxRate.refDescription`).d('平台税率描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('refDescription', {
                    initialValue: data.refDescription,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率')}（%）`}
                  {...formLayout}
                >
                  {getFieldDecorator('taxRate', {
                    initialValue: data.taxRate,
                    rules: [
                      {
                        required: getFieldValue('taxFrom') !== 'QUOTA',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      precision={3}
                      min={0}
                      max={100}
                      disabled={notEdit}
                      style={{ width: '314.66px' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl
                    .get(`smdm.taxRateOrg.model.taxRate.refTaxRate`)
                    .d('平台税率')}（%）`}
                  {...formLayout}
                >
                  {getFieldDecorator('refTaxRate', {
                    initialValue: data.refTaxRate,
                  })(<InputNumber precision={3} disabled style={{ width: '314.66px' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl.get(`smdm.taxRateOrg.model.taxRate.quotaValue`).d('定额税值')}`}
                  {...formLayout}
                >
                  {getFieldDecorator('quotaValue', {
                    initialValue: data.quotaValue,
                    rules: [
                      {
                        required: getFieldValue('taxFrom') === 'QUOTA',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.taxRateOrg.model.taxRate.quotaValue`).d('定额税值'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '314.66px' }}
                      disabled={getFieldValue('taxFrom') !== 'QUOTA'}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl
                    .get(`smdm.taxRateOrg.model.taxRate.quotaCurrencyId`)
                    .d('定额税币种')}`}
                  {...formLayout}
                >
                  {getFieldDecorator('quotaCurrencyId', {
                    initialValue: data.quotaCurrencyId,
                    rules: [
                      {
                        required: getFieldValue('taxFrom') === 'QUOTA',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.taxRateOrg.model.taxRate.quotaCurrencyId`)
                            .d('定额税币种'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SMDM.CURRENCY"
                      queryParams={{ enabledFlag: 1 }}
                      textValue={data.currencyName}
                      disabled={getFieldValue('taxFrom') !== 'QUOTA'}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl.get(`smdm.taxRateOrg.model.taxRate.quotaUomId`).d('定额税单位')}`}
                  {...formLayout}
                >
                  {getFieldDecorator('quotaUomId', {
                    initialValue: data.quotaUomId,
                    rules: [
                      {
                        required: getFieldValue('taxFrom') === 'QUOTA',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.taxRateOrg.model.taxRate.quotaUomId`)
                            .d('定额税单位'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SMDM.UOM"
                      queryParams={{ enabledFlag: 1 }}
                      lovOptions={{ valueField: 'uomId' }}
                      textValue={data.uomName}
                      disabled={getFieldValue('taxFrom') !== 'QUOTA'}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={`${intl.get(`smdm.taxRateOrg.model.taxRate.orderSeq`).d('排序号')}`}
                  {...formLayout}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: data.orderSeq,
                  })(<InputNumber style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('smdm.taxRateOrg.model.taxRate.includedTaxFlag').d('是否含税')}
                  {...formLayout}
                >
                  {getFieldDecorator('includedTaxFlag', {
                    initialValue: data.includedTaxFlag || 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get('smdm.taxRateOrg.model.taxRate.consumptionTaxFlag')
                    .d('是否记消费税')}
                  {...formLayout}
                >
                  {getFieldDecorator('consumptionTaxFlag', {
                    initialValue: data.consumptionTaxFlag || 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('smdm.taxRateOrg.model.taxRate.isDefault').d('是否默认')}
                  {...formLayout}
                >
                  {getFieldDecorator('defaultFlag', {
                    initialValue: data.defaultFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={intl.get(`hzero.common.status.enable`).d('启用')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: data.enabledFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
