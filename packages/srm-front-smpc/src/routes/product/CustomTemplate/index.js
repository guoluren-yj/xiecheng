import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { DataSet, Button } from 'choerodon-ui/pro';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { Header, Content } from 'components/Page';

import EnableTag from '@/components/EnableTag';
import c7nModal from '@/utils/c7nModal';

import Detail from './Detail';
import { customListDs } from './ds';
import { updateStatus, deleteTemplate } from './api';

import styles from './style.less';

const DelButton = observer(({ dataSet, ...others }) => (
  <Button disabled={dataSet.selected.length === 0} {...others}>
    {intl.get('smpc.product.button.batchDelete').d('批量删除')}
  </Button>
));

@formatterCollections({ code: ['smpc.product'] })
@withProps(
  () => ({
    ds: new DataSet(customListDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class CustomTemplate extends Component {
  constructor(props) {
    super(props);
    const {
      location: { pathname },
    } = props;
    const prefixPath = pathname.split('/custom-attr-template')[0];
    this.state = {
      prefixPath,
    };
  }

  componentDidMount() {
    const { ds } = this.props;
    ds.setQueryParameter('customizeUnitCode', 'SMPC.WORKBENCH_PUR.CUSTOM_TEMPLATE');
    ds.query();
  }

  getColumns = () => {
    return [
      {
        name: 'enabledFlag',
        width: 110,
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabledFlag')} />,
      },
      {
        name: 'action',
        width: 170,
        renderer: this.renderOptions,
      },
      {
        name: 'templateCode',
        width: 200,
        renderer: ({ record, value }) => (
          <a onClick={() => this.handleCreate(record.get('templateId'), true)}>{value}</a>
        ),
      },
      {
        name: 'templateName',
        minWidth: 220,
      },
    ];
  };

  renderOptions = ({ record }) => {
    return (
      <span className={styles['action-link-btns']}>
        <Button funcType="link" onClick={() => this.handleCreate(record.get('templateId'))}>
          {intl.get('hzero.common.edit').d('编辑')}
        </Button>
        <Button funcType="link" onClick={() => this.handleUpdate(record)}>
          {record.get('enabledFlag')
            ? intl.get('hzero.common.button.disable').d('禁用')
            : intl.get('hzero.common.button.enable').d('启用')}
        </Button>
        {/* <Button funcType='link' onClick={() => this.handleDelete(record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button> */}
        {/* <Dropdown overlay={menu} placement="bottomLeft">
          <a>
            {intl.get('hzero.common.button.more').d('更多')}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
          </a>
        </Dropdown> */}
      </span>
    );
  };

  // 编辑/修改/新建
  @Bind
  handleCreate(templateId, readOnly = false) {
    const title = readOnly
      ? intl.get('smpc.product.view.lookCustomAttrTemp').d('查看定制品属性模版')
      : templateId
      ? intl.get('smpc.product.view.editCustomAttrTemp').d('编辑定制品属性模版')
      : intl.get('smpc.product.view.createCustomAttrTemp').d('新建定制品属性模版');
    c7nModal({
      title,
      style: { width: 1090 },
      okCancel: !readOnly,
      okText: readOnly ? intl.get('hzero.common.button.close').d('关闭') : undefined,
      children: (
        <Detail readOnly={readOnly} templateId={templateId} afterSave={this.handleAfterSave} />
      ),
    });
  }

  @Bind
  handleAfterSave(id) {
    const { ds } = this.props;
    ds.query(id ? ds.currentPage : 1);
  }

  @Bind
  async handleRequest(api, params) {
    const { ds } = this.props;
    ds.status = 'loading';
    const res = getResponse(await api(params));
    ds.status = 'ready';
    if (res) {
      notification.success();
      ds.query(ds.currentPage);
    }
  }

  @Bind
  handleUpdate(record) {
    const line = record.toData();
    this.handleRequest(updateStatus, { ...line, enabledFlag: line.enabledFlag ? 0 : 1 });
  }

  @Bind
  handleDelete() {
    const selectedRecord = this.props.ds.selected;
    selectedRecord.forEach((r) => {
      this.handleRequest(deleteTemplate, r.toData());
    });
  }

  render() {
    const { prefixPath } = this.state;
    const backPath = `${prefixPath}/list`;
    return (
      <Fragment>
        <Header
          title={intl.get('smpc.product.view.customAttrTitle').d('定制品属性模版管理')}
          backPath={backPath}
        >
          <Button icon="add" color="primary" onClick={() => this.handleCreate()}>
            {intl.get('smpc.product.view.createTemplate').d('新建模版')}
          </Button>
          <DelButton
            icon="delete_sweep"
            funcType="flat"
            dataSet={this.props.ds}
            onClick={this.handleDelete}
          />
        </Header>
        <Content>
          <SearchBarTable
            dataSet={this.props.ds}
            searchCode="SMPC.WORKBENCH_PUR.CUSTOM_TEMPLATE"
            columns={this.getColumns()}
            customizedCode="CUSTOM_TEMPLATE.LIST"
            searchBarConfig={{
              closeFilterSelector: true,
              expandable: false,
            }}
            style={{ maxHeight: 'calc(100vh - 196px)' }}
          />
        </Content>
      </Fragment>
    );
  }
}
