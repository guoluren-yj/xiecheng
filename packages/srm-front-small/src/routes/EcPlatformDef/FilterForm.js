/**
 * EcPlatformDef -form 电商平台定义-form部分
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

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/small/ec-platform-def' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  fetchEcPlatformList() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData(values);
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
                label={intl.get('small.ecplatformDef.model.Ec.platform.coding').d('电商平台编码')}
              >
                {getFieldDecorator('ecPlatformCode')(<Input inputChinese={false} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.ecplatformDef.model.Ec.platform.name').d('电商平台名称')}
              >
                {getFieldDecorator('ecPlatformName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.queryCancle}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.fetchEcPlatformList}>
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
