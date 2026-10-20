import React, { PureComponent } from 'react';
import { Form, Button, Input, DatePicker, Select, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';

/**
 * 查询表单-生命周期申请单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sslm/supplier-life-manage/stage' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      formStatus,
      formType,
      userId,
      tenantId,
      dateFormat,
      custLoading,
      customizeFilterForm,
      customizeFilterFormCode,
    } = this.props;
    const { display = true } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    getFieldDecorator('supplierCompanyId');
    return customizeFilterForm(
      {
        code: customizeFilterFormCode, // 后端导出原因，个性化暂时不加，后期放开即可
        form: this.props.form,
        expand: !display,
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierLifeSearch.model.supplierLifeSearch.applyCode`)
                    .d('申请单编号')}
                  {...formlayout}
                >
                  {getFieldDecorator('documentNumber')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierNameLov')(
                    <Lov
                      code="SSLM.USER_AUTH.SUPPLIER"
                      queryParams={{ userId, tenantId }}
                      textField="supplierCompanyName"
                      lovOptions={{
                        valueField: 'uniqueKey',
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ supplierCompanyId: lovRecord.supplierCompanyId });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierLifeSearch.model.supplierLifeSearch.status`)
                    .d('单据状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('processStatus')(
                    <Select allowClear>
                      {formStatus.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`sslm.supplierLifeSearch.model.supplierLifeSearch.type`)
                    .d('单据类型')}
                >
                  {getFieldDecorator('gradeCode')(
                    <Select allowClear>
                      {formType.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.view.company.name`).d('公司')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('endDate') &&
                        moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...formlayout}
                >
                  {getFieldDecorator('endDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('startDate') &&
                        moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierLifeSearch.model.template.code`).d('评分要素编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('templateCode')(
                    <Lov
                      code="SSLM.KPI_EVAL_TPL_HGGYSZR"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'templateCode' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`sslm.supplierLifeSearch.model.template.name`).d('评分要素名称')}
                >
                  {getFieldDecorator('templateName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
