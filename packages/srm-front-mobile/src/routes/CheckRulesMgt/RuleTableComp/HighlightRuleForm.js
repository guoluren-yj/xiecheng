/* eslint-disable no-template-curly-in-string */
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';

import { Form, TextField, Select, IntlField, Table, Button, Switch } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { fetchAiOptimizeRule } from '@/services/checkRuleService';
import HighlightRichTextEditor from './HighlightRichTextEditor';
import styles from './RuleForm.less';

let switchChange = false;

const HighlightRuleForm = forwardRef(
  ({ dataSet, processVariables = [], visibleRoleListDS }, ref) => {
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
    const [selectFieldFlag, setSelectFieldFlag] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const textAreaRef2 = useRef(null);
    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    useEffect(() => {
      return () => {
        switchChange = false;
      };
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      // 获取规则详情的处理后内容（将高亮变量替换为 fieldCode）
      getRuleDetailWithFieldCodes: () => {
        return textAreaRef.current?.getTextWithFieldCodes?.() || inputMsg;
      },
      // 获取规则范围的处理后内容（将高亮变量替换为 fieldCode）
      getRuleScopeWithFieldCodes: () => {
        return textAreaRef2.current?.getTextWithFieldCodes?.() || inputMsg2;
      },
      // 获取原始内容
      getRuleDetailPlainText: () => {
        return textAreaRef.current?.getPlainText?.() || inputMsg;
      },
      getRuleScopePlainText: () => {
        return textAreaRef2.current?.getPlainText?.() || inputMsg2;
      },
      // 获取高亮范围列表
      getHighlightRanges: () => {
        return textAreaRef.current?.getHighlightRanges?.() || [];
      },
      getHighlightRanges2: () => {
        return textAreaRef2.current?.getHighlightRanges?.() || [];
      },
    }));

    useEffect(() => {
      if (refresh) {
        setRefresh(false);
      }
    }, [refresh]);

    useEffect(() => {
      if (dataSet && dataSet.current) {
        // 使用原始数据而不是转换后的数据，这样可以保留 fieldCode 信息
        const ruleDetail = dataSet?.current?.get('ruleDetail') ?? '';
        const ruleScope = dataSet?.current?.get('ruleScope') ?? '';

        setInputMsg(ruleDetail);
        setInputMsg2(ruleScope);

        // 解析现有的高亮内容并设置编辑器的值
        if (textAreaRef.current && ruleDetail) {
          // 直接解析并高亮现有的 fieldCode，不先设置 value
          parseAndHighlightExistingContent(textAreaRef.current, ruleDetail, processVariables);
        }

        if (textAreaRef2.current && ruleScope) {
          // 直接解析并高亮现有的 fieldCode，不先设置 value
          parseAndHighlightExistingContent(textAreaRef2.current, ruleScope, processVariables);
        }
      }
    }, [dataSet, processVariables]);

    // 解析现有内容中的 fieldCode 并添加高亮
    const parseAndHighlightExistingContent = (editor, content, variables) => {
      if (!editor || !content) {
        return;
      }

      if (!variables || variables.length === 0) {
        if (editor.setValueWithCursor) {
          editor.setValueWithCursor(content, 0);
        }
        if (editor.setHighlightRanges) {
          editor.setHighlightRanges([]);
        }
        return;
      }

      // 创建 fieldPrefix_fieldCode 和变量的映射
      const codeToVariableMap = {};
      variables
        .filter((v) => v.fieldPrefix && v.fieldCode)
        .forEach((v) => {
          const fullCode = `${v.fieldPrefix}_${v.fieldCode}`;
          codeToVariableMap[fullCode] = v;
        });

      // 查找所有匹配的 fieldPrefix_fieldCode
      const matches = [];
      Object.keys(codeToVariableMap).forEach((code) => {
        const regex = code ? new RegExp(escapeRegExp(code), 'g') : null;
        let match;
        while ((match = regex.exec(content)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            value: match[0],
            variable: codeToVariableMap[code],
          });
        }
      });

      if (matches.length === 0) {
        if (editor.setValueWithCursor) {
          editor.setValueWithCursor(content, 0);
        }
        if (editor.setHighlightRanges) {
          editor.setHighlightRanges([]);
        }
        return;
      }

      const validMatches = matches
        .sort((a, b) => {
          if (a.start !== b.start) {
            return a.start - b.start;
          }
          return b.value.length - a.value.length;
        })
        .reduce((list, match) => {
          const lastMatch = list[list.length - 1];

          if (!lastMatch || match.start >= lastMatch.end) {
            list.push(match);
          }

          return list;
        }, []);

      const highlightRanges = [];
      const contentParts = [];
      let lastIndex = 0;
      let currentDisplayIndex = 0;

      validMatches.forEach((match) => {
        const fieldName = match.variable.fieldName || match.value;
        const beforeText = content.substring(lastIndex, match.start);

        contentParts.push(beforeText, fieldName);
        currentDisplayIndex += beforeText.length;

        highlightRanges.push({
          start: currentDisplayIndex,
          end: currentDisplayIndex + fieldName.length,
          fieldCode: match.variable.fieldCode || match.value,
          fieldPrefix: match.variable.fieldPrefix || '',
          value: fieldName,
        });

        currentDisplayIndex += fieldName.length;
        lastIndex = match.end;
      });

      contentParts.push(content.substring(lastIndex));
      const newContent = contentParts.join('');

      if (editor.setValueWithCursor) {
        editor.setValueWithCursor(newContent, 0);
      }

      setTimeout(() => {
        if (editor.setHighlightRanges) {
          editor.setHighlightRanges(highlightRanges);
        }
      }, 50);
    };

    // 根据输入内容过滤变量列表
    const filteredVariables = processVariables.length
      ? processVariables.filter(
          (item) =>
            item.label.toLowerCase().includes(filterContent.toLowerCase()) ||
            item.value.toLowerCase().includes(filterContent.toLowerCase())
        )
      : [];

    // 根据输入内容过滤变量列表
    const filteredVariables2 = processVariables.length
      ? processVariables.filter(
          (item) =>
            item.label.toLowerCase().includes(filterContent2.toLowerCase()) ||
            item.value.toLowerCase().includes(filterContent2.toLowerCase())
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
      // 获取当前文本域的值，从HighlightRichTextEditor获取实际的纯文本内容
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

        // 使用HighlightRichTextEditor的方法
        if (textAreaRef.current) {
          // 直接插入高亮变量，替换从斜杠到光标位置的内容
          const newCursorPosition = textAreaRef.current.insertHighlightVariable(
            variable.value,
            lastSlashIndex, // 从斜杠位置开始替换
            variable.label, // 使用 fieldCode 作为第三个参数
            variable.fieldPrefix,
            cursorPosition // 替换到光标位置
          );

          // 设置最终的光标位置
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.focus();
              setCursorPosition(newCursorPosition);
            }
          }, 60);
        }
      }

      setShowSuggestions(false);
      setFilterContent('');
    };

    const selectVariable2 = (variable) => {
      // 获取当前文本域的值，从HighlightRichTextEditor获取实际的纯文本内容
      const currentValue = textAreaRef2.current?.getPlainText?.() || inputMsg2 || '';

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

        // 使用HighlightRichTextEditor的方法
        if (textAreaRef2.current) {
          // 直接插入高亮变量，替换从斜杠到光标位置的内容
          const newCursorPosition = textAreaRef2.current.insertHighlightVariable(
            variable.value,
            lastSlashIndex, // 从斜杠位置开始替换
            variable.label, // 使用 fieldCode 作为第三个参数
            variable.fieldPrefix,
            cursorPosition2 // 替换到光标位置
          );

          // 设置最终的光标位置
          setTimeout(() => {
            if (textAreaRef2.current) {
              textAreaRef2.current.focus();
              setCursorPosition2(newCursorPosition);
            }
          }, 60);
        }
      }

      setShowSuggestions2(false);
      setFilterContent2('');
    };

    const columns = () => {
      return [
        {
          name: 'tenantObj',
          editor: true,
        },
        { name: 'roleCode' },
      ];
    };

    const handleCreateRow = () => {
      visibleRoleListDS.create({ ruleId }, null);
    };

    const handleBatchDelete = () => {
      if (visibleRoleListDS.selected.length > 0) {
        visibleRoleListDS.remove(visibleRoleListDS.selected, true);
      }
    };

    const buttons = () => {
      return [
        <Button icon="playlist_add" onClick={handleCreateRow} key="add">
          {intl.get('smbl.checkRules.model.add').d('新增')}
        </Button>,
        <Button key="delete" icon="delete_sweep" onClick={handleBatchDelete}>
          {intl.get('smbl.checkRules.model.batchDelete').d('批量删除')}
        </Button>,
      ];
    };

    const ruleId = dataSet?.current?.get('ruleId') ?? '';

    /**
     * 根据文本的字段编码，替换为字段名称
     * @param {*} text 文本
     * @returns
     */
    const getNameDetailByCode = (text) => {
      if (!text || !processVariables || processVariables.length === 0) {
        return text;
      }

      let result = text;

      // 遍历字段列表，仅替换带有 prefix 的完整字段编码
      const sortedVariables = [...processVariables]
        .filter((field) => field.fieldPrefix && field.fieldCode)
        .sort((a, b) => {
          const aFull = `${a.fieldPrefix}_${a.fieldCode}`;
          const bFull = `${b.fieldPrefix}_${b.fieldCode}`;
          return bFull.length - aFull.length;
        });

      sortedVariables.forEach((field) => {
        const { fieldName, fieldCode, fieldPrefix } = field;
        if (fieldName && fieldCode && fieldPrefix) {
          const fullCode = `${fieldPrefix}_${fieldCode}`;
          const regexFull = new RegExp(escapeRegExp(fullCode), 'g');
          result = result.replace(regexFull, fieldName);
        }
      });

      return result;
    };

    /**
     * 去除文本中的 fieldPrefix 部分
     * @param {string} text - 原始文本
     * @returns {string} 处理后的文本
     */
    const removeFieldPrefix = (text) => {
      // 不再移除 prefix，以保留 fieldPrefix_fieldCode 供高亮匹配使用，避免同名字段歧义
      return text;
    };

    const handleAutoFix = async (text, type) => {
      if (!text) return false;
      const processType = {
        ruleScope: 'rulesScope',
        ruleDetail: 'rulesDetails',
      };
      try {
        // 发送给后端的请求
        const res = await fetchAiOptimizeRule({ inputText: text, targetField: processType[type] });

        if (!res?.failed) {
          const obj = dataSet?.toData()[0] || {};
          const newContent = res?.data ?? '';
          const nowConteneStr = removeFieldPrefix(newContent);
          const displayContent = getNameDetailByCode(nowConteneStr);
          const targetEditor = type === 'ruleScope' ? textAreaRef2.current : textAreaRef.current;

          dataSet.loadData([
            {
              ...obj,
              [type]: nowConteneStr,
              [`${type}Str`]: displayContent,
            },
          ]);

          if (targetEditor) {
            parseAndHighlightExistingContent(targetEditor, nowConteneStr, processVariables);
          }

          return displayContent;
        }
      } catch (error) {
        console.error(error);
      }
      return false;
    };

    const handleSwitch = () => {
      switchChange = true;
    };

    /**
     * 同步规则详情编辑器的高亮范围状态，确保流程变量变化后界面立即刷新
     * @param {Array} ranges 高亮范围列表
     */
    const handleRuleDetailHighlightChange = (ranges) => {
      const hasHighlight = Array.isArray(ranges) && ranges.length > 0;
      setSelectFieldFlag(hasHighlight);
      if (hasHighlight && dataSet?.current) {
        dataSet.current.set('referFileFlag', null);
      }
    };

    // 失焦
    const handleBlur = () => {
      // 获取当前的高亮范围列表
      const highlightRanges = textAreaRef.current?.getHighlightRanges?.() || [];

      console.log(' 111 === : ', highlightRanges);

      // 如果高亮范围列表不为空，说明选择了流程变量（高亮内容）
      const hasHighlight = highlightRanges.length > 0 ? 1 : 0;
      setSelectFieldFlag(hasHighlight === 1);
      if (hasHighlight === 1) {
        if (dataSet?.current) {
          dataSet.current.set('referFileFlag', null);
        }
        return;
      }
      if (dataSet && dataSet.current && !switchChange && dataSet.current.get('referFileFlag') !== 0) {
        dataSet.current.set('referFileFlag', 1);
      }
    };

    console.log(' 222 === : ', selectFieldFlag);

    return (
      <>
        <div className={styles['rule-form-title']} style={{ marginBottom: '16px' }}>
          {intl.get('smbl.checkRules.model.basicInfo').d('基础信息')}
        </div>
        <Form dataSet={dataSet} labelLayout="float" columns={2}>
          <TextField name="ruleCode" disabled={ruleId} />
          <IntlField name="ruleName" />
          <Select name="ruleControlStrategy" />
          <Select name="ruleTarget" />

          <div
            className={styles['rule-form-rule-scope-container']}
            newLine
            colSpan={2}
            key="ruleScope"
          >
            <HighlightRichTextEditor
              key="ruleScope"
              ref={textAreaRef2}
              id="rule-scope-textarea"
              name="ruleScopeStr"
              value={inputMsg2}
              filteredVariables={filteredVariables2}
              onChange={handleInput2}
              placeholder={intl
                .get('smbl.checkRules.view.title.ruleScopePlaceholder')
                .d(
                  '键入“/”插入具体流程变量以限定适用范围，避免输入纯数字、占位符式文本等无意义的测试字符。'
                )}
              ruleDetail={intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围')}
              onKeyDown={handleKeyDown2}
              onBlur={() => {
                // 延迟隐藏，以便点击选项时能正常工作
                setTimeout(() => setShowSuggestions2(false), 200);
              }}
              style={{ height: '100px' }}
              onAutoFix={(text) => handleAutoFix(text, 'ruleScope')}
            />
            {showSuggestions2 && filteredVariables2.length > 0 && (
              <div className={styles['rule-form-suggestions-popup']}>
                {filteredVariables2
                  .filter((item) => item.fieldProperty !== 'ATTACHMENT')
                  .map((item, index) => (
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

          <div
            className={styles['rule-form-textarea-container']}
            newLine
            colSpan={2}
            key="ruleDetail"
          >
            <HighlightRichTextEditor
              key="ruleDetail"
              ref={textAreaRef}
              id="rule-detail-textarea"
              name="ruleDetailStr"
              value={inputMsg}
              filteredVariables={filteredVariables}
              onChange={handleInput}
              placeholder={intl
                .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
                .d(
                  '键入“/”插入流程变量以描述完整规则，避免仅做名词解释、罗列业务背景或输入无意义文本。'
                )}
              ruleDetail={intl.get('smbl.checkRules.view.title.ruleDetail').d('规则详情')}
              onHighlightRangesChange={handleRuleDetailHighlightChange}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                handleBlur();
                // 延迟隐藏，以便点击选项时能正常工作
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              style={{ height: '160px' }}
              onAutoFix={(text) => handleAutoFix(text, 'ruleDetail')}
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
          {!selectFieldFlag ? <Switch name="referFileFlag" onChange={handleSwitch} /> : null}
        </Form>
        <div
          className={styles['rule-form-title']}
          style={{ marginTop: '32px', marginBottom: '16px' }}
        >
          {intl.get('smbl.checkRules.model.visibleRoleList').d('可见该分类下规则的默认值')}
        </div>
        <Table
          dataSet={visibleRoleListDS}
          columns={columns()}
          queryBar="none"
          buttons={buttons()}
        />
      </>
    );
  }
);

HighlightRuleForm.displayName = 'HighlightRuleForm';

export default HighlightRuleForm;
