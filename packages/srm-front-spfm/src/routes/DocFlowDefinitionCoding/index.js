/**
 * DocFlowDefinitionCoding.js
 * 节点详情定义页面
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Tabs } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import qs from 'querystring';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import BasicInfoCmp from './component/BasicInfo';
import OverviewOfNodes from './component/OverviewOfNodes';
import ProgressDefinition from './component/ProgressDefinition';
import StatusPhaseMapping from './component/StatusPhaseMapping';
import PerformDocuments from './component/PerformDocuments';
import ActionConfiguration from './component/ActionConfiguration';
import {
  getOverviewOfNodesDs,
  getProgressDefinition,
  getStatusPhaseMapping,
  getJumpDetailLink,
  getPerformDocumentsDs,
  getActionConfigurationDs,
} from './store/docFlowDefinitionCodingDs';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';

import notification from 'utils/notification';
import {
  basicInfoServices,
  putOverviewOfNodes,
  putProgressDefinition,
  putStatusPhaseMapping,
  putJumpDetailLink,
  putPerformDocuments,
  putActionConfiguration,
  getDocFlowDefinitionCoding,
} from '@/services/docFlowDefinitionNodesService';
import './index.less';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();

@formatterCollections({
  code: [
    'spfm.docFlowDefinitionCoding',
    'spfm.overviewOfNodes',
    'spfm.progressDefinition',
    'spfm.rulesDefinition',
    'spfm.statusPhaseMapping',
    'spfm.actionConfiguration',
    'hpfm.individual',
    'hpfm.individuationUnit',
    'sbdm.common',
    'hzero.common',
    'hzero.c7nProUI',
  ],
})
export default class DocFlowDefinitionCoding extends React.Component {
  constructor(props) {
    super(props);
    const { location: { search } } = props;
    const { editor, currentTenantNum, currentTenantId } = qs.parse(search.substr(1));
    this.state = {
      showTab: true,
      contentHeight: 0,
      currentTenantId,
      currentTenantNum,
      editors: editor === '1',
      // 设置当前Tabs的key 用于保存跳入处理进度定义的设置界面再回来时直接进入上次的Tabs页
      currentDefaultActiveKey: 'basicInfo',
      // 判断是进入处理进度定义还是跳转明细链接 他们使用的都是ProgressDefinition这个组件
      currentComponentKey: 'basicInfo',
      // 需传给状态映射设置的相关字段
      thisStatusPhaseMapping: {
        progressDefId: -1,
        fieldName: '',
        operateFieldName: '',
      },
      // 用来存放通过上个界面带来的nodeId获取到的code和name
      preRouterInfo: {
        currentCode: '',
        currentName: '',
        currentLink: '',
        nodeId: '',
      },
    };
    this.overviewOfNodesDs = new DataSet(getOverviewOfNodesDs());
    this.progressDefinitionDs = new DataSet(getProgressDefinition());
    this.statusPhaseMappingDs = new DataSet(getStatusPhaseMapping());
    this.jumpDetailLinkDs = new DataSet(getJumpDetailLink());
    this.performDocumentsDs = new DataSet(getPerformDocumentsDs());
    this.actionConfigurationDs = new DataSet(getActionConfigurationDs());
  }

  componentDidMount() {
    const data = this.props.match.params;
    const { nodeId } = data;
    const divMenu = document.getElementById('detailDocflowId');
    const contentHeight = divMenu?.clientHeight;
    this.setState({ contentHeight });
    // 平台级 点击新建按钮 nodeId： create_node
    if (nodeId !== 'create_node') {
      this.fetchNodeDataChange();
    }
  };

  fetchNodeDataChange = () => {
    const data = this.props.match.params;
    const { nodeId } = data;
    getDocFlowDefinitionCoding(data, { tenantId: organizationId }).then((resp) => {
      if (getResponse(resp)) {
        const { code, name, link } = resp;
        this.setState({
          preRouterInfo: { currentCode: code, currentName: name, currentLink: link, nodeId },
        });
        this.overviewOfNodesDs.setQueryParameter('nodeDefinitionCode', code);
        this.progressDefinitionDs.setQueryParameter('nodeDefinitionCode', code);
        this.jumpDetailLinkDs.setQueryParameter('nodeDefinitionCode', code);
        this.performDocumentsDs.setQueryParameter('nodeDefinitionCode', code);
        this.performDocumentsDs.setState('nodeDefinitionCode', code);
        this.actionConfigurationDs.setQueryParameter('nodeDefinitionCode', code);
        this.progressDefinitionDs.setState('nodeDefinitionCode', code);
        this.overviewOfNodesDs.query();
      }
    });
  }


  // 显示Tabs还是Tabs中处理进度定义组件里的设置界面
  changeShowTab = (record, editors) => {
    if (record) {
      this.statusPhaseMappingDs.setQueryParameter('progressDefId', record.get('id'));
      this.statusPhaseMappingDs.query();
      // this.setState({
      //   thisStatusPhaseMapping: {
      //     progressDefId: record.get('id'),
      //     fieldName: record.get('fieldName'),
      //     operateFieldName: record.get('operateFieldName'),
      //   },
      //   currentComponentKey: 'statusPhaseMapping',
      // });
     const modal = Modal.open({
        drawer: true,
        style:{ width: "1090px"},
        title: intl.get('spfm.statusPhaseMapping.modal.setting.stateMapping').d('状态映射设置'),
        children: <>
          <StatusPhaseMapping
            editors={editors}
            onRef={(node) => {this.modalRef = node;}}
            statusPhaseMappingDs={this.statusPhaseMappingDs}
            changeShowTab={this.changeShowTab}
            thisStatusPhaseMapping={{
              progressDefId: record.get('id'),
              fieldName: record.get('fieldName'),
              operateFieldName: record.get('operateFieldName'),
            }}
          />
       </>,
        okCancel: editors,
        okText: !editors ? intl.get('hzero.common.btn.close').d('关闭')
         : intl.get('hzero.common.button.ok').d('确定'),
        onOk: async () => {
          if (editors) {
            const flag = await this.statusPhaseMappingDs.validate();
            if (flag) {
              this.statusPhaseMappingDs?.created?.forEach((value) => {
                value?.set('tenantId', organizationId);
                value?.set('progressDefId', record?.get('id'));
              });
              // 将新建和更新的record取出 并作为一个新数组传给后端
              const data = [
                ...this.statusPhaseMappingDs?.created.map((record) => record?.toData()),
                ...this.statusPhaseMappingDs?.updated.map((record) => record?.toData()),
              ];
              // 如果没有新数据 则不进行提交
              if (!data.length) {
                notification.warning({
                  message: intl
                    .get('spfm.overviewOfNodes.modal.submit.none')
                    .d('提交前请创建或修改相关信息'),
                });
                return false;
              };
              putStatusPhaseMapping(data).then((resp) => {
                if (getResponse(resp)) {
                  notification.success();
                  this.statusPhaseMappingDs.query();
                  return false;
                } else {
                  return false;
                }
              });
            } else {
              return false;
            }
          } else {
            modal?.close();
          }
        },
      });
    }
    // else {
    //   this.setState({
    //     currentDefaultActiveKey: 'progressDefinition',
    //     currentComponentKey: 'progressDefinition',
    //   });
    //   this.progressDefinitionDs.query();
    // }
    // this.setState({ showTab: !this.state.showTab });
  };

  changeTabs = (val) => {
    this.setState({ currentComponentKey: val});
    if (val === 'basicInfo') {
      this?.form?.formDs?.query();
    }else if (val === 'progressDefinition') {
      this.progressDefinitionDs.query();
    } else if (val === 'overviewOfNodes') {
      this.overviewOfNodesDs.query();
    } else if (val === 'jumpDetailLink') {
      this.jumpDetailLinkDs.query();
      this?.linkModal?.formDs?.query();
    } else if (val === 'performDocuments') {
      this.performDocumentsDs.query();
    } else if (val === 'actionConfiguration') {
      this.actionConfigurationDs.query();
    }
  };

  saveRecord = () => {
    let linkForm = {};
    let currentComSaveDs;
    let currentComSaveService;
    if (this.state.currentComponentKey === 'basicInfo') {
      currentComSaveService = basicInfoServices;
      currentComSaveDs = this?.form?.formDs;
    }else if (this.state.currentComponentKey === 'overviewOfNodes') {
      currentComSaveService = putOverviewOfNodes;
      currentComSaveDs = this.overviewOfNodesDs;
    } else if (this.state.currentComponentKey === 'progressDefinition') {
      currentComSaveService = putProgressDefinition;
      currentComSaveDs = this.progressDefinitionDs;
    } else if (this.state.currentComponentKey === 'jumpDetailLink') {
      currentComSaveService = putJumpDetailLink;
      currentComSaveDs = this.jumpDetailLinkDs;
      linkForm = this?.linkModal?.formDs?.current?.toData();
    } else if (this.state.currentComponentKey === 'statusPhaseMapping') {
      currentComSaveService = putStatusPhaseMapping;
      currentComSaveDs = this.statusPhaseMappingDs;
    } else if (this.state.currentComponentKey === 'performDocuments') {
      currentComSaveService = putPerformDocuments;
      currentComSaveDs = this.performDocumentsDs;
    } else if (this.state.currentComponentKey === 'actionConfiguration') {
      currentComSaveService = putActionConfiguration;
      currentComSaveDs = this.actionConfigurationDs;
    } else {
      return;
    }
    currentComSaveDs.validate().then((res) => {
      if (res) {
        currentComSaveDs.created.forEach((value) => {
          value.set('tenantId', organizationId);
          if (this.state.currentComponentKey === 'statusPhaseMapping') {
            value.set('progressDefId', this.state.thisStatusPhaseMapping.progressDefId);
          } else {
            value.set('nodeDefinitionCode', this.state.preRouterInfo.currentCode);
          }
        });
        // 将新建和更新的record取出 并作为一个新数组传给后端
        const data = this.state.currentComponentKey === 'basicInfo'
          ? {...currentComSaveDs.current.toJSONData(), tenantId: organizationId}
          : this.state.currentComponentKey === "jumpDetailLink"
            ? [...currentComSaveDs.toData()]
            : [
          ...currentComSaveDs.created.map((record) => record.toData()),
          ...currentComSaveDs.updated.map((record) => record.toData()),
          ];
        // 如果没有新数据 则不进行提交
        if (!data.length && !['basicInfo', 'jumpDetailLink'].includes(this.state.currentComponentKey)) {
          notification.warning({
            message: intl
              .get('spfm.overviewOfNodes.modal.submit.none')
              .d('提交前请创建或修改相关信息'),
          });
          return false;
        }
        currentComSaveService(data, linkForm).then((resp) => {
          if (getResponse(resp)) {
            notification.success();
            currentComSaveDs.query();
            if (['jumpDetailLink'].includes(this.state.currentComponentKey)) {
              this?.linkModal?.formDs?.query();
            }
          }
        });
      } else {
        console.log(currentComSaveDs?.getAllValidationErrors());
        notification.warning({
          message: intl
            .get('spfm.overviewOfNodes.modal.submit.error')
            .d('提交前请填写完整相关信息'),
        });
      }
    });
  };

  savePlatformRecord = async () => {
    const urlParams = this.props.match.params;
    const { currentTenantId, currentTenantNum } = this.state;
    const formDs = this?.form?.formDs;
    const lineDs = this?.form?.lineDs;
    const data = lineDs.toData();
    console.log(data, "data");
    if (!isEmpty(data)) {
      const formFlag = await formDs.validate();
      const lineFlag = await lineDs.validate();
      if (formFlag && lineFlag) {
        formDs.current.set('nodeTableRelList', data);
        formDs.current.set('tenantId', currentTenantId);
        const formData = formDs.current?.toData();
        console.log(formData, "formData");
        const resp = await basicInfoServices(formData);
        if (getResponse(resp)) {
          notification.success();
          if (urlParams?.nodeId === "create_node") {
            this.props.history.push(`/spfm/setting/node-definition/edit/${resp?.nodeId}?editor=1&currentTenantNum=${currentTenantNum}&currentTenantId=${currentTenantId}`);
            this.fetchNodeDataChange();
          };
          formDs?.query().then((res) => {
            lineDs.loadData(res?.nodeTableRelList || []);
          })
        }
      };
    }else {
      notification.warning({
        message: intl.get('sdps.newNode.modal.submit.toMore').d('业务实体表中表数量大于0'),
      });
    }
  }

  render() {
    const { preRouterInfo = {}, currentDefaultActiveKey, editors, currentTenantNum } = this.state;
    const backRouterPath = tenantFlag
      ? '/spfm/setting/node-definition-org/list'
      : '/spfm/setting/node-definition/list';
    return (
      <>
        <Header
          title={intl.get('spfm.docFlowDefinitionCoding.modal.title.nodeDetails').d('节点详情')}
          backPath={backRouterPath}
        >
          {editors && (
            <Button
              wait={1000}
              icon='save'
              onClick= {
               this.saveRecord
                // tenantFlag ? this.saveRecord :this.savePlatformRecord
            }
              color="primary"
            >
              {intl.get('hzero.common.model.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content style={{padding:"0px"}} className='content_line'>
            <Tabs
              tabBarGutter="20px"
              tabPosition='left'
              className='content_tabs'
              onChange={this.changeTabs}
              defaultActiveKey={currentDefaultActiveKey}
            >
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.basicInfo')
                  .d('基本信息')}
                key="basicInfo"
              >
              <BasicInfoCmp
                editors={editors}
                data={this.props.match.params}
                code={preRouterInfo.currentCode}
                currentTenantNum={currentTenantNum}
                onRef={(node) => {this.form = node;}}
                currentComponentKey={this.state.currentComponentKey}
              />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.overviewOfNodes')
                  .d('节点概述')}
                key="overviewOfNodes"
              >
                {this.state.preRouterInfo.nodeId && (
                  <OverviewOfNodes
                    editors={editors}
                    data={preRouterInfo}
                    code={preRouterInfo.currentCode}
                    overviewOfNodesDs={this.overviewOfNodesDs}
                  />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.progressDefinition')
                  .d('处理进度定义')}
                key="progressDefinition"
              >
                <ProgressDefinition
                  editors={editors}
                  data={preRouterInfo}
                  code={preRouterInfo.currentCode}
                  changeShowTab={this.changeShowTab}
                  currentComponentDs={this.progressDefinitionDs}
                  currentComponentKey={this.state.currentComponentKey}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.jumpDetailLink')
                  .d('跳转明细链接')}
                key="jumpDetailLink"
              >
                <ProgressDefinition
                  editors={editors}
                  data={preRouterInfo}
                  onRef={(node) => {
                    this.linkModal = node;
                  }}
                  code={preRouterInfo.currentCode}
                  currentComponentDs={this.jumpDetailLinkDs}
                  currentComponentKey={this.state.currentComponentKey}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.performDocuments')
                  .d('执行单据配置')}
                key="performDocuments"
              >
                <PerformDocuments
                  editors={editors}
                  data={this.state.preRouterInfo}
                  performDocumentsDs={this.performDocumentsDs}
                  currentComponentKey={this.state.currentComponentKey}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get('spfm.docFlowDefinitionCoding.modal.tabs.actionConfiguration')
                  .d('操作记录配置')}
                key="actionConfiguration"
              >
                <ActionConfiguration
                  editors={editors}
                  data={this.state.preRouterInfo}
                  code={this.state.preRouterInfo.currentCode}
                  actionConfigurationDs={this.actionConfigurationDs}
                />
              </Tabs.TabPane>
            </Tabs>
        </Content>
      </>
    );
  }
}
