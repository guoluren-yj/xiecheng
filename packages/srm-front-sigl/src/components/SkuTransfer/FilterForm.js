import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Form, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const getComponent = (type = 'input') => {
  const ComponentMap = {
    input: (props) => <Input {...props} />,
    lov: (props) => <Lov {...props} />,
  };
  const DefaultComponent = (props) => <Input {...props} />;
  return ComponentMap[type] || DefaultComponent;
};

@Form.create({ fieldNameProp: null })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 重置
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  @Bind()
  getFieldsForm() {
    const {
      queryFields = [],
      form: { getFieldDecorator, getFieldsValue, setFieldsValue },
    } = this.props;
    const currentForm = getFieldsValue();
    const keys = Object.keys(currentForm);
    return queryFields.map((fields) => {
      const {
        type = 'input',
        key,
        label,
        required,
        componentProps = {},
        // onChange = e => e,
      } = fields;
      const filterKeys = keys.filter((f) => f !== key);
      const isRequired = filterKeys.every((s) => !currentForm[s]);
      const FormComponent = getComponent(type);
      return (
        <Col span={8}>
          <Form.Item label={label} {...formLayout}>
            {getFieldDecorator(key, {
              rules: [
                {
                  required: required && isRequired,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: label,
                  }),
                },
              ],
            })(FormComponent({ ...componentProps, onChange: () => setFieldsValue(currentForm) }))}
          </Form.Item>
        </Col>
      );
    });
  }

  render() {
    const { onSearch } = this.props;

    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row gutter={12}>{this.getFieldsForm()}</Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button data-code="reset" onClick={this.reset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={onSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
