/* eslint-disable react/jsx-filename-extension */
import React, { useContext, useMemo, useEffect } from 'react';
import { runInAction } from 'mobx';
import { Form, TextField, DataSet, Icon, Select } from 'choerodon-ui/pro';

import intl from 'hzero-front/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { barCodeDefaultConfig } from "../../utils/constant";
import Store from '../../store';
import styles from './index.less';

const BarCodeSetting = ({ hidePaneContent, sheet }) => {
  const { currentCell } = useContext<any>(Store).store;
  const cellRef = useMemo((): any => ({ current: null }), []);
  cellRef.current = currentCell;
  const ds = useMemo(() => {
    return new DataSet({
      data: [{...barCodeDefaultConfig}],
      fields: [
        {
          name: "format",
          label: intl.get("hrpt.reportDesign.model.field.qrtype").d("码制"),
          lookupCode: "HRPT.BAR_CODE_TYPE",
        },
        { name: "cellContent", label: intl.get("hrpt.reportDesign.model.field.cellContent").d("内容") },
      ],
      events: {
        update: ({ record, name, value }) => {
          const { format, cellContent } = record.toData();
          if (sheet && cellRef.current && cellRef.current.position && cellRef.current.value) {
            const { position } = cellRef.current;
            if (!cellRef.current.value.barCode) {
              cellRef.current.value.barCode = {};
            }
            sheet.setCellValue(position.r, position.c, { ...cellRef.current.value, barCodeFormat: format || 'Code128' });
            if (name === 'format') {
              sheet.insertBarcode({
                isCell: true,
                content: '202410151807',
                format: value || 'Code128',
                isBarcode: true,
            });
            }
          }
        },
      },
    });
  }, []);
  useEffect(() => {
    const { value } = currentCell || {};
    runInAction(() => {
      // 注意，这里是为了从单元格数据中初始化表单，请勿使用set;
      if (value && ds.current) {
        if (value.v) {
          ds.current.init('cellContent', value.v);
        }
        if (value.barCodeFormat) {
          ds.current.init('format', value.barCodeFormat);
        }
      }
    });
  }, [currentCell]);
  return (
    <div className={styles['barcode-pane']}>
      <div className="barcode-pane-title">
        {intl.get('hrpt.reportDesign.view.title.setBarCode').d('设置条形码')}
        <span className="barcode-pane-close" onClick={hidePaneContent}>
          <Icon type="close" />
        </span>
      </div>
      <Form labelLayout={LabelLayout.float} className="barcode-pane-config" dataSet={ds}>
        <Select name="format" />
        <TextField name="cellContent" disabled />
      </Form>
    </div>
  );
};

BarCodeSetting.displayName = 'BarCodeSetting';
export default BarCodeSetting;
