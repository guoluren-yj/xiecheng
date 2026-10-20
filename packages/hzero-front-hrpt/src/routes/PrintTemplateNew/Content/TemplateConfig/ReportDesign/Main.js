/* eslint-disable react/display-name */
import React, { useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { Button, Spin, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon, Text } from 'choerodon-ui';
import numeral from 'numeral';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { savePrintTemplateContent, updatePrintReportTemplate } from '@/services/printTemplateService';
import { transformSheetData, printPriview, exitEditMode, filterHeaderNodeFields, filterHeaderNodeFieldsRecords } from './utils/utils';
import FieldSelect from './FieldSelect';
import Sheet from './Sheet';
import styles from './index.less';
import Preview from './Preview';
import RightPane from './RightPane';
import Store from './store';
import FileNameEditor from './FileNameEditor';
import { MarkContentItemType, stringToBase64InBrowser } from '../../../utils';

const failed = Symbol("failed");
function Main({ templateId: originTemplateId, reportId: originReportId, onClose, onRefresh, reportType, isPredefined }) {
  const {
    loading,
    refreshReport,
    reportId,
    rightPaneVisible,
    sheetPartRef,
    sideRef,
    sideMoveFlag,
    sideWidth,
    template,
    templateId,
    treeDs,
    setLoading,
    setReportId,
    setSideMoveFlag,
    setSideWidth,
    setTemplateId,
    createVersion,
    templateName,
    setTemplateName,
    setTemplate,
  } = useContext(Store).store;
  const globalWatermarkDiv = document.querySelectorAll('.mask_mark');
  const globalWatermarkOpactiy =  globalWatermarkDiv && globalWatermarkDiv[0] && globalWatermarkDiv[0].style.opacity;
  const fileNameEditorRef = useRef();
  useEffect(() => {
    window.numeral = numeral;
    handleHideGlobalWatermark();
    window.addEventListener('resize', handleHideGlobalWatermark);
    return () => {
      window.removeEventListener('resize', handleHideGlobalWatermark);
      resetGlobalWatermarkOpactiy();
    };
  }, []);

  const handleHideGlobalWatermark = () => {
    setTimeout(() => {
      hideGlobalWatermarkOpactiy();
    }, 1000);
  };

  const resetGlobalWatermarkOpactiy = () => {
    const elments = document.querySelectorAll('.mask_mark');
    if (elments && elments.length && globalWatermarkOpactiy) {
      const timer = setInterval(() => {
        let flag = true;
        elments.forEach(el => {
          if (el.style.opacity !== globalWatermarkOpactiy) {
            flag = false;
          }
          el.style.opacity = globalWatermarkOpactiy;
        });
        if (flag) {
          clearInterval(timer);
        }
      }, 200);
    }
  };

  const hideGlobalWatermarkOpactiy = () => {
    const elments = document.querySelectorAll('.mask_mark');
    if (elments && elments.length && globalWatermarkOpactiy) {
      elments.forEach(el =>  el.style.opacity = '0');
    }
  };

  const handlePrintPreview = useCallback(() => {
    if (sheetPartRef.current && sheetPartRef.current.getSheetData) {
      const sheetData = sheetPartRef.current.getSheetData();
      let data;
      try {
        data = transformSheetData(sheetData, treeDs, { reportType, createVersion });
      } catch (error) {
        Modal.error({ children: error.message });
        return;
      }

      return printPriview(data, {
        printReportCode: template.reportCode,
        lang: template.templateLang,
        outType: reportType,
      }).then(resp => {
        if (typeof resp === "string" && resp.indexOf('failed') !== -1) {
          try {
            const result = JSON.parse(resp);
            getResponse(result);
          } catch (e) {
            notification.error({});
          }
          return failed;
        }
        if (typeof resp === "object" && resp.toString() === "[object Blob]") {
          return new Promise(res => {
            const reader = new FileReader();
            reader.onloadend = () => {
              res(reader.result);
            };
            reader.onerror = () => res(failed);
            reader.readAsText(resp);
          }).then(r => {
            if (r === failed) return failed;
            if (typeof r === "string" && r.indexOf('failed') !== -1) {
              try {
                const result = JSON.parse(r);
                getResponse(result);
              } catch (e) {
                notification.error({});
              }
              return failed;
            }
            return resp;
          });
        }
        return resp;
      }, (e) => {
        try {
          getResponse(e);
        } catch (e) {
          notification.error({});
        }
        return failed;
      }).then(resp => {
        if (resp === failed) return;
        exitEditMode();
        Modal.open({
          title: intl.get('hzero.common.button.preview').d('预览'),
          className: styles['preview-modal'],
          fullScreen: true,
          children: <Preview reportType={reportType} resp={resp} />,
          closable: true,
          footer: null,
        });
      });
    }
  }, [template, treeDs, reportType, createVersion]);

  const handleSave = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hrpt.printTemplate.view.confirm.save').d('保存后将覆盖旧版本，是否确认保存？'),
      onOk: () => {
        const sheetData = sheetPartRef.current.getSheetData();
        let templateContent;
        try {
          templateContent = transformSheetData(sheetData, treeDs, { reportType, createVersion: "20231209" });
          templateContent.createVersion = "20231209";
        } catch (error) {
          Modal.error({ children: error.message });
          return;
        }
        const onOk = (updateFlag) => {
          setLoading(true);

          return savePrintTemplateContent({
            templateId,
            tplContent: JSON.stringify(templateContent),
          })
            .then((res) => {
              if (res && getResponse(res)) {
                notification.success();
                if (updateFlag && templateContent) {
                  window.luckysheet.updateSheet({data: [templateContent]});
                }
                onClose();
                if (originTemplateId !== res.templateId) {
                  if (res.reportId !== originReportId) {
                    refreshReport({ reportId: res.reportId });
                  }
                }
                onRefresh();
              }
            })
            .finally(() => {
              setLoading(false);
            });
        };
        const columnMm = templateContent.visibledatacolumnMm;
        const lastColumnMm = columnMm && columnMm .length ? columnMm[columnMm.length - 1] : 0;
        if (sheetData.createVersion === '20231209' || reportType === "EXCEL" || lastColumnMm <= templateContent.printConfig.width) {
          onOk();
          return;
        }
        exitEditMode();
        // hrpt.common.confirm.versionChange.content2、3、4暂时弃用，后续如有需要，可再次使用
        Modal.open({
          title: intl.get('hrpt.common.confirm.saveTpl').d('友情提示'),
          children: (
            <div className={styles["confirm-tpl-ver-change"]}>
              <div className="confirm-content">
                {intl.get('hrpt.common.confirm.versionChange.content1').d('建议调整模板，将模板中所有内容都添加到纸张范围内，即不要把内容填写到灰色区域内，否则可能会出现灰色区域内容无法打印出来的情况。')}
              </div>
            </div>
          ),
          onOk: () => onOk(true),
          onCancel: () => {
            setLoading(false);
          },
        });
      },
    });
  }, [templateId, treeDs, reportType, createVersion]);

  const handleClose = useCallback(() => {
    const close = () => {
      onClose();
      if (originTemplateId !== templateId) {
        if (reportId !== originReportId) {
          refreshReport({ reportId });
        }
      }
      onRefresh();
    };
    if (isPredefined) {
      close();
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hrpt.printTemplate.view.confirm.close').d('关闭设计页面后，本次编辑且未保存内容将丢失，请确保在关闭前完成保存操作。'),
        onOk: () => {
          close();
        },
        footer: (okBtn, cancelBtn) => (
          <>
            <Tooltip title={intl.get('hrpt.printTemplate.view.button.cancelClose').d('取消关闭页面')}>
              {cancelBtn}
            </Tooltip>
            <Tooltip title={intl.get('hrpt.printTemplate.view.button.confirmClose').d('确认关闭页面')}>
              {okBtn}
            </Tooltip>
          </>
        ),
      });
    }
  }, [isPredefined, onClose, onRefresh, templateId, originTemplateId, originReportId, reportId]);

  const handleMoveLineMouseDown = useCallback(() => {
    if (sideRef.current && sideRef.current.getBoundingClientRect) {
      const { left, width } = sideRef.current.getBoundingClientRect();
      if (left <= event.pageX && event.pageX <= left + width) {
        setSideMoveFlag(true);
      }
    }
  }, []);

  const handleMoveLineMouseMove = useCallback(() => {
    if (sideMoveFlag && sideRef.current && sideRef.current.getBoundingClientRect) {
      const { left } = sideRef.current.getBoundingClientRect();
      if (left < event.pageX) {
        let width = event.pageX - left;
        if (width > 500) {
          width = 500;
        } else if (width < 280) {
          width = 280;
        }
        setSideWidth(width);
      }
    }
    const fieldTreeNodes = document.querySelectorAll('.hrpt-sheet-design-field-tree-node');
    if (fieldTreeNodes && fieldTreeNodes.length) {
      let hoverNode;
      //  NodeList 只有forEach
      fieldTreeNodes.forEach((node) => {
        const { top, bottom, left, right } = node.getBoundingClientRect();
        if (hoverNode) {
          return;
        }
        if (
          left <= event.pageX &&
          event.pageX <= right &&
          top <= event.pageY &&
          event.pageY <= bottom
        ) {
          hoverNode = node;
        }
      });
      if (sheetPartRef.current && sheetPartRef.current.sheetRef) {
        const sheet = sheetPartRef.current.sheetRef;
        if (hoverNode && hoverNode.getAttribute) {
          sheet.setHightlighCycleBlock(hoverNode.getAttribute('data-code'));
        } else {
          sheet.clearHightlighCycleBlock();
        }
      }
    }
  }, [sideMoveFlag]);

  const handleMoveLineMouseUp = useCallback(() => {
    setSideMoveFlag(false);
  }, []);

  const handleEditFileName = useCallback(() => {
    const templateFields = treeDs ? filterHeaderNodeFields(treeDs.toData()) : [];
    
    Modal.open({
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {intl.get('hrpt.printTemplate.view.title.fileNameRule').d('文件名称规则定义')}
          <Tooltip title={(
            <div>
              <div>1. {intl.get('hrpt.reportDesign.model.fileName.content.tooLong').d('最大长度不超过200个字符')}</div>
              <div>2. {intl.get('hrpt.reportDesign.model.fileName.content.inValid').d('文件名不能包含以下字符： \/ ：？"<> |')}</div>
              <div>3. {intl.get('hrpt.reportDesign.model.fileName.content.inValidStart').d('文件名不能以点.字符、+、-字符或者空格开头')}</div>
            </div>
          )}>
            <Icon type="info_outline" style={{ marginLeft: '4px' }} />
          </Tooltip>
        </div>
      ),
      movable: false,
      style: { width: '800px' },
      bodyStyle: { padding: 0, height: 'calc(100vh - 2.06rem)' },
      children: <FileNameEditor templateFields={templateFields} templateName={templateName} contentRef={fileNameEditorRef} />,
      onOk: async() => {
        if (fileNameEditorRef.current && fileNameEditorRef.current.submit) {
          let content = fileNameEditorRef.current.submit();
          let result = '';
          if (content && content.length) {
            content = content.filter(item => item && item.value);
            result =
              content  
                .map(item => item.type === MarkContentItemType.VAR ? `{${item.meaning}}` : item.value)
                .join('')
            if (result.length > 200) {
              notification.warning({
                message: intl.get('hrpt.reportDesign.model.fileName.content.tooLong').d('最大长度不超过200个字符'),
              });
              return false;
            }
            if (content[0] && content[0].type === MarkContentItemType.FIX && content[0].value && [' ', '.', '+', '-'].includes(content[0].value[0])) {
              notification.warning({
                message: intl.get('hrpt.reportDesign.model.fileName.content.inValidStart').d('文件名不能以点.字符、+、-字符或者空格开头'),
              });
              return false;
            }
            if (content.some(item => item.type === MarkContentItemType.FIX && !/^(?!.*[\\/:"<>|?]).*$/.test(item.value))) {
              notification.warning({
                message: intl.get('hrpt.reportDesign.model.fileName.content.inValid').d('文件名不能包含以下字符： \/ ：？"<> |'),
              });
              return false;
            }
          }
          let expression = content;
          if (expression && expression.length) {
            // CONCAT至少需要两个参数
            if (expression.length < 2) {
              expression.push({
                type: MarkContentItemType.FIX,
                value: '',
              });
            }
            expression =
              expression
                .map(item => item.type === MarkContentItemType.FIX ? `'${item.value}'` : item.value)
                .join(',');
            expression = `CONCAT(${expression})`;    
          } else {
            expression = null;
          }
          let fileNameExpression = expression;
          if (fileNameExpression) {
            fileNameExpression = await stringToBase64InBrowser(fileNameExpression);
          }
          const data = {
            ...template,
            fileNameExpression: fileNameExpression || '',
          };
          const res = await updatePrintReportTemplate(data);
          if (getResponse(res)) {
            setTemplateName({ meaning: result, value: content });
            setTemplate(res);
            return true;
          }
          return false;
        }
      }
    });
  }, [treeDs, templateName, template]);

  return (
    <Spin spinning={loading}>
      <div className={styles.contanier}>
        <div className={styles.header}>
          <div className={styles['header-title']}>
            <Text style={{ maxWidth: 'calc(100% - 40px)' }}>{templateName.meaning || template.templateName}</Text>
            {!isPredefined && (
              <Tooltip title={intl.get('hrpt.printTemplate.view.title.fileNameRule').d('文件名称规则定义')}>
                <Button funcType='link' icon='edit-o' onClick={handleEditFileName} disabled={treeDs.status === 'loading'} />
              </Tooltip>
            )}
          </div>
          <div className={styles['header-extra']}>
            <Button funcType="flat" onClick={handleClose} disabled={loading}>
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
            <Button funcType="flat" onClick={handlePrintPreview} disabled={loading}>
              {intl.get('hzero.common.button.preview').d('预览')}
            </Button>
            {!isPredefined && (
              <Button color="primary" onClick={handleSave} disabled={loading}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )}
          </div>
        </div>
        <div
          className={styles.content}
          onMouseUp={handleMoveLineMouseUp}
          onMouseDown={handleMoveLineMouseDown}
          onMouseMove={handleMoveLineMouseMove}
        >
          <div className={styles['left-side']} style={{ width: `${sideWidth}px` }} ref={sideRef}>
            <FieldSelect isPredefined={isPredefined} />
            <div className={styles['left-side-move']} />
          </div>
          <div
            className={styles['main-content']}
            style={{ pointerEvents: sideMoveFlag ? 'none' : 'unset' }}
          >
            <Sheet reportType={reportType} />
          </div>
          {rightPaneVisible && (
            <div className={styles['right-side']}>
              <RightPane />
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
}

export default Main;
