import React, { PureComponent } from 'react';
import { Form, Button, Input, DatePicker, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
const { Option } = Select;

@formatterCollections({
  code: 'spfm.supplier',
})
@Form.create({ fieldNameProp: null })
export default class ErpFilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  /**
   * 查询条件收起／展开
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 查询 ERP 供应商
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * ERP 供应商表单查询条件重置
   */
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const { expand } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { customizeFilterForm = () => {}, form } = this.props;
    return customizeFilterForm(
      {
        code: 'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER.FILTER', // 单元编码，必传
        form,
        expand: !expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={16}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.supplierNum').d('供应商编码')}
                >
                  {getFieldDecorator('supplierNum')(
                    <Input typeCase="upper" trim inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.supplierName').d('供应商名称')}
                >
                  {getFieldDecorator('supplierName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hzero.common.date.creation').d('创建日期')}
                >
                  {getFieldDecorator('erpCreationDate')(<DatePicker placeholder={null} />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.isLinked').d('是否已关联')}
                >
                  {getFieldDecorator('isLinked')(
                    <Select allowClear>
                      <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                      <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.common.model.common.externalSystemCode').d('外部系统代码')}
                >
                  {getFieldDecorator('externalSystemCode')(<Input trim />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.enabledFlag').d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                      <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.supplierDunsCode').d('邓白氏编码')}
                >
                  {getFieldDecorator('supplierDunsCode')(
                    <Input trim />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.common.model.common.passport').d('护照号')}
                >
                  {getFieldDecorator('passport')(<Input trim />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.businessRegistrationNumber').d('企业注册登记号/税号')}
                >
                  {getFieldDecorator('businessRegistrationNumber')(<Input trim />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.supplierUnifiedSocialCode').d('统一社会信用码')}
                >
                  {getFieldDecorator('supplierUnifiedSocialCode')(
                    <Input trim />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.common.model.common.idNum').d('身份证号')}
                >
                  {getFieldDecorator('idNum')(<Input trim />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.erp.supplierOrganizingInstitutionCode').d('组织机构代码')}
                >
                  {getFieldDecorator('supplierOrganizingInstitutionCode')(<Input trim />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={8} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
