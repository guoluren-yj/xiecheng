/*
 * CompanyInfo - CA认证-企业信息
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-8-5 16:09:07
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isFunction, isNil } from 'lodash';
// import ValueList from 'components/ValueList';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

@Form.create({ fieldNameProp: null })
export default class CompanyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  @Bind()
  handleChangeLegalLocale(val) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const arrInclueds = ['1', '2', '3', '4', 1, 2, 3, 4];
    setFieldsValue({ legalDocumentType: arrInclueds.includes(val) ? 'P' : 'I' });
  }

  render() {
    const {
      form = {},
      detailDataSource = {},
      companyEditable = false,
      certificatesType = '',
      legalPersonPlace = '',
      amountDisabled = false,
    } = this.props;
    const {
      companyName,
      unifiedSocialCode,
      legalName,
      legalIdNum,
      legalDocumentTypeMeaning,
      legalLocale,
      legalLocaleMeaning,
    } = detailDataSource;
    const legalLocaleFlag = isNil(legalLocale) ? '0' : String(legalLocale);
    const { getFieldDecorator = (e) => e } = form;
    return (
      <Form>
        <Row
          className={classnames(companyEditable ? 'writable-row' : 'read-row')}
          {...EDIT_FORM_ROW_LAYOUT}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('entity.company.name').d('公司名称')}
            >
              {companyName}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.Credit`)
                .d('社会统一信用代码')}
            >
              {unifiedSocialCode}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.legal`)
                .d('法定代表人')}
            >
              {companyEditable
                ? getFieldDecorator(`legalName`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.certificateAuthority.legal`)
                            .d('法定代表人'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', { max: 30 }),
                      },
                    ],
                    initialValue: legalName,
                  })(<Input disabled={amountDisabled} />)
                : legalName}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(companyEditable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.certificateAuthority.model.legalLocale`).d('法人归属地')}
            >
              {companyEditable
                ? getFieldDecorator('legalLocale', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.legalLocale`)
                            .d('法人归属地'),
                        }),
                      },
                    ],
                    // initialValue: legalLocaleMeaning,
                    initialValue: legalLocaleFlag,
                  })(
                    <Select
                      showSearch
                      style={{ width: '150px' }}
                      allowClear
                      onChange={this.handleChangeLegalLocale}
                      disabled={amountDisabled}
                    >
                      {(legalPersonPlace || []).map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : legalLocaleMeaning}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.certificateType`)
                .d('证件类型')}
            >
              {companyEditable
                ? getFieldDecorator('legalDocumentType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(
                              `spfm.certificateAuthority.model.certificateAuthority.certificateType`
                            )
                            .d('证件类型'),
                        }),
                      },
                    ],
                    initialValue: [1, 2, 3, 4].includes(legalLocale) ? 'P' : 'I',
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear disabled>
                      {(certificatesType || []).map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : legalDocumentTypeMeaning}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.certificateAuthority.model.certificate.ID`).d('证件号码')}
            >
              {companyEditable
                ? getFieldDecorator('legalIdNum', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.certificate.ID`)
                            .d('证件号码'),
                        }),
                      },
                      {
                        pattern: /^[0-9a-zA-Z]{1,}$/,
                        message: intl.get('hzero.common.certificate.ID').d('证件格式不正确'),
                      },
                    ],
                    initialValue: legalIdNum,
                  })(<Input disabled={amountDisabled} />)
                : legalIdNum}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
