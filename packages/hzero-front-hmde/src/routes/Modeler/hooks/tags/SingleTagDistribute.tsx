import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Popconfirm } from 'choerodon-ui';
import { TargetType } from '@/globalData/common';
import ImgIcon from '@/utils/ImgIcon';

import TagsDistributeDataSet from './stores/TagsDistributeDataSet';
import { batchCreateLabelAssigns } from '@/services/modelListService';

import styles from './index.less';

interface IParams {
  name?: string;
  page?: number;
  size?: number;
}
interface ISingleTagDistribute {
  children: ReactNode;
  code: string;
  type: TargetType;
  leftMenuDsQuery: (params: IParams) => void;
}

export default ({ children, code, type, leftMenuDsQuery }: ISingleTagDistribute) => {
  const [visible, setVisible] = useState(false);
  const [initTags, setInitTags] = useState<any[]>([]);

  const ds = useMemo(() => new DataSet(TagsDistributeDataSet(type)), []);

  useEffect(() => {
    if (visible && type) {
      ds.setQueryParameter('targetValue', code);
      ds.query().then((res) => setInitTags(res?.labelCodes || []));
    }
  }, [visible]);

  const onConfirm = async () => {
    const { labelCodes: tags } = ds.current?.toData();
    const addLabelCodes = tags?.filter((t: string) => !initTags.includes(t));
    const removeLabelCodes = initTags?.filter((t: string) => !tags.includes(t));
    if (addLabelCodes.length > 0 || removeLabelCodes.length > 0) {
      const body = {
        addLabelCodes,
        removeLabelCodes,
        targetType: type,
        targetValues: [code],
      };
      const res = await batchCreateLabelAssigns(body);
      if (getResponse(res)) {
        notification.success({
          message: '操作成功',
        } as any);
        if (typeof leftMenuDsQuery === 'function') {
          leftMenuDsQuery({});
        }
      }
    }
  };

  return (
    <Popconfirm
      title={
        <Form dataSet={ds} labelLayout={LabelLayout.vertical}>
          <Select
            name="labelCodes"
            searchable
            label="选择标签"
            suffix={<ImgIcon name="open-black.svg" size={12} />}
            popupCls={styles['select-menu']}
            getPopupContainer={(node) => node}
            clearButton={false}
            noCache
          />
        </Form>
      }
      placement="right"
      trigger="click"
      visible={visible}
      onVisibleChange={(val) => setVisible(val)}
      overlayClassName={styles['single-tag-distribute']}
      okType="primary"
      onConfirm={() => onConfirm()}
    >
      {children}
    </Popconfirm>
  );
};
