/**
 * 反馈单来源服务定义-租户
 * @date: 2020-12-30
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Form,
  TextField,
  Select,
  Lov,
  Tabs,
  IntlField,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import {
  listLineDS,
  drawerFormDS,
  templateFormDs,
  parameterDs,
} from './store/FeedbackSourceServiceDs';
import {
  createFeedbackSource,
  saveFeedbackSource,
} from '@/services/feedbackSourceServiceService.js';
import style from './index.less';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
@formatterCollections({ code: ['sodr.feedbackService'] })
export default class FeedbackSourceService extends PureComponent {
  constructor(props) {
    super(props);
    this.tableDs = new DataSet(listLineDS());

    this.drawerFormDs = new DataSet(drawerFormDS());

    this.templateDs = new DataSet(templateFormDs());

    this.parameterDs = new DataSet(parameterDs());

    this.parameterDs.bind(this.drawerFormDs, 'drawerFormDs');

    this.state = {
      activityTabKey: 'parameter',
    };
  }

  @Bind()
  changeTabs(activityTabKey) {
    this.setState({
      activityTabKey,
    });
  }

  @Bind()
  handelCancel(record) {
    record.reset();
    record.setState('editing', false);
  }

  /**
   * 打开-弹框
   */
  @Bind()
  showDrawer(editAble = false) {
    const { activityTabKey } = this.state;
    const parameterColumns = [
      {
        name: 'sourceFieldLov',
        width: 120,
        editor: (record) => record.status === 'add' || record.getState('editing'),
      },
      {
        name: 'sourceName',
        width: 120,
      },
      {
        name: 'fieldIdLov',
        width: 120,
        editor: (record) => record.status === 'add' || record.getState('editing'),
      },
      {
        name: 'fieldName',
        width: 120,
      },
      {
        name: 'enabledFlag',
        width: 120,
        editor: (record) => record.status === 'add' || record.getState('editing'),
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) =>
          record.getState('editing') ? (
            <a onClick={() => this.handelCancel(record)}>
              {intl.get('hzero.common.view.button.cancel').d('取消')}
            </a>
          ) : record.status === 'add' ? (
            <a onClick={() => this.parameterDs.remove(record)}>
              {intl.get('hzero.common.delete').d('清除')}
            </a>
          ) : (
            <a disabled={!editAble} onClick={() => record.setState('editing', true)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];
    const buttons = ['add'];
    Modal.open({
      key: Modal.key(),
      title: intl.get('sodr.feedbackService.view.title.feedbackService').d('反馈来源服务定义'),
      drawer: true,
      style: {
        width: 600,
      },
      destroyOnClose: true,
      children: (
        <React.Fragment>
          <Form
            dataSet={this.drawerFormDs}
            labelLayout="float"
            columns={2}
            className={style['c7n-form-label-required']}
          >
            <TextField name="feedbackSourceCode" disabled={editAble} />
            <IntlField name="feedbackSourceName" />
            <Select name="enabledFlag" clearButton={false} />
            <Lov name="templateIdLov" />
            <Lov name="structureCodeLov" />
            <IntlField
              newLine
              rows={4}
              colSpan={2}
              resize
              type="multipleLine"
              name="feedbackSourceDesc"
              disabled={this.drawerFormDs.toData()[0]?.comeFrom === 'COPY'}
            />
            <IntlField newLine rows={4} colSpan={2} resize type="multipleLine" name="logicDetail" />
          </Form>
          <Tabs activityTabKey={activityTabKey} onChange={this.changeTabs}>
            <TabPane
              tab={intl.get('sodr.feedbackService.view.tab.parameter').d('输入参数')}
              key="parameter"
            >
              <Table buttons={buttons} columns={parameterColumns} dataSet={this.parameterDs} />
            </TabPane>
          </Tabs>
        </React.Fragment>
      ),
      onOk: throttle(
        async () => {
          if ((await this.drawerFormDs.validate()) && (await this.parameterDs.validate())) {
            const params = {
              ...this.drawerFormDs.toJSONData()[0],
              feedbackMappingList: this.parameterDs.toJSONData(),
            };
            const saveRes = getResponse(
              editAble ? await saveFeedbackSource(params) : await createFeedbackSource(params)
            );
            if (saveRes && !saveRes.failed) {
              notification.success();
              this.tableDs.query();
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
      afterClose: () => {
        this.drawerFormDs.loadData([]);
        this.parameterDs.loadData([]);
      },
    });
  }

  /**
   * 打开-弹框
   */
  @Bind()
  showTemplate() {
    Modal.open({
      key: Modal.key(),
      title: intl.get('sodr.feedbackService.view.title.selectTemplate').d('选择模板'),
      drawer: true,
      style: {
        width: 400,
      },
      children: (
        <Form
          dataSet={this.templateDs}
          labelLayout="float"
          className={style['c7n-form-label-required']}
        >
          <TextField name="feedbackSourceCode" />
          <Lov colSpan={1.5} name="templateIdLov" />
        </Form>
      ),
      onOk: async () => {
        if (await this.templateDs.validate()) {
          const res = await this.templateDs.submit();
          this.tableDs.query();
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => this.templateDs.reset(),
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    // this.drawerFormDs.create({});
    this.showDrawer(false);
  }

  /**
   * 编辑
   */
  @Bind()
  handleEdit(record) {
    const data = record.toData();
    this.drawerFormDs.loadData([data]);
    this.parameterDs.query();
    this.showDrawer(true);
  }

  /**
   * 复制
   */
  @Bind()
  handCopy(record) {
    const data = record.toData();
    const { templateHeaderId, templateCode, templateName, ...others } = data;
    this.templateDs.create(others);
    this.showTemplate(true);
  }

  render() {
    const listColumns = [
      {
        name: 'feedbackSourceCode',
        width: 150,
      },
      {
        name: 'feedbackSourceName',
        width: 160,
        tooltip: 'overflow',
      },
      {
        name: 'feedbackSourceDesc',
        width: 160,
        tooltip: 'overflow',
      },
      {
        name: 'logicDetail',
        tooltip: 'overflow',
      },
      {
        name: 'templateName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'dataSource',
        width: 100,
        tooltip: 'overflow',
        renderer: ({ record }) =>
          record.toData().dataSource === 'SELFDEFINED' ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : record.toData().dataSource === 'PREDEFINED' ? (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          ) : (
            <Tag color="blue">{intl.get('hzero.common.copy').d('复制')}</Tag>
          ),
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'creatorName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'edit',
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          Number(organizationId) !== record.toData().tenantId ? (
            <a onClick={() => this.handCopy(record)}>
              {intl.get('hzero.common.button.copy').d('复制')}
            </a>
          ) : (
            <a onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
          ),
      },
    ];
    return (
      <Fragment>
        <Header
          title={intl.get('sodr.feedbackService.view.title.feedbackService').d('反馈来源服务定义')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={listColumns}
            queryFieldsLimit={2}
            buttons={[<div key="advanced-query-slot" />]}
          />
        </Content>
      </Fragment>
    );
  }
}
