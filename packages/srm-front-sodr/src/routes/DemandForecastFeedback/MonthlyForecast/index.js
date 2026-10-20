/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import { Form, InputNumber, Input, DatePicker, Popover } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';

import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import moment from 'moment';

import FilterForm from './FilterForm';
import DetailModal from '../../components/ForecastDetail/DetailModal';

const promptCode = 'sodr.demandForecast';
// const CODE_UPPER = /^[A-Z0-9_]*$/;
const organizationId = getCurrentOrganizationId();
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

export default class extends React.Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      // 弹窗是否可见
      monthDetailModalVisible: false,
      forecastDetailBase: {},
    };
  }

  componentDidMount() {
    const { fetchList } = this.props;
    fetchList();
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    const { fetchList, monthlyForecast } = this.props;
    const { list = [] } = monthlyForecast;
    fetchList({ current: 1, pageSize: 10 });
    list.forEach((element) => {
      if (element.forecastStatus !== 'FEEDBACK') {
        element.$form.resetFields();
      }
    });
  }

  /**
   * 获取hover
   * @param {*} month 月
   */
  @Bind
  getMonthPopover(month, forecastYear) {
    if (!forecastYear) {
      return intl.get(`sodr.common.view.none`).d('无');
    }
    return moment(forecastYear, 'YYYY-MM')
      .add(month - 1, 'month')
      .format('YYYY.MM');
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(monthlyForecastSelectedRowKeys, monthlyForecastSelectedRows) {
    const { handleRowSelectChange } = this.props;
    handleRowSelectChange({ monthlyForecastSelectedRowKeys, monthlyForecastSelectedRows });
  }

  /**
   * openDetailModal - 打开Modal
   */
  @Bind()
  openDetailModal(month, record) {
    // 预测id
    const forecastId =
      record.forecastId || (record.$form ? record.$form.getFieldValue('forecastId') : '');
    // 预测起始日期
    // debugger;
    const forecastStartDate =
      record.forecastYear || (record.$form ? record.$form.getFieldValue('forecastYear') : '');
    // 采购方备注
    const purchaserRemark =
      record.purchaserRemark || (record.$form ? record.$form.getFieldValue('purchaserRemark') : '');
    // 采购方备注
    const supplierRemark =
      record.supplierRemark || (record.$form ? record.$form.getFieldValue('supplierRemark') : '');
    // 反馈单状态
    const forecastStatus =
      record.forecastStatus || (record.$form ? record.$form.getFieldValue('forecastStatus') : '');
    // 打开详情需要的基础数据
    const forecastDetailBase = {
      actionValue: month,
      forecastId,
      forecastStartDate,
      purchaserRemark,
      supplierRemark,
      forecastStatus,
    };
    this.setState({
      forecastDetailBase,
      monthDetailModalVisible: true,
    });
  }

  /**
   * closeDetailModal - 关闭Moda回调
   */
  @Bind()
  closeDetailModal() {
    this.setState({
      monthDetailModalVisible: false,
    });
  }

  /**
   * saveDetailSuss - 保存详情成功回调
   */
  @Bind()
  saveDetailSucc() {
    // 关闭弹窗
    this.setState({
      monthDetailModalVisible: false,
    });
    // 提示消息
    notification.success();
    // 刷新数据
    this.handleSearch();
  }

  render() {
    const {
      monthlyForecast = {},
      fetchListLoading = false,
      bindForm,
      selectedRowKeys,
      fetchList,
      setModelValue,
      activeKey,
      handleShowRecordModal,
      enumMap = {},
      customizeTable,
    } = this.props;
    const { list = [], pagination = {} } = monthlyForecast;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
        dataIndex: 'rowKey',
        key: 'rowKey',
        width: 80,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('rowKey', {
                rules: [
                  {
                    required: activeKey === 'monthlyForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
                      })
                      .d('行号不能为空')}`,
                  },
                ],
                initialValue: record.rowKey,
              })(<InputNumber style={{ width: '100%' }} />)}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastStatus`)
          .d('反馈状态'),
        dataIndex: 'forecastStatusMeaning',
        key: 'forecastStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastMonth`)
          .d('预测起始月'),
        dataIndex: 'forecastYear',
        key: 'forecastYear',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('forecastYear', {
                rules: [
                  {
                    required: activeKey === 'monthlyForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`${promptCode}.view.message.model.demandForecast.forecastMonth`)
                          .d('预测起始月'),
                      })
                      .d('预测起始月不能为空')}`,
                  },
                ],
                initialValue: record.forecastYear,
              })(<InputNumber style={{ width: '100%' }} />)}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCode', {
                rules: [
                  {
                    required: activeKey === 'monthlyForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`entity.item.code`).d('物料编码'),
                      })
                      .d('物料编码不能为空')}`,
                  },
                ],
                initialValue: record.itemCode,
              })(
                <Lov
                  code="SPRM.ITEM"
                  allowClear={false}
                  // queryPrams={{ organizationId, tenantId }}
                  lovOptions={{ valueField: 'partnerItemId', displayField: 'itemCode' }}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        categoryName: lovRecord.categoryName,
                        itemName: lovRecord.itemName,
                        uomName: lovRecord.uomName,
                        itemSpecification: lovRecord.itemSpecification,
                        itemModel: lovRecord.itemModel,
                        itemId: lovRecord.itemId,
                        forecastId: record.forecastId,
                      },
                      'monthlyForecast'
                    );
                  }}
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.categoryName`)
          .d('物料类别'),
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        key: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.unitName`).d('单位'),
        dataIndex: 'uomName',
        key: 'uomName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.specification`).d('规格'),
        dataIndex: 'itemSpecification',
        key: 'itemSpecification',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.modelNumber`).d('型号'),
        dataIndex: 'itemModel',
        key: 'itemModel',
        width: 150,
      },
      {
        title: intl.get('entity.attachment.class.purchaser').d('采购方附件'),
        dataIndex: 'purchaserAttachmentUuid',
        key: 'purchaserAttachmentUuid',
        width: 150,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('purchaserAttachmentUuid', {
              initialValue: record.purchaserAttachmentUuid,
            })(
              <Upload
                attachmentUUID={val}
                bucketName={PRIVATE_BUCKET}
                name="purchaserAttachmentUuid"
                bucketDirectory="sprm-pr"
                viewOnly
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('entity.attachment.class.supplier').d('供应商附件'),
        dataIndex: 'supplierAttachmentUuid',
        key: 'supplierAttachmentUuid',
        width: 150,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('supplierAttachmentUuid', {
              initialValue: record.supplierAttachmentUuid,
            })(
              <Upload
                attachmentUUID={val}
                bucketName={PRIVATE_BUCKET}
                name="supplierAttachmentUuid"
                bucketDirectory="sprm-pr"
                viewOnly={!['RELEASE', 'UPDATED'].includes(record.forecastStatus)}
              />
            )}
          </Form.Item>
        ),
      },
      // {
      //   title: intl
      //     .get(`${promptCode}.view.message.model.demandForecast.monthlyForecastQuantity`)
      //     .d('月度预测数量'),
      //   dataIndex: 'organizationCode',
      //   key: 'organizationCode',
      //   width: 1200,
      //   children: [
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month1`).d('Month1'),
        dataIndex: 'month1',
        key: 'month1',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(1, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(1, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month2`).d('Month2'),
        dataIndex: 'month2',
        key: 'month2',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(2, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(2, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month3`).d('Month3'),
        dataIndex: 'month3',
        key: 'month3',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(3, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(3, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month4`).d('Month4'),
        dataIndex: 'month4',
        key: 'month4',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(4, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(4, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month5`).d('Month5'),
        dataIndex: 'month5',
        key: 'month5',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(5, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(5, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month6`).d('Month6'),
        dataIndex: 'month6',
        key: 'month6',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(6, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(6, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month7`).d('Month7'),
        dataIndex: 'month7',
        key: 'month7',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(7, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(7, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month8`).d('Month8'),
        dataIndex: 'month8',
        key: 'month8',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(8, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(8, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month9`).d('Month9'),
        dataIndex: 'month9',
        key: 'month9',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(9, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(9, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month10`).d('Month10'),
        dataIndex: 'month10',
        key: 'month10',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(10, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(10, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month11`).d('Month11'),
        dataIndex: 'month11',
        key: 'month11',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(11, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(11, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.month12`).d('Month12'),
        dataIndex: 'month12',
        key: 'month12',
        width: 100,
        render: (text, record) => {
          return (
            <Popover placement="top" content={this.getMonthPopover(12, record.forecastYear)}>
              <a onClick={() => this.openDetailModal(12, record)}>{text || 0}</a>
            </Popover>
          );
        },
      },
      //   ],
      // },
      {
        title: intl.get(`entity.customerCompany.tag`).d('客户公司'),
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('companyId', {
                rules: [
                  {
                    required: activeKey === 'monthlyForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`entity.company.tag`).d('公司'),
                      })
                      .d('公司不能为空')}`,
                  },
                ],
                initialValue: record.clientCode,
              })(
                <Lov
                  code="SPFM.USER_AUTH.COMPANY"
                  queryParams={{ organizationId }}
                  textField="companyName"
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`sodr.common.model.common.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        key: 'invOrganizationName',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                rules: [
                  {
                    required: activeKey === 'monthlyForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`sodr.common.model.common.invOrganizationName`)
                          .d('库存组织'),
                      })
                      .d('库存组织不能为空')}`,
                  },
                ],
                initialValue: record.clientCode,
              })(
                <Lov
                  code="SPFM.USER_AUTH.INVORG"
                  // queryParams={{ organizationId }}
                  textField="ouName"
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        key: 'purchaserRemark',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.enoughFlagMeaning`)
          .d('是否满足'),
        dataIndex: 'enoughFlagMeaning',
        key: 'enoughFlagMeaning',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.feedbackStockQuantity`)
          .d('供应商反馈库存数量'),
        dataIndex: 'feedbackQuantity',
        key: 'feedbackQuantity',
        width: 150,
        render: (text, record) => {
          const returnComponent =
            record.forecastStatus === 'FEEDBACK' || record.forecastStatus === 'CLOSED' ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('feedbackQuantity', {
                  rules: [
                    {
                      required: activeKey === 'monthlyForecast',
                      message: `${intl
                        .get(`${commonPrompt}.validation.notNull`, {
                          name: intl
                            .get(
                              `${promptCode}.view.message.model.demandForecast.feedbackStockQuantity`
                            )
                            .d('供应商反馈库存数量'),
                        })
                        .d('供应商反馈库存数量不能为空')}`,
                    },
                  ],
                  initialValue: record.feedbackQuantity,
                })(<InputNumber min={0} style={{ width: '100%' }} />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.supplierConfirmDelivery`)
          .d('供应商确认交期'),
        dataIndex: 'supplierConfirmDelivery',
        key: 'supplierConfirmDelivery',
        width: 150,
        render: (text, record) => {
          const returnComponent =
            record.forecastStatus === 'FEEDBACK' || record.forecastStatus === 'CLOSED' ? (
              text ? (
                moment(text).format(DEFAULT_DATE_FORMAT)
              ) : (
                text
              )
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('supplierConfirmDelivery', {
                  initialValue: record.supplierConfirmDelivery
                    ? moment(record.supplierConfirmDelivery)
                    : null,
                })(<DatePicker />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        key: 'supplierRemark',
        width: 150,
        render: (text, record) => {
          const returnComponent =
            record.forecastStatus === 'FEEDBACK' || record.forecastStatus === 'CLOSED' ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('supplierRemark', {
                  rules: [
                    {
                      max: 255,
                      message: intl.get(`hzero.common.validation.max`, {
                        max: 255,
                      }),
                    },
                  ],
                  initialValue: record.supplierRemark,
                })(<Input />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`hzero.common.date.dataSource`).d('数据来源'),
        dataIndex: 'dataSource',
        key: 'dataSource',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
        key: 'operationRecord',
        render: (text, record) => {
          const returnComponent =
            record._status === 'create' ? null : (
              <a onClick={() => handleShowRecordModal(record)}>
                {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
              </a>
            );
          return returnComponent;
        },
      },
    ];
    const fiterProps = {
      bindForm,
      handleSearch: this.handleSearch,
      enumMap,
      organizationId,
    };
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 150;
    const tableProps = {
      columns,
      dataSource: list,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: scrollX },
      pagination,
      onChange: fetchList,
      rowKey: 'forecastId',
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
      },
    };
    const { monthDetailModalVisible, forecastDetailBase } = this.state;
    const monthDetailModalProps = {
      visible: monthDetailModalVisible,
      onCancel: this.closeDetailModal,
      onSave: this.saveDetailSucc,
      actionkey: 'month',
      operateType: 'supplier',
      processing: true,
      forecastDetailBase,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...fiterProps} />
          {monthDetailModalVisible && <DetailModal {...monthDetailModalProps} />}
        </div>
        {customizeTable(
          {
            code: 'SPRM.PREDICTION_ORDER_FEEDBACK.MONTH_BACK_LIST',
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
