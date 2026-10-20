import React, { PureComponent } from 'react';
import { Form, Button, Input, InputNumber, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { TextField } from 'choerodon-ui/pro';

import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

const { Option } = Select;

/**
 * 币种定义(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/smdm/materielApplication' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: false,
      itemCodeMultiSelectData: []
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, sorter } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(values, undefined, sorter);
        }
      });
    }
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
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
 * 查询
 */
  @Bind()
  handleMultChange(value) {
    const { form } = this.props;
    if (value) {
      const data = value.map((ele) => ele.trim().replace(/\s+/g, ','))
      const valueData = [];
      data?.forEach(i => {
        valueData.push(...(i?.split(',')))
      })
      this.setState({ itemCodeMultiSelectData: valueData }, () => {
        form?.setFieldsValue({ itemCodeMultiSelect: valueData })
      })
    } else {
      this.setState({ itemCodeMultiSelectData: null }, () => {
        form?.setFieldsValue({ itemCodeMultiSelect: null })
      })
    }
  }


  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      customizeFilterForm,
    } = this.props;
    const { sourceCode = [], status = [] } = enumMap;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display, itemCodeMultiSelectData } = this.state;
    return customizeFilterForm(
      {
        code: 'SMDM_MATERIELAPPLICATION_LIST.SEARCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.itemReqHeaderNum')
                    .d('物料申请单号')}
                >
                  {getFieldDecorator('itemReqHeaderNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.materielApplication.model.materiel.itemCode').d('物料编码')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      code="SMDM.TENANT_ITEM"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    // lovOptions={{ displayField: 'itemName', valueField: 'itemId' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materiel.model.materiel.itemCodePrecision')
                    .d('物料编码（精准）')}
                >
                  {getFieldDecorator('itemCodePrecision')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('reqStatus')(
                    <Select allowClear>
                      {status.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.createdName')
                    .d('创建人')}
                >
                  {getFieldDecorator('createdBy')(
                    <Lov
                      code="HIAM.USER_ACCOUNT"
                      queryParams={{ enabledFlag: 1 }}
                      lovOptions={{ displayField: 'realName', valueField: 'id' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.creationDateFrom')
                    .d('创建时间从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('lastUpdateDateTo') &&
                        moment(getFieldValue('lastUpdateDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.creationDateTo')
                    .d('创建时间至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder=""
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`smdm.materielApplication.model.materiel.sourceCode`)
                    .d('来源系统')}
                >
                  {getFieldDecorator('sourceCode')(
                    <Select allowClear>
                      {sourceCode.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.specifications')
                    .d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.materielApplication.model.materiel.model').d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.primaryUomName')
                    .d('基本计量单位')}
                >
                  {getFieldDecorator('uomName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materielApplication.model.materiel.itemNumber')
                    .d('云平台物料')}
                >
                  {getFieldDecorator('itemNumber')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materiel.model.materiel.itemCodeMultiSelect')
                    .d('物料编码（批量）')}
                >
                  {getFieldDecorator('itemCodeMultiSelect')(
                    <TextField multiple trim="both" style={{ width: '100%' }} onChange={this.handleMultChange} value={itemCodeMultiSelectData} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.version`).d('版本')}
                >
                  {getFieldDecorator('versionNumber')(<InputNumber precision={0} min={0} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.brand`).d('品牌')}
                >
                  {getFieldDecorator('brand')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.specifications`).d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.chartCode`).d('图号')}
                >
                  {getFieldDecorator('chartCode')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: !display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: !display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
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
