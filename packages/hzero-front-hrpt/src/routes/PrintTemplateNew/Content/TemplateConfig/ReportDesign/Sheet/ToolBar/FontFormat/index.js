import React, { useEffect, useState, useMemo, useRef, useCallback, useContext } from 'react';
import classnames from 'classnames';
import { Dropdown, Menu, Modal } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';

import styles from '../../../index.less';
import CustmizeModal, { parseFa } from './CustmizeModal';
import Store from '../../../store';
import { exitEditMode, syncCurrentCell } from '../../../utils/utils';

export default function FontFormat({item, sheetRef, disabled }) {
  const { title, options } = item;
  const [showText, setShowText] = useState(options[0].text);
  const [currentType, setType] = useState('');
  const modalRef = useRef();

  const {
    currentCell,
    setCurrentCell,
  } = useContext(Store).store;
  useEffect(() => {
    const { value: cell } = currentCell || {};

    if (cell && cell.ct && cell.ct.fa) {
      const [t] = parseFa(cell.ct.fa);
      const res = options.find(option => option.type === t);
      if (res) {
        setShowText(res.text);
        setType(res.type);
      } else {
        const target = options.find(option => option.value === 'fmtOtherSelf');
        setShowText(target.text);
        setType(target.type);
      }
    } else {
      setShowText(options[0].text);
      setType(options[0].type);
    }
  }, [currentCell]);
  const handleClick = useCallback(clickItem => {
    if (clickItem.key === 'fmtOtherSelf') {
      openCustomzeModal();
    } else if (clickItem.key !== 'split') {
      const target = options.find(option => option.type === clickItem.key);
      setType(clickItem.key);
      if (target) {
        setShowText(target.text);
        const selectedCell = sheetRef.current.getluckysheet_select_save();
        if (selectedCell && selectedCell[0]) {
          sheetRef.current.setCellCt(target.value);
        }
      }
    }
  }, [openCustomzeModal, currentCell, options]);

  const openCustomzeModal = useCallback(() => {
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.customizeFormat').d('设置单元格格式'),
      className: styles['font-format-customize-modal'],
      children: <CustmizeModal sheetRef={sheetRef} modalRef={modalRef} cell={(currentCell || {}).value} />,
      onOk: handleOk,
    });
  }, [currentCell, handleOk]);

  const handleOk = useCallback(() => {
    if (modalRef.current && modalRef.current.submit) {
      const data = modalRef.current.submit();
      if (data) {
        const { format, decimalPlaces, thousandthFlag, type } = data;
        let newFormat = format;
        switch (type) {
          // case 'General':
          case 'text':
            newFormat = 'General';
            break;
          case 'number':
          case 'percentage':
          case 'rmb':
          case 'dollar':
            newFormat = '0';
            if (thousandthFlag) {
              newFormat = '#,##0';
            }
            if (decimalPlaces > 0) {
              newFormat = newFormat.concat('.').concat(new Array(decimalPlaces).fill('0').join(''));
            }
            if (type === 'percentage') {
              newFormat += '%';
            } else if (type === 'rmb') {
              newFormat = `￥${newFormat}`;
            } else if (type === 'dollar') {
              newFormat = `$${newFormat}`;
            }
            break;
          case 'scientificNotation':
            newFormat = '0E+0';
            if (decimalPlaces > 0) {
              newFormat = `##${newFormat
                .split('E')[0]
                .concat('.')
                .concat(new Array(decimalPlaces).fill('0').join(''))}E+0`;
            }
            break;
          default:
            break;
        }
        const selectedCell = sheetRef.current.getluckysheet_select_save();
        if (selectedCell && selectedCell[0]) {
          sheetRef.current.setCellCt(newFormat);
          syncCurrentCell(sheetRef, setCurrentCell);
        }
      }
    }
  }, []);

  const menu = useMemo(() => (
    <Menu key={currentType} className={styles['sheet-toolbar-dropdown-menu']} onClick={handleClick} selectedKeys={[currentType]}>
      {options.map(option => (
        <Menu.Item
          key={option.type}
          disabled={option.value === 'split'}
          className={classnames({
            [styles['sheet-toolbar-dropdown-menu-item']]: true,
            [styles['sheet-toolbar-dropdown-menu-item-divide']]: option.value === 'split',
          })}
        >
          <div className={styles['sheet-toolbar-dropdown-menu-item-text']}>{option.text}</div>
          {option.example && (
            <div className={styles['sheet-toolbar-dropdown-menu-item-extra']}>{option.example}</div>
          )}
        </Menu.Item>
      ))}
    </Menu>
  ), [currentCell, handleClick, options, currentType]);

  return (
    <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
      <Tooltip title={title}>
        <div
          className={classnames(
            styles['sheet-toolbar-dropdown-item'],
            styles['sheet-toolbar-font-format'],
            { [styles['sheet-toolbar-diabled']]: disabled }
          )}
        >
          <span>{showText}</span>
          <Icon type="arrow_drop_down" />
        </div>
      </Tooltip>
    </Dropdown>
  );
}
