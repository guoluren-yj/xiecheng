/**
 *  待办事项列表-详情
 */

import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'dva/router';
import qs from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { getActiveTabKey, updateTab, openTab, closeTab } from 'utils/menuTab';

import MessageHandler from '@/components/MessageHandler';
import { fetchProcessFormToken, acquireFormLock, releaseFormLock } from '@/services/taskService';
import LowCode from './LowCode';
import WorkFlowApproveFormComponent from './WorkflowApproveFormComponent';

@withRouter
@formatterCollections({ code: ['hwfp.approveForm'] })
export default class ApproveForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.frameHeight = 0; // iframe高度，
    this.observer = null; // dom观察者
    this.approveForm = null; // 审批表单
    this.formType = ''; // 表单类型
    this.state = {
      formToken: null,
    };
  }

  componentDidMount() {
    fetchProcessFormToken().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.replaceTab(result);
        this.setState({
          formToken: result,
        });
      }
    });
    MessageHandler.on('openTab', this.openIframeTab).start();
    MessageHandler.on('closeTab', this.closeIframeTab).start();
    MessageHandler.on('link', this.linkIframeTab).start();
  }

  replaceTab = (formToken) => {
    const activeTabKey = getActiveTabKey();
    const { tabs } = window.dvaApp._store.getState().global;
    if (activeTabKey && tabs && tabs.length) {
      const activeTab = tabs.find((i) => i.key === activeTabKey);
      if (activeTab) {
        const { search } = activeTab;
        // 流程表单内接口权限, 需要拼接token
        const paramStr = qs.stringify({
          ...qs.parse((search || '').slice(1)),
          's-workflow-token': formToken,
          // 审批工作台待审批弹窗封装成组件给模块使用，此处加isWorkFlow标识，用于判断接口是否加请求头s-workflow-token
          isWorkFlow: true,
        });
        updateTab({
          ...activeTab,
          search: `?${paramStr}`,
        });
        window.history.pushState(null, null, '?'.concat(paramStr));
      }
    }
  };

  // iframe点击链接打开新tab页
  openIframeTab(event) {
    if (event && event.data && event.data.data) {
      try {
        const tabJson = JSON.parse(event.data.data);
        openTab(tabJson);
      } catch (error) {
        console.log(error);
      }
    }
  }

  // iframe点击链接关闭tab页
  closeIframeTab(event) {
    if (event && event.data && event.data.data) {
      try {
        const tabKey = event.data.data;
        closeTab(tabKey);
      } catch (error) {
        console.log(error);
      }
    }
  }

  // iframe点击链接路由跳转
  linkIframeTab = (event) => {
    if (event && event.data && event.data.data) {
      try {
        const tabKey = JSON.parse(event.data.data);
        if (this.props.history) {
          this.props.history.push(tabKey);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    // MessageHandler.end();
  }

  /**
   * approveForm submit data
   */
  @Bind()
  submit({ approveResult, processInstanceId, task }, errorCallback) {
    switch (this.formType) {
      case 'include':
        {
          // RouteComponent
          const submit = this.approveForm;
          if (submit) {
            acquireFormLock(processInstanceId)
              .then((res) => {
                if (getResponse(res) && res && res.lock) {
                  // 日志调试，勿删
                  console.log('[swfl]: approve form is submiting');
                  this.approveForm(
                    ['Approved', 'ApproveAndAddSign'].includes(approveResult)
                      ? 'Approved'
                      : approveResult,
                    task
                  ).then(
                    () => {
                      const { onAction } = this.props;
                      const data = { approveResult, formLock: res.lock };
                      onAction(data);
                    },
                    (error) => {
                      notification.error({
                        message:
                          error && error.message
                            ? error.message
                            : intl.get('hwfp.approveForm.view.message.notPass').d('审批表单不通过'),
                      });
                      releaseFormLock({ processInstanceId, formLock: res.lock });
                      if (errorCallback && typeof errorCallback === 'function') {
                        errorCallback();
                      }
                      return error;
                    }
                  );
                } else if (errorCallback && typeof errorCallback === 'function') {
                  errorCallback();
                }
              })
              .catch(() => {
                if (errorCallback && typeof errorCallback === 'function') {
                  errorCallback();
                }
              });
          } else {
            // 没有submit函数时 直接审批
            const { onAction } = this.props;
            const data = { approveResult };
            onAction(data);
          }
        }
        break;
      case 'http':
      case 'https':
      case 'relative':
        {
          // iframe
          const dom = this.approveForm;
          const data = { approveResult };
          if (dom) {
            dom.contentWindow.postMessage(JSON.stringify(data), '*');
          }
          // TODO 2019.3.12增加line54(只查看iframe中的内容就能审批，不用交互)
          this.props.onAction(data);
        }
        break;
      case 'low-code':
        {
          const ds = this.approveForm;
          if (ds) {
            ds.submit().then((r) => {
              if (r) {
                const { onAction } = this.props;
                onAction(r);
              }
            });
          }
        }
        break;
      default:
        break;
    }
  }

  @Bind()
  handleLoad() {
    const iframeBody = this.approveForm.contentWindow.document.body;
    const computedIframeHeight = () => {
      //  观察器的配置（需要观察什么变动）
      const config = {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      };
      const callback = () => {
        const iframeConent = iframeBody.getElementsByClassName('ant-layout')[0];
        if (iframeConent && this.approveForm) {
          iframeConent.style.height = 'auto';
          iframeConent.style.overflow = 'visible';
          const { scrollHeight } = iframeConent;
          if (scrollHeight && this.height !== scrollHeight) {
            this.height = scrollHeight;
            this.approveForm.height = scrollHeight;
          }
          if (this.approveForm.height === 150) {
            this.height = 500;
            this.approveForm.height = 500;
          }
        }
      };
      this.observer = new MutationObserver(callback);
      this.observer.observe(iframeBody, config);
    };
    // 定时器用于查询表单dom元素是否存在，防止dom元素不存在导致MutationObserver监听器未触发
    const timer = setInterval(() => {
      if (iframeBody.getElementsByClassName('ant-layout')[0]) {
        clearInterval(timer);
        computedIframeHeight();
      }
    }, 200);
  }

  onLoad = ({ submit }) => {
    this.approveForm = submit;
  };

  onLoadDs = ({ dataSet }) => {
    this.approveForm = dataSet;
  };

  render() {
    const { formToken } = this.state;
    const {
      formKey = '',
      moduleForm = '',
      formDefinitionCode,
      originFormKey,
      businessKey,
      processDefinitionId,
      processDefinitionKey,
      // detail,
      disabled = false,
      originRouterProps,
      onFormLoaded,
    } = this.props;
    const workProcessInfo = {
      formCode: formDefinitionCode,
      processCode:
        processDefinitionKey ||
        (processDefinitionId ? processDefinitionId.split(':')[0] : undefined),
    };
    // const {
    //   formKey = '',
    //   formDefinitionCode,
    //   originFormKey,
    //   processInstance: { businessKey = '' } = {},
    // } = detail;
    let formKeyV = null;
    let originFormKeyV = null;
    if (formKey) {
      this.formType = formKey.substring(0, formKey.indexOf('://'));
      switch (this.formType) {
        case 'http':
        case 'https':
          if (formKey.indexOf('?') > 0) {
            formKeyV = `${formKey}&businessKey=${businessKey}&disabled=${disabled}&formCode=${workProcessInfo.formCode}&processCode=${workProcessInfo.processCode}`;
          } else {
            formKeyV = `${formKey}?businessKey=${businessKey}&disabled=${disabled}&formCode=${workProcessInfo.formCode}&processCode=${workProcessInfo.processCode}`;
          }
          break;
        case 'relative': // 相对路径处理，约定前缀为relative:// 为相对路径
          if (formKey.indexOf('?') > 0) {
            formKeyV = `//${window.location.host}${window?.$$env?.BASE_PATH || ''}${formKey.substr(
              11
            )}&businessKey=${businessKey}&disabled=${disabled}&formCode=${
              workProcessInfo.formCode
            }&processCode=${workProcessInfo.processCode}&noCheckPermission=true`;
          } else {
            formKeyV = `//${window.location.host}${window?.$$env?.BASE_PATH || ''}${formKey.substr(
              11
            )}?businessKey=${businessKey}&disabled=${disabled}&formCode=${
              workProcessInfo.formCode
            }&processCode=${workProcessInfo.processCode}&noCheckPermission=true`;
          }
          break;
        case 'include':
          {
            const urlParams =
              formKey.indexOf('?') > 0 ? '&noCheckPermission=true' : '?noCheckPermission=true';
            formKeyV = `${formKey.substr(10)}${urlParams}`;
            originFormKeyV = `${originFormKey.substr(10)}${urlParams}`;
          }
          break;
        case 'low-code':
          // low-code
          formKeyV = formKey.substr(11);
          break;
        default:
          break;
      }
    }
    if (!formToken) {
      return null;
    }
    switch (this.formType) {
      case 'http':
      case 'https':
      case 'relative':
        return (
          <iframe
            id="includeFrame"
            ref={(ref) => {
              this.approveForm = ref;
            }}
            title="iframe"
            src={formKeyV}
            // height="1000"
            width="100%"
            onLoad={this.handleLoad}
            frameBorder="0"
            style={{ width: '100%', overflow: 'hidden', border: '1px solid #f5f5f5' }}
          />
        );
      case 'low-code':
        return (
          <LowCode
            code={formKeyV}
            id={businessKey}
            type="form"
            disabled={disabled}
            onLoad={this.onLoadDs}
          />
        );
      case 'include':
        return (
          <WorkFlowApproveFormComponent
            disabled={disabled}
            formKey={formKeyV}
            module={moduleForm}
            workProcessInfo={workProcessInfo}
            originRouterProps={originRouterProps}
            originFormKey={originFormKeyV}
            code={formDefinitionCode}
            id={businessKey}
            onLoad={this.onLoad}
            onFormLoaded={onFormLoaded}
          />
        );
      default:
        return null;
    }
  }
}
