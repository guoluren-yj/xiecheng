/**
 * QueryForm - 接口定义 - 查询条件
 * @date: 2019-01-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Input, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/seci-interface-def' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  fetchInterfaceDef() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  /**
   * 重置
   */
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline">
          <Form.Item label={intl.get('entity.interface.code').d('接口代码')}>
            {getFieldDecorator('interfaceCode')(
              <Input typeCase="upper" trim inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item label={intl.get('entity.interface.name').d('接口名称')}>
            {getFieldDecorator('interfaceName')(<Input />)}
          </Form.Item>
          <FormItem>
            <Button type="primary" onClick={() => this.fetchInterfaceDef()} htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.queryReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
