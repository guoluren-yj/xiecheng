/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import { observer as observer2 } from "mobx-react";
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import {
  Button,
  DataSet,
  Form,
  IntlField,
  Lov,
  NumberField,
  Table,
  TextField,
  Modal,
  Output,
} from 'choerodon-ui/pro';
import { Tag } from "choerodon-ui";
import { observer } from "mobx-react-lite";
import { Icon } from 'hzero-ui';
import Upload from 'components/Upload/UploadButton';

import { Header } from 'components/Page';
import SrmImg from '@/components/SrmImg';
import { getCurrentOrganizationId, getResponse, notification } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { bucketName } from '@/utils/smblConstant.js';
import SubApplicationGroupDS from './stores/SubApplicationGroupDS';
import styles from './index.less';

@connect(({ subApplicationGroup }) => ({
  subApplicationGroup,
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smbl.subApplicationGp', 'hzero.c7nUI'] })
@observer2
export default class SubApplicationGroupManageList extends PureComponent {
  constructor(props) {
    super(props);
    this.dataSet = new DataSet({
      ...SubApplicationGroupDS(intl),
      autoQuery: false,
    });
    this.state = {
    };
  }

  componentDidMount() {
    this.dataSet.query();
  }

  getColumns() {
    return [
      {
        name: 'iconUrl',
        renderer: ({ record }) => {
          return <SrmImg src={record.get('iconUrl')} bucketName={bucketName} />;
        },
        align: 'center',
      },
      {
        name: 'subAppGroupCode',
        renderer: ({ text, record }) => {
          return [
            <Button key="edit-value" funcType="link" onClick={() => this.handleEdit(record)}>
              {text}
            </Button>,
          ];
        },
      },
      { name: 'subAppGroupName' },
      { name: 'applicationName' },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => {
          const commonProps = { border: false };
          if (value =='1') {
            return <Tag color='green' {...commonProps}>{intl.get("hzero.common.status.enabled").d("启用")}</Tag>;
          } else {
            return <Tag color='red' {...commonProps}>{intl.get("hzero.common.status.disabled").d("禁用")}</Tag>;
          }
        },
      },
      { name: 'sequence' },
      // { name: 'subAppGroupDesc' },
      {
        name: 'operationAction',
        renderer: ({ record }) => {
          return [
            <Button funcType="link" color="primary" onClick={() => this.handleEnable(record)}>
              {record && record.get('enabledFlag') == '1'
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </Button>,
          ];
        },
      },
    ];
  }

  handleEnable = async (record) => {
    record.set("enabledFlag", record.get('enabledFlag') == "1" ? '0' : '1');
    const res = await this.dataSet.submit();
    if (getResponse(res)) {
      notification.success({});
      this.dataSet.query();
    }
  };

  @Bind
  handleEdit(record) {
    record.set(
      'application.applicationName',
      record.get('applicationName')
    );
    Modal.open({
      drawer: true,
      style: { width: "380px" },
      title: intl.get('hzero.common.edit').d('编辑'),
      children: (
        <ModalChildren
          record={record}
          handleRemoveFile={this.handleRemoveFile}
          handleUploadSuccess={this.handleUploadSuccess}
          handleLovChange={this.handleLovChange}
        />
      ),
      onOk: this.handleOk,
      onCancel: this.handleCancel,
    });
  }

  @Bind
  handleCreate() {
    const record = this.dataSet.create({ tenantId: getCurrentOrganizationId() }, 0);
    Modal.open({
      drawer: true,
      style: { width: "380px" },
      title: intl.get('hzero.common.edit').d('编辑'),
      children: (
        <ModalChildren
          record={record}
          handleRemoveFile={this.handleRemoveFile}
          handleUploadSuccess={this.handleUploadSuccess}
          handleLovChange={this.handleLovChange}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: this.handleOk,
      onCancel: this.handleCancel,
    });
  }

  @Bind
  handleOk() {
    return this.dataSet.submit().then((res) => {
      if (res || res === undefined) {
        return true;
      }
      return false;
    });
  }

  @Bind
  handleCancel() {
    this.dataSet.reset();
  }

  @Bind
  handleUploadSuccess(result, record) {
    record.set('iconUrl', result);
  }

  @Bind
  handleRemoveFile(e, record) {
    record.set('iconUrl', null);
  }

  @Bind
  handleLovChange(item, record) {
    record.set('applicationName', item.applicationName);
    record.set('applicationCode', item.applicationCode);
  }

  render() {
    const { dataSet } = this;
    return (
      <>
        <Header
          title={intl
            .get('smbl.subApplicationGp.view.subApplicationGp.manageTitle')
            .d('子应用分组管理')}
        >
          <Button key="edit-value" icon="add" funcType="raised" onClick={() => this.handleCreate()} color="primary">
            {intl.get('hzero.common.button.new').d('新建')}
          </Button>
          <Button
            icon="delete_sweep"
            disabled={!this.dataSet.selected.length}
            funcType='flat'
            onClick={() => {
                return this.dataSet.delete(this.dataSet.selected, {
                  title: intl.get("hzero.common.message.confirm.title").d("提示"),
                  children: intl.get("hzero.c7nProUI.DataSet.delete_selected_row_confirm").d("确认删除选中行？"),
                });
            }}
          >
            {intl.get("hzero.common.button.batchdelete")}
          </Button>
        </Header>
        <div style={{ background: "#FFF", margin: "8px", height: "100%", padding: "16px" }}>
          <Table
            dataSet={dataSet}
            columns={this.getColumns()}
          />
        </div>
      </>
    );
  }
}

const ModalChildren = observer(({ record, handleRemoveFile, handleUploadSuccess, handleLovChange }) => {
  return (
    <Form record={record} labelLayout="float">
      <Output
        name="iconUrl"
        renderer={() => (
          <Upload
            className={styles["avatar-uploader"]}
            multiple={false}
            onRemove={e => handleRemoveFile(e, record)}
            onSuccess={e => handleUploadSuccess(e, record)}
            bucketName={bucketName}
            showUploadList={false}
          >
            {
              record && record.get("iconUrl") ? (
                <div className='app-icon'>
                  <SrmImg src={record.get("iconUrl")} bucketName={bucketName} />
                  <Icon type="edit" className='app-icon-hover' />
                </div>
              ) : <Icon type="plus" />
            }
          </Upload>
        )}
      />
      <TextField restrict="A-Za-z0-9._" name="subAppGroupCode" />
      <IntlField name="subAppGroupName" />
      <Lov name="application" onChange={e => handleLovChange(e, record)} />
      <NumberField step={1} min={0} max={9999} name="sequence" />
      {/* <TextArea name="subAppGroupDesc" /> */}
    </Form>
  );
});