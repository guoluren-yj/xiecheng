import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  /**
   * 列表查询表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 采购员列表查询表单重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const { tenantId, form, customizeFilterForm } = this.props;
    const { getFieldDecorator } = form;
    const { display = true } = this.state;
    const statusMap = [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.enableFlag').d('启用'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ];
    return (
      <>
        {customizeFilterForm(
          {
            code: 'SPFM_ORG-INFO_OPERATION-UNIT.SEARCH',
            form,
            expand: !display,
          },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      {...formLayout}
                      label={intl
                        .get('hpfm.operationUnit.model.operationUnit.ouCode')
                        .d('业务实体编码')}
                    >
                      {getFieldDecorator('ouCode', {
                        initialValue: '',
                      })(<Input trim inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formLayout}
                      label={intl
                        .get('hpfm.operationUnit.model.operationUnit.ouName')
                        .d('业务实体名称')}
                    >
                      {getFieldDecorator('ouName', {
                        initialValue: '',
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...formLayout} label={intl.get('entity.company.tag').d('公司')}>
                      {getFieldDecorator('companyId')(
                        <Lov code="LOV_COMPANY " queryParams={{ tenantId }} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      {...formLayout}
                      label={intl
                        .get('hpfm.operationUnit.model.operationUnit.purchaseOrganization')
                        .d('采购组织')}
                    >
                      {getFieldDecorator('purchaseOrgId')(
                        <Lov code="SSLM.KPI_EVAL_DIM_PURORG" queryParams={{ tenantId }} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <FormItem {...formLayout} label={intl.get('hzero.common.status').d('状态')}>
                      {getFieldDecorator('enabledFlag')(
                        <Select allowClear>
                          {statusMap.map((n) => (
                            <Select.Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <FormItem>
                  {display ? (
                    <Button onClick={this.toggleForm}>
                      {intl.get('hzero.common.button.viewMore').d('更多查询')}
                    </Button>
                  ) : (
                    <Button onClick={this.toggleForm}>
                      {intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                  )}
                  <Button onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ marginLeft: 8 }}
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </>
    );
  }
}
