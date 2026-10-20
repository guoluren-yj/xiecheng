import {
  Button,
  DataSet,
  Form,
  IntlField,
  Lov,
  NumberField,
  Switch,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { message, Modal, Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import SrmImg from '@/components/SrmImg';
import { listLineDS } from './stores/listDS';
import Upload from 'components/Upload/UploadButton';
import { getSubApplicationDetail, crateOrUpdate } from '@/services/subApplicationMaintain';
import formatterCollections from 'utils/intl/formatterCollections';
import { bucketName } from '@/utils/smblConstant.js';
import notification from 'utils/notification';

@formatterCollections({
  code: ['smbl.subApplication', 'smbl.subApplicationGp', 'smbl.application', 'smbl.common'],
})
export default class SubApplicationMaintain extends Component {
  tableDs = new DataSet(listLineDS());

  constructor(props) {
    super(props);
    this.state = {
      imgUrl: '',
      record: {},
      visible: false,
    };
  }

  getColumns() {
    return [
      {
        name: 'iconUrl',
        align: 'center',
        width: 120,
        renderer: ({ record }) => {
          return <SrmImg src={record.get('iconUrl')} bucketName={bucketName} />;
        },
      },
      { name: 'subAppCode' },
      { name: 'subAppName' },
      { name: 'applicationName' },
      { name: 'subAppGroupName' },
      { name: 'menuName' },
      { name: 'enabledFlag', renderer: ({ value }) => enableRender(value) },
      { name: 'subAppDesc' },
      {
        header: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        renderer: ({ record }) => {
          if (record.data && record.data.quoteFlag === 1) {
            return <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>;
          } else {
            return <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>;
          }
        },
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        command: ({ record }) => {
          return [
            <a key="edit-value" funcType="flat" onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>,
          ];
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  @Bind
  createHandler() {
    const record = this.tableDs.create({ tenantId: getCurrentOrganizationId() }, 0);
    this.setState({
      record,
      imgUrl: null,
      visible: true,
    });
  }

  handleOk = async () => {
    this.tableDs.current.set('tempTime', new Date().getTime());
    const flag = await this.tableDs.current.validate();
    if (flag) {
      await this.tableDs.submit().then((res) => {
        if (res && !res.failed) {
          this.setState({ visible: false });
        }
      });
    }
  };

  @Bind
  handleCancel() {
    if (this.state.record.status === 'add') {
      this.tableDs.remove(this.state.record);
    }
    this.tableDs.reset();
    this.setState({ visible: false, imgUrl: null });
  }

  @Bind
  handleEdit(record) {
    record.getField('subAppCode').set('disabled', true);
    const {
      data: { subAppId, iconUrl },
    } = record;

    if (!subAppId) {
      message.error(intl.get('smbl.common.not.found.data').d('数据不存在，请重新载入或检查数据'));
      return;
    }
    getSubApplicationDetail(subAppId).then((response) => {
      const { permissionList = [] } = response;
      const newPermissionList = permissionList.map((item) => ({
        ...item,
        name: item.roleName,
        id: item.roleId,
      }));
      record.set('permissionList', newPermissionList);
      this.setState({
        record,
        imgUrl: iconUrl,
        visible: !this.state.visible,
      });
    });
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk: async () => {
        this.tableDs.remove(record);
        try {
          await this.tableDs.submit();
        } catch (e) {
          // 如果插数据库异常，清空ds里面缓存的数据
          this.tableDs.reset();
        }
      },
    });
  };

  @Bind
  handleUploadSuccess(result) {
    this.state.record.set('iconUrl', result);
    this.setState({ imgUrl: result });
  }

  @Bind
  handleRemoveFile() {
    this.props.dataSet.current.set('iconUrl', null);
    this.setState({ imgUrl: null });
  }

  @Bind
  handlerChange = async (data) => {
    if (!data || data.length < 1) {
      return;
    }
    data.forEach((item) => {
      item.permissionList = [];
    });
    crateOrUpdate(data).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.tableDs.query();
      }
    });
    // 多语言整改，未带多语言过来，以下方法无法新建
    // 清除不是LOV传过来的空数据
    // this.tableDs.reset();
    // data.map((item) => this.tableDs.create({ ...item, quoteFlag: 1, permissionList: [] }));
    // try {
    //   await this.tableDs.submit();
    // } catch (e) {
    //   // 如果插数据库异常，清空ds里面缓存的数据
    //   this.tableDs.reset();
    // }
  };

  lovVal = null;

  @Bind
  handleMenuSearch(dataSet, value) {
    dataSet.query(null, { name: value }, null);
  }

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.createHandler} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    'delete',
  ];

  render() {
    return (
      <>
        <Header title={intl.get(`smbl.subApplication.view.subApplicationDef`).d('子应用维护')}>
          {!(getCurrentOrganizationId() === 0) ? (
            <Lov
              color="primary"
              name="subApp"
              mode="button"
              icon="finished"
              funcType="raised"
              multiple
              clearButton={false}
              dataSet={this.tableDs}
              style={{ marginRight: 10 }}
              onChange={this.handlerChange}
              modalProps={{
                title: intl.get(`smbl.common.button.quoteSite`).d('引用平台'),
              }}
            >
              {intl.get(`smbl.common.button.quoteSite`).d('引用平台')}
            </Lov>
          ) : null}
        </Header>
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={this.getColumns()}
            queryFieldsLimit={3}
            // data={[]}
            buttons={this.tableButtons}
          />
          <Modal.Sidebar
            zIndex={900}
            title={intl.get('hzero.common.button.create').d('新建')}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText={intl.get('hzero.common.button.cancel').d('取消')}
            okText={intl.get('hzero.common.button.ok').d('确定')}
            width={500}
          >
            <Form record={this.state.record} columns={1} labelWidth={130}>
              <Upload
                className="avatar-uploader"
                multiple={false}
                onRemove={this.handleRemoveFile}
                onSuccess={this.handleUploadSuccess}
                bucketName={bucketName}
                name="iconUrl"
                showUploadList={false}
              >
                {this.state.imgUrl ? (
                  <SrmImg src={this.state.imgUrl} bucketName={bucketName} />
                ) : (
                  <Icon type="plus" />
                )}
              </Upload>
              <TextField name="subAppCode" />
              <TextField
                name="redirectUrl"
                disabled={this.state.record.data && this.state.record.data.quoteFlag}
              />
              <IntlField name="subAppName" />
              <IntlField name="subAppDesc" />
              <Lov
                name="application"
                disabled={this.state.record.data && this.state.record.data.quoteFlag}
              />
              <Lov name="subAppGroup" />
              <Switch
                name="outerApplicationFlag"
                disabled={this.state.record.data && this.state.record.data.quoteFlag}
              />
              <Lov
                disabled={this.state.record.data && this.state.record.data.quoteFlag}
                name="menu"
                // onBeforeSelect={({ data }) => {
                //   if (data && data.type === 'menu') {
                //     return true;
                //   }
                //   message.config({
                //     placement: 'bottomRight',
                //     duration: 2,
                //   });
                //   message.error(
                //     intl
                //       .get('smbl.subApplication.view.choose.menu')
                //       .d('不支持维护根目录或自设目录，请勾选菜单')
                //   );
                //   return false;
                // }}
                // tableProps={{
                //   // mode: 'tree',
                //   queryBar: ({ dataSet }) => (
                //     <Input.Search
                //       style={{ marginBottom: '15px' }}
                //       placeholder={intl
                //         .get('smbl.common.view.menu.name.query')
                //         .d('输入菜单名称查询')}
                //       enterButton={<Icon type="search" />}
                //       size="default"
                //       onSearch={(val) => this.handleMenuSearch(dataSet, val)}
                //     />
                //   ),
                // }}
              />
              {getCurrentOrganizationId() === 0 ? null : <Lov name="permissionList" />}
              <NumberField name="sequence" step={1} />
              {/* <Switch name="hotFlag"/> */}
              {/* <NumberField name="hotSeq" step={1}/> */}
              {/* <Switch name="navBarFlag"/> */}
              <Switch name="enabledFlag" />
            </Form>
          </Modal.Sidebar>
        </Content>
      </>
    );
  }
}
