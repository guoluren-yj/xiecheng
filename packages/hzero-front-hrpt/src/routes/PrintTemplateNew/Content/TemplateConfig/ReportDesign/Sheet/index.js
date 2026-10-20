/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  useContext,
} from 'react';
import classnames from 'classnames';
import { Modal, DataSet, Tree, Spin } from 'choerodon-ui/pro';
import Luckysheet from '@/components/OnlineSheet';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { fetchPrintTemplateDetail } from '@/services/printTemplateService';
import { scrollIntoViewY } from '@/utils/utils';
import { ToolBarKey, systemCodes, getFieldSvg } from '../utils/constant';

import { savePageAggregates, luckysheetCache, syncCurrentCell, exitEditMode, filterHeaderNodeFields, parsePxToMm, handleRowColChange, handleConfigRowAndColLen } from '../utils/utils';
import ToolBar from './ToolBar';
import CustmizeModal from './ToolBar/FontFormat/CustmizeModal';
import FormulaEditor from './ToolBar/Formula/FormulaEditor';
import ImageViewer from './ImageViewer';
import styles from '../index.less';
import CycleBlockSetting from './CycleBlockSetting';
import Store from '../store';
import { checkIsImgType, MarkContentItemType, parseExpressionParams, createWatermark } from '../RightPane/WaterMask/util';
import { parseExpression } from '../../../../utils';

export default function Sheet({ reportType }) {
  const {
    activeFieldCode,
    activeNodeId,
    currentCell,
    templateId,
    sheetPartRef,
    setActiveFieldCode,
    setActiveNodeId,
    setCurrentCell,
    setLoading,
    setRightPaneVisible,
    setRightPaneKey,
    setTemplate,
    treeDs,
    setSelectRange,
    setCreateVersion,
    setTemplateName,
  } = useContext(Store).store;
  const sheetRef = useRef();
  const imageViewerRef = useRef();
  const modalRef = useRef();
  const formulaEditorRef = useRef();
  const fieldSelectModalRef = useRef();
  const formulaBarRef = useRef({
    targetEl: null,
    flag: false,
  });
  useMemo(() => {
    // 因为直接缓存无法直接放到sheet对象中，在每次初始化sheet时删除临时缓存
    delete luckysheetCache.tempPageAggregates;
    delete luckysheetCache.tempPageAggregates_cache;
  }, []);
  const [formulaBarHeight, setFormulaBarHeight] = useState(25);
  const [toolBarKey, setToolBarKey] = useState(ToolBarKey.FORMAT);
  const [cellFoucs, setCellFocus] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(true);
  const currentCellLocation = useMemo(() => {
    return sheetRef.current && currentCell && currentCell.position
      ? sheetRef.current.getFocusCellLocation(currentCell.position)
      : 'A0';
  }, [currentCell]);
  const currentCellText = useMemo(() => {
    return currentCell && currentCell.value ? currentCell.value.m : '';
  }, [currentCell]);
  useImperativeHandle(sheetPartRef, () => ({
    sheetRef: sheetRef.current,
    getSheetData() {
      return sheetRef.current.getAllSheets()[0];
    },
  }));

  const handleSheetRef = useCallback(
    (ref) => {
      sheetRef.current = ref;
      setLoading(true);
      Promise.all([
        fetchPrintTemplateDetail(templateId),
        new Promise((res) => {
          let timer = null;
          const retryCallback = () => {
            if (treeDs.status === "ready") {
              res();
              return;
            }
            clearTimeout(timer);
            timer = setTimeout(retryCallback, 200);
          };
          retryCallback();
        }),
      ]).then(([res]) => {
          if (getResponse(res) && res) {
            setTemplate(res);
            if (res.fileNameExpression) {
              setTemplateName(parseExpression(res.fileNameExpression, { templateFields: treeDs ? filterHeaderNodeFields(treeDs.toData()) : [] }));
            }
            if (!res.downloadUrl) {
              sheetRef.current.updateSheet({ data: [{ createVersion: "20231209", index: 0 }] });
              setCreateVersion("20231209");
              setSheetLoading(false);
            } else {
              const xhr = new XMLHttpRequest();
              xhr.open('get', res.downloadUrl, true);
              xhr.responseType = 'blob';
              xhr.onload = () => {
                if (xhr.status === 200) {
                  const reader = new FileReader();
                  reader.readAsText(xhr.response);
                  reader.onload = () => {
                    try {
                      const templateContent = JSON.parse(reader.result);
                      if (templateContent.cellData) {
                        templateContent.cellData = templateContent.cellData.map((cell) => {
                          if (
                            cell.v &&
                            cell.v.extra &&
                            cell.v.extra.code &&
                            cell.v.extra.type !== 'FUNCTION'
                          ) {
                            // 以前格式是节点编码.字段编码, 后端不兼容故改成节点编码_字段编码, 此处是兼容历史数据
                            cell.v.extra.code = cell.v.extra.code.replace('.', '_');
                            // 遇到字段，则用左侧字段树最新数据更新设计器的翻译
                            if (cell.v.extra.type === "FIELD") {
                              const matchRecord = treeDs.find(r => r.get("type") === "field" && r.get("code") === cell.v.extra.code);
                              if (matchRecord) {
                                const name = matchRecord.get("name");
                                cell.v.extra.name = name;
                                cell.v.v = `#{${name}}`;
                                cell.v.m = `#{${name}}`;
                              }
                            }
                          }
                          return cell;
                        });
                      }
                      luckysheetCache.tempPageAggregates = templateContent.tempPageAggregates || [];
                      if (!templateContent.config) templateContent.config = {};
                      handleConfigRowAndColLen(templateContent);
                      // 提交和预览强制缩放比为1，因为初始化配置时按100%初始化，却不会重置该比例。
                      if (!templateContent.config.sheetViewZoom) templateContent.config.sheetViewZoom = {};
                      templateContent.config.sheetViewZoom.viewNormalZoomScale = 1;
                      sheetRef.current.updateSheet({
                        data: [templateContent],
                        success: () => {
                          setSheetLoading(false);
                        },
                      });
                      if (templateContent.waterMarkConfig && templateContent.waterMarkConfig.enableFlag) {
                        handleDrawWatermark(templateContent.waterMarkConfig, { printConfig: templateContent.printConfig });
                      }
                      setCreateVersion(templateContent.createVersion);
                    } catch (error) {
                      setSheetLoading(false);
                      throw error;
                    }
                  };
                } else {
                  setSheetLoading(false);
                }
              };
              xhr.send();
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [templateId, treeDs]
  );

  const handleDrawWatermark = (watermarkConfig, { printConfig }) => {
    const sheetContainer = document.querySelector('.luckysheet-cell-main');
    const timer = setInterval(() => {
      if (sheetContainer && treeDs.status === 'ready') {
        clearInterval(timer);
        const { width: widthMm, height: heightMm, margin } = printConfig || {};
        const { top: topMm, bottom: bottomMm, left: leftMm, right: rightMm } = margin || {};
        const onePxMm = parsePxToMm(1);
        const width = widthMm ? (widthMm - (leftMm || 0) - (rightMm || 0))/ onePxMm : 0;
        const height = heightMm ? (heightMm - (topMm || 0) - (bottomMm || 0)) / onePxMm : 0;
        const templateFields = filterHeaderNodeFields(treeDs.toData());
        const clsName = 'luckysheet-watermark';
        const waterMarkContainer = sheetContainer.querySelector(`.${clsName}`);
        if (waterMarkContainer) {
          waterMarkContainer.remove();
        }
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.pointerEvents = 'none';
        container.className = clsName;
        container.style.left = 0;
        container.style.top = 0;
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.zIndex = 100000;
        container.style.pointerEvents = 'none';
        sheetContainer.appendChild(container);
        const {
          enableFlag,
          type,
          expression,
          value,
          density,
          size,
          alpha,
          position,
          direction,
        } = watermarkConfig;
        const isImgType = checkIsImgType(type);
        const content =
          isImgType
            ? value
            : parseExpressionParams(expression, { templateFields })
                .map(item => item.type === MarkContentItemType.FIX ? item.value : item.meaning)
                .join('');
        let imageRatio = 1;
        if (isImgType && content) {
          const img = document.createElement('img');
          img.src = content;
          img.style.display = 'none';
          img.onload = () => {
            imageRatio = img.width / img.height;
            createWatermark(
              container,
              { enableFlag, type, content, density, size, alpha, position, direction, scale: 1, imageRatio },
            );
            img.remove();
          };
          document.body.appendChild(img);
        } else {
          createWatermark(
            container,
           { enableFlag, type, content, density, size, alpha, position, direction, scale: 1, imageRatio },
         );
        }
      }
    }, 100);
  };

  const updateCurrentCell = useCallback((cell) => {
    setCurrentCell(cell);
  }, []);

  const getToolBarClsName = useCallback(
    (key) => {
      return classnames({
        [styles['sheet-toolbar-tab']]: true,
        [styles['sheet-toolbar-tab-active']]: key === toolBarKey,
      });
    },
    [toolBarKey]
  );

  const handleSetCellDataFormat = useCallback(() => {
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.customizeFormat').d('设置单元格格式'),
      className: styles['font-format-customize-modal'],
      children: <CustmizeModal sheetRef={sheetRef} modalRef={modalRef} />,
      onOk: handleOk,
    });
  }, [sheetRef, modalRef, handleOk]);

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
        sheetRef.current.setCellCt(newFormat);
        syncCurrentCell(sheetRef, setCurrentCell);
      }
    }
  }, [sheetRef, modalRef, currentCell]);

  const openCycleBlockSettingModal = ({ cycleBlock, callback }) => {
    const {
      parentId,
      type,
      isPaging,
      fixedRowSize,
      mockQuantity = 1,
      cycleCols,
      left = 0,
      right = 0,
    } = cycleBlock;
    const isApproveCycleBlock = cycleBlock.code === "XXXapprovalRecordRootXXX" || cycleBlock.parentCode === "XXXapprovalRecordRootXXX";
    const cycleBlockCols = right - left + 1;
    const formDs = new DataSet({
      fields: [
        {
          name: 'cycleBlockType',
          label: intl.get('hrpt.reportDesign.cycleBlock.type').d('类型'),
          type: 'string',
          required: true,
        },
        {
          name: 'cycleCols',
          label: intl.get('hrpt.reportDesign.cycleBlock.cycleCols').d('循环列数'),
          type: 'number',
          step: 1,
          min: 1,
          max: cycleBlockCols,
        },
        {
          name: 'fixedRowSize',
          type: 'number',
          step: 1,
          min: 0,
          max: 999999,
        },
        {
          name: 'mockQuantity',
          label: intl.get('hrpt.reportDesign.cycleBlock.mockQuantity').d('打印预览模拟数量'),
          type: 'number',
          defaultValue: 1,
          step: 1,
          min: 1,
          max: 999999,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'cycleBlockType') {
            record.set('cycleCols', undefined);
          }
        },
      },
    });
    formDs.create({
      cycleBlockType:
        type === '0' ? 'horizontal' : isPaging === '1' ? 'verticalPaging' : 'verticalNoPaging',
      fixedRowSize,
      cycleCols,
      mockQuantity,
    });
    // 是否是最外层循环块， 最外层循环块无需设置固定行数
    const isMasterBlock = !parentId;
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.cycleBlockSetting').d('设置循环块'),
      children: <CycleBlockSetting formDs={formDs} isMasterBlock={isMasterBlock} reportType={reportType} isApproveCycleBlock={isApproveCycleBlock} />,
      onOk: async () => {
        const flag = await formDs.validate();
        if (!flag) {
          return false;
        }
        // eslint-disable-next-line no-shadow
        const { cycleBlockType, fixedRowSize, mockQuantity, cycleCols } = formDs.toData()[0];
        const newCycleBlock = {
          ...cycleBlock,
          type: cycleBlockType === 'horizontal' ? '0' : '1',
          isPaging: cycleBlockType === 'verticalPaging' ? '1' : '0',
          mockQuantity,
          cycleCols,
        };
        if (!fixedRowSize && luckysheetCache.tempPageAggregates && luckysheetCache.tempPageAggregates.length) {
          luckysheetCache.tempPageAggregates_cache = luckysheetCache.tempPageAggregates;
        }
        luckysheetCache.tempPageAggregates = (luckysheetCache.tempPageAggregates_cache || luckysheetCache.tempPageAggregates || [])
          .filter((tpa) => {
            if (tpa.tLC === cycleBlock.code && !fixedRowSize) {
              const { celldata } = sheetRef.current.getAllSheets()[0] || {};
              const cell = (celldata || []).find((c) => c.r === tpa.row && c.c === tpa.column);
              // delete无效！！！
              if (cell) {
                delete cell.v;
                delete cell.extra;
                delete cell.m;
                delete cell.pageAggregate;
              }
              return false;
            }
            return true;
          })
          .map((tpa) => {
            if (tpa.tLC === cycleBlock.code) {
              return {
                ...tpa,
                expression: (tpa.expression || '').replace(/\d+\)$/, `${fixedRowSize})`),
              };
            }
            return tpa;
          });
        if (!isMasterBlock) {
          newCycleBlock.fixedRowSize = fixedRowSize;
        }
        callback(newCycleBlock);
      },
    });
  };

  const openSelectFieldModal = ({ currentFieldCode, callback }) => {
    const ds = new DataSet({
      paging: false,
      idField: 'id',
      parentField: 'parentId',
      selection: 'single',
      fields: [
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldName').d('字段名称'),
          name: 'name',
        },
      ],
      data: treeDs.toData(),
      events: {
        load: ({ dataSet }) => {
          dataSet.forEach((record) => {
            record.isSelected = currentFieldCode && record.get('code') === currentFieldCode;
            record.selectable = record.get('type') === 'field';
          });
        },
      },
    });
    const nodeRenderer = ({ record }) => {
      const { name, parentName, type, color, dataType } = record.get([
        'id',
        'code',
        'name',
        'parentId',
        'parentCode',
        'parentName',
        'type',
        'color',
        'dataType',
      ]);
      if (type !== 'field') {
        return (
          <div className={styles['field-tree-node']}>
            <span>{getFieldSvg('header', color)}</span>
            <span
              className={styles['field-tree-node-content']}
              style={{
                cursor: 'pointer',
              }}
            >
              {name}
            </span>
          </div>
        );
      } else {
        return (
          <div
            className={styles['field-tree-node']}
            onClick={() => {
              const fieldCode = record.get('code');
              const fieldName = record.get('name');
              callback({
                fieldCode,
                fieldName,
              });
              if (fieldSelectModalRef.current && fieldSelectModalRef.current.close) {
                fieldSelectModalRef.current.close();
              }
            }}
          >
            <span>{getFieldSvg(dataType, color)}</span>
            <span
              className={styles['field-tree-node-content']}
              style={{
                cursor: 'pointer',
                maxWidth: '360px',
              }}
              title={name}
            >
              {parentName}.{name}
            </span>
          </div>
        );
      }
    };

    exitEditMode();
    fieldSelectModalRef.current = Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.selectField').d('选择字段'),
      closable: true,
      footer: null,
      children: <Tree defaultExpandAll dataSet={ds} showIcon={false} renderer={nodeRenderer} />,
    });
  };

  const handleSetCellFormula = (selectedRange) => {
    const { row_focus, column_focus } = selectedRange || {};
    const sheet = sheetRef.current.getAllSheets()[0] || {};
    const { footerBlock, headerBlock, pageTotalRows } = sheet;
    // 是否在固定头或固定尾区域， 0都不在，1在headerBlock, 2在footerBlock, 3在pageTotalRows
    let isInFixedArea = 0;
    if (
      footerBlock &&
      row_focus >= footerBlock.top &&
      row_focus <= footerBlock.bottom &&
      column_focus >= footerBlock.left &&
      column_focus <= footerBlock.right
    ) {
      isInFixedArea = 2;
    } else if (
      headerBlock &&
      row_focus >= headerBlock.top &&
      row_focus <= headerBlock.bottom &&
      column_focus >= headerBlock.left &&
      column_focus <= headerBlock.right
    ) {
      isInFixedArea = 1;
    } else if (
      pageTotalRows &&
      row_focus >= pageTotalRows.top &&
      row_focus <= pageTotalRows.bottom &&
      column_focus >= pageTotalRows.left &&
      column_focus <= pageTotalRows.right
    ) {
      isInFixedArea = 3;
    }
    const currentEditCell = {
      value: {
        v: sheetRef.current.getCellValue(row_focus, column_focus, { type: 'v' }),
        m: sheetRef.current.getCellValue(row_focus, column_focus, { type: 'm' }),
        extra: sheetRef.current.getCellValue(row_focus, column_focus, { type: 'extra' }),
      },
      position: {
        r: row_focus,
        c: column_focus,
      },
    };
    const cycleBlock = sheetRef.current.findCycleBlockByCell(currentEditCell.position);
    const handleSubmitCellFormula = () => {
      if (formulaEditorRef.current && formulaEditorRef.current.getData) {
        const data = formulaEditorRef.current.getData();
        if (!data) {
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
            if (code === "PAGE_TOTAL") {
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
          const { c: col_index, r: row_index } = currentEditCell.position;
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
          sheetRef.current.setCellValue(row_index, col_index, cellValue);
          sheetRef.current.setCellFormat(row_index, col_index, 'disabled', true);
        }
      }
    };
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.button.expressionEditor').d('公式配置'),
      className: styles['formula-editor-modal'],
      children: (
        <FormulaEditor
          isInFixedArea={!!isInFixedArea}
          cell={currentEditCell.value}
          editorRef={formulaEditorRef}
          cycleBlock={cycleBlock}
          fieldTreeDs={treeDs}
        />
      ),
      onOk: handleSubmitCellFormula,
    });
  };

  const handleFormulaBarMouseDown = (event) => {
    if (formulaBarRef.current.targetEl && formulaBarRef.current.targetEl.getBoundingClientRect) {
      const { top, height } = formulaBarRef.current.targetEl.getBoundingClientRect();
      if (top <= event.pageY && event.pageY <= top + height) {
        formulaBarRef.current.flag = true;
      }
    }
  };

  const handleFormulaBarMouseMove = (event) => {
    if (
      formulaBarRef.current.flag &&
      formulaBarRef.current.targetEl &&
      formulaBarRef.current.targetEl.getBoundingClientRect
    ) {
      const { top } = formulaBarRef.current.targetEl.getBoundingClientRect();
      if (top < event.pageY) {
        let height = event.pageY - top;
        if (height > 75) {
          height = 75;
        } else if (height < 25) {
          height = 25;
        }
        setFormulaBarHeight(height);
      }
    }
  };

  const handleFormulaBarMouseUp = () => {
    formulaBarRef.current.flag = false;
  };

  const sheetOptions = {
    lang: 'zh',
    previewType: reportType,
    hook: {
      rowInsertBefore: (index, value, type, direction) => {
        handleRowColChange(index, value, type, direction);
      },
      cellMousedownBefore: (cell, position) => {
        setCellFocus(false);
        setCurrentCell({
          value: cell,
          position,
        });

        setRightPaneVisible(false);
        setRightPaneKey();
        if (sheetRef.current && sheetRef.current.resize) {
          setTimeout(() => {
            sheetRef.current.resize();
          }, 0);
        }
        if (cell && cell.extra && cell.extra.code !== activeFieldCode) {
          setTimeout(() => {
            // FIX: is not a valid selector.
            if (/['"(),]/.test(cell.extra.code || '')) return;
            scrollIntoViewY(`.c7n-tree-title>div>span[data-code='${cell.extra.code}']`, "#print-field-select");
          }, 10);
          setActiveFieldCode(cell.extra.code);
        } else {
          setActiveFieldCode(null);
        }
      },
      cellEditBefore: () => {
        setCellFocus(true);
        setRightPaneVisible(false);
        setRightPaneKey();
        if (sheetRef.current && sheetRef.current.resize) {
          setTimeout(() => {
            sheetRef.current.resize();
          }, 0);
        }
      },
      imageEditBefore: (image) => {
        const { isQrcode, isBarcode } = image;
        if (isQrcode) {
          syncCurrentCell(sheetRef, setCurrentCell);
          setRightPaneKey("qrCode");
          setRightPaneVisible(true);
          if (sheetRef.current && sheetRef.current.resize) {
            setTimeout(() => {
              sheetRef.current.resize();
            }, 0);
          }
          return;
        }
        if (isBarcode) {
          syncCurrentCell(sheetRef, setCurrentCell);
          setRightPaneKey("barCode");
          setRightPaneVisible(true);
          if (sheetRef.current && sheetRef.current.resize) {
            setTimeout(() => {
              sheetRef.current.resize();
            }, 0);
          }
          return;
        }
        if (imageViewerRef.current && imageViewerRef.current.handleShow) {
          imageViewerRef.current.handleShow([image]);
        }
      },
      imageDeleteAfter: (image) => {
        const { isQrcode, isBarcode } = image;
        if (isQrcode || isBarcode) {
          syncCurrentCell(sheetRef, setCurrentCell);
          return;
        }
      },
      confirmActionBefore: ({ title, content, onOk }) => {
        Modal.confirm({
          title,
          className: styles['confirm-modal'],
          children: content,
          onOk,
          style: {
            zIndex: 1100,
          },
        });
      },
      beforeSetCellDataFormat: () => {
        handleSetCellDataFormat();
      },
      beforeSetCellFormula: (selectedRange) => {
        handleSetCellFormula(selectedRange);
      },
      sheetMousemove: (cell, postion, sheetFile, moveState, ctx, cycleBlock, event) => {
        if (event && ctx && ctx.canvas) {
          const canvasArea = ctx.canvas.getBoundingClientRect();
          if (
            event.clientX < canvasArea.left ||
            event.clientX > canvasArea.right ||
            event.clientY < canvasArea.top ||
            event.clientY > canvasArea.bottom
          ) {
            setActiveNodeId(null);
            return;
          }
        }
        if (cycleBlock && cycleBlock.length > 0 && cycleBlock[0].id !== activeNodeId && !activeFieldCode) {
          setTimeout(() => {
            scrollIntoViewY(`.c7n-tree-title>div>span[data-id='${cycleBlock[0].id}']`, "#print-field-select");
          }, 10);
          setActiveNodeId(cycleBlock[0].id);
        }
      },
      setCycleBlock: (config) => {
        openCycleBlockSettingModal(config);
      },
      selectField: (config) => {
        openSelectFieldModal(config);
      },
      beforeDeleteCellData: (r, c) => {
        // 清除小记的缓存配置信息
        /**
         * 因为luckysheet初始化时会过滤cellData中的pageAggregate属性，
         * 所以不用处理celldata
         * 只需处理tempPageAggregates缓存
         */
        if (luckysheetCache.tempPageAggregates && luckysheetCache.tempPageAggregates.length) {
          luckysheetCache.tempPageAggregates = luckysheetCache.tempPageAggregates.filter(
            (pa) => pa.row !== r || pa.column !== c
          );
        }
      },
      rangeSelect: (file, luckysheet_select_save) => {
        setCellFocus(false);
        setSelectRange([...luckysheet_select_save]);
      },
      rowFixedHeightChange: (luckysheet_select_save) => {
        setSelectRange([...luckysheet_select_save]);
      },
      // 小计配置的复制粘贴适配
      rangePasteBefore: (cpRange, selectRange, options) => {
        if (
          luckysheetCache.tempPageAggregates &&
          luckysheetCache.tempPageAggregates.length &&
          cpRange && cpRange.copyRange && selectRange && cpRange.copyRange[0] && selectRange[0]
          ) {
          const newTempPageAggregates = [];
          let row_offset = selectRange[0].row[0] - cpRange.copyRange[0].row[0];
          let col_offset = selectRange[0].column[0] - cpRange.copyRange[0].column[0];
          const [rowS, rowE] = cpRange.copyRange[0].row;
          const [colS, colE] = cpRange.copyRange[0].column;
          (luckysheetCache.tempPageAggregates || []).forEach(pa => {
            if (
              pa.row >= rowS &&
              pa.row <= rowE &&
              pa.column >= colS &&
              pa.column <= colE
            ) {
              if (!options || !options.cut) {
                newTempPageAggregates.push(pa);
              }
              newTempPageAggregates.push({
                ...pa,
                row: pa.row + row_offset,
                column: pa.column + col_offset,
              });
            } else {
              newTempPageAggregates.push(pa);
            }
          });
          luckysheetCache.tempPageAggregates = newTempPageAggregates;
        }
      },
      // 行列删除导致小计配置变动的适配
      rowAndColDeleteBefore: (start, end, type) => {
        if (
          luckysheetCache.tempPageAggregates &&
          luckysheetCache.tempPageAggregates.length
          ) {
          const newTempPageAggregates = [];
          const offset = end - start + 1;
          (luckysheetCache.tempPageAggregates || []).forEach(pa => {
            let flag = true;
            const newPa = { ...pa };
            if (pa[type] > end) newPa[type] = pa[type] - offset;
            else if (pa[type] >= start) flag = false;
            if (newPa[type] < 0) newPa[type] = 0;
            if (flag) {
              newTempPageAggregates.push(newPa);
            }
          });
          luckysheetCache.tempPageAggregates = newTempPageAggregates;
        }
      },
      errorCallback: (code) => {
        switch(code) {
          case systemCodes.PIC_LIMIT_JPG_OR_PNG:
            notification.error({ message: intl.get("hrpt.reportDesign.validate.picLimitJpgOrPng").d("仅支持上传jpg和png格式图片") });
            break;
          case systemCodes.MERGE_CELL_IMPLICT_FIXED:
            notification.error({ message: intl.get("hrpt.reportDesign.validate.mergeAndFixed").d("固定区域不支持与合并单元格的一部分重叠") });
            break;
          case systemCodes.MERGE_CELL_IMPLICT_REPEART_TITLE:
            notification.error({ message: intl.get("hrpt.reportDesign.validate.mergeAndRepearTitle").d("固定区域不支持与固定标题行重叠") });
            break;
          case systemCodes.MERGE_CELL_IMPLICT_TOTAL_RANGE:
            notification.error({ message: intl.get("hrpt.reportDesign.validate.mergeAndTotalRange").d("固定区域不支持与重复汇总行重叠") });
            break;
        }
      },
    },
  };

  return (
    <div
      onMouseDown={handleFormulaBarMouseDown}
      onMouseMove={handleFormulaBarMouseMove}
      onMouseUp={handleFormulaBarMouseUp}
    >
      <div className={styles['sheet-toolbar']}>
        <span
          key={ToolBarKey.FORMAT}
          className={getToolBarClsName(ToolBarKey.FORMAT)}
          onClick={() => setToolBarKey(ToolBarKey.FORMAT)}
        >
          {intl.get('hrpt.reportDesign.view.title.format').d('格式')}
        </span>
        <span
          key={ToolBarKey.INSERT}
          className={getToolBarClsName(ToolBarKey.INSERT)}
          onClick={() => setToolBarKey(ToolBarKey.INSERT)}
        >
          {intl.get('hrpt.reportDesign.view.title.insert').d('插入')}
        </span>
        {
          reportType === "PDF" && (
            <span
              key={ToolBarKey.PAGE_SETUP}
              className={getToolBarClsName(ToolBarKey.PAGE_SETUP)}
              onClick={() => setToolBarKey(ToolBarKey.PAGE_SETUP)}
            >
              {intl.get('hrpt.reportDesign.view.title.pageSetup').d('页面设置')}
            </span>
          )
        }
      </div>
      <div className={styles['sheet-toolbar-bar']}>
        <ToolBar
          reportType={reportType}
          currentCell={currentCell}
          updateCurrentCell={updateCurrentCell}
          type={toolBarKey}
          sheetRef={sheetRef}
          cellFoucs={cellFoucs}
          treeDs={treeDs}
          setRightPaneVisible={setRightPaneVisible}
        />
      </div>
      <div
        className={styles['sheet-formula-bar']}
        ref={(ref) => {
          formulaBarRef.current.targetEl = ref;
        }}
        style={{ height: `${formulaBarHeight}px`, lineHeight: `${formulaBarHeight}px` }}
      >
        <div className={styles['bar-label']}>{currentCellLocation}</div>
        <div className={styles['formula-input']}>{currentCellText}</div>
        <div className={styles['bar-dragger']} />
      </div>
      <div className={styles['sheet-container']}>
        <Spin spinning={sheetLoading}>
          <Luckysheet onRef={handleSheetRef} options={sheetOptions} />
        </Spin>
      </div>
      <ImageViewer imageViewerRef={imageViewerRef} />
    </div>
  );
}
