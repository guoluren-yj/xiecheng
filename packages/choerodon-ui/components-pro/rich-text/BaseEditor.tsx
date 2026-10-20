import React, { Component, ComponentClass } from 'react';
import { observer } from 'mobx-react';
import { findDOMNode } from 'react-dom';
import { Range, ReactQuillProps, UnprivilegedEditor } from 'react-quill/lib';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import QuillImageDropAndPaste from './utils/imageDropAndPaste';
import { DeltaOperation, DeltaStatic, Sources, StringMap } from './quill';
import autobind from '../_util/autobind';
import Modal from '../modal';
import RichTextViewer from './RichTextViewer';
import { RichTextToolbarType } from './enum';
import { RichTextToolbarHook } from './RichText';
import Toolbar from './toolbar';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';

let ReactQuill: ComponentClass<ReactQuillProps>;

let Quill: any;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  ReactQuill = require('react-quill');
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  Quill = require('react-quill').Quill;

  /**
   * 注册图片拖拽、粘贴
   */
  Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
}

export interface BaseEditorProps {
  dataSet?: DataSet;
  record?: Record;
  value: DeltaStatic;
  saveRef?: Function;
  onChange?: Function;
  bounds?: string | HTMLElement;
  children?: React.ReactElement<any>;
  className?: string;
  defaultValue?: string | DeltaStatic;
  formats?: string[];
  id?: string;
  modules?: StringMap;

  onChangeSelection?(selection: Range, source: Sources, editor: UnprivilegedEditor): void;

  onFocus?(selection: Range, source: Sources, editor: UnprivilegedEditor): void;

  onBlur?(previousSelection: Range, source: Sources, editor: UnprivilegedEditor): void;

  onKeyDown?: React.EventHandler<any>;
  onKeyPress?: React.EventHandler<any>;
  onKeyUp?: React.EventHandler<any>;
  placeholder?: string;
  preserveWhitespace?: boolean;
  readOnly?: boolean;
  scrollingContainer?: string | HTMLElement;
  style?: React.CSSProperties;
  tabIndex?: number;
  theme?: string;
  autoFocus?: boolean;
  mode?: 'preview' | 'editor';
  toolbarId?: string;
  toolbar?: RichTextToolbarType | RichTextToolbarHook;
}

@observer
export default class BaseEditor extends Component<BaseEditorProps> {
  editor: any;

  deltaOps?: DeltaOperation[];

  @autobind
  setValue(value) {
    if (this.editor) {
      this.editor.getEditor().setContents(value);
    }
  }

  @autobind
  handleRichTextChange(_, __, ___, editor: UnprivilegedEditor) {
    const rtDelta = editor.getContents();
    let newOps: DeltaOperation[] | undefined = rtDelta.ops;
    if (newOps &&  newOps.length === 1 && newOps[0].insert === '\n') {
      newOps = undefined;
    }
    this.deltaOps = newOps;
    const { onChange } = this.props;
    if (onChange) {
      onChange(newOps);
    }
  }

  componentDidUpdate() {
    const { value } = this.props;
    let deltaOps;
    if (!isObject(value) && this.editor) {
      deltaOps = this.editor.getEditor().clipboard.convert(value).ops;
    }
    if ('value' in this.props && !isEqual(this.deltaOps, deltaOps || value) && this.editor) {
      this.editor.getEditor().setContents(deltaOps || value);
    }
  }

  getOtherProps() {
    return omit(this.props, ['style', 'toolbar', 'className', 'defaultValue', 'onChange', 'value']);
  }

  handleOpenLightBox = (e) => {
    if (e.target.nodeName === 'IMG' && this.deltaOps) {
      e.stopPropagation();
      const src = e.target.src;
      const imgArr: string[] = [];
      this.deltaOps.forEach(item => {
        const image = item.insert.image;
        if (image) {
          imgArr.push(image);
        }
      });
      const index = imgArr.findIndex(img => img === src);
      Modal.preview({
        list: imgArr,
        defaultIndex: index,
      });
    }
  };

  componentWillUnmount() {
    const thisNode = findDOMNode(this);
    if (thisNode) {
      thisNode.removeEventListener('click', this.handleOpenLightBox);
    }
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus && this.editor) {
      setTimeout(() => {
        this.editor.focus();
      });
    }
    const thisNode = findDOMNode(this);
    if (thisNode) {
      thisNode.addEventListener('click', this.handleOpenLightBox);
    }
  }

  blur() {
    if (this.editor) {
      this.editor.blur();
    }
  }

  @autobind
  renderContent() {
    const { style, className, toolbarId, toolbar, dataSet, value, mode } = this.props;
    let deltaOps;
    if (!isObject(value) && this.editor) {
      deltaOps = this.editor.getEditor().clipboard.convert(value).ops;
    }
    if (mode === 'preview') {
      return (
        <RichTextViewer
          style={style}
          deltaOps={deltaOps || value}
        />
      );
    }
    if (ReactQuill) {
      return (
        <>
          <Toolbar id={toolbarId} dataSet={dataSet} toolbar={toolbar} prefixCls={className} />
          <ReactQuill
            {...this.getOtherProps()}
            className={`${className}-quill`}
            defaultValue={value}
            ref={this.saveRef('editor')}
            onChange={this.handleRichTextChange}
            bounds={className}
          />
        </>
      );
    }
  }

  render() {
    const { className, style } = this.props;
    const content = this.renderContent();
    return (
      <div className={className} style={style}>
        {content}
      </div>
    );
  }

  saveRef = name => (ref) => {
    this[name] = ref;
    const { saveRef } = this.props;
    if (saveRef) {
      saveRef(ref);
    }
  };
}
