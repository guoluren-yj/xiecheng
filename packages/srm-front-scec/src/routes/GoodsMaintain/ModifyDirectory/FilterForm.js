/**
 * GoodsMaintain -目录修改 -form
 * @date: 2019-2-20
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  queryByCondition() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData(values);
      }
    });
  }

  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline">
            <Form.Item label={intl.get('scec.common.model.catalogCode').d('目录代码')}>
              {getFieldDecorator('catalogCode')(<Input />)}
            </Form.Item>
            <Form.Item label={intl.get('scec.common.model.catalogName').d('目录名称')}>
              {getFieldDecorator('catalogName')(<Input />)}
            </Form.Item>
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.queryByCondition}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
