/* eslint-disable no-param-reassign */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-lonely-if */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { uploadFileApi } from '@/components/Chat/Services';
import { getResponse } from 'utils/utils';
import { getEditorRange } from '@/utils/utils';

import { isAppleDevice, getImageSize, CalculateFileSize } from '../../functions';
import { replaceHtmlTagSymbol } from '../../functions/message';
import styles from './index.less';
import Dragview from '../DragView';
import EmojiBoard from './emojis';
// import SendTarget from './sendTarget';
import PeopleTarget from './PeopleTarget';
import { MSG_TYPE } from '../../common/global';
import QuoteMessage from '../QuoteMessage';
import FileMessage from '../MessageWrap/FileMessage';
import ImageMessage from '../MessageWrap/ImageMessage';
import PeopleAlert from './PeopleAlert';

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
    this.state = {
      loading: false,
      sendTo: [],
      // sendToList: [],
      peopleTree: {},

      showSuggestions: false,
      filterContent: '',
      position: {},
      // content: '',
      // cursorPosition: 0,
      allUsers: [],
      allCompanys: [],
    };
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
    this.refreshSendToList(this.props.roomInfo);
    this.setInputFocus();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props) {
    this.refreshSendToList(props.roomInfo);
    const { timeRefresh } = this.props;

    if (props.timeRefresh && timeRefresh !== props.timeRefresh) {
      this.forceUpdate();
    }
  }

  getAtSymbolPosition = (container) => {
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

  transformNodeListToMentionData = (nodeList) => {
    let pureString = '';
    const mentionList = [];
    nodeList.forEach((item) => {
      if (item?.type === NodeType.text || item?.type === NodeType.br) {
        pureString += item.data;
      }
      if (item?.type === NodeType.at) {
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

  // @字符输入检测  是否展示选人弹窗
  checkIsShowSelectDialog = () => {
    const rangeInfo = getEditorRange();
    if (!rangeInfo || !rangeInfo.range || !rangeInfo.selection) return;
    const curNode = rangeInfo.range.endContainer;
    if (!curNode || !curNode.textContent || curNode.nodeName !== '#text') return;
    if (curNode.textContent?.endsWith(' ')) {
      const range = document.createRange();
      const dom = document.getElementById('smbl-me-editor-textarea-container');
      range.selectNodeContents(dom);
      range.collapse(false);
      rangeInfo.selection.removeAllRanges();
      rangeInfo.selection.addRange(range);
      this.textareaRef.current = getEditorRange();
      return;
    }
    const searchStr = curNode.textContent.slice(0, rangeInfo.selection.focusOffset);
    // 判断光标位置前方是否有at，只有一个at则展示默认dialog，除了at还有关键字则展示searchDialog
    const keywords = /@([^@]*)$/.exec(searchStr);
    if (keywords && keywords.length >= 2) {
      // 展示搜索选人
      const keyWord = keywords[1];

      // 搜索关键字不超过20个字符
      if (keyWord && keyWord.length > 20) {
        this.setState({
          showSuggestions: false,
          filterContent: '',
        });
        return;
      }

      this.setState({
        showSuggestions: true,
        filterContent: keyWord,
      });
      // 记下弹窗前光标位置range
      this.textareaRef.current = rangeInfo;
    } else {
      // 关掉选人
      this.setState({
        showSuggestions: false,
      });
    }
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
        childs.forEach((element) => {
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

      const position = this.getAtSymbolPosition(this.textareaRef.current);
      this.setState({
        position,
      });

      // const { mentionList } = this.transformNodeListToMentionData(nodeList);
      // this.setState({
      //   sendTo: mentionList,
      // });
    }
  };

  refreshSendToList = (roomInfo) => {
    if (!roomInfo) return;

    const obj = { ...roomInfo };
    if (obj?.suppliers?.length) {
      obj.suppliers.forEach((item) => {
        item.atName = item.displayName;
        item.treeName = item.displayName;
        item.hitType = 'TENANT';
        item.belongType = 'supplier';

        if (item?.members?.length) {
          item.members.forEach((e) => {
            e.atName = `${item.displayName}_${e.displayName}`;
            e.treeName = e.displayName;
            e.hitType = 'USER';
            e.belongType = 'supplier';
          });
        }
      });
    }

    if (obj?.purchase) {
      obj.purchase.atName = obj.purchase.displayName;
      obj.purchase.hitType = 'TENANT';
      obj.purchase.treeName = obj.purchase.displayName;
      obj.purchase.belongType = 'purchase';

      if (obj.purchase.members?.length) {
        obj.purchase.members.forEach((item2) => {
          item2.atName = `${obj.purchase.displayName}_${item2.displayName}`;
          item2.hitType = 'USER';
          item2.treeName = item2.displayName;
          item2.belongType = 'purchase';
        });
      }
    }
    // 提取用户列表所有
    const { allUsers, allCompanys } = this.formatAllData(obj);
    this.setState({
      peopleTree: obj,
      allUsers,
      allCompanys,
    });
  };

  formatAllData = (treeData) => {
    const allCompanys = [];
    const allUsers = [];

    if (treeData?.purchase) {
      allCompanys.push({ ...treeData.purchase });
      if (treeData.purchase?.members?.length) {
        allUsers.push(...treeData.purchase?.members);
      }
    }

    if (treeData?.suppliers?.length) {
      treeData.suppliers.forEach((item) => {
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

  dragChanged = (changeY) => {
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
    // 聚焦时是否展示选人弹窗
    this.checkIsShowSelectDialog();
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
    setTimeout(() => {
      this.setState({
        showSuggestions: false,
        filterContent: '',
      });
    }, 500);
  };

  keydownEvent = (e) => {
    const list = [];

    if (e.keyCode === 8) {
      // this.editorDelete(e);

      const content = this.getInputContent();
      if (!content) {
        this.props.onCloseQuote(e);
      }

      setTimeout(() => {
        const { childs } = this.getEditorChildren();

        if (childs && childs.length) {
          childs.forEach((element) => {
            // 移除现有的所有 button
            if (element.nodeName === 'BUTTON') {
              const data = JSON.parse(element.dataset.person);
              list.push({ ...data });
            }
          });
        }

        this.setState({
          sendTo: list,
        });
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

  onEditorPaste = (e) => {
    if (!(e.clipboardData && e.clipboardData.items)) {
      return;
    }
    const items = e.clipboardData.items || [];

    for (let i = 0; i < items.length; i++) {
      const data = items[i];
      if (data.kind === 'file') {
        const file = data.getAsFile();
        const reg = /^image\//;
        e.preventDefault();
        if (file?.type && reg.test(file.type)) {
          this.appendFileToEditor(file, 'image');
        }
      }
    }
  };

  sendMessage = async (message) => {
    return this.props.onSend({
      ...message,
      ...this.getSendTarget(),
    });
  };

  // 是否是换行键
  isFeedLineKey = (e) => {
    const otherKey = isAppleDevice() ? e.metaKey : e.ctrlKey;
    return e.keyCode === 13 && otherKey;
  };

  // 是否是发送键
  isSendMessageKey = (e) => {
    const otherKey = isAppleDevice() ? e.metaKey : e.ctrlKey;
    return e.keyCode === 13 && !otherKey;
  };

  // 发送事件
  sendAction = async () => {
    // const { content } = this.state;
    if (this.state?.loading) return;

    const { hitTypes = [] } = this.getSendTarget();
    // 验证 hitTypes 数组内字符串的一致性
    if (hitTypes.length > 1) {
      const firstType = hitTypes[0];
      const hasInconsistentTypes = hitTypes.some((type) => type !== firstType);
      if (hasInconsistentTypes) {
        notification.error({
          message: intl
            .get('smbl.chat.view.message.cannotatUserAndTenant')
            .d('不可同时@用户与公司'),
        });
        return;
      }
    }

    const sendFlag = this.openMessageTip();
    if (!sendFlag) {
      this.sendToolTipTimer = setTimeout(() => {
        Tooltip.hide();
      }, 3000);
      return;
    }
    Tooltip.hide();

    const content = this.getInputContent();

    this.setState({ loading: true });

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
      this.setState({ sendTo: [] });
    } catch (error) {
      console.warn('上传失败', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  // 打开消息提示，返回true代表无消息提示，可以发送消息
  openMessageTip = (isHover = false) => {
    clearTimeout(this.sendToolTipTimer);
    const { roomInfo } = this.props;
    const el = this.sendRef?.current;
    const msgContent = this.getInputContent();
    let toolTipContent = '';
    if (!el) return false;
    // 禁言状态
    if (!roomInfo.muteState && !roomInfo.purchaseFlag) {
      toolTipContent = intl.get('smbl.chat.view.message.shutupTip').d('采购方已开启禁言');
    } else if (!msgContent && !isHover) {
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

  setInputContent = (content) => {
    if (this.textareaRef.current) {
      this.textareaRef.current.innerText = content;
    }
    const node = document?.getElementById('smbl-me-editor-textarea-container');
    if (node) {
      node.innerText = content;
    }
  };

  setInputContentByHtml = (html) => {
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
      childs.forEach((element) => {
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
    fileList.forEach((item) => {
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
  setLastEditRange = (e) => {
    const selection = this.getSelectionFun();
    if (!selection.rangeCount) return;
    this.lastEditRange = selection.getRangeAt(0);

    // 输入了@，直接弹选人浮层
    if (e.keyCode === 50 && e.shiftKey) {
      this.setState({
        showSuggestions: true,
      });
    } else {
      // 这里是输入的不是@，但是可能前方有@，因此需要进行检测看看是否要展示选人浮层
      this.checkIsShowSelectDialog();
    }
  };

  selectedImage = (e) => {
    if (!e.target.files.length) {
      return false;
    }
    this.appendFileToEditor(e.target.files[0], 'image');
    if (this.imageRef?.current) {
      this.imageRef.current.value = null;
    }
  };

  selectedFile = (e) => {
    const maxsize = 100 * 1024 * 1024;
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
        message: intl.get('smbl.chat.view.message.fileTooBig').d('上传文件不能大于100M'),
      });
      return;
    }
    this.appendFileToEditor(file, 'file');
  };

  isRange = (value) => {
    return value instanceof Range;
  };

  // 编辑框删除
  editorDelete = (e) => {
    const areaDom = this.textareaRef.current;
    if (!areaDom) return;

    const selection = this.getSelectionFun();
    if (!selection.isCollapsed) return;

    selection.removeAllRanges();
    const rangeDef = document.createRange(); // 创建一个Range对象
    const rangeVal = this.isRange(this.lastEditRange) ? this.lastEditRange : rangeDef;
    selection.addRange(rangeVal);
    const range = selection.getRangeAt(0);
    const startContainer = range?.startContainer;
    const startOffset = range?.startOffset;

    // 只对文本标签做处理
    if (range.startContainer.nodeName === '#text') {
      const content = startContainer?.textContent;
      // 当前光标处字符内容
      const cursorContent = content?.substring(startOffset - 1, startOffset);

      let offset = null;
      if (cursorContent === '​') offset = 1;
      if (cursorContent === '') offset = 0;

      if (offset !== null) {
        const previousSibling = startContainer?.previousSibling;

        // 上一个元素是dom，直接删除，
        if (
          ((previousSibling && previousSibling.nodeName === 'DIV') ||
            previousSibling.nodeName === 'BUTTON') &&
          startOffset === offset
        ) {
          previousSibling?.remove();
        } else {
          // 删除两个字符
          range.setStart(startContainer, startOffset - 2 >= 0 ? startOffset - 2 : 0);
          range.deleteContents();
          e.preventDefault();
        }
      }

      selection.removeAllRanges();
      if (range && this.isRange(range)) selection.addRange(range);
    }

    this.onDataChangeCallBack();
    this.lastEditRange = selection.getRangeAt(0);
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
      getImageSize(file, (size) => {
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

  upload = async (file) => {
    return new Promise((resolve, reject) => {
      uploadFileApi(file)
        .then((response) => {
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

  onInputEmoji = (emoji) => {
    this.appendElementToEditor(emoji, 'text');
  };

  onSendTargetRef = (ref) => {
    this.sendTargetRef = ref;
  };

  onPeopleTargetChanged = (selected) => {
    const ref = document.getElementById('smbl-me-editor-textarea-container') ?? null;
    const childs = ref ? ref?.childNodes : [];
    const childNodes = [].slice.call(childs);
    const cacheMap = {};
    const createBtns = [];
    const myEditorRange = this.textareaRef.current?.range;
    childNodes.forEach((element) => {
      if (element.nodeName === 'BUTTON') {
        const personInfo = JSON.parse(element.dataset.person);
        const removeFlag = !selected.find((select) => personInfo.id === select.id);
        cacheMap[personInfo.id] = true;
        if (removeFlag) {
          ref.removeChild(element);
        }
      }
    });
    selected.forEach((select) => {
      if (cacheMap[select.id]) return;
      const { displayName, userNameSuffix } = select;
      const btn = document.createElement('button');
      btn.dataset.person = JSON.stringify(select);
      btn.textContent = `@${displayName || userNameSuffix} `;
      btn.setAttribute(
        'style',
        'color:#4387f4;border:none;background:transparent;padding:0;font-size:inherit'
      );

      btn.contentEditable = 'false';
      btn.addEventListener(
        'click',
        () => {
          return false;
        },
        false
      );
      btn.tabindex = '0';
      createBtns.push(btn);
    });
    if (createBtns && myEditorRange) {
      const textNode = myEditorRange.endContainer; // 拿到末尾文本节点
      const { endOffset } = myEditorRange; // 光标位置

      myEditorRange.setEnd(textNode, endOffset);
      myEditorRange.deleteContents(); // 删除草稿end
      const bSpaceNode = document.createTextNode('\u00A0'); // 插入空格字符 \u00A0  \u200b
      this.insertHtmlAtCaret(
        [createBtns, bSpaceNode],
        this.textareaRef.current?.selection,
        this.textareaRef.current?.range
      );
    }
    this.setState({ sendTo: selected });
  };

  // 引用供应商消息后添加供应商公司at
  handleQuoteMsg = (record) => {
    const { allCompanys } = this.state;
    const { companyId } = record;
    const companyItem = allCompanys.find((company) => company.companyId === companyId);
    this.setInputFocus();
    if (companyItem && companyItem.belongType === 'supplier') {
      this.handleListAt(companyItem);
      this.handleAtPeople(companyItem);
    }
  };

  handleListAt = (obj) => {
    const { sendTo } = this.state;
    const { userId = '', userNameSuffix = '', displayName = '' } = obj || {};

    const list = sendTo && sendTo.length ? [...sendTo] : [];
    if (list.length) {
      let inCludes = false;
      list.forEach((item) => {
        if (userId && item.userId === userId) {
          // 已存在当前用户， 不操作
          inCludes = true;
        }
      });

      if (!inCludes) {
        list.push({ ...obj });
      }
    } else {
      list.push({ ...obj });
    }

    const ref = this.textareaRef.current;
    if (!ref) return null;

    const myEditorRange = ref.range;
    if (!myEditorRange) return;

    const textNode = myEditorRange.endContainer; // 拿到末尾文本节点
    const { endOffset } = myEditorRange; // 光标位置

    myEditorRange.setEnd(textNode, endOffset);
    myEditorRange.deleteContents(); // 删除草稿end

    const btn = document.createElement('button');

    btn.dataset.person = JSON.stringify(obj);
    btn.textContent = `@${displayName || userNameSuffix} `;
    btn.setAttribute(
      'style',
      'color:#4387f4;border:none;background:transparent;padding:0;font-size:inherit'
    );

    btn.contentEditable = 'false';
    btn.addEventListener(
      'click',
      () => {
        return false;
      },
      false
    );
    btn.tabindex = '0';
    const bSpaceNode = document.createTextNode('\u00A0'); // 插入空格字符 \u00A0  \u200b
    this.insertHtmlAtCaret(
      [[btn], bSpaceNode],
      this.textareaRef.current?.selection,
      this.textareaRef.current?.range
    );

    this.setState({
      sendTo: list,
      showSuggestions: false,
    });
  };

  handleAtPeople = (personItem = {}) => {
    // 选择人员后关闭并重置选人框，重置搜索词
    this.setState({
      showSuggestions: false,
    });

    const { hitType = '' } = personItem;
    if (hitType === 'ALL') {
      // 选择所有人，清空 sendTo list， 只保留
      const atList = [];

      this.setState(
        {
          sendTo: atList,
        },
        () => {
          // 清除子节点所有 @标签，添加新的 @所有人 标签
          this.handleAtAll(personItem);
        }
      );
    } else if (hitType === 'USER') {
      // 选择的是用户
      // todo 判断当前用户所在的公司 人员是否已经全部被选中，是：去除公司下的所有 @人员 标签，添加 @公司 标签；否：添加 @人员 标签
      this.handleAtSinglePeople(personItem);
    } else {
      this.handleAtCompany(personItem);
    }
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

  /**
   * 搜索框选择 @所有人 , 清除子节点所有 @标签，添加新的 @所有人 标签
   */
  handleAtAll = (dataItem = {}) => {
    const { rootNode, childs } = this.getEditorChildren();

    if (childs && childs.length) {
      childs.forEach((element) => {
        // 移除现有的所有 button
        if (element.nodeName === 'BUTTON' && rootNode) {
          rootNode.removeChild(element);
        }
      });
    }

    // 添加新的 button
    this.handleAddAtTag(dataItem);
  };

  /**
   * 选择公司，移除公司下所有人员，添加公司标签
   * @param {*} dataItem
   */
  handleAtCompany = (dataItem = {}) => {
    const { sendTo = [] } = this.state;
    const sendList = [...sendTo];

    if (!(dataItem && dataItem.companyId)) return;

    if (sendList.length) {
      const isInclude = sendList.filter(
        (item) => item.companyId === dataItem.companyId && item.hitType === 'TENANT'
      );
      if (!(isInclude && isInclude.length)) {
        // 没有选择当前公司
        const { rootNode, childs } = this.getEditorChildren();

        // 移除 所有人 标签
        const allTagIndex = sendList.findIndex((item) => item.hitType === 'ALL');
        if (allTagIndex >= 0) {
          sendList.splice(allTagIndex, 1);

          // 删除 dom 节点
          if (childs && childs.length) {
            childs.forEach((element) => {
              // 移除现有的所有 button
              if (rootNode && element.nodeName === 'BUTTON') {
                const data = JSON.parse(element.dataset.person);
                if (data.hitType === 'ALL') {
                  rootNode.removeChild(element);
                }
              }
            });
          }
        } else {
          // 移除公司下的所有人员标签，添加当前公司标签
          sendList.forEach((item, index) => {
            if (item.companyId === dataItem.companyId && item.hitType === 'USER') {
              // 移除当前公司下的用户
              sendList.splice(index, 1);
            }
          });
          sendList.push(dataItem); // 添加当前公司

          childs.forEach((element) => {
            // 移除现有的所有 button
            if (rootNode && element.nodeName === 'BUTTON') {
              const data = JSON.parse(element.dataset.person);

              if (data.hitType === 'USER' && data.companyId === dataItem.companyId) {
                rootNode.removeChild(element);
              }
            }
          });

          this.handleAddAtTag(dataItem); // 添加公司标签
        }
      }
    } else {
      sendList.push(dataItem); // 添加当前公司
      this.handleAddAtTag(dataItem); // 添加公司标签
    }

    this.setState({ sendTo: sendList });
  };

  /**
   * 判断当前用户所在的公司 人员是否已经全部被选中，是：去除公司下的所有 @人员 标签，添加 @公司 标签；否：添加 @人员 标签
   * @param {object} dataItem
   */
  handleAtSinglePeople = (dataItem = {}) => {
    const { sendTo = [], allCompanys } = this.state;
    const { companyId, userId } = dataItem;

    const sendList = [...sendTo];

    if (!sendList.length) {
      const userTags = [
        {
          ...dataItem,
        },
      ];

      const { rootNode, childs } = this.getEditorChildren();

      if (childs && childs.length) {
        childs.forEach((element) => {
          // 移除现有的所有 button
          if (element.nodeName === 'BUTTON' && rootNode) {
            const data = JSON.parse(element.dataset.person);
            if (data.hitType === 'ALL') {
              rootNode.removeChild(element);
            }
          }
        });
      }

      // 判断是否已经选择公司下所有的人
      const isSelectCompanyAllPeople = this.checkIsSelectAllCompanyPeople(companyId, userTags);
      if (isSelectCompanyAllPeople) {
        const parentCompany = allCompanys.length
          ? allCompanys.filter((comp) => comp.companyId === dataItem.companyId)
          : [];
        if (parentCompany.length) {
          const obj = { ...parentCompany[0] };
          sendList.push(obj);
          this.handleAddAtTag(obj);
        }
      } else {
        sendList.push(dataItem);
        this.handleAddAtTag(dataItem);
      }
    } else {
      const { rootNode, childs } = this.getEditorChildren();

      // 1、首先去除 @所有人 的标签
      const allTagIndex = sendList.findIndex((item) => item.hitType === 'ALL');
      if (allTagIndex >= 0) {
        sendList.splice(allTagIndex, 1);

        // 删除 dom 节点
        if (childs && childs.length) {
          childs.forEach((element) => {
            // 移除现有的所有 button
            if (rootNode && element.nodeName === 'BUTTON') {
              const data = JSON.parse(element.dataset.person);
              if (data.hitType === 'ALL') {
                rootNode.removeChild(element);
              }
            }
          });
        }
      } else {
        // 2、没有所有人标签
        // 判断是否存在 @公司 (TENANT) 标签，有不处理，(@弹窗如增加已选人过滤逻辑，此处不需要重复加)
        const companyList = sendList.filter((item) => item.hitType === 'TENANT'); // 公司的标签
        const index = companyList.findIndex((item) => item.companyId === companyId);

        const userList = sendList.filter((item) => item.hitType === 'USER'); // 人员的标签
        const userIndex = userList.findIndex((item) => item.userId === userId);

        if (index === -1 && userIndex === -1) {
          // 不存在当前公司 且不存在当前人

          const userTags = [
            {
              ...dataItem,
            },
          ];
          // 获取所有人员标签
          if (childs && childs.length) {
            childs.forEach((element) => {
              // 移除现有的所有 button
              if (rootNode && element.nodeName === 'BUTTON') {
                const data = JSON.parse(element.dataset.person);
                if (data.hitType === 'USER') {
                  userTags.push(data);
                }
              }
            });
          }

          // 判断是否已经选择公司下所有的人
          const isSelectCompanyAllPeople = this.checkIsSelectAllCompanyPeople(companyId, userTags);

          if (isSelectCompanyAllPeople) {
            // 已选择所有人 去除所有人标签，添加公司标签
            childs.forEach((element) => {
              // 移除现有的所有 button
              if (rootNode && element.nodeName === 'BUTTON') {
                const data = JSON.parse(element.dataset.person);

                if (data.hitType === 'USER' && data.companyId === companyId) {
                  rootNode.removeChild(element);
                  sendList.forEach((user, keyIndex) => {
                    if (user.companyId === companyId) {
                      sendList.splice(keyIndex, 1);
                    }
                  });
                }
              }
            });

            const parentCompany = allCompanys.length
              ? allCompanys.filter((comp) => comp.companyId === dataItem.companyId)
              : [];
            if (parentCompany.length) {
              const obj = { ...parentCompany[0] };
              sendList.push(obj);
              this.handleAddAtTag(obj);
            }
          } else {
            sendList.push(dataItem);
            this.handleAddAtTag(dataItem);
          }
        }
      }
    }

    this.setState({ sendTo: sendList });
  };

  checkIsSelectAllCompanyPeople = (companyId = '', userList = []) => {
    const { allUsers } = this.state;

    // 获取公司下的所有人
    const basicUsers =
      allUsers.length && companyId ? allUsers.filter((item) => item.companyId === companyId) : [];
    const companyList = userList.filter((item) => item.companyId === companyId);
    return companyList.length === basicUsers.length;
  };

  /**
   * 添加@标签 按钮
   * @param {*} dataItem
   * @returns
   */
  handleAddAtTag = (dataItem = {}) => {
    const editor = this.textareaRef.current;
    const { userNameSuffix = '', displayName = '' } = dataItem || {};

    if (editor) {
      const myEditorRange = this.textareaRef?.current?.range;
      if (!myEditorRange) return;
      const textNode = myEditorRange.endContainer; // 拿到末尾文本节点
      const { endOffset } = myEditorRange; // 光标位置
      // 找出光标前的@符号位置
      const textNodeValue = textNode.nodeValue;
      const expRes = /@([^@]*)$/.exec(textNodeValue);

      if (expRes && expRes.length > 1) {
        myEditorRange.setStart(textNode, expRes.index);
        myEditorRange.setEnd(textNode, endOffset);
        myEditorRange.deleteContents(); // 删除草稿end

        const btn = document.createElement('button');
        btn.dataset.person = JSON.stringify(dataItem);
        btn.textContent = `@${displayName || userNameSuffix} `;
        btn.setAttribute(
          'style',
          'color:#4387f4;border:none;background:transparent;padding:0;font-size:inherit'
        );

        btn.contentEditable = 'false';
        btn.addEventListener(
          'click',
          () => {
            return false;
          },
          false
        );
        btn.tabindex = '0';
        const bSpaceNode = document.createTextNode('\u00A0'); // 不可见字符，为了放光标方便
        this.insertHtmlAtCaret(
          [[btn], bSpaceNode],
          this.textareaRef.current?.selection,
          this.textareaRef.current?.range
        );
      }

      this.onDataChangeCallBack();
    }
  };

  // 选择人员后插入@人员样式
  insertHtmlAtCaret = ([btnList, bSpaceNode], selection, range) => {
    if (selection.getRangeAt && selection.rangeCount) {
      if (selection.focusNode.parentNode.nodeName === 'BUTTON') return;
      range.deleteContents();

      const el = document.createElement('div');
      el.style.display = 'inline-block';
      el.setAttribute('contenteditable', 'false');
      if (btnList) {
        btnList.forEach((btn) => {
          el.appendChild(btn);
          // if (bSpaceNode) {
          //   el.appendChild(bSpaceNode);
          // }
        });
      }
      if (bSpaceNode) {
        // el.appendChild(bSpaceNode);
      }

      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }

      const newRange = range?.cloneRange();
      newRange.insertNode(frag);
      if (lastNode) {
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.lastEditRange = selection.getRangeAt(0);
      }
    }
  };

  getSendTarget = () => {
    const { roomInfo } = this.props;
    if (!roomInfo.purchaseFlag) {
      return {};
    }
    const { sendTo } = this.state;
    if (!sendTo || !sendTo.length) {
      return {
        hitType: 'ALL',
      };
    }

    const names = sendTo.map((e) => e.atName).filter((e) => !!e);
    const hitTypes = sendTo.map((e) => e.hitType).filter((e) => !!e);
    return {
      hitType: sendTo[0].hitType,
      receivers: sendTo.map((e) => e.id).filter((e) => !!e),
      receiverNames: names,
      hitTypes,
    };
  };

  openMessageRecordsBoard = () => {
    if (typeof this.props.onOpenMessageRecords === 'function') {
      this.props.onOpenMessageRecords();
    }
  };

  handleLoadMessage = () => {
    if (typeof this.props.onLoadMessage === 'function') {
      this.props.onLoadMessage();
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
    const { loading, sendTo, peopleTree, showSuggestions, filterContent, position } = this.state; // sendToList
    const { roomInfo, quoteMsg, businessCode, onCloseQuote, onClickQuote, onMute } = this.props;
    const isForbiddenPrivateChat = roomInfo.state === 'FORBIDDEN_PRIVATE_MESSAGE';

    const sendToNames = sendTo.map((e) => e.treeName).join(',');
    const emojiContent = <EmojiBoard onSelect={this.onInputEmoji} />;
    const sendTargetColor = isForbiddenPrivateChat ? '#aaa' : '#000';

    const tagList = sendTo.length ? sendTo.filter((item) => item.userId !== 'all') : [];

    return (
      <div
        className={styles['smbl-me-editor']}
        ref={this.editorRef}
        id="smbl-me-editor-footer-user-popover"
      >
        {isForbiddenPrivateChat && roomInfo.purchaseFlag && (
          <div className={styles['smbl-me-editor-forbidden']}>
            {intl.get('smbl.chat.view.message.editorHelp').d('仅可对所有人发送消息')}
          </div>
        )}
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
          <Popover
            content={emojiContent}
            trigger="hover"
            overlayClassName={styles['smbl-me-editor-emoji-popover']}
          >
            <Button
              className={styles['smbl-me-editor-btn']}
              funcType="flat"
              color="dark"
              icon="sentiment_satisfied"
            />
          </Popover>
          <Button
            className={styles['smbl-me-editor-btn']}
            funcType="flat"
            color="dark"
            icon="image_search"
            onClick={this.openImageSelecter}
          />
          <Button
            className={styles['smbl-me-editor-btn']}
            funcType="flat"
            color="dark"
            icon="folder-o"
            onClick={this.openFileSelecter}
          />
          <Button
            className={styles['smbl-me-editor-btn']}
            funcType="flat"
            color="dark"
            icon="sms-o"
            onClick={this.openMessageRecordsBoard}
          />
          {roomInfo.purchaseFlag && (
            <Button
              className={styles['smbl-me-editor-btn']}
              funcType="flat"
              color="dark"
              onClick={onMute}
              icon={roomInfo.muteState ? 'volume_up-o' : 'volume_off-o'}
            />
          )}
          {[0, '0'].includes(roomInfo.messageSyncFlag) ? (
            <Tooltip title={intl.get('smbl.chat.view.message.loadBeforeMsg').d('加载入群前消息')}>
              <Button
                className={styles['smbl-me-editor-btn']}
                funcType="flat"
                color="dark"
                icon="refresh"
                onClick={this.handleLoadMessage}
              />
            </Tooltip>
          ) : null}
        </div>
        {quoteMsg && (
          <QuoteMessage
            quoteMsg={quoteMsg}
            style={{ padding: '8px 15px' }}
            roomInfo={roomInfo}
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
          onMouseUp={this.checkIsShowSelectDialog}
        />

        {showSuggestions &&
          roomInfo &&
          roomInfo.purchaseFlag &&
          (roomInfo.purchase || roomInfo.suppliers) && (
            <PeopleAlert
              position={position}
              peopleTree={peopleTree}
              filterContent={filterContent}
              defaultSelect={sendTo}
              onSelect={this.handleAtPeople}
            />
          )}

        <div className={styles['smbl-me-editor-footer']}>
          {roomInfo && roomInfo.purchaseFlag && (roomInfo.purchase || roomInfo.suppliers) && (
            <Popover
              placement="topRight"
              content={
                <PeopleTarget
                  peopleTree={peopleTree}
                  selected={sendTo}
                  onRef={this.onSendTargetRef}
                  onSelect={this.onPeopleTargetChanged}
                />
              }
              overlayClassName={styles['smbl-me-editor-send-target-popover']}
              overlayStyle={{ right: this.getRightOffset() }}
              {...(isForbiddenPrivateChat && { visible: false })}
            >
              <div
                className={styles['smbl-me-editor-send-target']}
                style={{ cursor: isForbiddenPrivateChat ? 'not-allowed' : 'pointer' }}
              >
                <span style={{ fontSize: '12px', marginRight: '4px', color: '#333' }}>
                  {intl.get('smbl.chat.view.button.snedTo').d('发送给')}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: sendTargetColor }}>
                  {sendToNames || intl.get('smbl.chat.model.sendTo.allUser').d('所有人')}
                </span>
                {tagList?.length ? (
                  <span style={{ marginLeft: '4px' }}>+{tagList.length}</span>
                ) : null}
                <Icon
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: sendTargetColor,
                    marginRight: '20px',
                  }}
                  type="keyboard_arrow_down"
                />
              </div>
            </Popover>
          )}
          <Button
            loading={loading}
            ref={this.sendRef}
            color={this.defaultColorCodeList.includes(businessCode) ? 'default' : 'primary'}
            style={{ flexShrink: 0 }}
            onClick={this.sendAction}
            disabled={!roomInfo.muteState && !roomInfo.purchaseFlag}
            onMouseEnter={this.onSendMouseEnter}
            id="smbl-me-editor-send-target_btn_trigger"
          >
            {intl.get('smbl.chat.view.button.send').d('发送')}
          </Button>
        </div>
      </div>
    );
  }
}
