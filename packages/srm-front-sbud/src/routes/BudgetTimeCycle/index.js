/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Button, Modal, Spin } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
// import ExcelExport from 'components/ExcelExport';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import { SRM_SPUC } from '_utils/config';
import querystring from 'querystring';

import styles from './index.less';
import { mainTableDs, basicDrawerFormDs, cycleDetailDs } from './DS/mainDS';
import Drawer from './Drawer';
import { getFieldsConfig, getDatas, getMomentDate } from '@/utils/utils';

import { save, getBudgetItem, saveCycelDetail } from '@/services/budgetTimeCycleService';

// const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sbud.budgetTimeCycle'] })
class index extends Component {
  tableDs = new DataSet(mainTableDs());

  basicDrawerFormDs = new DataSet(basicDrawerFormDs());

  cycleDetailDs = new DataSet(cycleDetailDs());

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
      dynamicColumns: [],
      loading: true,
      listColumns: [
        {
          name: 'periodSetNum',
          width: 150,
          lock: 'left',
        },
        {
          name: 'periodSetName',
          width: 150,
          lock: 'left',
        },
        {
          name: 'typeCode',
          width: 100,
        },
        {
          name: 'ruleContext',
          width: 150,
        },
        {
          name: 'startDate',
          width: 180,
        },
        {
          name: 'endDate',
          width: 180,
        },
        {
          name: 'enabledFlag',
          width: 150,
          renderer: ({ record }) => {
            const {
              data: { enabledFlag = 0 },
            } = record;
            const msg =
              Number(enabledFlag) === 0
                ? intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.n').d('禁用')
                : intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.y').d('启用');
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
        {
          name: 'cycleDetail',
          width: 100,
          lock: 'right',
          renderer: ({ record }) => this.renderCycleDetail({ record }),
        },
      ],
    };
  }

  componentDidMount() {
    const { listColumns } = this.state;

    this.getBudgetItem({ listColumns, seq: 3, ds: this.tableDs });
  }

  /**
   * 设置动态列
   * @param {列} listColumns
   * @param {*插入列的位置} seq
   */
  @Bind()
  async getBudgetItem({ listColumns, seq, ds }) {
    const arr1 = listColumns.slice(0, seq);
    const arr2 = listColumns.slice(seq, listColumns.length);
    const arr3 = [];

    try {
      const dynamicColumns = await getBudgetItem();
      dynamicColumns.forEach((item) => {
        const { gridField, columnsConfig } = getFieldsConfig(item);
        const { name, ...gridOthers } = gridField;

        ds.addField(name, gridOthers);
        arr3.push({
          ...columnsConfig,
          editor: false,
        });
      });
      this.setState({
        listColumns: [...arr1, ...arr3, ...arr2],
        dynamicColumns,
        loading: false,
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Bind()
  renderCycleDetail({ record }) {
    return (
      <div className={styles['opr-box']}>
        <a onClick={() => this.openCycleDetail(record)} className={styles.opr}>
          {intl.get('sbud.budgetTimeCycle.model.budgeting.cycleDetail').d('明细')}
        </a>
      </div>
    );
  }

  /**
   * 明细
   * @param {记录} record
   */
  @Bind()
  openCycleDetail(record) {
    const { periodSetId, ruleCode, periodSetNum, startDate } = record.data;
    const periodNum = `${periodSetNum}_${getMomentDate(startDate, 'YYYY-MM-DD')}`;
    this.cycleDetailDs.setQueryParameter('periodSetId', periodSetId);
    this.cycleDetailDs.query();
    const editFlag = Number(ruleCode) === 3;
    const operateColumns = [
      {
        name: 'periodNum',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'year',
        width: 80,
        tooltip: 'overflow',
        align: 'right',
        editor: editFlag,
      },
      {
        name: 'quarter',
        width: 80,
        tooltip: 'overflow',
        editor: editFlag,
      },
      {
        name: 'month',
        width: 80,
        tooltip: 'overflow',
        editor: editFlag,
      },
      {
        name: 'startDate',
        width: 120,
        tooltip: 'overflow',
        editor: editFlag,
      },
      {
        name: 'endDate',
        width: 120,
        tooltip: 'overflow',
        editor: editFlag,
      },
    ];
    const modalProps = {
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.cycelDetail').d('规则明细'),
      style: {
        width: 900,
      },
      children: (
        <Table
          dataSet={this.cycleDetailDs}
          columns={operateColumns}
          buttons={this.getTableButtons(editFlag)}
        />
      ),
      closable: true,
      onOk: () => {
        const flag = this.saveDetail({ periodSetId, periodNum });
        return flag;
      },
      onCancel: () => {},
    };
    if (!editFlag) {
      modalProps.footer = null;
    }
    Modal.open(modalProps);
  }

  @Bind()
  async saveDetail({ periodSetId, periodNum }) {
    const baseValidateFlag = await this.cycleDetailDs.validate();
    if (baseValidateFlag) {
      this.setState({
        loading: true,
      });
      const createdData = this.cycleDetailDs.created.map((i) => i.toData());
      const updatedData = this.cycleDetailDs.updated.map((i) => i.toData());

      const data = [...createdData, ...updatedData];
      const sendData = data.map((item) => ({ ...getDatas(item), periodSetId, periodNum }));
      const res = await saveCycelDetail(sendData);
      this.setState({
        loading: false,
      });
      if (res && res.failed) {
        notification.warning({
          message: res.message,
        });
        return false;
      }
      if (res) {
        notification.success();
        this.tableDs.query();
        return true;
      }
      return false;
    }
  }

  @Bind()
  getTableButtons(editFlag) {
    if (editFlag) {
      return [
        <Button icon="playlist_add" onClick={() => this.handleAdd(this.cycleDetailDs)} key="add">
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        ['delete', { color: 'red' }],
      ];
    } else {
      return [];
    }
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    ds.create({});
  }

  @Bind()
  onCancel() {
    this.setState({
      visible: false,
      editor: false,
    });
    this.basicDrawerFormDs.reset();
  }

  @Bind()
  openDrawer({ status = 'add', record = {} }) {
    if (status === 'add') {
      this.basicDrawerFormDs.loadData([]);
      this.basicDrawerFormDs.create({});
      this.setState({
        visible: true,
        editor: true,
      });
    } else {
      const recordData = record.toData();
      const { typeCode: type, enabledFlag } = recordData;
      // console.log(recordData);
      this.basicDrawerFormDs.loadData([{ ...recordData, enabledFlag: Number(enabledFlag) }]);
      this.setState({
        visible: true,
        editor: false,
      });
      this.drawer.setState({
        type,
      });
    }
  }

  @Bind()
  renderOperation({ record }) {
    return (
      <div className={styles['opr-box']}>
        <a onClick={() => this.openDrawer({ record, status: 'edit' })} className={styles.opr}>
          {intl.get('sbud.budgetTimeCycle.model.budgeting.edit').d('编辑')}
        </a>
      </div>
    );
  }

  @Bind()
  async onDrawerOk() {
    const baseValidateFlag = await this.basicDrawerFormDs.validate();
    console.log(baseValidateFlag, this.basicDrawerFormDs.toData());
    if (baseValidateFlag) {
      this.setState({
        loading: true,
      });
      const baseData = this.basicDrawerFormDs.toData()[0];
      const data = {
        ...getDatas(baseData),
        tenantId: getCurrentOrganizationId(),
      };
      const res = getResponse(await save([{ ...data, ...baseData }]));
      this.setState({
        loading: false,
      });
      if (res) {
        notification.success();
        this.onCancel();
        this.tableDs.query();
      }
    }
  }

  render() {
    const { listColumns, dynamicColumns } = this.state;
    const Headers = observer(() => {
      return (
        <Header
          title={intl.get('sbud.budgetTimeCycle.view.title.budgetTimeCycle').d('时间周期设置')}
        >
          <Button
            icon="add"
            color="primary"
            funcType="raised"
            onClick={() => this.openDrawer({ status: 'add' })}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
      );
    });
    const drawerProps = {
      onCancel: this.onCancel,
      editor: this.state.editor,
      visible: this.state.visible,
      basicDrawerFormDs: this.basicDrawerFormDs,
      onOk: this.onDrawerOk,
      dynamicColumns,
      onRef: (ref) => {
        this.drawer = ref;
      },
    };
    return (
      <Fragment>
        <Spin spinning={this.state.loading}>
          <Headers dataSet={this.tableDs} />
          <Content>
            <div />
            <Table dataSet={this.tableDs} columns={listColumns} selectionMode="click" />
          </Content>
          <Drawer {...drawerProps} />
        </Spin>
      </Fragment>
    );
  }
}

export default index;
