import React, { Component, Fragment } from 'react';
import { DataSet, Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import c7nModal, { confirm } from '@/utils/c7nModal';
import EnableTag from '@/components/EnableTag';
import { updateFreight, deleteFreight, copy } from './api';
import { tableDs } from './ds';
import Detail from './Detail';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sagm.common', 'sagm.freight', 'hzero.common'] })
@withProps(
  () => {
    return {
      ds: new DataSet(tableDs()),
    };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class FreightRule extends Component {
  getColumns = () => [
    {
      name: 'enabled',
      width: 84,
      renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabled')} />,
    },
    {
      name: 'postageName',
      renderer: ({ record, text }) => (
        <a
          onClick={() =>
            this.handleOpenRight({
              postageId: record.get('postageId'),
              title: intl.get('sagm.freight.view.editAdditionalExpense').d('编辑附加费'),
            })
          }
        >
          {text}
        </a>
      ),
    },
    { name: 'additionalTypeMeaning', width: 100 },
    { name: 'supplierName', minWidth: 180 },
    { name: 'pricingMethodMeaning', width: 110 },
    { name: 'itemName', width: 120 },
    { name: 'taxRate', width: 80 },
    { name: 'options', width: 150, lock: 'right', renderer: this.renderOptions },
  ];

  @Bind
  renderOptions({ record }) {
    const _record = record.toData();
    const { enabled, isDelete } = _record;
    const options = [
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: !enabled,
        event: () => this.handleUpdate(_record, { enabled: 1, onlyEnable: 0 }),
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'),
        show: isDelete === 'Y' && enabled,
        event: () => this.handleUpdate(_record, { enabled: 0, onlyEnable: 0 }),
      },
      {
        text: intl.get('hzero.common.button.copy').d('复制'),
        show: true,
        event: () => {
          this.handleCopy({ postageId: _record.postageId });
        },
      },
      {
        text: intl.get('hzero.common.button.delete').d('删除'),
        show: isDelete === 'Y' && !enabled,
        event: () => this.handleDelete(_record),
      },
    ];

    const menus = options.filter((f) => f.show && f.type === 'menu');
    const actions = options.filter((f) => f.show && f.type !== 'menu');
    const menu = (
      <Menu>
        {menus.map((m) => (
          <Menu.Item key={m.text}>
            <a onClick={m.event} disabled={m.disabled}>
              {m.text}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <span className="action-link">
        {actions.map((m, index) => (
          <Button
            color="primary"
            funcType="link"
            onClick={m.event}
            disabled={m.disabled}
            style={m.style || { marginLeft: index ? '16px' : 'unset' }}
          >
            {m.text}
          </Button>
        ))}
        {menus.length > 0 && (
          <Dropdown overlay={menu}>
            <Button color="primary" funcType="link" style={{ marginLeft: '16px' }}>
              {intl.get('sagm.common.model.options.more').d('更多操作')}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
        )}
      </span>
    );
  }

  @Bind
  async handleCopy({ postageId }) {
    const res = getResponse(await copy(postageId));
    if (res) {
      notification.success({
        message: intl.get('sagm.common.view.message.copySuccess').d('复制成功'),
      });
      this.fetchList(1);
    }
  }

  @Bind
  async handleUpdate(line, other) {
    this.props.ds.status = 'loading';
    const res = getResponse(await updateFreight({ ...line, ...other }));
    this.props.ds.status = 'ready';
    if (res) {
      notification.success();
      this.fetchList(1);
    }
  }

  @Bind
  handleDelete(record) {
    const { ds } = this.props;
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl.get('sagm.freight.view.delete.modal.title').d('确认删除运费规则？'),
      onOk: async () => {
        ds.status = 'loading';
        const res = getResponse(await deleteFreight(record));
        ds.status = 'ready';
        if (res) {
          notification.success();
          this.fetchList(1);
        }
      },
    });
  }

  @Bind
  fetchList(id) {
    const { ds } = this.props;
    if (id) {
      ds.query(ds.currentPage);
    } else {
      ds.query();
    }
  }

  @Bind
  handleOpenRight({
    postageId,
    readOnly,
    title = intl.get('sagm.common.model.createAdditionalExpense').d('新建附加费'),
  } = {}) {
    const footerProps = readOnly
      ? { okFirst: true, okText: intl.get('hzero.common.button.close').d('关闭') }
      : { okText: intl.get('hzero.common.btn.save').d('保存') };
    const {
      match: { path = '' },
    } = this.props;
    c7nModal({
      title,
      key: 'freightRule',
      ...footerProps,
      style: { width: 1090 },
      children: (
        <Detail
          readOnly={readOnly}
          postageId={postageId}
          onFetchList={this.fetchList}
          path={path}
        />
      ),
    });
  }

  render() {
    const searchBarConfig = {
      fieldProps: {
        supplierTenantId: { lovPara: { tenantId: organizationId } },
      },
    };
    return (
      <Fragment>
        <Header title={intl.get('sagm.freight.view.additionalExperience').d('附加费用管理')}>
          <Button icon="add" color="primary" onClick={() => this.handleOpenRight()}>
            {intl.get('sagm.common.model.createFreightRule').d('新建附加费')}
          </Button>
        </Header>
        <Content style={{ paddingBottom: 0 }}>
          <SearchBarTable
            dataSet={this.props.ds}
            style={{ maxHeight: 'calc(100vh - 192px)' }}
            customizedCode="SAGM.FREIGHT_RULE.LIST"
            columns={this.getColumns()}
            searchCode="SAGM.FREIGHT_RULE.LIST.SEARCHBAR"
            cacheState
            searchBarConfig={searchBarConfig}
          />
        </Content>
      </Fragment>
    );
  }
}
