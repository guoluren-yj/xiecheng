import React, { PureComponent, Fragment } from 'react';
import { Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 租户期间定义数据展示组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChangeFlag - 行编辑
 * @reactProps {Function} onCleanLine - 行清除操作
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Array} dataSource - table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {object} [pagination.current] - 当前页码
 * @reactProps {object} [pagination.pageSize] - 分页大小
 * @reactProps {object} [pagination.total] - 数据总量
 * @reactProps {Function} reateRule - 期间维护
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      pagination,
      loading,
      onSearch,
      onChangeFlag,
      onCreateRule,
      onCleanLine,
    } = this.props;
    const columns = [
      {
        title: intl.get(`smdm.period.model.period.periodSetCode`).d('会计期编码'),
        dataIndex: 'periodSetCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`periodSetCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.period.model.period.periodSetCode`).d('会计期编码'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Input
                  trim
                  typeCase="upper"
                  inputChinese={false}
                  disabled={!(record._status === 'create')}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`smdm.period.model.period.periodSetName`).d('会计期名称'),
        dataIndex: 'periodSetName',
        width: 250,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item style={{ display: 'inline-block', marginBottom: 0 }}>
              {record.$form.getFieldDecorator('periodSetName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.period.model.period.periodSetName`).d('会计期名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`smdm.period.model.period.periodSetName`).d('会计期名称')}
                  field="periodSetName"
                  token={record._token}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`smdm.period.model.period.periodTotalCount`).d('期间总数'),
        dataIndex: 'periodTotalCount',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('smdm.period.view.option.create').d('创建规则'),
        dataIndex: 'createRule',
        width: 100,
        align: 'left',
        render: (val, record) =>
          record._status === 'create' ? (
            ''
          ) : (
            <a onClick={() => onCreateRule(record)} style={{ cursor: 'pointer', color: '#29BECE' }}>
              {intl.get('smdm.period.view.message.maintain').d('期间维护')}
            </a>
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'left',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 90,
        align: 'left',
        render: (val, record) =>
          record._status === 'create' ? (
            <a style={{ cursor: 'pointer' }} onClick={() => onCleanLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : record._status === 'update' ? (
            <a onClick={() => onChangeFlag(record, false)} style={{ cursor: 'pointer' }}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => onChangeFlag(record, true)} style={{ cursor: 'pointer' }}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          loading={loading}
          // className={classNames(styles['smdm-period-list'])}
          rowKey="periodSetId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page)}
        />
      </Fragment>
    );
  }
}
