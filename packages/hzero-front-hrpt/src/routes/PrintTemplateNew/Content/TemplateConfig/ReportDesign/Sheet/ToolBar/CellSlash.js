import React, { useMemo, useState, useCallback } from 'react';
import classnames from 'classnames';
import {
  Modal,
  Form,
  TextField,
  DataSet,
  ColorPicker,
} from 'choerodon-ui/pro';
import { Select, Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import CellSlashSvg from '@/assets/sheet/cellSlash.svg';
import { borderStyleData } from '../../utils/constant';
import { exitEditMode, transformRGBColor } from '../../utils/utils';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-cellSlash';

export default function BgColor({ item, sheetRef, disabled }) {
  const { name, type, title, options } = item;
  const [value, setValue] = useState();
  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'fieldValue',
          label: intl
            .get('hrpt.reportDesign.view.tooltip.cellSlashTips')
            .d('斜线文字以|分隔，如：学生|学科'),
          validator: (value) => {
            if (!value || !value.includes('|')) {
              return intl
                .get('hrpt.reportDesign.view.tooltip.cellSlashTitleNotCorrect')
                .d('斜线文字需包含|分隔符');
            }
          },
        },
        {
          name: 'lineStyle',
          label: intl.get('hrpt.reportDesign.view.label.lineStyle').d('线条样式'),
        },
        {
          name: 'lineColor',
          label: intl.get('hrpt.reportDesign.view.label.lineColor').d('线条颜色'),
          type: 'color',
        },
      ],
    });
  }, []);

  const changeItem = useCallback((borderItem) => {
    setValue(borderItem);
  }, []);

  const handleOk = useCallback(async () => {
    const flag = await formDs.validate();
    if (!flag) {
      return false;
    }
    if (!formDs.current) {
      return false;
    }
    const { fieldValue, lineStyle, lineColor } = formDs.current.get([
      'fieldValue',
      'lineStyle',
      'lineColor',
    ]);
    sheetRef.current.setCellSlash({
      title: (fieldValue || "").split('|'),
      style: lineStyle,
      color: transformRGBColor(lineColor),
    });
    return true;
  }, [formDs]);

  const changeBorderStyle = useCallback(
    (style) => {
      if (!formDs.current) {
        formDs.create();
      }
      formDs.current.set('lineStyle', style);
    },
    [formDs]
  );

  const openModal = useCallback(() => {
    formDs.loadData([{ lineStyle: '1', lineColor: '#000' }]);
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.button.cellSlashConfig').d('单元格斜线设置'),
      children: (
        <div>
          <Form labelLayout={'vertical'} dataSet={formDs} className={styles[`${clsPrefix}-form`]}>
            <TextField name="fieldValue" />
            <ColorPicker name="lineColor" />
            <Select name="lineStyle" onChange={changeBorderStyle}>
              {borderStyleData.map((data) => (
                <Select.Option value={data.value}>
                  {data.img}
                </Select.Option>
              ))}
            </Select>
          </Form>
        </div>
      ),
      onOk: handleOk,
    });
  }, [formDs, changeBorderStyle, borderStyleData, handleOk]);

  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: disabled,
        })}
        disabled={disabled}
        onClick={openModal}
      >
        <img src={CellSlashSvg} />
      </div>
    </Tooltip>
  );
}
