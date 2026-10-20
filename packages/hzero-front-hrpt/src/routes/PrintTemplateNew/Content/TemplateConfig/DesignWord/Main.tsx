import React, { useContext, useCallback, useRef } from "react";
import classnames from 'classnames';
import { Modal, Button, Tooltip } from 'choerodon-ui/pro';
import { Icon, Text } from 'choerodon-ui';
import { FuncType } from "choerodon-ui/pro/lib/button/enum";

import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { MarkContentItemType } from '../../../utils';
import { previewWordEditorTemplate, saveWordTemplate, resetWordPrintTemplate, updatePrintReportTemplate } from '@/services/printTemplateService';
import { filterHeaderNodeFields } from '../ReportDesign/utils/utils';
import Store, { IStore } from './store';
import { saveWord } from './utils';
import useResizeWidth from './useResizeWidth';
import FieldSelect from './FieldSelect';
import OnlineWord from './OnlineWord';
import FileNameEditor from './FileNameEditor';
import styles from './index.less';
import { stringToBase64InBrowser } from '../../../utils';

function DesignWord(props) {
  const { isPredefined, modal, onRefresh } = props;
  const sideRef = useRef<any>();
  const fileNameEditorRef = useRef<any>();
  const { treeDs, updateState, state: { loading, templateId, template, wpsOffice, templateName } } = (useContext(Store)as any).store as IStore;
  const { resizeWidth, resizeFlag, resizeEvents } = useResizeWidth({ target: sideRef, defaultValue: 280, max: 500, min: 280 });
  
  const closeModal = useCallback(() => {
    if (modal && modal.close) {
      modal.close();
    }
  }, [modal]);

  const resetTemplate = useCallback(async() => {
    // 关闭之前先重置模板
    if (wpsOffice.app) {
      await wpsOffice.app.ActiveDocument.Save();
    }
    getResponse(await resetWordPrintTemplate({ templateId }));
    closeModal();
  }, [wpsOffice.app]);

  const handleClose = useCallback((force = false) => {
    if (isPredefined || force) {
      closeModal(); 
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hrpt.printTemplate.view.confirm.close').d('关闭设计页面后，本次编辑且未保存内容将丢失，请确保在关闭前完成保存操作。'),
        onOk: resetTemplate,
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
  }, [isPredefined, closeModal, resetTemplate]);
  const handlePrintPreview = useCallback(async() => {
    const preview = async() => {
      const res = await previewWordEditorTemplate({
        templateId,
        outType: 'WORD'
      });
      if (res) {
        if (res.includes('failed')) {
          notification.error({ message: (JSON.parse(res) || {}).message });
        } else {
          Modal.open({
            title: intl.get('hzero.common.button.preview').d('预览'),
            className: styles['preview-modal'],
            fullScreen: true,
            children:  (
              <iframe src={res} style={{ width: '100%', height: '100%', border: 'none' }} />
            ),
            closable: true,
            footer: null,
            bodyStyle: { padding: 0 },
          });
        }
      }
    };
    if (isPredefined) {
      await preview();
    } else {
      return new Promise(resolve => {
        const callback = () => {
          resolve();
        };
        saveWord(wpsOffice.app, preview, callback);
      });
    }
  }, [wpsOffice.app, isPredefined, templateId]);
  const handleSave = useCallback(async() => {
    if (!wpsOffice.app) {
      return;
    }
    const flag = await new Promise(resolve => {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hrpt.printTemplate.view.confirm.save').d('保存后将覆盖旧版本，是否确认保存？'),
        onOk: () => resolve(true),
        onCancel: () => resolve(),
      })
    });
    if (!flag) {
      return;
    }
    return new Promise(resolve => {
      saveWord(wpsOffice.app, async() => {
        const resp = await saveWordTemplate({ templateId });
        if (getResponse(resp)) {
          notification.success({});
          if (onRefresh) {
            onRefresh();
          }
          handleClose(true);
        }
      }, () => {
        resolve();
      });
    });
  }, [handleClose, wpsOffice.app]);

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
          console.log('data', data)
          const res = await updatePrintReportTemplate(data);
          if (getResponse(res)) {
            updateState({
              templateName: { meaning: result, value: content },
              template: res,
            });
            return true;
          }
          return false;
        }
      }
    });
  }, [treeDs, templateName, template]);

  return (
    <div className={styles.contanier}>
      <div className={styles.header}>
        <div className={styles['header-title']}>
          <Text style={{ maxWidth: 'calc(100% - 40px)' }}>{templateName.meaning || template.templateName}</Text>
          {!isPredefined && (
            <Tooltip title={intl.get('hrpt.printTemplate.view.title.fileNameRule').d('文件名称规则定义')}>
              <Button funcType={FuncType.link} icon='edit-o' onClick={handleEditFileName} disabled={treeDs.status === 'loading'} />
            </Tooltip>
          )}
        </div>
        <div className={styles['header-extra']}>
          <Button funcType={FuncType.flat} onClick={() => handleClose()} disabled={loading}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
          <Button funcType={FuncType.flat} onClick={handlePrintPreview} disabled={!wpsOffice.app}>
            {intl.get('hzero.common.button.preview').d('预览')}
          </Button>
          {!isPredefined && (
            <Button funcType={FuncType.flat} onClick={handleSave} disabled={!wpsOffice.app}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </div>
      </div>
      <div className={classnames(styles.content, { [styles['content-resizing']]: resizeFlag })} {...resizeEvents}>
        <div className={styles['left-side']} style={{ width: `${resizeWidth}px` }}>
          <FieldSelect isPredefined={isPredefined} />
        </div>
        <div className={styles['left-side-move']} ref={sideRef} />
        <div className={styles['main-content']} style={{ width: `calc(100% - ${resizeWidth}px - 3px)` }}>
          <OnlineWord />
        </div>
      </div>
    </div>
  )
}

export default DesignWord;