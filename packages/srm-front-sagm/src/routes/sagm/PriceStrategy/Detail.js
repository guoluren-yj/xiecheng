import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Form,
  Spin,
  TextField,
  TextArea,
  Select,
  Button,
  Output,
  Table,
  Lov,
  Tooltip,
  CheckBox,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import remoteFunc from 'hzero-front/lib/utils/remote';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import c7nModal, { openList } from '@/utils/c7nModal';
import { precisionEditor, PrecisionField } from '@/utils/precision';
import { openUnitTree, openCategoryTree, openCatalogTree } from '@/utils/tree';
import { overlinePriceRenderer } from '../SagmWorkbench/renderers';

import SkuTransfer from './SkuTransfer';
import {
  fetchSingle,
  savePriceStrategy,
  joinAssignSku,
  deleteAssignSku,
  fetchOrgDimension,
} from './api';
import { isRepeat } from '../commonUtils';
import { formDs, tableDs, ladderDs } from './storeDs';
import Card from '../SagmWorkbench/Comps/Card';

const MultiButton = observer(({ children, dataSet, disabled, ...props }) => {
  return (
    <Tooltip
      title={
        dataSet.selected < 1
          ? intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据')
          : ''
      }
    >
      <Button dataSet={dataSet} disabled={disabled || dataSet.selected < 1} {...props}>
        {children}
      </Button>
    </Tooltip>
  );
});

const OverlinePriceRenderer = observer((props) => {
  const { dataSet } = props;
  const overlinePriceEnable = dataSet?.current?.get('overlinePriceEnable');
  return (
    <>
      {' '}
      {overlinePriceRenderer({
        record: {
          get: () => ({
            overlinePriceEnable,
            overlinePriceEnableMeaning:
              overlinePriceEnable === 1
                ? intl.get('hzero.common.yes').d('是')
                : intl.get('hzero.common.no').d('否'),
          }),
        },
      })}
    </>
  );
});

/**
 * 销售协议工作台-价格策略入口
 */
@remoteFunc({
  code: 'REMOTE_PRICE_STRATEGY', // 松下二开，商品穿梭框增加采购方字段 需求 mall-6213
  name: 'remote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { modal, readOnly, type, changeUuid } = props;

    this.formDs = new DataSet(formDs(readOnly));

    this.tableDs = new DataSet(tableDs(readOnly));

    this.ladderDs = new DataSet(ladderDs(readOnly || changeUuid));

    modal.handleOk(() => {
      return readOnly ? true : this.handleSave();
    });

    this.updateFooter();

    this.state = {
      type,
      loading: false,
      priceMethod: 1,
      isLadderPrice: 0,
      // 默认上调
      priceDirection: 1,
    };
  }

  organizationId = getCurrentOrganizationId();

  updateFooter = (modalProps) => {
    const { modal, readOnly, changeUuid } = this.props;
    const okText = readOnly
      ? intl.get('hzero.common.button.close').d('关闭')
      : changeUuid
      ? intl.get('sagm.common.button.saveAndExecuted').d('保存并执行')
      : intl.get('hzero.common.button.save').d('保存');
    modal.update({
      ...modalProps,
      okText,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => {
        return [
          okBtn,
          !readOnly && (
            <Button onClick={() => (readOnly ? true : this.handleSave(true))}>
              {intl.get('sagm.common.btn.saveAndClose').d('保存并关闭')}
            </Button>
          ),
          !readOnly && cancelBtn,
        ];
      },
    });
  };

  // 策略维度
  @Bind
  getColumns() {
    const { readOnly, changeUuid } = this.props;
    return [
      {
        name: 'strategyDimension',
        width: 150,
        editor: (record, name) => {
          if (readOnly) return false;
          return (
            <Select
              onFocus={() => {
                record.getField(name).options.query();
              }}
            />
          );
        },
        renderer: ({ record, text }) => {
          if (readOnly) {
            return record.get('strategyDimensionName');
          }
          return text;
          // return <Lov record={record} name="strategyDimension" />;
        },
      },
      {
        name: 'dimensionValue',
        editor: (record) => {
          const code = record.get('strategyDimensionCode');
          if (readOnly || code === 'SKU' || (code === 'ORGANIZATION' && !!changeUuid)) return false;
          return this.dimensionValueEditor(record);
        },
        renderer: ({ record, text }) => {
          const code = record.get('strategyDimensionCode');
          if (readOnly) {
            return this.renderReadValue(record);
          }
          if (code === 'SKU') {
            const disabled = record.status === 'add';
            return (
              <a
                disabled={this.executedDimensionDisable(record)}
                onClick={() => {
                  if (!disabled) {
                    this.handleShowTransfer(record);
                  }
                }}
              >
                <Tooltip
                  title={
                    disabled &&
                    intl
                      .get('sagm.common.view.message.skuDimensionDisabled')
                      .d('请保存后进行商品维度维护')
                  }
                >
                  {intl.get('sagm.common.model.product').d('商品')}
                </Tooltip>
              </a>
            );
          }
          return text;
        },
      },
    ];
  }

  componentDidMount() {
    const { type = 'create' } = this.props;
    if (type === 'create') {
      this.initOrgDimension();
      this.formDs.create({ overlinePriceEnable: 0 });
    } else {
      this.initData();
    }
  }

  @Bind
  async initOrgDimension() {
    this.setState({ loading: true });
    const res = getResponse(await fetchOrgDimension());
    this.setState({ loading: false });
    if (res) {
      this.tableDs.create({ strategyDimension: res.content[0], allOrgEnable: 1 }, 0);
    }
  }

  executedDimensionDisable = (record) => {
    const { changeUuid } = this.props;
    return (
      changeUuid && this.tableDs.records.filter((f) => f.id !== record.id).some((s) => s.dirty)
    );
  };

  @Bind
  dimensionValueEditor(record) {
    const { changeUuid } = this.props;
    const code = record.get('strategyDimensionCode');
    const dimensionDisabled = this.executedDimensionDisable(record);
    const categoryDisabled = changeUuid && record.get('includeAllFlag');
    const valueMapComponent = {
      ORGANIZATION: (
        <Lov
          disabled={changeUuid}
          onClick={() =>
            openUnitTree({
              name: 'dimensionValue',
              dataStoreKey: 'organizations',
              record,
              title: intl.get('sagm.common.model.selectOrg').d('选择组织'),
            })
          }
        />
      ),
      CATALOG: (
        <Lov
          disabled={dimensionDisabled || categoryDisabled}
          onClick={() =>
            openCategoryTree({
              name: 'dimensionValue',
              dataStoreKey: 'categorys',
              record,
              whole: !changeUuid,
              nodeType: 'last',
              allField: 'includeAllFlag',
              title: intl.get('sagm.common.model.selectCategory').d('选择分类'),
            })
          }
        />
      ),
      // 供应商
      SUPPLIER: <Lov disabled={dimensionDisabled} />,
      // 目录维度
      DIRECTORY: (
        <Lov
          disabled={dimensionDisabled}
          onClick={() =>
            openCatalogTree({
              name: 'dimensionValue',
              dataStoreKey: 'directory',
              record,
              whole: false,
              title: intl.get('sagm.common.model.selectDirectory').d('选择目录'),
            })
          }
        />
      ),
    };
    return valueMapComponent[code] || false;
  }

  @Bind
  renderReadValue(record) {
    const {
      strategyDimension = {},
      allOrgEnable,
      allSkuEnable,
      includeAllFlag,
      orgMappings = [],
      catalogMappings = [],
      supplierMappings = [],
      directoryMappings = [],
    } = record.toData();
    const { strategyDimensionCode } = strategyDimension || {};
    const dimensionConfig = {
      ORGANIZATION: {
        data: orgMappings,
        columns: [
          {
            name: 'unitCode',
            header: intl.get('sagm.common.view.organization.code').d('组织编码'),
          },
          {
            name: 'unitName',
            header: intl.get('sagm.common.view.organization.name').d('组织名称'),
          },
        ],
        title: intl.get('sagm.common.view.hasOrg').d('已选组织'),
        comp: allOrgEnable && intl.get('sagm.common.model.allOrganizations').d('所有组织'),
      },
      CATALOG: {
        data: catalogMappings,
        columns: [
          {
            name: 'code',
            header: intl.get('sagm.common.view.category.code').d('分类编码'),
          },
          {
            name: 'name',
            header: intl.get('sagm.common.view.category.name').d('分类名称'),
          },
        ],
        title: intl.get('sagm.common.view.hasCategory').d('已选分类'),
        comp: includeAllFlag && intl.get('sagm.common.model.allCategory').d('所有分类'),
      },
      DIRECTORY: {
        data: directoryMappings,
        columns: [
          {
            name: 'code',
            header: intl.get('sagm.common.view.directory.code').d('目录编码'),
          },
          {
            name: 'name',
            header: intl.get('sagm.common.view.directory.name').d('目录名称'),
          },
        ],
        title: intl.get('sagm.common.view.hasDirectory').d('已选目录'),
      },
      SUPPLIER: {
        data: supplierMappings,
        columns: [
          {
            name: 'supplierCompanyNum',
            header: intl.get('sagm.common.view.suplier.code').d('供应商编码'),
          },
          {
            name: 'supplierCompanyName',
            header: intl.get('sagm.common.view.suplier.name').d('供应商名称'),
          },
        ],
        title: intl.get('sagm.common.view.hasSuplier').d('已选供应商'),
      },
      SKU: {
        comp: allSkuEnable ? (
          intl.get('sagm.common.model.allSku').d('全部商品')
        ) : (
          <a onClick={() => this.handleShowTransfer(record)}>
            {intl.get('sagm.common.model.viewAssignProduct').d('查看分配商品')}
          </a>
        ),
      },
    };
    const config = dimensionConfig[strategyDimensionCode];
    if (!config) return '-';
    const { comp, data, title, columns } = config;
    return comp || <a onClick={() => openList({ title, data, columns })}>{title}</a>;
  }

  @Bind
  async initData(priceStrategyId) {
    const { type, readOnly } = this.props;
    this.setState({ loading: true });
    this.updateFooter({ okProps: { loading: true } });
    const res = await fetchSingle({ priceStrategyId: priceStrategyId || type });
    this.setState({ loading: false });
    this.updateFooter({ okProps: { loading: false } });
    const result = getResponse(res);
    if (result) {
      const {
        amountMarkupFlag,
        isLadderPrice,
        priceStrategyConditions = [],
        ladderPriceStrategies,
        adjustDirection,
      } = result;
      const priceMethod = amountMarkupFlag ? 2 : 1;
      const dimensionData = (priceStrategyConditions || []).map((m) =>
        readOnly ? m : { ...m, _status: 'update' }
      );
      this.formDs.create(result);
      this.tableDs.loadData(dimensionData);
      this.ladderDs.loadData(ladderPriceStrategies || []);
      this.ladderQunatityToSet();
      this.ladderMethodSet(priceMethod);
      this.setState({
        priceMethod,
        isLadderPrice,
        priceDirection: adjustDirection === 'UPWARD' ? 1 : 2,
      });
    }
  }

  @Bind
  hasOrgDimension() {
    return (
      this.tableDs && this.tableDs.find((r) => r.get('strategyDimensionCode') === 'ORGANIZATION')
    );
  }

  @Bind
  async handleCreate() {
    this.tableDs.create({}, 0);
  }

  @Bind
  async handleDelete() {
    // const code = record.get('strategyDimensionCode');
    // const dataSource = this.tableDs.toData();
    // // 如果是已经保存过的, 为仅有的组织不可删除、为仅有的商品或分类不可删
    // // 如果是已经保存过的，为组织，并且还存在新建的组织，不可删除并且提示请删除其他重复策略行
    // // 如果是已经保存过的，为商品，并且没有其他的已保存的分类，并且还存在其他新建的商品或分类，不可删除并且提示请删除其他新增的商品/平台分类
    // // 如果是已经保存过的，为平台分类，并且没有其他的已保存的商品，并且还存在其他新建的商品或分类，不可删除并且提示请删除其他新增的商品/平台分类
    // // 平台分类为所有分类即为没有该维度
    // let flag = false;

    // if (record.status !== 'add') {
    //   const isOrg = code === 'ORGANIZATION';
    //   const isSkuOrCategory = ['SKU', 'CATALOG', 'SUPPLIER', 'DIRECTORY'].includes(code);

    //   const orgData = dataSource.filter((f) => f.strategyDimensionCode === 'ORGANIZATION');
    //   const otherData = dataSource.filter((f) =>
    //     ['SKU', 'CATALOG', 'SUPPLIER', 'DIRECTORY'].includes(f.strategyDimensionCode)
    //   );
    //   if (isOrg && orgData.length < 2) {
    //     notification.warning({
    //       message: intl
    //         .get('sagm.priceStrategy.view.orgDimensionDeleteMsg')
    //         .d('组织策略维度不能删除'),
    //     });
    //     flag = true;
    //     return false;
    //   }
    //   if (isOrg && orgData.length > 1) {
    //     notification.warning({
    //       message: intl
    //         .get('sagm.priceStrategy.view.orgDimensionDeleteOtherMsg')
    //         .d('该策略维度不可删除，请删除其他新增组织策略维度'),
    //     });
    //     flag = true;
    //     return false;
    //   }
    //   if (isSkuOrCategory && otherData.length < 2) {
    //     notification.warning({
    //       message: intl
    //         .get('sagm.priceStrategy.view.skuOrgCategoryDeleteMsg')
    //         .d('至少存在一条商品/平台分类/目录/供应商策略维度'),
    //     });
    //     flag = true;
    //     return false;
    //   }
    //   const updateOtherData = otherData.filter((f) => f.strategyConditionId); // 已保存商品/平台分类仅此一个，同时其他新建状态的商品/平台分类存在
    //   if (
    //     isSkuOrCategory &&
    //     updateOtherData.length < 2 &&
    //     updateOtherData.length < otherData.length
    //   ) {
    //     notification.warning({
    //       message: intl
    //         .get('sagm.priceStrategy.view.skuOrgCategoryDeleteOtherMsg')
    //         .d('该策略维度不可删除，请删除其他新增商品/平台分类/目录/供应商策略维度'),
    //     });
    //     flag = true;
    //     return false;
    //   }
    // }
    // if (flag) return false;
    // if (record.status === 'add') {
    //   this.tableDs.remove([record]);
    // } else {
    //   this.tableDs.status = 'loading';
    //   const param = record.toJSONData();
    //   const res = await deleteDimension({
    //     ...param,
    //     catalogMappings: param.includeAllFlag ? null : param.catalogMappings,
    //   });
    //   this.tableDs.status = 'ready';
    //   const result = getResponse(res);
    //   if (result) {
    //     notification.success();
    //     const _record = record;
    //     _record.status = 'add';
    //     this.tableDs.remove([_record]);
    //   }
    // }

    // 固定组织，其他都可以删除，保存时校验必须要有除组织外的其他维度
    const dataSet = this.tableDs;
    if (dataSet.unSelected.filter((f) => f.status !== 'add').length < 2) {
      notification.warning({
        message: intl
          .get('sagm.priceStrategy.view.skuOrgCategoryDeleteMsg')
          .d('至少存在一条商品/平台分类/目录/供应商策略维度'),
      });
      return false;
    }
    const addRecords = dataSet.selected.filter((f) => f.status === 'add');
    const updateRecords = dataSet.selected.filter((f) => f.status !== 'add');
    if (updateRecords.length > 0) {
      dataSet.delete(updateRecords).then((res) => res && dataSet.remove(addRecords));
    } else {
      dataSet.remove(addRecords);
    }
  }

  @Bind
  async handleSave(closeFlag = false) {
    const {
      changeUuid,
      onFetchList = (e) => e,
      type,
      changeData = {},
      onSuccess = (e) => e,
      modal,
    } = this.props;
    const { isLadderPrice } = this.state;
    const formData = this.formDs.current;
    // if (isLadderPrice && priceDirection === 2) {
    //   formData.set('isLadderPrice', 0);
    // }
    // const isLadders = Number(formData.get('isLadderPrice'));
    const isLadders = !!isLadderPrice;
    const headerFlag = await this.formDs.validate();
    const listFlag = await this.tableDs.validate();
    let ladderFlag = true;
    if (isLadders) {
      ladderFlag = await this.ladderDs.validate();
    }
    const list = this.tableDs.toData();
    const ladders = isLadders ? this.ladderDs.toData() : [];
    const dimensionFlag = list.some((s) =>
      ['SKU', 'SUPPLIER', 'DIRECTORY', 'CATALOG'].includes(s.strategyDimensionCode)
    );
    const isOrgDimension = list.some((s) => s.strategyDimensionCode === 'ORGANIZATION');
    const [isRepeatDimension] = isRepeat(list, 'strategyDimensionId');
    if (headerFlag && listFlag && ladderFlag) {
      if (!isOrgDimension && !changeUuid) {
        notification.warning({
          message: intl.get('sagm.priceStrategy.view.orgDimensionMsg').d('请创建一条组织策略维度'),
        });
        return false;
      }
      if (!dimensionFlag && !changeUuid) {
        notification.warning({
          message: intl
            .get('sagm.priceStrategy.view.skuCategoryDimensionMsg')
            .d('请创建一条商品/平台分类/目录/供应商策略维度'),
        });
        return false;
      }
      if (isRepeatDimension && !changeUuid) {
        notification.warning({
          message: intl.get('sagm.priceStrategy.view.repeatDimensionMsg').d('请勿添加重复策略维度'),
        });
        return false;
      }
      const isRuleValidate = ladders.some((s, i) => {
        if (ladders[i + 1]) {
          return !math.eq(s.quantityTo, ladders[i + 1].quantityFrom);
        } else {
          return false;
        }
      });
      if (isLadders && isRuleValidate) {
        notification.warning({
          message: intl
            .get('sagm.common.view.saveLadderPriceMessage')
            .d('阶梯价格下一行的数量从必须等于上一行的数量至'),
        });
        return false;
      }
      const header = formData.toData();
      const { priceMethod, ...other } = header;
      const records = changeUuid ? this.tableDs.filter((f) => f.dirty) : this.tableDs;
      // 单独处理分类
      const catalogRecord = records.find((f) => f.get('strategyDimensionCode') === 'CATALOG');
      let catalogData = [];
      if (catalogRecord) {
        catalogData = catalogRecord.getState('catalogMappings') || [];
      }
      const mapList = records.map((record) => {
        const m = record.toData();
        let { orgMappings } = m;

        const { initOrgs = [], initCatalogs = [], strategyDimensionCode } = m;

        const isCategory = strategyDimensionCode === 'CATALOG';

        if (isCategory) {
          catalogData = catalogData.length > 0 ? catalogData : m.catalogMappings;

          catalogData = catalogData.map((c) => {
            const findOld = initCatalogs.find((f) => f.catalogId === c.categoryId);
            return findOld || { catalogId: c.categoryId };
          });
        }

        const isDirectory = strategyDimensionCode === 'DIRECTORY';
        let directoryData = [];
        if (isDirectory) {
          directoryData = m.directoryMappings.map((i) => ({
            ...i,
            directoryId: i.catalogId,
            tenantId: this.organizationId,
            strategyConditionId: m.strategyDimensionId,
          }));
        }

        orgMappings = orgMappings.map((c) => {
          const findOld = initOrgs.find((f) => f.orgId === c.unitId);
          return findOld || { orgLevelPath: c.levelPath, orgId: c.unitId };
        });

        const allOrgEnable = orgMappings.some((s) => s.orgId === 'ALL') ? 1 : 0;
        // const allCatalogEnable = orgMappings.some((s) => s.orgId === 'ALL') ? 1 : 0;
        delete m._status;
        delete m.initOrgs;
        delete m.orgMappings;
        delete m.dimensionValue;
        return {
          ...m,
          allOrgEnable,
          catalogMappings: isCategory && !m.includeAllFlag ? catalogData : null,
          orgMappings: allOrgEnable ? null : orgMappings,
          directoryMappings: isDirectory ? directoryData : null,
        };
      });
      const params = {
        ...other,
        ...changeData,
        isLadderPrice,
        tenantId: this.organizationId,
        percentageMarkupFlag: priceMethod === 1 ? 1 : 0,
        amountMarkupFlag: priceMethod === 2 ? 1 : 0,
        markupPercentage: priceMethod === 2 && isLadders ? null : other.markupPercentage,
        upperPrice: priceMethod === 1 && isLadders ? null : other.upperPrice,
        upperLimitPercentage: priceMethod === 1 && isLadders ? null : other.upperLimitPercentage,
        priceStrategyConditions: mapList,
        ladderPriceStrategies: ladders,
      };
      const res = await savePriceStrategy(params);
      const result = getResponse(res);
      if (result) {
        notification.success();
        this.setState({ type: result.priceStrategyId });
        this.initData(result.priceStrategyId);
        onSuccess(result);
        onFetchList(type);
        if (closeFlag) {
          modal.close();
          return true;
        }
        if (changeUuid) {
          return true;
        }
        // return true;
      }
    }
    return false;
  }

  @Bind
  handleShowTransfer(record) {
    const { readOnly, changeUuid, viewSkuBackPath, permissionList = [], remote } = this.props;
    const strategyConditionId = record && record.get('strategyConditionId');
    const title = readOnly
      ? intl.get('sagm.common.view.assignedSku').d('已分配商品')
      : intl.get('sagm.common.view.assignSku').d('分配商品');
    c7nModal({
      style: { width: 1090 },
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title,
      children: (
        <SkuTransfer
          record={record}
          readOnly={readOnly}
          backPath={viewSkuBackPath}
          path={this.props.path}
          params={{ changeUuid, strategyConditionId }}
          permissionList={permissionList}
          leftInfo={{
            url: `/sagm/v1/${this.organizationId}/sku-mappings/sku`,
            params: { changeUuid, strategyConditionId },
          }}
          queryFieldsLimit={3}
          rightInfo={{
            url: `/sagm/v1/${this.organizationId}/sku-mappings`,
            params: { changeUuid, strategyConditionId },
          }}
          queryDs={
            new DataSet({
              autoCreate: true,
              fields: remote.process(
                'SKU_TRANSFER_QUERY_DS',
                [
                  {
                    name: 'skuName',
                    label: intl.get('sagm.common.model.skuName').d('商品名称'),
                  },
                  {
                    name: 'skuCode',
                    label: intl.get('sagm.common.model.skuCode').d('商品编码'),
                  },
                  {
                    name: 'categoryLov',
                    label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
                    type: 'object',
                    valueField: 'categoryId',
                    lovCode: 'SMPC.CATEGORY',
                    ignore: 'always',
                    lovPara: {
                      tenantId: this.organizationId,
                    },
                  },
                  {
                    name: 'cid',
                    bind: 'categoryLov.categoryId',
                  },
                  {
                    name: 'supplierCompanyLov',
                    label: intl.get('sagm.common.model.supplier').d('供应商'),
                    type: 'object',
                    lovCode: 'SMAL.SUPPLIER_BY_PUR',
                    valueField: 'supplierId',
                    ignore: 'always',
                    lovPara: {
                      tenantId: this.organizationId,
                    },
                  },
                  {
                    name: 'supplierCompanyId',
                    bind: 'supplierCompanyLov.supplierId',
                  },
                  {
                    name: 'price',
                    type: 'number',
                    label: intl.get('sagm.common.model.priceRange').d('价格范围'),
                    range: ['priceFrom', 'priceTo'],
                    ignore: 'always',
                    precision: 10,
                    min: 0,
                  },
                  {
                    name: 'priceFrom',
                    bind: 'price.priceFrom',
                  },
                  {
                    name: 'priceTo',
                    bind: 'price.priceTo',
                  },
                  {
                    name: 'thirdSkuCode',
                    label: intl.get('sagm.common.model.thirdSkuCode').d('第三方商品编码'),
                  },
                ],
                // 二开参数
                {
                  purchaseQueryF: [
                    {
                      name: 'companyLov',
                      label: intl.get('sagm.common.model.purchase').d('采购方'),
                      type: 'object',
                      lovCode: 'SMPC.USER_AUTH.COMPANY',
                      valueField: 'companyId',
                      textField: 'companyName',
                      ignore: 'always',
                      lovPara: {
                        tenantId: this.organizationId,
                      },
                    },
                    {
                      name: 'companyId',
                      bind: 'companyLov.companyId',
                    },
                  ],
                }
              ),
            })
          }
          queryFields={remote.process(
            'SKU_TRANSFER_QUERY_COLUMNS',
            [
              { name: 'skuName' },
              { name: 'skuCode' },
              { name: 'categoryLov', fieldType: 'Lov' },
              { name: 'supplierCompanyLov', fieldType: 'Lov' },
              { name: 'price', fieldType: 'NumberField' },
              { name: 'thirdSkuCode' },
            ],
            // 二开参数
            {
              purchaseQueryC: { name: 'companyLov', fieldType: 'Lov' },
            }
          )}
          onJoin={joinAssignSku}
          onDelete={deleteAssignSku}
          onSkuChange={() => {
            record.set('skuChange', true);
          }}
        />
      ),
    });
  }

  getFormField(formFields = []) {
    return formFields
      .filter((f) => f.filter !== false)
      .map((formField) => {
        const { readOnly = false, FormField = TextField, ...props } = formField;
        const ResField = readOnly ? Output : FormField;
        return <ResField {...props} />;
      });
  }

  getLadderPrice = () => {
    const { readOnly: read = false, changeUuid } = this.props;
    const { priceMethod } = this.state;
    const readOnly = read || changeUuid;
    const methodCol =
      priceMethod === 1
        ? {
            name: 'percentage',
            align: 'left',
            editor: (record) => {
              if (readOnly) return false;
              return precisionEditor({
                record,
                precision: 10,
                name: 'percentage',
              });
            },
          }
        : {
            name: 'amount',
            editor: (record) => {
              if (readOnly) return false;
              return precisionEditor({
                record,
                precision: 10,
                name: 'amount',
              });
            },
          };
    const DelBtn = observer(({ dataSet }) => (
      <Button
        icon="delete_sweep"
        funcType="flat"
        color="primary"
        disabled={dataSet.selected.length < 1}
        onClick={this.ladderDelete}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ));
    const columns = [
      { name: 'number', width: 80 },
      {
        name: 'quantityFrom',
        align: 'right',
        editor: (record) => {
          if (readOnly) return false;
          return precisionEditor({
            record,
            precision: 6,
            name: 'quantityFrom',
          });
        },
      },
      {
        name: 'quantityTo',
        align: 'right',
        editor: (record) => {
          if (readOnly) return false;
          return precisionEditor({
            record,
            precision: 6,
            name: 'quantityTo',
          });
        },
      },
      { ...methodCol },
    ];
    const buttons = [
      <Button icon="playlist_add" funcType="flat" color="primary" onClick={this.ladderCreate}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <DelBtn dataSet={this.ladderDs} />,
    ];
    return (
      <Table
        customizedCode="SAGM.PRICE_STRAEGY.DETAIL.LADDER_PRICE"
        dataSet={this.ladderDs}
        style={{ marginTop: 16, maxHeight: 423 }}
        columns={columns}
        buttons={readOnly || changeUuid ? [] : buttons}
      />
    );
  };

  ladderCreate = async () => {
    const data = this.ladderDs.toData();
    const { number = 0 } = data.pop() || {};
    this.ladderDs.create({ number: number + 1, tenantId: this.organizationId });
    this.ladderQunatityToSet();
  };

  ladderQunatityToSet = () => {
    this.ladderDs.forEach((record, ind) => {
      const field = record.getField('quantityTo');
      if (ind === this.ladderDs.length - 1) {
        field.set('required', false);
      } else {
        field.set('required', true);
      }
    });
  };

  ladderMethodSet = (method = 1) => {
    const percent = this.ladderDs.getField('percentage');
    const amount = this.ladderDs.getField('amount');
    percent.set('required', method === 1);
    amount.set('required', method === 2);
  };

  ladderDelete = async () => {
    const ladders = this.ladderDs.toData();
    const selects = this.ladderDs.selected.map((m) => m.toData());
    const filters = ladders.filter((f) => !selects.some((s) => s.number === f.number));
    const filterEnd = filters.pop();
    if (filterEnd && selects[0].number - 1 !== filterEnd.number) {
      notification.warning({
        message: intl
          .get('sagm.common.view.deleteLadderPriceMessage')
          .d('只能从最后一条阶梯价格开始删除'),
      });
      return false;
    }
    const createRecords = this.ladderDs.selected.filter((m) => !m.get('ladderPriceId'));
    const updateRecords = this.ladderDs.selected.filter((m) => m.get('ladderPriceId'));
    if (updateRecords.length > 0) {
      this.ladderDs.delete(updateRecords).then((res) => {
        if (res) {
          this.ladderDs.remove(createRecords);
          this.ladderQunatityToSet();
        }
      });
    } else {
      this.ladderDs.remove(createRecords);
      this.ladderQunatityToSet();
    }
  };

  changeAdjustDirection = (value) => {
    const { priceMethod } = this.state;
    const record = this.formDs.current;
    const isLadderPrice = value === 'UPWARD' ? record.get('isLadderPrice') : 0;
    this.setState({
      priceDirection: value === 'UPWARD' ? 1 : 2,
      isLadderPrice,
    });
    record.set('isLadderPrice', isLadderPrice);
    if (priceMethod !== 1) {
      const _priceMethod = value === 'DOWNWARD' ? 1 : null;
      record.set('priceMethod', _priceMethod);
      this.changeAdjustWay(_priceMethod);
    }
  };

  changeAdjustWay = (value) => {
    this.setState({
      priceMethod: value,
    });
    this.ladderMethodSet(value);
  };

  render() {
    const { readOnly, changeUuid } = this.props;
    const { type, loading, priceMethod, isLadderPrice, priceDirection } = this.state;
    let buttons = [];
    if (!readOnly) {
      buttons = changeUuid
        ? []
        : [
          <Button
            icon="playlist_add"
            disabled={changeUuid}
            funcType="flat"
            color="primary"
            onClick={this.handleCreate}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          <MultiButton
            icon="delete_sweep"
            dataSet={this.tableDs}
            disabled={changeUuid || (this.tableDs.length === 1 && this.hasOrgDimension())}
            onClick={() => this.handleDelete()}
          >
            {intl.get('small.common.model.batchDelete').d('批量删除')}
          </MultiButton>,
          ];
    }
    const columns = this.getColumns();
    return (
      <Fragment>
        <Spin spinning={loading}>
          <Card title={intl.get('sagm.common.view.title.strategyBase').d('策略基本信息')}>
            <Form
              dataSet={this.formDs}
              labelLayout={readOnly ? 'vertical' : 'float'}
              columns={2}
              style={{ width: '75%' }}
              className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
            >
              {this.getFormField([
                {
                  readOnly,
                  name: 'strategyCode',
                  disabled: type !== 'create',
                },
                {
                  readOnly,
                  name: 'versionNum',
                },
                {
                  readOnly,
                  colSpan: 2,
                  name: 'strategyName',
                },
                {
                  readOnly,
                  rowSpan: 2,
                  colSpan: 2,
                  name: 'remark',
                  resize: 'both',
                  FormField: TextArea,
                },
              ])}
            </Form>
          </Card>
          <Card
            title={intl.get('sagm.common.view.title.strategyDimension').d('策略维度')}
            tip={
              intl.get('sagm.common.view.title.strategyDimensions').d('多个维度关系为“且”') +
              (changeUuid
                ? `，${intl
                    .get('sagm.common.view.message.executedDimension')
                    .d('已执行的策略仅支持单维度内修改（组织维度除外）')}`
                : '')
            }
            style={{ margin: '16px 0' }}
          >
            <Table
              dataSet={this.tableDs}
              buttons={buttons}
              columns={columns}
              customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_DETAIL"
            />
          </Card>
          <Card title={intl.get('sagm.common.view.execRule').d('执行规则')}>
            {changeUuid && (
              <div style={{ color: 'rgba(0,0,0,0.45)', margin: '-8px 0 16px' }}>
                {intl
                  .get('sagm.common.view.message.executedRule')
                  .d('已执行的策略不支持修改执行规则')}
              </div>
            )}
            <Form
              dataSet={this.formDs}
              labelLayout={readOnly ? 'vertical' : 'float'}
              columns={3}
              useWidthPercent
              className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
            >
              {readOnly ? (
                <Output
                  name="adjustDirection"
                  renderer={({ value }) => {
                    return value === 'UPWARD'
                      ? intl.get('sagm.common.model.upward').d('上调')
                      : intl.get('sagm.common.model.down').d('下调');
                  }}
                />
              ) : (
                <Select
                  name="adjustDirection"
                  disabled={changeUuid}
                  onChange={this.changeAdjustDirection}
                />
              )}
              {readOnly ? (
                <Output
                  name="priceMethod"
                  renderer={({ value }) => {
                    return value === 1
                      ? intl.get('sagm.common.model.percent').d('按百分比')
                      : intl.get('sagm.common.model.fixMoney').d('按固定值');
                  }}
                />
              ) : (
                <Select name="priceMethod" disabled={changeUuid} onChange={this.changeAdjustWay} />
              )}
              {priceDirection === 1 &&
                this.getFormField([
                  {
                    readOnly,
                    name: 'isLadderPrice',
                    FormField: Select,
                    clearButton: false,
                    disabled: changeUuid,
                    onChange: (val) => this.setState({ isLadderPrice: Number(val) }),
                  },
                ])}
              {(!isLadderPrice || priceDirection === 2) &&
                this.getFormField([
                  {
                    readOnly,
                    precision: 10,
                    required: true,
                    disabled: changeUuid,
                    name: 'markupPercentage',
                    filter: priceMethod === 1,
                    FormField: PrecisionField,
                    record: this.formDs.current,
                  },
                  {
                    readOnly,
                    precision: 10,
                    required: true,
                    disabled: changeUuid,
                    name: 'upperPrice',
                    filter: priceDirection === 1 && priceMethod === 2,
                    FormField: PrecisionField,
                    record: this.formDs.current,
                  },
                  {
                    readOnly,
                    precision: 10,
                    required: true,
                    disabled: changeUuid,
                    name: 'upperLimitPercentage',
                    filter: priceMethod === 2,
                    FormField: PrecisionField,
                    record: this.formDs.current,
                  },
                  readOnly
                    ? {
                        name: 'overlinePriceEnableMeaning',
                        dataSet: this.formDs,
                        FormField: OverlinePriceRenderer,
                      }
                    : {
                        readOnly,
                        disabled: changeUuid,
                        name: 'overlinePriceEnable',
                        FormField: CheckBox,
                        filter: priceDirection === 1,
                        showHelp: 'tooltip',
                        help: intl
                          .get('sagm.common.view.message.overlinePriceEnable')
                          .d(
                            '配置为否时，加价后的价格高于市场价时取市场价作为销售价，若此时市场价低于采购价，则取采购价作为销售价'
                          ),
                      },
                ])}
            </Form>
            {!!isLadderPrice && priceDirection === 1 && this.getLadderPrice()}
          </Card>
        </Spin>
      </Fragment>
    );
  }
}
