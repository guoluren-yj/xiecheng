/**
 * EcAddressManage -form 电商地址管理-form部分
 * @date: 2019-1-18
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

const modelPrompt = 'scec.ecAddressManage';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-address-manage/detail' })
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
      queryCode,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl.get(`${modelPrompt}.model.regionNameCode`).d('地址名称/编码')}
            >
              {getFieldDecorator('regionNameOrCode')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl.get(`${modelPrompt}.model.mapStatus`).d('映射状态')}
            >
              {getFieldDecorator('mappingState')(
                <Select allowClear>
                  {queryCode.map(item => {
                    return (
                      <Option label={item.meaning} value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginLeft: 8 }} onClick={this.queryCancle}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchEcPlatformList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
