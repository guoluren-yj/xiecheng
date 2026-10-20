/**
 * MarmotScriptButton
 * MarmotScript 脚本编辑器按钮
 * @date: 2021-11-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { setMarmotScriptCache } from '../util';
import { helpMsg } from '../MarmotScriptEditor/complementaryWords/helpMsg';

import MarmotScriptEditor from '../MarmotScriptEditor';

function MarmotScriptButton(props = {}) {
  /**
   * name: String - 字段名称
   * record: DataSet.Record - ds 的 record数据
   * scriptVersion: Number - 脚本版本默认为 3
   * bindRoutePrefix: String - 路由前缀，可以从行内数据获取，也可以自己传入固定值，默认值为 SRM_ADAPTOR = 'sada'，暂停使用
   * testParam: Object - 外部传入的 debugger 参数
   * marmotScriptInput: String - 用户输入的测试脚本
   * saveScriptKey: String - 缓存每行脚本数据的key
   * scriptCacheKey: String - 缓存脚本的类型key
   * complementaryWords: String - 自定义脚本编辑器关键字
   * isAfterSaveCloseModel: Boolean - 保存后是否关闭弹框
   * disabled: Boolean - 是否不可保存编辑
   * beforeOpenModal: Function - 打开弹框前回调，返回 coverPropsFnc 方法，如果没有传入 record 可以在使用 coverPropsFnc 来对record 进行设置。
   * onSave: Function - 保存
   * onClose: Function - 关闭
   * style: Object - 外部传入的样式参数
   * scriptDefaultValue: String - 外部传入的默认脚本代码 需加密
   * inputDefaultValue: String - 外部传入的默认测试用例 需加密
   * buttonName: string - 外部传入的按钮描述
   * showSelectVersion: string - 是否显示历史版本选择框 默认false 不显示
   * relTableSelectVersion: Object - 专门给配置表中的脚本代码使用的历史版本 { textObj: {}, tableCode: '', associativeId: '', dataSource: '' } 前提showSelectVersion为true
   * showTemplateLibrary: string - 是否显示模板库按钮 默认true 显示
   */
  const {
    testParam = {},
    record,
    scriptVersion = 3,
    marmotScriptInput = '',
    name: marmotScriptName,
    saveScriptKey,
    scriptCacheKey,
    complementaryWords,
    isAfterSaveCloseModel = false,
    disabled = false,
    beforeOpenModal = () => {},
    onSave,
    onClose,
    style = {},
    scriptDefaultValue = '',
    inputDefaultValue = '',
    buttonName = '',
    // bindRoutePrefix,
    showSelectVersion = false,
    relTableSelectVersion = {},
    showTemplateLibrary = true,
  } = props;
  // 存储覆盖数据
  const coverPropsRef = useRef({});
  // 脚本编辑器 ds
  const scriptCodeDs = new DataSet({
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

  // 代码执行结果ds
  const scriptOutputDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'output',
        type: 'string',
      },
    ],
  });

  // 帮助信息ds
  const helpDs = new DataSet({
    fields: [
      {
        name: 'msg',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(helpMsg)),
      },
    ],
  });

  /**
   * 保存
   * @returns Promise
   */
  const save = () => {
    return new Promise((resole, reject) => {
      const { script, input } = scriptCodeDs.current.get(['script', 'input']);
      // 如果没有传入record并且也没有通过覆盖去对record处理的话，抛错
      if (!record && !coverPropsRef.current.record) {
        throw new Error(
          'must set record or use coverPropsFnc set a cover data for MarmotScript component'
        );
      }
      // Todo: 兼容外部传入和行内传入
      // if (marmotScriptInput) {
      //   (record || coverPropsRef.current.record).set(
      //     marmotScriptInput,
      //     crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(input))
      //   );
      // }
      if (marmotScriptName) {
        (record || coverPropsRef.current.record).set(
          marmotScriptName,
          crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script))
        );
      }
      // 返回加密数据
      const marmotScriptContent = {
        scriptContent: crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)),
        inputContent: crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(input)),
      };
      // 执行自定义的保存方法
      if (onSave && isFunction(onSave)) {
        onSave(resole, reject, marmotScriptContent, coverPropsFnc);
      }
      resole(isAfterSaveCloseModel);
    });
  };

  /**
   * 缓存脚本编辑器内容
   * @param {String} script 脚本内容
   * @param {Boolean} autoSaveFlag 是否提示代码暂存标记
   */
  const saveScriptData = (script, autoSaveFlag = false) => {
    // const script = crypto.enc.Base64.stringify(
    //   crypto.enc.Utf16.parse(scriptCodeDs.current.get('script'))
    // );
    const isChange = (record || coverPropsRef.current.record).get(marmotScriptName) === script;
    if (!isChange) {
      const saveData = {
        key: saveScriptKey,
        script,
      };
      if (autoSaveFlag) {
        notification.success({
          message: intl.get('spfm.adaptorTaskDetail.view.action.success').d('代码已暂存成功!'),
        });
      }
      // 缓存数据
      setMarmotScriptCache(scriptCacheKey, saveData);
    }
  };

  /**
   * 对无法传入的一些数据进行覆盖开发的方法
   * @param {Object} coverProps 覆盖数据集合
   * @returns
   */
  const coverPropsFnc = (coverProps = {}) => {
    if (record) return;
    coverPropsRef.current = coverProps;
  };

  /**
   * 打开编辑器弹框
   */
  const showMarmotScriptEditor = () => {
    if (isFunction(beforeOpenModal)) {
      beforeOpenModal(coverPropsFnc);
    }

    // 必须设置 name
    if (!marmotScriptName) {
      throw new Error('must set name for MarmotScript component');
    }

    // 必须设置 record
    if (!record && !coverPropsRef.current.record) {
      throw new Error(
        'must set record or use coverPropsFnc set a cover data for MarmotScript component'
      );
    }

    // 获取脚本数据和测试数据
    const scriptContent = (record || coverPropsRef.current.record).get(marmotScriptName);
    // const inputContent = (record || coverPropsRef.current.record).get(marmotScriptInput);

    // 获取脚本id
    const lineId = (record || coverPropsRef.current.record).get('id');

    // 外部传入的默认脚本代码
    if (scriptDefaultValue) {
      scriptCodeDs.current.set(
        'script',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptDefaultValue))
      );
    }
    // 外部传入的默认测试用例
    if (inputDefaultValue) {
      scriptCodeDs.current.set(
        'input',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(inputDefaultValue))
      );
    }

    if (scriptContent) {
      scriptCodeDs.current.set(
        'script',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptContent))
      );
    }
    if (marmotScriptInput) {
      scriptCodeDs.current.set(
        'input',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(marmotScriptInput))
      );
    }
    Modal.open({
      title: intl.get('spfm.adaptorTaskDetail.modal.header.title').d('脚本编辑器'),
      children: (
        <MarmotScriptEditor
          testParam={testParam}
          // bindRoutePrefix={bindRoutePrefix}
          scriptVersion={scriptVersion}
          saveScriptKey={saveScriptKey}
          scriptCacheKey={scriptCacheKey}
          scriptCodeDs={scriptCodeDs}
          scriptOutputDs={scriptOutputDs}
          helpDs={helpDs}
          complementaryWords={complementaryWords}
          saveScriptData={saveScriptData}
          lineId={lineId}
          showSelectVersion={showSelectVersion}
          relTableSelectVersion={relTableSelectVersion}
          showTemplateLibrary={showTemplateLibrary}
        />
      ),
      closable: true,
      destroyOnClose: true,
      keyboardClosable: false,
      fullScreen: true,
      onClose: () => {
        // 清除所有ds
        if (saveScriptKey && scriptCacheKey) {
          const script = crypto.enc.Base64.stringify(
            crypto.enc.Utf16.parse(scriptCodeDs.current.get('script'))
          );
          saveScriptData(script, false);
        }
        // 数据重置
        scriptCodeDs.reset();
        scriptOutputDs.reset();
        helpDs.reset();
        if (onClose && isFunction(onClose)) {
          onClose();
        }
      },
      onText: intl.get('hzero.common.model.save').d('保存'),
      onOk: save,
      footer: (onOk, close) => {
        return disabled ? null : [onOk, close];
      },
    });
  };

  return (
    <a onClick={showMarmotScriptEditor} style={style}>
      {buttonName || intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')}
    </a>
  );
}

export default formatterCollections({
  code: ['spfm.adaptorTask', 'hzero.common', 'spfm.adaptorTaskDetail', 'spfm.adaptorPlayGround'],
})(MarmotScriptButton);
