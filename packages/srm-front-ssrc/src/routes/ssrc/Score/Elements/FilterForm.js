import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const promptCode = 'ssrc.score';

/**
 * 评分要素表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.score'] })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      display: true,
    };
  }

  componentWillUnmount() {
    const { form } = this.props;

    if (form) {
      form.resetFields();
    }
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
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  getFilterForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { display = true } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.score.indicateCode`).d('评分要素编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator(
                    'indicateCode',
                    {}
                  )(<Input trim typeCase="upper" inputChinese={false} maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicateName', {})(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }} />
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                {!display
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
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
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, customizeFilterForm } = this.props;
    const { display = true } = this.state;

    return (
      <div>
        {customizeFilterForm
          ? customizeFilterForm(
              {
                code: 'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_FILTER',
                form,
                expand: display, // 控制查询表单收起展开状态的参数
              },
              this.getFilterForm()
            )
          : this.getFilterForm()}
      </div>
    );
  }
}
