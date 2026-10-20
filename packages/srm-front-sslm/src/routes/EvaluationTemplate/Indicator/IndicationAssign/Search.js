/*
 * @Date: 2022-09-16 15:12:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isFunction } from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { Form, Row, Col, Button, Input } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
  style: { width: '100%' },
};

const Search = ({
  onSearch,
  radioValue,
  form: { getFieldDecorator, getFieldsValue, resetFields },
  onWithParamsSearch,
}) => {
  useEffect(() => {
    onWithParamsSearch(handleSearch);
  }, []);

  // 重置
  const handleReset = useCallback(() => {
    resetFields();
  }, []);

  // 查询
  const handleSearch = useCallback(() => {
    const filterValues = getFieldsValue();
    if (isFunction(onSearch)) {
      onSearch(filterValues);
    }
  }, []);

  return (
    <Form layout="inline" style={{ marginTop: 16 }}>
      <Row>
        <Col span={18}>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierKpiIndicator.model.supplier.respUserName')
                  .d('用户描述')}
              >
                {getFieldDecorator('respUserName')(<Input />)}
              </FormItem>
            </Col>
            {radioValue === 'RESP_SUPPLIER' && (
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input />)}
                </FormItem>
              </Col>
            )}
            {radioValue === 'RESP_SUPPLIER' && (
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.code`).d('供应商编码')}
                >
                  {getFieldDecorator('supplierCompanyNum')(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <FormItem style={{ marginLeft: 8, marginRight: 8 }}>
            <Button onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              style={{ marginRight: -16 }}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

export default Form.create({ fieldNameProp: null })(Search);
