import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, TextField } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import ImgIcon from '@/utils/ImgIcon';

import CreateNewTag from './CreateNewTag';
import TagsDataSet from './stores/TagsManagerDataSet';

import styles from './index.less';

/**
 * @params callback: 查询左侧菜单列表
 */
export default observer(({ callback = () => {} }: { callback: () => void }) => {
  const ds = useMemo(() => {
    return new DataSet(TagsDataSet());
  }, []);
  const [curNode, setCurNode] = useState<string | undefined>();

  useEffect(() => {
    ds.query();
  }, []);

  const searchTag = (e: any) => {
    ds.setQueryParameter('content', e?.target?.value);
    ds.query();
  };

  const columns: ColumnProps[] = [
    {
      header: '标签颜色',
      name: 'color',
      width: 80,
      resizable: false,
      renderer: ({ value }) => <i style={{ background: value }} className={styles.colorBadge} />,
    },
    {
      header: '标签名称',
      name: 'labelName',
      resizable: false,
    },
    {
      header: '标签编码',
      name: 'labelCode',
      resizable: false,
    },
    {
      header: '操作',
      width: 150,
      command: ({ dataSet, record }) => [
        <CreateNewTag
          callback={() => {
            callback();
            dataSet.query();
          }}
          labelId={record.get('labelId')}
          curNode={curNode}
        >
          <ImgIcon
            name="EditTag.svg"
            size={14}
            style={{ margin: '0 10px', cursor: 'pointer' }}
            onClick={() => setCurNode(record.get('labelId'))}
          />
        </CreateNewTag>,
        <ImgIcon
          name="delete-black.svg"
          size={14}
          onClick={() =>
            ds.delete(record, {
              className: 'lowcode-m-modal',
              children: '确认删除选中行？',
              onOk: callback,
            })
          }
          style={{ margin: '0 10px', cursor: 'pointer' }}
        />,
      ],
    },
  ];

  return (
    <>
      <div className={styles['manager-table-top']}>
        <TextField
          onKeyUp={(e) => searchTag(e)}
          placeholder="请搜索标签名称或标签编码"
          suffix={<ImgIcon name="search@v4.0.svg" size={14} />}
        />
        <CreateNewTag
          callback={() => {
            return ds.query();
          }}
          curNode={curNode}
        >
          <Button
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            onClick={() => setCurNode(undefined)}
          >
            <ImgIcon name="TagsCreate.svg" size={14} style={{ marginRight: 4 }} />
            新建标签
          </Button>
        </CreateNewTag>
      </div>
      <Table dataSet={ds} columns={columns} className={styles['manager-table']} />
    </>
  );
});
