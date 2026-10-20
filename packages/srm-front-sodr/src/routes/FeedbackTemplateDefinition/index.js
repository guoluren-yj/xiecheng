/**
 * index.js 收货执行
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import {
  DataSet,
  Button,
  Table,
  // Icon,
  Modal,
  Form,
  TextField,
  Select,
  IntlField,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';
// import { observer } from 'mobx-react-lite';
// import { isEmpty } from 'lodash';
// import uuid from 'uuid/v4';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import { throttle } from 'lodash';
import { copyFeedback, saveFeedback, publishFeedback } from '@/services/feedbackTemplateService.js';
import { lineDS, formDS } from './store/lineDS';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
// import styles from './index.less';

// const { TabPane } = Tabs;
// const { Search } = Input;

// const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sodr.feedback', 'hzero.common', 'sodr.common'] })
export default class FeedbackTemplate extends Component {
  lineDs = new DataSet(lineDS());

  formDs = new DataSet(formDS());

  constructor(props) {
    super(props);
    this.state = {
      publishLoading: false,
    };
  }

  @Bind()
  handleToDetail(record) {
    const { templateId, splitFlag, templateType } = record.toData();
    this.props.history.push({
      pathname: isTenantRoleLevel()
        ? `/sodr/feedback-template/detail/${templateId}`
        : `/sodr/feedback-template-platform/detail/${templateId}`,
      search: `splitFlag=${splitFlag}&templateType=${templateType}`,
    });
  }

  @Bind()
  handleCreate() {
    this.formDs.create({});
    this.showDrawer(false);
  }

  @Bind()
  handleEdit(record, copyFlag) {
    const data = record.toData();
    this.formDs.loadData([data]);
    const editFlag =
      !(isTenantRoleLevel() && record.get('templateType') === 'PREDEFINED') || copyFlag;
    this.showDrawer(!copyFlag, copyFlag, editFlag);
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  async handlePublish(record) {
    this.setState({ publishLoading: true });
    const data = record.toData();
    const res = getResponse(await publishFeedback([data]));
    if (res) {
      notification.success();
      this.lineDs.query();
    }
    this.setState({ publishLoading: false });
  }

  /**
   * 编辑or新建
   * @param {*} editAble
   */
  @Bind()
  showDrawer(editAble = false, copyFlag = false, editFlag = true) {
    Modal.open({
      key: Modal.key(),
      title: intl.get('sodr.feedback.view.title.feedback').d('反馈单模板定义'),
      drawer: true,
      okFirst: true,
      style: {
        width: 380,
      },
      children: (
        <Form labelLayout="float" disabled={!editFlag} dataSet={this.formDs}>
          <TextField name="templateCode" disabled={editAble} />
          <IntlField name="templateName" />
          <Select name="templateCreateType" disabled={editAble} />
          <Select name="enabledFlag" />
          <Select name="splitFlag" clearButton={false} />
          <IntlField
            name="splitName"
            modalProps={{ title: intl.get(`sodr.common.view.descript`).d('描述') }}
          />
          <Select name="splitLocation" />
          <Select name="splitCamp" clearButton={false} />
          <IntlField rows={4} resize type="multipleLine" name="templateDesc" />
        </Form>
      ),
      onOk: throttle(
        async () => {
          if (!editFlag) {
            return true;
          }
          if (await this.formDs.validate()) {
            const params = [this.formDs.toData()[0]];
            const res = getResponse(
              copyFlag ? await copyFeedback(params) : await saveFeedback(params)
            );
            if (res && !res.failed) {
              notification.success();
              this.lineDs.query();
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
      onCancel: () => true,
      afterClose: () => {
        this.formDs.reset();
      },
    });
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'templateStatusMeaning',
        width: 100,
      },
      {
        name: 'templateCode',
        width: 140,
      },
      {
        name: 'templateName',
        width: 140,
      },
      {
        name: 'templateDesc',
        width: 150,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'enabledFlag',
        width: 90,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'templateType',
        width: 100,
        renderer: ({ record }) =>
          record.toData().templateType === 'CUSTOMIZE' ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : record.toData().templateType === 'PREDEFINED' ? (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          ) : (
            <Tag color="blue">{intl.get('hzero.common.copy').d('复制')}</Tag>
          ),
      },
      {
        name: 'fieldConfig',
        renderer: ({ record }) => (
          <a onClick={() => this.handleToDetail(record)}>
            {record.get('templateType') === 'PREDEFINED' && isTenantRoleLevel()
              ? intl.get('sodr.feedback.model.feedback.newFieldConfig.view').d('查看')
              : intl.get('sodr.feedback.model.feedback.newFieldConfig.edit').d('配置')}
          </a>
        ),
      },
      {
        name: 'action',
        width: 180,
        lock: 'right',
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleEdit(record, false)}>
              {isTenantRoleLevel() && record.get('templateType') === 'PREDEFINED'
                ? intl.get(`hzero.common.button.view`).d('查看')
                : intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            {isTenantRoleLevel() && record.get('templateType') === 'PREDEFINED' && (
              <a
                disabled={
                  record.get('enabledFlag') === 0 && record.get('templateType') === 'PREDEFINED'
                }
                onClick={() => this.handleEdit(record, true)}
              >
                {intl.get('hzero.common.button.copy').d('复制')}
              </a>
            )}
            <a
              disabled={record.get('templateStatus') === 'PUBLISHED'}
              onClick={() => this.handlePublish(record)}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </a>
            {/* <a>
              {intl.get('sodr.feedback.model.feedback.fieldConfig').d('更多操作')}
              <Icon type="arrow_drop_down" />
            </a> */}
          </span>
        ),
      },
    ];
    return columns;
  }

  render() {
    const { publishLoading } = this.state;
    return (
      <Fragment>
        <Header title={intl.get('sodr.feedback.view.title.feedback').d('反馈单模板定义')}>
          <Button icon="add" funcType="raised" color="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            spin={{ spinning: publishLoading }}
            dataSet={this.lineDs}
            columns={this.getColumns()}
            queryFieldsLimit={2}
            buttons={[<div key="advanced-query-slot" />]}
          />
        </Content>
      </Fragment>
    );
  }
}
