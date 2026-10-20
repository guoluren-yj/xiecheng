/* eslint-disable no-template-curly-in-string */
import React, { useState, useRef, useEffect } from 'react';
import intl from 'utils/intl';

import { Form, TextField, Select } from 'choerodon-ui/pro';
import classnames from 'classnames';
// import RichTextEditor from './RichTextEditor';
import HighlightRichTextEditor from './HighlightRichTextEditor';
import styles from './RuleForm.less';

export default function RuleForm({ dataSet, processVariables = [] }) {
  const [inputMsg, setInputMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterContent, setFilterContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textAreaRef = useRef(null);
  const [inputMsg2, setInputMsg2] = useState('');
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [filterContent2, setFilterContent2] = useState('');
  const [cursorPosition2, setCursorPosition2] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const textAreaRef2 = useRef(null);

  useEffect(() => {
    if (dataSet && dataSet.current) {
      setInputMsg(dataSet?.current?.get('ruleDetailStr') ?? '');
      setInputMsg2(dataSet?.current?.get('ruleScopeStr') ?? '');
    }
  }, [dataSet]);

  // 根据输入内容过滤变量列表
  const filteredVariables = processVariables.length
    ? processVariables.filter((item) =>
        item.label.toLowerCase().includes(filterContent.toLowerCase())
      )
    : [];

  // 根据输入内容过滤变量列表
  const filteredVariables2 = processVariables.length
    ? processVariables.filter((item) =>
        item.label.toLowerCase().includes(filterContent2.toLowerCase())
      )
    : [];

  const handleInput = (e) => {
    const value = e?.target?.value || '';
    const cursorPos = e?.target?.selectionStart || 0;

    setInputMsg(value);
    setCursorPosition(cursorPos);

    if (dataSet && dataSet.current) {
      dataSet.current.set('ruleDetailStr', value);
    }

    // 检查是否输入了斜杠
    checkSlashInput(value, cursorPos);
  };

  const handleInput2 = (e) => {
    const value = e?.target?.value || '';
    const cursorPos = e?.target?.selectionStart || 0;

    setInputMsg2(value);
    setCursorPosition2(cursorPos);

    if (dataSet && dataSet.current) {
      dataSet.current.set('ruleScopeStr', value);
    }

    // 检查是否输入了斜杠
    checkSlashInput2(value, cursorPos);
  };

  const checkSlashInput = (value, cursorPos) => {
    // 获取光标前的文本
    const textBeforeCursor = value.substring(0, cursorPos);
    // 查找最后一个斜杠的位置
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      // 获取斜杠后的内容作为过滤条件
      const searchText = textBeforeCursor.substring(lastSlashIndex + 1);

      // 检查斜杠后是否有空格（但允许换行符），如果有空格则不显示提示
      if (!searchText.includes(' ') && searchText.length <= 20) {
        setFilterContent(searchText);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const checkSlashInput2 = (value, cursorPos) => {
    // 获取光标前的文本
    const textBeforeCursor = value.substring(0, cursorPos);
    // 查找最后一个斜杠的位置
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      // 获取斜杠后的内容作为过滤条件
      const searchText = textBeforeCursor.substring(lastSlashIndex + 1);

      // 检查斜杠后是否有空格（但允许换行符），如果有空格则不显示提示
      if (!searchText.includes(' ') && searchText.length <= 20) {
        setFilterContent2(searchText);
        setShowSuggestions2(true);
        setSelectedIndex2(0);
      } else {
        setShowSuggestions2(false);
      }
    } else {
      setShowSuggestions2(false);
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredVariables.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredVariables.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredVariables.length - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectedIndex >= 0 && selectedIndex < filteredVariables.length) {
          e.preventDefault();
          selectVariable(filteredVariables[selectedIndex]);
        } else if (e.key === 'Enter') {
          // 如果没有选中的建议项，让Enter键正常换行
          setShowSuggestions(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleKeyDown2 = (e) => {
    if (showSuggestions2 && filteredVariables2.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex2((prev) => (prev < filteredVariables2.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex2((prev) => (prev > 0 ? prev - 1 : filteredVariables2.length - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectedIndex2 >= 0 && selectedIndex2 < filteredVariables2.length) {
          e.preventDefault();
          selectVariable2(filteredVariables2[selectedIndex2]);
        } else if (e.key === 'Enter') {
          // 如果没有选中的建议项，让Enter键正常换行
          setShowSuggestions2(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions2(false);
      }
    }
  };

  const selectVariable = (variable) => {
    // 获取当前文本域的值，从RichTextEditor获取实际的纯文本内容
    const currentValue = textAreaRef.current?.getPlainText?.() || inputMsg || '';

    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const beforeSlash = currentValue.substring(0, lastSlashIndex);
      const afterCursor = currentValue.substring(cursorPosition);

      // 直接插入变量值，不添加 ${} 格式
      const newValue = beforeSlash + variable.value + afterCursor;

      // 更新值
      setInputMsg(newValue);

      if (dataSet && dataSet.current) {
        dataSet.current.set('ruleDetailStr', newValue);
      }

      // 计算新的光标位置（插入内容的最后）
      const newCursorPos = beforeSlash.length + variable.value.length;
      setCursorPosition(newCursorPos);

      // 直接通过ref更新RichTextEditor的值和光标位置
      if (textAreaRef.current && textAreaRef.current.setValueWithCursor) {
        textAreaRef.current.setValueWithCursor(newValue, newCursorPos);
      }
    }

    setShowSuggestions(false);
    setFilterContent('');
  };

  const selectVariable2 = (variable) => {
    // 获取当前文本域的值，从RichTextEditor获取实际的纯文本内容
    const currentValue = textAreaRef2.current?.getPlainText?.() || inputMsg || '';

    const textBeforeCursor = currentValue.substring(0, cursorPosition2);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const beforeSlash = currentValue.substring(0, lastSlashIndex);
      const afterCursor = currentValue.substring(cursorPosition2);

      // 直接插入变量值，不添加 ${} 格式
      const newValue = beforeSlash + variable.value + afterCursor;

      // 更新值
      setInputMsg2(newValue);

      if (dataSet && dataSet.current) {
        dataSet.current.set('ruleScopeStr', newValue);
      }

      // 计算新的光标位置（插入内容的最后）
      const newCursorPos = beforeSlash.length + variable.value.length;
      setCursorPosition2(newCursorPos);

      // 直接通过ref更新RichTextEditor的值和光标位置
      if (textAreaRef2.current && textAreaRef2.current.setValueWithCursor) {
        textAreaRef2.current.setValueWithCursor(newValue, newCursorPos);
      }
    }

    setShowSuggestions2(false);
    setFilterContent2('');
  };

  const ruleId = dataSet?.current?.get('ruleId') ?? '';

  return (
    <Form dataSet={dataSet} labelLayout="float" columns={2}>
      <TextField name="ruleCode" disabled={ruleId} />
      <TextField name="ruleName" />
      <Select name="ruleControlStrategy" />
      <Select name="ruleTarget" />
      {/* <TextField name="ruleScope" colSpan={2} newLine /> */}
      {/* <div className={styles['rule-form-rule-scope-container']} newLine colSpan={2} key="ruleScope">
        <RichTextEditor
          key="ruleScope"
          ref={textAreaRef2}
          id="rule-scope-textarea"
          name="ruleScopeStr"
          value={inputMsg2}
          variables={processVariables || []}
          onChange={handleInput2}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围')}
          onKeyDown={handleKeyDown2}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions2(false), 200);
          }}
        />
        {showSuggestions2 && filteredVariables2.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables2.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex2,
                })}
                onClick={() => selectVariable2(item)}
                onMouseEnter={() => setSelectedIndex2(index)}
              >
                <div className={styles['suggestion-label']}>
                  {`${item.fieldName}(${item.label})`}
                </div>
                <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles['rule-form-textarea-container']} newLine colSpan={2} key="ruleDetail">
        <RichTextEditor
          key="ruleDetail"
          ref={textAreaRef}
          id="rule-detail-textarea"
          name="ruleDetailStr"
          value={inputMsg}
          variables={processVariables || []}
          onChange={handleInput}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get('smbl.checkRules.view.title.ruleDetail').d('规则详情')}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          style={{ height: '160px' }}
        />
        {showSuggestions && filteredVariables.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex,
                })}
                onClick={() => selectVariable(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles['suggestion-label']}>
                  <div>{`${item.fieldName}(${item.label})`}</div>
                  <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
      <div className={styles['rule-form-rule-scope-container']} newLine colSpan={2} key="ruleScope">
        <HighlightRichTextEditor
          key="ruleScope"
          ref={textAreaRef2}
          id="rule-scope-textarea"
          name="ruleScopeStr"
          value={inputMsg2}
          onChange={handleInput2}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围')}
          onKeyDown={handleKeyDown2}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions2(false), 200);
          }}
        />
        {showSuggestions2 && filteredVariables2.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables2.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex2,
                })}
                onClick={() => selectVariable2(item)}
                onMouseEnter={() => setSelectedIndex2(index)}
              >
                <div className={styles['suggestion-label']}>
                  {`${item.fieldName}(${item.label})`}
                </div>
                <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles['rule-form-textarea-container']} newLine colSpan={2} key="ruleDetail">
        <HighlightRichTextEditor
          key="ruleDetail"
          ref={textAreaRef}
          id="rule-detail-textarea"
          name="ruleDetailStr"
          value={inputMsg}
          onChange={handleInput}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get('smbl.checkRules.view.title.ruleDetail').d('规则详情')}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          style={{ height: '160px' }}
        />
        {showSuggestions && filteredVariables.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex,
                })}
                onClick={() => selectVariable(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles['suggestion-label']}>
                  <div>{`${item.fieldName}(${item.label})`}</div>
                  <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Form>
  );
}
