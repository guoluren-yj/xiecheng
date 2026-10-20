/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import classnames from 'classnames';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import FormulaSvg from '@/assets/sheet/formula.svg';
import styles from '../../../index.less';
import FormulaEditor from './FormulaEditor';
import Store from '../../../store';
import { exitEditMode, savePageAggregates } from '../../../utils/utils';

const clsPrefix = 'sheet-toolbar-formula';

export default function Formula({ cell, item, sheetRef, treeDs, disabled }) {
  const { rightPaneVisible, setRightPaneVisible, setRightPaneKey, labelCode } = useContext(Store).store;

  const { title } = item;
  const editorRef = useRef();
  const [currentCell, setCurrentCell] = useState();
  const cycleBlock = useMemo(() => {
    if (cell && cell.position) {
      const block = sheetRef.current.findCycleBlockByCell(cell.position);
      return block;
    } else {
      return null;
    }
  }, [cell]);

  useEffect(() => {
    setCurrentCell(cell && cell.value);
  }, [cell]);

  const handleSubmit = useCallback(({ isInFixedArea, focusInfo }) => {
    if (editorRef.current && editorRef.current.getData) {
      const data = editorRef.current.getData();
      if (!cell || !cell.position || !data) {
        return false;
      }
      if (cycleBlock) {
        // 没选任何函数
        if (!data.code) {
          return;
        }
        let hasExtra = true;
        const processFuncData = (code, paramList, childFlag) => {

          let expressionText = `=${code}(`;
          let expressionValue = `${cycleBlock.code}_${code}(`;
          if (childFlag) {
            expressionText = `${code}(`;
            expressionValue = `${code}(`;
          }
          // PAGE_TOTAL不支持嵌套，应在constant文件写死，这里不再处理，即嵌套函数的处理过程不会进入此判断，hasExtra逻辑不用变
          if (isInFixedArea && code === "PAGE_TOTAL") {
            const { row_focus, column_focus } = focusInfo || {};
            hasExtra = false;
            try {
              const processData = savePageAggregates({ formulaData: data, sheetRef, isInFixedArea, rootCycleBlock: cycleBlock, row_focus, column_focus });
              // eslint-disable-next-line prefer-destructuring
              expressionText = processData.expressionText;
              // eslint-disable-next-line prefer-destructuring
              expressionValue = processData.expressionValue;
            } catch {
              return false;
            }
          } else if (paramList && paramList.length) {
            for (let index = 0; index < paramList.length; index ++) {
              const p = paramList[index];
              if (p && (p.value || p.child)) {
                if (index !== 0) {
                  expressionText += ',';
                  expressionValue += ',';
                }
                if (p.child) {
                  const funcData = processFuncData(p.child.code, p.child.paramList, true);
                  if (!funcData) return false;
                  const [childExpressionText, childExpressionValue] = funcData;
                  expressionText += childExpressionText || '';
                  expressionValue += childExpressionValue || '';
                } else if (['fixedValue', 'specialValue', 'component'].includes(p.value.type)) {
                  expressionText += `"${p.value.text || ''}"`;
                  expressionValue += `"${p.value.value || ''}"`;
                } else {
                  expressionText += p.value.text || '';
                  expressionValue += p.value.value || '';
                }
              }
            }
          }
          expressionText += ')';
          expressionValue += ')';
          return [expressionText, expressionValue];
        };
        const funcData = processFuncData(data.code, data.paramList);
        if (!funcData) return false;
        const [expressionText, expressionValue] = funcData;
        const { c: col_index, r: row_index } = cell.position;
        const cellValue = {
          v: expressionText,
        };

        if (hasExtra) {
          cellValue.extra = {
            code: expressionValue,
            type: 'FUNCTION',
            paramList: data.paramList,
            funcType: data.parentCode,
            funcCode: data.code,
          };
        }
        const conditionList = sheetRef.current.getConditionFormat() || [];
        const newConditionList = conditionList
          .map((condition) => {
            const { range: { position: { c: condition_c, r: condition_r } = {} } = {} } = condition;
            if (condition_c === col_index && condition_r === row_index) {
              return undefined;
            } else {
              return condition;
            }
          })
          .filter(Boolean);
        sheetRef.current.setConditionFormat(newConditionList);
        setCurrentCell(cellValue);
        sheetRef.current.setCellValue(row_index, col_index, cellValue);
        sheetRef.current.setCellFormat(row_index, col_index, 'disabled', true);
      }
    }
  }, [cell, cycleBlock]);
  const setCellFormula = useCallback(() => {
    const sheet = sheetRef.current.getAllSheets()[0] || {};
    const { footerBlock, headerBlock, luckysheet_select_save, pageTotalRows } = sheet;
    let focusInfo = null;
    // eslint-disable-next-line prefer-destructuring
    if (luckysheet_select_save && luckysheet_select_save.length) focusInfo = luckysheet_select_save[0];
    // 是否在固定头或固定尾区域， 0都不在，1在headerBlock, 2在footerBlock, 3在pageTotalRows
    let isInFixedArea = 0;
    if (focusInfo) {
      const { row_focus, column_focus } = focusInfo;
      if (footerBlock && row_focus >= footerBlock.top && row_focus <= footerBlock.bottom && column_focus >= footerBlock.left && column_focus <= footerBlock.right) {
        isInFixedArea = 2;
      } else if (headerBlock && row_focus >= headerBlock.top && row_focus <= headerBlock.bottom && column_focus >= headerBlock.left && column_focus <= headerBlock.right) {
        isInFixedArea = 1;
      } else if (pageTotalRows && row_focus >= pageTotalRows.top && row_focus <= pageTotalRows.bottom && column_focus >= pageTotalRows.left && column_focus <= pageTotalRows.right) {
        isInFixedArea = 3;
      }
    }
    if (rightPaneVisible) {
      setRightPaneVisible(false);
      setRightPaneKey(undefined);
      if (sheetRef.current && sheetRef.current.resize) {
        setTimeout(() => {
          sheetRef.current.resize();
        }, 0);
      }
    }
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.button.expressionEditor').d('公式配置'),
      className: styles['formula-editor-modal'],
      children: (
        <FormulaEditor
          sheetRef={sheetRef}
          isInFixedArea={!!isInFixedArea}
          cell={currentCell}
          editorRef={editorRef}
          cycleBlock={cycleBlock}
          fieldTreeDs={treeDs}
          labelCode={labelCode}
        />
      ),
      onOk: () => handleSubmit({ isInFixedArea, focusInfo }),
    });
  }, [currentCell, cycleBlock, handleSubmit, treeDs, rightPaneVisible]);

  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: disabled,
        })}
        onClick={setCellFormula}
      >
        <img src={FormulaSvg} />
      </div>
    </Tooltip>
  );
}
