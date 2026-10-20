import React, { useRef, useMemo, useState, useImperativeHandle } from 'react';
import { Tabs, TextField } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import { FieldTrim } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import uuid from 'uuid/v4';
import { toJS } from 'mobx';

import { transformMarkContent, MarkContentItemType } from '../util'; 
import { getWatermarkFixParams } from '../../utils';
import styles from './index.less';

function WaterMaskContent({ record, name, contentRef }) {
  const editorRef = useRef<any>();
  const [editorKey, setEditorKey] = useState(uuid());
  const [contentArr, setContentArr] = useState<{
    key: string;
    type: string;
    value?: string;
    meaning?: string;
  }[]>(transformMarkContent(record && toJS(record.get(name))));

  const fixParams = useMemo(() => getWatermarkFixParams(), []);

  useImperativeHandle(contentRef, () => ({
    submit: () => contentArr,
  }));

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
    const newContentArr: any = contentArr;
    newContentArr[index].value = value;
    setContentArr(newContentArr);
    setEditorKey(uuid())
  };

  const handleKeyDown = (event, index) => {
    // 删除键
    if (event.key === 'Backspace') {
      if (contentArr[index + 1] && contentArr[index + 1].type === MarkContentItemType.FIX) {
        const value = contentArr[index + 1].value || '';
        const newContentArr: any = contentArr;
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
    <div className={styles['water-mask-content-editor']} ref={editorRef}>
      <div className={styles['water-mask-content-editor-left']} key={editorKey} onClick={handleFocusEditor}>
        {contentArr.map((item, index) => 
          item.type === MarkContentItemType.FIX
            ? (
              <TextField
                id={`input-${item.key}`}
                key={item.key}
                border={false}
                isFlat
                trim={FieldTrim.none}
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
      <div className={styles['water-mask-content-editor-right']}>
        <Tabs flex>
          <Tabs.TabPane tab={intl.get('hrpt.reportDesign.model.waterMask.content.contextParam').d('默认参数')}>
            {Object.keys(fixParams).map(paramKey => (
              <div className={styles['water-mask-content-editor-param']} onClick={() => handleAddParam(paramKey)}>
                <Text>
                  {fixParams[paramKey].meaning}
                </Text>
              </div>
            ))}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default WaterMaskContent;