/**
 * 值集翻译配置
 * @date: 2020-10-13
 * @author: chenjuan <juan.chen01@hand-china.com>
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
  Switch,
  TextArea,
  IntlField,
  Lov,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import withProps from 'utils/withProps';

import { listLineDS, drawerFormDS } from './lineDS';
import style from './index.less';

const tenantId = getCurrentOrganizationId();
@formatterCollections({ code: ['hpfm.valueSetTranslate'] })
@withProps(
  () => {
    const tableDs = new DataSet(listLineDS());
    return {
      tableDs,
    };
  },
  { cacheState: true }
)
export default class ValueSetTranslate extends PureComponent {
  drawerFormDs = new DataSet(drawerFormDS());

  componentDidMount() {
    this.props.tableDs.query(this.props.tableDs.currentPage);
  }

  /**
   * 打开-弹框
   */
  @Bind()
  showDrawer(editAble = false) {
    Modal.open({
      key: Modal.key(),
      title: intl.get('hpfm.valueSetTranslate.view.title.valueSetTranslate').d('值集翻译配置'),
      drawer: true,
      style: {
        width: 600,
      },
      children: (
        <Form dataSet={this.drawerFormDs} columns={2} className={style['c7n-form-label-required']}>
          {isTenantRoleLevel()
            ? [
              <TextField name="translateCode" disabled={editAble} />,
              <IntlField name="translateName" />,
              <Switch name="enabledFlag" />,
              <Lov name="lovCodeLov" />,
              <TextArea
                resize="vertical"
                name="sqlStatement"
                autoSize={{ minRows: 16 }}
                colSpan={2}
                newLine
              />,
              <TextField colSpan={2} name="remark" />,
              ]
            : [
              <TextField name="translateCode" disabled={editAble} />,
              <IntlField name="translateName" />,
              <Lov name="tenantIdLov" />,
              <Lov name="lovCodeLov" />,
              <TextArea
                resize="vertical"
                name="sqlStatement"
                autoSize={{ minRows: 16 }}
                colSpan={2}
                newLine
              />,
              <TextField colSpan={2} name="remark" />,
              <Switch name="enabledFlag" />,
              ]}
        </Form>
      ),
      onOk: async () => {
        if (await this.drawerFormDs.validate()) {
          const res = await this.drawerFormDs.submit();
          this.props.tableDs.query();
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => this.drawerFormDs.reset(),
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.drawerFormDs.create({});
    this.showDrawer(false);
  }

  /**
   * 编辑
   */
  @Bind()
  handleEdit(record) {
    const data = record.toData();
    this.drawerFormDs.setQueryParameter('translateId', data.translateId);
    this.drawerFormDs.query();
    this.showDrawer(true);
  }

  render() {
    const listColumns = [
      !isTenantRoleLevel() && {
        name: 'tenantIdMeaning',
        width: 200,
      },
      {
        name: 'translateCode',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'translateName',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'lovCode',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'remark',
        tooltip: 'overflow',
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      isTenantRoleLevel() && {
        header: intl.get('hzero.common.source').d('来源'),
        width: 100,
        renderer: ({ record }) => {
          return tenantId === record.toData().tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        name: 'action',
        width: 100,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
          </span>
        ),
      },
    ].filter(Boolean);

    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.valueSetTranslate.view.title.valueSetTranslate').d('值集翻译配置')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.props.tableDs} columns={listColumns} />
        </Content>
      </Fragment>
    );
  }
}
