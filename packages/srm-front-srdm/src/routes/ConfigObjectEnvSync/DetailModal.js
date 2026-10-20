import React, { useMemo, useEffect } from 'react';
import { Tag } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import { colorTypeEnum } from './index';

function getDetailDs() {
  return {
    selection: false,
    paging: false,
    autoQuery: false,
    fields: [
      {
        type: 'string',
        name: 'fieldName',
        label: '字段名',
      },
      {
        type: 'string',
        name: 'fieldDesc',
        label: '字段描述',
      },
      {
        type: 'string',
        name: 'fieldType',
        label: '字段类型',
      },
      {
        type: 'string',
        name: 'fieldSeq',
        label: '字段序号',
      },
      {
        type: 'string',
        name: 'fieldValue',
        label: '来源字段值',
      },
      {
        type: 'string',
        name: 'testFieldValue',
        label: '目标字段值',
      },
      {
        type: 'string',
        name: 'prodFieldValue',
        label: '目标字段值',
      },
      {
        type: 'string',
        name: 'testMigrateBehaviour',
        lookupCode: 'SRDM.MIGRATE_TYPE',
        label: '迁移行为',
      },
      {
        type: 'string',
        name: 'prodMigrateBehaviour',
        lookupCode: 'SRDM.MIGRATE_TYPE',
        label: '迁移行为',
      },
    ],
  };
}

const DetailModal = (props) => {
  const dataSet = useMemo(() => new DataSet(getDetailDs()), []);
  const columns = useMemo(
    () => [
      {
        name: 'fieldName',
      },
      {
        name: 'fieldDesc',
      },
      {
        name: 'fieldType',
      },
      {
        name: 'fieldSeq',
      },
      {
        name: 'fieldValue',
      },
      props.env !== 'dev' && {
        name: props.env === 'test' ? 'testFieldValue' : 'prodFieldValue',
      },
      props.env !== 'dev' && {
        name: props.env === 'test' ? 'testMigrateBehaviour' : 'prodMigrateBehaviour',
        renderer: ({ value, text }) => {
          return <Tag color={colorTypeEnum[value]}>{text}</Tag>;
        },
      },
    ],
    [props]
  );

  useEffect(() => {
    if (dataSet.status === 'ready') {
      dataSet.loadData(props.data);
    }
  }, [dataSet, props]);

  return <Table columns={columns} dataSet={dataSet} style={{ maxHeight: 500 }} />;
};

export default DetailModal;
