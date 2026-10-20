import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import classnames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { TextArea, Tooltip } from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import { queryQuickReply, saveQuickReply, deleteQuickReply } from '@/services/quickReply';
import ZoomInMap from '@/assets/zoom_in_map.svg';

import style from './index.less';

function AllScreen(props) {
  const {
    width,
    left,
    margin,
    dataSetValue,
    dataSetName,
    isShowAllScreen,
    handleSaveCommentDraft, // 保存草稿
    handleTableHeight, // 主要传值快捷回复展开或收起
    closeQuickReply, // 关闭快捷回复
    newTask: { quickReplyArr = [] },
    footerRef, // 指定移出该元素时，收起输入框
    dispatch,
  } = props;

  // 状态：编辑或完成
  const [tagStatus, setTagStatus] = useState(false);

  // 状态：下方快捷回复展开或收起
  const [openStatus, setOpenStatus] = useState(true);

  // 文本域内容
  const [replyValue, setReplyValue] = useState('');

  // 统计文本域内容中换行符个数
  const [count, setCount] = useState(0);

  const moveRef = useRef(false);

  const approveQuickReplyHeight = localStorage.getItem('ApproveQuickReplyHeight');

  const predefinedQuickReplyArr = useMemo(
    () => (quickReplyArr ? quickReplyArr.filter((i) => i.type === 'TENANT_FAST_REPLY') : []),
    [quickReplyArr]
  );

  const userQuickReplyArr = useMemo(
    () => (quickReplyArr ? quickReplyArr.filter((i) => i.type !== 'TENANT_FAST_REPLY') : []),
    [quickReplyArr]
  );

  useEffect(() => {
    const target = document.getElementById('quick-reply-input');
    // 监听粘贴事件，粘贴情况下，需要提前计算出换行数来修改maxLength
    target.addEventListener('paste', handleMaxLength);
    return () => {
      target.removeEventListener('paste', handleMaxLength);
    };
  }, []);

  // 针对直接粘贴的快捷回复，考虑粘贴内容中有换行的情况，对其进行处理
  const handleMaxLength = (event) => {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    handleDeleteNewLine(paste);
  };

  // 粘贴文本最后一个字符为换行符时，删除
  const handleDeleteNewLine = (paste) => {
    // 最后一个值为换行符时，去除换行符
    if (
      paste &&
      (paste.charAt(paste.length - 1) === '\n' || paste.charAt(paste.length - 1) === '\r')
    ) {
      const newPaste = paste.substring(0, paste.length - 1);
      handleDeleteNewLine(newPaste);
    } else {
      let num = 0;
      if (paste.replace(/\n|\r/g, '').length > 3500) {
        // 粘贴进审批意见的值大于3500时，只需统计3500以内的换行符
        // 出现换行的位置
        let index = paste.indexOf('\n');
        // 有换行符且除换行以外的字数在3500内时。index-1即换行符前的字符
        while (index !== -1 && index - 1 - num < 3501) {
          num++;
          index = paste.indexOf('\n', index + 1);
        }
      }
      setCount(num);
    }
  };

  useMemo(() => {
    const originValue = dataSetValue.current.get(dataSetName);
    const result = originValue ? originValue.match(/\n|\r/g) : [];
    setReplyValue(originValue || '');
    dispatch({
      type: 'task/updateReplyValueNew',
      payload: originValue || '',
    });
    setCount(result ? result.length : 0);
  }, []);

  // 必填校验
  const [validateResult, setValidateResult] = useState(true);
  useMemo(async () => {
    const validate = await dataSetValue.validate();
    setValidateResult(validate);
  }, []);

  // 查询已有的快捷回复
  const queryReply = useCallback(() => {
    queryQuickReply().then((res) => {
      const result = getResponse(res);
      if (result) {
        dispatch({
          type: 'task/updateQuickReplyArr',
          payload: result,
        });
      }
    });
  }, []);

  // 添加快捷回复
  const addReply = useCallback((value) => {
    if (!value) {
      return;
    }
    saveQuickReply(value).then((res) => {
      if (res) {
        queryReply();
      }
    });
  }, []);

  // 删除快捷回复
  const deleteReply = useCallback((value) => {
    deleteQuickReply(value).then((res) => {
      if (res) {
        queryReply();
      }
    });
  }, []);

  // 给审批意见的ds设置值--textarea输入
  const setFormDsValue = async (value) => {
    const result = value ? value.match(/\n|\r/g) : [];
    setReplyValue(value);
    dispatch({
      type: 'task/updateReplyValueNew',
      payload: value,
    });
    setCount(result ? result.length : 0);
    dataSetValue.current.set(dataSetName, value);
    const validate = await dataSetValue.validate();
    setValidateResult(validate);
  };

  // 审批意见长度超出时的提醒
  const handleValidationRender = () => {
    return (
      <span>
        {intl.get('hzero.common.validation.max', {
          max: 3500,
        })}
      </span>
    );
  };

  // 给审批意见的ds设置值--选中快捷回复
  const setFormDsValueFormTag = async (value) => {
    const oldValue = dataSetValue.current.get(dataSetName) || '';
    const newValue = oldValue + value;
    dataSetValue.current.set(dataSetName, newValue);
    const validate = await dataSetValue.validate();
    const result = newValue ? newValue.match(/\n|\r/g) : [];
    setValidateResult(validate);
    setReplyValue(newValue);
    dispatch({
      type: 'task/updateReplyValueNew',
      payload: newValue,
    });
    setCount(result ? result.length : 0);
    // 选中快捷回复时，保存草稿
    if (handleSaveCommentDraft) {
      handleSaveCommentDraft(newValue);
    }
  };

  // 展开收起快捷回复
  const handleOpenStatus = (value) => {
    setOpenStatus(value);
    if (handleTableHeight) {
      handleTableHeight(true, true, value);
    }
  };

  // 文本域失焦记录草稿时间
  const handleOnBlur = (value) => {
    if (handleSaveCommentDraft) {
      handleSaveCommentDraft(value);
    }
  };

  // 鼠标移出快捷回复，自动收起
  useEffect(() => {
    // 解决全屏时底部从下至上划出触发的mouseleave事件
    setTimeout(() => {
      handleMouseAction();
    }, 500);
  }, []);

  const handleMouseAction = useCallback(() => {
    const replyContent = document.getElementById('quick-reply-content');
    const replyInput = document.getElementById('quick-reply-input');
    if (replyInput) {
      let inputStatus = false;
      // 针对中文情况输入框
      replyInput.addEventListener(
        'compositionstart',
        () => {
          inputStatus = true;
        },
        false
      );
      replyInput.addEventListener(
        'compositionend',
        () => {
          inputStatus = false;
        },
        false
      );
      let handleClose = null;
      // 防止在内部点击的时候关闭全屏回复
      let isOutSide = false;
      if (closeQuickReply) {
        // 传入指定元素时，指定元素失焦才收起快捷回复。否则移出输入框就收起
        const focusElement = footerRef || replyContent;
        if (focusElement) {
          focusElement.onmouseenter = () => {
            isOutSide = false;
            if (handleClose) {
              clearTimeout(handleClose);
            }
          };
          focusElement.onmouseleave = () => {
            isOutSide = true;
            if (moveRef.current) {
              return;
            }
            if (handleClose) {
              clearTimeout(handleClose);
            }
            if (!inputStatus) {
              handleClose = setTimeout(() => {
                // closeQuickReply();
                // focusElement.onmouseleave = () => {};
                if (handleSaveCommentDraft) {
                  handleSaveCommentDraft(dataSetValue.current.get(dataSetName));
                }
              }, 600);
            }
            // 当鼠标移出后给全局注册一个点击事件用来收起全屏快捷回复
            const closeAllQuickReplyEvent = () => {
              if (!isOutSide) {
                return;
              }
              if (moveRef.current) {
                return;
              }
              closeQuickReply();
              document.removeEventListener('click', closeAllQuickReplyEvent);
            };
            document.addEventListener('click', closeAllQuickReplyEvent);
          };
        }
      }
    }
  }, []);

  const handleResize = (event) => {
    moveRef.current = true;
    const targetDom = document.getElementById('quick-reply-input');
    const currentHeight = parseInt(targetDom.style.height, 10);
    const startY = event.clientY;
    const handleMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const endY = e.clientY;
      Object.assign(targetDom.style, {
        height: `${startY - endY + currentHeight >= 300 ? 300 : startY - endY + currentHeight}px`,
      });
    };
    const handleMouseUp = (upEvent) => {
      setTimeout(() => {
        upEvent.preventDefault();
        upEvent.stopPropagation();
        moveRef.current = false;
        localStorage.setItem('ApproveQuickReplyHeight', targetDom.style.height);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }, 0);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderTag = () => {
    if (!tagStatus) {
      return quickReplyArr.map((item) => (
        <Tag
          key={item.id}
          closable={tagStatus && item.type !== 'TENANT_FAST_REPLY'}
          onClose={() => deleteReply(item.id)}
          className={style['tag-content']}
        >
          <Tooltip title={item.content}>
            <span className={style['tag-text']} onClick={() => setFormDsValueFormTag(item.content)}>
              {item.content}
            </span>
          </Tooltip>
        </Tag>
      ));
    } else {
      return (
        <>
          <div>
            <span style={{ color: '#4E5769', fontWeight: 400 }}>
              {intl.get('hzero.common.custom').d('自定义')}
            </span>
            <span style={{ marginLeft: '2px', marginRight: '8px' }}>:</span>
            {userQuickReplyArr.map((item) => (
              <Tag
                key={item.id}
                closable
                onClose={() => deleteReply(item.id)}
                className={style['tag-content']}
              >
                <Tooltip title={item.content}>
                  <span
                    className={style['tag-text']}
                    onClick={() => setFormDsValueFormTag(item.content)}
                  >
                    {item.content}
                  </span>
                </Tooltip>
              </Tag>
            ))}
          </div>
          <div>
            <span style={{ color: '#4E5769', fontWeight: 400 }}>
              {intl.get('hzero.common.predefined').d('预定义')}
            </span>
            <span style={{ marginLeft: '2px', marginRight: '8px' }}>:</span>
            {predefinedQuickReplyArr.map((item) => (
              <Tag key={item.id} className={style['tag-content']}>
                <Tooltip title={item.content}>
                  <span
                    className={style['tag-text']}
                    onClick={() => setFormDsValueFormTag(item.content)}
                  >
                    {item.content}
                  </span>
                </Tooltip>
              </Tag>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <>
      <div className={style['quick-reply-content-resizable']}>
        <div
          className="quick-reply-content-resizable-line"
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <Icon type="remove" onMouseDown={handleResize} />
        </div>
      </div>
      <div
        className={style['quick-reply-content']}
        id="quick-reply-content"
        style={{
          width,
          left,
          maxWidth: '100%',
          margin: margin || '0 0 10px 0',
          border: !validateResult ? '1px solid #d50000' : '',
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <div className={style['top-content']}>
          <div style={{ flex: '0 1 calc(100% - 24px)' }}>
            <TextArea
              id="quick-reply-input"
              style={{
                width: '100%',
                height: `${approveQuickReplyHeight || '60px'}`,
                overflow: 'auto',
              }}
              // autoFocus
              required={!validateResult}
              value={replyValue}
              valueChangeAction="input"
              onChange={setFormDsValue}
              onBlur={(e) => handleOnBlur(e.target.value)}
              maxLength={3500 + count}
              trim="none"
              validationRenderer={handleValidationRender}
            />
          </div>
          <div
            style={{ background: `url(${ZoomInMap}) no-repeat` }}
            className={style['top-content-img']}
            onClick={() => isShowAllScreen(false)}
          />
        </div>
        <div className={style['bottom-content']}>
          <div className={style['first-action']}>
            <p
              onClick={() => addReply(replyValue)}
              className={classnames({
                [style['title-quickReply-value']]: replyValue,
                [style['title-quickReply-noValue']]: !replyValue,
              })}
            >
              <Icon type="add" style={{ marginTop: '-2px' }} />
              {intl.get('hwfp.common.view.title.add.quickReply').d('新增至快捷回复')}
              <span className={style['value-count']}>
                {replyValue ? replyValue.replace(/\n|\r/g, '').length : 0}/3500
              </span>
            </p>
            {quickReplyArr.length > 0 && (
              <p onClick={() => handleOpenStatus(!openStatus)}>
                {openStatus
                  ? intl.get('hwfp.common.view.title.putAway').d('收起')
                  : intl.get('hwfp.common.view.title.unfold').d('展开')}
                <Icon
                  type={openStatus ? 'expand_less' : 'expand_more'}
                  style={{ marginTop: '-2px' }}
                />
              </p>
            )}
          </div>
          {quickReplyArr.length > 0 && openStatus && (
            <div className={style['added-reply']}>
              <div className={style['second-action']}>
                <p>{intl.get('hwfp.common.view.title.quickReply').d('快捷回复')}</p>
                <p onClick={() => setTagStatus(!tagStatus)}>
                  {!tagStatus
                    ? intl.get('hwfp.common.view.title.edit').d('编辑')
                    : intl.get('hwfp.common.view.title.carryOut').d('完成')}
                </p>
              </div>
              <div className={style['reply-tag']}>{renderTag()}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default formatterCollections({
  code: ['hwfp.common'],
})(
  connect(({ task }) => ({
    newTask: task,
  }))(AllScreen)
);
