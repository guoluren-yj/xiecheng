/*
 * EBSFilterForm - 价格信息导入EBS查询表单
 * @date: 2020-3-10
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import { isEmpty } from 'lodash';
import moment from 'moment';

const { Option } = Select;

const promptCode = 'ssrc.searchResultImport';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/results-query/list' })
export default class EBSFilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
  }

  // 条件查询
  @Bind()
  fetchInterfaceDef() {
    const { form, onConditional } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  // 导入ERP
  @Bind()
  importErp() {
    const { onImportErp } = this.props;
    onImportErp();
  }

  // 保存
  @Bind()
  haeSaveData() {
    const { onSaveData } = this.props;
    onSaveData();
  }

  // 放弃
  @Bind()
  hasAbandon() {
    const { onAbandon } = this.props;
    onAbandon();
  }

  render() {
    const {
      form,
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      code: { sourceTy = [], sourceCategory = [], syncStatus = [] },
      lovCode: { copyFlagList = [] },
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        form,
        expand,
        code: 'SSRC.PRICE_LIB_EXPORT_ERP.EBS_FILTER_FORM',
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.itemName`).d('物品')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.supplierName`).d('供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.itemName`).d('物品')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemId')(<Lov code="SSRC.PRICE_LIB_ITEM" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.supplierName`).d('供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPFM.USER_AUTH.SUPPLIER"
                      onChange={(_, record) => {
                        setFieldsValue({
                          supplierId: record?.supplierId,
                        });
                      }}
                    />
                  )}
                  {getFieldDecorator('supplierId')}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.itemCategory`).d('物品分类')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemCategoryId')(
                    <Lov code="SMDM.TREE_ITEM_CATEGORY" textField="itemCategoryName" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.businessUnit`).d('业务实体')}
                  {...formlayout}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" textField="ouName" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.invOrganization`).d('库存组织')}
                  {...formlayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="HPFM.INV_ORG" textField="invOrganizationName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.searchResImt.sourceFromNumber`)
                    .d('来源单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceNum')(
                    <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.sourceType`).d('寻源类型')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceType')(
                    <Select allowClear>
                      {sourceTy.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.searchResImt.creationDateFromNew`)
                    .d('创建时间从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFromNew')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateToNew') &&
                        moment(getFieldValue('creationDateToNew')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.searchResImt.creationDateToNew`)
                    .d('创建时间至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateToNew')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFromNew') &&
                        moment(getFieldValue('creationDateFromNew')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.searchResImt.creationDateFrom`)
                    .d('完成日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.searchResImt.creationDateTo`)
                    .d('完成日期至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
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
                  label={intl.get(`${promptCode}.model.searchResImt.sourceCategory`).d('寻源类别')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceCategory')(
                    <Select allowClear>
                      {sourceCategory.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.syncStatus`).d('导入状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('syncStatus')(
                    <Select allowClear>
                      {syncStatus.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.searchResImt.copyData`).d('复制数据')}
                  {...formlayout}
                >
                  {getFieldDecorator('copyFlag')(
                    <Select allowClear>
                      {copyFlagList.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
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
