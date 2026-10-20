import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { TextArea, Attachment, Button, DataSet, Lov, Form, Modal, Select } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { PRIVATE_BUCKET } from '@/utils/config.js';
import noCommentSvg from '@/assets/no_comment.svg';
import ApprovalComment from '../ApprovalComment';
import styles from './index.less';

function ApprovalReply({ commentId, processInstanceId, taskId }) {
  const listRef = useRef();
  const currentEmployeeCode = useMemo(() => {
    const { additionInfo } = getCurrentUser() || {};
    const { employeeCode } = additionInfo || {};
    return employeeCode;
  }, []);

  const [state, setState] = useState({
    data: [],
    replyComment: undefined,
    replyCommentId: undefined,
  });

  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'remindEmployeeNumber',
          type: 'object',
          multiple: true,
          lovCode: 'HWFP.EMPLOYEE',
          lovPara: {
            tenantId: getCurrentOrganizationId(),
            enabledFlag: 1,
          },
        },
        {
          name: 'comment',
        },
        {
          name: 'attachmentUuid',
          type: 'attachment',
          bucketName: PRIVATE_BUCKET,
        },
      ],
    });
  }, []);

  const settingFormDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'delegateId',
        },
        {
          name: 'objectVersionNumber',
          type: 'number',
        },
        {
          name: 'commentDefaultRemindPerson',
          label: intl.get('hwfp.common.modal.commentDefaultRemindPerson').d('默认提醒的人'),
          lookupCode: 'HWFP.COMMENT_DEFAULT_REMIND',
        },
      ],
    });
  }, []);

  const setRemindApprover = useCallback(
    async (commentRemindMode) => {
      if (!formDs.current) {
        return;
      }
      const { remindEmployeeNumber } = formDs.current.get(['remindEmployeeNumber']);
      const res = await request(
        `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/quick-get-remind-employees`,
        {
          method: 'POST',
          body: {
            procInstId: Array.isArray(processInstanceId) ? processInstanceId[0] : processInstanceId,
            commentRemindMode,
          },
        }
      );
      if (getResponse(res)) {
        formDs.current.set('remindEmployeeNumber', res);
      }
    },
    [formDs]
  );

  const fetchSettingAndSetRemindApprover = useCallback(async () => {
    const res = await request(
      `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/get-default-remind`,
      {
        method: 'GET',
      }
    );
    const response = getResponse(res);
    if (response) {
      const { delegateId, commentDefaultRemindPerson, objectVersionNumber } = response;
      settingFormDs.current.set('delegateId', delegateId);
      settingFormDs.current.set('commentDefaultRemindPerson', commentDefaultRemindPerson);
      settingFormDs.current.set('objectVersionNumber', objectVersionNumber);
      if (commentDefaultRemindPerson) {
        setRemindApprover(commentDefaultRemindPerson);
      }
    }
  }, [settingFormDs]);

  useEffect(() => {
    fetchList(true);
    fetchSettingAndSetRemindApprover();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scroll(0, listRef.current.scrollHeight);
    }
  }, [state.data]);

  const fetchList = (initFlag) => {
    const params = {};
    if (Array.isArray(processInstanceId)) {
      params.procInstIdList = processInstanceId;
    } else {
      params.procInstId = processInstanceId;
    }
    const isReply = !isNil(commentId);
    request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/proc-list`, {
      method: 'POST',
      body: params,
    }).then((res) => {
      if (getResponse(res) && res && res.length) {
        const commentRecord = res;
        const data = [];
        res.forEach((r, index) => {
          const _parent = {
            ...r,
            assignee: r.assignee || r.employeeNum,
            assigneeName: r.assigneeName || r.employeeName,
          };
          data.push(_parent);
          if (r.commentRecordList && r.commentRecordList.length > 0) {
            const replyRecords = r.commentRecordList.map((item) => ({
              ...item,
              assignee: item.assignee || item.employeeNum,
              assigneeName: item.assigneeName || item.employeeName,
              _parent,
            }));
            data.push(...replyRecords);
          }
        });
        let replyComment;
        let replyCommentId;
        if (initFlag && isReply) {
          // eslint-disable-next-line prefer-destructuring
          replyComment = data.find((i) => i.id === commentId);
          if (replyComment) {
            const { assignee, assigneeName, employeeNum, employeeName, id } = replyComment;
            replyComment = {
              ...replyComment,
              assignee: assignee || employeeNum,
              assigneeName: assigneeName || employeeName,
            };
            replyCommentId = id;
          }
        }
        // 时间倒序
        data.sort((a, b) => (a.creationDate > b.creationDate ? 1 : -1));
        setState((preState) => ({
          ...preState,
          data,
          replyComment,
          replyCommentId,
        }));
      }
    });
  };

  const handleReply = useCallback(
    (commentItem) => {
      setState((preState) => ({
        ...preState,
        replyComment: state.replyComment ? undefined : commentItem,
        replyCommentId: state.replyComment ? undefined : commentItem ? commentItem.id : undefined,
      }));
      if (formDs.current) {
        formDs.current.set('remindEmployeeNumber', undefined);
      }
    },
    [state.replyComment, formDs]
  );

  const handleSend = useCallback(async () => {
    if (!formDs.current) {
      return;
    }
    const flag = await formDs.current.validate();
    if (!flag) {
      return;
    }
    const { remindEmployeeNumber, comment, attachmentUuid } = formDs.current.get([
      'remindEmployeeNumber',
      'comment',
      'attachmentUuid',
    ]);
    if (!comment) {
      notification.warning({
        message: intl.get('hwfp.common.view.message.commentRequired').d('请输入评论内容！'),
      });
      return;
    }
    if (comment.length > 3500) {
      notification.warning({
        message: intl.get('hwfp.common.view.message.commentTooLong').d('评论内容太长了！'),
      });
      return;
    }
    let employeeNumber;
    const isReply = !!state.replyComment;
    if (isReply) {
      employeeNumber = state.replyComment.assignee;
    } else {
      employeeNumber =
        remindEmployeeNumber && remindEmployeeNumber.length > 0
          ? remindEmployeeNumber.map((r) => r.employeeNum).join(',')
          : undefined;
    }
    const submitData = filterNullValueObject({
      remindEmployeeNumber: employeeNumber,
      comment,
      attachmentUuid,
      taskId,
      procInstId: Array.isArray(processInstanceId) ? processInstanceId[0] : processInstanceId,
    });
    if (isReply) {
      submitData.relId = state.replyComment ? state.replyComment.id : commentId;
    }
    const res = await request(
      `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/${
        isReply ? 'reply-comment' : 'start-comment'
      }`,
      {
        method: 'POST',
        body: submitData,
      }
    );
    if (getResponse(res)) {
      notification.success();
      fetchList();
      formDs.current.set('remindEmployeeNumber', undefined);
      formDs.current.set('comment', undefined);
      formDs.current.set('attachmentUuid', undefined);
    }
  }, [taskId, processInstanceId, commentId, formDs, state.replyComment]);

  const settingDefaultRemindApprover = () => {
    const modal = Modal.open({
      key: 'remind-approver-modal',
      drawer: true,
      style: { width: 400 },
      title: intl.get('hwfp.common.title.setting').d('设置'),
      children: (
        <div className={styles['remind-approver-modal']}>
          <Form
            labelLayout="float"
            columns={1}
            record={settingFormDs.current}
            className={styles['form-float']}
          >
            <Select name="commentDefaultRemindPerson" />
          </Form>
          <span className='comment-default-remind-person-help'>{intl.get('hwfp.common.modal.notice.commentDefaultRemindPerson').d('设置后，后续评论时将默认按此选择提醒相关人员。')}</span>
        </div>
      ),
      onOk: async () => {
        const commentDefaultRemindPerson = settingFormDs.current.get('commentDefaultRemindPerson');
        const delegateId = settingFormDs.current.get('delegateId');
        const objectVersionNumber = settingFormDs.current.get('objectVersionNumber');
        const res = await request(
          `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/set-default-remind`,
          {
            method: 'POST',
            body: {
              delegateId,
              commentDefaultRemindPerson,
              objectVersionNumber,
            },
          }
        );
        if (getResponse(res)) {
          notification.success();
          modal.close();
        }
      },
    });
  };

  const renderCommentItem = useCallback(
    (commentItem, index) => {
      const {
        id,
        assignee,
        assigneeName,
        commentRemindEmpNameList,
        comment,
        creationDate,
        endTime,
        attachmentUuid,
        commentReplyFlag,
        _parent,
      } = commentItem;
      const self = assignee === currentEmployeeCode;
      return (
        <div key={id} id={`comment-item-${id}`} className={styles['comment-item']}>
          <div
            className={classnames(styles['comment-item-name'], {
              [styles['align-left']]: !self,
              [styles['align-right']]: self,
            })}
          >
            {assigneeName || assignee}
          </div>
          <div
            className={classnames(styles['comment-item-content'], {
              [styles['left-content']]: !self,
              [styles['right-content']]: self,
            })}
          >
            <div
              className={classnames(styles['comment-item-content-arrow'], {
                [styles['arrow-left']]: !self,
                [styles['arrow-right']]: self,
              })}
            />
            <div className={styles['comment-item-content-header']}>
              {_parent
                ? intl.get('hwfp.common.view.label.reply').d('回复')
                : intl.get('hwfp.common.view.label.remind').d('提醒')}
              ：
              {commentRemindEmpNameList && commentRemindEmpNameList.length > 0
                ? commentRemindEmpNameList.map((nameItem, nameItemIndex) => (
                  <span style={{ color: '#0161D5' }}>
                      @{nameItem}
                    {nameItemIndex !== commentRemindEmpNameList.length - 1 ? '、' : null}
                  </span>
                  ))
                : null}
              {!self && commentReplyFlag === 1 && (
                <Button
                  icon={state.replyCommentId === id ? 'close' : 'message-o'}
                  funcType="link"
                  className={styles['comment-item-content-header-extra']}
                  onClick={() => handleReply(commentItem)}
                >
                  {state.replyCommentId === id
                    ? intl.get('hwfp.common.view.button.cancelReply').d('取消回复')
                    : intl.get('hwfp.common.view.button.reply').d('回复')}
                </Button>
              )}
            </div>
            <div className={styles['comment-item-content-main']}>
              <ApprovalComment data={comment} />
            </div>
            <div className={styles['comment-item-content-footer']}>
              {attachmentUuid && (
                <Attachment
                  labelLayout="float"
                  bucketName={PRIVATE_BUCKET}
                  viewMode="popup"
                  icon="attach_file"
                  className={styles['comment-item-content-attachment']}
                  value={attachmentUuid}
                  readOnly
                />
              )}
              <span className={styles['comment-item-content-date']}>
                {dateTimeRender(endTime || creationDate)}
              </span>
            </div>
          </div>
          {_parent && (
            <div
              className={classnames(styles['comment-item-footer'], {
                [styles['align-left']]: !self,
                [styles['align-right']]: self,
              })}
            >
              {_parent.assigneeName}：{_parent.comment}
            </div>
          )}
        </div>
      );
    },
    [state.replyComment, state.replyCommentId, currentEmployeeCode, handleReply]
  );

  const renderCommentList = useMemo(() => {
    if (!state.data || !state.data.length) {
      return (
        <div className={styles['empty-comment']}>
          <div className={styles['empty-comment-pic']}>
            <img src={noCommentSvg} />
          </div>
          <div className={styles['empty-comment-word']}>
            {intl.get('hwfp.common.view.message.emptyComment').d('暂无评论')}
          </div>
        </div>
      );
    }
    return state.data.map(renderCommentItem);
  }, [state.data, renderCommentItem]);

  const handleLocate = useCallback(() => {
    const el = document.querySelector(`#comment-item-${state.replyCommentId}`);
    if (el) {
      el.scrollIntoView();
    }
  }, [state.replyCommentId]);

  return (
    <div className={styles['comment-container']}>
      <div className={styles['comment-list']} ref={listRef}>
        {renderCommentList}
      </div>
      {state.replyComment ? (
        <div className={styles['comment-ref']} onClick={handleLocate}>
          {intl.get('hwfp.common.view.label.reply').d('回复')}@{state.replyComment.assigneeName}：
          {state.replyComment.comment}
          <Icon
            type="close"
            className={styles['comment-ref-close']}
            onClick={() => handleReply(undefined, undefined)}
          />
        </div>
      ) : (
        <div className={styles['comment-notifier']}>
          <span className="comment-notifier-quick-choice">
            {intl.get('hwfp.common.view.message.quickChoice.info').d('快速选择提醒的人')}
          </span>
          <div className="comment-notifier-buttons">
            <div className="comment-notifier-button-add-employee">
              <Button
                // funcType="flat"
                style={{ marginLeft: 0, marginRight: '8px' }}
                onClick={() => {
                  setRemindApprover('INITIATOR');
                }}
              >
                {intl.get('hwfp.common.button.message.processInitiator').d('流程发起人')}
              </Button>
              <Button
                // funcType="flat"
                style={{ marginLeft: 0, marginRight: '8px' }}
                onClick={() => {
                  setRemindApprover('CURRENT_WAITING_APPROVE');
                }}
              >
                {intl.get('hwfp.common.button.message.currentApprover').d('当前待审批人')}
              </Button>
              <Button
                // funcType="flat"
                style={{ marginLeft: 0, marginRight: '8px' }}
                onClick={() => {
                  setRemindApprover('ALL_PROCESS_PARTICIPANT');
                }}
              >
                {intl.get('hwfp.common.button.message.allParticipants').d('所有流程参与人')}
              </Button>
            </div>
            <div className="comment-notifier-button-setting">
              <Button funcType="flat" icon="settings" onClick={settingDefaultRemindApprover} />
            </div>
          </div>
          <Lov
            dataSet={formDs}
            name="remindEmployeeNumber"
            placeholder={intl.get('hwfp.common.view.placeholder.addReminder').d('添加提醒人')}
          />
        </div>
      )}
      <div className={styles['comment-editor']}>
        <TextArea
          dataSet={formDs}
          name="comment"
          border={false}
          placeholder={intl.get('hwfp.common.view.placeholder.commentContent').d('评论内容')}
        />
        <div className={styles['editor-btn']}>
          <Attachment
            dataSet={formDs}
            name="attachmentUuid"
            labelLayout="float"
            viewMode="popup"
            icon="attach_file"
          >
            {intl.get('hwfp.common.view.label.attachment').d('附件')}
          </Attachment>
          <Button
            funcType="flat"
            icon="send"
            style={{ marginLeft: 0, marginRight: '8px' }}
            onClick={handleSend}
          >
            {intl.get('hwfp.common.button.send').d('发送')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default formatterCollections({ code: 'hwfp.common' })(ApprovalReply);
