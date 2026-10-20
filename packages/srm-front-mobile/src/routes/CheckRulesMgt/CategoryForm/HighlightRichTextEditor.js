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

const generateInstanceId = () => {
  instanceCounter++;
  return `highlight-rich-text-editor-${instanceCounter}-${Date.now()}`;
};

const HighlightRichTextEditor = forwardRef(
  (
    {
      value = '',
      onChange,
      onInput,
      onKeyDown,
      onBlur,
      placeholder = '',
      scopeTitle = '',
      // variables = [], // 不直接使用，通过insertHighlightVariable方法管理
      filteredVariables = [],
      id,
      name,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedRanges, setHighlightedRanges] = useState([]); // 记录被选择插入的变量的具体位置
    const editorRef = useRef(null);
    const isComposingRef = useRef(false);
    const updateTimeoutRef = useRef(null);
    const skipHighlightUpdateRef = useRef(false);
    const isDeletingHighlightRef = useRef(false);

    const isProcessingEnterRef = useRef(false);

    // 为每个组件实例生成唯一ID，确保完全独立
    const instanceId = useMemo(() => generateInstanceId(), []);

    // 计算带FieldCodes的文本
    const calculateTextWithFieldCodes = (text, ranges) => {
      let rangesToUse = ranges;

      // 如果没有提供范围，但在 filteredVariables 中有匹配项，尝试自动解析
      // 这可以修复在没有显式高亮（如直接输入或初始加载）时的解析问题
      if (
        (!rangesToUse || rangesToUse.length === 0) &&
        filteredVariables &&
        filteredVariables.length > 0 &&
        text
      ) {
        const detectedRanges = [];
        filteredVariables.forEach((variable) => {
          const { fieldName, fieldCode, fieldPrefix } = variable;
          if (fieldName) {
            const escapedName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedName, 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
              detectedRanges.push({
                start: match.index,
                end: match.index + fieldName.length,
                value: fieldName,
                fieldCode,
                fieldPrefix: fieldPrefix || '',
              });
            }
          }
        });

        if (detectedRanges.length > 0) {
          // 按开始位置排序，如果开始位置相同则按长度降序排序（优先匹配更长的词）
          detectedRanges.sort((a, b) => {
            if (a.start !== b.start) {
              return a.start - b.start;
            }
            return b.end - a.end;
          });

          // 过滤重叠的匹配项
          const validRanges = [];
          let lastEnd = 0;
          detectedRanges.forEach((match) => {
            if (match.start >= lastEnd) {
              validRanges.push(match);
              lastEnd = match.end;
            }
          });

          rangesToUse = validRanges;
        }
      }

      if (!rangesToUse || rangesToUse.length === 0) {
        return text;
      }

      // 按位置倒序排列，从后往前替换避免位置偏移
      const sortedRanges = [...rangesToUse].sort((a, b) => b.start - a.start);
      let result = text;

      sortedRanges.forEach((range) => {
        if (range.start >= 0 && range.end <= result.length) {
          const before = result.substring(0, range.start);
          const after = result.substring(range.end);

          // 确保 fieldCode 前面都拼接上 fieldPrefix_，但不要重复拼接
          let fieldCodeWithPrefix;
          let currentFieldPrefix = range.fieldPrefix;

          // 如果没有 fieldPrefix，从 filteredVariables 中根据 fieldCode 匹配获取
          if (
            !currentFieldPrefix &&
            range.fieldCode &&
            filteredVariables &&
            filteredVariables.length > 0
          ) {
            const matchedVariable = filteredVariables.find(
              (variable) =>
                variable.fieldCode === range.fieldCode || variable.label === range.fieldCode
            );
            if (matchedVariable && matchedVariable.fieldPrefix) {
              currentFieldPrefix = matchedVariable.fieldPrefix;
            }
          }

          if (range.fieldCode && currentFieldPrefix) {
            // 检查 fieldCode 是否已经包含 fieldPrefix_
            const expectedPrefix = `${currentFieldPrefix}_`;
            if (range.fieldCode.startsWith(expectedPrefix)) {
              // 已经包含前缀，直接使用
              fieldCodeWithPrefix = range.fieldCode;
            } else {
              // 没有前缀，需要拼接
              fieldCodeWithPrefix = `${expectedPrefix}${range.fieldCode}`;
            }
          } else {
            // 如果没有 fieldPrefix 或 fieldCode，使用原始 fieldCode
            fieldCodeWithPrefix = range.fieldCode || '';
          }

          result = `${before}${fieldCodeWithPrefix}${after}`;
        }
      });
      return result;
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
          setIsFocused(true);
        }
        // 对于普通退格删除，不阻止默认行为，让浏览器和 handleInput 处理
        // 这里不需要额外的逻辑，让事件继续传播
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

      // 新增方法：获取将高亮内容替换为 fieldCode 的文本
      getTextWithFieldCodes: () => {
        const plainText = getPlainText();
        return calculateTextWithFieldCodes(plainText, highlightedRanges);
      },

      set value(newValue) {
        setInternalValue(newValue);
        // 重置高亮范围数组，因为是外部设置的值
        setHighlightedRanges([]);
        updateEditorContent(newValue, false);

        // 设置光标到内容末尾
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            const plainTextLength = newValue.length;
            setCursorPosition(plainTextLength);
          }
        }, 10);
      },

      // 新增方法：设置值和光标位置
      setValueWithCursor: (newValue, cursorPos) => {
        setInternalValue(newValue);
        updateEditorContent(newValue, false);

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            setCursorPosition(cursorPos);
            // 重新应用高亮
            updateHighlightOnly();
          }
        }, 10);

        // 触发onChange事件
        if (onChange) {
          const syntheticEvent = {
            target: {
              value: newValue,
              // 这里虽然 highlightRanges 还没更新，但 newValue 是新的
              // 由于这是外部直接设置值，我们假设 highlightRanges 为空（或旧值无效）
              // 如果需要更复杂的行为，外部应该使用 insertHighlightVariable
              valueWithCodes: newValue,
            },
            currentTarget: {
              value: newValue,
            },
          };
          onChange(syntheticEvent);
        }
      },

      // 新增方法：插入高亮变量
      insertHighlightVariable: (
        variableValue,
        startPos,
        fieldCode = null,
        fieldPrefix = '',
        endPos = null
      ) => {
        const currentText = getPlainText();
        const actualEndPos = endPos !== null ? endPos : startPos;
        const beforeReplacement = currentText.substring(0, startPos);
        const afterReplacement = currentText.substring(actualEndPos);
        const newText = beforeReplacement + variableValue + afterReplacement;
        const newCursorPos = beforeReplacement.length + variableValue.length;
        const replacedLength = actualEndPos - startPos;
        const lengthDiff = variableValue.length - replacedLength;

        setInternalValue(newText);

        // 计算新的高亮范围
        let newRangesForCalc = [];

        // 添加到高亮范围数组，记录具体位置
        setHighlightedRanges((prev) => {
          const newRanges = [...prev];
          // 调整现有范围的位置
          const adjustedRanges = newRanges
            .map((range) => {
              // 如果范围在替换区域之前，不需要调整
              if (range.end <= startPos) {
                return range;
              }
              // 如果范围在替换区域之后，需要根据长度差异调整
              else if (range.start >= actualEndPos) {
                return {
                  ...range,
                  start: range.start + lengthDiff,
                  end: range.end + lengthDiff,
                };
              }
              // 如果范围与替换区域重叠，删除该范围
              else {
                return null;
              }
            })
            .filter((range) => range !== null);

          // 添加新的高亮范围
          adjustedRanges.push({
            start: startPos,
            end: startPos + variableValue.length,
            value: variableValue,
            fieldCode: fieldCode || variableValue, // 存储 fieldCode，如果没有提供则使用 variableValue
            fieldPrefix: fieldPrefix || '',
          });

          newRangesForCalc = adjustedRanges;
          return adjustedRanges;
        });

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            setCursorPosition(newCursorPos);
          }
        }, 50);

        // 触发onChange事件
        if (onChange) {
          const syntheticEvent = {
            target: {
              value: newText,
              valueWithCodes: calculateTextWithFieldCodes(newText, newRangesForCalc),
            },
            currentTarget: {
              value: newText,
            },
          };
          onChange(syntheticEvent);
        }

        return newCursorPos;
      },

      // 设置高亮范围的方法
      setHighlightRanges: (ranges) => {
        setHighlightedRanges(ranges);
        setTimeout(() => {
          updateHighlightOnly(ranges);
        }, 10);
      },

      // 兼容旧的引用方式
      input: editorRef.current,
      textarea: editorRef.current,
    }));

    // 使用指定的范围更新高亮显示，不影响光标位置

    // 只更新高亮显示，不影响光标位置
    const updateHighlightOnly = (rangesToUse = null, preserveCursor = true) => {
      const ranges = rangesToUse || highlightedRanges;
      if (!editorRef.current || ranges.length === 0) return;

      // 保存当前光标位置
      const currentCursorPos = preserveCursor ? getCursorPosition() : -1;
      const currentText = getPlainText();

      // 基于位置范围重新添加高亮
      let htmlContent = currentText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // 按位置正序排列，从前往后处理
      const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

      // 重新构建HTML内容，基于转义后的文本和排序后的范围
      const htmlParts = [];
      let lastIndex = 0;

      sortedRanges.forEach((range) => {
        if (range.start >= 0 && range.end <= currentText.length && range.start < range.end) {
          // 检查是否与之前的范围重叠
          if (range.start < lastIndex) {
            return;
          }

          // 添加高亮范围之前的文本
          if (range.start > lastIndex) {
            htmlParts.push(htmlContent.substring(lastIndex, range.start));
          }

          // 从转义后的文本中提取高亮内容
          const highlighted = htmlContent.substring(range.start, range.end);

          // 直接使用提取的文本，不再尝试查找
          htmlParts.push(`<span class="${styles['variable-highlight']}">${highlighted}</span>`);
          lastIndex = range.end;
        }
      });

      // 添加最后剩余的文本
      if (lastIndex < htmlContent.length) {
        htmlParts.push(htmlContent.substring(lastIndex));
      }

      htmlContent = htmlParts.join('');

      // 处理换行符
      htmlContent = htmlContent.replace(/\n/g, '<br>');

      // 检查内容是否真的发生了变化
      const contentChanged = editorRef.current.innerHTML !== htmlContent;
      if (contentChanged) {
        editorRef.current.innerHTML = htmlContent;
      }

      // 恢复光标位置 - 只有在需要保持光标位置且光标位置有效时才恢复
      if (preserveCursor && currentCursorPos >= 0) {
        setTimeout(
          () => {
            setCursorPosition(currentCursorPos);
            // 验证光标位置是否正确设置
            setTimeout(() => {
              getCursorPosition();
            }, 10);
          },
          contentChanged ? 50 : 10
        );
      }
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

      // 基于位置范围高亮变量
      if (highlightedRanges.length > 0) {
        // 按位置倒序排列，从后往前替换避免位置偏移
        const sortedRanges = [...highlightedRanges].sort((a, b) => b.start - a.start);

        // 先转义整个文本
        let workingText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 从后往前插入高亮标签，避免位置偏移
        sortedRanges.forEach((range) => {
          if (range.start >= 0 && range.end <= text.length) {
            const before = workingText.substring(0, range.start);
            const highlighted = workingText.substring(range.start, range.end);
            const after = workingText.substring(range.end);

            workingText = `${before}<span class="${styles['variable-highlight']}">${highlighted}</span>${after}`;
          }
        });

        highlightedText = workingText;

        // 处理换行符
        highlightedText = highlightedText.replace(/\n/g, '<br>');
      }

      let cursorOffset = 0;
      const selection = window.getSelection();

      // 保存当前光标位置
      if (preserveCursor && selection.rangeCount > 0) {
        cursorOffset = getCursorPosition();
      }

      if (editorRef.current.innerHTML === highlightedText) {
        return; // 内容相同，不需要更新
      }

      editorRef.current.innerHTML = highlightedText;

      // 恢复光标位置
      if (preserveCursor && cursorOffset >= 0) {
        setTimeout(() => {
          setCursorPosition(cursorOffset);
          // 验证光标位置是否正确恢复
          setTimeout(() => {
            const actualPos = getCursorPosition();
            if (Math.abs(actualPos - cursorOffset) > 1) {
              setCursorPosition(cursorOffset);
            }
          }, 5);
        }, 0);
      }
    };

    // 设置光标位置
    const setCursorPosition = (offset) => {
      if (!editorRef.current) return;

      try {
        const selection = window.getSelection();
        const range = document.createRange();
        const textNode = getTextNodeAtOffset(editorRef.current, offset);

        if (textNode && textNode.node) {
          const finalOffset = Math.min(textNode.offset, textNode.node.textContent.length);

          range.setStart(textNode.node, finalOffset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          // 确保编辑器获得焦点
          editorRef.current.focus();
        } else {
          // 如果找不到文本节点，尝试将光标设置到编辑器末尾
          const fallbackRange = document.createRange();
          fallbackRange.selectNodeContents(editorRef.current);
          fallbackRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(fallbackRange);
          editorRef.current.focus();
        }
      } catch (e) {
        // 如果设置光标位置失败，不做任何操作
        console.warn('setCursorPosition - 设置失败:', e);
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
            const result = {
              node,
              offset: offset - currentOffset,
            };
            return result;
          }
          currentOffset += nodeLength;
        } else if (node.tagName === 'BR') {
          // BR 标签代表一个换行符
          if (currentOffset === offset) {
            // 光标正好在 BR 标签位置，检查BR后是否有文本节点
            let nextTextNode = node.nextSibling;
            while (nextTextNode && nextTextNode.nodeType !== Node.TEXT_NODE) {
              nextTextNode = nextTextNode.nextSibling;
            }

            if (nextTextNode && nextTextNode.nodeType === Node.TEXT_NODE) {
              // 如果BR后有文本节点，将光标放在该文本节点的开始
              return { node: nextTextNode, offset: 0 };
            } else {
              // 如果BR后没有文本节点，创建一个新的文本节点
              const textNode = document.createTextNode('');
              if (node.nextSibling) {
                node.parentNode.insertBefore(textNode, node.nextSibling);
              } else {
                node.parentNode.appendChild(textNode);
              }
              return { node: textNode, offset: 0 };
            }
          } else if (currentOffset + 1 === offset) {
            // 光标在BR标签之后，寻找或创建下一个文本节点
            let nextTextNode = node.nextSibling;
            while (nextTextNode && nextTextNode.nodeType !== Node.TEXT_NODE) {
              nextTextNode = nextTextNode.nextSibling;
            }

            if (nextTextNode && nextTextNode.nodeType === Node.TEXT_NODE) {
              return { node: nextTextNode, offset: 0 };
            } else {
              // 创建新的文本节点
              const textNode = document.createTextNode('');
              if (node.nextSibling) {
                node.parentNode.insertBefore(textNode, node.nextSibling);
              } else {
                node.parentNode.appendChild(textNode);
              }
              return { node: textNode, offset: 0 };
            }
          }
          currentOffset += 1; // BR 标签算作一个字符
        }
        node = walker.nextNode();
      }

      // 如果没有找到合适的节点，返回最后一个文本节点
      const finalTextNode = getLastTextNode(root);
      if (finalTextNode) {
        const result = {
          node: finalTextNode,
          offset: finalTextNode.textContent.length,
        };
        return result;
      }

      // 如果没有任何文本节点，创建一个
      const newTextNode = document.createTextNode('');
      root.appendChild(newTextNode);
      const result = {
        node: newTextNode,
        offset: 0,
      };
      return result;
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
      if (!editorRef.current || selection.rangeCount === 0) {
        return 0;
      }

      try {
        const range = selection.getRangeAt(0);

        // 确保range在编辑器内
        if (!editorRef.current.contains(range.commonAncestorContainer)) {
          return 0;
        }

        const preRange = range.cloneRange();
        preRange.selectNodeContents(editorRef.current);
        preRange.setEnd(range.endContainer, range.endOffset);

        const temp = document.createElement('div');
        temp.appendChild(preRange.cloneContents());

        // 统一处理换行：将div和br都转换为\n
        temp.innerHTML = temp.innerHTML
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n');

        const result = (temp.textContent || temp.innerText || '').length;
        return result;
      } catch (error) {
        console.warn('获取光标位置时出错:', error);
        return 0;
      }
    };

    // 获取当前选区在纯文本中的起止偏移（闭开区间 [start, end)）
    const getSelectionOffsets = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return { start: 0, end: 0, collapsed: true };
      }
      try {
        const range = selection.getRangeAt(0);
        const preRangeStart = range.cloneRange();
        preRangeStart.selectNodeContents(editorRef.current);
        preRangeStart.setEnd(range.startContainer, range.startOffset);

        const preRangeEnd = range.cloneRange();
        preRangeEnd.selectNodeContents(editorRef.current);
        preRangeEnd.setEnd(range.endContainer, range.endOffset);

        const tempStart = document.createElement('div');
        tempStart.appendChild(preRangeStart.cloneContents());
        tempStart.innerHTML = tempStart.innerHTML
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n');

        const tempEnd = document.createElement('div');
        tempEnd.appendChild(preRangeEnd.cloneContents());
        tempEnd.innerHTML = tempEnd.innerHTML
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n');

        const start = (tempStart.textContent || tempStart.innerText || '').length;
        const end = (tempEnd.textContent || tempEnd.innerText || '').length;
        return { start, end, collapsed: range.collapsed };
      } catch (err) {
        return { start: 0, end: 0, collapsed: true };
      }
    };

    // 调整光标位置，避免在高亮区域内
    const adjustCursorPosition = (position) => {
      for (const range of highlightedRanges) {
        if (position > range.start && position < range.end) {
          // 如果光标在高亮区域内，移动到区域边界
          const distanceToStart = position - range.start;
          const distanceToEnd = range.end - position;
          return distanceToStart < distanceToEnd ? range.start : range.end;
        }
      }
      return position;
    };

    // 处理鼠标点击事件，防止光标放置在高亮区域内
    const handleMouseUp = () => {
      // 让浏览器先处理点击事件
      setTimeout(() => {
        const cursorPos = getCursorPosition();
        const adjustedPos = adjustCursorPosition(cursorPos);
        if (adjustedPos !== cursorPos) {
          setCursorPosition(adjustedPos);
        }
      }, 0);
    };
    // 处理输入事件
    const handleInput = (e) => {
      // 解决 React 16 中合成事件被复用的警告
      if (e && e.persist) {
        e.persist();
      }

      if (isComposingRef.current) return;

      // 如果正在处理Enter键或其他特殊操作，跳过handleInput处理
      if (isDeletingHighlightRef.current || isProcessingEnterRef.current) {
        return;
      }

      const plainText = getPlainText();
      const cursorPos = getCursorPosition();
      const oldText = internalValue;

      let nextRanges = highlightedRanges;

      // 计算文本变化并更新高亮范围
      if (plainText !== oldText) {
        const oldLength = oldText.length;
        const newLength = plainText.length;
        const lengthDiff = newLength - oldLength;

        // 更精确地计算变化位置
        let changeStart = 0;
        let changeEnd = oldLength;

        // 从前往后找到第一个不同的字符位置
        while (
          changeStart < Math.min(oldLength, newLength) &&
          oldText[changeStart] === plainText[changeStart]
        ) {
          changeStart++;
        }

        // 计算变化区域的结束位置
        if (lengthDiff < 0) {
          // 删除操作：从后往前找到第一个不同的字符位置
          let oldEnd = oldLength - 1;
          let newEnd = newLength - 1;
          while (
            oldEnd >= changeStart &&
            newEnd >= changeStart &&
            oldText[oldEnd] === plainText[newEnd]
          ) {
            oldEnd--;
            newEnd--;
          }
          // changeEnd是被删除区域在旧文本中的结束位置（不包含）
          changeEnd = oldEnd + 1;
        } else if (lengthDiff > 0) {
          // 插入操作：changeEnd等于changeStart（插入点）
          changeEnd = changeStart;
        } else {
          // 长度相同，可能是替换操作
          let oldEnd = oldLength - 1;
          let newEnd = newLength - 1;
          while (
            oldEnd >= changeStart &&
            newEnd >= changeStart &&
            oldText[oldEnd] === plainText[newEnd]
          ) {
            oldEnd--;
            newEnd--;
          }
          changeEnd = oldEnd + 1;
        }

        // 计算新的高亮范围
        // 首先验证所有现有范围是否仍然有效（基于旧文本）
        const validatedRanges = highlightedRanges.filter((range) => {
          if (range.start < 0 || range.end > oldText.length || range.start >= range.end) {
            return false;
          }
          const currentText = oldText.substring(range.start, range.end);
          if (currentText !== range.value) {
            return false;
          }
          return true;
        });

        const newRanges = validatedRanges
          .map((range) => {
            if (lengthDiff < 0) {
              // 删除操作

              // 检查高亮范围与删除区域的关系
              if (range.end <= changeStart) {
                // 高亮范围完全在删除位置之前，不需要调整
                return range;
              } else if (range.start >= changeEnd) {
                // 高亮范围完全在删除区域之后，需要向前移动
                const newRange = {
                  ...range,
                  start: range.start + lengthDiff,
                  end: range.end + lengthDiff,
                };

                // 验证调整后的文本是否正确
                if (newRange.start >= 0 && newRange.end <= plainText.length) {
                  const newHighlightText = plainText.substring(newRange.start, newRange.end);
                  if (newHighlightText === range.value) {
                    return newRange;
                  }

                  // 尝试在新文本中重新查找该高亮内容
                  const searchStart = Math.max(0, newRange.start - Math.abs(lengthDiff) - 5);
                  const searchEnd = Math.min(
                    plainText.length,
                    newRange.end + Math.abs(lengthDiff) + 5
                  );
                  const searchText = plainText.substring(searchStart, searchEnd);
                  const foundIndex = searchText.indexOf(range.value);

                  if (foundIndex !== -1) {
                    const correctedStart = searchStart + foundIndex;
                    const correctedEnd = correctedStart + range.value.length;
                    const correctedRange = {
                      ...range,
                      start: correctedStart,
                      end: correctedEnd,
                    };
                    return correctedRange;
                  }
                }

                return null;
              } else {
                // 高亮范围与删除区域有重叠，删除该高亮范围
                return null;
              }
            }
            // 插入操作
            if (range.end <= changeStart) {
              // 高亮范围完全在插入位置之前，不需要调整
              return range;
            } else if (range.start >= changeStart) {
              // 高亮范围完全在插入位置之后，需要向后移动
              const newRange = {
                ...range,
                start: range.start + lengthDiff,
                end: range.end + lengthDiff,
              };

              // 验证调整后的文本是否正确
              if (newRange.start >= 0 && newRange.end <= plainText.length) {
                const newHighlightText = plainText.substring(newRange.start, newRange.end);
                if (newHighlightText === range.value) {
                  return newRange;
                }
              }

              return null;
            }
            // 高亮范围包含插入位置，删除该高亮范围
            return null;
          })
          .filter((range) => range !== null);

        // 去重：移除重复的范围
        const uniqueRanges = [];
        newRanges.forEach((range) => {
          const isDuplicate = uniqueRanges.some(
            (existing) =>
              existing.start === range.start &&
              existing.end === range.end &&
              existing.value === range.value
          );
          if (!isDuplicate) {
            uniqueRanges.push(range);
          }
        });

        nextRanges = uniqueRanges;

        // 更新高亮范围
        setHighlightedRanges(nextRanges);

        // 立即使用调整后的范围更新高亮显示
        setInternalValue(plainText);

        // 延迟更新高亮，避免干扰正在进行的输入
        clearTimeout(updateTimeoutRef.current);

        // 检测是否刚刚输入了换行符
        const isNewlineInput =
          e?.inputType === 'insertLineBreak' ||
          e?.inputType === 'insertParagraph' ||
          e?.data === '\n' ||
          (plainText.includes('\n') && !oldText.includes('\n'));

        updateTimeoutRef.current = setTimeout(
          () => {
            if (!skipHighlightUpdateRef.current) {
              updateHighlightOnly(nextRanges, true); // 始终保持光标位置
            }
            skipHighlightUpdateRef.current = false;
          },
          isNewlineInput ? 300 : 100
        );
      } else {
        setInternalValue(plainText);

        // 延迟更新高亮，避免干扰正在进行的输入
        clearTimeout(updateTimeoutRef.current);

        // 检测是否刚刚输入了换行符
        const isNewlineInput =
          e?.inputType === 'insertLineBreak' ||
          e?.inputType === 'insertParagraph' ||
          e?.data === '\n' ||
          (plainText.includes('\n') && !oldText.includes('\n'));

        updateTimeoutRef.current = setTimeout(
          () => {
            if (!skipHighlightUpdateRef.current) {
              updateHighlightOnly(null, true); // 始终保持光标位置
            }
            skipHighlightUpdateRef.current = false;
          },
          isNewlineInput ? 300 : 100
        );
      }

      // 创建标准的事件对象格式
      const syntheticEvent = {
        target: {
          value: plainText,
          selectionStart: cursorPos,
          selectionEnd: cursorPos,
          valueWithCodes: calculateTextWithFieldCodes(plainText, nextRanges),
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

      // 检查光标是否在高亮区域内，如果是则调整位置
      setTimeout(() => {
        const currentPos = getCursorPosition();
        const adjustedPos = adjustCursorPosition(currentPos);
        if (adjustedPos !== currentPos) {
          setCursorPosition(adjustedPos);
        }
      }, 0);
    };

    const handleKeyDown = (e) => {
      // 对于Enter键，使用更简单的处理方式
      if (e.key === 'Enter') {
        // 先调用父组件的onKeyDown处理函数，让父组件有机会处理建议列表选择
        if (onKeyDown) {
          onKeyDown(e);
        }

        // 如果事件已被父组件阻止（比如选择了建议列表项），则不继续处理换行
        if (e.defaultPrevented) {
          return;
        }

        // 阻止默认行为，手动处理换行
        e.preventDefault();

        // 简单的防重复处理
        if (isProcessingEnterRef.current) {
          return;
        }

        isProcessingEnterRef.current = true;

        try {
          const currentPos = getCursorPosition();
          const currentText = getPlainText();

          // 在当前光标位置插入换行符
          const beforeCursor = currentText.substring(0, currentPos);
          const afterCursor = currentText.substring(currentPos);
          const newText = `${beforeCursor}\n${afterCursor}`;
          const newCursorPos = currentPos + 1;

          // 更新高亮范围
          const newHighlightedRanges = highlightedRanges.map((range) => {
            if (range.start >= currentPos) {
              return { ...range, start: range.start + 1, end: range.end + 1 };
            }
            if (range.end > currentPos) {
              return { ...range, end: range.end + 1 };
            }
            return range;
          });

          // 更新状态
          setHighlightedRanges(newHighlightedRanges);
          setInternalValue(newText);

          // 手动更新DOM内容
          if (editorRef.current) {
            let highlightedText = newText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

            // 应用高亮
            if (newHighlightedRanges.length > 0) {
              const sortedRanges = [...newHighlightedRanges].sort((a, b) => b.start - a.start);
              sortedRanges.forEach((range) => {
                if (range.start >= 0 && range.end <= newText.length) {
                  const beforeHighlight = highlightedText.substring(0, range.start);
                  const highlighted = highlightedText.substring(range.start, range.end);
                  const afterHighlight = highlightedText.substring(range.end);
                  highlightedText = `${beforeHighlight}<span class="${styles['variable-highlight']}">${highlighted}</span>${afterHighlight}`;
                }
              });
            }

            highlightedText = highlightedText.replace(/\n/g, '<br>');
            editorRef.current.innerHTML = highlightedText;
          }

          // 设置光标位置
          setTimeout(() => {
            setCursorPosition(newCursorPos);
            isProcessingEnterRef.current = false;
          }, 0);

          // 触发onChange事件
          if (onChange) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onChange(syntheticEvent);
          }
          if (onInput) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onInput(syntheticEvent);
          }
        } catch (error) {
          console.warn('Enter键处理出错:', error);
          isProcessingEnterRef.current = false;
        }

        return;
      }

      // 对于非Enter键，调用父组件的onKeyDown处理函数
      if (onKeyDown) {
        onKeyDown(e);
      }

      // 如果事件已被父组件阻止，则不继续处理
      if (e.defaultPrevented) {
        return;
      }

      const cursorPos = getCursorPosition();
      const text = getPlainText();

      // 处理方向键，跳过高亮区域
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const newPos = e.key === 'ArrowLeft' ? cursorPos - 1 : cursorPos + 1;

        // 检查新位置是否在高亮区域内
        for (const range of highlightedRanges) {
          if (newPos > range.start && newPos < range.end) {
            e.preventDefault();
            // 跳过整个高亮区域
            const targetPos = e.key === 'ArrowLeft' ? range.start : range.end;
            setTimeout(() => {
              setCursorPosition(targetPos);
            }, 0);
            return;
          }
        }
      }

      // 处理退格键 - 删除高亮变量时需要特殊处理
      if (e.key === 'Backspace') {
        // 若存在选区，优先处理整段删除
        const sel = getSelectionOffsets();
        if (!sel.collapsed && sel.end > sel.start) {
          e.preventDefault();

          // 设置删除标志，防止useEffect处理value变化
          isDeletingHighlightRef.current = true;

          const currentText = getPlainText();
          const before = currentText.substring(0, sel.start);
          const after = currentText.substring(sel.end);
          const newText = `${before}${after}`;

          // 先更新高亮范围（整体左移/移除被覆盖的范围）
          const delta = sel.end - sel.start;
          const newHighlightedRanges = highlightedRanges
            .map((r) => {
              if (sel.end <= r.start) {
                return { ...r, start: r.start - delta, end: r.end - delta };
              }
              if (sel.start >= r.end) {
                return r;
              }
              // 有重叠则删除
              return null;
            })
            .filter(Boolean);

          setHighlightedRanges(newHighlightedRanges);
          setInternalValue(newText);
          const targetPos = sel.start;

          // 手动更新编辑器内容，使用新的高亮范围
          if (editorRef.current) {
            let highlightedText = newText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

            // 基于新的高亮范围添加高亮
            if (newHighlightedRanges.length > 0) {
              const sortedRanges = [...newHighlightedRanges].sort((a, b) => b.start - a.start);
              sortedRanges.forEach((range) => {
                if (range.start >= 0 && range.end <= newText.length) {
                  const beforeHighlight = highlightedText.substring(0, range.start);
                  const highlighted = highlightedText.substring(range.start, range.end);
                  const afterHighlight = highlightedText.substring(range.end);
                  highlightedText = `${beforeHighlight}<span class="${styles['variable-highlight']}">${highlighted}</span>${afterHighlight}`;
                }
              });
            }

            highlightedText = highlightedText.replace(/\n/g, '<br>');
            editorRef.current.innerHTML = highlightedText;
          }

          // 设置光标位置
          setTimeout(() => {
            setCursorPosition(targetPos);
            setTimeout(() => {
              // 重置删除标志
              isDeletingHighlightRef.current = false;
            }, 10);
          }, 0);

          if (onChange) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onChange(syntheticEvent);
          }
          if (onInput) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onInput(syntheticEvent);
          }
          return;
        }
        // 检查光标是否紧邻高亮区域的结束位置
        const adjacentRange = highlightedRanges.find((range) => range.end === cursorPos);

        if (adjacentRange) {
          e.preventDefault();

          // 设置删除标志，防止useEffect处理value变化
          isDeletingHighlightRef.current = true;

          // 删除整个高亮变量
          const newText =
            text.substring(0, adjacentRange.start) + text.substring(adjacentRange.end);
          const targetCursorPos = adjacentRange.start;

          // 先更新高亮范围
          const newHighlightedRanges = highlightedRanges
            .map((r) => {
              if (r === adjacentRange) {
                return null; // 删除当前范围
              }
              // 调整其他范围的位置
              if (r.start >= adjacentRange.end) {
                const deletedLength = adjacentRange.value.length;
                const newStart = r.start - deletedLength;
                const newEnd = r.end - deletedLength;
                // 确保调整后的范围在新文本中是有效的
                if (newStart >= 0 && newEnd <= newText.length) {
                  return {
                    ...r,
                    start: newStart,
                    end: newEnd,
                  };
                }
                // 如果位置无效，删除该范围
                return null;
              }
              return r;
            })
            .filter((r) => r !== null);

          setHighlightedRanges(newHighlightedRanges);
          setInternalValue(newText);

          // 手动更新编辑器内容，使用新的高亮范围
          if (editorRef.current) {
            let highlightedText = newText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

            // 基于新的高亮范围添加高亮
            if (newHighlightedRanges.length > 0) {
              const sortedRanges = [...newHighlightedRanges].sort((a, b) => b.start - a.start);
              sortedRanges.forEach((range) => {
                if (range.start >= 0 && range.end <= newText.length) {
                  const before = highlightedText.substring(0, range.start);
                  const highlighted = highlightedText.substring(range.start, range.end);
                  const after = highlightedText.substring(range.end);
                  highlightedText = `${before}<span class="${styles['variable-highlight']}">${highlighted}</span>${after}`;
                }
              });
            }

            highlightedText = highlightedText.replace(/\n/g, '<br>');
            editorRef.current.innerHTML = highlightedText;
          }

          // 设置光标位置
          setTimeout(() => {
            setCursorPosition(targetCursorPos);
            setTimeout(() => {
              // 重置删除标志
              isDeletingHighlightRef.current = false;
            }, 10);
          }, 0);

          // 触发onChange事件
          if (onChange) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onChange(syntheticEvent);
          }
        }
        // 对于普通退格删除，不阻止默认行为，让浏览器和 handleInput 处理
      }

      // 处理Delete键
      if (e.key === 'Delete') {
        // 若存在选区，优先处理整段删除
        const sel = getSelectionOffsets();
        if (!sel.collapsed && sel.end > sel.start) {
          e.preventDefault();

          // 设置删除标志，防止useEffect处理value变化
          isDeletingHighlightRef.current = true;

          const deleteText = getPlainText();
          const before = deleteText.substring(0, sel.start);
          const after = deleteText.substring(sel.end);
          const newText = `${before}${after}`;

          const delta = sel.end - sel.start;
          const newHighlightedRanges = highlightedRanges
            .map((r) => {
              if (sel.end <= r.start) {
                return { ...r, start: r.start - delta, end: r.end - delta };
              }
              if (sel.start >= r.end) {
                return r;
              }
              return null;
            })
            .filter(Boolean);

          setHighlightedRanges(newHighlightedRanges);
          setInternalValue(newText);
          const targetPos = sel.start;

          // 手动更新编辑器内容，使用新的高亮范围
          if (editorRef.current) {
            let highlightedText = newText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

            // 基于新的高亮范围添加高亮
            if (newHighlightedRanges.length > 0) {
              const sortedRanges = [...newHighlightedRanges].sort((a, b) => b.start - a.start);
              sortedRanges.forEach((range) => {
                if (range.start >= 0 && range.end <= newText.length) {
                  const beforeHighlight = highlightedText.substring(0, range.start);
                  const highlighted = highlightedText.substring(range.start, range.end);
                  const afterHighlight = highlightedText.substring(range.end);
                  highlightedText = `${beforeHighlight}<span class="${styles['variable-highlight']}">${highlighted}</span>${afterHighlight}`;
                }
              });
            }

            highlightedText = highlightedText.replace(/\n/g, '<br>');
            editorRef.current.innerHTML = highlightedText;
          }

          // 设置光标位置
          setTimeout(() => {
            setCursorPosition(targetPos);
            setTimeout(() => {
              // 重置删除标志
              isDeletingHighlightRef.current = false;
            }, 10);
          }, 0);

          if (onChange) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onChange(syntheticEvent);
          }
          if (onInput) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onInput(syntheticEvent);
          }
          return;
        }
        // 检查光标是否紧邻高亮区域的开始位置
        const adjacentRange = highlightedRanges.find((range) => range.start === cursorPos);

        if (adjacentRange) {
          e.preventDefault();

          // 设置删除标志，防止useEffect处理value变化
          isDeletingHighlightRef.current = true;

          // 删除整个高亮变量
          const newText =
            text.substring(0, adjacentRange.start) + text.substring(adjacentRange.end);
          const targetCursorPos = cursorPos; // Delete键光标位置保持不变

          // 先更新高亮范围
          const newHighlightedRanges = highlightedRanges
            .map((r) => {
              if (r === adjacentRange) {
                return null; // 删除当前范围
              }
              // 调整其他范围的位置
              if (r.start >= adjacentRange.end) {
                const deletedLength = adjacentRange.value.length;
                const newStart = r.start - deletedLength;
                const newEnd = r.end - deletedLength;
                // 确保调整后的范围在新文本中是有效的
                if (newStart >= 0 && newEnd <= newText.length) {
                  return {
                    ...r,
                    start: newStart,
                    end: newEnd,
                  };
                }
                // 如果位置无效，删除该范围
                return null;
              }
              return r;
            })
            .filter((r) => r !== null);

          setHighlightedRanges(newHighlightedRanges);
          setInternalValue(newText);

          // 手动更新编辑器内容，使用新的高亮范围
          if (editorRef.current) {
            let highlightedText = newText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

            // 基于新的高亮范围添加高亮
            if (newHighlightedRanges.length > 0) {
              const sortedRanges = [...newHighlightedRanges].sort((a, b) => b.start - a.start);
              sortedRanges.forEach((range) => {
                if (range.start >= 0 && range.end <= newText.length) {
                  const before = highlightedText.substring(0, range.start);
                  const highlighted = highlightedText.substring(range.start, range.end);
                  const after = highlightedText.substring(range.end);
                  highlightedText = `${before}<span class="${styles['variable-highlight']}">${highlighted}</span>${after}`;
                }
              });
            }

            highlightedText = highlightedText.replace(/\n/g, '<br>');
            editorRef.current.innerHTML = highlightedText;
          }

          // 设置光标位置
          setTimeout(() => {
            setCursorPosition(targetCursorPos);
            setTimeout(() => {
              // 重置删除标志
              isDeletingHighlightRef.current = false;
            }, 10);
          }, 0);

          // 触发onChange事件
          if (onChange) {
            const syntheticEvent = {
              target: {
                value: newText,
                valueWithCodes: calculateTextWithFieldCodes(newText, newHighlightedRanges),
              },
              currentTarget: {
                value: newText,
              },
            };
            onChange(syntheticEvent);
          }
        }
        // 对于普通Delete删除，不阻止默认行为，让浏览器和 handleInput 处理
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
      if (value !== internalValue && !isDeletingHighlightRef.current) {
        setInternalValue(value);
        // 重置高亮范围数组，因为是外部设置的值
        setHighlightedRanges([]);
        updateEditorContent(value, true); // 保持光标位置
      }
    }, [value]);

    // 监听高亮范围变化，重新渲染高亮效果
    useEffect(() => {
      if (editorRef.current && internalValue && !isDeletingHighlightRef.current) {
        updateEditorContent(internalValue, true);
      }
    }, [highlightedRanges]);

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
    const currentPlaceholder = isFocused ? placeholder : scopeTitle || placeholder;

    return (
      <div className={styles['rich-text-editor-container']} data-instance-id={instanceId}>
        {scopeTitle && (
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
            {scopeTitle}
          </div>
        )}
        <div style={{ position: 'relative' }}>
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
            onMouseUp={handleMouseUp}
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

HighlightRichTextEditor.displayName = 'HighlightRichTextEditor';

export default HighlightRichTextEditor;
