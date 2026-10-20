/**
 * 整单取消
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Table, Row, Col, Input, Button, DatePicker, Select, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';

import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';
// sodr 国际化
const commonPrefix = 'sodr.orderCancel.view.message';

const FormItem = Form.Item;

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/single-order-cancel' })
export default class SingleCancel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
    const { onRef } = this.props;
    onRef(this);
  }

  /**
   * 查询
   * @param {object} page - 分页对象
   */
  @Bind()
  handleSearch(page = {}, sorter, isChangePage) {
    const { onSearch } = this.props;
    onSearch(page, sorter, isChangePage);
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查看订单详情
   * @param {object} record - 行数据
   */
  @Bind()
  viewDetail(record = {}) {
    const { onViewDetail } = this.props;
    if (onViewDetail) {
      onViewDetail(record);
    }
  }

  /**
   * 可操作类型圆点颜色
   * @param {*} record
   */
  @Bind()
  opreateTypeColor(record = {}) {
    if (record.opreateType === 'CANCEL' || record.opreateType === 'CLOSED') {
      return <span className="ant-badge-status-dot ant-badge-status-success" />;
    } else if (record.opreateType === 'NOT_WHOLE_CANCEL_OR_CLOSED') {
      return <span className={styles['operate-type-not-whole-cancel-or-closed']} />;
    } else if (record.opreateType === 'NOT_CANCEL_OR_CLOSED') {
      return <span className="ant-badge-status-dot ant-badge-status-error" />;
    }
  }

  /**
   * 隐藏更多查询条件的drawer
   */
  @Bind()
  handleHideDrawer() {
    this.setState({
      showMore: false,
    });
  }

  /**
   * 更多查询条件
   */
  @Bind()
  moreButtons() {
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record;
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteId', 'supplierSiteName', 'supplierSiteId']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
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
   * 变更按钮控制
   * @param {*} record
   */
  @Bind()
  showChange(val, record) {
    const { handleViewChange = (e) => e } = this.props;
    const changeFields = ['APPROVED', 'PUBLISHED', 'CONFIRMED'];
    if (
      (record.statusCode !== 'REJECTED' &&
        (record.poSourcePlatform === 'SRM' ||
          record.poSourcePlatform === 'SHOP' ||
          (record.sourceCode === 'SRM' && record.poSourcePlatform === 'ERP')) &&
        changeFields.includes(record.statusCode)) ||
      (record.statusCode === 'PART_FEED_BACK' && record.sourceCode === 'SRM')
    ) {
      return (
        <a onClick={() => handleViewChange(record)}>
          {intl.get(`${commonPrefix}.change`).d('变更')}
        </a>
      );
    }
    if (record.statusCode === 'REJECTED' && record.changeSyncStatus === 'SUCCESS') {
      return (
        <div className={styles['row-agent-column']}>
          <a onClick={() => handleViewChange(record)}>
            {intl.get(`${commonPrefix}.change`).d('变更')}
          </a>
          <Tooltip title={intl.get(`sodr.common.view.message.changeReject`).d('订单变更审批拒绝')}>
            <img src={abnormal} alt="img" />
          </Tooltip>
        </div>
      );
    }
  }

  render() {
    const { showMore, tenantId, organizationId } = this.state;
    const {
      loading,
      dataSource,
      pagination,
      orderSource = [],
      rowSelection,
      enumMap = {},
      customizeTable,
      customizeFilterForm,
      form,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { operateType = [] } = enumMap;
    const columns = [
      {
        title: intl.get(`${commonPrefix}.orderStatus`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        // sorter: true,
        width: 100,
        // render: (_, record) => record.statusCodeMeaning,
      },
      {
        title: intl.get(`${commonPrefix}.operation`).d('操作'),
        dataIndex: 'operation',
        width: 100,
        render: this.showChange,
      },
      {
        title: intl.get(`${commonPrefix}.orderCode`).d('订单号'),
        dataIndex: 'displayPoNum',
        sorter: true,
        width: 180,
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a
              onClick={() => {
                this.viewDetail(record);
              }}
            >
              {value}
            </a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonPrefix}.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrefix}.operateType`).d('可操作类型'),
        dataIndex: 'opreateType',
        width: 150,
        render: (value, record) => (
          <span className="ant-badge ant-badge-status ant-badge-not-a-wrapper">
            {this.opreateTypeColor(record)}
            {record.opreateType === 'NOT_WHOLE_CANCEL_OR_CLOSED' ? (
              <Tooltip
                title={intl.get(`${commonPrefix}.cancelCloseByLine`).d(`请按行进行取消/关闭操作`)}
              >
                <span className="ant-badge-status-text">{record.opreateTypeMeaning}</span>
              </Tooltip>
            ) : (
              <span className="ant-badge-status-text">{record.opreateTypeMeaning}</span>
            )}
          </span>
        ),
      },
      {
        title: intl.get(`${commonPrefix}.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCode',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.supplierSiteNames`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        sorter: true,
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrefix}.orderType`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.company`).d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.entity`).d('业务实体'),
        dataIndex: 'orgName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.purchaseOrg`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.purchaseMan`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.stuffAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.orderAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.createdName`).d('创建人'),
        dataIndex: 'realName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.orderSource`).d('来源平台'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrefix}.sysSource`).d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 120,
      },
    ];
    return (
      <Fragment>
        {customizeFilterForm(
          {
            form,
            expand: showMore,
            code: 'SODR.ORDER_CANCEL_LIST.DELIVERY_LINE',
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.orderCode`).d('订单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('tempKey')(
                        <Lov
                          code="SPRM.SUPPLIER"
                          textField="displaySupplierName"
                          onChange={this.onChangeSupplierId}
                          queryParams={{
                            tenantId,
                            companyId: getFieldValue('companyId'),
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.operateType`).d('可操作类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('operateType')(
                        <Select allowClear>
                          {operateType.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: showMore ? 'block' : 'none' }}>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.company`).d('公司')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.entity`).d('业务实体')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('ouId')(
                        <Lov
                          code="HPFM.OU"
                          queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.purchaseMan`).d('采购员')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('agentId')(
                        <Lov
                          queryParams={{ organizationId }}
                          code="SPFM.USER_AUTH.PURCHASE_AGENT"
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* </Row>
                <Row style={{ display: showMore ? 'block' : 'none' }}> */}
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.releaseNum`).d('发放号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('releaseNum')(<Input inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.orderType`).d('订单类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('poTypeId')(<Lov code="SPUC_ORDER_TYPE" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.creationDateStart`).d('创建日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('creationDateStart')(
                        <DatePicker
                          format={DEFAULT_DATE_FORMAT}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('creationDateEnd') &&
                            moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* </Row>
                <Row style={{ display: showMore ? 'block' : 'none' }}> */}
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.creationDateEnd`).d('创建日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('creationDateEnd')(
                        <DatePicker
                          format={DEFAULT_DATE_FORMAT}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('creationDateStart') &&
                            moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.createPerson`).d('创建人')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('userId')(
                        <Lov
                          queryParams={{ organizationId: tenantId }}
                          lovOptions={{ displayField: 'realName' }}
                          code="SPUC.TENANT.USER"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.supplierSiteIds`).d('供应商地点')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('supplierSiteId')(
                        <Lov
                          code="SODR.SUPPLIER_SITE"
                          queryParams={{
                            supplierId: getFieldValue('supplierId'),
                          }}
                          disabled={!getFieldValue('supplierId')}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* </Row>
                <Row style={{ display: showMore ? 'block' : 'none' }}> */}
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.orderSource`).d('来源平台')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('poSourcePlatform')(
                        <Select allowClear>
                          {orderSource.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.purchaseOrganization`).d('采购组织')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('purchaseOrgId')(
                        <Lov code="SPFM.USER_AUTH.PURORG" queryParams={{ organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <FormItem>
                  {!showMore ? (
                    <Button onClick={this.moreButtons}>
                      {intl.get('hzero.common.button.viewMore').d('更多查询')}
                    </Button>
                  ) : (
                    <Button onClick={this.moreButtons}>
                      {intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                  )}
                  <Button onClick={this.handleReset}>
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
        )}
        <br />
        {customizeTable(
          {
            code: 'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE',
          },
          <Table
            loading={loading}
            bordered
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            scroll={{
              x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
              y: 'calc(100vh - 350px)',
            }}
            onChange={(page, _, sorter) => this.handleSearch(page, sorter, true)}
            rowKey="poHeaderId"
          />
        )}
      </Fragment>
    );
  }
}
