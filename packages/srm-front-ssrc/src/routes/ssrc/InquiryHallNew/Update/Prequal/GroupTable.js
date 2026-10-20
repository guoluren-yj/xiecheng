/**
 * 组别table
 */
import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const promptCode = 'ssrc.inquiryHall';

export default class GroupTable extends PureComponent {
  /**
   * 新增
   */
  @Bind()
  handleAdd() {
    const { groupTableDs } = this.props;
    groupTableDs.create({
      groupName: `${intl.get(`${promptCode}.model.inquiryHall.group`).d('分组')}${
        (groupTableDs.length || 0) + 1
      }`,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { groupTableDs } = this.props;
    const groupTableDsSelected = groupTableDs.selected;
    groupTableDs.delete(groupTableDsSelected, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  }

  get columns() {
    return [
      {
        name: 'groupName',
        width: 180,
        renderer: ({ record }) =>
          `${intl.get(`${promptCode}.model.inquiryHall.group`).d('分组')}${
            (record.index || 0) + 1
          }`,
      },
      {
        name: 'sectionLov',
        width: 300,
        editor: true,
      },
    ];
  }

  render() {
    const { groupTableDs } = this.props;
    return (
      <Table
        bordered
        rowKey="prequalGroupHeaderId"
        dataSet={groupTableDs}
        columns={this.columns}
        buttons={[
          [
            'add',
            {
              onClick: this.handleAdd,
            },
          ],
          [
            'delete',
            {
              onClick: this.handleDelete,
            },
          ],
        ]}
        style={{ maxHeight: '4.5rem' }}
      />
    );
  }
}
