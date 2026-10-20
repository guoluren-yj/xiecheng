/* eslint-disable no-await-in-loop */
import React, { Component, createRef } from 'react';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Switch,
  Table,
  TextArea,
  TextField,
  Tabs,
  Modal as ProModal,
} from 'choerodon-ui/pro';
import { Modal, Tag } from 'choerodon-ui';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import notification from "hzero-front/lib/utils/notification";
import request from "hzero-front/lib/utils/request";

import WxTplMapping from "./WxTplMapping";
import { msgUrlMappingDS } from './stores/msgUrlMappingDS';

// eslint-disable-next-line prefer-destructuring
const TabPane = Tabs.TabPane;

@formatterCollections({ code: ['smbl.msgUrlMapping', 'smbl.common', 'hzero.common'] })
export default class MsgUrlMapping extends Component {
  /**
   * tableDs：消息DataSet
   * todoTableDs：待办DataSet
   */
  tableDs = new DataSet(msgUrlMappingDS('MESSAGE'));

  todoTableDs = new DataSet(msgUrlMappingDS('TODO'));

  constructor(props) {
    super(props);
    this.state = {
      visible: false, // 消息编辑框显示标识
      todoVisible: false, // 待办编辑框显示标识
      tabPage: 1, // 消息模板配置页：0 | 待办模板配置页：1
    };
  }

  // 消息模板DataSet
  getColumns() {
    return [
      {
        name: 'tenantName',
        align: 'center',
        width: 120,
      },
      { name: 'templateCode' },
      { name: 'channelName' },
      {
        name: 'urlTemplate',
        align: 'center',
        width: 400,
      },
      { name: 'enabledFlag' },
      { name: 'remark' },
      {
        header: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        width: 120,
        renderer: ({ record }) => {
          if (getCurrentOrganizationId() > record.get('tenantId')) {
            return <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>;
          } else {
            return <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>;
          }
        },
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        command: ({ record }) => {
          const opts = [];
          // eslint-disable-next-line eqeqeq
          if (getCurrentOrganizationId() == record.get('tenantId')) {
            opts.push(
              <a key="edit-value" onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.editor').d('编辑')}
              </a>,
              <a key="del-value" onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          }
          opts.push(record.get("useCategoryTemplateFlag") === 1 && (
            <a key="wx-tpl-value" onClick={() => this.openWxTplMapping(record)}>
              {intl.get('smbl.common.button.wxTplMapping').d('服务号模板维护')}
            </a>
          ));
          return opts;
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  // 待办模板DataSet
  getTodoColumns() {
    return [
      {
        name: 'tenantName',
        align: 'center',
        width: 120,
      },
      { name: 'templateCode' },
      {
        name: 'urlTemplate',
        align: 'center',
        width: 400,
      },
      { name: 'enabledFlag' },
      { name: 'remark' },
      {
        header: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        width: 120,
        renderer: ({ record }) => {
          if (getCurrentOrganizationId() > record.get('tenantId')) {
            return <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>;
          } else {
            return <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>;
          }
        },
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        command: ({ record }) => {
          if (getCurrentOrganizationId() > record.get('tenantId')) {
            return [];
          }
          return [
            <Button key="edit-value" funcType="flat" onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </Button>,
            <Button key="del-value" funcType="flat" onClick={() => this.handleDelete(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ];
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.createHandler} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
  ];

  // 新增
  @Bind
  createHandler() {
    // 新增消息模板
    if (Number(this.state.tabPage) === 1) {
      this.tableDs.create({}, 0);
      this.setState({
        visible: true,
      });
    }
    // 新增待办模板
    else {
      this.todoTableDs.create({}, 0);
      this.setState({
        todoVisible: true,
      });
    }
  }

  // 取消
  @Bind
  handleCancel() {
    // 取消编辑消息
    if (Number(this.state.tabPage) === 1) {
      this.tableDs.reset();
      this.setState({ visible: false });
    }
    // 取消编辑待办
    else {
      this.todoTableDs.reset();
      this.setState({ todoVisible: false });
    }
  }

  // 编辑
  @Bind
  handleEdit() {
    // 编辑消息模板
    if (Number(this.state.tabPage) === 1) {
      this.setState({ visible: true });
    }
    // 编辑待办模板
    else {
      this.setState({ todoVisible: true });
    }
  }

  // 删除
  @Bind
  handleDelete(record) {
    // 删除消息模板
    if (Number(this.state.tabPage) === 1) {
      this.tableDs.delete(record);
    }
    // 删除待办模板
    else {
      this.todoTableDs.delete(record);
    }
  }

  // 确定
  @Bind
  handleOk() {
    // 提交消息模板
    if (Number(this.state.tabPage) === 1) {
      this.tableDs.submit().then((res) => {
        if (res || res === undefined) {
          this.setState({ visible: false });
          this.tableDs.query();
        }
      });
    }
    // 提交待办模板
    else {
      this.todoTableDs.submit().then((res) => {
        if (res || res === undefined) {
          this.setState({ todoVisible: false });
          this.todoTableDs.query();
        }
      });
    }
  }

  openWxTplMapping = (record) => {
    const mappingRef = createRef();
    const tenantId = getCurrentOrganizationId();
    ProModal.open({
      drawer: true,
      closable: true,
      style: {
        width: "742px",
      },
      title: intl.get("smbl.common.title.wxTplMapping").d("微信服务号模版维护"),
      children: (
        <WxTplMapping parentRef={mappingRef} urlMappingId={record.get("urlMappingId")} />
      ),
      onOk: async () => {
        if (!mappingRef.current) return false;
        const { headerDs, dsList } = mappingRef.current;
        if (!headerDs.current || !await headerDs.validate()) return false;
        const submitData = headerDs.current.toJSONData();
        const categoryTemplateList = submitData.categoryTemplateList || [];
        for(const [index, item] of dsList.entries()) {
          if (item) {
            const [lineHeaderDs, lineDs] = item;
            if (!lineHeaderDs.current || !await lineHeaderDs.validate()) return false;
            if (!await lineDs.validate()) return false;
            const categoryTemplateId = lineHeaderDs.current.get("categoryTemplateId");
            if (
              lineHeaderDs.current.getField("categoryTemplateId").isDirty() &&
              categoryTemplateId && lineHeaderDs.getState("categoryTemplateId") !== categoryTemplateId
            ) {
              return false;
            }
            const paramMappingList = lineDs.toJSONData().map(i => ({ ...i, tenantId }));
            categoryTemplateList[index] = {
              ...(lineHeaderDs.current && lineHeaderDs.current.toJSONData()),
              paramMappingList: categoryTemplateId ? paramMappingList : [],
            };
          }
        }
        submitData.categoryTemplateList = categoryTemplateList;
        return request(`/smbl/v1/${tenantId}/msg-url-mapping/category-template`, {
          method: "POST",
          query: {
            urlMappingId: record.get("urlMappingId"),
          },
          body: submitData,
        }).then(res => {
          if (getResponse(res)) {
            notification.success();
            this.tableDs.query();
            return true;
          }
          return false;
        });
      },
    });
  }

  /**
   * 切换tab
   * @param {*} v
   */
  @Bind
  checkoutTab = (v) => {
    this.setState({ tabPage: v }, () => {
      this.queryInfo();
    });
  };

  // 刷新数据
  @Bind
  queryInfo = () => {
    if (Number(this.state.tabPage) === 1) {
      // 消息
      this.tableDs.query();
    } else {
      // 待办
      this.todoTableDs.query();
    }
  };

  render() {
    return (
      <>
        <Header
          title={intl.get('smbl.msgUrlMapping.view.title').d('链接推送模板-子应用映射配置')}
        />
        <Content>
          <Tabs defaultActiveKey="1" onChange={this.checkoutTab} style={{ overflow: "hidden" }}>
            <TabPane tab={intl.get('smbl.msgUrlMapping.view.messageTemplate').d('消息模板')} key="1">
              <Table
                dataSet={this.tableDs}
                columns={this.getColumns()}
                queryFieldsLimit={3}
                buttons={this.tableButtons}
                style={{
                    maxHeight: "calc(100vh - 380px)",
                  }}
              />
              <Modal.Sidebar
                zIndex={900}
                title={intl.get('smbl.msgUrlMapping.view.creatMessageTemplate').d('新建消息模板')}
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                cancelText={intl.get('hzero.common.button.cancel').d('取消')}
                okText={intl.get('hzero.common.button.ok').d('确定')}
                width={500}
              >
                <Form dataSet={this.tableDs} columns={1} labelWidth={130}>
                  <TextField name="tenantName" />
                  <TextField name="templateCode" />
                  <Lov name="channel" />
                  <TextField name="urlTemplate" />
                  <Switch name="enabledFlag" />
                  <TextArea name="remark" />
                </Form>
              </Modal.Sidebar>
            </TabPane>
            <TabPane tab={intl.get('smbl.msgUrlMapping.view.todoTemplate').d('待办模板')} key="2">
              <Table
                dataSet={this.todoTableDs}
                columns={this.getTodoColumns()}
                queryFieldsLimit={3}
                buttons={this.tableButtons}
                style={{
                    maxHeight: "calc(100vh - 380px)",
                  }}
              />
              <Modal.Sidebar
                zIndex={900}
                title={intl.get('smbl.msgUrlMapping.view.creatTodoTemplate').d('新建待办模板')}
                visible={this.state.todoVisible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                cancelText={intl.get('hzero.common.button.cancel').d('取消')}
                okText={intl.get('hzero.common.button.ok').d('确定')}
                width={500}
              >
                <Form dataSet={this.todoTableDs} columns={1} labelWidth={130}>
                  <TextField name="tenantName" />
                  <TextField name="templateCode" />
                  <TextField name="urlTemplate" />
                  <Switch name="enabledFlag" />
                  <TextArea name="remark" />
                </Form>
              </Modal.Sidebar>
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
