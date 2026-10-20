import React, { useState, useEffect } from 'react';
import { Popover, Table } from 'hzero-ui';

export default function PopoverList(props) {
  const {
    popoverProps = {},
    title = '',
    text = '',
    columns = [],
    dataSource = [],
    maxHeight,
  } = props;

  const [max, setMax] = useState('');

  function handleResizeSetMax() {
    if (maxHeight && maxHeight < window.innerHeight) {
      setMax(maxHeight);
    } else {
      setMax(window.innerHeight);
    }
  }

  useEffect(() => {
    handleResizeSetMax();
    window.addEventListener('resize', handleResizeSetMax);
    return () => {
      window.removeEventListener('resize', handleResizeSetMax);
    };
  }, []);

  useEffect(() => {
    if (maxHeight && maxHeight < window.innerHeight) {
      setMax(maxHeight);
    }
  }, [maxHeight]);

  return (
    <Popover
      placement="left"
      {...popoverProps}
      title={title}
      content={
        <Table
          bordered
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          style={{ maxHeight: max, overflowY: 'auto' }}
        />
      }
    >
      <a>
        {text || title}({dataSource.length})
      </a>
    </Popover>
  );
}
