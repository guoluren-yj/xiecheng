import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 币种定义(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sslm/eligible-supplier-review' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      userOrganizationId: getUserOrganizationId(),
    };
  }

  // componentDidMount() {
  //   this.props.onRef(this);
  // }
  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(values);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      organizationId,
      userId,
      stageList,
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      customizeFilterForm,
      custLoading,
      code = '',
    } = this.props;
    const { expandForm, userOrganizationId } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    getFieldDecorator('supplierCompanyId');
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierReview.model.supplierReview.qualifiedNumber`)
                    .d('申请单号')}
                >
                  {getFieldDecorator('qualifiedNumber')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierReview.model.supplierReview.supplierCompanyName`)
                    .d('供应商名称')}
                >
                  {getFieldDecorator('supplierNameLov')(
                    // HIAM.USER_AUTH_SUPPLIER
                    <Lov
                      code="SSLM.USER_AUTH.SUPPLIER"
                      textField="supplierCompanyName"
                      lovOptions={{
                        valueField: 'uniqueKey',
                      }}
                      queryParams={{ userId, tenantId: organizationId }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({
                          supplierCompanyId: lovRecord.supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierReview.model.supplierReview.companyName`)
                    .d('公司名称')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textField="companyName"
                      queryParams={{ organizationId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.creation.from`).d('创建时间从')}
                >
                  {getFieldDecorator('releaseDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateTo') &&
                        moment(getFieldValue('releaseDateTo')).isBefore(currentDate, 'day')
                      }
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.creation.to`).d('创建时间至')}
                >
                  {getFieldDecorator('releaseDateTo')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateFrom') &&
                        moment(getFieldValue('releaseDateFrom')).isAfter(currentDate, 'day')
                      }
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierReview.model.supplierReview.stageDescription`)
                    .d('当前阶段')}
                >
                  {getFieldDecorator('fromStageCode')(
                    <Select allowClear>
                      {stageList.map((stage) => (
                        <Option value={stage.stageCode}>{stage.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierReview.model.supplierReview.targetStageDesc`)
                    .d('目标阶段')}
                >
                  {getFieldDecorator('toStageCode')(
                    <Select allowClear>
                      {stageList.map((stage) => (
                        <Option value={stage.stageCode}>{stage.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginLeft: 8, display: 'inline-block' }} onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
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
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
