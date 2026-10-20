import React, { useState, useEffect } from 'react';
import { Dropdown, Tooltip, Menu, Modal } from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { saveTaskLabel, deleteTaskLabel } from '@/services/taskService';
import styles from './index.less';

const DetailTitle = ({ title, processTag, procId, tags, updateLabel }) => {
  const [showTags, setShowTags] = useState([]);
  const optionalTags = processTag
    ? processTag.filter(
        (i) => !showTags || !showTags.length || showTags.every((j) => j.labelId !== i.labelId)
      )
    : [];

  useEffect(() => {
    if (tags && tags.length) {
      setShowTags(tags);
    } else {
      setShowTags([]);
    }
  }, [tags]);

  const addBtn =
    !optionalTags.length > 0 ? null : (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu
            onClick={({ key }) => {
              handleAddTaskTag(key);
            }}
          >
            {optionalTags.map((label) => (
              <Menu.Item key={label.labelId}>
                <Tag color={label.labelColor}>{label.description}</Tag>
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Tag key="add" className={styles['process-label-add']}>
          <Icon type="add" style={{ fontSize: '12px' }} />
        </Tag>
      </Dropdown>
    );

  const handleAddTaskTag = (labelId) => {
    const addTag = processTag.find((i) => `${i.labelId}` === labelId);
    saveTaskLabel([{ procId, labelId }]).then((res) => {
      if (getResponse(res) && res && res[0]) {
        const newShowTags = [...showTags, { ...addTag, id: res[0].id, _token: res[0]._token }];
        notification.success();
        setShowTags(newShowTags);
        updateLabel(newShowTags);
      }
    });
  };

  const handleDeleteTaskTag = (label) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示?'),
      children: intl.get('hwfp.processDefine.view.message.deleteTag').d('确定删除标签?'),
      onOk: () => {
        const newShowTags = showTags.filter((t) => t.labelId !== label.labelId);
        deleteTaskLabel([{ id: label.id, _token: label._token }]).then((res) => {
          if (getResponse(res)) {
            notification.success();
            setShowTags(newShowTags);
            updateLabel(newShowTags);
          }
        });
      },
    });
  };

  return (
    <>
      {title}
      <span style={{ marginLeft: '8px' }} />
      {showTags && showTags.length > 0
        ? showTags.map((v) => (
            <Tag key={v.labelId} color={v.labelColor} className={styles['process-label']}>
              {v.description}
              <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
                <span
                  className={styles['process-label-close']}
                  onClick={() => {
                    handleDeleteTaskTag(v);
                  }}
                >
                  <Icon type="close" />
                </span>
              </Tooltip>
            </Tag>
          ))
        : null}
      {(!showTags || showTags.length < 3) && addBtn}
    </>
  );
};

export default DetailTitle;
