/*
 *
 * @date: 2018-11-27 11:29:42
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Select, DatePicker, Drawer } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import ValueList from 'hzero-front/lib/components/ValueList';

const modelPrompt = 'sodr.sendOrder.model.common';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
export default class SearchDrawer extends Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { onReset } = this.props;
    onReset();
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId, supplierTenantId } = record;
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    registerField('supplierTenantId');
    setFieldsValue({ supplierId, supplierCompanyId, supplierTenantId });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司Lov改变清空供应商和地点
   * @param {*} value
   */
  @Bind()
  handleChangeCompanyLov(value) {
    const {
      form: { getFieldValue, resetFields },
    } = this.props;
    if (!value || getFieldValue('companyId') !== value) {
      resetFields([
        'displaySupplierName',
        'supplierId',
        'supplierCompanyId',
        'supplierTenantId',
        'supplierSiteCode',
        'supplierSiteName',
      ]);
    }
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
      // enumMap = {},
    } = this.props;
    const { tenantId, organizationId } = this.state;
    // const { erpStatus = [], flag = [], orderSource = [] } = enumMap;
    return (
      <Form className="more-fields-form">
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}>
          {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.lineNum`).d('行号')}>
          {getFieldDecorator('displayLineNum')(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.shipmentNum`).d('发运号')}>
          {getFieldDecorator('displayLineLocationNum')(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
        >
          {getFieldDecorator('releasedDateStart')(
            <DatePicker
              format={getDateFormat()}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('releasedDateEnd') &&
                moment(getFieldValue('releasedDateEnd')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`hzero.common.date.release.to`).d('发布日期至')}
        >
          {getFieldDecorator('releasedDateEnd')(
            <DatePicker
              disabledDate={(currentDate) =>
                getFieldValue('releasedDateStart') &&
                moment(getFieldValue('releasedDateStart')).isAfter(currentDate, 'day')
              }
              format={getDateFormat()}
              placeholder={null}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
          {getFieldDecorator('poTypeId')(
            <Lov
              code="SPUC_ORDER_TYPE"
              queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
              textField="orderTypeCode"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
          {getFieldDecorator('companyId')(
            <Lov
              code="SPFM.USER_AUTH.COMPANY"
              queryParams={{ organizationId }}
              textField="companyName"
              onChange={this.handleChangeCompanyLov}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`entity.business.tag`).d('业务实体')}>
          {getFieldDecorator('ouId')(
            <Lov
              code="HPFM.OU"
              queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
              textField="orgName"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}>
          {getFieldDecorator('releaseNum')(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
        >
          {getFieldDecorator('purchaseOrgId')(
            <Lov
              code="SPFM.USER_AUTH.PURORG"
              queryParams={{ organizationId }}
              textField="purOrganizationName"
              lovOptions={{ displayField: 'organizationName' }}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}>
          {getFieldDecorator('agentId')(
            <Lov
              code="SPFM.USER_AUTH.PURCHASE_AGENT"
              queryParams={{ organizationId }}
              textField="agentName"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.erpStatus`).d('ERP状态')}>
          {getFieldDecorator('erpStatus')(<ValueList lovCode="SODR.ERP_STATUS" allowClear />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
          {getFieldDecorator('tempKey')(
            <Lov
              code="SPRM.SUPPLIER"
              // lovOptions={{ displayField: 'displaySupplierName' }}
              textField="displaySupplierName"
              onChange={this.onChangeSupplierId}
              queryParams={{
                tenantId,
                companyId: getFieldValue('companyId'),
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.supplierSite`).d('供应商地点')}
        >
          {getFieldDecorator('supplierSiteId')(
            <Lov
              disabled={!getFieldValue('supplierId')}
              code="SODR.SUPPLIER_SITE"
              queryParams={{
                supplierId: getFieldValue('supplierId'),
                organizationId: tenantId,
              }}
              textField="supplierSiteName"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
          {getFieldDecorator('itemCode')(<Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
        >
          {getFieldDecorator('erpCreationDateStart')(
            <DatePicker
              format={getDateFormat()}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('erpCreationDateEnd') &&
                moment(getFieldValue('erpCreationDateEnd')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
        >
          {getFieldDecorator('erpCreationDateEnd')(
            <DatePicker
              disabledDate={(currentDate) =>
                getFieldValue('erpCreationDateStart') &&
                moment(getFieldValue('erpCreationDateStart')).isAfter(currentDate, 'day')
              }
              format={getDateFormat()}
              placeholder={null}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.purchaseReqNum`).d('采购申请号')}
        >
          {getFieldDecorator('purReqNum')(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.urgentOrNot`).d('是否加急')}>
          {getFieldDecorator('urgentFlag')(<ValueList lovCode="HPFM.FLAG" allowClear />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.useFlag`).d('是否超期')}>
          {getFieldDecorator('beyondFlag')(
            <Select style={{ width: '100%' }} allowClear>
              <Option value="1">{intl.get('hzero.common.yes').d('是')}</Option>
              <Option value="0">{intl.get('hzero.common.no').d('否')}</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.urgentDateStart`).d('加急时间从')}
        >
          {getFieldDecorator('urgentDateStart')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('urgentDateEnd') &&
                moment(getFieldValue('urgentDateEnd')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.urgentDateEnd`).d('加急时间至')}
        >
          {getFieldDecorator('urgentDateEnd')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('urgentDateStart') &&
                moment(getFieldValue('urgentDateStart')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.freeFlag`).d('是否免费')}>
          {getFieldDecorator('freeFlag')(<ValueList lovCode="HPFM.FLAG" allowClear />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.needDateStart`).d('需求日期从')}
        >
          {getFieldDecorator('needByDateStart')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('needByDateEnd') &&
                moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.needDateEnd`).d('需求日期至')}
        >
          {getFieldDecorator('needByDateEnd')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('needByDateStart') &&
                moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.cancelledFlag`).d('是否取消')}
        >
          {getFieldDecorator('cancelledFlag')(<ValueList lovCode="SPUC.CANCEL_FLAG" allowClear />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.promisedDateFrom`).d('承诺日期从')}
        >
          {getFieldDecorator('promiseDeliveryDateStart')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('promiseDeliveryDateEnd') &&
                moment(getFieldValue('promiseDeliveryDateEnd')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get(`${modelPrompt}.promisedDateTo`).d('承诺日期至')}
        >
          {getFieldDecorator('promiseDeliveryDateEnd')(
            <DatePicker
              format={getDateFormat()}
              style={{ width: '100%' }}
              placeholder={null}
              disabledDate={(currentDate) =>
                getFieldValue('promiseDeliveryDateStart') &&
                moment(getFieldValue('promiseDeliveryDateStart')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.closedFlag`).d('是否关闭')}>
          {getFieldDecorator('lineClosedFlag')(<ValueList lovCode="HPFM.FLAG" allowClear />)}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
          {...formItemLayout}
        >
          {getFieldDecorator('poSourcePlatform')(
            <ValueList lovCode="SPRM.SRC_PLATFORM" allowClear />
          )}
        </FormItem>
        <FormItem>
          <Button onClick={this.handleFormReset} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer } = this.props;
    const drawerProps = {
      title: intl.get(`hzero.common.button.viewMore`).d('更多查询'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      onClose: onHideDrawer,
      width: 520,
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: 12,
      },
    };
    return <Drawer {...drawerProps}>{this.renderForm()}</Drawer>;
  }
}
