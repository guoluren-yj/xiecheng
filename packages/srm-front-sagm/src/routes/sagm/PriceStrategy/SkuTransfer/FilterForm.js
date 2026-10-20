import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Form, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';

import style from './index.less';

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
    this.state = {
      fold: true,
    };
    // 缓存搜索内容
    this.cacheState = React.createRef();
  }

  /**
   * 重置
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
    this.cacheState.current.form = null;
  }

  @Bind()
  getFieldsForm() {
    const {
      queryFields = [],
      form: { getFieldDecorator, getFieldsValue, setFieldsValue },
      queryFieldsLimit,
    } = this.props;
    const { fold } = this.state;
    const currentForm = getFieldsValue();
    const keys = Object.keys(currentForm);
    const unFoldQueryFields = queryFields.slice(0, queryFieldsLimit);
    const list = fold ? unFoldQueryFields : queryFields;
    const _currentForm = currentForm;
    for (const item of list) {
      if (!item.required) {
        delete _currentForm[item.key];
      }
    }
    return list.map((fields) => {
      const {
        type = 'input',
        key,
        label,
        required,
        componentProps = {},
        // onChange = e => e,
      } = fields;
      const filterKeys = keys.filter((f) => f !== key);
      const isRequired = filterKeys.every((s) => !_currentForm[s]);
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
            })(
              FormComponent({
                ...componentProps,
                onChange: () => {
                  setFieldsValue(currentForm);
                  this.cacheState.current = { form: getFieldsValue() };
                },
              })
            )}
          </Form.Item>
        </Col>
      );
    });
  }

  @Bind()
  unfoldMoreQueryFields() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { fold } = this.state;
    this.setState({ fold: !fold }, () => {
      if (fold && this.cacheState.current) {
        setFieldsValue(this.cacheState.current.form);
      }
    });
  }

  render() {
    const { onSearch, queryFields = [], queryFieldsLimit } = this.props;
    const { fold } = this.state;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row gutter={10} className={style['transfer-col-18-row']}>
                {this.getFieldsForm()}
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                {queryFields.length > queryFieldsLimit ? (
                  fold ? (
                    <Button onClick={this.unfoldMoreQueryFields}>
                      {intl.get('hzero.common.button.viewMore').d('更多查询')}
                    </Button>
                  ) : (
                    <Button onClick={this.unfoldMoreQueryFields}>
                      {intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                  )
                ) : null}
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
