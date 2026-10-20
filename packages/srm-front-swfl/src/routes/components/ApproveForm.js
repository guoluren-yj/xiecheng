import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import LowCode from './LowCode';
import WorkFlowApproveFormComponent from './WorkflowApproveFormComponent';
import { isJSON } from '../../utils/util';

import { fetchProcessFormToken } from '@/services/taskService';

export default class ApproveForm extends Component {
  approveForm;

  /**
   * 表单类型, tpl relative low-code
   * @type {string}
   */
  formType = '';

  state = {
    formToken: null,
  };

  componentDidMount() {
    fetchProcessFormToken().then((res) => {
      let response;
      if (isJSON(res)) {
        response = JSON.parse(res);
      } else {
        response = res;
      }
      const result = getResponse(response);
      if (result) {
        this.setState({
          formToken: result,
        });
      }
    });
  }

  /**
   * approveForm submit data
   */
  @Bind()
  submit(approveResult) {
    switch (this.formType) {
      case 'include':
        {
          // RouteComponent
          const submit = this.approveForm;
          if (submit) {
            this.approveForm(approveResult).then(
              () => {
                const { onAction } = this.props;
                const data = { approveResult };
                onAction(data);
              },
              (error) => {
                notification.error({
                  message: intl.get('hwfp.approveForm.view.message.notPass').d('审批表单不通过'),
                });
                return error;
              }
            );
          } else {
            notification.error({
              message: intl
                .get('hwfp.approveForm.view.message.missMethod')
                .d('缺少审批表单校验方法'),
            });
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
    // TODO: 现在不能动态高度
    // const { detail } = this.props;
    // const { formKey = '' } = detail;
    // if ((formKey.substring(0, 11) === 'relative://' ||formKey.indexOf(window.location.host) > -1)
    // && (this.approveForm.contentWindow || this.approveForm.contentDocument.parentWindow)) {
    //   const iframeWin = this.approveForm.contentWindow || this.approveForm.contentDocument.parentWindow;
    //   if (iframeWin.document.body) {
    //     this.approveForm.height = iframeWin.document.body.scrollHeight;
    //   }
    // } else {
    //   this.approveForm.height = 750;
    // }
  }

  onLoad = ({ submit }) => {
    this.approveForm = submit;
  }

  onLoadDs = ({ dataSet }) => {
    this.approveForm = dataSet;
  }

  render() {
    const { formToken } = this.state;
    const { detail, disabled = false, originRouterProps } = this.props;
    const {
      formKey = '',
      moduleForm = '',
      formDefinitionCode,
      originFormKey,
      processInstance: { businessKey = '' } = {},
    } = detail;
    let formKeyV = null;
    let originFormKeyV = null;
    if (formKey) {
      this.formType = formKey.substring(0, formKey.indexOf('://'));
      switch (this.formType) {
        case 'http':
        case 'https':
          if (formKey.indexOf('?') > 0) {
            formKeyV = `${formKey}&businessKey=${
              businessKey || detail.businessKey
            }&disabled=${disabled}`;
          } else {
            formKeyV = `${formKey}?businessKey=${
              businessKey || detail.businessKey
            }&disabled=${disabled}`;
          }
          break;
        case 'relative': // 相对路径处理，约定前缀为relative:// 为相对路径
          if (formKey.indexOf('?') > 0) {
            formKeyV = `//${window.location.host}${
              window.$$env.BASE_PATH ? window.$$env.BASE_PATH : ''
            }
            ${formKey.substr(11)}&businessKey=${
              businessKey || detail.businessKey
            }&disabled=${disabled}`;
          } else {
            formKeyV = `//${window.location.host}${
              window.$$env.BASE_PATH ? window.$$env.BASE_PATH : ''
            }
            ${formKey.substr(11)}?businessKey=${
              businessKey || detail.businessKey
            }&disabled=${disabled}`;
          }
          break;
        case 'include':
          formKeyV = formKey.substr(10);
          originFormKeyV = originFormKey.substr(10);
          break;
        case 'low-code':
          // low-code
          formKeyV = formKey.substr(11);
          break;
        default:
          break;
      }
    }
    // 流程表单内接口权限, 需要拼接token
    if (formToken) {
      const { href } = window.location;
      const paramStr = (href || '').split('?')[1];
      const param = {
        ...qs.parse(paramStr),
        's-workflow-token': formToken,
      };
      window.history.pushState(null, null, '?'.concat(qs.stringify(param)));
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
            height="1000"
            width="100%"
            // onLoad={this.handleLoad}
            frameBorder="0"
          />
        );
      case 'low-code':
        return (
          <LowCode
            code={formKeyV}
            id={businessKey || detail.businessKey}
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
            originRouterProps={originRouterProps}
            originFormKey={originFormKeyV}
            code={formDefinitionCode}
            id={businessKey || detail.businessKey}
            onLoad={this.onLoad}
          />
        );
      default:
        return null;
    }
  }
}
