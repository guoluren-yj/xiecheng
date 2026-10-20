/**
 * AdaptorButton.js
 * 适配器PlayGround使用的AdaptorButton
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { saveScriptDataService } from '@/services/adaptorTaskService';
import { getAdaptorRoutePrefixDs } from './store/taskDetailDs';
import EditorModal from './components/EditorModal';

@formatterCollections({
  code: ['spfm.adaptorTask', 'spfm.adaptorTaskDetail', 'spfm.adaptorPlayGround'],
})
export default class AdaptorButton extends React.Component {
  constructor(props) {
    super(props);
    this.adaptorRoutePrefixDs = new DataSet(getAdaptorRoutePrefixDs());
  }

  saveScriptContent = (record, currentPageDs) => {
    new Promise((resolve) => this.setScriptData(record, resolve)).then(() => {
      currentPageDs.submit();
    });
  };

  scriptCodeDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'script',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(
          crypto.enc.Base64.parse(
            '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9AAo='
          )
        ),
      },
      {
        name: 'input',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(
          crypto.enc.Base64.parse(
            '/v8AewAKACAAIAAiAEEATgBZAFQASABJAE4ARwAiACAAOgAgACIAcwB0AHIAaQBuAGcAIgAKAH0='
          )
        ),
      },
    ],
  });

  scriptOutputDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'output',
        type: 'string',
      },
    ],
  });

  helpDs = new DataSet({
    fields: [
      {
        name: 'msg',
        type: 'string',
      },
    ],
  });

  setScriptData = (record, resolve) => {
    const { script, input } = this.scriptCodeDs.toData()[0];
    record.set('inputContent', crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(input)));
    record.set('scriptContent', crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)));
    resolve();
  };

  getBindRoutePrefix = async (runningService) => {
    this.adaptorRoutePrefixDs.setQueryParameter('runningService', runningService);
    return this.adaptorRoutePrefixDs.query();
  };

  // 关闭modal触发保存代码
  saveScriptData = (key, scriptContent) => {
    const script = crypto.enc.Base64.stringify(
      crypto.enc.Utf16.parse(this.scriptCodeDs.current.get('script'))
    );
    const isChange = scriptContent === script;
    if (!isChange) {
      const saveData = {
        key,
        script,
      };
      saveScriptDataService(saveData);
    }
  };

  @Bind()
  @Debounce(500)
  showScript = async () => {
    const {
      inputContent,
      scriptContent,
      runningService,
      taskCode,
      applyTenantNum,
      trustful,
    } = this.props.record.toData();
    let { bindRoutePrefix } = this.props.record.toData();
    const { currentPageDs } = this.props;
    const saveScriptKey = `PG|${taskCode}|${applyTenantNum}`;
    const debugTenantNum = applyTenantNum;
    const outputEntityCode = 'ANYTHING';
    const inputEntityCode = 'ANYTHING';
    const scriptVersion = 3;
    if (!bindRoutePrefix) {
      bindRoutePrefix = await this.getBindRoutePrefix(runningService);
    }
    if (scriptContent) {
      this.scriptCodeDs.current.set(
        'script',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptContent))
      );
    }
    if (inputContent) {
      this.scriptCodeDs.current.set(
        'input',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(inputContent))
      );
    }
    if (outputEntityCode) {
      Modal.open({
        title: intl.get('spfm.adaptorTaskDetail.modal.header.title').d('脚本编辑器'),
        children: (
          <EditorModal
            queryParam={{
              inputEntityCode,
              outputEntityCode,
              scriptVersion,
              bindRoutePrefix,
              debugTenantNum,
              saveScriptKey,
              trustful,
            }}
            scriptCodeDs={this.scriptCodeDs}
            scriptOutputDs={this.scriptOutputDs}
            helpDs={this.helpDs}
            complementaryWords={this.props.complementaryWords}
          />
        ),
        closable: true,
        destroyOnClose: true,
        fullScreen: true,
        onClose: () => {
          // 清除所有ds
          this.saveScriptData(saveScriptKey, scriptContent);
          this.scriptCodeDs.reset();
          this.scriptOutputDs.reset();
          this.helpDs.reset();
          currentPageDs.reset();
        },
        footer: (onOk, onClose) => (
          <div>
            <Button
              color="primary"
              onClick={() => this.saveScriptContent(this.props.record, currentPageDs)}
            >
              {intl.get('hzero.common.model.save').d('保存')}
            </Button>
            {onClose}
          </div>
        ),
      });
    } else {
      notification.warning({
        message: intl.get('spfm.adaptorTaskDetail.view.message.waring').d('请选择输入结构！'),
      });
    }
  };

  render() {
    return (
      <span className="action-link">
        <a onClick={() => this.showScript()}>
          {intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')}
        </a>
      </span>
    );
  }
}
