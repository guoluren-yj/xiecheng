import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Tag, Badge } from 'choerodon-ui';
import { DataSet, Button, CheckBox, Select, Tooltip, Modal } from 'choerodon-ui/pro';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import remote from 'utils/remote';
import SearchBarTable from '_components/SearchBarTable';
import FilterBarTable from '_components/FilterBarTable';

import { RecordTimeLine } from '@/components/Record';
import EnableTag from '@/components/EnableTag';
import c7nModal from '@/utils/c7nModal';
import { openCatalogTree, openCategoryTree } from '@/utils/tree';
import EcPriceMonitorDs from './EcPriceMonitorDs';
import DimensionDs from './DimensionDs';
import ReminderDs from './ReminderDs';
import TriggerLogDs from './TriggerLogDs';
import OperateRecordDs from './OperateRecordDs';
import SkuTransfer from './SkuTransfer';
import LovSet from './LovSet';
import StrategyModal from './StrategyModal';
import { savePriceMonitor, saveTreeDimensions, fetchTreeDimensions } from './api';
import styles from './index.less';

@remote({
  code: 'SMPC_ECPRICEMONITOR',
  name: 'remote',
})
@formatterCollections({ code: ['smpc.product', 'smpc.ecPriceMonitor', 'sagm.common'] })
@withProps(
  () => ({
    ds: new DataSet(EcPriceMonitorDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class EcPriceMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  supplierLov = new LovSet(
    {
      name: 'suppliers',
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      type: 'object',
      multiple: true,
      lovCode: 'SMPC.EC_PRICE_MONITOR_SUPPLIER',
      lovPara: { tenantId: getCurrentOrganizationId() },
      optionsProps: (dsProps) => {
        return { ...dsProps, pageSize: 20 };
      },
    },
    {
      onOk: async (data) => {
        const params = this.getSaveValues({
          data,
          textField: 'companyName',
          valueField: 'companyId',
          codeField: 'companyNum',
        });
        const res = getResponse(
          await saveTreeDimensions(params, this.monitorParams.monitorStrategyId)
        );
        if (res) {
          notification.success();
          if (this.saveCallback) {
            this.saveCallback(res);
          }
        } else {
          return false;
        }
      },
    }
  );

  getSupplierSelected = async () => {
    const res = getResponse(await fetchTreeDimensions(this.monitorParams));
    if (res) {
      const supplierSeletced = this.getDefaultValues({
        code: 'SUPPLIER',
        data: res,
        textField: 'companyName',
        valueField: 'companyId',
        codeField: 'companyNum',
      });
      this.supplierLov.set(supplierSeletced);
    }
  };

  openSupplierModal = async () => {
    const { ds } = this.props;
    ds.status = 'loading';
    await this.getSupplierSelected();
    ds.status = 'ready';
    this.supplierLov.openModal();
  };

  componentDidMount() {
    const { ds } = this.props;
    ds.query();
  }

  recordIsEdit = (record) => {
    return record.status === 'add' || record.editing;
  };

  handleEdit = (record) => {
    Modal.open({
      title: record
        ? intl.get('smpc.ecPriceMonitor.view.editStrategy').d('编辑策略')
        : intl.get('smpc.ecPriceMonitor.view.createStrategy').d('新建策略'),
      style: { width: 742 },
      children: (
        <StrategyModal
          record={record}
          handleOpenDimension={this.handleOpenDimension}
          ds={this.props.ds}
        />
      ),
      drawer: true,
    });
  };

  getColumns = () => {
    return [
      {
        key: 'status',
        width: 84,
        align: 'left',
        header: intl.get('hzero.common.status').d('状态'),
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabledFlag')} />,
      },
      {
        name: 'strategyCode',
        width: 120,
        renderer: ({ record, text }) => (
          <Tooltip
            title={
              record.get('enabledFlag')
                ? intl
                    .get('smpc.ecPriceMonitor.view.strategyDisabled.tooltip')
                    .d('策略在启用状态下不可编辑')
                : null
            }
          >
            <Button
              funcType="link"
              disabled={record.get('enabledFlag')}
              onClick={() => this.handleEdit(record)}
            >
              {text}
            </Button>
          </Tooltip>
        ),
      },
      {
        name: 'strategyName',
        width: 200,
        editor: this.recordIsEdit,
      },
      {
        name: 'monitorType',
        width: 120,
        editor: this.recordIsEdit,
      },
      {
        name: 'monitorDimensionValue',
        width: 160,
        header: intl.get('smpc.ecPriceMonitor.view.monitorDimensionValue').d('监控维度值'),
        renderer: ({ record }) => {
          return (
            <Button funcType="link" onClick={() => this.handleViewDimension(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          );
        },
      },
      // {
      //   key: 'rule-group',
      //   header: intl.get('smpc.ecPriceMonitor.view.monitorDimensionRule').d('监控条件规则'),
      //   children: [

      //   ],
      // },
      {
        name: 'calculateRule',
        width: 120,
        editor: this.recordIsEdit,
      },
      {
        name: 'amplitudeType',
        width: 120,
        editor: (record) => {
          return (
            this.recordIsEdit(record) && (
              <Select
                optionsFilter={(r) => {
                  return this.props.remote.process('PROCESS_SMPC_OPTIONSFILTER', true, {
                    record: r,
                    dsRecord: record,
                  });
                }}
              />
            )
          );
        },
        help: (
          <>
            <p style={{ margin: 0 }}>
              {intl
                .get('smpc.ecPriceMonitor.view.percentDefine')
                .d('百分比：最新价格相较于上架价格的涨幅')}
            </p>
            <p style={{ margin: 0 }}>
              {intl.get('smpc.ecPriceMonitor.view.scaleDefine').d('数值：最新价格与阈值直接比较')}
            </p>
          </>
        ),
      },
      {
        name: 'variation',
        width: 130,
        editor: this.recordIsEdit,
        align: 'right',
      },
      {
        name: 'ecPriceMonitorOperatesView',
        width: 200,
        header: intl.get('smpc.ecPriceMonitor.view.triggerAction').d('触发操作'),
        // editor: this.recordIsEdit,
        renderer: ({ record }) => {
          const meaningList = record.get('ecPriceMonitorOperates').map((n) => n.operateTypeMeaning);
          return meaningList.join('、');
        },
      },
      {
        name: 'reminderConfig',
        width: 120,
        renderer: ({ record }) => {
          const isEdit = this.recordIsEdit(record);
          const { monitorStrategyId } = record.toData();
          return (
            <a disabled={!monitorStrategyId} onClick={() => this.handleOpenReminder(record)}>
              {isEdit
                ? intl.get('smpc.ecPriceMonitor.view.button.reminderConfig').d('提醒人配置')
                : intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'triggerLog',
        width: 120,
        renderer: ({ record }) => {
          return (
            <a disabled={record.status === 'add'} onClick={() => this.handleOpenLog(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'manualShelfCheck',
        width: 120,
        align: 'left',
        editor: (record) => {
          const edit = record.status === 'add' || record.editing;
          if (!edit) return false;
          return <CheckBox />;
        },
        renderer: ({ value, text }) => {
          return <Badge color={value ? '#3AB344' : '#f05434'} text={text} />;
        },
      },
      {
        name: 'remark',
        width: 100,
        editor: this.recordIsEdit,
      },
      {
        key: 'action',
        lock: 'right',
        align: 'left',
        width: 120,
        header: intl.get('hzero.common.action').d('操作'),
        command: this.renderOptions,
      },
    ];
  };

  renderOptions = ({ record }) => {
    const isEdit = record.status === 'add' || record.editing === true;

    const options = [
      {
        text: record.get('enabledFlag')
          ? intl.get('hzero.common.button.disable').d('禁用')
          : intl.get('hzero.common.button.enable').d('启用'),
        show: !isEdit,
        click: () => this.handleUpdateStatus(record),
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        show: !isEdit,
        click: () => this.handleOperateRecord(record),
        style: { marginLeft: 16 },
      },
    ];

    return options
      .filter((f) => f.show !== false)
      .map((m) => (
        <Button
          style={m.style}
          funcType="link"
          color="primary"
          onClick={m.click}
          disabled={m.disabled}
        >
          {m.text}
        </Button>
      ));
  };

  @Bind
  async handleUpdateStatus(record) {
    const { ds } = this.props;
    ds.status = 'loading';
    const { enabledFlag, ...others } = record.toData();
    const res = getResponse(
      await savePriceMonitor([{ ...others, enabledFlag: enabledFlag ? 0 : 1 }])
    );
    ds.status = 'ready';
    if (res) {
      notification.success();
      ds.query(ds.currentPage);
    }
  }

  @Bind
  handleCreate() {
    const { ds } = this.props;
    ds.create({ enabledFlag: 0, calculateRule: 'GT' }, 0);
  }

  handleSkuChange(skus) {
    this.saveCallback(skus);
  }

  handleOpenSku = (monitorStrategyId, monitorType) => {
    const title = intl.get('sagm.common.view.assignSku').d('分配商品');
    c7nModal({
      style: { width: 1090 },
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title,
      children: (
        <SkuTransfer
          monitorType={monitorType}
          monitorStrategyId={monitorStrategyId}
          onChange={(v) => this.handleSkuChange(v)}
        />
      ),
    });
  };

  getDefaultValues = ({ code, data, textField, valueField, codeField }) => {
    return data
      .filter((f) => f.monitorType === code)
      .map((m) => ({
        ...m,
        [textField]: m.dimensionValueName,
        [valueField]: m.dimensionValue,
        [codeField]: m.dimensionValueCode,
      }));
  };

  getSaveValues = ({ data, textField, valueField, codeField }) => {
    const organizationId = getCurrentOrganizationId();
    return data.map((m) => ({
      ...m,
      ...(this.monitorParams || {}),
      tenantId: organizationId,
      dimensionValue: m[valueField],
      dimensionValueCode: m[codeField],
      dimensionValueName: m[textField],
    }));
  };

  @Bind
  handleViewDimension(record) {
    const { monitorType, monitorStrategyId } = record.toData();
    this.monitorParams = { monitorType, monitorStrategyId };
    const dimensionDs = new DataSet(DimensionDs({ monitorType, monitorStrategyId }));
    dimensionDs.query();
    const columns = [
      { name: 'dimensionValueCode', minWidth: 200 },
      { name: 'dimensionLov', minWidth: 200 },
    ];
    c7nModal({
      title: intl.get('smpc.ecPriceMonitor.view.title.dimensionList').d('查看维度值'),
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <FilterBarTable
          dataSet={dimensionDs}
          columns={columns}
          customizedCode="SMPC.EC_PRICE_MONITOR.DIMENSION.LIST"
          filterBarConfig={{
            defaultSortedField: 'monitorDimensionId',
          }}
          style={{ maxHeight: `calc(100% - 2px)` }}
        />
      ),
    });
  }

  @Bind
  handleOpenDimension(record, saveCallback = (e) => e) {
    const { monitorType, monitorStrategyId } = record.toData();
    this.monitorParams = { monitorType, monitorStrategyId };
    this.saveCallback = saveCallback;
    const saveDimension = async (data) => {
      const res = getResponse(await saveTreeDimensions(data, monitorStrategyId));
      if (res) {
        notification.success();
        this.saveCallback(res);
        // ds.query(ds.currentPage);
        return true;
      } else {
        return false;
      }
    };
    const _this = this;
    const configMap = {
      PLATFORM_CATEGORY: {
        fieldConfig: {
          textField: 'categoryName',
          valueField: 'categoryId',
          codeField: 'categoryCode',
        },
        openConfig() {
          openCategoryTree({
            record,
            name: 'categorys',
            whole: false,
            nodeType: 'last',
            title: intl.get('smpc.product.view.platformCategory').d('平台分类'),
            checkValueConfig: {
              params: { monitorType, monitorStrategyId },
              queryService: fetchTreeDimensions,
              getValues: (data) =>
                _this.getDefaultValues({
                  data,
                  code: 'PLATFORM_CATEGORY',
                  ...this.fieldConfig,
                }),
            },
            onSave: (data) => saveDimension(_this.getSaveValues({ data, ...this.fieldConfig })),
          });
        },
      },
      CATALOG: {
        fieldConfig: {
          textField: 'catalogName',
          valueField: 'catalogId',
          codeField: 'catalogCode',
        },
        openConfig() {
          openCatalogTree({
            record,
            name: 'catalogs',
            whole: false,
            nodeType: 'last',
            title: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
            checkValueConfig: {
              params: { monitorType, monitorStrategyId },
              queryService: fetchTreeDimensions,
              getValues: (data) =>
                _this.getDefaultValues({
                  data,
                  code: 'CATALOG',
                  ...this.fieldConfig,
                }),
            },
            onSave: (data) => saveDimension(_this.getSaveValues({ data, ...this.fieldConfig })),
          });
        },
      },
      SKU: {
        openConfig: () => this.handleOpenSku(monitorStrategyId, monitorType),
      },
      SUPPLIER: {
        openConfig: () => this.openSupplierModal(),
      },
    };
    const config = configMap[monitorType];
    if (config && config.openConfig) config.openConfig();
  }

  @Bind
  handleOpenReminder(record) {
    const { monitorStrategyId } = record.toData();
    const title = intl.get('smpc.ecPriceMonitor.view.title.reminderList').d('查看提醒人');
    const reminderDs = new DataSet(ReminderDs(monitorStrategyId, true));
    reminderDs.query();
    const columns = [
      { name: 'remindType', minWidth: 140 },
      {
        name: 'accountLov',
        minWidth: 200,
      },
      {
        name: 'roleLov',
        minWidth: 200,
      },
    ];
    c7nModal({
      title,
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <FilterBarTable
          dataSet={reminderDs}
          columns={columns}
          customizedCode="SMPC.EC_PRICE_MONITOR.REMINDER.LIST"
          filterBarConfig={{
            defaultSortedField: 'monitorRemindId',
          }}
          style={{ maxHeight: `calc(100% - 2px)` }}
        />
      ),
    });
  }

  @Bind
  handleOpenLog(record) {
    const { monitorStrategyId } = record.toData();
    const triggerLogDs = new DataSet(TriggerLogDs(monitorStrategyId));
    triggerLogDs.query();
    const columns = [
      {
        name: 'triggerResultFlag',
        width: 120,
        renderer: ({ value }) => (
          <Tag color={value ? 'green' : 'red'} style={{ border: 'none' }}>
            {value
              ? intl.get('smpc.ecPriceMonitor.view.success').d('成功')
              : intl.get('smpc.ecPriceMonitor.view.fail').d('失败')}
          </Tag>
        ),
      },
      {
        name: 'skuCode',
        width: 100,
      },
      {
        name: 'skuName',
        width: 160,
      },
      { name: 'supplierCompanyName', width: 160 },
      {
        name: 'firstPrice',
        type: 'number',
        width: 100,
      },
      {
        name: 'lastPrice',
        type: 'number',
        width: 100,
      },
      {
        name: 'increaseRate',
        width: 100,
      },
      {
        name: 'operateTypeMeaning',
        width: 100,
      },
      {
        name: 'triggerDate',
        width: 150,
      },
    ];
    c7nModal({
      title: intl.get('smpc.ecPriceMonitor.view.title.triggerLog').d('查看日志'),
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <FilterBarTable
          dataSet={triggerLogDs}
          columns={columns}
          customizedCode="SMPC.EC_PRICE_MONITOR.TRIGGERLOG.LIST"
          style={{ maxHeight: `calc(100% - 5px)` }}
          buttons={[
            <ExcelExportPro
              templateCode="SMPC_EC_PRICE_MONITOR_LOG"
              buttonText={intl.get('smpc.product.button.exportNew').d('(新)导出')}
              exportAsync
              otherButtonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
              }}
              requestUrl={`/smec/v1/${getCurrentOrganizationId()}/ec-price-monitor-logs/export`}
              queryParams={() => {
                const params =
                  (triggerLogDs.queryDataSet && triggerLogDs.queryDataSet.current.toJSONData()) ||
                  {};
                delete params.__dirty;
                delete params.__id;
                delete params._status;
                return { ...filterNullValueObject({ ...params, monitorStrategyId }) };
              }}
            />,
          ]}
          filterBarConfig={{
            defaultCollpase: true,
            collpaseble: true,
            // defaultSortedField: 'creationDate',
          }}
        />
      ),
    });
  }

  operateRecordRender = ({ record }, strategyName) => {
    const { operatorByMeaning, operateTypeMeaning, operateDate, operateType } = record.get([
      'operatorByMeaning',
      'operateTypeMeaning',
      'operateDate',
      'operateType',
    ]);
    const actions = {
      DISABLED: {
        icon: 'not_interested',
        color: '#F05434',
      },
      ENABLED: {
        icon: 'finished',
      },
      NEW: {
        icon: 'add',
      },
      EDIT: {
        icon: 'mode_edit',
      },
    };
    const { icon, color } = actions[operateType] || {};

    return {
      icon,
      time: operateDate,
      color,
      header: (
        <div className={styles['operate-action']}>
          <div className="operate-wrapper">
            <span className="operate-name">{`${operatorByMeaning} (${getCurrentOrganizationId()}) `}</span>
            <span className="operate-action">{operateTypeMeaning}</span>
            <span className="operate-text">
              【<span className="record-text">{strategyName}</span>】
            </span>
          </div>
        </div>
      ),
    };
  };

  @Bind
  handleOperateRecord(record) {
    const { monitorStrategyId, strategyName } = record.get(['monitorStrategyId', 'strategyName']);
    const operateRecordDs = new DataSet(OperateRecordDs());
    operateRecordDs.setQueryParameter('monitorStrategyId', monitorStrategyId);
    operateRecordDs.query();
    c7nModal({
      title: intl.get('smpc.product.view.operateRecord').d('操作记录'),
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <RecordTimeLine
          dataSet={operateRecordDs}
          renderer={(v) => this.operateRecordRender(v, strategyName)}
        />
      ),
    });
  }

  render() {
    return (
      <Fragment>
        <Header title={intl.get('smpc.ecPriceMonitor.view.title.ecPriceMonitor').d('电商价格监控')}>
          <Button icon="add" color="primary" onClick={() => this.handleEdit()}>
            {intl.get('smpc.ecPriceMonitor.view.button.createStrategy').d('新建策略')}
          </Button>
        </Header>
        <Content>
          {this.supplierLov.comp}
          <SearchBarTable
            dataSet={this.props.ds}
            columns={this.getColumns()}
            searchCode="SMPC_EC_PRICE_MONITOR.LIST_SEARCH_BAR"
            customizedCode="SMPC.EC_PRICE_MONITOR.LIST"
            style={{ maxHeight: `calc(100vh - 190px)` }}
          />
        </Content>
      </Fragment>
    );
  }
}
