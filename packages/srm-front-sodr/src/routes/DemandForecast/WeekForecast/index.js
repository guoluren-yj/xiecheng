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
import { Form, Input, DatePicker, Popover } from 'hzero-ui'; // InputNumber,
import Upload from 'srm-front-boot/lib/components/Upload';
import moment from 'moment';

import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { dateRender } from 'utils/renderer';
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
      weekDetailModalVisible: false,
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
    const { fetchList, weekForecast = {} } = this.props;
    const { list = [] } = weekForecast;
    fetchList({ current: 1, pageSize: 10 });
    list.forEach((element) => {
      element.$form.resetFields();
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(weekForecastSelectedRowKeys, selectedRows) {
    const { handleRowSelectChange } = this.props;
    const weekForecastSelectedRows = selectedRows.map((o) => {
      return { ...o, ...o.$form.getFieldsValue() };
    });
    handleRowSelectChange({ weekForecastSelectedRowKeys, weekForecastSelectedRows });
  }

  /**
   * 获取hover
   * @param {*} week 周
   */
  @Bind
  getWeekPopover(week, weekForecastDate) {
    if (!weekForecastDate) {
      return intl.get(`sodr.common.view.none`).d('无');
    }
    const beginDate = this.generateDemandDate(weekForecastDate, week, 1);
    const endDate = this.generateDemandDate(weekForecastDate, week, 7);
    return `${beginDate}-${endDate}`;
  }

  /**
   * 生成要求到货日期
   */
  generateDemandDate(startDate, week, day) {
    const ONE_DAY_MILLS = 24 * 60 * 60 * 1000;
    const resultDate = new Date(
      new Date(startDate).getTime() + ONE_DAY_MILLS * ((week - 1) * 7 + day)
    );
    return moment(resultDate).format('YYYY.MM.DD');
  }

  /**
   * openDetailModal - 打开Modal
   */
  @Bind()
  openDetailModal(week, record) {
    if (record._status === 'create') {
      notification.warning({
        message: intl.get(`sodr.common.view.message.pleaseSaveFirst`).d('请先保存当前行'),
      });
      return;
    }
    // 预测id
    const forecastId =
      record.forecastId || (record.$form ? record.$form.getFieldValue('forecastId') : '');
    // 预测起始日期
    const forecastStartDate =
      record.weekForecastDate ||
      (record.$form ? record.$form.getFieldValue('weekForecastDate') : '');
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
      actionValue: week,
      forecastId,
      forecastStartDate,
      purchaserRemark,
      forecastStatus,
      supplierRemark,
    };
    this.setState({
      forecastDetailBase,
      weekDetailModalVisible: true,
    });
  }

  /**
   * closeDetailModal - 关闭Moda回调
   */
  @Bind()
  closeDetailModal() {
    this.setState({
      weekDetailModalVisible: false,
    });
  }

  /**
   * saveDetailSuss - 保存详情成功回调
   */
  @Bind()
  saveDetailSucc() {
    // 关闭弹窗
    this.setState({
      weekDetailModalVisible: false,
    });
    // 提示消息
    notification.success();
    // 刷新数据
    const { fetchList } = this.props;
    fetchList();
  }

  render() {
    const {
      weekForecast = {},
      fetchListLoading = false,
      bindForm,
      selectedRowKeys,
      fetchList,
      setModelValue,
      activeKey,
      handleShowRecordModal,
      enumMap = {},
      handleItemChange,
      clearSelected,
      customizeTable,
    } = this.props;
    const { list = [], pagination = {} } = weekForecast;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
        dataIndex: 'rowKey',
        key: 'rowKey',
        width: 80,
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
          .get(`${promptCode}.view.message.model.demandForecast.weekForecastDate`)
          .d('预测起始日期'),
        dataIndex: 'weekForecastDate',
        key: 'weekForecastDate',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            dateRender(text)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('weekForecastDate', {
                rules: [
                  {
                    required: activeKey === 'weekForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`${promptCode}.view.message.model.demandForecast.weekForecastDate`)
                          .d('预测起始日期'),
                      })
                      .d('预测起始日期不能为空')}`,
                  },
                ],
                initialValue:
                  record.weekForecastDate && moment(record.weekForecastDate, 'YYYY-MM-dd'),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder={null}
                  onChange={() => clearSelected()}
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        key: 'supplierCompanyCode',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(
            record._status === 'create' || record.forecastStatus === 'NEW'
          ) ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyCode', {
                rules: [
                  {
                    required: activeKey === 'weekForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`entity.supplier.code`).d('供应商编码'),
                      })
                      .d('供应商编码不能为空')}`,
                  },
                ],
                initialValue: record.supplierCompanyCode,
              })(
                <Lov
                  code="SPRM.SUPPLIER"
                  textValue={text}
                  lovOptions={{
                    valueField: 'supplierCompanyNum',
                    displayField: 'supplierCompanyNum',
                  }}
                  queryParams={{ tenantId: organizationId }}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        supplierTenantId: lovRecord.supplierTenantId,
                        supplierCompanyName: lovRecord.supplierCompanyName,
                        supplierCompanyId: lovRecord.supplierCompanyId,
                        forecastId: record.forecastId,
                      },
                      'weekForecast'
                    );
                    clearSelected();
                  }}
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        key: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(
            record._status === 'create' || record.forecastStatus === 'NEW'
          ) ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCode', {
                rules: [
                  {
                    required: activeKey === 'weekForecast',
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
                  allowClear
                  textValue={text}
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  onChange={(_, lovRecord) => {
                    handleItemChange(record, lovRecord, 'weekForecast');
                    clearSelected();
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
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week1`).d('Week1'),
        dataIndex: 'week1',
        key: 'week1',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week1', {
                initialValue: text,
              })(
                <Popover placement="top" content={this.getWeekPopover(1, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(1, record)}>{record.week1 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week2`).d('Week2'),
        dataIndex: 'week2',
        key: 'week2',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week2', {
                initialValue: record.week2,
              })(
                <Popover placement="top" content={this.getWeekPopover(2, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(2, record)}>{record.week2 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week3`).d('Week3'),
        dataIndex: 'week3',
        key: 'week3',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week3', {
                initialValue: record.week3,
              })(
                <Popover placement="top" content={this.getWeekPopover(3, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(3, record)}>{record.week3 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week4`).d('Week4'),
        dataIndex: 'week4',
        key: 'week4',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week4', {
                initialValue: record.week4,
              })(
                <Popover placement="top" content={this.getWeekPopover(4, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(4, record)}>{record.week4 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week5`).d('Week5'),
        dataIndex: 'week5',
        key: 'week5',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week5', {
                initialValue: record.week5,
              })(
                <Popover placement="top" content={this.getWeekPopover(5, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(5, record)}>{record.week5 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week6`).d('Week6'),
        dataIndex: 'week6',
        key: 'week6',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week6', {
                initialValue: record.week6,
              })(
                <Popover placement="top" content={this.getWeekPopover(6, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(6, record)}>{record.week6 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week7`).d('Week7'),
        dataIndex: 'week7',
        key: 'week7',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week7', {
                initialValue: record.week7,
              })(
                <Popover placement="top" content={this.getWeekPopover(7, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(7, record)}>{record.week7 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week8`).d('Week8'),
        dataIndex: 'week8',
        key: 'week8',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week8', {
                initialValue: record.week8,
              })(
                <Popover placement="top" content={this.getWeekPopover(8, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(8, record)}>{record.week8 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week9`).d('Week9'),
        dataIndex: 'week9',
        key: 'week9',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week9', {
                initialValue: record.week9,
              })(
                <Popover placement="top" content={this.getWeekPopover(9, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(9, record)}>{record.week9 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week10`).d('Week10'),
        dataIndex: 'week10',
        key: 'week10',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week10', {
                initialValue: record.week10,
              })(
                <Popover placement="top" content={this.getWeekPopover(10, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(10, record)}>{record.week10 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week11`).d('Week11'),
        dataIndex: 'week11',
        key: 'week11',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week11', {
                initialValue: record.week11,
              })(
                <Popover placement="top" content={this.getWeekPopover(11, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(11, record)}>{record.week11 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${promptCode}.view.message.model.demandForecast.week12`).d('Week12'),
        dataIndex: 'week12',
        key: 'week12',
        width: 100,
        render: (text, record) => {
          const returnComponent = (
            <Form.Item>
              {record.$form.getFieldDecorator('week12', {
                initialValue: record.week12,
              })(
                <Popover placement="top" content={this.getWeekPopover(12, record.weekForecastDate)}>
                  <a onClick={() => this.openDetailModal(12, record)}>{record.week12 || 0}</a>
                </Popover>
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
        render: (text, record) => {
          const returnComponent = !(
            record._status === 'create' || record.forecastStatus === 'NEW'
          ) ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('companyId', {
                rules: [
                  {
                    required: activeKey === 'weekForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`entity.company.tag`).d('公司'),
                      })
                      .d('公司不能为空')}`,
                  },
                ],
                initialValue: record.companyId,
              })(
                <Lov
                  textValue={text}
                  code="SPFM.USER_AUTH.COMPANY"
                  queryParams={{ organizationId }}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        companyName: lovRecord.companyName,
                        forecastId: record.forecastId,
                      },
                      'weekForecast'
                    );
                    clearSelected();
                  }}
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
          const returnComponent = !(
            record._status === 'create' || record.forecastStatus === 'NEW'
          ) ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                rules: [
                  {
                    required: activeKey === 'weekForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`sodr.common.model.common.invOrganizationName`)
                          .d('库存组织'),
                      })
                      .d('库存组织不能为空')}`,
                  },
                ],
                initialValue: record.invOrganizationId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.INVORG"
                  textValue={text}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        invOrganizationName: lovRecord.organizationName,
                        forecastId: record.forecastId,
                      },
                      'weekForecast'
                    );
                    clearSelected();
                  }}
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
        render: (text, record) => {
          const returnComponent = !(
            record._status === 'create' ||
            record.forecastStatus === 'NEW' ||
            record.forecastStatus === 'FEEDBACK' ||
            record.forecastStatus === 'UPDATED'
          ) ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaserRemark', {
                rules: [
                  {
                    max: 255,
                    message: intl.get(`hzero.common.validation.max`, {
                      max: 255,
                    }),
                  },
                ],
                initialValue: record.purchaserRemark,
              })(<Input onChange={() => clearSelected()} />)}
            </Form.Item>
          );
          return returnComponent;
        },
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
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.supplierConfirmDelivery`)
          .d('供应商确认交期'),
        dataIndex: 'supplierConfirmDelivery',
        key: 'supplierConfirmDelivery',
        width: 150,
        render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        key: 'supplierRemark',
        width: 150,
        // render: (text, record) => {
        //   const returnComponent = !(record._status === 'create' || record.forecastStatus === 'NEW' || record.forecastStatus === 'FEEDBACK') ? (
        //     text
        //   ) : (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator('supplierRemark', {
        //         rules: [
        //           {
        //             max: 255,
        //             message: intl.get(`hzero.common.validation.max`, {
        //               max: 255,
        //             }),
        //           },
        //         ],
        //         initialValue: record.supplierRemark,
        //       })(<Input />)}
        //     </Form.Item>
        //   );
        //   return returnComponent;
        // },
      },
      {
        title: intl.get(`hzero.common.date.dataSource`).d('数据来源'),
        dataIndex: 'dataSource',
        key: 'dataSource',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.creator').d('创建人'),
        dataIndex: 'creatorName',
        key: 'creatorName',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.createTime').d('创建时间'),
        dataIndex: 'creationDate',
        key: 'creationDate',
        width: 150,
        render: (text) => moment(text).format(DEFAULT_DATE_FORMAT),
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
                viewOnly={
                  !['NEW', 'UPDATED', 'FEEDBACK', undefined].includes(record.forecastStatus)
                }
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
                bucketDirectory="sprm-pr"
                name="supplierAttachmentUuid"
                viewOnly
              />
            )}
          </Form.Item>
        ),
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
      scroll: { x: scrollX, y: 'calc(100vh - 390px)' },
      pagination,
      onChange: fetchList,
      rowKey: 'forecastId',
      rowSelection: {
        // getCheckboxProps: record => ({ disabled: record._status!=="create" }),
        selectedRowKeys,
        onChange: this.onRowSelectChange,
      },
    };
    const { weekDetailModalVisible, forecastDetailBase } = this.state;
    const weekDetailModalProps = {
      visible: weekDetailModalVisible,
      onCancel: this.closeDetailModal,
      onSave: this.saveDetailSucc,
      actionkey: 'week',
      operateType: 'purchaser',
      processing: true,
      forecastDetailBase,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...fiterProps} />
          {weekDetailModalVisible && <DetailModal {...weekDetailModalProps} />}
        </div>
        {customizeTable(
          {
            code: 'SPRM.PREDICTION_ORDER_CREATION.WEEK_LIST',
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
