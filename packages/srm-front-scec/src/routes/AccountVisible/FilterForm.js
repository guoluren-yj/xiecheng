/**
 * AccountVisible - 账号目录可见配置 - 查询表单
 * @date: 2019-12-12
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Select, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/scec/accountVisible/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  handlerSearch() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      currentCompany = [],
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item label="所属公司" {...formLayout}>
                {getFieldDecorator('companyId')(
                  <Lov
                    allowClear={false}
                    textField="companyName"
                    textValue={currentCompany && currentCompany[0] && currentCompany[0].companyName}
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    onChange={this.handleOnChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="目录可见模版" {...formLayout}>
                {getFieldDecorator('configName')(<Input trim />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="状态" {...formLayout}>
                {getFieldDecorator('enabledFlag')(
                  <Select allowClear>
                    <Select.Option value={1} key={1}>
                      {intl.get('hzero.common.status.enable').d('启用')}
                    </Select.Option>
                    <Select.Option value={0} key={0}>
                      {intl.get('hzero.common.status.disable').d('禁用')}
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button style={{ marginRight: 8 }} onClick={() => this.props.form.resetFields()}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.handlerSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
