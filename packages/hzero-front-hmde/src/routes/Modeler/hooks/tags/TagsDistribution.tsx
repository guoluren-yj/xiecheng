import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Button, DataSet, Select } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Card, List, Tag, Tooltip } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { TargetType } from '@/globalData/common';
import ImgIcon from '@/utils/ImgIcon';
import MethodIcon from '@/routes/Modeler/component/MethodIcon';
import { queryCheckedLabelAssigns, batchCreateLabelAssigns } from '@/services/modelListService';
import CreateNewTag from './CreateNewTag';
import TagsDistributeDataSet from './stores/TagsDistributeDataSet';

import styles from './index.less';

interface ITag {
  color: string;
  labelName: string;
  labelCode: string;
  labelId?: string;
  __dirty?: boolean; // new
  _token: string;
}
interface IData {
  name: string;
  type?: string;
  code: string;
  id?: string;
}
export interface ITagsDistribution {
  data: IData[];
  type: TargetType;
  callback: (params?: any) => void;
  title?: string;
}

const getListItemIcon = (tType: string, type = 'title') => {
  const arr = [
    {
      type: 'REVERSE',
      title: '反向扫描',
      icon: 'reverse@2x.png',
    },
    {
      type: 'POSITIVE',
      title: '正向建表',
      icon: 'forward@2x.png',
    },
    {
      type: 'REDUNDANT',
      title: '共享扩展',
      icon: 'redundancy-2@2x.png',
    },
    {
      type: 'REDUNDANT_X',
      title: '独享扩展',
      icon: 'exclusiveImg_active.svg',
    },
    {
      type: 'PREDEFINE',
      title: '预置',
      icon: 'preset.svg',
    },
    {
      type: 'TENANT',
      title: '租户自定义',
      icon: 'tenantcustomization.svg',
    },
  ];
  return arr.find((i) => i.type === tType)?.[type];
};

export default forwardRef(
  ({ data, type, callback = () => {}, title = '选中的表' }: ITagsDistribution, ref?: any) => {
    const [initTags, setInitTags] = useState<ITag[]>([]);
    // const [addTags, setAddTags] = useState<ITag[]>([]);
    const [deleteTags, setDeleteTags] = useState<string[]>([]);

    const ds = useMemo(() => new DataSet(TagsDistributeDataSet(type)), []);

    const init = async () => {
      const res = await queryCheckedLabelAssigns(
        { targetType: type },
        data.map(({ code }) => code)
      );
      if (getResponse(res)) {
        setInitTags(res);
      }
    };
    useEffect(() => {
      init();
    }, [data]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const body = {
          addLabelCodes: ds.current?.get('labelCodes') || [],
          removeLabelCodes: deleteTags,
          targetType: type,
          targetValues: data?.map(({ code }) => code),
        };
        if (body.addLabelCodes?.length === 0 && body.removeLabelCodes.length === 0) {
          return true;
        }
        const res = await batchCreateLabelAssigns(body);
        if (getResponse(res)) {
          notification.success({
            message: '操作成功',
          } as any);
          callback();
          return true;
        } else {
          return false;
        }
      },
    }));

    const handleClose = (tag: ITag) => {
      if (
        initTags?.find(({ labelCode }) => labelCode === tag.labelCode) &&
        !deleteTags?.find((t) => t === tag.labelCode)
      ) {
        setDeleteTags([...deleteTags, tag.labelCode]);
      }
      if (ds.current) {
        const addTags = ds.current?.get('labelCodes');
        ds.current.set(
          'labelCodes',
          addTags.filter((item) => item !== tag.labelCode)
        );
      }
    };

    return (
      <div className={styles['tags-distribution']}>
        <List
          dataSource={data}
          header={title}
          renderItem={(item: IData) => (
            <List.Item>
              {!item.id ? (
                <Tooltip title={getListItemIcon(item.type || '', 'title')} placement="top">
                  <ImgIcon
                    name={getListItemIcon(item.type || '', 'icon')}
                    size={14}
                    style={{ marginRight: 6 }}
                  />
                </Tooltip>
              ) : (
                <div style={{ marginRight: 6 }}>
                  <MethodIcon method={(item.type || '').toLowerCase()} />
                </div>
              )}
              <span>{item.name}</span>
            </List.Item>
          )}
        />
        <Card
          title="分配标签"
          extra={
            <CreateNewTag>
              <Button color={ButtonColor.primary} funcType={FuncType.flat}>
                <ImgIcon name="TagsCreate.svg" size={14} style={{ marginRight: 4 }} />
                新建标签
              </Button>
            </CreateNewTag>
          }
        >
          <div>
            <Select
              dataSet={ds}
              name="labelCodes"
              placeholder="请选择需要添加的标签"
              // primitiveValue={false}
              searchable
              suffix={<ImgIcon name="open-black.svg" size={12} />}
              popupCls={styles['select-menu']}
              noCache
            />
            {/* <Button color={ButtonColor.primary} onClick={() => handleAdd()}>
            添加标签
          </Button> */}
          </div>
          <h3>已有标签</h3>
          <div>
            {initTags
              .filter((tag) => !deleteTags.includes(tag?.labelCode) && tag)
              ?.map((tag) => (
                <Tag key={tag?.labelId} closable afterClose={() => handleClose(tag)}>
                  <span style={{ background: tag.color }} />
                  {tag?.labelName}
                  {tag?.__dirty === false && (
                    <ImgIcon name="NEW.svg" size={18} style={{ marginLeft: 4 }} />
                  )}
                </Tag>
              ))}
          </div>
        </Card>
      </div>
    );
  }
);
