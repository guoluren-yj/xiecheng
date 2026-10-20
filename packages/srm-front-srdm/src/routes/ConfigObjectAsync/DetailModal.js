import React, { useMemo, useEffect } from 'react';
import { Tag } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import { colorTypeEnum } from '../ConfigObjectEnvSync/index';

function getDetailDs(env) {
  return {
    selection: false,
    paging: false,
    autoQuery: false,
    fields: [
      {
        type: 'string',
        name: 'tableName',
        label: '表名',
      },
      {
        type: 'string',
        name: 'uniqueCode',
        label: '唯一标识',
      },
      {
        type: 'string',
        name: 'fieldName',
        label: '字段',
      },
      {
        type: 'string',
        name: 'sourceValue',
        label: '来源环境值',
      },
      {
        type: 'string',
        name: 'targetValue',
        label: `${env}环境值`,
      },
      {
        type: 'string',
        name: 'behaviour',
        label: '类型',
      },
    ],
  };
}

const DetailModal = (props) => {
  const dataSet = useMemo(() => new DataSet(getDetailDs(props.env)), []);
  const columns = useMemo(
    () => [
      {
        name: 'tableName',
      },
      {
        name: 'fieldName',
      },
      {
        name: 'sourceValue',
      },
      {
        name: 'targetValue',
      },
      {
        name: 'behaviour',
        renderer: ({ value }) => {
          const text = value === 'UPDATE' ? '更新' : '新增';
          return <Tag color={colorTypeEnum[value]}>{text}</Tag>;
        },
      },
    ],
    [props]
  );

  useEffect(() => {
    if (dataSet.status === 'ready') {
      const {
        data: { resultLineDtos },
      } = props;

      dataSet.loadData(resultLineDtos);
    }
  }, [dataSet, props]);

  return <Table columns={columns} dataSet={dataSet} style={{ maxHeight: 500 }} />;
};

export default DetailModal;
