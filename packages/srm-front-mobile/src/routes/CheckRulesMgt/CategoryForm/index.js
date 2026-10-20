/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useRef } from 'react';
import { TextField, Form, IntlField, Lov, NumberField } from 'choerodon-ui/pro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import classNames from 'classnames';

import {
  fetFieldsList,
  fetchCategoryDetail,
  fetchVisibleRoleList,
} from '@/services/checkRuleService';
import HighlightRichTextEditor from './HighlightRichTextEditor';
import styles from './index.less';

export default function CategoryForm(props) {
  const { processCategoryDS, localRecord, onCacheFieldsList = () => {} } = props;
  const [inputMsg, setInputMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterContent, setFilterContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [alertFieldsList, setAlertFieldsList] = useState([]);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (localRecord) {
      handleInitFialds(localRecord);
    }
  }, []);

  const formatQueryList = (list, alertFields) => {
    if (list && list.length && alertFields && alertFields.length) {
      // 处理规则数据，去除 ruleScope 和 scopeTitle 中的 fieldPrefix
      processCategoryDS.forEach((record, index) => {
        const item = list[index];
        if (item) {
          // 处理 scopeTitle
          if (item.scopeTitle) {
            const processedRuleDetail = removeFieldPrefix(item.scopeTitle);
            record.set('scopeTitle', processedRuleDetail);
          }
        }

        record.status = 'sync';
      });
    }
  };

  /**
   * 根据文本的字段编码，替换为字段名称
   * @param {*} text 文本
   * @param {*} fieldsList 字段列表
   * @returns
   */
  const getNameDetailByCode = (text, fieldsList = alertFieldsList) => {
    if (!text || !fieldsList || fieldsList.length === 0) {
      return text;
    }

    let result = text;

    // 遍历字段列表，优先替换带有 prefix 的完整字段编码，然后替换纯字段编码
    const sortedVariables = [...fieldsList].sort((a, b) => {
      const aFull =
        a.fieldPrefix && a.fieldCode ? `${a.fieldPrefix}_${a.fieldCode}` : a.fieldCode || '';
      const bFull =
        b.fieldPrefix && b.fieldCode ? `${b.fieldPrefix}_${b.fieldCode}` : b.fieldCode || '';
      return bFull.length - aFull.length;
    });

    sortedVariables.forEach((field) => {
      const { fieldName, fieldCode, fieldPrefix } = field;
      if (fieldName && fieldCode) {
        if (fieldPrefix) {
          const fullCode = `${fieldPrefix}_${fieldCode}`;
          const regexFull = new RegExp(fullCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          result = result.replace(regexFull, fieldName);
        }
        // 使用全局替换，将所有匹配的字段编码替换为字段名称
        const regex = new RegExp(fieldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, fieldName);
      }
    });

    return result;
  };

  const handleInitFialds = async (record) => {
    if (record) {
      let currentFieldsList = [];
      if (record?.documentCode) {
        const res = await fetFieldsList({
          documentCode: record?.documentCode,
        });

        if (getResponse(res)) {
          const fields = res?.content ?? [];

          const formatFields = fields.map((item) => ({
            ...item,
            label: item?.fieldCode,
            value: item?.fieldName,
          }));
          currentFieldsList = [...formatFields];
          setAlertFieldsList(currentFieldsList);
          onCacheFieldsList(currentFieldsList);
          if (processCategoryDS?.length) {
            const list = processCategoryDS?.toData();
            formatQueryList(list, currentFieldsList);
          }
        }
      }

      if (!record.categoryId) {
        // 新建
        processCategoryDS.loadData([{ ...record, tenantId: getCurrentOrganizationId() }]);
      } else {
        const res2 = await fetchCategoryDetail({
          categoryId: record.categoryId,
        });
        const roleRes = await fetchVisibleRoleList({ ids: res2?.roleId });
        const { content = [] } = roleRes || {};

        if (getResponse(res2)) {
          if (res2.scopeTitle) {
            // 处理 scopeTitle
            const processedScopeTitle = removeFieldPrefix(res2.scopeTitle);
            res2.scopeTitleStr = getNameDetailByCode(processedScopeTitle, currentFieldsList);
          }

          const scopeTitleStr = res2?.scopeTitleStr || '';
          setInputMsg(scopeTitleStr);
          const roleIds = res2?.roleId?.split(',') || [];
          const roleObj = [];

          if (content?.length && roleIds?.length) {
            content.forEach((item) => {
              roleIds.forEach((id) => {
                if (Number(id) === Number(item.id)) {
                  roleObj.push({
                    id: Number(item.id),
                    roleId: Number(item.id),
                    roleName: item.roleName,
                    roleCode: item.roleCode,
                  });
                }
              });
            });
          }

          const newObj = {
            ...res2,
            roleIds: roleIds.map((id) => Number(id)),
            roleObj: roleObj.map((item) => ({
              ...item,
              roleId: Number(item.roleId),
              id: Number(item.id),
            })),
          };

          processCategoryDS.loadData([{ ...newObj }]);

          if (scopeTitleStr && currentFieldsList.length > 0) {
            setTimeout(() => {
              if (textAreaRef.current && textAreaRef.current.setHighlightRanges) {
                const allMatches = [];
                // 解析高亮范围
                currentFieldsList.forEach((field) => {
                  const { fieldName, fieldCode, fieldPrefix } = field;
                  if (fieldName) {
                    const escapedName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedName, 'g');
                    let match;
                    while ((match = regex.exec(scopeTitleStr)) !== null) {
                      allMatches.push({
                        start: match.index,
                        end: match.index + fieldName.length,
                        value: fieldName,
                        fieldCode,
                        fieldPrefix: fieldPrefix || '',
                      });
                    }
                  }
                });

                // 按开始位置排序，如果开始位置相同则按长度降序排序（优先匹配更长的词）
                allMatches.sort((a, b) => {
                  if (a.start !== b.start) {
                    return a.start - b.start;
                  }
                  return b.end - a.end;
                });

                // 过滤重叠的匹配项
                const ranges = [];
                let lastEnd = 0;
                allMatches.forEach((match) => {
                  // 如果当前匹配项的开始位置在由上一个匹配项结束位置之后（或重合），则认为不重叠
                  // 注意：这里简单的丢弃重叠项，优先保留靠前的（或者同位置更长的）
                  if (match.start >= lastEnd) {
                    ranges.push(match);
                    lastEnd = match.end;
                  }
                });

                textAreaRef.current.setHighlightRanges(ranges);
              }
            }, 100);
          }
        }
      }
    }
  };

  const selectVariable = (variable) => {
    // 获取当前文本域的值，从RichTextEditor获取实际的纯文本内容
    const currentValue = textAreaRef.current?.getPlainText?.() || inputMsg || '';

    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      if (textAreaRef.current && textAreaRef.current.insertHighlightVariable) {
        // 使用 insertHighlightVariable 方法插入带高亮的变量
        // 参数: variableValue, startPos, fieldCode, fieldPrefix, endPos
        textAreaRef.current.insertHighlightVariable(
          variable.value,
          lastSlashIndex,
          variable.fieldCode || variable.label,
          variable.fieldPrefix,
          cursorPosition
        );
      } else {
        const beforeSlash = currentValue.substring(0, lastSlashIndex);
        const afterCursor = currentValue.substring(cursorPosition);

        // 直接插入变量值，不添加 ${} 格式
        const newValue = beforeSlash + variable.value + afterCursor;

        // 更新值
        setInputMsg(newValue);

        if (processCategoryDS && processCategoryDS.current) {
          processCategoryDS.current.set('scopeTitleStr', newValue);
        }

        // 计算新的光标位置（插入内容的最后）
        const newCursorPos = beforeSlash.length + variable.value.length;
        setCursorPosition(newCursorPos);

        // 直接通过ref更新RichTextEditor的值和光标位置
        if (textAreaRef.current && textAreaRef.current.setValueWithCursor) {
          textAreaRef.current.setValueWithCursor(newValue, newCursorPos);
        }
      }
    }

    setShowSuggestions(false);
    setFilterContent('');
  };

  const handleInput = (e) => {
    const value = e?.target?.value || '';
    const valueWithCodes = e?.target?.valueWithCodes;
    const cursorPos = e?.target?.selectionStart || 0;

    setInputMsg(value);
    setCursorPosition(cursorPos);

    if (processCategoryDS && processCategoryDS.current) {
      processCategoryDS.current.set('scopeTitleStr', value);
      if (valueWithCodes !== undefined) {
        processCategoryDS.current.set('scopeTitle', valueWithCodes);
      } else {
        processCategoryDS.current.set('scopeTitle', value);
      }
    }

    // 检查是否输入了斜杠
    checkSlashInput(value, cursorPos);
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

  // 根据输入内容过滤变量列表
  const filteredVariables = alertFieldsList.length
    ? alertFieldsList.filter((item) =>
        item.label.toLowerCase().includes(filterContent.toLowerCase())
      )
    : [];

  /**
   * 去除文本中的 fieldPrefix 部分
   * @param {string} text - 原始文本
   * @returns {string} 处理后的文本
   */
  const removeFieldPrefix = (text) => {
    // 不再移除 prefix，以保留 fieldPrefix_fieldCode 供高亮匹配使用，避免同名字段歧义
    return text;
  };

  return (
    <Form dataSet={processCategoryDS} labelLayout="float" columns={1}>
      <TextField name="categoryCode" disabled={localRecord?.categoryId} />
      <IntlField name="categoryName" />
      <div className={styles['rule-form-textarea-container']} newLine colSpan={2} key="scopeTitle">
        <HighlightRichTextEditor
          key="scopeTitle"
          ref={textAreaRef}
          id="rule-category-form-textarea"
          name="scopeTitleStr"
          value={inputMsg}
          onChange={handleInput}
          filteredVariables={alertFieldsList}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          scopeTitle={intl.get('smbl.checkRules.view.title.scopeTitle').d('审核范围定义')}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          style={{ height: '160px' }}
        />
        {showSuggestions && filteredVariables.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables.map((item2, index) => (
              <div
                key={item2.label}
                className={classNames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex,
                })}
                onClick={() => selectVariable(item2)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles['suggestion-label']}>
                  <div>{`${item2.fieldName}(${item2.label})`}</div>
                  <div className={styles['suggestion-desc']}>{item2.fieldDesc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {getCurrentOrganizationId() !== 0 ? <Lov name="roleObj" /> : null}
      <NumberField name="sort" />
    </Form>
  );
}
