/**
 * FilterForm - 企业信息变更申请表单
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useEffect, useState } from 'react';
import { Input, Button, Form, Row, Col, Select } from 'hzero-ui';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FilterForm = ({
  isTenant,
  form: { getFieldDecorator, validateFields, resetFields },
  form,
  onSearch,
  activeKey,
  loading,
  approveStatus = [],
  onRef = () => {},
  customizeFilterForm,
  custLoading,
}) => {
  const handleSearch = () => {
    validateFields(err => {
      if (err) return;
      if (onSearch) onSearch();
    });
  };
  const [expand, setExpand] = useState(false);
  const toggleForm = () => {
    setExpand(!expand);
  };
  useEffect(() => {
    onRef(form);
    handleSearch();
  }, [activeKey]);
  return customizeFilterForm(
    {
      code: 'SSLM.ENTERPRISE_INFORM_CONFIRM.TENANT_FILTER', // 单元编码，必传
      form,
      expand, // 控制查询表单收起展开状态的参数
    },
    <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
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
                  <Lov
                    code="SSLM.COMPANY_PARTNER_NEW"
                    queryParams={{ tenantId, asyncCountFlag: 'Y' }}
                    textField="partnerCompanyName"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.model.application.approvalStatus')
                  .d('申请状态')}
              >
                {getFieldDecorator('reqStatus')(
                  <Select allowClear>
                    {approveStatus.map(item => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: expand ? 'block' : 'none' }}>
            {isTenant && (
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('categoryIdStr')(
                    <LovMultiple
                      textField="categoryDescription"
                      code="SSLM.SUPPLIER_CATEGORY"
                      queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
        </Col>
        <Col span={6} className="search-btn-more">
          <FormItem>
            <Button onClick={toggleForm}>
              {expand
                ? intl.get('hzero.common.button.collected').d('收起查询')
                : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
            </Button>
            <Button data-code="reset" onClick={() => resetFields()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button
              data-code="search"
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              loading={loading}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};
export default FilterForm;
