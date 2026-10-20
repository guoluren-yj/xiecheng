import React, { useState, useCallback, useRef } from 'react';
import { Select, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Popover, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import styles from './index.less';

const SelectOption = Select.Option;

const PopoverField = observer(
  ({
    dataSet,
    label,
    name,
    defaultValue,
    clearButton = true,
    onChange = (e) => e,
    type = 'text',
    options = [],
  }) => {
    const [editMode, setEditMode] = useState(false); // 是否是编辑模式
    const [valueText, setValueText] = useState(
      options?.find((item) => item.value === defaultValue)?.meaning
    );
    const [value, setValue] = useState(defaultValue);

    const fieldWrapperRef = useRef();
    const editorRef = useRef();

    const handleChangeValue = useCallback(
      (val) => {
        if (!val) {
          setValueText(val);
          return;
        }
        let newValueText;
        switch (type) {
          case 'select':
            newValueText = options?.find((item) => item.value === val)?.meaning;
            break;
          default:
            newValueText = val;
        }
        setValue(val);
        onChange(val);
        setValueText(newValueText);
      },
      [valueText]
    );

    const handleEditorRef = useCallback((ref) => {
      editorRef.current = ref;
      if (type === PopoverFieldType.text) {
        return false;
      } else if (editorRef.current) {
        if (editorRef.current.focus) {
          editorRef.current.focus();
        } else if (editorRef.current.handleFocus) {
          editorRef.current.handleFocus();
        }
      }
    }, []);

    const handleClickField = useCallback(() => {
      if (type === PopoverFieldType.text) {
        return;
      }
      setEditMode(true);
    }, [editMode]);

    const handlePopupHiddenChange = useCallback(
      (hidden) => {
        if (hidden) {
          setEditMode(false);
        }
      },
      [editMode]
    );

    const handleGetPopupAlignTarget = useCallback(() => {
      return fieldWrapperRef.current;
    }, [editMode]);

    const renderEditor = useCallback(() => {
      const editorProps = {
        dataSet,
        name,
        value,
        ref: handleEditorRef,
        clearButton,
        onChange: handleChangeValue,
      };
      const popoverProps = {
        isFlat: true,
        onPopupHiddenChange: handlePopupHiddenChange,
        getPopupAlignTarget: handleGetPopupAlignTarget,
      };
      switch (type) {
        case 'select':
          return (
            <Select {...editorProps} {...popoverProps} suffix={null}>
              {options.map((item) => (
                <SelectOption value={item.value}>{item.meaning}</SelectOption>
              ))}
            </Select>
          );
        default:
          return (
            <TextField
              {...editorProps}
              placeholder={intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')}
            />
          );
      }
    }, [editMode]);

    const renderWrapper = useCallback(() => {
      // 下拉框
      if (type === PopoverFieldType.select) {
        return rendeField();
      } else {
        return (
          <Popover
            placement="bottomLeft"
            trigger="click"
            overlayClassName={styles['field-poppver']}
            content={renderEditor()}
          >
            {rendeField()}
          </Popover>
        );
      }
    }, [editMode, valueText]);

    const rendeField = useCallback(() => {
      return (
        <span>
          <span className={styles['field-label']}>{label}</span>
          {editMode ? renderEditor() : <span className={styles['field-text']}>{valueText}</span>}
          <Icon className={styles['field-icon']} type="expand_more" />
        </span>
      );
    }, [editMode, valueText]);

    return (
      <span className={styles['field-wrapper']} ref={fieldWrapperRef} onClick={handleClickField}>
        {renderWrapper()}
      </span>
    );
  }
);

export default PopoverField;

export const PopoverFieldType = {
  text: 'text',
  select: 'select',
};
