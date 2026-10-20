/**
 * InterfaceCateDef -接口类别定义页面
 * @date: 2018-11-23
 * @author DTM <tingmin.deng@hand-china.com>
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
@CacheComponent({ cacheKey: '/sitf/interface-cate-def' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  fetchInterfaceCateDef() {
    const { onFetchData, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryCode`)
                .d('接口类别代码')}
              {...formlayout}
            >
              {getFieldDecorator('interfaceCategoryCode')(
                <Input typeCase="upper" trim inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryDesc`)
                .d('接口类别描述')}
              {...formlayout}
            >
              {getFieldDecorator('interfaceCategoryName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchInterfaceCateDef}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
