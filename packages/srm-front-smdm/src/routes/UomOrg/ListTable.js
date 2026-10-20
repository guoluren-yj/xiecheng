import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import classNames from 'classnames';
import Checkbox from 'components/Checkbox';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { isString } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';

/**
 * 租户计量单位数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCleanLine - 清除行
 * @reactProps {Function} onEditLine - 编辑行
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */

export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeTable,
      loading,
      dataSource,
      pagination,
      onSearch,
      onEditLine,
      onCleanLine,
    } = this.props;
    const columns = [
      {
        title: intl.get(`smdm.uom.model.uom.uomCode`).d('计量单位编码'),
        dataIndex: 'uomCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.uom.model.uom.uomCode`).d('计量单位编码'),
                    }),
                  },
                  {
                    max: 100,
                    message: intl.get('hzero.common.validation.max', {
                      max: 100,
                    }),
                  },
                ],
                initialValue: val,
              })(<Input disabled={record._status !== 'create'} inputChinese />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`smdm.uom.model.uom.uomName`).d('计量单位名称'),
        dataIndex: 'uomName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomName`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.uom.model.uom.uomName`).d('计量单位名称'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`smdm.uom.model.uom.uomName`).d('计量单位名称')}
                  field="uomName"
                  token={record._token}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`smdm.uom.model.uom.conversionUomId`).d('转换单位'),
        dataIndex: 'conversionUomId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`conversionUomId`, {
                initialValue: val,
              })(
                <Lov
                  code="SMDM.UOM"
                  lovOptions={{ valueField: 'uomId' }}
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  textValue={record.conversionUomName}
                />
              )}
            </Form.Item>
          ) : (
            record.conversionUomName
          ),
      },
      {
        title: intl.get(`smdm.uom.model.uom.uomConversionRate`).d('单位转换率'),
        dataIndex: 'uomConversionRate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomConversionRate`, {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('conversionUomId'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.uom.model.uom.uomConversionRate`).d('单位转换率'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `1:${value}`}
                  parser={(value) => (isString(value) ? value?.replace('1:', '') : value)}
                  max={99999999.99999999}
                  min={0.00000001}
                  precision={8}
                />
              )}
            </Form.Item>
          ) : val ? (
            `1:${val}`
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`smdm.uom.model.uom.uomPrecision`).d('精度'),
        dataIndex: 'uomPrecision',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomPrecision`, {
                initialValue: val,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={2147483647}
                  inputChinese={false}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`smdm.uom.model.uom.uomTypeName`).d('单位类型名称'),
        dataIndex: 'uomTypeCode',
        width: 220,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`uomTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.uom.model.uom.uomTypeName`).d('单位类型名称'),
                    }),
                  },
                ],
                initialValue: record.uomTypeCode,
              })(
                <Lov
                  code="SMDM.UOM_TYPE"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  textValue={record.uomTypeName}
                />
              )}
            </Form.Item>
          ) : (
            record.uomTypeName
          ),
      },
      {
        title: intl.get('smdm.common.model.common.externalSystemCode').d('来源系统'),
        dataIndex: 'sourceCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`sourceCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.common.model.common.sourceCode').d('来源系统'),
                    }),
                  },
                ],
                initialValue: record.sourceCode,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            <span>{enableRender(val)}</span>
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 90,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <a onClick={() => onCleanLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : record._status === 'update' ? (
            <a onClick={() => onEditLine(record, false)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => onEditLine(record, true)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SMDM_UOM-ORG.LIST',
          },
          <EditTable
            bordered
            rowKey="uomId"
            loading={loading}
            className={classNames(styles['smdm-uom-list'])}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page)}
          />
        )}
      </Fragment>
    );
  }
}
