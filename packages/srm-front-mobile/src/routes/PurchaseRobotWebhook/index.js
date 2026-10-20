import React, { Fragment, Component } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { enableRender } from 'utils/renderer';
import { listDS } from './indexDS';
// import TextSearch from '@/components/TextSearch';

@formatterCollections({ code: ['smbl.purchaseRobotWebhook'] })
export default class PurchaseRobotKnowledge extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  listDataSet = new DataSet(listDS());

  editRecord = (record) => {
    const id = record.get('id');
    this.props.history.push({
      pathname: `/smbl/purchase-robot/webhook/detail/${id}`,
    });
  };

  lineColumns = [
    { name: 'groupsName' },
    { name: 'robotName' },
    { name: 'platform' },
    {
      name: 'enabledFlag',
      renderer: ({ value }) => enableRender(value),
    },
    { name: 'createdByName' },
    { name: 'creationDate', width: 200 },
    {
      name: 'actions',
      renderer: ({ record }) => {
        const commands = [];
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
        return <>{commands}</>;
      },
      lock: 'right',
      align: 'left',
    },
  ];

  addWebhookAction = () => {
    this.props.history.push({
      pathname: '/smbl/purchase-robot/webhook/detail/add',
    });
  };

  render() {
    return (
      <Fragment>
        <Header title={intl.get('smbl.purchaseRobotWebhook.view.title.header').d('群机器人配置')}>
          <Button color="primary" icon="add" onClick={this.addWebhookAction}>
            {intl.get('smbl.purchaseRobotWebhook.button.title.add').d('新建')}
          </Button>
        </Header>
        <Content>
          <SearchBarTable
            searchCode="SMBL.PURCHASE_ROBOT_WEBHOOK.ROBOT_LIST"
            dataSet={this.listDataSet}
            columns={this.lineColumns}
            // data={[]}
            aggregation
            cacheState
            // queryFieldsLimit={1}
          />
        </Content>
      </Fragment>
    );
  }
}
