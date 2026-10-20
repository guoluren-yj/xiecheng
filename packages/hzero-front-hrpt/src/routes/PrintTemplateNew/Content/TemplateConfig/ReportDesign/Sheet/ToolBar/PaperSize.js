/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useCallback, useEffect } from 'react';
import classnames from 'classnames';
import { DataSet, Button, Form, Modal, NumberField } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';

import PaperSizeSvg from '@/assets/sheet/paperSize.svg';
import intl from 'utils/intl';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-paper-size';

export default function PaperSize({ sheetRef, item, disabled }) {
  const { title, options } = item;
  const [popupVisible, setPopupVisible] = useState(false);
  const [value, setValue] = useState('A4');

  const handleClickItem = (type) => {
    setPopupVisible(false);
    if (type === 'custom') {
      openModal();
      setValue(null);
    } else {
      setValue(type.value);
      sheetRef.current.setPrintConfig({
        paper: type.value,
        height: Number((type.height * 10).toFixed(1)),
        width: Number((type.width * 10).toFixed(1)),
      });
    }
  };

  useEffect(() => {
    // 此处获取的已经是对应方向的宽高数据了
    const { paper } = sheetRef.current.getPrintConfig() || { rotation: 0, width: 210, height: 300, paper: null };
    setValue(paper);
  }, []);
  const openModal = useCallback(() => {
    // 此处获取的已经是对应方向的宽高数据了
    const { width, height } = sheetRef.current.getPrintConfig() || { rotation: 0, width: 210, height: 300 };
    const formDs = new DataSet({
      fields: [
        {
          name: 'height',
          type: 'number',
          precision: 2,
          step: '0.01',
          defaultValue: 21,
          label: intl.get('hrpt.reportDesign.view.title.height').d('高度'),
        },
        {
          name: 'width',
          type: 'number',
          precision: 2,
          step: '0.01',
          defaultValue: 29.7,
          label: intl.get('hrpt.reportDesign.view.title.width').d('宽度'),
        },
      ],
    });
    formDs.create();
    const newWidth = Number(Number(width / 10).toFixed(2));
    const newHeight = Number(Number(height / 10).toFixed(2));
    formDs.current.init("width", newWidth);
    formDs.current.init("height", newHeight);

    const handleSumbmit = () => {
      sheetRef.current.setPrintConfig({
        paper: null,
        height: Number((formDs.current.get('height') * 10).toFixed(1)),
        width: Number((formDs.current.get('width') * 10).toFixed(1)),
      });
    };
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.customePageSize').d('自定义纸张大小'),
      className: styles['no-border-modal'],
      children: (
        <div>
          <div style={{ marginBottom: '12px' }}>{intl.get('hrpt.common.view.title.unitCm').d('单位：厘米')}</div>
          <Form columns={2} dataSet={formDs} labelLayout="float" className={styles['no-colon-form']}>
            <NumberField name="height" />
            <NumberField name="width" />
          </Form>
        </div>
      ),
      onOk: handleSumbmit,
    });
  }, []);



  const content = !disabled && (
    <div className={styles[`${clsPrefix}-menu`]}>
      {options.map((option) => (
        <div
          key={option.value}
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClickItem(option)}
        >
          <span style={{ width: '20px', display: 'inline-block' }}>
            {value === option.value && (
              <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
            )}
          </span>
          {option.text}
          <span style={{ marginLeft: '4px' }}>{option.desc}</span>
        </div>
      ))}
      <div
        key="custom"
        className={classnames(
          styles[`${clsPrefix}-menu-item`],
          styles[`${clsPrefix}-menu-item-custom`]
        )}
        onClick={() => handleClickItem('custom')}
      >
        <span style={{ width: '20px', display: 'inline-block' }}>
          {!value && <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />}
        </span>
        <div>{intl.get('hrpt.reportDesign.view.title.custome').d('自定义')}</div>
      </div>
    </div>
  );

  const handleVisibleChange = (visible) => {
    setPopupVisible(visible);
  };

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomLeft"
      overlayClassName={styles[`${clsPrefix}-overlay`]}
      visible={popupVisible}
      onVisibleChange={handleVisibleChange}
    >
      <Button
        funcType="flat"
        className={classnames(styles[clsPrefix], { [styles['sheet-toolbar-diabled']]: disabled })}
      >
        <img src={PaperSizeSvg} />
        <span>{title} </span>
        <Icon type="arrow_drop_down" />
      </Button>
    </Popover>
  );
}
