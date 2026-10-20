import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import classNames from 'classnames';
import styles from './RichTextEditor.less';

// 生成唯一ID的函数
let instanceCounter = 0;

// 全局变量存储正则表达式缓存
let globalVariableRegex = null;
let globalCompleteVariableRegex = null;
let lastVariables = null;

const generateInstanceId = () => {
  instanceCounter++;
  return `rich-text-editor-${instanceCounter}-${Date.now()}`;
};

// 动态生成正则表达式的函数
const createVariableRegex = (variables) => {
  if (!variables || variables.length === 0) return null;

  const variableNames = variables.map((v) => v.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = `(${variableNames.join('|')})`;
  return new RegExp(pattern, 'g');
};

const createCompleteVariableRegex = (variables) => {
  if (!variables || variables.length === 0) return null;

  const variableNames = variables.map((v) => v.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = `(${variableNames.join('|')})$`;
  return new RegExp(pattern);
};

// 获取缓存的正则表达式
const getVariableRegex = (variables) => {
  if (!variables || variables.length === 0) return null;

  const variablesKey = JSON.stringify(variables);
  if (lastVariables !== variablesKey) {
    lastVariables = variablesKey;
    globalVariableRegex = createVariableRegex(variables);
    globalCompleteVariableRegex = createCompleteVariableRegex(variables);
  }

  return globalVariableRegex;
};

const getCompleteVariableRegex = (variables) => {
  if (!variables || variables.length === 0) return null;

  const variablesKey = JSON.stringify(variables);
  if (lastVariables !== variablesKey) {
    lastVariables = variablesKey;
    globalVariableRegex = createVariableRegex(variables);
    globalCompleteVariableRegex = createCompleteVariableRegex(variables);
  }

  return globalCompleteVariableRegex;
};

const RichTextEditor = forwardRef(
  (
    {
      value = '',
      onChange,
      onInput,
      onKeyDown,
      onBlur,
      placeholder = '',
      ruleDetail = '',
      variables = [],
      id,
      name,
      ...props
    },

    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const editorRef = useRef(null);
    const isComposingRef = useRef(false);
    const updateTimeoutRef = useRef(null);
    const skipHighlightUpdateRef = useRef(false);

    // 为每个组件实例生成唯一ID，确保完全独立
    const instanceId = useMemo(() => generateInstanceId(), []);

    // 使用全局缓存的正则表达式
    const variableRegex = getVariableRegex(variables);
    const completeVariableRegex = getCompleteVariableRegex(variables);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
          setIsFocused(true);
        }
      },

      blur: () => {
        if (editorRef.current) {
          editorRef.current.blur();
          setIsFocused(false);
        }
      },

      get value() {
        return getPlainText();
      },

      getPlainText: () => {
        return getPlainText();
      },

      set value(newValue) {
        setInternalValue(newValue);
        updateEditorContent(newValue, false);

        // 设置光标到内容末尾
        setTimeout(
          () => {
            if (editorRef.current) {
              editorRef.current.focus();
              const plainTextLength = newValue.length;
              setCursorPosition(plainTextLength);
            }
          },

          10
        ); // 增加延迟确保DOM更新完成
      },

      // 新增方法：设置值和光标位置
      setValueWithCursor: (newValue, cursorPos) => {
        setInternalValue(newValue);
        updateEditorContent(newValue, false);

        setTimeout(
          () => {
            if (editorRef.current) {
              editorRef.current.focus();
              setCursorPosition(cursorPos);
            }
          },

          10
        );

        // 触发onChange事件
        if (onChange) {
          const syntheticEvent = {
            target: {
              value: newValue,
            },

            currentTarget: {
              value: newValue,
            },
          };

          onChange(syntheticEvent);
        }
      },

      // 兼容旧的引用方式
      input: editorRef.current,
      textarea: editorRef.current,
    }));

    // 只更新高亮显示，不影响光标位置
    const updateHighlightOnly = () => {
      if (!editorRef.current || !variableRegex) return;

      // 保存当前光标位置
      const currentCursorPos = getCursorPosition();
      const currentText = getPlainText();

      // 移除现有的高亮
      const highlights = editorRef.current.querySelectorAll(`.${styles['variable-highlight']}`);

      highlights.forEach((highlight) => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
      });

      // 重新添加高亮
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      let node;

      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent;
        const matches = [...text.matchAll(variableRegex)];

        if (matches.length > 0) {
          const parent = textNode.parentNode;
          let lastIndex = 0;
          const fragment = document.createDocumentFragment();

          matches.forEach((match) => {
            // 添加匹配前的文本
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            // 添加高亮的变量
            const span = document.createElement('span');
            span.className = styles['variable-highlight'];
            // eslint-disable-next-line prefer-destructuring
            span.textContent = match[0];
            fragment.appendChild(span);

            lastIndex = match.index + match[0].length;
          });

          // 添加剩余文本
          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
          }

          parent.replaceChild(fragment, textNode);
        }
      });

      // 恢复光标位置（只有在文本内容没有变化时才恢复）
      setTimeout(
        () => {
          const newText = getPlainText();

          if (newText === currentText) {
            setCursorPosition(currentCursorPos);
          }
        },

        0
      );
    };

    // 获取纯文本内容
    const getPlainText = () => {
      if (!editorRef.current) return '';
      // 将 <br> 标签和 <div> 标签转换为换行符
      const html = editorRef.current.innerHTML;

      // 先处理 <div> 标签，在每个 <div> 前添加换行符（除了第一个）
      let textWithBreaks = html.replace(/<div[^>]*>/gi, '\n');
      // 移除 </div> 标签
      textWithBreaks = textWithBreaks.replace(/<\/div>/gi, '');
      // 处理 <br> 标签
      textWithBreaks = textWithBreaks.replace(/<br\s*\/?>/gi, '\n');

      // 创建临时元素来获取纯文本
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = textWithBreaks;
      let result = tempDiv.textContent || tempDiv.innerText || '';

      // 清理开头的换行符（因为第一个div也会被转换为换行符）
      result = result.replace(/^\n+/, '');

      return result;
    };

    // 更新编辑器内容
    const updateEditorContent = (text, preserveCursor = true) => {
      if (!editorRef.current) return;

      let highlightedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

      // 只有当存在变量正则表达式时才进行高亮处理
      if (variableRegex) {
        highlightedText = highlightedText.replace(
          variableRegex,
          `<span class="${styles['variable-highlight']}">$&</span>`
        );
      }

      let cursorOffset = 0;
      const selection = window.getSelection();

      // 保存当前光标位置
      if (preserveCursor && selection.rangeCount > 0) {
        cursorOffset = getCursorPosition();
      }

      // 检查内容是否真的需要更新
      if (editorRef.current.innerHTML === highlightedText) {
        return; // 内容相同，不需要更新
      }

      editorRef.current.innerHTML = highlightedText;

      // 恢复光标位置
      if (preserveCursor && cursorOffset >= 0) {
        setTimeout(
          () => {
            setCursorPosition(cursorOffset);
          },

          0
        );
      }
    };

    // 设置光标位置
    const setCursorPosition = (offset) => {
      if (!editorRef.current) return;

      try {
        const selection = window.getSelection();
        const range = document.createRange();
        const textNode = getTextNodeAtOffset(editorRef.current, offset);

        if (textNode.node) {
          range.setStart(
            textNode.node,
            Math.min(textNode.offset, textNode.node.textContent.length)
          );
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e) {
        // 如果设置光标位置失败，不做任何操作
        console.warn('Failed to set cursor position:', e);
      }
    };

    // 获取指定偏移量的文本节点
    const getTextNodeAtOffset = (root, offset) => {
      let currentOffset = 0;

      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              return NodeFilter.FILTER_ACCEPT;
            }

            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
              return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_SKIP;
          },
        },

        false
      );

      let node = walker.nextNode();

      while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeLength = node.textContent.length;

          if (currentOffset + nodeLength >= offset) {
            return {
              node,
              offset: offset - currentOffset,
            };
          }

          currentOffset += nodeLength;
        } else if (node.tagName === 'BR') {
          // BR 标签代表一个换行符
          if (currentOffset >= offset) {
            // 如果光标在 BR 标签位置，返回 BR 标签前的文本节点
            const prevNode = node.previousSibling;

            if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
              return {
                node: prevNode,
                offset: prevNode.textContent.length,
              };
            }
          }

          currentOffset += 1; // BR 标签算作一个字符
        }

        node = walker.nextNode();
      }

      // 如果没有找到合适的节点，返回最后一个文本节点
      const lastTextNode = getLastTextNode(root);

      return {
        node: lastTextNode,
        offset: lastTextNode ? lastTextNode.textContent.length : 0,
      };
    };

    // 获取最后一个文本节点
    const getLastTextNode = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      let lastNode = null;
      let node = walker.nextNode();

      while (node) {
        lastNode = node;
        node = walker.nextNode();
      }

      return lastNode;
    };

    // 获取当前光标位置
    const getCursorPosition = () => {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return 0;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);

      // 获取光标前的内容，包括 <br> 标签和 <div> 标签
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(preCaretRange.cloneContents());
      const htmlContent = tempDiv.innerHTML;

      // 先处理 <div> 标签，在每个 <div> 前添加换行符（除了第一个）
      let textWithBreaks = htmlContent.replace(/<div[^>]*>/gi, '\n');
      // 移除 </div> 标签
      textWithBreaks = textWithBreaks.replace(/<\/div>/gi, '');
      // 处理 <br> 标签
      textWithBreaks = textWithBreaks.replace(/<br\s*\/?>/gi, '\n');

      const tempDiv2 = document.createElement('div');
      tempDiv2.innerHTML = textWithBreaks;
      let result = tempDiv2.textContent || tempDiv2.innerText || '';

      // 清理开头的换行符（因为第一个div也会被转换为换行符）
      result = result.replace(/^\n+/, '');

      return result.length;
    };

    // 处理输入事件
    const handleInput = (e) => {
      if (isComposingRef.current) return;

      const plainText = getPlainText();
      const cursorPos = getCursorPosition();
      setInternalValue(plainText);

      // 延迟更新高亮，避免干扰正在进行的输入
      clearTimeout(updateTimeoutRef.current);

      // 检测是否刚刚输入了换行符
      const isNewlineInput = e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph';

      updateTimeoutRef.current = setTimeout(
        () => {
          if (!skipHighlightUpdateRef.current) {
            updateHighlightOnly();
          }

          skipHighlightUpdateRef.current = false;
        },

        isNewlineInput ? 300 : 100
      ); // 换行时延迟更长时间

      // 创建标准的事件对象格式
      const syntheticEvent = {
        target: {
          value: plainText,
          selectionStart: cursorPos,
          selectionEnd: cursorPos,
        },

        currentTarget: {
          value: plainText,
          selectionStart: cursorPos,
          selectionEnd: cursorPos,
        },
      };

      if (onChange) {
        onChange(syntheticEvent);
      }

      if (onInput) {
        onInput(syntheticEvent);
      }
    };

    // 处理键盘事件
    const handleKeyDown = (e) => {
      // 先调用父组件的onKeyDown处理函数
      if (onKeyDown) {
        onKeyDown(e);
      }

      // 如果事件已被父组件阻止，则不继续处理
      if (e.defaultPrevented) {
        return;
      }

      // 让浏览器自然处理 Enter 键换行，不进行preventDefault
      if (e.key === 'Enter') {
        // 设置标志，暂时跳过高亮更新，避免干扰换行
        skipHighlightUpdateRef.current = true;
        // 不阻止默认行为，让浏览器自然插入换行
        // 这样可以避免复杂的DOM操作和光标定位问题
        return;
      }

      // 处理退格键
      if (e.key === 'Backspace') {
        const selection = window.getSelection();

        if (selection.rangeCount > 0) {
          const cursorPos = getCursorPosition();
          const text = getPlainText();

          // 检查光标前是否有变量
          const beforeCursor = text.substring(0, cursorPos);
          const completeVariableMatch = completeVariableRegex
            ? beforeCursor.match(completeVariableRegex)
            : null; // 匹配完整变量

          if (completeVariableMatch) {
            // 如果光标前有完整变量，删除整个变量
            e.preventDefault();
            const variableStart = cursorPos - completeVariableMatch[0].length;
            const newText = text.substring(0, variableStart) + text.substring(cursorPos);
            setInternalValue(newText);
            updateEditorContent(newText, false);

            // 设置光标位置到变量开始位置
            setTimeout(
              () => {
                setCursorPosition(variableStart);
              },

              0
            );

            // 触发onChange事件
            if (onChange) {
              const syntheticEvent = {
                target: {
                  value: newText,
                },

                currentTarget: {
                  value: newText,
                },
              };

              onChange(syntheticEvent);
            }

            return '';
          }
        }
      }
    };

    // 处理获取焦点事件
    const handleFocus = () => {
      setIsFocused(true);
    };

    // 处理失焦事件
    const handleBlur = (e) => {
      setIsFocused(false);

      if (onBlur) {
        onBlur(e);
      }
    };

    // 处理组合输入开始
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    // 处理组合输入结束
    const handleCompositionEnd = (e) => {
      isComposingRef.current = false;
      handleInput(e);
    };

    // 处理粘贴事件
    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    // 监听value变化
    useEffect(() => {
      if (value !== internalValue) {
        setInternalValue(value);
        updateEditorContent(value, true); // 保持光标位置
      }
    }, [value]);

    // 组件挂载后设置初始内容
    useEffect(() => {
      if (editorRef.current && internalValue) {
        updateEditorContent(internalValue);
      }
    }, []);

    // 判断是否应该显示规则详情border
    const shouldShowRuleDetail = isFocused || (internalValue && internalValue.trim().length > 0);

    // 判断是否应该显示placeholder - 基于内容是否为空
    const hasContent = internalValue && internalValue.trim().length > 0;
    const shouldShowPlaceholder = !hasContent;

    // 动态计算显示的placeholder - 确保每个组件实例独立
    const currentPlaceholder = isFocused ? placeholder : ruleDetail || placeholder;

    return (
      <div className={styles['rich-text-editor-container']} data-instance-id={instanceId}>
        {ruleDetail && (
          <div
            className={classNames(
              styles['rule-detail-border'],
              shouldShowRuleDetail ? '' : styles['rule-detail-border-exit']
            )}
            style={{
              visibility: shouldShowRuleDetail ? 'visible' : 'hidden',
              transform: shouldShowRuleDetail ? 'translateY(-50%)' : 'translateY(20px)',
              opacity: shouldShowRuleDetail ? 1 : 0,
            }}
          >
            {ruleDetail}
          </div>
        )}
        <div
          style={{
            position: 'relative',
          }}
        >
          {shouldShowPlaceholder && (
            <div className={styles['placeholder-text']}> {currentPlaceholder}</div>
          )}
          <div
            ref={editorRef}
            className={styles['rich-text-editor']}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPaste={handlePaste}
            data-instance-id={instanceId}
            id={id || instanceId}
            name={name}
            {...props}
          />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
