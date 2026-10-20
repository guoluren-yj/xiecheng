/**
 * QueryForm - 接口清理 - 查询表单
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryInterfaceClean, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onQueryInterfaceClean();
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { externalSystemCode, externalSystemName } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem
                label={intl.get('sitf.common.data.externalSystemName').d('外部系统名称')}
                {...formlayout}
              >
                {getFieldDecorator('externalSystemCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
                      }),
                    },
                  ],
                  initialValue: externalSystemCode,
                })(<Lov code="SIFC.EXTERNAL_SYSTEM" textValue={externalSystemName} />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button type="primary" onClick={() => this.queryData()} htmlType="submit">
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
