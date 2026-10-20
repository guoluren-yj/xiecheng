/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';

import {
  checkGroupButFlag,
  starGroupChat,
  getForecastLists,
  getDdConfig,
} from '@/services/taskService';

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS',
  name: 'processRemote',
})
@withRouter
@connect(({ task }) => ({
  newTask: task,
}))
export default class HeaderButtons extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.uploadModalRef = null;
    this.modalApprovalType = undefined;
    this.script = null; // 用于存储script标签的引用
    this.newScript= null;
    this.state = {
      showQuickReply: false,
      // loadFlag: false,
      groupFlag: false, // 是否有群聊 （金雨科技租户使用）
      groupStatus: false, // 校验群聊接口是否正常调用 （金雨科技租户使用）
      groupData: {}, // 发起群聊或者加入群聊 入参
    };
  }

  approvalModal;

  componentDidMount() {
    // const {
    //   task: { formKey },
    // } = this.props;

    // if (!formKey || !formKey.includes('include://')) {
    //   // 没有表单或者非include表单，页脚按钮无需loading
    // }

    // 判断是否需要展示群聊按钮  然后判断展示创建群聊或者加入群聊
    const { tenantNum } = getCurrentUser();
    if(tenantNum === 'SRM-GOLDRAIN'){
      this.handleConfigDd();
      this.handleGolorainConfig();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.taskId === nextProps.taskId) {
      return;
    }
    this.props = nextProps;
    this.setState({
      showQuickReply: false,
    });
  }

  // 钉钉配置
  @Bind()
  handleConfigDd() {
    // 创建一个新的script元素
    this.script = document.createElement('script');
    this.script.src = 'https://g.alicdn.com/dingding/dingtalk-jsapi/3.0.38/dingtalk.open.js'; // 替换为你的外部脚本URL
    this.script.async = true; // 如果需要异步加载，可以设置这个属性
    this.script.onload = () => {
      const { dd } = window;
      if(dd.env.platform !== "notInDingTalk" ) {
        dd.setNavigationTitle({
          title: 'SRM',
          success: () => {},
          fail: () => {},
          complete: () => {},
        });
      }
      // console.log("dingtalk-jsapi success------");
    };
    this.script.onerror = () => {
      notification.warning({
        message: intl.get('hwfp.common.model.getDdConfig.message').d('获取钉钉JSAPI配置失败'),
      });
    };
    // 将script元素添加到DOM中（通常添加到<head>或<body>）
    document.head.appendChild(this.script);
  }

  // SRM-GOLDRAIN租户单独处理的方法
  @Bind()
  handleGolorainConfig() {
    const {
      task: {
        description, startUserId, processName,
        processDefinitionId, historicTaskExtList,
      },
      processInstanceId,
    } = this.props;
    checkGroupButFlag({processInstanceId}).then(async res =>{
      if(getResponse(res)){
        // groupFlag 为 true 加入群聊 false 创建群聊
        const { groupFlag, groupId } = res;
        this.setState({groupFlag});
        this.setState({groupStatus: true});
        const response1 = await getForecastLists({
          tenantId: getCurrentOrganizationId(),
          processInstanceId,
          processDefinitionId,
        });
        const employeeCodes = [...new Set([...response1, ...historicTaskExtList].filter(item => item.assignee).map(item => item.assignee))];
        const groupData = groupFlag
        ? {
          processInstanceId,
          processName,
          startUserId,
          groupId,
          processDescription: description,
          employeeCodes,
        }
        : {
          processInstanceId,
          startUserId,
          processName,
          processDescription: description,
          employeeCodes,
        };
        this.setState({groupData});
      }
     });
  }

  // 解码URL
  handleUrlDecode = () => {
    const {location: {href, origin, pathname}} = window;

    let newUrl = `${origin}${pathname}?`;
    const urlObj = new URL(href);
    const searchParams = new URLSearchParams(urlObj.search);
    searchParams.forEach((value, key)=>{
      if(['processName', 'startUserName'].includes(key)){
        const decodeValue = decodeURIComponent(searchParams.get(key));
        newUrl = `${newUrl}${key}=${decodeValue}&`;
      }else{
        newUrl = `${newUrl}${key}=${value}&`;
      }
    });

    return newUrl.slice(0, -1);
  };

  handleGroupOrAdd = async () => {
    const {
      groupData,
    } = this.state;
    const { dd } = window;
    if(dd.env.platform !== "notInDingTalk" ) {
      const res = await starGroupChat(groupData);
      if(getResponse(res)){
        this.setState({groupFlag: true});
        const {groupId} = res;
        const newDdUrl = this.handleUrlDecode();
        getDdConfig({url: newDdUrl }).then(configRes => {
          if(getResponse(configRes)){
            dd.config({
              ...configRes,
              jsApiList: [
                'openChatByConversationId',
                'biz.util.openLink',
              ],
              type: 0,
            });
            dd.error((err) => {
              dd.checkJsApi({ jsApiList: [
                'openChatByConversationId',
              ]}).then(q => {
                // eslint-disable-next-line no-alert
                alert(`checkJsApi: ${q}----dd error: ${ JSON.stringify(err)}`);
              });
            });
            dd.ready(() => {
              // console.log('dd ready: ', dd);
              // dd.checkJsApi({ jsApiList: [
              //   'openChatByConversationId',
              // ]}).then(q => console.log('11111111111111', q));
              dd.openChatByConversationId({
                openConversationId: groupId,
                success: () => {
                },
                fail: () => {
                },
                complete: () => {
                },
              });
            });
          }else {
            notification.warning({
              message: intl.get('hwfp.common.model.getDdConfig.message').d('获取钉钉JSAPI配置失败'),
            });
          }
        });
      }
    }else{
      notification.warning({
        message: intl.get('hwfp.common.model.handleGroupOrAdd.message').d('请在钉钉环境中打开本链接'),
      });
    }
  };

  render() {
    const {
      showQuickReply,
      groupFlag,
      groupStatus,
    } = this.state;

    return (
      <div
        // style={{ padding: '12px 20px' }}
        ref={(ref) => {
          this.footerContent = ref;
        }}
      >
        <div
          // className={styles['header-buttons']}
          id="header-buttons"
          style={{ position: 'relative', alignItems: `${showQuickReply ? 'flex-end' : 'center'}` }}
        >
          {
            (getCurrentUser().tenantNum === 'SRM-GOLDRAIN') && (
              <Button
                // className={classnames('no-border-btn', styles['space-btn'])}
                // funcType="flat"
                disabled={!groupStatus}
                onClick={this.handleGroupOrAdd}
              >
                {groupFlag ? intl.get('hwfp.task.view.button.addGroup').d('入群讨论') : intl.get('hwfp.task.view.button.createGroup').d('创建群聊')}
              </Button>
          )}
        </div>
      </div>
    );
  }
}
