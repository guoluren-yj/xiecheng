import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Select, DatePicker, Input } from 'hzero-ui';
import moment from 'moment';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['sslm.common'],
})
export default class MoreFieldsDrawer extends PureComponent {
  renderForm() {
    const {
      dateFormat,
      onReset,
      onSearch,
      evaluationCycle,
      evaluationDim,
      tenantId,
      form: { getFieldDecorator, getFieldValue, registerField, setFieldsValue },
    } = this.props;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <Form className="more-fields-form">
        <Form.Item
          label={intl.get(`sslm.common.model.archive.fileCode`).d('档案编码')}
          {...formLayout}
        >
          {getFieldDecorator('evalNum', {})(<Input trim typeCase="upper" inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.fileDescribe`).d('档案描述')}
          {...formLayout}
        >
          {getFieldDecorator('evalName', {})(<Input trim />)}
        </Form.Item>
        <Form.Item label={intl.get(`sslm.common.model.archive.group`).d('集团')} {...formLayout}>
          {getFieldDecorator('groupId', {})(<Lov code="HPFM.GROUP" queryParams={{ tenantId }} />)}
        </Form.Item>
        <Form.Item label={intl.get(`sslm.common.view.company.name`).d('公司')} {...formLayout}>
          {getFieldDecorator('companyId', {})(
            <Lov code="HPFM.COMPANY" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.purchaseOrg`).d('采购组织')}
          {...formLayout}
        >
          {getFieldDecorator('invOrganizationId')(
            <Lov code="HPFM.PURCHASE_ORGANIZATION" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get('sslm.common.view.message.inventoryOrganization').d('库存组织')}
          {...formLayout}
        >
          {getFieldDecorator('ouId', {})(
            <Lov
              code="HPFM.INV_ORG"
              queryParams={{ tenantId }}
              onChange={(_, record) => {
                registerField('supplierId');
                setFieldsValue({ supplierId: record.supplierId });
              }}
            />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.evaluationCycle`).d('考评周期')}
          {...formLayout}
        >
          {getFieldDecorator('evalCycle', {})(
            <Select allowClear>
              {evaluationCycle.map(item => (
                <Select.Option key={item.value}>{item.meaning}</Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.evaluationDimension`).d('考评维度')}
          {...formLayout}
        >
          {getFieldDecorator('evalDimension', {})(
            <Select allowClear>
              {evaluationDim.map(item => (
                <Select.Option key={item.value}>{item.meaning}</Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.filingDateFrom`).d('建档日期从')}
          {...formLayout}
        >
          {getFieldDecorator('creationDateFrom')(
            <DatePicker
              placeholder=""
              format={dateFormat}
              disabledDate={currentDate =>
                getFieldValue('creationDateTo') &&
                moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
              }
            />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get(`sslm.common.model.archive.filingDateTo`).d('建档日期至')}
          {...formLayout}
        >
          {getFieldDecorator('creationDateTo')(
            <DatePicker
              format={dateFormat}
              placeholder=""
              disabledDate={currentDate =>
                getFieldValue('creationDateFrom') &&
                moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
              }
            />
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
