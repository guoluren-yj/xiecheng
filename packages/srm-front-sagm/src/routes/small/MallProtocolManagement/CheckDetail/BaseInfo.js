import React from 'react';
import { Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';

import style from './index.less';

@Form.create({ fieldNameProp: null })
export default class HandWork extends React.Component {
  render() {
    const { form, initData, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    const {
      remarkMeaning,
      sourceFrom,
      versionNum,
      companyName,
      agreementName,
      agreementNumber,
      sourceFromMeaning,
      paymentTypeMeaning,
      materialTypeMeaning,
      supplierCompanyName,
      agreementTypeMeaning,
    } = initData;
    return (
      <React.Fragment>
        {customizeForm(
          {
            form,
            code:
              sourceFrom === 'PRICE'
                ? 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_PRICE_LIB'
                : 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL',
          },
          <Form className={style.form}>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementNum').d('协议编号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('agreementNumber')(<span>{agreementNumber}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementName').d('协议名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('agreementName')(<span>{agreementName}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.version').d('版本')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('versionNum')(
                    <span>{versionNum ? `v${versionNum}` : '-'}</span>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.company').d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyId')(<span>{companyName}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.materialType').d('物资类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('materialType')(<span>{materialTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.agreementType').d('协议类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('agreementType')(<span>{agreementTypeMeaning}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.supplier').d('供应商')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('supplierTenantId')(<span>{supplierCompanyName}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.paymentMethod').d('支付方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentType')(<span>{paymentTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.documentSource').d('单据来源')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceFrom')(<span>{sourceFromMeaning}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={48}
              style={{ marginTop: 6 }}
              className="writable-row last-form-item half-row"
            >
              <Col span={12}>
                <Form.Item
                  className={style.remark}
                  label={intl.get('small.common.model.markInfo').d('备注信息')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('remark')(<span>{remarkMeaning}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
