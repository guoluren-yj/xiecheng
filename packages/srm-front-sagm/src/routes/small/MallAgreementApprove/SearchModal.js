import React, { PureComponent } from 'react';
import moment from 'moment';
import { Modal, Form, Input, Select, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

import delCache from '@/components/DelCache';

const FormItem = Form.Item;
const { Option } = Select;

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

class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  onSearch() {
    const { form, onOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onOk(values);
      }
    });
  }

  @Bind()
  handleReset() {
    const { form, onHandleChange } = this.props;
    form.resetFields();
    onHandleChange(
      {
        agreementName: undefined,
        companyId: undefined,
        companyName: undefined,
        supplierCompanyId: undefined,
        supplierName: undefined,
        supplierCompanyName: undefined,
      },
      true
    );
  }

  @Bind()
  lovChange(val, record) {
    const { form, onHandleChange } = this.props;
    const changeParams = { companyId: val, companyName: record.companyName };
    form.setFieldsValue(changeParams);
    onHandleChange(changeParams);
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
      onCancel,
      materialType,
      agreementType = [],
      sourceFrom,
      dataValue,
      onHandleChange,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        title={intl.get('hzero.common.button.viewMore').d('更多查询')}
        width={520}
        onCancel={onCancel}
        onOk={this.onSearch}
        visible={display}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        footer={[
          <Button onClick={() => this.handleReset()}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>,
          <Button type="primary" onClick={this.onSearch}>
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
              code="SPFM.USER_AUTHORITY_COMPANY"
              originTenantId={getCurrentOrganizationId()}
              queryParams={{
                tenantId: getCurrentOrganizationId(),
              }}
              textValue={getFieldValue('companyName')}
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
              textField="supplierName"
              originTenantId={getCurrentOrganizationId()}
              textValue={getFieldValue('supplierCompanyName')}
              lovOptions={{
                displayField: 'supplierName',
                valueField: 'supplierId',
              }}
              queryParams={{
                tenantId: getCurrentOrganizationId(),
                companyId: getFieldValue('companyId'),
              }}
              onChange={this.supLovChange}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.materialType').d('物资类型')} {...formLayout}>
          {getFieldDecorator('materialType')(
            <Select style={{ width: '100%' }} allowClear>
              {materialType.map((item) => (
                <Option value={item.value} key={item.value}>
                  {item.meaning}
                </Option>
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
              {agreementType &&
                agreementType.map((item) => (
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
            <Select style={{ width: '100%' }} allowClear>
              {sourceFrom.map((item) => (
                <Option value={item.value} key={item.value}>
                  {item.meaning}
                </Option>
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

@Form.create({ fieldNameProp: null })
@delCache({ cacheKey: '/small/mall-agreement-approve/right' })
@cacheComponent({ cacheKey: '/small/mall-agreement-approve/right' })
export class ApproveDrawer extends Drawer {}

@Form.create({ fieldNameProp: null })
@delCache({ cacheKey: '/small/mall-agreement-publish/right' })
@cacheComponent({ cacheKey: '/small/mall-agreement-publish/right' })
export class PublishDrawer extends Drawer {}
