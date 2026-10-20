/*
 * C7nMessage - 留言板
 * @date: 2021/07/06 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect, useState, Fragment, useRef } from 'react';
import { Modal, TextArea, Attachment, message, Menu } from 'choerodon-ui/pro';
import { autorun } from 'mobx';
import moment from 'moment';
import { List } from 'choerodon-ui';
import { trim, isEmpty, throttle } from 'lodash';
import classNames from 'classnames';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import { getResponse, getAttachmentUrl, createPagination, getCurrentUserId } from 'utils/utils';
import { Button } from 'components/Permission';

import { queryMessage, sendMessage, recallMessage } from '@/services/orderWorkspaceService';
import { ReactComponent as EmptySvg } from '@/assets/empty.svg';
import { BUCKET_NAME, MESSAGE_DIRECTORY } from '../utils/constant';
import styles from './index.less';

const ModalContent = (props) => {
  const {
    poHeaderId,
    modal: { handleOk, update },
  } = props;

  const [data, setData] = useState([]);
  const [loadings, setLoadings] = useState({});
  const [pagination, setPagination] = useState({});
  const [uuid, setUuid] = useState(uuidv4());

  const input = useRef();

  const empty = useMemo(
    () => (
      <div className={styles['modal-content-empty']}>
        {<EmptySvg />}
        <p>{intl.get('sodr.workspace.view,message.noMessage').d('暂无留言')}</p>
      </div>
    ),
    []
  );

  useEffect(() => {
    const container = document?.getElementsByClassName('c7n-list-split')[0];
    container.addEventListener('scroll', listenScroll, true);
    return () => {
      container.removeEventListener('scroll', listenScroll, true);
    };
  }, [data, pagination]);

  useEffect(() => {
    handleOk(onOk);
    handleQuery();
    update({ okProps: { loading: loadings.onOk } });
  }, []);

  const handleQuery = (isTop) => {
    if (!data.length && isTop) return;
    const { current = 0 } = pagination;
    const params = {
      poHeaderId,
      page: { ...pagination, current: isTop ? current + 1 : undefined },
    };
    loading({ queryMessage: true });
    queryMessage(params).then((res) => {
      loading({ queryMessage: false });
      if (getResponse(res)) {
        const container = document?.getElementsByClassName('c7n-list-split')[0];
        if (!container) return;
        const buttom = container?.scrollHeight - container?.scrollTop;
        setData(isTop ? res.content.concat(data) : res.content);
        setPagination(createPagination(res));
        const newContainer = document?.getElementsByClassName('c7n-list-split')[0];
        container.scrollTop = isTop
          ? newContainer?.scrollHeight - buttom
          : newContainer?.scrollHeight;
      }
    });
  };

  const listenScroll = (e) => {
    if (e.target.scrollTop === 0) {
      handleQuery(true);
    }
  };

  const onOk = throttle(
    async () => {
      if (input) {
        const inputMessage = input.current.value;
        if (!isEmpty(trim(inputMessage))) {
          const payload = {
            poHeaderId,
            message: inputMessage,
            userCampCode: 'PURCHASE',
          };
          loading({ onOk: true });
          const res = await sendMessage(payload);
          loading({ onOk: false });
          if (getResponse(res)) {
            if (input.current?.value) {
              input.current.value = '';
            }
            handleQuery();
          }
        } else {
          notification.warning({
            description: intl.get(`sodr.workspace.view.message.needMessage`).d('消息不能为空'),
          });
        }
        return false;
      }
      return false;
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const renderItem = (item) => {
    return (
      <List.Item
        onMouseEnter={() => onMouseEnter(item)}
        onMouseLeave={onMouseLeave}
        key={item.messageId}
        style={{ alignItems: item.senderFlag ? 'flex-end' : 'flex-start' }}
      >
        <List.Item.Meta
          title={
            <div className={styles['list-item-title']}>
              <span>{item.createdByName}</span>
              <span style={{ order: item.senderFlag ? -2 : 0 }}>
                {dateTimeRender(item?.creationDate)}
              </span>
              {item.recallShow && (
                <a
                  style={{ order: item.senderFlag ? -3 : 0, color: '#E64322' }}
                  onClick={() => messageRecall(item)}
                >
                  {intl.get(`sodr.workspace.view.message.recall`).d('撤回')}
                </a>
              )}
            </div>
          }
        />
        {item.attachmentUrl ? (
          <a
            href={getAttachmentUrl(item.attachmentUrl, BUCKET_NAME, MESSAGE_DIRECTORY)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.attachmentName}
          </a>
        ) : (
          item.message
        )}
      </List.Item>
    );
  };

  const onUploadSuccess = async (response, attachment) => {
    const payload = {
      poHeaderId,
      message: attachment.name,
      attachmentName: attachment.name,
      attachmentUrl: response.fileUrl,
      attachmentUuid: attachment.uid,
    };
    const res = getResponse(await sendMessage(payload));
    if (res && !res.failed) {
      handleQuery();
      setUuid(uuidv4());
    }
  };

  const onAttachmentsChange = (attachmentFile = []) => {
    autorun(() => {
      const file = attachmentFile[0];
      if (file.status === 'error') {
        message.error(file.errorMessage, undefined, undefined, 'top');
      }
    });
  };

  const onMouseEnter = (one) => {
    const distance = moment().diff(moment(one.creationDate), 'minutes');
    if (distance >= 3) {
      return;
    }
    const currentUserId = getCurrentUserId();
    const newData = data.map((item) => {
      return one.messageId === item.messageId && currentUserId === item.createdBy
        ? { ...item, recallShow: true }
        : { ...item, recallShow: false };
    });
    setData(newData);
  };

  const onMouseLeave = () => {
    const newData = data.map((item) => {
      return { ...item, recallShow: false };
    });
    setData(newData);
  };

  const messageRecall = throttle(
    (item) => {
      const params = {
        messageId: item.messageId,
      };
      recallMessage(params).then((result) => {
        const res = getResponse(result);
        if (res) {
          handleQuery();
        }
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  return (
    <Fragment>
      <div
        className={classNames({
          [styles['empty-c7n-list-split']]: data.length === 0,
          [styles['order-workspace-messageBoard']]: true,
        })}
      >
        <List
          loading={loadings.queryMessage}
          empty={!loadings.queryMessage && empty}
          dataSource={data}
          renderItem={renderItem}
        />
        <div className={styles['wrapper-button-tab']}>
          <Attachment
            icon="file_upload"
            multiple={false}
            viewMode="none"
            value={uuid}
            key={uuid}
            onChange={setUuid}
            bucketName={BUCKET_NAME}
            bucketDirectory={MESSAGE_DIRECTORY}
            fileSize={100 * 1024 * 1024}
            onUploadSuccess={onUploadSuccess}
            onAttachmentsChange={onAttachmentsChange}
          />
          <TextArea
            border={false}
            rows={6}
            ref={input}
            placeholder={intl.get('sodr.workspace.view.message.pleaseEnterMessage').d('请输入留言')}
          />
        </div>
      </div>
    </Fragment>
  );
};

const C7nMessage = (props) => {
  const {
    inMenuItem,
    poHeaderId,
    messageBoardName = intl.get('sodr.workspace.view.button.messageBoard').d('留言板'),
  } = props;
  const {
    btnProps = {
      icon: 'message2',
      funcType: 'flat',
    },
  } = props;

  const handleOpen = () => {
    Modal.open({
      drawer: true,
      okFirst: true,
      className: styles['order-workspace-C7nMessage'],
      style: { width: 742 },
      title: intl.get('sodr.workspace.view.button.messageBoard').d('留言板'),
      children: <ModalContent poHeaderId={poHeaderId} />,
      okText: intl.get('hzero.common.button.send').d('发送'),
      okProps: { loading: false },
    });
  };
  if (inMenuItem) {
    return <Menu.Item onClick={handleOpen}>{messageBoardName}</Menu.Item>;
  }
  return (
    <Button onClick={handleOpen} {...btnProps}>
      {messageBoardName}
    </Button>
  );
};

export default C7nMessage;
