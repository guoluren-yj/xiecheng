import React, { Component } from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const promptCode = 'ssrc.sourceTemplate';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/source-template/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch({});
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  renderSourceCategory = (list) => {
    const { useRFContent = 'ALL', useRF = false } = this.props;
    let config = [];
    if (!useRF) {
      config = [...list.filter((item) => item.value !== 'RFP' && item.value !== 'RFI')];
      return config;
    }
    if (useRFContent === 'ALL') {
      return list;
    } else if (useRFContent === 'RFI') {
      config = [...list.filter((item) => item.value !== 'RFP')];
      return config;
    } else if (useRFContent === 'RFP') {
      config = [...list.filter((item) => item.value !== 'RFI')];
      return config;
    } else {
      return [];
    }
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, sourceCategory = [], isBid, secondarySourceCategory } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.template.templateNum`).d('模板编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator(
                      'templateNum',
                      {}
                    )(<Input trim typeCase="upper" inputChinese={false} maxLength={40} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.template.templateName`).d('模板名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('templateName', {})(<Input trim maxLength={40} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.template.sourcingCategory`).d('寻源类别')}
                    {...formLayout}
                  >
                    {getFieldDecorator(
                      isBid ? 'secondarySourceCategory' : 'sourceCategory',
                      {}
                    )(
                      <Select allowClear>
                        {this.renderSourceCategory(
                          isBid ? secondarySourceCategory : sourceCategory
                        ).map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
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
      </React.Fragment>
    );
  }
}
