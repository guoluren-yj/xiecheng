import React, { FC, useState, useCallback, useRef, memo } from 'react';
import { DataSet, Select, TextField } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';

import { PopoverFieldType } from './enum';
import styles from './index.less';

interface IOption {
  value: any;
  meaning: any;
}

interface IPopoverField {
  dataSet: DataSet;
  label: string;
  name: string;
  type: PopoverFieldType;
  options?: IOption[];
}

const SelectOption = Select.Option;

const PopoverField: FC<IPopoverField> = observer(({ dataSet, label, name, type = PopoverFieldType.text, options = [] }) => {
  const [editMode, setEditMode] = useState(false); // 是否是编辑模式
  const [valueText, setValueText] = useState(null);
  const fieldWrapperRef: any = useRef();
  const editorRef: any = useRef();
  const handleChangeValue = useCallback(
    value => {
      if (!value) {
        setValueText(value);
        return;
      }
      let newValueText;
      switch (type) {
        case 'select':
          newValueText = (options.find(item => item.value === value) || {}).meaning;
          break;
        default:
          newValueText = value;
      }
      setValueText(newValueText);
    },
    [valueText]
  );

  const handleEditorRef = useCallback(ref => {
    editorRef.current = ref;
    if (type === PopoverFieldType.text) {
      // eslint-disable-next-line no-useless-return
      return;
    } else if (editorRef.current) {
      if (editorRef.current!.focus) {
        editorRef.current.focus();
      } else if (editorRef.current!.handleFocus) {
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
    hidden => {
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
      ref: handleEditorRef,
      clearButton: true,
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
            {options.map(item => (
              <SelectOption value={item.value}>{item.meaning}</SelectOption>
            ))}
          </Select>
        );
      default:
        return (
          <TextField
            {...editorProps}
            placeholder={intl.get('srm.common.view.message.pleaseInput').d('请输入')}
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
});

export default formatterCollections({ code: ['srm.common'] })(memo(PopoverField));
