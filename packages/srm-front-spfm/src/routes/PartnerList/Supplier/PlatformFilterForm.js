import React, { PureComponent } from 'react';
import moment from 'moment';
import { Form, Button, Input, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import '@/routes/PartnerList/index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class PlatformFilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
  }

  componentDidMount() {
    const { onSearch = () => {} } = this.props;
    // 为了解决个性化配置默认值第一次查询不传值问题
    onSearch();
  }

  /**
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 查询平台供应商
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
   * 平台供应商查询条件表单重置
   */
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const { expand } = this.state;
    const { customizeFilterForm, form, tenantId } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };
    return customizeFilterForm(
      {
        code: 'SPFM.PARTNER_LIST_SUPPLIER.FINAL_FILTER', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        // dataSource: {}, // 必传，从后端接口获取到的数据
        expand,
      },
      <Form className="more-fields-form">
        <Row gutter={24}>
          <Col span={16}>
            <Row gutter={24}>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.platformCompanyNum')
                    .d('平台供应商编码')}
                >
                  {getFieldDecorator('supplierCompanyNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.platformCompanyName')
                    .d('平台供应商名称')}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem {...formItemLayout} label={intl.get('entity.company.tag').d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SSLM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} style={{ display: expand ? 'none' : 'block' }}>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.supplyClass')
                    .d('供应商分类')}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SSLM.SUPPLIER_CATEGORY"
                      textValue="categoryDescription"
                      lovOptions={{
                        displayField: 'categoryDescription',
                        valueField: 'categoryId',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.monitor')
                    .d('是否加入监控')}
                >
                  {getFieldDecorator('isMonitor')(
                    <ValueList
                      allowClear
                      lovCode="HPFM.FLAG"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.supplier.model.supplier.platform.isErp').d('是否 ERP')}
                >
                  {getFieldDecorator('isErp')(
                    <ValueList
                      allowClear
                      lovCode="HPFM.FLAG"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.thirdPartyFlag')
                    .d('是否第三方合作')}
                >
                  {getFieldDecorator('thirdPartyFlag')(
                    <ValueList
                      allowClear
                      lovCode="HPFM.FLAG"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.identifyTimeFrom')
                    .d('认证通过时间从')}
                >
                  {getFieldDecorator('approveFromDate')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('approveToDate') &&
                        moment(getFieldValue('approveToDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.identifyTimeTo')
                    .d('认证通过时间至')}
                >
                  {getFieldDecorator('approveToDate')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('approveFromDate') &&
                        moment(getFieldValue('approveFromDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.levelType')
                    .d('是否为集团级')}
                >
                  {getFieldDecorator('levelTypeFlag')(
                    <ValueList
                      allowClear
                      lovCode="SPFM.GROUP_INVITE.FLAG"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {!expand
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
