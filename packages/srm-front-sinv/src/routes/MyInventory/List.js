/*
 * List - 我的库存录入查询列表信息
 * @date: 2019/12/14 10:41:50
 * @author: ZTC <tangchen.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { sum, isNumber, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import styles from './index.less';
import { showBigNumber } from '../components/utils';

/**
 * 我的库存录入查询列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */

const modelPrompt = 'sinv.common.model.common';
@Form.create({ fieldNameProp: null })
export default class List extends PureComponent {
  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      cuxEditor,
      pagination = {},
      rowSelection,
      onModalVisible,
      customizeTable,
      onOccupancyModalVisible,
      onSupCompanyIdChange,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.vendorCode`).d('供应商'),
        dataIndex: 'supplierCompanyId',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`supplierCompanyId `, {
                initialValue: record.supplierCompanyName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.vendorCode`).d('供应商'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPUC_SUPPLIER_QUERY"
                  disabled={record._status !== 'create'}
                  textValue={record.supplierName}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    supplierTenantId: getUserOrganizationId(),
                  }}
                  onChange={(_, lovRecord) => onSupCompanyIdChange(record, lovRecord)}
                />
              )}
            </Form.Item>
          ) : (
            record.supplierCompanyName
          ),
      },
      {
        title: intl.get(`${modelPrompt}.clientCompanyName`).d('客户公司名称'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`companyId`, {
                initialValue: record.companyName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.clientCompanyName`).d('客户公司名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPUC.SSTK.COMPANY_CUSTOMER"
                  disabled={!record.supplierCompanyId}
                  textValue={record.companyName}
                  queryParams={{
                    supplierCompanyId: record.supplierCompanyId,
                    supplierTenantId: getUserOrganizationId(),
                    tenantId: getCurrentOrganizationId(),
                  }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({
                      companyId: lovRecord.companyId,
                      companyName: lovRecord.companyName,
                      companyNum: lovRecord.companyNum,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.companyName
          ),
      },
      {
        title: intl.get(`${modelPrompt}.ouId`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`ouId`, {
                initialValue: record.ouId,
              })(
                <Lov
                  code="HPFM.OU"
                  textValue={record.ouName}
                  disabled={record._status !== 'create'}
                  queryParams={{
                    companyId: record.companyId,
                    tenantId: getCurrentOrganizationId(),
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{record?.ouName}</span>
          ),
      },
      {
        title: intl.get(`${modelPrompt}.invOrganizationId`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`invOrganizationId`, {
                initialValue: record.invOrganizationId,
              })(
                <Lov
                  code="SPUC.SINV_STOKC_INV_ORG"
                  textValue={record.organizationName}
                  disabled={record._status !== 'create'}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{record?.organizationName}</span>
          ),
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemId`, {
                initialValue: record.itemId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.item.code`).d('物料编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="STOCK.STOCK_ITEM"
                  // textField="itemCode"
                  textValue={record.itemCode}
                  disabled={record._status !== 'create'}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({
                      itemName: lovRecord.itemName,
                      uomName: lovRecord.uomName,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemName`, {
                initialValue: record.itemName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomName`, {
                initialValue: record.uomName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            this.showUomText(record)
          ),
      },
      {
        title: intl.get(`${modelPrompt}.inputQuantity`).d('录入数量'),
        dataIndex: 'inputQuantity',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator(`inputQuantity`, {
                  // initialValue: record.inputQuantity,
                })(<InputNumber allowThousandth precision={record.uomPrecision} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.comment`).d('备注'),
        dataIndex: 'comment',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator(`comment`, {
                  // initialValue: record.comment,
                })(<Input.TextArea rows={1} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.undeliveredQuantity`).d('未交货数量'),
        dataIndex: 'undeliveredQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.onWayQuantity`).d('在途数量'),
        dataIndex: 'occupiedQuantity',
        width: 150,
        render: (val, record) => {
          // 舍得酒业埋点判断
          if (
            cuxEditor &&
            record?.attributeVarchar10 &&
            ['ERP', 'MES'].includes(record?.attributeVarchar10)
          ) {
            return <span>{showBigNumber(val)}</span>;
          }
          return <a onClick={() => onOccupancyModalVisible(true, record)}>{showBigNumber(val)}</a>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.stockQuantity`).d('库存现有量'),
        dataIndex: 'stockQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.lastUpdate`).d('最后更新时间'),
        dataIndex: 'lastUpdateDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.view.button.operationRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
        // width: 150,
        render: (val, record) =>
          ['update'].includes(record._status) ? (
            <a onClick={() => onModalVisible(true, record)}>
              {intl.get('sinv.common.view.button.operationRecord').d('操作记录')}
            </a>
          ) : (
            val
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 150;
    return customizeTable(
      {
        code: 'SINV.MY_INVENTORY_LINE.LIST',
        __force_record_to_update__: true,
      },
      <EditTable
        className={styles.editTable}
        resizable
        rowSelection={rowSelection}
        loading={loading}
        rowKey="itemStorageId"
        bordered
        scroll={{ x: scrollX }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page)}
      />
    );
  }
}
