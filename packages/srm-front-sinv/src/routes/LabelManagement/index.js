import React, { Component, Fragment } from 'react';
import { Button, Table, DataSet } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { list } from './store/labelManagementDS';
import styles from '../components/index.less';

const { Panel } = Collapse;

@formatterCollections({ code: ['sinv.labelManagement'] })
export default class LabelManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultActiveKey: ['hierarchy'],
    };
  }

  listDS = new DataSet(list());

  componentDidMount() {
    this.queryData();
  }

  /**
   * 查询列表数据
   */
  @Bind()
  queryData() {
    this.listDS.query().then((res) => {
      if (res && !res.faild) {
        const data = this.listDS.toData();
        const newData = data.map((item, index) => ({ ...item, serialNumber: index + 1 }));
        this.listDS.loadData(newData);
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.listDS.validate();
    if (flag) {
      const res = await this.listDS.submit();
      if (res && !res.failed) {
        this.queryData();
      }
    }
  }

  /**
   * 勾选删除
   */
  @Bind()
  handleDelete() {
    const selecteds = this.listDS.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).labelConfigId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).labelConfigId);

    if (!isEmpty(remoteDelete)) {
      this.listDS.delete(remoteDelete).then((res) => {
        if (res && !res.failed) {
          this.queryData();
        }
      });
    } else {
      this.listDS.remove(localDelete);
    }
  }

  @Bind()
  activeKeyChange(defaultActiveKey) {
    this.setState({ defaultActiveKey });
  }

  @Bind()
  handleCreate() {
    this.listDS.create(
      {
        onlyLabelCodeFlag: 0,
        asnQuotePackageNum: 'NOT_QUOTE',
        mixedPackageFlag: 0,
        labelSourceCode: 'ASN',
      },
      this.listDS.length
    );
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'serialNumber',
        width: 70,
      },
      {
        name: 'labelConfigCode',
        width: 150,
        editor: (record) => record.status === 'add',
      },
      {
        name: 'labelName',
        width: 350,
        editor: true,
      },
      {
        name: 'labelSourceCode',
        width: 100,
      },
      {
        name: 'onlyLabelCodeFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'ruleCodeLOV',
        width: 300,
        editor: (record) => record.get('onlyLabelCodeFlag') === 1,
      },
      {
        name: 'asnQuotePackageNum',
        width: 220,
        editor: true,
      },
      {
        name: 'mixedPackageFlag',
        editor: (record) => record.get('onlyLabelCodeFlag') === 1,
      },
      {
        name: 'templateCode',
        width: 200,
        editor: true,
      },
    ];
  }

  render() {
    const { defaultActiveKey = [] } = this.state;
    const columns = this.getColumns();
    return (
      <Fragment>
        <Header
          title={intl.get('sinv.labelManagement.view.title.labelManagement').d('标签管理配置')}
        >
          <Button color="primary" onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.handleDelete}>
            {intl.get('hzero.common.button.enter').d('删除')}
          </Button>
          <Button onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Collapse
            className={styles['collapse-title']}
            defaultActiveKey={defaultActiveKey}
            onChange={this.activeKeyChange}
          >
            <Panel
              header={intl.get('sinv.labelManagement.view.tab.hierarchy').d('标签层级配置')}
              key="hierarchy"
            >
              <Table key="label" dataSet={this.listDS} columns={columns} />
            </Panel>
          </Collapse>
        </Content>
      </Fragment>
    );
  }
}
