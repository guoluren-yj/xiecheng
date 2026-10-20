/**
 * FilterForm - 企业信息变更申请表单
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useEffect } from 'react';
import { Input, Button, Form, Row, Col } from 'hzero-ui';
import { compose } from 'lodash';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FilterForm = ({
  form: { getFieldDecorator, validateFields, resetFields },
  form,
  onSearch,
  queryApplicationLoading,
  onRef = () => {},
}) => {
  const handleSearch = () => {
    validateFields((err) => {
      if (err) return;
      if (onSearch) onSearch();
    });
  };

  useEffect(() => {
    if (onRef) {
      onRef(form);
    }
  }, []);

  return (
    <Form layout="inline" className="more-fields-form">
      <Row gutter={24}>
        <Col span={18}>
          <Row>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.model.application.changeReqNumber')
                  .d('申请单号')}
              >
                {getFieldDecorator('changeReqNumber')(<Input typeCase="upper" />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.model.application.companyName')
                  .d('企业名称')}
              >
                {getFieldDecorator('companyId')(
                  <Lov code="SSLM.FIRM_CHANGE_COMPANY" queryParams={{ tenantId }} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Col>
        <Col span={6} className="search-btn-more">
          <FormItem>
            <Button data-code="reset" onClick={() => resetFields()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button
              data-code="search"
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              loading={queryApplicationLoading}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

export default compose(
  Form.create({ fieldNameProp: null }),
  cacheComponent({ cacheKey: '/sslm/enterprise-inform-change/list' })
)(FilterForm);
