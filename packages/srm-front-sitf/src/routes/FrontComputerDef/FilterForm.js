/**
 * FrontComputerModal -前置机定义 查询页
 * @date: 2018-11-23
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/front-computer-def' })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }
  /**
   * 查询
   */

  @Bind()
  handleSearch() {
    const { onFetchDate, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchDate({ ...values });
      }
    });
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl.get('sitf.common.frontEndSystem.code').d('前置机代码')}
              {...formlayout}
            >
              {getFieldDecorator('frontEndSystemCode')(
                <Input typeCase="upper" trim inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('sitf.common.frontEndSystem.name').d('前置机名称')}
              {...formlayout}
            >
              {getFieldDecorator('frontEndSystemName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
