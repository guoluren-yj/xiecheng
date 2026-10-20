/**
 * GoodsManage -商品下架审批 表单Form页面
 * @date: 2019-12-9
 * @author zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Select, Row, Col, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import Lov from 'components/Lov';

const { Option } = Select;

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: getCurrentOrganizationId(),
    };
  }

  @Bind()
  handlerSearch() {
    const { form, onFetchGoods } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchGoods(values);
      }
    });
  }

  @Bind()
  handlerFormReset() {
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

  /* 选择公司Lov
   * @param {String} val 当前值
   * @param {Object} record 选择值
   */
  @Bind()
  selectCompany() {
    this.props.form.resetFields(['supplierId']);
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      sourceType = [],
    } = this.props;
    const { display, tenantId } = this.state;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.productNum').d('商品编码')}
                {...formlayout}
              >
                {getFieldDecorator('productNum')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.productName').d('商品名称')}
                {...formlayout}
              >
                {getFieldDecorator('productName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.effectiveDays').d('有效天数')}
                {...formlayout}
              >
                {getFieldDecorator('effectiveDays', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (value && isNaN(value)) {
                          callback(
                            new Error(
                              intl
                                .get('scec.common.warning.standard.effectiveDays.fallShort')
                                .d('有效天数不符规范')
                            )
                          );
                        } else if (value && !new RegExp(/^(-)?(\d{0,8}$)/).test(value)) {
                          callback(
                            new Error(
                              intl
                                .get('scec.common.warning.standard.effectiveDays.overSize')
                                .d('有效天数超过限制')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(<InputNumber />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={() => this.toggleForm()}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={() => this.toggleForm()}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.handlerFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handlerSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
            <Col span={6}>
              <Form.Item label={intl.get('scec.common.model.company').d('公司')} {...formlayout}>
                {getFieldDecorator('companyId')(
                  <Lov
                    code="HPFM.COMPANY"
                    queryParams={{ tenantId }}
                    onChange={() => this.selectCompany()}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={intl.get('scec.common.model.supplier').d('供应商')} {...formlayout}>
                {getFieldDecorator('supplierId')(
                  <Lov
                    code="SCEC.COMPANY_SUPPLIER"
                    disabled={!getFieldValue('companyId')}
                    queryParams={{
                      companyId: getFieldValue('companyId'),
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.sourceFromType').d('数据来源')}
                {...formlayout}
              >
                {getFieldDecorator('sourceFromType')(
                  <Select allowClear>
                    {sourceType.map(item => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.sourceFromNum').d('来源单号')}
                {...formlayout}
              >
                {getFieldDecorator('sourceFromNum')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.createdUserName').d('创建人')}
                {...formlayout}
              >
                {getFieldDecorator('applyUserName')(<Input />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
