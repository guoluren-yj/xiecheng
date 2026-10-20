// 使用的是@uiw/react-markdown-preview 对应版本3.2.2 版本高于当前版本之后，会报错
// 本文件修改了部分代码，为了当前版本的react-markdown可以使用
// @uiw/react-markdown-preview@3.2.2 配合 react-markdown@8.0.3 时功能较多，目前dev的react-markdown是4.3.1
import React, { useImperativeHandle } from 'react';
import ReactMarkdown, { RemarkParseOptions } from 'react-markdown';
import { isObject, isString } from 'lodash';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia, oneDark, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './styles/markdown.less';
import './styles/markdowncolor.less';

export type MarkdownPreviewProps = {
  prefixCls?: string;
  className?: string;
  source?: string;
  javaScriptColor?: number;
  style?: React.CSSProperties;
  warpperElement?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  onScroll?: () => void; // e: React.MouseEvent<HTMLDivElement>
  onMouseOver?: () => void; // e: React.MouseEvent<HTMLDivElement>
  handleSelectKey?: any;
  witchMenu?: any;
} & Omit<RemarkParseOptions, 'children'>;

export type MarkdownPreviewRef = {
  mdp: React.RefObject<HTMLDivElement>;
} & MarkdownPreviewProps;

export default React.forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>((props, ref) => {
  const {
    prefixCls = 'wmde-markdown wmde-markdown-color',
    className,
    source,
    style,
    onScroll,
    onMouseOver,
    warpperElement: wrapperElement = {},
    javaScriptColor = -1,
    handleSelectKey = () => {},
    witchMenu = () => {},
    ...other
  } = props || {};
  const mdp = React.createRef<HTMLDivElement>();
  let directoryObj = {};
  const jsColor = { okaidia, oneDark, vscDarkPlus };
  const currentColor = jsColor[Object.keys(jsColor)[javaScriptColor]];
  useImperativeHandle(ref, () => ({ ...props, mdp }), [mdp, props]);
  const cls = `${prefixCls || ''} ${className || ''}`;

  return (
    // eslint-disable-next-line
    <div
      ref={mdp}
      onScroll={onScroll}
      onMouseOver={onMouseOver}
      {...wrapperElement}
      className={cls}
      style={style}
    >
      <ReactMarkdown
        {...other}
        source={source || ''}
        renderers={{
          code({ node, inline, className: classNames, children, ...arg }) {
            const { language, value } = arg;
            const useHighL = isObject(arg) && language;
            return useHighL ? (
              <SyntaxHighlighter
                style={currentColor}
                language={language}
                // PreTag="div" // 背景阴影
                {...arg}
              >
                {value || ''}
              </SyntaxHighlighter>
            ) : (
              <code className={classNames} {...arg}>
                {children}
              </code>
            );
          },
          heading({ node, inline, className: classNames, children, ...arg }) {
            const text =
              children.length > 0 && children[0]?.props?.value ? children[0].props.value : '';
            let id = {};
            if (text) {
              if (directoryObj[text]) {
                id = { id: directoryObj[text] };
              } else {
                Object.values(directoryObj).forEach((item) => {
                  if (isString(item) && item.toLocaleLowerCase() === text.toLocaleLowerCase()) {
                    id = { id: item };
                  }
                });
              }
            }
            return React.createElement(arg.level < 7 ? `h${arg.level}` : 'span', { ...id }, text);
          },
          link({ node, inline, className: classNames, children, ...arg }) {
            const text =
              children.length > 0 && children[0]?.props?.value ? children[0].props.value : '';
            const href = arg.href ? (/^#/.test(arg.href) ? arg.href.slice(1) : arg.href) : '';
            const result = { ...directoryObj, [text]: href };
            directoryObj = result;
            // 跳转至其他帮助文档
            if (href.indexOf('linkOtherHelpManuals-') !== -1) {
              const linkKey = href.slice(21);
              return (
                <a
                  {...arg}
                  onClick={() => {
                    if (linkKey) {
                      handleSelectKey(linkKey);
                      witchMenu(linkKey);
                    }
                  }}
                >
                  {text}
                </a>
              );
            } else {
              return <a {...arg}>{text}</a>;
            }
          },
        }}
      />
    </div>
  );
});
