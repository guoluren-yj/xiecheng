import React, { Fragment, Component } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DataSet,
  Form,
  TextField,
  Lov,
  Select,
  Button,
  Switch,
  Modal,
  IntlField,
} from 'choerodon-ui/pro';
import { TopSection } from 'srm-front-boot/lib/components/Section';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { detailDS, messageTemplateLineDS, batchSelectTemplate } from './indexDS';

@formatterCollections({ code: ['smbl.purchaseRobotWebhook'] })
export default class PurchaseRobotWebhookDetail extends Component {
  constructor(props) {
    super(props);
    const webhookRobotId = this.props.match.params.webhookRobotId || null;

    let detailDataSet = null;
    let lineDataSet = null;
    if (webhookRobotId === 'add') {
      detailDataSet = new DataSet(detailDS(null));
      detailDataSet.create(
        {
          enabledFlag: 1,
          tenantId: getCurrentOrganizationId(),
          // requestType: 'webhook',
          requestMethod: 'POST',
          robotType: 'WARN_MSG',
        },
        0
      );
      lineDataSet = null;
    } else {
      detailDataSet = new DataSet(detailDS(webhookRobotId));
      lineDataSet = new DataSet(messageTemplateLineDS(webhookRobotId));
    }

    this.state = {
      detailDataSet,
      lineDataSet,
      webhookRobotId,
    };
  }

  submitButtonAction = () => {
    if (this.state.webhookRobotId !== 'add') {
      this.state.detailDataSet.submit();
      return;
    }
    this.state.detailDataSet.submit().then((res) => {
      if (getResponse(res)) {
        // 新建之后，重新创建dataSet，并将路由替换为新建的单据
        const webhookRobotId = res.content[0].id;
        const detailDataSet = new DataSet(detailDS(webhookRobotId));
        const lineDataSet = new DataSet(messageTemplateLineDS(webhookRobotId));
        this.setState({
          detailDataSet,
          lineDataSet,
          webhookRobotId,
        });
        this.props.history.replace(`/smbl/purchase-robot/webhook/detail/${webhookRobotId}`);
      }
    });
  };

  templateLineColumns = [
    {
      name: 'template',
      editor: (record) => record.get('editState') === 'edit' || record.get('editState') === 'add',
    },
    { name: 'templateName' },
    {
      name: 'templateSourceId',
      renderer: ({ value }) => {
        if (typeof value === 'undefined' || value === null) {
          return '-';
        }
        if (Number(value) === Number(getCurrentOrganizationId())) {
          return intl.get('smbl.purchaseRobotWebhook.view.message.userDefined').d('自定义');
        } else {
          return intl.get('smbl.purchaseRobotWebhook.view.message.preDefined').d('预定义');
        }
      },
    },
    { name: 'templateTitle' },
    { name: 'templateContent' },
    {
      name: 'action',
      renderer: ({ record }) => {
        const commands = [];
        if (record.get('editState') === 'edit' || record.get('editState') === 'add') {
          commands.push(
            <a
              key="cancel-value"
              funcType="flat"
              // style={{ marginRight: '10px' }}
              onClick={() => this.editCancelRecord(record)}
            >
              {intl.get('smbl.purchaseRobotWebhook.button.editorCancel').d('取消')}
            </a>
          );
        } else {
          commands.push(
            <a
              key="edit-value"
              funcType="flat"
              // style={{ marginRight: '10px' }}
              onClick={() => this.editRecord(record)}
            >
              {intl.get('smbl.purchaseRobotWebhook.button.editor').d('编辑')}
            </a>
          );
        }
        return <>{commands}</>;
      },
      lock: 'right',
      align: 'left',
    },
  ];

  editRecord = (record) => {
    record.set('editState', 'edit');
  };

  editCancelRecord = (record) => {
    const editState = record.get('editState');
    if (editState === 'add') {
      Modal.confirm({
        children: intl
          .get('smbl.purchaseRobotWebhook.view.message.deleteThisLine')
          .d('是否删除该行？'),
        onOk: () => {
          this.state.lineDataSet.remove(record, true);
          record.set('editState', undefined);
        },
      });
    } else {
      record.reset();
      record.set('editState', undefined);
    }
  };

  batchNewDataSet = null;

  lineButtons = () => {
    this.batchNewDataSet = new DataSet(batchSelectTemplate());
    return [
      <Lov
        color="primary"
        name="template"
        mode="button"
        icon="playlist_add"
        funcType="flat"
        multiple
        clearButton={false}
        dataSet={this.batchNewDataSet}
        style={{ marginRight: 10 }}
        onChange={this.handlerChange}
        modalProps={{
          title: intl.get(`smbl.purchaseRobotWebhook.button.new`).d('新建'),
        }}
      >
        {intl.get(`smbl.purchaseRobotWebhook.button.new`).d('新建')}
      </Lov>,
      [
        'save',
        {
          afterClick: () => {
            this.state.lineDataSet.forEach((record) => {
              record.set('editState', undefined);
            });
          },
        },
      ],
      [
        'delete',
        {
          color: 'red',
        },
      ],
    ];
  };

  handlerChange = (list) => {
    list.reverse().forEach((e) => {
      this.state.lineDataSet.create(
        {
          templateCode: e.templateCode,
          templateId: e.templateId,
          templateName: e.templateName,
          editState: 'add',
          tenantId: getCurrentOrganizationId(),
          webhookRobotId: this.state.webhookRobotId,
        },
        0
      );
    });
    this.batchNewDataSet.current.set('template', null);
  };

  render() {
    const { detailDataSet, lineDataSet } = this.state;
    return (
      <Fragment>
        <Header
          title={intl.get('smbl.purchaseRobotWebhook.view.title.header').d('群机器人配置')}
          backPath="/smbl/purchase-robot/webhook/list"
        >
          <Button icon="save" color="primary" onClick={this.submitButtonAction}>
            {intl.get('smbl.purchaseRobotWebhook.button.title.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <TopSection>
            <Form dataSet={detailDataSet} columns={3} labelLayout="float" useColon={false}>
              <IntlField name="groupsName" />
              <IntlField name="robotName" />
              <Lov name="platform" />
              <TextField name="webhookUrl" />
              <Select name="camp" />
              <Lov name="unitsMean" />
              <Lov name="supplierTenant" />
              <Select name="requestMethod" />
              <Switch name="enabledFlag" />
            </Form>
          </TopSection>
          {!lineDataSet ? null : (
            <TopSection
              title={intl.get('smbl.purchaseRobotWebhook.view.title.messageTemplate').d('消息模板')}
            >
              <SearchBarTable
                searchCode="SMBL.PURCHASE_ROBOT_WEBHOOK.TEMPLATE_LIST"
                dataSet={lineDataSet}
                columns={this.templateLineColumns}
                aggregation
                cacheState
                buttons={this.lineButtons()}
              />
            </TopSection>
          )}
        </Content>
      </Fragment>
    );
  }
}
