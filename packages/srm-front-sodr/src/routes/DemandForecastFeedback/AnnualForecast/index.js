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
import { Form, Input, InputNumber, DatePicker } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';

import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import moment from 'moment';

import FilterForm from './FilterForm';

const promptCode = 'sodr.demandForecast';
// const CODE_UPPER = /^[A-Z0-9_]*$/;
const organizationId = getCurrentOrganizationId();
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

export default class extends React.Component {
  form;

  componentDidMount() {
    const { fetchList } = this.props;
    fetchList();
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    const { fetchList, annualForecast = {} } = this.props;
    const { list = [] } = annualForecast;
    fetchList({ current: 1, pageSize: 10 });
    list.forEach((element) => {
      if (element.forecastStatus !== 'FEEDBACK') {
        element.$form.resetFields();
      }
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(annualForecastSelectedRowKeys, annualForecastSelectedRows) {
    const { handleRowSelectChange } = this.props;
    handleRowSelectChange({ annualForecastSelectedRowKeys, annualForecastSelectedRows });
  }

  render() {
    const {
      annualForecast = {},
      fetchListLoading = false,
      bindForm,
      selectedRowKeys,
      fetchList,
      setModelValue,
      activeKey,
      handleShowRecordModal,
      enumMap,
      customizeTable,
    } = this.props;
    const { list = [], pagination = {} } = annualForecast;
    const columns = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastStatus`)
          .d('反馈状态'),
        dataIndex: 'forecastStatusMeaning',
        key: 'forecastStatusMeaning',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastYear`)
          .d('预测年份'),
        dataIndex: 'forecastYear',
        key: 'forecastYear',
        width: 100,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create') ? (
            text
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('forecastYear', {
                rules: [
                  {
                    required: activeKey === 'annualForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`${promptCode}.view.message.model.demandForecast.forecastYear`)
                          .d('预测年份'),
                      })
                      .d('预测年份不能为空')}`,
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
                    required: activeKey === 'annualForecast',
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
                      'annualForecast'
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
        width: 240,
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
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastQuantity`)
          .d('预测数量'),
        dataIndex: 'forecastQuantity',
        key: 'forecastQuantity',
        width: 150,
      },
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
                    required: activeKey === 'annualForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`entity.company.tag`).d('公司'),
                      })
                      .d('公司不能为空')}`,
                  },
                ],
                initialValue: record.companyName,
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
                    required: activeKey === 'annualForecast',
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
                      required: activeKey === 'annualForecast',
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
          const returnComponent = !(record._status === 'create') ? (
            <a onClick={() => handleShowRecordModal(record)}>
              {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
            </a>
          ) : null;
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
        // getCheckboxProps: record => ({ disabled: record.forecastStatus==="FEEDBACK" }),
        selectedRowKeys,
        onChange: this.onRowSelectChange,
      },
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...fiterProps} />
        </div>
        {customizeTable(
          {
            code: 'SPRM.PREDICTION_ORDER_FEEDBACK.YEAR_LIST',
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
