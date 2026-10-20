import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { connect } from 'dva';

import DelCache from '@/components/DelCache';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */

@connect(({ mallProtocolManagement }) => ({
  mallProtocolManagement,
}))
@Form.create({ fieldNameProp: null })
@DelCache({ cacheKey: '/small/mall-protocol-management/list2' })
@cacheComponent({ cacheKey: '/small/mall-protocol-management/list2' })
export default class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  handleOK() {
    const { onHidden, onSearch } = this.props;
    onSearch();
    onHidden();
  }

  @Bind()
  handleReset() {
    const { form, onHandleChange } = this.props;
    const params = {
      agreementName: undefined,
      companyId: undefined,
      companyName: undefined,
      supplierCompanyId: undefined,
      supplierCompanyName: undefined,
    };
    form.resetFields();
    onHandleChange(params, true);
  }

  @Bind()
  lovChange(val, record) {
    const { form, onHandleChange } = this.props;
    if (!record.companyId) form.setFields({ supplierCompanyId: undefined });
    onHandleChange({ companyId: val, companyName: record.companyName });
  }

  @Bind()
  supLovChange(val, record) {
    const { onHandleChange } = this.props;
    onHandleChange({ supplierCompanyId: val, supplierCompanyName: record.supplierName });
  }

  render() {
    const {
      form,
      display,
      onHidden,
      mallProtocolManagement,
      dataValue,
      onHandleChange,
    } = this.props;
    const {
      materialTypes = [],
      agreementFroms = [],
      agreementStatus = [],
      agreementTypes = [],
    } = mallProtocolManagement;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        title={intl.get('hzero.common.button.viewMore').d('更多查询')}
        width={520}
        onCancel={onHidden}
        onOk={this.handleOK}
        visible={display}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        footer={[
          <Button onClick={() => this.handleReset()}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>,
          <Button type="primary" onClick={this.handleOK}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>,
        ]}
      >
        <FormItem
          label={intl.get('small.common.view.agreementCodeAndName').d('协议编号/名称')}
          {...formLayout}
        >
          {getFieldDecorator('agreementName', {
            initialValue: dataValue.agreementName,
          })(
            <Input
              value={dataValue.agreementName}
              onChange={(e) => onHandleChange({ agreementName: e.target.value })}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.purchaser').d('采购方')} {...formLayout}>
          {getFieldDecorator('companyName', {
            initialValue: dataValue.companyName,
          })}
          {getFieldDecorator('companyId', {
            initialValue: dataValue.companyId,
          })(
            <Lov
              allowClear
              code="SPFM.USER_AUTHORITY_COMPANY"
              textField="companyName"
              textValue={getFieldValue('companyName')}
              queryParams={{
                tenantId: getCurrentOrganizationId(),
                lovCode: 'SPFM.USER_AUTH.COMPANY',
              }}
              onChange={this.lovChange}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.supplier').d('供应商')} {...formLayout}>
          {getFieldDecorator('supplierCompanyName', {
            initialValue: dataValue.supplierCompanyName,
          })}
          {getFieldDecorator('supplierCompanyId')(
            <Lov
              allowClear
              code="SMAL.SUPPLIER_BY_PUR"
              textValue={getFieldValue('supplierCompanyName')}
              queryParams={{
                companyId: getFieldValue('companyId'),
                tenantId: getCurrentOrganizationId(),
              }}
              onChange={this.supLovChange}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.status').d('状态')} {...formLayout}>
          {getFieldDecorator('agreementStatus')(
            <Select allowClear style={{ width: '100%' }}>
              {agreementStatus &&
                agreementStatus.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.materialType').d('物资类型')} {...formLayout}>
          {getFieldDecorator('materialType')(
            <Select allowClear style={{ width: '100%' }}>
              {materialTypes &&
                materialTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('small.common.model.agreementType').d('协议类型')}
          {...formLayout}
        >
          {getFieldDecorator('agreementType')(
            <Select allowClear style={{ width: '100%' }}>
              {agreementTypes &&
                agreementTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('small.common.model.documentSource').d('单据来源')}
          {...formLayout}
        >
          {getFieldDecorator('sourceFrom')(
            <Select allowClear style={{ width: '100%' }}>
              {agreementFroms &&
                agreementFroms.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('small.common.model.creationDateFrom').d('创建日期从')}
          {...formLayout}
        >
          {getFieldDecorator('creationDateFrom')(
            <DatePicker
              placeholder=""
              style={{ width: '100%' }}
              format={getDateFormat()}
              disabledDate={(currentDate) =>
                getFieldValue('creationDateTo') &&
                moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('small.common.model.creationDateTo').d('创建日期至')}
          {...formLayout}
        >
          {getFieldDecorator('creationDateTo')(
            <DatePicker
              placeholder=""
              style={{ width: '100%' }}
              format={getDateFormat()}
              disabledDate={(currentDate) =>
                getFieldValue('creationDateFrom') &&
                moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
      </Modal>
    );
  }
}
