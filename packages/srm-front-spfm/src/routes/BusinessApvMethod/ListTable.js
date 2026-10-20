import React, { PureComponent, Fragment } from 'react';
import { Select } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

/**
 * 企业审批方式数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
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
   * 修改审批方式
   * @param {string} value - 审批方式
   * @param {number} index - 索引值
   */
  handleChangeMethod(value, index) {
    this.props.onChangeMethod(value, index);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, methodList, onChange, onChangeMethod } = this.props;

    const columns = [
      {
        title: intl.get('spfm.businessApvMethod.model.business.bizCatogoryCode').d('单据类别编码'),
        dataIndex: 'bizCategoryCode',
        width: 200,
      },
      {
        title: intl
          .get('spfm.businessApvMethod.model.business.bizCatogoryMeaning')
          .d('单据类别名称'),
        dataIndex: 'bizCategoryMeaning',
      },
      {
        title: intl.get('spfm.businessApvMethod.model.business.bizTypeCode').d('单据类型编码'),
        dataIndex: 'bizTypeCode',
        width: 200,
      },
      {
        title: intl.get('spfm.businessApvMethod.model.business.bizTypeMeaning').d('单据类型名称'),
        dataIndex: 'bizTypeMeaning',
      },
      {
        title: intl.get('spfm.businessApvMethod.model.business.methodMeaning').d('审批方式'),
        dataIndex: 'methodMeaning',
        width: 200,
        render: (val, record, index) =>
          ['create', 'update'].includes(record._status)
            ? record.$form.getFieldDecorator('methodCode', {
                initialValue: record.methodCode,
              })(
                <Select onChange={value => onChangeMethod(value, index)} style={{ width: '90%' }}>
                  {methodList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )
            : val,
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          loading={loading}
          rowKey={(_, index) => index}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onChange(page)}
        />
      </Fragment>
    );
  }
}
