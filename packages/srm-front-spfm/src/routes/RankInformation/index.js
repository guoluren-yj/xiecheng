import React, { Component, Fragment } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { SRM_CUSTOMIZATION } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { statistics } from '@/services/onsiteNumberService';

@formatterCollections({
  code: ['spfm.rankInformation'],
})
export default class RankInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerInfo: {},
    };
  }

  componentDidMount() {
    this.tableDs.query();
    const response = statistics();
    response.then((res) => {
      this.setState({ headerInfo: res });
    });
    window.setInterval(() => {
      this.tableDs.query();
      const req = statistics();
      req.then((res) => {
        this.setState({ headerInfo: res });
      });
    }, 5000);
  }

  tableDs = new DataSet({
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'processStatusMeaning',
        type: 'string',
        label: '状态',
      },
      {
        name: 'ruleCode',
        type: 'string',
        label: '号码',
      },
      {
        name: 'handlingWindowNum',
        type: 'string',
        label: '窗口',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: '单位',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_CUSTOMIZATION}/v1/donlim-site-numberings/site/list`,
          method: 'GET',
        };
      },
    },
  });

  render() {
    const {
      headerInfo: { waitAndHandlingUsers },
    } = this.state;
    const columns = [
      {
        name: 'processStatusMeaning',
      },
      {
        name: 'ruleCode',
      },
      {
        name: 'handlingWindowNum',
      },
      {
        name: 'supplierCompanyName',
        width: 700,
      },
    ];
    return (
      <Fragment>
        <Header title="排号信息" />
        <Content>
          <Table dataSet={this.tableDs} columns={columns} />
          <h2 style={{ color: 'red' }}>
            待办人数: {waitAndHandlingUsers}{' '}
            <span style={{ padding: '0 300px' }}>号码过期请重新取号！</span>
          </h2>
        </Content>
      </Fragment>
    );
  }
}
