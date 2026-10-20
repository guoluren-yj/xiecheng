import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Spin, TextField } from 'choerodon-ui/pro';
import { Popconfirm, Tag, Icon, Tooltip, Badge } from 'choerodon-ui';
import ImgIcon from '@/utils/ImgIcon';

import TagsScreenDataSet from './stores/TagsScreenDataSet';
import styles from './index.less';

const { CheckableTag } = Tag;

interface ITagsFilter {
  menuTagsScreenQuery: (list: string) => void;
  type: string;
  labelCodes: string; // csv
}
export default observer(({ menuTagsScreenQuery, type, labelCodes }: ITagsFilter) => {
  const ds = useMemo(() => new DataSet(TagsScreenDataSet()), []);
  const [param, setParam] = useState('');
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const labelCodeList = labelCodes ? labelCodes.split(',') : [];

  useEffect(() => {
    const show = async () => {
      if (visible) {
        ds.setQueryParameter('targetType', type);
        await ds.query();
        ds.forEach((record) => {
          if (labelCodeList.find((l) => l === record?.get('labelCode'))) {
            ds.select(record);
          }
        });
        setCount(ds.selected.length);
      } else {
        ds.unSelectAll();
        setCount(0);
      }
    };
    show();
  }, [visible, labelCodes]);

  const searchTag = async (val: string) => {
    // ds.setQueryParameter('labelName', e?.target?.value);
    setParam(val);
    ds.setQueryParameter('labelName', val);
    await ds.query();
  };

  const onConfirm = () => {
    const labelList = ds.currentSelected.map((r) => r.toJSONData()?.labelCode) || [];
    menuTagsScreenQuery(labelList?.join(','));
  };

  const TagsScreen = () => {
    const tagsRef: any = React.useRef(undefined);

    const [more, setMore] = useState(false);
    const [height, setHeight] = useState(0);

    useEffect(() => {
      setHeight(tagsRef.current?.scrollHeight);
    }, [tagsRef.current, tagsRef.current?.scrollHeight]);

    return (
      <>
        <h4>筛选</h4>
        <TextField
          // onKeyUp={(e) => searchTag(e)}
          value={param}
          onChange={(val) => searchTag(val)}
          placeholder="请搜索标签名称关键词"
          suffix={<ImgIcon name="search@v4.0.svg" size={14} />}
        />
        <Spin dataSet={ds}>
          <div
            style={
              more
                ? { minHeight: 81, maxHeight: 268, overflowY: 'auto', overflowX: 'hidden' }
                : { height: 81, overflow: 'hidden' }
            }
            ref={tagsRef}
          >
            {ds.map((record) => (
              <CheckableTag
                key={record.key}
                checked={record.isSelected}
                onChange={(checked) => {
                  if (checked) {
                    ds.select(record);
                  } else {
                    ds.unSelect(record);
                  }
                  setCount(ds.selected.length);
                }}
              >
                <i style={{ background: record.get('color') }} />
                <span>{record.get('labelName')}</span>
              </CheckableTag>
            ))}
          </div>
          {height > 81 && (
            <div className={styles['expand-more']} style={{ paddingTop: more ? 0 : 20 }}>
              <div onClick={() => setMore(!more)}>
                {more ? '收起' : '更多'}
                <Icon type="expand_more" style={{ transform: `rotate(${more ? 180 : 0}deg)` }} />
              </div>
            </div>
          )}
        </Spin>
      </>
    );
  };

  return (
    <Popconfirm
      title={TagsScreen()}
      placement="rightTop"
      trigger="click"
      visible={visible}
      onVisibleChange={(v) => setVisible(v)}
      overlayClassName={styles['tags-screen']}
      onConfirm={() => onConfirm()}
    >
      <Tooltip title="标签筛选" placement="top">
        <Badge
          count={visible ? count : labelCodeList.length}
          offset={[4, -4]}
          className={styles['screen-badge']}
        >
          <ImgIcon
            name={visible || labelCodeList?.length ? 'screen-Highlight.svg' : 'screen.svg'}
            size={16}
            style={{ marginLeft: 8, cursor: 'pointer' }}
          />
        </Badge>
      </Tooltip>
    </Popconfirm>
  );
});
