import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 币种定义(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(values);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 查询条件展开/收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { expandForm } = this.state;
    const { enabledList = [], customizeFilterForm, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SMDM_CURRENCY.SEARCH',
            form,
            expand: expandForm,
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`smdm.currencyOrg.model.currency.currencyCode`)
                        .d('引用币种代码')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('currencyCode')(
                        <Input typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`smdm.currencyOrg.model.currency.currencyName`)
                        .d('引用币种名称')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('currencyName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`smdm.currencyOrg.model.currency.enabledFlag`).d('是否启用')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('enabledFlag', {
                        initialValue: '1',
                      })(
                        <Select allowClear>
                          {enabledList.map((m) => (
                            <Select.Option key={m.value} value={m.value}>
                              {m.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expandForm
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    style={{ marginLeft: 8 }}
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Fragment>
    );
  }
}
