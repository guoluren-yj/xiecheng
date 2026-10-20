/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Badge, Popconfirm } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
// import ExcelExport from 'components/ExcelExport';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { SRM_SPRM } from '_utils/config';
import querystring from 'querystring';

import styles from './index.less';
import { operationDS } from '../pubDS/operationDS';
import { mainTableDs, basicDrawerFormDs, basicDrawerMapDs, basicDrawerLovMapDs } from './DS/mainDS';
import Drawer from './Drawer';

import { save, quotePredefined } from '@/services/budgetAttributeMappingService';
// import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// splitFlag  confirmFlag

function renderFlag({ record, name }) {
  const { data = {} } = record;
  const { [name]: flag } = data;
  return yesOrNoRender(flag ? 1 : 0);
}

@formatterCollections({
  code: [
    'sbud.budgetAttributeMapping',
    'ssrc.budgetAttributeMapping',
    'hpfm.individual',
    'spfm.rulesDefinition',
  ],
})
class index extends Component {
  tableDs = new DataSet(mainTableDs());

  basicDrawerFormDs = new DataSet(basicDrawerFormDs());

  basicDrawerMapDs = new DataSet(basicDrawerMapDs());

  basicDrawerLovMapDs = new DataSet(basicDrawerLovMapDs());

  operationDs = new DataSet(
    operationDS({ url: `${SRM_SPRM}/v1/${organizationId}/adjust-actions`, pk: 'budgetAdjustId' })
  );

  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { budgetAdjustId = null } = querystring.parse(search.substr(1));
    if (budgetAdjustId) {
      this.tableDs.setQueryParameter('budgetAdjustId', budgetAdjustId);
    }
    this.tableDs.setQueryParameter('source', 'approve');
    this.state = {
      editor: false,
      visible: false,
      listColumns: [
        {
          name: 'budgetItemCode',
          width: 200,
          lock: 'left',
        },
        {
          name: 'budgetItemName',
          width: 100,
          lock: 'left',
        },
        {
          name: 'requiredFlag',
          width: 100,
          renderer: ({ record }) => renderFlag({ record, name: 'requiredFlag' }),
        },
        {
          name: 'queryFlag',
          width: 150,
          renderer: ({ record }) => renderFlag({ record, name: 'queryFlag' }),
        },
        {
          name: 'budgetFlag',
          width: 100,
          renderer: ({ record }) => renderFlag({ record, name: 'budgetFlag' }),
        },
        {
          name: 'cycleFlag',
          width: 100,
          renderer: ({ record }) => renderFlag({ record, name: 'cycleFlag' }),
        },
        {
          name: 'multipleFlag',
          width: 100,
          renderer: ({ record }) => renderFlag({ record, name: 'multipleFlag' }),
        },
        {
          name: 'predefinedFlag',
          width: 100,
          renderer: ({ record }) => renderFlag({ record, name: 'predefinedFlag' }),
        },
        // {
        //   name: 'mergeApproveFlag',
        //   width: 100,
        //   renderer: ({ record }) => renderFlag({ record, name: 'mergeApproveFlag' }),
        // },
        {
          name: 'gridSeq',
          width: 100,
        },
        {
          name: 'gridWidth',
          width: 100,
        },
        {
          name: 'componentTypeMeaning',
          width: 200,
        },
        {
          name: 'lovCode',
          width: 300,
        },
        {
          name: 'enabledFlag',
          width: 300,
          renderer: ({ record }) => {
            const {
              data: { enabledFlag = 0 },
            } = record;
            const msg =
              Number(enabledFlag) === 0
                ? intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.n').d('禁用')
                : intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.y').d('启用');
            return (
              <span>
                <Badge status={Number(enabledFlag) === 0 ? 'error' : 'success'} />
                {msg}
              </span>
            );
          },
        },
        {
          name: 'operation',
          width: 100,
          lock: 'right',
          renderer: ({ record }) => this.renderOperation({ record }),
        },
      ],
      quoteLoading: false,
    };
  }

  @Bind()
  renderOpr(record) {
    return (
      <div className={styles['opr-box']}>
        <a onClick={() => this.openOprationModal(record)} className={styles.opr}>
          {intl.get('sbud.budgetAttributeMapping.model.budgeting.operationRecord').d('操作记录')}
        </a>
      </div>
    );
  }

  /**
   * 操作记录
   * @param {记录} record
   */
  @Bind()
  openOprationModal(record) {
    const { budgetAdjustId } = record.data;
    this.operationDs.setQueryParameter('budgetAdjustId', budgetAdjustId);

    this.operationDs.query();

    const operateColumns = [
      {
        name: 'processUserName',
        width: 100,
      },
      {
        name: 'processDate',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'processStatusMeaning',
        width: 100,
      },
      {
        name: 'processRemark',
        width: 120,
        tooltip: 'overflow',
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 680,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  }

  @Bind()
  onCancel() {
    this.setState({
      visible: false,
      editor: false,
    });
    this.basicDrawerFormDs.loadData([]);
    this.basicDrawerLovMapDs.loadData([]);
    this.basicDrawerMapDs.loadData([]);
  }

  @Bind()
  openDrawer({ status = 'add', record = {} }) {
    if (status === 'add') {
      this.basicDrawerFormDs.create({});
      this.setState({
        visible: true,
        editor: true,
      });
    } else {
      const recordData = record.data;
      const { componentType, budgetItemId, enabledFlag } = recordData;
      this.basicDrawerFormDs.loadData([{ ...recordData, enabledFlag: Number(enabledFlag) }]);
      this.basicDrawerLovMapDs.setQueryParameter('budgetItemId', budgetItemId);
      this.basicDrawerMapDs.setQueryParameter('budgetItemId', budgetItemId);

      this.basicDrawerLovMapDs.query();
      this.basicDrawerMapDs.query();
      this.setState({
        visible: true,
        editor: false,
      });
      this.drawer.setState({
        componentType,
      });
    }
  }

  @Bind()
  renderOperation({ record }) {
    return (
      <div className={styles['opr-box']}>
        <a onClick={() => this.openDrawer({ record, status: 'edit' })} className={styles.opr}>
          {intl.get('sbud.budgetAttributeMapping.model.budgeting.edit').d('编辑')}
        </a>
      </div>
    );
  }

  @Bind()
  async onDrawerOk() {
    const baseValidateFlag = await this.basicDrawerFormDs.validate();
    const drwaerMapValidateFlag = await this.basicDrawerMapDs.validate();
    const drwaerLovValidateFlag = await this.basicDrawerLovMapDs.validate();
    if (baseValidateFlag && drwaerMapValidateFlag && drwaerLovValidateFlag) {
      const baseData = this.basicDrawerFormDs.toData()[0];
      const mapData = this.basicDrawerMapDs.toData();
      const { componentType } = baseData;
      const lovData = componentType === 'LOV' ? this.basicDrawerLovMapDs.toData() : [];
      const data = {
        ...baseData,
        budgetItemMappings: mapData,
        budgetItemLovs: lovData,
      };
      const res = getResponse(await save(data));
      if (res) {
        notification.success();
        this.onCancel();
        this.tableDs.query();
      }
    }
  }

  @Bind()
  quoteBudget() {
    this.setState({
      quoteLoading: true,
    });
    quotePredefined()
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.tableDs.query();
        }
      })
      .finally(() => {
        this.setState({
          quoteLoading: false,
        });
      });
  }

  render() {
    const { listColumns, quoteLoading } = this.state;
    const Headers = observer(() => {
      return (
        <Header
          title={intl
            .get('sbud.budgetAttributeMapping.view.title.budgetAttributeMapping')
            .d('维度属性映射')}
        >
          <Button
            icon="add"
            color="primary"
            funcType="raised"
            onClick={() => this.openDrawer({ status: 'add' })}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Popconfirm
            title={intl
              .get('sbud.budgetAttributeMapping.view.button.quoteBudgetMapTip')
              .d('预定义维度——预算编码启用后，将作为预算余额信息查询唯一维度')}
            onConfirm={this.quoteBudget}
          >
            <Button icon="cloud_download" loading={quoteLoading} funcType="flat">
              {intl
                .get('sbud.budgetAttributeMapping.view.button.quoteBudgetMap')
                .d('引用预定义预算维度')}
            </Button>
          </Popconfirm>
        </Header>
      );
    });
    const drawerProps = {
      onCancel: this.onCancel,
      editor: this.state.editor,
      visible: this.state.visible,
      basicDrawerFormDs: this.basicDrawerFormDs,
      basicDrawerMapDs: this.basicDrawerMapDs,
      basicDrawerLovMapDs: this.basicDrawerLovMapDs,
      onOk: this.onDrawerOk,
      onRef: (ref) => {
        this.drawer = ref;
      },
    };
    return (
      <Fragment>
        {/* <Spin spinning={this.state.loading}> */}
        <Headers dataSet={this.tableDs} />
        <Content>
          <div />
          <Table dataSet={this.tableDs} columns={listColumns} selectionMode="click" />
        </Content>
        <Drawer {...drawerProps} />
        {/* </Spin> */}
      </Fragment>
    );
  }
}

export default index;
