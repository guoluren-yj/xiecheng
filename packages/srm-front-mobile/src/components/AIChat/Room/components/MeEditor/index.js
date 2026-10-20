/* eslint-disable no-param-reassign */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-lonely-if */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import { Button, Tooltip } from 'choerodon-ui/pro';
// import { Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { uploadFileApi } from '@/components/Chat/Services';
import { getResponse } from 'utils/utils';
import { getEditorRange } from '@/utils/utils';

import { isAppleDevice, getImageSize, CalculateFileSize } from '../../functions';
import { replaceHtmlTagSymbol } from '../../functions/message';
import styles from './index.less';
import Dragview from '../DragView';
// import EmojiBoard from './emojis';
import { MSG_TYPE } from '../../common/global';
import QuoteMessage from '../QuoteMessage';
import FileMessage from '../MessageWrap/FileMessage';
import ImageMessage from '../MessageWrap/ImageMessage';

function isRangeObject(variable) {
  return variable && variable.range;
}

const NodeType = {
  text: 'text',
  br: 'br',
  at: 'at',
};

export default class MeEditor extends Component {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') props.onRef(this);
    this.editFileInfoCache = {};
    this.state = {};
  }

  defaultColorCodeList = ['source-bidding'];

  editFileInfoCache = {}; // 编辑框文件/图片信息缓存 - 每次上传时清空

  lastEditRange = null;

  sendTargetRef = null;

  componentDidMount() {
    const el = this.editorRef?.current;
    if (el) {
      el.style.height = '220px';
    }
    this.setInputFocus();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props) {
    const { timeRefresh } = this.props;

    if (props.timeRefresh && timeRefresh !== props.timeRefresh) {
      this.forceUpdate();
    }
  }

  getAtSymbolPosition = container => {
    const selection = document?.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection?.getRangeAt(0);
    const rect = range && range.getBoundingClientRect ? range.getBoundingClientRect() : {};

    const containerRange = container?.range ? container?.range?.startContainer : container;

    // 获取容器的边界框
    const containerRect =
      containerRange && containerRange.getBoundingClientRect
        ? containerRange.getBoundingClientRect()
        : {};

    // 计算光标相对于容器的偏移量
    const offsetX = rect?.left - containerRect?.left;
    const offsetY = rect?.top - containerRect?.top;
    const offSetRight = rect?.right - containerRect?.right;
    const offsetBottom = rect?.bottom - containerRect?.bottom;

    return { x: offsetX, y: offsetY, right: offSetRight, bottom: offsetBottom };
  };

  transformNodeListToMentionData = nodeList => {
    let pureString = '';
    const mentionList = [];
    nodeList.forEach(item => {
      if (item.type === NodeType.text || item.type === NodeType.br) {
        pureString += item.data;
      }
      if (item.type === NodeType.at) {
        const { displayName, userNameSuffix } = item.data;
        const userName = displayName || userNameSuffix;
        mentionList.push({
          ...(item?.data ?? {}),
        });
        pureString += `@${userName}`;
      }
    });
    return { pureString, mentionList };
  };

  // 输入框文本改变时触发
  handleInput = () => {
    this.onDataChangeCallBack();
  };

  onDataChangeCallBack = () => {
    if (this.textareaRef && this.textareaRef.current) {
      const nodeList = [];
      // const childs = this.textareaRef?.current?.childNodes ?? [];
      const { childs } = this.getEditorChildren();

      if (childs.length > 0) {
        childs.forEach(element => {
          // 文本
          if (element.nodeName === '#text') {
            if (element.data && element.data.length > 0) {
              nodeList.push({
                type: NodeType.text,
                data: element.data,
              });
            }
          }

          // br换行
          if (element.nodeName === 'BR') {
            nodeList.push({
              type: NodeType.br,
              data: '\n',
            });
          }

          // button
          if (element.nodeName === 'BUTTON') {
            const personInfo = JSON.parse(element.dataset.person);
            nodeList.push({
              type: NodeType.at,
              data: personInfo,
            });
          }
        });
      }
    }
  };

  formatAllData = treeData => {
    const allCompanys = [];
    const allUsers = [];

    if (treeData?.purchase) {
      allCompanys.push({ ...treeData.purchase });
      if (treeData.purchase?.members?.length) {
        allUsers.push(...treeData.purchase?.members);
      }
    }

    if (treeData?.suppliers?.length) {
      treeData.suppliers.forEach(item => {
        allCompanys.push({ ...item });
        if (item?.members?.length) {
          allUsers.push(...item?.members);
        }
      });
    }

    return {
      allCompanys,
      allUsers,
    };
  };

  editorRef = React.createRef(null);

  textareaRef = React.createRef(null);

  imageRef = React.createRef(null);

  fileRef = React.createRef(null);

  sendRef = React.createRef(null);

  sendToolTipTimer = null;

  dragChanged = changeY => {
    const el = this.editorRef?.current;
    if (!el) {
      return;
    }
    const heightStr = el.style.height;
    let height = Number(heightStr.replace(/px/g, ''));
    height += changeY;
    // 限制可拖动范围220-320
    if (height < 220) {
      height = 220;
    } else if (height > 320) {
      height = 320;
    }
    el.style.height = `${height}px`;
  };

  focusEvent = () => {
    if (typeof this.props.onFocus === 'function') {
      this.props.onFocus();
    }
  };

  getSelectionFun = () => {
    let val = null;
    if (window.getSelection) {
      val = window.getSelection();
    } else if (document.selection) {
      val = document.selection.createRange();
    }
    return val;
  };

  // 聚焦至输入框
  setInputFocus = () => {
    const editor = this.textareaRef.current;
    const dom = document.getElementById('smbl-me-editor-textarea-container');

    if (!editor) return;
    const range = document.createRange(); // 创建一个Range对象
    const sel = this.getSelectionFun(); // 获取当前的选择

    if (isRangeObject(editor)) {
      range.selectNodeContents(dom); // 选取可编辑元素的内容
    } else {
      range.selectNodeContents(editor); // 选取可编辑元素的内容
    }
    range.collapse(false); // 折叠Range到末尾，false参数表示折叠到结束位置
    sel.removeAllRanges(); // 移除任何现有的选择
    sel.addRange(range); // 添加新的Range作为当前选择
    if (!isRangeObject(editor) && editor.focus) {
      editor.focus(); // 将焦点重新聚焦到可编辑元素
    } else {
      dom.focus();
    }
  };

  blurEvent = () => {
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur();
    }
    this.textareaRef.current = getEditorRange();
  };

  keydownEvent = e => {
    const list = [];
    if (e.keyCode === 8) {
      const content = this.getInputContent();
      if (!content) {
        this.props.onCloseQuote(e);
      }

      setTimeout(() => {
        const { childs } = this.getEditorChildren();

        if (childs && childs.length) {
          childs.forEach(element => {
            // 移除现有的所有 button
            if (element.nodeName === 'BUTTON') {
              const data = JSON.parse(element.dataset.person);
              list.push({ ...data });
            }
          });
        }
      }, 200);
    }

    if (this.isFeedLineKey(e)) {
      // \n后不可见字符不可删除
      this.appendElementToEditor('\n​', 'text');
    } else if (this.isSendMessageKey(e)) {
      this.sendAction();
      e.preventDefault();
    }
  };

  onEditorPaste = e => {
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));

    // if (!(e.clipboardData && e.clipboardData.items)) {
    //   return;
    // }
    // const items = e.clipboardData.items || [];

    // for (let i = 0; i < items.length; i++) {
    //   const data = items[i];
    //   if (data.kind === 'file') {
    //     const file = data.getAsFile();
    //     const reg = /^image\//;
    //     e.preventDefault();
    //     if (reg.test(file.type)) {
    //       this.appendFileToEditor(file, 'image');
    //     }
    //   }
    // }
  };

  sendMessage = async message => {
    return this.props.onSend({
      ...message,
    });
  };

  // 是否是换行键
  isFeedLineKey = e => {
    const otherKey = isAppleDevice() ? e.metaKey : e.ctrlKey;
    return e.keyCode === 13 && otherKey;
  };

  // 是否是发送键
  isSendMessageKey = e => {
    const otherKey = isAppleDevice() ? e.metaKey : e.ctrlKey;
    return e.keyCode === 13 && !otherKey;
  };

  // 发送事件
  sendAction = async () => {
    const { onCallbackForThinking, thinking } = this.props;
    if (thinking) return;

    const sendFlag = this.openMessageTip();
    if (!sendFlag) {
      this.sendToolTipTimer = setTimeout(() => {
        Tooltip.hide();
      }, 3000);
      return;
    }
    Tooltip.hide();

    const content = this.getInputContent();

    if (onCallbackForThinking && typeof onCallbackForThinking === 'function') {
      onCallbackForThinking(true);
    }

    this.setInputContent('');
    try {
      for (let i = 0; i < content.length; i++) {
        const item = content[i];
        if (item.msgType === MSG_TYPE.TEXT) {
          await this.sendMessage(item);
        } else {
          const url = await this.upload(item.file);
          if (item.msgType === MSG_TYPE.FILE) {
            await this.sendMessage({
              msgType: MSG_TYPE.FILE,
              fileUrl: url,
              fileName: item.fileName,
              fileSize: item.fileSize,
            });
          } else if (item.msgType === MSG_TYPE.IMAGE) {
            await this.sendMessage({
              msgType: MSG_TYPE.IMAGE,
              imageUrl: url,
              imageWidth: item.imageWidth,
              imageHeight: item.imageHeight,
            });
          }
        }
      }
    } catch (error) {
      console.warn('上传失败', error);
    }
  };

  // 打开消息提示，返回true代表无消息提示，可以发送消息
  openMessageTip = (isHover = false) => {
    clearTimeout(this.sendToolTipTimer);
    const el = this.sendRef?.current;
    const msgContent = this.getInputContent();
    let toolTipContent = '';
    if (!el) return false;

    if (!msgContent && !isHover) {
      toolTipContent = intl.get('smbl.chat.view.message.noMessageTip').d('不能发送空白消息');
    }
    if (!toolTipContent) return true;
    Tooltip.show(el.element, {
      popupClassName: styles['smbl-me-editor-send-tool-tip'],
      theme: 'light',
      title: toolTipContent,
      placement: 'topLeft',
    });
    return false;
  };

  onSendMouseEnter = () => {
    this.openMessageTip(true);
  };

  setInputContent = content => {
    if (this.textareaRef.current) {
      this.textareaRef.current.innerText = content;
    }
    const node = document?.getElementById('smbl-me-editor-textarea-container');
    if (node) {
      node.innerText = content;
    }
  };

  setInputContentByHtml = html => {
    if (this.textareaRef.current) {
      this.textareaRef.current.innerHTML = html;
    }
    const node = document?.getElementById('smbl-me-editor-textarea-container');
    if (node) {
      node.innerHTML = html;
    }
  };

  // 获取编辑框内容
  getInputContent = () => {
    // const ref = this.textareaRef?.current;
    const ref = document.getElementById('smbl-me-editor-textarea-container');
    if (!ref) return null;

    const { childs } = this.getEditorChildren();

    let content = ref.innerText; // ref.innerHTML;
    // const deleteTagInnerText = ref.innerHTML;
    // 去除 html 标签及其内容，只保留文本内容
    // let content = deleteTagInnerText.replace(/<[^>]+>(.*?)<\/[^>]+>/g, '');

    if (childs && childs.length) {
      childs.forEach(element => {
        // 移除现有的所有 button
        if (element.nodeName === 'BUTTON') {
          const data = JSON.parse(element.dataset.person);
          const nameStr = `@${data.displayName}`;
          content = content.replace(new RegExp(nameStr, 'g'), '');
        }
      });
    }

    content = content.replace(/​/g, ''); // 清空非法空格\u200b

    const list1 =
      ref && ref.getElementsByClassName
        ? ref.getElementsByClassName('smbl-me-editor-inner-file')
        : [];
    const list2 =
      ref && ref.getElementsByClassName
        ? ref.getElementsByClassName('smbl-me-editor-inner-image')
        : [];

    const fileList = [...list1, ...list2];
    fileList.sort(
      (a, b) => parseInt(a.getAttribute('date'), 10) - parseInt(b.getAttribute('date'), 10)
    );

    const messageList = [];
    fileList.forEach(item => {
      const fileInfo = this.editFileInfoCache[item.id];
      if (!fileInfo) return;
      let fileKey = item.id;
      if (fileInfo.msgType === MSG_TYPE.FILE) {
        fileKey = `${fileInfo.fileName}\n${CalculateFileSize(fileInfo.fileSize)}`;
      }

      const index = content.indexOf(fileKey);
      // 以文件开头
      if (index === 0) {
        messageList.push(fileInfo);
        content = content.slice(fileKey.length);
      } else if (index > 0) {
        const msgContent = content.slice(0, index).replace(/^\n+|\n+$/g, '');
        if (msgContent) {
          messageList.push({
            msgType: MSG_TYPE.TEXT,
            msgContent: replaceHtmlTagSymbol(msgContent),
          });
        }
        messageList.push(fileInfo);
        content = content.slice(index + fileKey.length);
      }
    });

    // 结尾的字符需要判断
    const lastMessage = content.replace(/^\n+|\n+$/g, '');
    if (lastMessage) {
      messageList.push({
        msgType: MSG_TYPE.TEXT,
        msgContent: replaceHtmlTagSymbol(lastMessage),
      });
    }
    return messageList.length ? messageList : null;
  };

  // 设置最后光标位置
  setLastEditRange = () => {
    const selection = this.getSelectionFun();
    if (!selection.rangeCount) return;
    this.lastEditRange = selection.getRangeAt(0);
  };

  selectedImage = e => {
    if (!e.target.files.length) {
      return false;
    }
    this.appendFileToEditor(e.target.files[0], 'image');
    if (this.imageRef?.current) {
      this.imageRef.current.value = null;
    }
  };

  selectedFile = e => {
    const maxsize = 20 * 1024 * 1024;
    if (e.target.files.length === 0) {
      return false;
    }
    const file = e.target.files[0];
    if (this.fileRef?.current) {
      this.fileRef.current.value = null;
    }
    this.fileRef.current.value = null;
    if (/\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name)) {
      // 强制改为图片类型消息
      this.appendFileToEditor(file, 'image');
      return;
    }

    if (file.size > maxsize) {
      notification.error({
        message: intl.get('smbl.chat.view.message.fileTooBig').d('上传文件不能大于20M'),
      });
      return;
    }
    this.appendFileToEditor(file, 'file');
  };

  isRange = value => {
    return value instanceof Range;
  };

  // 光标处添加元素 type - text、reactDom
  appendElementToEditor = (element, type) => {
    // const areaDom = this.textareaRef.current;
    const areaDom = document.getElementById('smbl-me-editor-textarea-container');
    if (!element || !areaDom) return;

    let dom = null;
    const after = document.createTextNode('\u200b');
    const frag = document.createDocumentFragment();
    const selection = this.getSelectionFun();
    let range = null;
    // 清空所有光标
    selection.removeAllRanges();

    // 判断编辑框最后一次光标位置
    if (this.lastEditRange && this.isRange(this.lastEditRange)) {
      selection.addRange(this.lastEditRange);
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (isRangeObject(areaDom)) return;
      range.selectNodeContents(areaDom);
    }

    if (type === 'reactDom') {
      // 设置外层div属性
      dom = document.createElement('div');
      dom.style.display = 'inline-block';
      dom.setAttribute('contenteditable', 'false');
      // 包裹层添加元素
      frag.appendChild(dom);
      frag.appendChild(after);
      // 光标处插入包裹层
      range.insertNode(frag);
      // 虚拟dom渲染
      ReactDOM.render(element, dom);
      range = range.cloneRange();
      range.setStart(after, 1);
    } else if (type === 'text') {
      // 选定光标是文本标签
      if (range.startContainer.nodeName === '#text') {
        const textNode = range.startContainer;
        // 获取光标位置
        const rangeStartOffset = range.startOffset;
        // 在光标位置处插入新的表情内容
        textNode.insertData(rangeStartOffset, element);
        range.setStart(textNode, rangeStartOffset + element.length);
        // 选定光标不是文本标签
      } else {
        const textNode = document.createTextNode(element);
        // 光标开始元素等于编辑框
        if (range.startContainer === areaDom) {
          range.insertNode(textNode);
          // 虚拟dom渲染
          range = range.cloneRange();
          range.setStartAfter(textNode);
        } else {
          const nextNode = range.startContainer.nextSibling;
          if (nextNode) {
            areaDom.insertBefore(textNode, nextNode);
          } else {
            areaDom.appendChild(textNode);
          }
          range.setStartAfter(textNode);
        }
      }
    }

    range.collapse(true);
    selection.removeAllRanges();
    if (range && this.isRange(range)) selection.addRange(range);
    this.lastEditRange = selection.getRangeAt(0);
  };

  // 编辑框中添加图片/文件
  appendFileToEditor = (file, type) => {
    const append = (record, Element) => {
      const _uuid = uuid();
      this.editFileInfoCache[_uuid] = record;
      const reactDom = (
        <Element
          id={_uuid}
          className={`smbl-me-editor-inner-${type}`}
          date={+new Date()}
          record={record}
        />
      );
      this.appendElementToEditor(reactDom, 'reactDom');
    };
    if (type === 'image') {
      getImageSize(file, size => {
        append(
          {
            file,
            msgType: MSG_TYPE.IMAGE,
            imageStatus: 'editing',
            imageUrl: URL.createObjectURL(file),
            imageWidth: size.width,
            imageHeight: size.height,
          },
          ImageMessage
        );
      });
    } else if (type === 'file') {
      append(
        {
          file,
          msgType: MSG_TYPE.FILE,
          fileName: file.name,
          fileSize: file.size,
        },
        FileMessage
      );
    }
  };

  upload = async file => {
    return new Promise((resolve, reject) => {
      uploadFileApi(file)
        .then(response => {
          try {
            getResponse(response ? JSON.parse(response) : response);
            reject();
          } catch (e) {
            resolve(response);
          }
        })
        .catch(() => {
          notification.error({
            message: intl.get('smbl.chat.view.message.uploadError').d('上传失败'),
          });
          reject();
        });
    });
  };

  openImageSelecter = () => {
    this.imageRef.current.click();
  };

  openFileSelecter = () => {
    this.fileRef.current.click();
  };

  onInputEmoji = emoji => {
    this.appendElementToEditor(emoji, 'text');
  };

  onSendTargetRef = ref => {
    this.sendTargetRef = ref;
  };

  getEditorChildren = () => {
    const node = document.getElementById('smbl-me-editor-textarea-container') ?? null;
    const childs = node ? node.childNodes : [];
    const editorChildNodes = [].slice.call(childs);
    return {
      rootNode: node,
      childs: editorChildNodes,
    };
  };

  openMessageRecordsBoard = () => {
    if (typeof this.props.onOpenMessageRecords === 'function') {
      this.props.onOpenMessageRecords();
    }
  };

  clearWindowMsg = () => {
    if (typeof this.props.onClearWindowMsg === 'function') {
      this.props.onClearWindowMsg();
    }
  };

  refreshMessageList = () => {
    if (typeof this.props.onRefreshMessageList === 'function') {
      this.props.onRefreshMessageList();
    }
  };

  getRightOffset = () => {
    const element = document.getElementById('smbl-me-editor-send-target_btn_trigger');
    // 获取元素的边界矩形
    const rect = element && element.getBoundingClientRect ? element.getBoundingClientRect() : {};

    // 计算元素相对于文档流右侧的距离
    const rightDistance = window.innerWidth - rect?.right + window.scrollX;
    return `${rightDistance || 0 + 20}px`;
  };

  render() {
    const { quoteMsg, onCloseQuote, onClickQuote, thinking } = this.props;

    return (
      <div
        className={styles['smbl-me-editor']}
        ref={this.editorRef}
        id="smbl-me-editor-footer-user-popover"
      >
        <form encType="multipart/form-data" style={{ display: 'none' }}>
          <input ref={this.imageRef} type="file" accept="image/*" onChange={this.selectedImage} />
          <input ref={this.fileRef} type="file" onChange={this.selectedFile} />
        </form>
        <div className={styles['smbl-me-editor-buttons']}>
          <Dragview
            direction="vertical"
            className={styles['smbl-me-editor-drag-view']}
            onChange={this.dragChanged}
          />
          <Tooltip title={intl.get('smbl.chat.view.title.messageRecords').d('消息记录')}>
            <Button
              className={styles['smbl-me-editor-btn']}
              funcType="flat"
              color="dark"
              icon="sms-o"
              onClick={this.openMessageRecordsBoard}
            />
          </Tooltip>
          <Tooltip title={intl.get('smbl.chat.view.title.clearScreen').d('清屏')}>
            <Button
              className={styles['smbl-me-editor-btn']}
              funcType="flat"
              color="dark"
              icon="cleaning_services"
              disabled={thinking}
              onClick={this.clearWindowMsg}
            />
          </Tooltip>
          <Tooltip title={intl.get('smbl.chat.view.title.refreshMsg').d('刷新')}>
            <Button
              className={styles['smbl-me-editor-btn']}
              funcType="flat"
              color="dark"
              icon="sync"
              disabled={thinking}
              onClick={this.refreshMessageList}
            />
          </Tooltip>
        </div>
        {quoteMsg && (
          <QuoteMessage
            quoteMsg={quoteMsg}
            style={{ padding: '8px 15px' }}
            onClose={onCloseQuote}
            onClick={onClickQuote}
            showClose
          />
        )}

        <div
          id="smbl-me-editor-textarea-container"
          ref={this.textareaRef}
          contentEditable
          data-placeholder={intl
            .get('smbl.chat.view.message.inputPlaceholder')
            .d('你想要聊点什么呢 ...')}
          className={styles['smbl-me-editor-textarea']}
          style={{ whiteSpace: 'break-spaces' }}
          onFocus={this.focusEvent}
          onBlur={this.blurEvent}
          onClick={this.setLastEditRange}
          onKeyUp={this.setLastEditRange}
          onKeyDown={this.keydownEvent}
          onPaste={this.onEditorPaste}
          onInput={this.handleInput}
        />

        <div className={styles['smbl-me-editor-footer']}>
          <Button
            loading={thinking}
            ref={this.sendRef}
            // color={this.defaultColorCodeList.includes(businessCode) ? 'default' : 'primary'}
            style={{ flexShrink: 0 }}
            onClick={this.sendAction}
            onMouseEnter={this.onSendMouseEnter}
            disabled={thinking}
            id="smbl-me-editor-send-target_btn_trigger"
          >
            {intl.get('smbl.chat.view.button.send').d('发送')}
          </Button>
        </div>
      </div>
    );
  }
}
