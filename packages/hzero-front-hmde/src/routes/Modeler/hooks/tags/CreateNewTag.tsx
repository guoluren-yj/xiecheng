import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { DataSet, Form, TextField, ColorPicker, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Tooltip } from 'choerodon-ui';
import ImgIcon from '@/utils/ImgIcon';

import TagsDataSet from './stores/TagsManagerDataSet';
import { checkLabelNameExist } from '@/services/modelListService';

import styles from './index.less';

interface INewTags {
  children?: string | ReactNode;
  callback?: () => void;
  labelId?: string;
  curNode?: string;
}

export default observer(({ children, callback = () => {}, labelId, curNode }: INewTags) => {
  const ds = useMemo(() => new DataSet(TagsDataSet(labelId)), [labelId]);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmFlag, setConfirmFlag] = useState<boolean>(false); // 名称重复二次确认

  useEffect(() => {
    if (ds.current && visible) {
      ds.current.reset();
    }
    if (labelId && visible) {
      ds.query();
    }
  }, [visible]);

  useEffect(() => {
    // 切换节点
    if (curNode !== labelId) setVisible(false);
  }, [curNode]);

  const cancel = () => {
    if (confirmFlag) {
      setConfirmFlag(false);
    } else {
      setVisible(false);
    }
  };
  const save = async () => {
    const confirm = async () => {
      if (await ds.submit()) {
        callback(); // 标签管理弹窗列表刷新
        ds.reset();
      }
      setVisible(false);
      setConfirmFlag(false);
    };
    if ((await ds.current?.validate()) && !confirmFlag) {
      const { labelName, labelCode } = ds.current?.toData();
      const res = await checkLabelNameExist({
        labelName,
        labelCode: ds.current?.isNew ? undefined : labelCode,
      });
      if (res === true) {
        setConfirmFlag(true);
      } else if (res === false) {
        confirm();
      } else if (res?.failed) {
        notification.error({
          message: res?.message,
        } as any);
      }
    } else if (confirmFlag) {
      confirm();
    }
  };

  return (
    <Tooltip
      overlayClassName={styles['create-tag-pop']}
      placement="bottomRight"
      visible={visible && curNode === labelId}
      title={
        <>
          {confirmFlag ? (
            <>
              <div className={styles['confirm-title']}>
                <ImgIcon name="tips@2x.png" size={14} style={{ marginRight: 8 }} />
                <span>提示</span>
              </div>
              <div className={styles['confirm-content']}>
                当前租户下已存在重复名称的标签，请确认是否继续
              </div>
            </>
          ) : (
            <Form record={ds.current}>
              <TextField name="labelName" placeholder="请输入标签名称" />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextField name="labelCode" placeholder="请输入标签编码" style={{ flex: 1 }} />
                <Tooltip title="租户下唯一">
                  <ImgIcon name="help.svg" size={12} style={{ marginLeft: 8 }} />
                </Tooltip>
              </div>
              <ColorPicker
                name="color"
                placeholder="请输入标签颜色"
                getPopupContainer={(node) => node}
              />
            </Form>
          )}
          <div style={{ textAlign: 'right', marginTop: 4 }}>
            <Button onClick={() => cancel()}>取消</Button>
            <Button color={ButtonColor.primary} onClick={() => save()}>
              确认
            </Button>
          </div>
        </>
      }
    >
      <span
        style={{ display: 'inline-block', verticalAlign: 'baseline' }}
        onClick={() => setVisible(!visible)}
      >
        {children}
      </span>
    </Tooltip>
  );
});
