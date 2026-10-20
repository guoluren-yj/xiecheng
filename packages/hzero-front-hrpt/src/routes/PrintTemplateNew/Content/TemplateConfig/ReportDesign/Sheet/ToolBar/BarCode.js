import React, { useMemo, useCallback } from 'react';
import classnames from 'classnames';
import {
  Modal,
  TextField,
  DataSet,
  Select,
  Form,
  Switch,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';

import barcodeSvg from '@/assets/sheet/barcode.svg';
import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-barcode';

export default function BarCode({ cell, item, sheetRef, disabled }) {
  const { name, type, title, options } = item;
  const isFieldCell = useMemo(() => cell && cell.value && cell.value.extra, [cell]);
  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }
    const formDs = new DataSet({
      fields: [
        {
          name: 'content',
          label: intl.get('hrpt.reportDesign.view.title.content').d('内容'),
          required: true,
        },
        {
          name: 'format',
          label: intl.get('hrpt.reportDesign.view.title.label').d('格式'),
          required: true,
          defaultValue: 'CODE128',
        },
        {
          name: 'width',
          label: intl.get('hrpt.reportDesign.view.title.width').d('宽度'),
          required: true,
          defaultValue: 2,
        },
        {
          name: 'height',
          label: intl.get('hrpt.reportDesign.view.title.height').d('高度'),
          required: true,
          defaultValue: 10,
        },
        {
          name: 'isCell',
          label: intl.get('hrpt.reportDesign.view.title.inCell').d('单元格内'),
          type: 'boolean',
          disabled: !!isFieldCell,
        },
        {
          name: 'isFloat',
          label: intl.get('hrpt.reportDesign.view.title.float').d('浮动'),
          type: 'boolean',
        },
      ],
      events: {
        update: ({ record, name, value }) => {
          if (name === 'isCell' && value) {
            record.set('isFloat', false);
          }
          if (name === 'isFloat' && value) {
            record.set('isCell', false);
          }
        },
      },
    });
    if (isFieldCell) {
      formDs.create({
        content: cell.value.extra.name,
        isCell: true,
      });
    } else {
      formDs.create();
    }
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.setBarCode').d('设置条形码'),
      className: styles['no-border-modal'],
      children: (
        <Form dataSet={formDs} labelLayout="float" columns={2}>
          <TextField name="content" disabled={isFieldCell} colSpan={2} />
          <Select name="format" colSpan={2}>
            <Select.Option value={'CODE128'}>CODE128</Select.Option>
            <Select.Option value={'EAN'}>EAN</Select.Option>
            <Select.Option value={'CODE39'}>CODE39</Select.Option>
          </Select>
          {/* <NumberField name="width" />
          <NumberField name="height" /> */}
          <Switch name="isCell" />
          {!isFieldCell && <Switch name="isFloat" />}
        </Form>
      ),
      onOk: async () => {
        const flag = handleSubmit(formDs);
        return flag;
      },
    });
  }, [cell, isFieldCell, disabled, handleSubmit]);

  const handleSubmit = useCallback(
    async (formDs) => {
      const flag = await formDs.validate();
      if (!flag) {
        return false;
      }
      const data = formDs.current.toData();
      if (!isFieldCell) {
        sheetRef.current.insertBarcode(data);
      } else if (cell.position) {
        const { c, r } = cell.position;
        sheetRef.current.setCellValue(r, c, {
          ...cell.value,
          barCode: data,
        });
      }
    },
    [isFieldCell, cell]
  );

  return (
    <div
      className={classnames(styles[`${clsPrefix}`], {
        [styles['sheet-toolbar-diabled']]: disabled,
      })}
      disabled={disabled}
      onClick={handleClick}
    >
      <div>
        <img src={barcodeSvg} />
        <span>{title}</span>
      </div>
    </div>
  );
}
