import React, {Component} from 'react';
import {Button, DataSet, Table} from 'choerodon-ui/pro';
import {Modal, Tag} from 'choerodon-ui';
import {Content, Header} from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {Bind} from 'lodash-decorators';
import {getCurrentOrganizationId} from 'utils/utils';
import {enableRender} from 'utils/renderer';
import {cardMappingDS} from './stores/indexDS';

@formatterCollections({code: ['smbl.wechatTweet', 'smbl.common', 'hzero.common']})
export default class CardMapping extends Component {
  tableDs = new DataSet(cardMappingDS());

  constructor(props) {
    super(props);
    this.state = {
      // AlreadyUploadPicture: false,
      // visible: false,
    };
  }

  getColumns() {
    return [
      {
        name: 'tenantName',
        align: 'center',
        width: 200,
      },
      { name: 'templateCode'},
      { name: 'templateName'},
      { name: 'thirdPartyAccountDesc' },
      { name: 'remark' },
      {
        name: 'enabledFlag',
        align: "left",
        width: 100,
        renderer: ({value}) => enableRender(value),
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        command: ({record}) => {
          if (getCurrentOrganizationId() == record.get('tenantId')) {
            return [
              <Button key="edit-value" funcType="flat" onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.editor').d('编辑')}
              </Button>,
              <Button key="del-value" funcType="flat" onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
            ];
          }else{
            return [
              <Tag color="orange">
                {intl.get('hzero.common.predefined').d('预定义')}
              </Tag>,
              <Button key="copy-value" funcType="flat" onClick={() => this.copyRecord(record)}>
                {intl.get('hzero.common.button.copy').d('复制')}
              </Button>,
            ];
          }
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

  @Bind
  createHandler() {
    this.props.history.push(`/smbl/wechat-tweet/config/org/create/create`);
  }


  @Bind
  handleEdit(record) {
    this.props.history.push(`/smbl/wechat-tweet/config/org/create/${record.data.id}`);
  }

  @Bind
  copyRecord(record) {
    this.props.history.push({ pathname: `/smbl/wechat-tweet/config/org/create/copy`, query: record.data });
  }

  @Bind
  handleDelete(record) {
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
  }


  render() {
    return (
      <>
        <Header title={intl.get('smbl.wechatTweet.view.title.wechatTempConfig').d('服务号推文模板配置')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={this.getColumns()}
            queryFieldsLimit={3}
            buttons={this.tableButtons}
          />
        </Content>
      </>
    );
  }
}
