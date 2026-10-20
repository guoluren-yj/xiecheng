import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Select, Input } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const modelPrompt = 'sodr.writeOff.model.common';
export default class MoreFieldsDrawer extends PureComponent {
  renderForm() {
    const { form, onSearch, onReset, tenantId, asnTypeCode } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form className="more-fields-form">
        <Form.Item label={intl.get(`${modelPrompt}.asnNum`).d('送货单号')} {...formLayout}>
          {getFieldDecorator('asnNum')(<Input trim inputChinese={false} typeCase="upper" />)}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.orderNum`).d('订单号')} {...formLayout}>
          {getFieldDecorator('displayPoNum')(<Input trim inputChinese={false} typeCase="upper" />)}
        </Form.Item>
        <Form.Item label={intl.get(`entity.supplier.tag`).d('供应商')} {...formLayout}>
          {getFieldDecorator('supplierName')(
            <Lov code="SODR.USER_AUTH.SUPPLIER" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.asnType`).d('送货单类型')} {...formLayout}>
          {getFieldDecorator('asnTypeCode')(
            <Select allowClear>
              {asnTypeCode.map(item => (
                <Select.Option key={item.value}>{item.meaning}</Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')} {...formLayout}>
          {getFieldDecorator('purchaseAgentName')(
            <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formLayout}>
          {getFieldDecorator('companyId')(
            <Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.acceptor`).d('验收人')} {...formLayout}>
          {getFieldDecorator('receivedBy')(<Input trim />)}
        </Form.Item>
        <Form.Item label={intl.get(`entity.item.tag`).d('物料')} {...formLayout}>
          {getFieldDecorator('itemId')(<Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />)}
        </Form.Item>
        <Form.Item
          label={intl.get(`entity.organization.class.receiving`).d('收货组织')}
          {...formLayout}
        >
          {getFieldDecorator('invOrganizationId')(
            <Lov code="SODR.COMPANY_INVORGNIZATION" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.inventoryName`).d('收货库房')} {...formLayout}>
          {getFieldDecorator('inventoryId')(
            <Lov
              code="HPFM.LOCATION.INVENTORY"
              queryParams={{ tenantId, organizationId: getFieldValue('invOrganizationId') }}
            />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`${modelPrompt}.acceptorOperate`).d('验收操作人')}
          {...formLayout}
        >
          {getFieldDecorator('acceptanceOperator')(
            <Lov code="HIAM.TENANT.USER" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" onClick={onSearch} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button onClick={onReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
        </Form.Item>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer } = this.props;
    const drawerProps = {
      title: intl.get('hzero.common.button.more').d('更多'),
      visible,
      mask: true,
      onClose: () => onHideDrawer(),
      width: 450,
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: 12,
      },
    };
    return <Drawer {...drawerProps}>{this.renderForm()}</Drawer>;
  }
}
