import React, { useState, useEffect } from 'react';
import { Dropdown, Tooltip, Menu, Modal } from 'choerodon-ui/pro';
import { Tag, Icon, Text } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { saveTaskLabel, deleteTaskLabel } from '@/services/taskService';
import styles from './index.less';

const TaskTag = ({ processTag = [], tags, procId, updateLabel, inline = false }) => {
  const [showTags, setShowTags] = useState([]);

  useEffect(() => {
    if (tags && tags.length) {
      setShowTags(tags);
    }
  }, [tags]);

  const optionalTags = processTag
    ? processTag.filter(
        (i) => !showTags || !showTags.length || showTags.every((j) => j.labelId !== i.labelId)
      )
    : [];

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
        notification.success();
        const newShowTags = [...showTags, { ...addTag, id: res[0].id, _token: res[0]._token }];
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
      {showTags && showTags.length > 0 ? (
        <>
          {showTags.map((v) => (
            <div
              style={{
                lineHeight: inline ? 'unset' : '32px',
                display: inline ? 'inline-block' : 'block',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  overflow: 'hidden',
                  padding: inline ? 0 : '5px 5px 5px 0',
                }}
              >
                <Tag
                  key={v.labelId}
                  color={v.labelColor}
                  className={styles['process-label']}
                  style={{ maxWidth: '100%' }}
                >
                  <Text>{v.description}</Text>
                  <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
                    <span
                      className={styles['process-label-close']}
                      style={{ top: inline ? 0 : '-6px' }}
                      onClick={() => {
                        handleDeleteTaskTag(v);
                      }}
                    >
                      <Icon type="close" />
                    </span>
                  </Tooltip>
                </Tag>
              </span>
            </div>
          ))}
          <div
            style={{
              lineHeight: inline ? 'unset' : '32px',
              display: inline ? 'inline-block' : 'block',
            }}
          >
            {showTags.length < 3 && addBtn}
          </div>
        </>
      ) : (
        addBtn
      )}
    </>
  );
};

export default TaskTag;
