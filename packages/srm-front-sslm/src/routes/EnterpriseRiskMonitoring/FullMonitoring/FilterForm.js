import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();
/**
 * 风险监控表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    // this.state = {
    //   expandForm: false,
    // };
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
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { onToggle } = this.props;
    onToggle();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      tabKey,
      isErpList = [],
      form: { getFieldDecorator },
      expand,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.riskMonitoring.model.riskMonitoring.companyNum`)
                    .d('企业编码')}
                >
                  {getFieldDecorator('companyNum')(<Input typeCase="upper" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.riskMonitoring.model.riskMonitoring.companyName`)
                    .d('企业名称')}
                >
                  {getFieldDecorator('companyName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.riskMonitoring.model.riskMonitoring.sourceCode`)
                    .d('是否ERP')}
                >
                  {getFieldDecorator('sourceCode')(
                    <Select allowClear>
                      {isErpList.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {tabKey === 'all' && (
              <Row style={{ display: expand ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.riskMonitoring.model.riskMonitoring.monitorGroupId`)
                      .d('所属组别')}
                  >
                    {getFieldDecorator('monitorGroupId')(
                      <Lov
                        code="SSLM.MONITOR_GROUP"
                        textField="monitorGroupName"
                        queryParams={{ tenantId }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              {tabKey === 'all' && (
                <Button onClick={this.toggleForm}>
                  {expand
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
              )}
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
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
