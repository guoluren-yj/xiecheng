/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import classnames from 'classnames';
import {
  DataSet,
  NumberField,
  CheckBox,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { getFontFormat } from '../../../utils/constant';
import styles from './index.less';

export default function FontFormat({ sheetRef, modalRef }) {
  const cellValueRef = useRef();
  const [showValue, setShowValue] = useState('');
  const [formatKey, setFormatKey] = useState(null);
  const [type, setType] = useState('');
  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'decimalPlaces',
          type: 'number',
          step: 1,
          min: 0,
        },
        {
          name: 'thousandthFlag',
          type: 'boolean',
        },
      ],
    });
  }, []);
  const listData = useMemo(() => {
    return getFontFormat().filter((item) => !['fmtOtherSelf', 'split'].includes(item.value));
  }, []);

  // 纯文本类型
  const isPureTextType = useMemo(() => ['General', '@'].includes(formatKey), [formatKey]);
  // 时间类型
  const isDateType = useMemo(() => type === 'date', [type]);
  // 时间类型
  const isTimeType = useMemo(() => type === 'time', [type]);
  // 日期时间类型
  const isDateTimeType = useMemo(() => type === 'dateTime', [type]);
  const tootipText = useMemo(() => {
    return (listData.find((d) => d.value === formatKey) || {}).info;
  }, [formatKey, listData]);

  const formatOptions = useMemo(() => {
    if (isDateType) {
      return getFontFormat().find((item) => item.value === 'yyyy-MM-dd').options;
    } else if (isTimeType) {
      return getFontFormat().find((item) => item.value === 'HH:mm:ss').options;
    } else if (isDateTimeType) {
      return getFontFormat().find((item) => item.value === 'yyyy-MM-dd HH:mm:ss').options;
    } else {
      return [];
    }
  }, [isDateType, isTimeType, isDateTimeType]);

  useMemo(() => {
    if (formatOptions && formatOptions.length) {
      const opt = formatOptions.find(item => item.value === formatKey);
      if (opt) {
        setShowValue(opt.example);
        return;
      }
    }
    const typeInfo = getFontFormat().find((item) => item.type === type);
    if (typeInfo) {
      setShowValue(typeInfo.example);
    }
  }, [formatOptions, formatKey, type]);
  useEffect(() => {
    if (!formDs.current) {
      formDs.create();
    }
    let cell = null;
    if (sheetRef && sheetRef.current) {
      // 弹窗格式只在单选单元格时有效
      const data = sheetRef.current.getdatabyselection();
      // 无论选取了多少行列， 始终显示的都是选区左上角的单元格
      if (data && data.length >= 1 && data[0].length >= 1) {
        // eslint-disable-next-line prefer-destructuring
        cell = data[0][0];
      }
    }
    if (cell && cell.ct && cell.ct.fa) {
      const [t, options] = parseFa(cell.ct.fa);

      setFormatKey(options.formatKey);
      if (cell.extra && cell.extra.type === "FIELD") {
        cellValueRef.current = undefined;
      } else {
        cellValueRef.current = cell.m;
      }
      setType(t);
      if (cell.ct.t === 'n') {
        formDs.current.set('decimalPlaces', options.decimalPlaces);
        formDs.current.set('thousandthFlag', options.thousandthFlag);
      }
    } else {
      formDs.current.set('decimalPlaces', 0);
      formDs.current.set('thousandthFlag', false);
      setFormatKey(listData[0].value);
      setType(listData[0].type);
    }
  }, [sheetRef, formDs]);

  useImperativeHandle(modalRef, () => ({
    submit: getSubmitData,
  }));

  const getSubmitData = useCallback(() => {
    const data = formDs.current.toData();
    return {
      ...data,
      format: formatKey,
      type,
    };
  }, [formDs, formatKey, type]);

  const renderList = useCallback(() => {
    return listData.map((format) => (
      // eslint-disable-next-line react/jsx-key
      <div
        className={classnames(styles['left-list-item'], {
          [styles['left-list-item-active']]: format.type === type,
        })}
        onClick={() => changeFormat(format)}
      >
        {format.text}
      </div>
    ));
  }, [listData, type, changeFormat]);

  const changeFormat = useCallback(
    (newFormat) => {
      setType(newFormat.type);
      if (newFormat.value !== formatKey) {
        formDs.loadData([{}]);
        setFormatKey(newFormat.value);
        if (cellValueRef.current) {
          setType(newFormat.type);
        }
      }
    },
    [formDs]
  );

  const renderFormatForm = useCallback(() => {
    return (
      <div className={styles['format-form']}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ marginRight: '12px' }}>
            {intl.get('hrpt.reportDesign.model.fontFormat.decimalPlaces').d('小数位数')}
          </span>
          <NumberField precision={0} dataSet={formDs} name="decimalPlaces" />
        </div>
        {type !== 'scientificNotation' && (
          <div style={{ margin: '1px 0 7px' }}>
            <CheckBox dataSet={formDs} name="thousandthFlag" />
            <span style={{ marginLeft: '10px', letterSpacing: '0.4px' }}>
              {intl.get('hrpt.reportDesign.model.fontFormat.thousandth').d('使用千位分隔符(,)')}
            </span>
          </div>
        )}
      </div>
    );
  }, [type, formDs]);

  const renderFormatList = useCallback(() => {
    return (
      <div className={styles['format-list']}>
        <div className={styles['format-list-title']}>
          {intl.get('hrpt.reportDesign.model.fontFormat.category').d('类型')}
        </div>
        <div style={{overflow: 'auto'}}>
          {formatOptions.map((f) => (
            // eslint-disable-next-line react/jsx-key
            <div
              className={classnames(styles['format-list-item'], {
                [styles['format-list-item-active']]: f.value === formatKey,
              })}
              onClick={() => changeFormat(f)}
            >
              {f.text}
            </div>
          ))}
        </div>
      </div>
    );
  }, [formatKey, formatOptions, changeFormat]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles['content-left']}>
          <div className={styles['left-title']}>
            {intl.get('hrpt.reportDesign.view.title.type').d('分类')}
          </div>
          <div className={styles['left-list']}>{renderList()}</div>
        </div>
        <div className={styles['content-right']}>
          <div className={styles['example-box']}>
            <div className={styles['example-title']}>
              {intl.get('hrpt.reportDesign.view.title.example').d('示例')}
            </div>
            <div className={styles['example-value']}>{showValue}</div>
          </div>
          {isPureTextType && <div className={styles['tootip-text']}>{tootipText}</div>}
          {!isPureTextType && !isDateTimeType && !isDateType && !isTimeType && renderFormatForm()}
          {formatOptions.length > 0 && renderFormatList()}
        </div>
      </div>
    </div>
  );
}

export function parseFa(_fa) {
  const fa = _fa || '';
  let type = 'text'; // 对应_fa为General
  let thousandthFlag = false;
  let decimalPlaces = 0;
  const dateFaList = getFontFormat().find((item) => item.type === 'date').options.map(i => i.value);
  const timeFaList = getFontFormat().find((item) => item.type === 'time').options.map(i => i.value);
  const dateTimeFaList = getFontFormat().find((item) => item.type === 'dateTime').options.map(i => i.value);
  if (dateFaList.includes(fa)) {
    type = 'date';
  } else if (timeFaList.includes(fa)) {
    type = 'time';
  } else if (dateTimeFaList.includes(fa)) {
    type = 'dateTime';
  } else if (/^\$/.test(fa)) {
    type = "dollar";
  } else if (/^¥/.test(fa)) {
    type = 'rmb';
  } else if (/E\+0$/.test(fa)) {
    type = 'scientificNotation';
  } else if (/%$/.test(fa)) {
    type = 'percentage';
  } else if (/\d$/.test(fa)) {
    type = 'number';
  }

  if (/#,##/.test(fa)) {
    thousandthFlag = true;
  }
  if (/\.(\d+)/.test(fa)) {
    const res = fa.match(/\.(\d+)/);
    if (res) decimalPlaces = res[1].length;
  }
  return [type, { thousandthFlag, decimalPlaces, formatKey: _fa }];
}