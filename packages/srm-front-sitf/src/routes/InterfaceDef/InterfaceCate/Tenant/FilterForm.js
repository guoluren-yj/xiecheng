/**
 * InterfaceTableModal -接口类别定义 -form 中间表
 * @date: 2018-11-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  fetchInterfaceDef() {
    const { form, onFetchInterfaceData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchInterfaceData({
          ...values,
        });
      }
    });
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
                .get('sitf.interfaceCate.model.interfaceCate.externalSystemCode')
                .d('外部系统')}
              {...formlayout}
            >
              {getFieldDecorator('externalSystemCode')(<Lov code="SITF.ES_RELATIONS" />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('sitf.interfaceCate.model.interfaceCate.tableName').d('表名称')}
              {...formlayout}
            >
              {getFieldDecorator('tableName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get('sitf.interfaceCate.model.interfaceCate.tableDescription')
                .d('表描述')}
              {...formlayout}
            >
              {getFieldDecorator('tableDescription')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
