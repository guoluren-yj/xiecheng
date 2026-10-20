/**
 * MultipleTextSplitInput - 自动将一段长文本切分成多段文本的输入框组件,默认按照换行符切分
 */
import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { TextField, Icon } from 'choerodon-ui/pro';
import type { TextFieldProps } from 'choerodon-ui/pro/lib/text-field/TextField';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import styles from './index.less';

interface IProps extends TextFieldProps {
  splitBy?: 'string',
}

const MultipleTextSplitInput = observer((props: IProps) => {
  const { dataSet, record, className, name = '', splitBy } = props;

  const handlePasteText = (event) => {
    try {
      const pasteText = event.clipboardData.getData('text');
      if (pasteText) {
        event.preventDefault();
        const newValue = pasteText.split(splitBy || '\n').map(v => v ? v.replace(/[\t,\r]/g, '') : '').filter(v => v && Boolean(v.trim()));
        let current = record || (dataSet && dataSet.current);
        if (!current && dataSet) {
          current = dataSet.create();
        }
        if (current) {
          const oldValue = current.get(name) || [];
          current.set(name, oldValue.concat(newValue));
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  return (
    <TextField
      clearButton
      prefix={<Icon type="search" />}
      valueChangeAction={ValueChangeAction.blur}
      {...props}
      multiple
      className={classNames(styles.search, className)}
      onPaste={handlePasteText}
    />
  );
});

MultipleTextSplitInput.displayName = 'MultipleTextSplitInput';

export default MultipleTextSplitInput;
