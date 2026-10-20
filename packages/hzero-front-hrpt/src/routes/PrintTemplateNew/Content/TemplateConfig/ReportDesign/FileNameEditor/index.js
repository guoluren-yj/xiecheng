import React, { useMemo, useState, useRef, useImperativeHandle } from 'react';
import { Tree, DataSet, TextField } from 'choerodon-ui/pro';
import { Tabs, Text } from 'choerodon-ui';
import uuid from 'uuid/v4';
import { toJS } from 'mobx';

import intl from 'hzero-front/lib/utils/intl';
import { getFixParams, MarkContentItemType, transformExpressionContent } from '../../../../utils';
import styles from './index.less';

export default function FileNameEditor({ templateFields, contentRef, templateName }) {
  const editorRef = useRef();
  const [editorKey, setEditorKey] = useState(uuid());
  const [contentArr, setContentArr] = useState(transformExpressionContent(templateName && templateName.value));

  const templateFieldTreeDs = useMemo(() => {
    return new DataSet({
      primaryKey: 'id',
      parentField: 'parentId',
      idField: 'id',
      data: templateFields,
    });
  }, [templateFields]);
 
  const fixParams = useMemo(() => getFixParams(), []);

  useImperativeHandle(contentRef, () => ({
    submit: () => contentArr,
  }));

  const nodeRenderer = ({ record }) =>  {
    const { name, type, code } = record.get(['name', 'type', 'code']);
    return (
      <Text
        onClick={() => {
          if (type === 'field') {
            handleAddField({ code, name });
          }
        }}
      >
        {name}
      </Text>
    );
  };

  const handleAddField = (field) => {
    let newContentArr = contentArr;
    if (!newContentArr.length) {
      newContentArr = newContentArr.concat({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
      });
    }
    if (newContentArr[newContentArr.length -1].type === MarkContentItemType.VAR) {
      newContentArr = newContentArr.concat({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
      });
    }
    newContentArr = newContentArr.concat({
      key: uuid(),
      type: MarkContentItemType.VAR,
      value: field.code,
      meaning: field.name || field.code,
    }, 
    {
      key: uuid(),
      type: MarkContentItemType.FIX,
      value: undefined,
    }
  );
    setContentArr(newContentArr);
  };

  const handleAddParam = (value) => {
    let newContentArr = contentArr;
    if (!newContentArr.length) {
      newContentArr = newContentArr.concat({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
      });
    }
    if (newContentArr[newContentArr.length -1].type === MarkContentItemType.VAR) {
      newContentArr = newContentArr.concat({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
      });
    }
    newContentArr = newContentArr.concat({
      key: uuid(),
      type: MarkContentItemType.VAR,
      value,
      meaning: fixParams[value] && fixParams[value].meaning || value,
    }, 
    {
      key: uuid(),
      type: MarkContentItemType.FIX,
      value: undefined,
    }
  );
    setContentArr(newContentArr);
  };
  
  const handleChange = (value, index) => {
    const newContentArr = contentArr;
    newContentArr[index].value = value;
    setContentArr(newContentArr);
    setEditorKey(uuid())
  };

  const handleKeyDown = (event, index) => {
    // 删除键
    if (event.key === 'Backspace') {
      if (contentArr[index + 1] && contentArr[index + 1].type === MarkContentItemType.FIX) {
        const value = contentArr[index + 1].value || '';
        const newContentArr = contentArr;
        if (contentArr[index-1] && contentArr[index-1].type === MarkContentItemType.FIX) {
          if (contentArr[index-1].value) {
            newContentArr[index+1] = {
              key: uuid(),
              value: `${contentArr[index-1].value}${value}`,
              type: MarkContentItemType.FIX,
            };
          }
          newContentArr[index-1] = undefined;
        }
        newContentArr[index] = undefined;
        setContentArr(newContentArr.filter(Boolean)); 
      }
    }
  };

  const handleFixKeyDown = (event, index) => {
    // 删除键
    if (event.key === 'Backspace' && event.target.selectionStart === 0) {
      handleKeyDown(event, index-1);
    }
  };

  const handleFocusFixParams = (event, index) => {
    event.stopPropagation();
    if (editorRef.current) {
      const target = editorRef.current.querySelector(`#input-${contentArr[index].key}`);
      if (target) {
        target.focus();
      }
    }
  };

  const handleFocusEditor = (event) => {
    event.stopPropagation();
    if (editorRef.current) {
      const lastContentItem = contentArr[contentArr.length -1];
      if (!lastContentItem) {
        return ;
      }
      const target = editorRef.current.querySelector(`#input-${lastContentItem.key}`);
      if (target) {
        target.focus();
      }
    }
  };

  return (
    <div className={styles['file-name-modal']} ref={editorRef}>
      <div className={styles['file-name-modal-left']} key={editorKey} onClick={handleFocusEditor}>
        {contentArr.map((item, index) => 
          item.type === MarkContentItemType.FIX
            ? (
              <TextField
                id={`input-${item.key}`}
                key={item.key}
                border={false}
                isFlat
                trim='none'
                value={item.value}
                placeholder={contentArr.length === 1 && intl.get('hrpt.reportDesign.model.waterMask.content.placeholder').d('编辑区')}
                onClick={event => event.stopPropagation()}
                onChange={value => handleChange(value, index)}
                onKeyDown={event => handleFixKeyDown(event, index)}
              />
            ): (
              <span
                key={item.key}
                style={{ userSelect: 'none', backgroundColor: '#ccc', marginRight: '2px', padding: '0 2px', display: 'inline-block', lineHeight: '18px' }}
                onClick={(event) => handleFocusFixParams(event, index)}
              >
                {item.meaning}
                <input
                  id={`input-${item.key}`}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onBlur={(event) => event.target.style.opacity = '1'}
                  style={{ width: '1px', padding: 0, border: 'none', outline: 'none', background: 'transparent'}}
                  onInput={event => event.preventDefault()}
                  value=''
                />
              </span>
            )
        )}
      </div>
      <div className={styles['file-name-modal-right']}>
        <Tabs flex>
          <Tabs.TabPane tab={intl.get('hrpt.printTemplate.view.title.templateParam').d('模板参数')}>
            <Tree
              dataSet={templateFieldTreeDs}
              renderer={nodeRenderer}
              selectable={false}
              showLine={{
                showLeafIcon: false
              }}
              defaultExpandAll
              className={styles['field-tree']}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={intl.get('hrpt.reportDesign.model.waterMask.content.contextParam').d('默认参数')}>
            {Object.keys(fixParams).map(paramKey => (
              <div className={styles['fix-param']} onClick={() => handleAddParam(paramKey)}>
                <Text>
                  {fixParams[paramKey].meaning}
                </Text>
              </div>
            ))}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  )
};