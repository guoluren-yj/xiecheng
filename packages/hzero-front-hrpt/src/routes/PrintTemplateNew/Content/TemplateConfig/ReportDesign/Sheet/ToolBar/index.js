import React, { useCallback, useMemo, useContext, useRef } from 'react';
import { isNil } from 'lodash';

import SheetIcon from './SheetIcon';
import { ToolBarType, getToolBar } from '../../utils/constant';
import Store from '../../store';
import styles from '../../index.less';
import FontFormat from './FontFormat';
// import DecimalPlaces from './DecimalPlaces';
import FontStyle from './FontStyle';
import FontSize from './FontSize';
import FontColor from './FontColor';
import BgColor from './BgColor';
import Border from './Border';
import CellSlash from './CellSlash';
import AlignHorizontal from './AlignHorizontal';
import AlignVertical from './AlignVertical';
import InsertPic from './InsertPic';
import TextButton from './TextButton';
import InsertColRow from './InsertColRow';
import PaperMargin from './PaperMargin';
import PaperSize from './PaperSize';
import PaperRotation from './PaperRotation';
import PaperHeaderAndFooter from './PaperHeaderAndFooter';
import Background from './Background';
import TemplatePrintPic from './TemplatePrintPic';
import ShowGridLine from './ShowGridLine';
import ShowRuler from './ShowRuler';
import BarCode from './BarCode';
import Formula from './Formula';
import ConditionFormat from './ConditionFormat';
import PageNum from './PageNum';
import BusinessType from './BusinessType';
import WaterMask from './WaterMask';

export default function ToolBar({ currentCell, type, sheetRef, cellFoucs, reportType }) {
  const { treeDs, setRightPaneVisible, setRightPaneKey, selectRange } = useContext(Store).store;

  const rangeRef = useRef(null);
  rangeRef.current = selectRange;
  const toolbarList = useMemo(() => {
    return getToolBar(type);
  }, [type]);

  const renderItem = useCallback(
    (item) => {
      if (item.reportType && !item.reportType.includes(reportType)) return null;
      if (item.type === ToolBarType.DIVIDE) {
        return <div className={styles['sheet-toolbar-divide']} />;
      } else if (item.type === ToolBarType.BUTTON) {
        let initialStatus = false; // 选中状态
        if (
          item.menuKey &&
          currentCell &&
          currentCell.value &&
          !isNil(currentCell.value[item.menuKey])
        ) {
          const value = currentCell.value[item.menuKey];
          if (item.menuKey === 'ht') {
            initialStatus = Number(value) === Number(item.menuValue);
          } else if (item.menuKey === 'tb'){
            initialStatus = false;
            if (sheetRef && sheetRef.current) {
              const data = sheetRef.current.flowdata();
              const row = currentCell && currentCell.position && currentCell.position.r;
              if (typeof row === 'number' && data && data[row] && data[row].some(cell => cell && Number(cell.tb) === 2)) {
                initialStatus = true;
              }
            }
          } else {
            initialStatus = Number(value) === 1;
          }
        }
        return (
          <SheetIcon
            key={item.name}
            title={item.title}
            type={item.name}
            checkStyle={item.checkStyle}
            disabled={item.focusDisabled && cellFoucs}
            cell={currentCell}
            initialStatus={initialStatus}
            onClick={(options) => handleClick(item, options)}
            sheetRef={sheetRef}
          />
        );
      } else if (item.type === ToolBarType.TEXT) {
        return <TextButton disabled={item.focusDisabled && cellFoucs} item={item} />;
      } else {
        const commonProps = {
          item,
          sheetRef,
          cell: currentCell,
          disabled: item.focusDisabled && cellFoucs, // 编辑单元格时部分操作按钮需禁用
          treeDs,
          setRightPaneVisible,
          setRightPaneKey,
        };
        switch (item.name) {
          case 'fontFormat':
            return <FontFormat {...commonProps} />;
          // case 'decimalPlaces':
          //   return <DecimalPlaces {...commonProps} />;
          case 'fontStyle':
            return <FontStyle {...commonProps} />;
          case 'fontSize':
            return <FontSize {...commonProps} />;
          case 'fontColor':
            return <FontColor {...commonProps} />;
          case 'bgColor':
            return <BgColor {...commonProps} />;
          case 'border':
            return <Border {...commonProps} />;
          case 'cellSlash':
            return <CellSlash {...commonProps} />;
          case 'alignHorizontal':
            return <AlignHorizontal {...commonProps} />;
          case 'alignVertical':
            return <AlignVertical {...commonProps} />;
          case 'floatPic':
            return <InsertPic {...commonProps} />;
          case 'cellPic':
            return <InsertPic {...commonProps} isCell />;
          case 'insertColRow':
            return <InsertColRow {...commonProps} />;
          case 'paperMargin':
            return <PaperMargin {...commonProps} />;
          case 'paperSize':
            return <PaperSize {...commonProps} />;
          case 'paperRotation':
            return <PaperRotation {...commonProps} />;
          case 'paperHeaderAndFooter':
            return <PaperHeaderAndFooter {...commonProps} />;
          case 'background':
            return <Background {...commonProps} />;
          case 'templatePrintPic':
            return <TemplatePrintPic {...commonProps} />;
          case 'showGridLine':
            return <ShowGridLine {...commonProps} />;
          case 'showRuler':
            return <ShowRuler {...commonProps} />;
          case 'barCode':
            return <BarCode {...commonProps} />;
          case 'formula':
            return <Formula {...commonProps} />;
          case 'conditionFormat':
            return <ConditionFormat {...commonProps} />;
          case 'pageNum':
            return <PageNum {...commonProps} />;
          case 'businessType':
            return <BusinessType {...commonProps} />;
          case 'waterMask': 
            return <WaterMask {...commonProps} /> 
          default:
            return null;
        }
      }
    },
    [currentCell, cellFoucs, toolbarList, handleClick]
  );

  const handleClick = useCallback((item, options) => {
    let data;
    let row;
    const selected = sheetRef.current.getluckysheet_select_save();
    switch (item.name) {
      case 'revoke':
        sheetRef.current.undo();
        break;
      case 'recovery':
        sheetRef.current.redo();
        break;
      case 'formatBrush':
        sheetRef.current.formatBrush();
        break;
      case 'clearFormat':
        sheetRef.current.clearCellFormat();
        break;
      case 'fontBold':
        sheetRef.current.setFontBold();
        break;
      case 'italic':
        sheetRef.current.setFontItalic();
        break;
      case 'deleteLine':
        sheetRef.current.setDeleteLine();
        break;
      case 'underLine':
        sheetRef.current.setUnderLine();
        break;
      case 'cellMerge':
        sheetRef.current.mergeCell();
        break;
      case 'wordWrap':
        data = sheetRef.current.flowdata();
        row = selected && selected[0].row_focus;
        if (typeof row === 'number' && data && data[row]) {
          data[row].forEach((cell, index) => {
            sheetRef.current.setCellFormat(row, index, 'tb', options.oldValue ? null : 2, { deleteFlag: true });
          });
        }
        break;
      default:;
    }
  }, [currentCell]);

  return toolbarList.map(renderItem);
}
