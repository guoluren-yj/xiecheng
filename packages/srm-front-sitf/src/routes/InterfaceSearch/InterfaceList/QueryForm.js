/**
 * InterfaceSearch - 接口查询 - 接口列表 - 查询表单
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { isTenantRoleLevel } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 接口查询 - 接口列表 - 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/interface-search/interfaceList' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    const { batchStatus, queryValue } = this.props;
    if (batchStatus && batchStatus !== 'batchStatus') {
      this.handleFormReset();
    } else {
      queryValue();
    }
  }

  /**
   *表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryValue() {
    const { queryValue, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        queryValue(fieldsValue);
      }
    });
  }

  /**
   *渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { queryData = {} } = this.props;

    const level = isTenantRoleLevel();
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    // const oneColSpans = !+level?6 : 8 ;
    const oneColSpans = 6;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            {!+level && (
              <Col span={oneColSpans}>
                <FormItem label={intl.get('entity.tenant.name').d('租户名称')} {...formlayout}>
                  {getFieldDecorator('tenant', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.tenant.name').d('租户名称'),
                        }),
                      },
                    ],
                    initialValue: queryData.tenant,
                  })(
                    <Lov
                      allowClear
                      code="SITF.MONITOR_SYSTEM.TENANT"
                      textField="tenantName"
                      textValue={queryData.tenantName}
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={oneColSpans}>
              <FormItem label={intl.get('entity.interface.code').d('接口代码')} {...formlayout}>
                {getFieldDecorator('interfaceCode')(
                  <Input typeCase="upper" trim inputChinese={false} />
                )}
              </FormItem>
            </Col>
            <Col span={oneColSpans}>
              <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formlayout}>
                {getFieldDecorator('interfaceName')(<Input style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={oneColSpans} className="search-btn-more">
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
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
