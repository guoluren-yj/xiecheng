import React, { PureComponent } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { connect } from 'dva';

import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import DelCache from '@/components/DelCache';
import cacheComponent from 'components/CacheComponent';
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
@DelCache({ cacheKey: '/small/mall-protocol-management/list8' })
@cacheComponent({ cacheKey: '/small/mall-protocol-management/list8' })
export default class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  handleOK() {
    const { onSearch, onHidden } = this.props;
    onSearch();
    onHidden();
  }

  @Bind()
  handleReset() {
    const { form, onHandleChange } = this.props;
    const params = {
      agreementName: undefined,
      skuId: undefined,
      skuName: undefined,
      itemName: undefined,
      itemId: undefined,
      itemCategoryName: undefined,
    };
    form.resetFields();
    onHandleChange(params, true);
  }

  @Bind()
  lovChange(val, record) {
    const { onHandleChange } = this.props;
    onHandleChange({ companyId: val, companyName: record.partnerCompanyName });
  }

  @Bind()
  supLovChange(val, record) {
    const { onHandleChange } = this.props;
    onHandleChange({ supplierCompanyId: val, supplierCompanyName: record.companyName });
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
    const { agreementStatus = [], agreementFroms = [] } = mallProtocolManagement;
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
          })(<Input onChange={(e) => onHandleChange({ agreementName: e.target.value })} />)}
        </FormItem>
        <Form.Item label={intl.get('small.common.model.product').d('商品')} {...formLayout}>
          {getFieldDecorator('skuName', { initialValue: dataValue.skuName })}
          {getFieldDecorator('skuId', {
            initialValue: dataValue.skuName,
          })(
            <Lov
              allowClear
              code="SMPC.CATA_PUR_SKU"
              textValue={getFieldValue('skuName')}
              queryParams={{ tenantId: getCurrentOrganizationId() }}
              onChange={(_, record) =>
                onHandleChange({ skuId: record.skuId, skuName: record.skuName })
              }
            />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get('small.common.view.itemCodeAndName').d('物料编码/名称')}
          {...formLayout}
        >
          {getFieldDecorator('itemName', {
            initialValue: dataValue.itemName,
          })}
          {getFieldDecorator('itemId', {
            initialValue: dataValue.itemId,
          })(
            <Lov
              allowClear
              code="SMAL.CUSTOMER_ITEM"
              textField="itemName"
              textValue={getFieldValue('itemName')}
              queryParams={{
                tenantId: getCurrentOrganizationId(),
              }}
              onChange={(val, record) =>
                onHandleChange({
                  itemId: val,
                  itemName: record.itemName,
                })
              }
            />
          )}
        </Form.Item>
        <Form.Item label={intl.get('small.common.view.itemCategory').d('物料分类')} {...formLayout}>
          {getFieldDecorator('itemCategoryName')(
            <Input onChange={(e) => onHandleChange({ itemCategoryName: e.target.value })} />
          )}
        </Form.Item>
        <FormItem label={intl.get('small.common.model.purchaser').d('采购方')} {...formLayout}>
          {getFieldDecorator('companyName')}
          {getFieldDecorator('companyId')(
            <Lov
              allowClear
              code="SPFM.USER_AUTHORITY_COMPANY"
              textField="companyName"
              queryParams={{
                tenantId: getCurrentOrganizationId(),
                lovCode: 'SPFM.USER_AUTH.COMPANY',
              }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.supplier').d('供应商')} {...formLayout}>
          {getFieldDecorator('supplierCompanyName')}
          {getFieldDecorator('supplierCompanyId')(
            <Lov
              allowClear
              code="SMAL.SUPPLIER_BY_PUR"
              queryParams={{
                companyId: getFieldValue('companyId'),
                tenantId: getCurrentOrganizationId(),
              }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('small.common.model.headStatus').d('头状态')} {...formLayout}>
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
        <FormItem label={intl.get('small.common.model.lineStatus').d('行状态')} {...formLayout}>
          {getFieldDecorator('effectiveFlag')(
            <Select allowClear style={{ width: '100%' }}>
              {[
                { value: -1, meaning: intl.get('small.common.model.invalid').d('无效') },
                { value: 0, meaning: intl.get('small.common.model.effective').d('有效') },
                { value: 1, meaning: intl.get('small.common.model.willEffective').d('待生效') },
              ].map((item) => (
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
          label={intl.get('small.common.model.validDateFrom').d('有效日期从')}
          {...formLayout}
        >
          {getFieldDecorator('validDateFrom')(
            <DatePicker
              style={{ width: '100%' }}
              placeholder=""
              format={getDateFormat()}
              disabledDate={(currentDate) =>
                getFieldValue('validDateTo') &&
                moment(getFieldValue('validDateTo')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('small.common.model.validDateTo').d('有效日期至')}
          {...formLayout}
        >
          {getFieldDecorator('validDateTo')(
            <DatePicker
              placeholder=""
              style={{ width: '100%' }}
              format={getDateFormat()}
              disabledDate={(currentDate) =>
                getFieldValue('validDateFrom') &&
                moment(getFieldValue('validDateFrom')).isAfter(currentDate, 'day')
              }
            />
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
