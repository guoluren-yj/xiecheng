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
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

import FilterForm from './FilterForm';

const { YearPicker } = DatePicker;

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
      element.$form.resetFields();
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(annualForecastSelectedRowKeys, selectedRows) {
    const { handleRowSelectChange } = this.props;
    const annualForecastSelectedRows = selectedRows.map((o) => {
      return { ...o, ...o.$form.getFieldsValue() };
    });
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
      handleItemChange,
      clearSelected,
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
        width: 150,
        render: (text, record) => {
          const returnComponent = !(
            record._status === 'create' || record.forecastStatus === 'NEW'
          ) ? (
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
                initialValue:
                  record.forecastYear && moment(`${record.forecastYear} + "01-01"`, 'YYYY-MM-dd'),
              })(
                <YearPicker
                  onChange={() => {
                    clearSelected();
                  }}
                  placeholder={intl
                    .get(`${promptCode}.view.message.model.selectYear`)
                    .d('请选择年份')}
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
                    required: activeKey === 'annualForecast',
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
                  textValue={record.supplierCompanyCode}
                  queryParams={{ tenantId: organizationId }}
                  lovOptions={{
                    valueField: 'supplierCompanyNum',
                    displayField: 'supplierCompanyNum',
                  }}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        supplierTenantId: lovRecord.supplierTenantId,
                        supplierCompanyName: lovRecord.supplierCompanyName,
                        supplierCompanyId: lovRecord.supplierCompanyId,
                        forecastId: record.forecastId,
                      },
                      'annualForecast'
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
                  allowClear
                  textValue={text}
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  onChange={(_, lovRecord) => {
                    handleItemChange(record, lovRecord, 'annualForecast');
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
        width: 240,
      },
      {
        title: intl.get(`sodr.common.model.common.modelNumber`).d('型号'),
        dataIndex: 'itemModel',
        key: 'itemModel',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.demandForecast.forecastQuantity`)
          .d('预测数量'),
        dataIndex: 'forecastQuantity',
        key: 'forecastQuantity',
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
              {record.$form.getFieldDecorator('forecastQuantity', {
                rules: [
                  {
                    required: activeKey === 'annualForecast',
                    message: `${intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl
                          .get(`${promptCode}.view.message.model.demandForecast.forecastQuantity`)
                          .d('预测数量'),
                      })
                      .d('预测数量不能为空')}`,
                  },
                ],
                initialValue: record.forecastQuantity,
              })(
                <InputNumber min={1} style={{ width: '100%' }} onChange={() => clearSelected()} />
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
                    required: activeKey === 'annualForecast',
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
                      'annualForecast'
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
                  textValue={text}
                  onChange={(_, lovRecord) => {
                    setModelValue(
                      {
                        invOrganizationName: lovRecord.organizationName,
                        forecastId: record.forecastId,
                      },
                      'annualForecast'
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
          .get(`${promptCode}.view.message.model.demandForecast.feedbackStockQuantity`)
          .d('供应商反馈库存数量'),
        dataIndex: 'feedbackQuantity',
        key: 'feedbackQuantity',
        width: 150,
        // render: (text, record) => {
        //   const returnComponent = !(record._status === 'create' || record.forecastStatus === 'NEW' || record.forecastStatus === 'FEEDBACK') ? (
        //     text
        //   ) : (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator('feedbackQuantity', {
        //         rules: [
        //           {
        //             required: activeKey === 'annualForecast',
        //             message: `${intl.get(`${promptCode}`).d('供应商反馈库存数量')}不能为空`,
        //           },
        //         ],
        //         initialValue: record.feedbackQuantity,
        //       })(<InputNumber min={1} style={{ width: '100%' }} />)}
        //     </Form.Item>
        //   );
        //   return returnComponent;
        // },
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
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...fiterProps} />
        </div>
        {customizeTable(
          {
            code: 'SPRM.PREDICTION_ORDER_CREATION.YEAR_LIST',
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
