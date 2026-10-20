import React, { Fragment, Component } from 'react';
import './index.less';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { CodeArea, DataSet, Spin, Tooltip, Modal, Lov, Button } from 'choerodon-ui/pro';
import { Icon, Tabs } from 'choerodon-ui';
import { Icon as HZeroIcon } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { paramEditDS, executeJsEditDS } from './indexDS';
import {
  executScrpt,
  getJsCode,
  saveJsCode,
  getRobotJsButtons,
  publishVersionApi,
  cancelPublishVersionApi,
  deployVersionApi,
  createNewVersionApi,
} from '@/services/ExecutableCodeAreaService';
import ExecutableCodeAreaModalSaveData from './ExecutableCodeAreaModalSaveData';

@formatterCollections({ code: ['smbl.purchaseRobotConfig'] })
export default class ExecutableCodeArea extends Component {
  constructor(props) {
    super(props);
    const paramDataSet = new DataSet(paramEditDS());

    this.state = {
      isDebugOpen: true,
      tabActiveKey: 'param',
      paramDataSet,
      response: null,
      loadding: false,
      autoSaveId: this.props.autoSaveId,
      dataSet: null,
      loadError: false,
      subButtons: [],
      status: null,
      displayVersion: null,
      deployedVersion: null,
      codeAreaKey: 60001,
      onLineEditable: false,
      onLineForbidMessageFlag: false,
    };
  }

  componentDidMount() {
    // 合并modal的点击事件
    this.mergeModalAction();
    // 加载数据
    this.loadData();
  }

  // 合并modal的点击事件
  mergeModalAction = () => {
    const { modal, record, name } = this.props;
    if (!modal) {
      console.warn('modal 异常');
      return;
    }
    const { onCancel, onOk, readOnly } = this.props;
    modal.handleOk(async () => {
      const { onLineEditable } = this.state;
      if (!onLineEditable && !readOnly) {
        notification.error({
          message: intl
            .get('smbl.purchaseRobotConfig.view.message.onLineEditError')
            .d('禁止操作，请使用JS脚本服务进行线下编辑'),
        });
        return false;
      }
      // 非编辑状态下，点击确定按钮不拦截
      if (readOnly) {
        const okResult = await this.executOnOk(onOk);
        return okResult;
      }
      this.setState({ loadding: true });
      const showNotification = !!record.get(name);
      const result = await this.modalOkAction();
      if (result === false) {
        this.setState({ loadding: false });
        return false;
      }
      this.executOnOk(onOk);
      this.setState({ loadding: false });
      if (showNotification) {
        notification.success();
      }
      return false;
    });
    modal.handleCancel(async () => {
      let result = await this.modalCancelAction();
      if (result === false) {
        return false;
      }
      if (!onCancel) {
        return true;
      }
      if (this.isPromiss(onCancel)) {
        result = await onCancel();
      } else if (typeof onCancel === 'function') {
        result = onCancel();
      }
      return result;
    });
  };

  executOnOk = async (onOk) => {
    if (!onOk) {
      return true;
    }
    let result = true;
    if (this.isPromiss(onOk)) {
      result = await onOk();
    } else if (typeof onOk === 'function') {
      result = onOk();
    }
    return result;
  };

  modalOkAction = () => {
    const { record, name, autoSaveId, readOnly } = this.props;
    const uuid = record.get(name);
    const { dataSet, loadError, status } = this.state;
    const canEditStatus = status === 'NEW';

    if (!dataSet || loadError || readOnly || !canEditStatus) {
      return Promise.resolve(true);
    }
    const value = dataSet.current.data;
    return new Promise((resolve) => {
      if (autoSaveId) {
        // 如果未变更，则不保存
        const autoSaveData = ExecutableCodeAreaModalSaveData.inputingData[autoSaveId];
        if (autoSaveData && autoSaveData.value === autoSaveData.originValue) {
          resolve(true);
          return;
        }
      }
      this.setState({ loadding: true });
      saveJsCode(value)
        .then((res) => {
          if (getResponse(res)) {
            // 如果当前没有uuid，就保存到record
            if (res.uuid && !uuid) {
              record.set(name, res.uuid);
            }
            this.refreshInfoWithResponse(res, () => {
              // 回调通过
              resolve(true);
            });
          } else {
            console.log('save error = ', res);
            resolve(false);
          }
        })
        .catch((error) => {
          console.log('error = ', error);
          resolve(false);
        });
    });
  };

  modalCancelAction = () => {
    const { dataSet, loadError } = this.state;
    const { readOnly, autoSaveId } = this.props;

    if (!dataSet || loadError || readOnly) {
      ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      // 如果有未保存的数据，提示放弃修改，确认退出删除保存的数据
      const autoSaveData = autoSaveId && ExecutableCodeAreaModalSaveData.inputingData[autoSaveId];
      if (autoSaveData && autoSaveData.value !== autoSaveData.originValue) {
        // 有变更，提示变更未保存
        Modal.confirm({
          children: intl
            .get('smbl.purchaseRobotConfig.view.message.editingCancel')
            .d('有未保存的内容，是否放弃修改？'),
          onCancel: () => {
            resolve(false);
          },
          onOk: () => {
            ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
            resolve(true);
          },
        });
      } else {
        ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
        resolve(true);
      }
    });
  };

  loadData = (currentVersion = null) => {
    const { name, record } = this.props;
    const uuid = record.get(name);

    this.setState({ loadding: true });
    getJsCode(uuid, currentVersion)
      .then((response) => {
        if (getResponse(response)) {
          this.refreshOnLineEditable();
          this.dataDidLoad(response);
          this.refreshButtons(response.robotJsId);
          this.setState({ loadError: false });
        } else {
          this.setState({ loadError: true });
        }
        this.setState({ loadding: false });
      })
      .catch(() => {
        this.setState({ loadding: false, loadError: true });
      });
  };

  // 刷新线上编辑开关
  refreshOnLineEditable = () => {
    const forbidList = ['dev', 'localhost'];
    let isForbidEnv = false;
    for (let i = 0; i < forbidList.length; i++) {
      const element = forbidList[i];
      if (window.location.hostname.indexOf(element) !== -1) {
        isForbidEnv = true;
        break;
      }
    }
    this.setState({
      onLineEditable: !isForbidEnv,
    });
  };

  refreshButtons = (robotJsId, finish) => {
    const callbackFinish = (success) => {
      if (finish && typeof finish === 'function') {
        finish(success);
      }
    };
    if (!robotJsId) {
      this.setState({ subButtons: [] });
      callbackFinish(true);
      return;
    }
    getRobotJsButtons(robotJsId)
      .then((response) => {
        if (getResponse(response) && response instanceof Array) {
          this.setState({ subButtons: response });
          callbackFinish(true);
        } else {
          this.setState({ subButtons: [] });
          callbackFinish(false);
        }
      })
      .catch(() => {
        this.setState({ subButtons: [] });
        callbackFinish(false);
      });
  };

  createDataSet = (response) => {
    const dataSet = new DataSet(executeJsEditDS());
    dataSet.data = [response];

    return dataSet;
  };

  dataDidLoad = (response) => {
    const { autoSaveId, readOnly } = this.props;
    const { executeJs, version, deployedVersion } = response;
    this.setState({
      displayVersion: version,
      deployedVersion,
    });
    let autoSaveData = null;
    if (autoSaveId && !readOnly) {
      autoSaveData = ExecutableCodeAreaModalSaveData.inputingData[autoSaveId];
    }
    let canContinue = false;
    if (autoSaveId && autoSaveData) {
      const autoSaveValue = autoSaveData.value;
      const recordValue = executeJs;
      if (autoSaveValue === null) {
        canContinue = false;
      } else {
        canContinue = autoSaveValue !== recordValue;
      }
    }

    if (readOnly) {
      // 只读框，不自动保存
      this.initData(null, response || {});
    } else if (autoSaveData && canContinue) {
      // 本地保存与传入的不等，提示有正在编辑的内容
      Modal.confirm({
        children: intl
          .get('smbl.purchaseRobotConfig.view.message.editingContinue')
          .d('有正在编辑的内容，是否继续?'),
        onOk: () => {
          this.initData(autoSaveData, response || {});
        },
        onCancel: () => {
          this.initData(null, response || {});
        },
      });
    } else {
      // 相等或者没有变动保存的内容，初始化
      this.initData(null, response || {});
    }

    if (!this.state.paramDataSet.current || !this.state.paramDataSet.current.get('value')) {
      const debugParam = ExecutableCodeAreaModalSaveData.getDebugParam(autoSaveId);

      this.state.paramDataSet.data = [
        {
          value: JSONFormatter.getFormatted(debugParam || ''),
        },
      ];
    }
  };

  initData = (oldSavedData = null, response) => {
    const { executeJs } = response;
    const newOriginValue = executeJs;
    // const newOriginValue = value;
    let displayValue = executeJs;

    if (oldSavedData && !this.props.readOnly) {
      // 有需要替换的旧数据
      displayValue = oldSavedData.value;
    }
    if (!this.props.readOnly && this.state.autoSaveId) {
      // 重新生成自动保存数据对象
      ExecutableCodeAreaModalSaveData.inputingData[this.state.autoSaveId] = null;
      // 使用此时的dataSet值作为保存的value；旧数据回滚，将其值作为修改值保存，防止二次异常退出无法保存
      const autoSaveData = {
        originValue: newOriginValue,
        value: displayValue,
      };
      ExecutableCodeAreaModalSaveData.inputingData[this.state.autoSaveId] = autoSaveData;
    }
    // 初始化status
    const { status = 'NEW' } = response;
    // 初始化dataSet
    const dataSet = this.createDataSet({
      ...response,
      executeJs: displayValue,
    });
    const codeAreaKey = this.state.codeAreaKey + 1;
    this.setState({
      dataSet,
      status,
      codeAreaKey,
    });
  };

  onCodeInput = () => {
    const { readOnly, autoSaveId } = this.props;
    const { dataSet, loadError } = this.state;
    if (!readOnly && dataSet && !loadError) {
      // 保存到autoSaveData
      let autoSaveData = null;
      if (autoSaveId) {
        autoSaveData = ExecutableCodeAreaModalSaveData.inputingData[autoSaveId];
      }
      if (autoSaveData && dataSet.current) {
        // 从record中取出，保持一致
        autoSaveData.value = dataSet.current.get('executeJs');
      }
    }
  };

  onCodeAreaFocus = () => {
    const { onLineEditable, onLineForbidMessageFlag } = this.state;
    if (!onLineEditable && !onLineForbidMessageFlag) {
      this.setState({
        onLineForbidMessageFlag: true,
      });
      notification.error({
        message: intl
          .get('smbl.purchaseRobotConfig.view.message.onLineEditError')
          .d('禁止操作，请使用JS脚本服务进行线下编辑'),
      });
    }
  };

  onParamInput = () => {
    const { autoSaveId } = this.props;
    const { loadError } = this.state;
    if (!loadError) {
      const debugParam = this.state.paramDataSet.current.get('value');
      ExecutableCodeAreaModalSaveData.saveDebugParam(autoSaveId, debugParam);
    }
  };

  // 打开调试框
  openDebugView = () => {
    const { isDebugOpen } = this.state;
    this.setState({
      isDebugOpen: !isDebugOpen,
    });
  };

  // 格式化为JS格式
  formatterToJS = () => {
    const { dataSet, loadError, paramDataSet } = this.state;
    if (!dataSet || loadError) {
      notification.error({
        message: intl
          .get('smbl.purchaseRobotConfig.view.message.loadError')
          .d('数据异常，禁止操作'),
      });
      return;
    }

    let code = null;
    if (dataSet.current) {
      code = dataSet.current.get('executeJs');
    }
    const formatterStr = JSFormatter.getFormatted(code);
    if (dataSet.current) {
      dataSet.current.set('executeJs', formatterStr);
    }
    this.onCodeInput();

    // 格式化参数
    if (paramDataSet && paramDataSet.current) {
      let param = '';
      param = paramDataSet.current.get('value');
      param = JSONFormatter.getFormatted(param || '');
      paramDataSet.current.set('value', param);
      this.onParamInput();
    }
  };

  execute = () => {
    const { dataSet, loadError } = this.state;
    const { paramDataSet } = this.state;

    if (!dataSet || loadError || !paramDataSet) {
      notification.error({
        message: intl
          .get('smbl.purchaseRobotConfig.view.message.loadError')
          .d('数据异常，禁止操作'),
      });
      return;
    }

    let param = paramDataSet.current.get('value') || '{}';
    let code = null;
    if (dataSet.current) {
      code = dataSet.current.get('executeJs');
    }
    if (typeof param === 'string' && !param.length) {
      param = '{}';
    }
    this.setState({
      loadding: true,
    });
    executScrpt({
      params: param,
      script: code,
    }).then((response) => {
      const newReponse = JSON.stringify(response, null, 4);
      this.setState({
        response: newReponse,
        loadding: false,
        tabActiveKey: 'response',
        isDebugOpen: true,
      });
    });
  };

  tabClickAction = (key) => {
    this.setState({
      tabActiveKey: key,
    });
  };

  isPromiss = (val) => {
    return (
      val &&
      (typeof val === 'function' || typeof val === 'object') &&
      typeof val.then === 'function'
    );
  };

  getButtonInfo = (key) => {
    switch (key) {
      case 'publish':
        return {
          icon: 'publish2',
          title: intl.get('smbl.purchaseRobotConfig.view.button.publishVersion').d('发布版本'),
          action: this.publishVersionAction,
          key,
        };
      case 'publishCancel':
        return {
          icon: 'publish_cancel',
          title: intl.get('smbl.purchaseRobotConfig.view.button.cancelPublish').d('取消发布'),
          action: this.cancelPublishVersionAction,
          key,
        };
      case 'newVersion':
        return {
          icon: 'create_new_folder-o',
          title: intl.get('smbl.purchaseRobotConfig.view.button.createVersion').d('创建版本'),
          action: this.createNewVersionAction,
          key,
        };
      case 'deploy':
        return {
          icon: 'redeploy_line',
          title: intl.get('smbl.purchaseRobotConfig.view.button.deployVersion').d('部署版本'),
          action: this.deployVersionAction,
          key,
        };

      default:
        return null;
    }
  };

  refreshInfoWithResponse = (response, finish, from) => {
    const callbackFinish = () => {
      if (finish && typeof finish === 'function') {
        finish();
      }
    };
    if (getResponse(response)) {
      // 刷新数据
      this.state.dataSet.data = [response];
      const codeAreaKey = this.state.codeAreaKey + 1;
      this.setState({ codeAreaKey });
      // 更新自动保存，使用response数据，作为自动保存数据
      const { autoSaveId } = this.props;
      if (autoSaveId) {
        ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
        if (response.status === 'NEW') {
          ExecutableCodeAreaModalSaveData.inputingData[autoSaveId] = {
            originValue: response.executeJs,
            value: response.executeJs,
          };
        }
      }
      if (from === 'deploy') {
        this.setState({
          deployedVersion: response.version,
        });
      }
      // 更新版本状态
      this.setState({ status: response.status, displayVersion: response.version });
      // 刷新按钮列表
      this.refreshButtons(response.robotJsId || '', () => {
        callbackFinish();
      });
    } else {
      callbackFinish();
    }
  };

  // 发布当前的版本
  publishVersionAction = () => {
    const { dataSet } = this.state;
    const value = dataSet.current && dataSet.current.data;

    // 发布时，先调用保存接口，将当前修改的数据保存到网络
    this.setState({ loadding: true });
    saveJsCode(value)
      .then((saveResponse) => {
        if (getResponse(saveResponse)) {
          publishVersionApi(saveResponse)
            .then((response) => {
              this.refreshInfoWithResponse(response, () => {
                this.setState({ loadding: false });
              });
            })
            .catch(() => {
              this.setState({ loadding: false });
            });
        } else {
          this.setState({ loadding: false });
        }
      })
      .catch(() => {
        this.setState({ loadding: false });
      });
  };

  // 取消当前版本的发布
  cancelPublishVersionAction = () => {
    const { dataSet } = this.state;
    const value = dataSet.current && dataSet.current.data;

    this.setState({ loadding: true });
    cancelPublishVersionApi(value)
      .then((response) => {
        this.refreshInfoWithResponse(response, () => {
          this.setState({ loadding: false });
        });
      })
      .catch(() => {
        this.setState({ loadding: false });
      });
  };

  // 新建版本
  createNewVersionAction = () => {
    const { dataSet } = this.state;
    const value = dataSet.current && dataSet.current.data;

    this.setState({ loadding: true });
    createNewVersionApi(value)
      .then((response) => {
        this.refreshInfoWithResponse(response, () => {
          this.setState({ loadding: false });
        });
      })
      .catch(() => {
        this.setState({ loadding: false });
      });
  };

  // 部署当前版本
  deployVersionAction = () => {
    const { dataSet } = this.state;
    const value = dataSet.current && dataSet.current.data;

    this.setState({ loadding: true });
    deployVersionApi(value)
      .then((response) => {
        this.refreshInfoWithResponse(
          response,
          () => {
            this.setState({ loadding: false });
          },
          'deploy'
        );
      })
      .catch(() => {
        this.setState({ loadding: false });
      });
  };

  // 切换版本
  switchVersion = (response) => {
    // 版本相同，不做切换
    if (response.version === this.state.dataSet.current.get('version')) {
      return;
    }
    const { autoSaveId } = this.props;
    if (!autoSaveId) {
      this.loadData(response.version);
      return;
    }
    const autoSaveData = ExecutableCodeAreaModalSaveData.inputingData[autoSaveId];
    if (autoSaveData && autoSaveData.originValue !== autoSaveData.value) {
      // 数据变化, 当前未保存
      Modal.confirm({
        children: intl
          .get('smbl.purchaseRobotConfig.view.message.editingCancel')
          .d('有未保存的内容，是否放弃修改？'),
        onCancel: () => {
          this.state.dataSet.current.set('versionLov', undefined);
        },
        onOk: () => {
          ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
          this.loadData(response.version);
        },
      });
    } else {
      ExecutableCodeAreaModalSaveData.removeAutoSaveData(autoSaveId);
      this.loadData(response.version);
    }
  };

  render() {
    const {
      isDebugOpen,
      tabActiveKey,
      paramDataSet,
      response,
      loadding,
      dataSet,
      loadError,
      subButtons,
      status,
      displayVersion,
      deployedVersion,
      codeAreaKey,
      onLineEditable,
    } = this.state;

    const { readOnly, style, record, name } = this.props;
    const uuid = record.get(name);
    const canEditStatus = status === 'NEW';

    const SubButton = ({ button }) => {
      return (
        <Button color="primary" size="small" onClick={button ? button.action : null}>
          {button ? button.title : null}
        </Button>
      );
    };

    return (
      <Fragment>
        <div className="executable-code-area-page" style={style}>
          <Spin
            spinning={loadding}
            wrapperClassName="executable-code-area-spin"
            style={{ width: '100%', height: '100%' }}
          >
            <div className="executable-code-area" onScroll={(e) => e.preventDefault()}>
              <div
                className="executable-code-area-container"
                style={{ width: isDebugOpen ? '70%' : 'calc(100% - 36px)' }}
              >
                <div className="executable-code-area-top">
                  {subButtons
                    .map((button) => this.getButtonInfo(button))
                    .map((button) => {
                      return <SubButton button={button} />;
                    })}
                  {
                    // uuid不存在不显示切换版本按钮
                    uuid ? (
                      <div style={{ marginLeft: '10px' }}>
                        <Lov
                          name="versionLov"
                          mode="button"
                          funcType="link"
                          clearButton={false}
                          dataSet={dataSet}
                          size="small"
                          onChange={(selected) => this.switchVersion(selected)}
                        >
                          <Button color="primary" size="small">
                            {intl
                              .get('smbl.purchaseRobotConfig.view.button.switchVersion')
                              .d('切换版本')}
                          </Button>
                        </Lov>
                      </div>
                    ) : null
                  }
                  <div className="executable-code-area-top-version">
                    {`${intl
                      .get('smbl.purchaseRobotConfig.view.message.currentVersion')
                      .d('当前版本')}：${displayVersion || 0}`}
                  </div>
                  <div className="executable-code-area-top-version">
                    {`${intl
                      .get('smbl.purchaseRobotConfig.view.message.onLineVersion')
                      .d('线上版本')}：${
                      typeof deployedVersion === 'undefined' || deployedVersion === null
                        ? intl.get('smbl.purchaseRobotConfig.view.message.none').d('无')
                        : deployedVersion
                    }`}
                  </div>
                </div>
                <div className="executable-code-area-input">
                  <CodeArea
                    className="code-area"
                    style={{ width: '100%', height: '100%' }}
                    readOnly={readOnly || loadError || !canEditStatus || !onLineEditable}
                    dataSet={dataSet}
                    options={{
                      theme: 'material',
                      lineWrapping: true,
                    }}
                    onFocus={this.onCodeAreaFocus}
                    name="executeJs"
                    key={codeAreaKey}
                    onChange={this.onCodeInput}
                  />
                </div>
              </div>
              <div className="executable-code-area-debug">
                <div className="debug-buttons">
                  <HZeroIcon
                    type={isDebugOpen ? 'menu-unfold' : 'menu-fold'}
                    style={{ fontSize: '18px', color: 'white', marginTop: '40px' }}
                    onClick={this.openDebugView}
                  />
                  <Tooltip
                    title={intl.get('smbl.purchaseRobotConfig.view.button.debug').d('调试运行')}
                  >
                    <Icon
                      type="bug_report"
                      style={{ fontSize: '18px', color: 'white', marginTop: '16px' }}
                      onClick={this.execute}
                    />
                  </Tooltip>
                  <Tooltip
                    title={intl
                      .get('smbl.purchaseRobotConfig.view.button.codeFormatter')
                      .d('代码美化')}
                  >
                    <HZeroIcon
                      type="profile"
                      style={{ fontSize: '18px', color: 'white', marginTop: '16px' }}
                      onClick={this.formatterToJS}
                    />
                  </Tooltip>
                </div>
                <div className="debug-content">
                  <Tabs
                    defaultActiveKey="param"
                    tabBarStyle={{
                      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                      paddingLeft: '15px',
                    }}
                    activeKey={tabActiveKey}
                    style={{ width: '100%', height: '100%' }}
                    onTabClick={this.tabClickAction}
                  >
                    <Tabs.TabPane
                      tab={intl.get('smbl.purchaseRobotConfig.view.tab.requestParam').d('请求参数')}
                      key="param"
                    >
                      <CodeArea
                        style={{ width: '100%', height: '100%' }}
                        className="debug-code-area"
                        options={{ theme: 'material', lineWrapping: true }}
                        // formatter={JSONFormatter}
                        value={this.state.paramValue}
                        dataSet={paramDataSet}
                        name="value"
                        onChange={this.onParamInput}
                      />
                    </Tabs.TabPane>
                    <Tabs.TabPane
                      tab={intl.get('smbl.purchaseRobotConfig.view.tab.response').d('响应结果')}
                      key="response"
                    >
                      <CodeArea
                        style={{ width: '100%', height: '100%' }}
                        readOnly
                        className="debug-code-area"
                        options={{ theme: 'material', lineWrapping: true }}
                        formatter={JSONFormatter}
                        value={response}
                      />
                    </Tabs.TabPane>
                  </Tabs>
                  ,
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </Fragment>
    );
  }
}
