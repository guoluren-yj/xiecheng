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
@formatterCollections({ code: ['ssrc.score'] })
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
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
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      indicateId,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.score.indicateDetailCode`)
                    .d('评分要素细项编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicateCode', {})(
                    <Input trim typeCase="upper" inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.score.indicateDetailName`)
                    .d('评分要素细项名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicateName', {})(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                    disabled={indicateId === 'create'}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
