import React, { useEffect, useContext, useRef, useState } from 'react';

import { getResponse } from 'hzero-front/lib/utils/utils';
import EmbedPage from 'hzero-front/lib/components/EmbedPage';
import { fetchPrintTemplateDetail } from '@/services/printTemplateService';
import Store, { IStore } from '../store';
import { findDocumentFieldInRange, replaceDocumentFieldName } from '../utils';
import { parseExpression } from '../../../../utils';
import { filterHeaderNodeFields } from '../../ReportDesign/utils/utils';
import { clearInterval } from 'timers';

export default function OnlineWord() {
  const selection = useRef<{
    begin?: number;
    end?: number;
  }>({
    begin: 0,
    end: 0,
  });
  const { state: { templateId }, updateState, treeDs } = (useContext(Store)as any).store as IStore;
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const timer = setInterval(() => {
      if (treeDs.getState('initStatus')) {
        initTemplate();
        treeDs.setState('initStatus', false)
        clearInterval(timer);
      }
    }, 200);
  }, [treeDs]);

  const initTemplate = () => {
    fetchPrintTemplateDetail(templateId).then(res => {
      if (getResponse(res) && res) {
        const newState: any = {
          template: res,
        };
        if (res.fileNameExpression) {
          newState.templateName = parseExpression(res.fileNameExpression, { templateFields: treeDs ? filterHeaderNodeFields(treeDs.toData()) : [] });
        }
        updateState(newState);
        if (res.downloadUrl) {
          setUrl(res.downloadUrl);
        }
      }
    });
  };

  const afterLoad = jssdk => {
    // 监听选取变化事件
    handleSelectionChange(jssdk);
    updateState({
      loading: false,
      wpsOffice: {
        app: jssdk.Application,
        jssdk,
      },
    });
  };

  const handleSelectionChange = (jssdk) => {
    jssdk.ApiEvent.AddApiEventListener("WindowSelectionChange", async(data) => {
      const { begin, end } = data;
      // 不知道为什么会重复调两次，加判断防止重复处理
      if (begin === selection.current.begin && end === selection.current.end) {
        return;
      }
      selection.current = {
        begin,
        end,
      };
      const documentField = await findDocumentFieldInRange(jssdk.Application, [begin, end]);
      if (documentField) {
        // 应用公文域样式
        let fieldCode = await documentField.Name;
        // 公文域样式
        fieldCode = replaceDocumentFieldName(fieldCode);
        if (fieldCode) {
          updateState({ activeFieldCode: fieldCode });
        }
      }
    });
  };

  const onlineDocProps = {
    afterLoad,
  }

  return (
    <EmbedPage
      contentStyle={{ height: '100%' }}
      href={url}
      onlineDocProps={onlineDocProps}
    />
  )
}