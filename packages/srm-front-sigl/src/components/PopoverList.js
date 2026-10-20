import React from 'react';
import { Popover, Table } from 'hzero-ui';

export default function PopoverList(props) {
  const { popoverProps = {}, title = '', columns = [], dataSource = [] } = props;
  return (
    <Popover
      placement="left"
      {...popoverProps}
      title={title}
      content={<Table bordered pagination={false} dataSource={dataSource} columns={columns} />}
    >
      <a>
        {title}({dataSource.length})
      </a>
    </Popover>
  );
}
