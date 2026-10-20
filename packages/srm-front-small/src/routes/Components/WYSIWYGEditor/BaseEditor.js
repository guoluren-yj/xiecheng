import React, { Component } from 'react';
import { Button, Icon } from 'choerodon-ui';
import { isEqual } from 'lodash';
import ReactQuill, { Quill } from 'react-quill';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import 'react-quill/dist/quill.snow.css';
import notification from 'utils/notification';
import LightBox from 'react-image-lightbox';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { randomWord } from '@/utils/random';
import Link from './Link';
import './BaseEditor.less';

/**
 * randomWord 产生任意长度随机字母数字组合
 * @param randomFlag 是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 * @param min
 * @param max
 * @returns {string}
 */
function randomWord(randomFlag, min, max) {
  let str = '';
  let range = min;
  const arr = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (let i = 0; i < range; i += 1) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);

Quill.register('formats/link', Link);

const defaultStyle = {
  width: 498,
  height: 200,
};
const defaultProps = {
  mode: 'edit',
};

const ToolBar = ({ id, onFullScreenClick, hideFullScreen }) => (
  <div id={id || 'toolbar'}>
    <button type="button" className="ql-bold" />
    <button type="button" className="ql-italic" />
    <button type="button" className="ql-underline" />
    <button type="button" className="ql-strike" />
    <button type="button" className="ql-blockquote" />
    <button type="button" className="ql-list" value="ordered" />
    <button type="button" className="ql-list" value="bullet" />
    <button type="button" className="ql-image" />
    <button type="button" className="ql-link" />
    <select className="ql-color">
      {/* <option value="red" />
      <option value="green" />
      <option value="blue" />
      <option value="orange" />
      <option value="violet" />
      <option value="#d0d1d2" />
      <option selected /> */}
    </select>

    {!hideFullScreen && (
      <button
        type="button"
        className="ql-fullScreen"
        style={{ outline: 'none' }}
        onClick={onFullScreenClick}
      >
        <Icon type="zoom_out_map" style={{ marginTop: -5 }} />
      </button>
    )}
  </div>
);
@formatterCollections({
  code: ['small.common', 'small.baseEditor'],
})
class BaseEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgOpen: false,
      src: '',
      value: props.value || '',
    };
    this.value = props.value || '';
    this.toolBarId = randomWord(false, 32);
    this.modules = {
      toolbar: {
        container: `#${this.toolBarId}`,
        handlers: {
          // handlers object will be merged with default handlers object
          image() {
            notification.warning({
              message: intl
                .get('small.baseEditor.not.supprt.upload.img')
                .d('底部备案号不支持上传图片'),
            });
          },
          size() {
            notification.warning({ message: 'size' });
          },
        },
      },
      imageDropAndPaste: true,
      // imageDrop: true,
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus && this.editor) {
      setTimeout(() => {
        this.editor.focus();
      });
    }
    document.addEventListener('click', this.handleOpenLightBox);
  }

  // 在这里将值更新为新的值
  componentDidUpdate() {
    const { value } = this.props;
    if ('value' in this.props && !isEqual(this.value, value)) {
      this.editor.getEditor().setContents(value);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOpenLightBox);
  }

  setValue = (value) => {
    // setContents会自动触发onChange
    this.editor.getEditor().setContents(value);
  };

  handleOpenLightBox = (e) => {
    e.stopPropagation();
    if (e.target.nodeName === 'IMG') {
      e.stopPropagation();
      this.setState({
        imgOpen: true,
        src: e.target.src,
      });
    }
  };

  saveRef = (name) => (ref) => {
    this[name] = ref;
    const { saveRef } = this.props;
    if (saveRef) {
      saveRef(ref);
    }
  };

  handleChange = (content, delta, source, editor) => {
    const { onChange } = this.props;
    const value = editor.getContents();
    this.value = value.ops;
    if (onChange && value && value.ops) {
      onChange(value.ops);
    }
  };

  empty = () => {
    const { onChange } = this.props;
    onChange(undefined);
  };

  render() {
    const {
      placeholder,
      toolbarHeight,
      style,
      bottomBar,
      onCancel,
      onSave,
      mode,
      loading,
      onFullScreenClick,
      hideFullScreen,
    } = this.props;
    const readOnly = mode === 'read';
    const { value, imgOpen, src } = this.state;
    const newStyle = { ...defaultStyle, ...style };
    const editHeight =
      newStyle.height === '100%'
        ? `calc(100% - ${toolbarHeight || '42px'})`
        : newStyle.height - (toolbarHeight || 42);
    return (
      <div style={newStyle}>
        <div className="c7n-quill-editor">
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className={`react-quill-editor react-quill-editor-${mode}`}>
              <ToolBar
                id={this.toolBarId}
                onFullScreenClick={onFullScreenClick}
                hideFullScreen={hideFullScreen}
              />
              <ReactQuill
                readOnly={readOnly}
                ref={this.saveRef('editor')}
                theme="snow"
                modules={this.modules}
                style={{ height: editHeight, width: '100%' }}
                placeholder={
                  placeholder || intl.get('small.baseEditor.quill.description').d('描述')
                }
                defaultValue={value}
                onChange={this.handleChange}
                bounds=".react-quill-editor"
              />
            </div>
          </div>
          {bottomBar && !readOnly && (
            <div className="c7n-quill-editor-bottomBar">
              <Button type="primary" onClick={onCancel}>
                {intl.get('small.baseEditor.button.cancel').d('取消')}
              </Button>
              <Button type="primary" loading={loading} onClick={onSave}>
                {intl.get('small.baseEditor.button.save').d('保存')}
              </Button>
            </div>
          )}
          {imgOpen && (
            <LightBox
              mainSrc={src}
              onCloseRequest={() => this.setState({ imgOpen: false })}
              imageTitle="images"
            />
          )}
        </div>
      </div>
    );
  }
}
BaseEditor.defaultProps = defaultProps;
export default BaseEditor;
