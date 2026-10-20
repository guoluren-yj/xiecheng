/**
 * MarmotScriptButton
 * MarmotScript 脚本编辑器按钮
 * @date: 2021-11-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Modal, Tooltip, Icon } from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import copy from 'copy-to-clipboard';
import { getCurrentUserId } from 'utils/utils';
import notification from 'utils/notification';
import { DEBOUNCE_TIME } from 'utils/constants';
import crypto from 'crypto-js';
import { isFunction, isEmpty, isBoolean, isString, debounce } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { setMarmotScriptCache } from '../util';

import MarmotScriptEditor from '../MarmotScriptEditor';
import styles from './index.less';

const currentUserId = getCurrentUserId();
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
   * titleKeyCode: string - 标题中间的显示字段，来源有：通过scriptCacheKey截取判断是埋点还是配置表，通过titleKeyCode传值
   * titleHeaderName: string - 标题显示字段，来源有：通过scriptCacheKey截取判断是埋点脚本还是独立脚本或者脚本编辑器，通过titleHeaderName传值
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
    titleKeyCode = '',
    titleHeaderName = '',
  } = props;
  // 存储覆盖数据
  const coverPropsRef = useRef({});
  const modalRef = useRef({});
  const [scriptChangeFlag, setScriptChangeFlag] = useState(false);
  const [hotKeyOkLoading, setHotKeyOkLoading] = useState(false);
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
      // 以下字段用于 Bot contextSummary，由 showMarmotScriptEditor 从页面 record 填充
      { name: 'code', type: 'string' },
      { name: 'taskCode', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'runningService', type: 'string' },
      { name: 'resourceLevel', type: 'string' },
      { name: 'quickType', type: 'string' },
      { name: 'permission', type: 'string' },
      { name: 'applyTenantNum', type: 'string' },
      { name: 'tenantNum', type: 'string' },
      { name: 'scriptType', type: 'string' }, // ADAPTOR / SCRIPT_LIB
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

  /**
   * 保存
   * @returns Promise
   */
  const save = () => {
    const saveOnOkFunc = (resole, reject) => {
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
        onSave(resole, reject, marmotScriptContent, coverPropsFnc, setScriptChange);
      } else {
        resole(isAfterSaveCloseModel);
      }
    };

    return new Promise((resole, reject) => {
      const lastUpdated = (record || coverPropsRef.current.record).get('lastUpdatedBy');
      const lastUpdatedBy =
        lastUpdated && isString(lastUpdated) ? Number(lastUpdated) : lastUpdated;
      if (lastUpdatedBy !== currentUserId) {
        Modal.confirm({
          title: intl
            .get('spfm.adaptorTaskDetail.view.message.changeOtherScript')
            .d('当前修改人和最终修改人不一致，是否确定修改？'),
          onOk: () => saveOnOkFunc(resole, reject),
          onCancel: () => {
            resole(false);
          },
        });
      } else {
        saveOnOkFunc(resole, reject);
      }
    }).finally(() => {
      // 快捷保存flag
      setHotKeyOkLoading(false);
      // 保存按钮的loading
      if (!isEmpty(modalRef.current) && isFunction(modalRef.current.update)) {
        modalRef.current.update({
          okProps: { loading: false },
        });
      }
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
        key: saveScriptKey || coverPropsRef.current.saveScriptKey,
        script,
      };
      if (autoSaveFlag) {
        message.destroy();
        message.config({
          top: 50,
          bottom: 100,
          duration: 2,
        });
        message.success(
          intl.get('spfm.adaptorTaskDetail.view.action.success').d('代码已暂存成功!'),
          undefined,
          undefined,
          'top'
        );
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
    coverPropsRef.current = { ...(coverPropsRef.current || {}), ...coverProps };
  };

  // 传给外部以及编辑器内部改变flag更新modal标题, value: boolean
  const setScriptChange = (value) => {
    if (isBoolean(value)) {
      setScriptChangeFlag(value);
      if (!isEmpty(modalRef.current) && isFunction(modalRef.current.update)) {
        modalRef.current.update({
          title: <ModalTitleCom scriptChange={value} />,
        });
        modalRef.current.editFlag = value;
      }
    }
  };

  const getModalCode = (titleCode = '') => {
    copy(titleCode);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl.get('spfm.adaptorTaskDetail.button.copy.success').d('复制成功'),
      undefined,
      undefined,
      'bottomRight'
    );
  };

  // 脚本编辑器modal标题
  const ModalTitleCom = observer((comProps = {}) => {
    const { scriptChange: changeFlag = false } = comProps;
    const { code, taskCode } = (record || coverPropsRef.current.record).get(['code', 'taskCode']);
    const scriptCodeTitle = code || taskCode || '';
    let headerTitle = intl.get('spfm.adaptorTaskDetail.modal.header.title').d('脚本编辑器');
    const tenantCodeTitle = !isEmpty(testParam)
      ? testParam.debugTenantNum || 'SRM'
      : !isEmpty(coverPropsRef.current.testParam)
      ? coverPropsRef.current.testParam.debugTenantNum || 'SRM'
      : 'SRM';
    let keyCode = '|';
    if (scriptCacheKey && isString(scriptCacheKey)) {
      if (scriptCacheKey.indexOf('adaptorTask') > -1) {
        headerTitle = intl
          .get('spfm.adaptorTaskDetail.modal.header.title.adaptorTask')
          .d('埋点脚本');
        keyCode = '|ADAPTOR|';
      }
      if (scriptCacheKey.indexOf('relTable') > -1) {
        headerTitle = intl.get('spfm.adaptorTaskDetail.modal.header.title.relTable').d('独立脚本');
        keyCode = '|SCRIPT_LIB|';
      }
    }
    if (titleKeyCode && isString(titleKeyCode)) {
      keyCode = `|${titleKeyCode}|`;
    }
    if (titleHeaderName && isString(titleHeaderName)) {
      headerTitle = titleHeaderName;
    }
    return (
      <span>
        <span>{headerTitle}</span>
        <span
          style={
            changeFlag ? { padding: '0 8px 0 24px', color: '#1E90FF' } : { padding: '0 8px 0 24px' }
          }
          className={styles['myModal-title']}
        >
          <Icon
            type="link2"
            className="myModal-title-link-icon"
            onClick={() => getModalCode(`${tenantCodeTitle}${keyCode}${scriptCodeTitle}`)}
          />
          {tenantCodeTitle}
          {keyCode}
          {scriptCodeTitle}
        </span>
        <span>
          {changeFlag && (
            <Tooltip
              placement="bottom"
              title={intl
                .get('spfm.adaptorTaskDetail.title.tooltip.nosave')
                .d('脚本未保存，请及时保存')}
              theme="light"
            >
              <span style={{ color: '#1E90FF' }}>*</span>
            </Tooltip>
          )}
        </span>
      </span>
    );
  });

  // 快捷键保存
  const hotKeySave = (script) => {
    if (scriptCodeDs.current && !disabled && !hotKeyOkLoading) {
      scriptCodeDs.current.set('script', script);
      // 快捷键的保存loading
      setHotKeyOkLoading(true);
      if (!isEmpty(modalRef.current) && isFunction(modalRef.current.update)) {
        modalRef.current.update({
          okProps: { loading: true },
        });
      }
      save();
    }
  };

  const handleClose = () => {
    // 清除所有ds
    if ((saveScriptKey || coverPropsRef.current.saveScriptKey) && scriptCacheKey) {
      const script = crypto.enc.Base64.stringify(
        crypto.enc.Utf16.parse(scriptCodeDs.current.get('script'))
      );
      saveScriptData(script, false);
    }
    // 数据重置
    scriptCodeDs.reset();
    scriptOutputDs.reset();
    if (onClose && isFunction(onClose)) {
      onClose();
    }
    // flag重置
    modalRef.current = {};
    setScriptChange(false);
    setHotKeyOkLoading(false);
  };

  const handleConfirmClose = async () => {
    if (modalRef.current && modalRef.current.editFlag) {
      return (
        (await Modal.confirm({
          title: intl
            .get('spfm.adaptorTaskDetail.view.message.no.save')
            .d('代码未保存是否真的关闭？'),
          onOk: handleClose,
        })) === 'ok'
      );
    } else {
      handleClose();
    }
  };

  /**
   * 打开编辑器弹框
   */
  const showMarmotScriptEditor = debounce(() => {
    beforeClickPromise()
      .then(() => {
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
        if (marmotScriptInput || coverPropsRef.current.marmotScriptInput) {
          scriptCodeDs.current.set(
            'input',
            crypto.enc.Utf16.stringify(
              crypto.enc.Base64.parse(marmotScriptInput || coverPropsRef.current.marmotScriptInput)
            )
          );
        }

        // ========== 填充页面 record 字段到 scriptCodeDs，供 Bot contextSummary 使用 ==========
        const curRecord = record || coverPropsRef.current.record;
        if (curRecord) {
          const pageFields = [
            'code',
            'taskCode',
            'description',
            'runningService',
            'resourceLevel',
            'quickType',
            'permission',
            'applyTenantNum',
            'tenantNum',
          ];
          pageFields.forEach((field) => {
            const val = curRecord.get(field);
            if (val !== undefined && val !== null) {
              scriptCodeDs.current.set(field, val);
            }
          });
          // 延用现有 scriptCacheKey 逻辑确定脚本类型
          let scriptType = '';
          if (scriptCacheKey && typeof scriptCacheKey === 'string') {
            if (scriptCacheKey.indexOf('adaptorTask') > -1) {
              scriptType = 'ADAPTOR';
            } else if (scriptCacheKey.indexOf('relTable') > -1) {
              scriptType = 'SCRIPT_LIB';
            }
          }
          // titleKeyCode 覆盖（延用现有 ModalTitleCom 逻辑）
          if (titleKeyCode && typeof titleKeyCode === 'string') {
            scriptType = titleKeyCode;
          }
          if (!scriptType) scriptType = 'ADAPTOR';
          scriptCodeDs.current.set('scriptType', scriptType);
        }

        modalRef.current = Modal.open({
          title: <ModalTitleCom scriptChange={scriptChangeFlag} />,
          children: (
            <MarmotScriptEditor
              testParam={!isEmpty(testParam) ? testParam : coverPropsRef.current.testParam || {}}
              // bindRoutePrefix={bindRoutePrefix}
              scriptVersion={scriptVersion}
              saveScriptKey={saveScriptKey || coverPropsRef.current.saveScriptKey}
              scriptCacheKey={scriptCacheKey}
              scriptCodeDs={scriptCodeDs}
              scriptOutputDs={scriptOutputDs}
              complementaryWords={complementaryWords}
              saveScriptData={saveScriptData}
              lineId={lineId}
              showSelectVersion={showSelectVersion}
              relTableSelectVersion={
                !isEmpty(relTableSelectVersion)
                  ? relTableSelectVersion
                  : coverPropsRef.current.relTableSelectVersion || {}
              }
              showTemplateLibrary={showTemplateLibrary}
              setScriptChange={setScriptChange}
              handleSave={hotKeySave}
            />
          ),
          closable: true,
          destroyOnClose: true,
          keyboardClosable: false,
          fullScreen: true,
          onClose: handleConfirmClose,
          okText: intl.get('hzero.common.model.save').d('保存'),
          onOk: save,
          footer: (onOk, close) => {
            return disabled ? null : [onOk, close];
          },
        });
      })
      .catch((error) => {
        if (error) {
          notification.error({
            message: intl
              .get('spfm.adaptorTaskDetail.view.message.systemException')
              .d('程序出现错误，请联系管理员'),
            description: error,
          });
        } else {
          notification.warning({
            message: intl
              .get('spfm.adaptorTaskDetail.view.error.linkScript')
              .d('无法链接到独立脚本，请联系管理员'),
          });
        }
      });
  }, DEBOUNCE_TIME);

  const beforeClickPromise = () => {
    const { beforeClick } = props;
    return new Promise((resole, reject) => {
      if (isFunction(beforeClick)) {
        beforeClick(resole, reject, coverPropsFnc);
      } else {
        resole();
      }
    });
  };

  return (
    <a onClick={showMarmotScriptEditor} style={style}>
      {buttonName || intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')}
    </a>
  );
}

export default formatterCollections({
  code: [
    'spfm.adaptorTask',
    'hzero.common',
    'spfm.adaptorTaskDetail',
    'spfm.adaptorPlayGround',
    'spfm.bot',
  ],
})(MarmotScriptButton);
