/**
 * EcAddressManage -form 电商地址管理-form部分
 * @date: 2019-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-address-manage/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  fetchEcAddress() {
    const { form, onFetchDate } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchDate(values);
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  queryCancle() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                {...formLayout}
                label={intl.get('scec.ecAddressManage.model.Ec.platform.coding').d('电商平台编码')}
              >
                {getFieldDecorator('ecPlatformCode')(<Input inputChinese={false} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                {...formLayout}
                label={intl.get('scec.ecAddressManage.Ec.platform.name').d('电商平台名称')}
              >
                {getFieldDecorator('ecPlatformName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.queryCancle}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.fetchEcAddress}>
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
