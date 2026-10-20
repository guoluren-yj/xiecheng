/* eslint-disable react/jsx-indent */
/* eslint-disable import/named */
import React, { useMemo, useEffect, useState, useRef } from 'react';
// import { Tabs, Icon } from 'choerodon-ui';
import { compose } from 'lodash';
import { DataSet, Button, CheckBox, Modal, Form, TextField, Tabs, Icon } from 'choerodon-ui/pro';
import { useObserver } from 'mobx-react';
import queryString from 'querystring';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
// import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import Import from 'components/Import';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import {
  initDirectCommoditys,
  saveDirectCommoditys,
  getNumber,
  createDirectCommoditys,
  updateMapDirectCommoditys,
  enableDirectCommoditys,
} from '@/services/taxServices';
import DirectRecord from '@/routes/Components/InvoiceRecord/DirectRecord';
import { btnsFormat } from '@/utils/utils';

import { mainTableDs, recordDs, searchDs, mapTableDs, recordMapDs } from './mainDs';
import { FormItem } from '@/routes/Components';
import Styles from '@/routes/common.less';

const { TabPane } = Tabs;

const DirectCommodity = (props) => {
  const {
    customizeTabPane,
    custConfig,
    location: { search },
  } = props;
  const tableDs = useMemo(() => new DataSet(mainTableDs()), []);
  const operationDs = useMemo(() => new DataSet(recordDs()), []);
  const searchTableDs = useMemo(() => new DataSet(searchDs()), []);
  const mapDs = useMemo(() => new DataSet(mapTableDs()), []);
  const operationMapDs = useMemo(() => new DataSet(recordMapDs()), []);

  const { type: propsType } = queryString.parse(search.substring(1));
  const { fields = [] } = custConfig?.['SSTA.DIRECT_COMMODITY.TABS'] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const [activeKey, setActiveKey] = useState(propsType || fieldCode || 'info');
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState({});
  const tenantId = getCurrentOrganizationId();

  const SearchComponent = useRef();

  const dsObj = {
    info: tableDs,
    map: mapDs,
  };

  const recordDsObj = {
    info: operationDs,
    map: operationMapDs,
  };

  const codeObj = {
    info: 'SSTA.DIRECT_COMMODITY.COMMODITY_GRID',
    map: 'SSTA.DIRECT_COMMODITY.COMMODITY_MAP_GRID',
  };

  const searchCodeObj = {
    info: 'SSTA.DIRECT_COMMODITY.COMMODITY_SEARCH',
    map: 'SSTA.DIRECT_COMMODITY.COMMODITY_MAP_SEARCH',
  };
  // 导入编码
  const importCode = {
    info: 'SDIM_COMMODITY_SUP_IMPORT',
    map: 'SDIM_COMMODITY_MAPPING_SUP_IMPORT',
  };

  useEffect(() => {
    getTabNumber();
  }, []);

  const getTabNumber = () => {
    Promise.all([getNumber({ type: 'info' }), getNumber({ type: 'map' })]).then((res) => {
      const count = {
        info: res[0] ? res[0].totalElements : 0,
        map: res[1] ? res[1].totalElements : 0,
      };
      setItemCount(count);
    });
  };

  const columns = useMemo(() => {
    if (activeKey === 'info') {
      return [
        {
          name: 'commodityCode',
          width: 180,
        },
        {
          name: 'commodityName',
          width: 300,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'commodityServiceCateCode',
          width: 160,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'taxNumber',
          width: 150,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'taxRate',
          width: 90,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'freeTaxMarkMeaning',
          width: 120,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'preferentialPolicyFlagMeaning',
          width: 120,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'specialManagementVat',
          width: 150,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'percent',
          width: 150,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'keyWord',
          width: 100,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'remark',
          width: 140,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'summaryFlagMeaning',
          width: 120,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'sourceCodeMeaning',
          width: 120,
          editor: (record) => record.getState('editing') && !record.get('commodityCode'),
        },
        {
          name: 'enabledFlag',
          width: 100,
          align: 'left',
          renderer: ({ record }) => {
            const enabledFlag = record.get('enabledFlag') === 1;
            return (
              <div>
                <CheckBox
                  checked={enabledFlag}
                  // disabled={!record.getState('editing')}
                  onChange={(value) => {
                    dsObj[activeKey].current.set('enabledFlag', value ? 1 : 0);
                    commodityInfoAbleChange(record);
                  }}
                />
                <span style={{ paddingLeft: '8px' }}>
                  {enabledFlag
                    ? intl.get('hzero.common.status.enable').d('启用')
                    : intl.get('hzero.common.status.disabled').d('禁用')}
                </span>
              </div>
            );
          },
        },
        {
          name: 'operation',
          width: 140,
          renderer: ({ record }) => {
            const btns = [];
            if (record.getState('editing')) {
              btns.push(
                <a onClick={() => handleSubmit(record)}>
                  {intl.get('hzero.common.btn.save').d('保存')}
                </a>,
                <a onClick={() => handleCancel(record)}>
                  {intl.get('hzero.common.btn.cancel').d('取消')}
                </a>
              );
            } else {
              btns.push(
                <a onClick={() => handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>,
                <a onClick={() => handleRecord(record, true)}>
                  {intl.get('hzero.common.button.operation').d('操作记录')}
                </a>
              );
            }
            return [<span className="action-link">{btns}</span>];
          },
        },
      ];
    } else {
      return [
        {
          name: 'itemCodeLov',
          width: 120,
          editor: (record) => record.getState('editing'),
        },
        {
          name: 'itemName',
          width: 120,
        },
        {
          name: 'uom',
          width: 120,
          editor: (record) => record.getState('editing'),
        },
        {
          name: 'model',
          width: 120,
          editor: (record) => record.getState('editing'),
        },
        {
          name: 'partnerItemCode',
          width: 140,
        },
        {
          name: 'partnerItemName',
          width: 160,
        },
        {
          name: 'taxRate',
          width: 120,
          align: 'left',
          editor: (record) => record.getState('editing'),
          renderer: ({ value }) => {
            return value ? (value * 100).toFixed(2) : value;
          },
        },
        {
          name: 'commodityNumberLov',
          width: 180,
          editor: (record) => record.getState('editing'),
        },
        {
          name: 'commodityName',
          width: 160,
        },
        {
          name: 'commodityServiceCateCode',
          width: 160,
        },
        {
          name: 'enabledFlag',
          width: 120,
          align: 'left',
          renderer: ({ record }) => {
            const enabledFlag = record.get('enabledFlag') === 1;
            return (
              <div>
                <CheckBox
                  checked={enabledFlag}
                  disabled={!record.getState('editing')}
                  onChange={(value) => {
                    record.set('enabledFlag', value ? 1 : 0);
                  }}
                />
                <span style={{ paddingLeft: '8px' }}>
                  {enabledFlag
                    ? intl.get('hzero.common.status.enable').d('启用')
                    : intl.get('hzero.common.status.disabled').d('禁用')}
                </span>
              </div>
            );
          },
        },
        {
          name: 'operation',
          width: 140,
          renderer: ({ record }) => {
            const btns = [];
            if (record.getState('editing')) {
              btns.push(
                <a onClick={() => handleSubmitMap(record)}>
                  {intl.get('hzero.common.btn.save').d('保存')}
                </a>,
                <a onClick={() => handleCancel(record)}>
                  {intl.get('hzero.common.btn.cancel').d('取消')}
                </a>
              );
            } else {
              btns.push(
                <a onClick={() => handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>,
                <a onClick={() => handleRecord(record)}>
                  {intl.get('hzero.common.button.operation').d('操作记录')}
                </a>
              );
            }
            return [<span className="action-link">{btns}</span>];
          },
        },
      ];
    }
  }, [activeKey]);

  // 点击了提交
  const handleSubmitMap = async (record) => {
    let res;
    const faRes = await record.validate();
    if (!faRes) {
      return;
    }
    const data = record.toData();
    delete data.commodityNumberLov;
    delete data.itemCodeLov;
    if (data.mappingId) {
      res = await updateMapDirectCommoditys(data);
    } else {
      res = await createDirectCommoditys(data);
    }
    if (res) {
      if (res.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        getTabNumber();
        dsObj[activeKey].query();
        notification.success();
      }
    }
  };

  // 点击了操作记录
  const handleRecord = (record, flag) => {
    const commodityId = record.get('commodityId');
    const mappingId = record.get('mappingId');
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: (
        <DirectRecord
          commodityId={commodityId}
          mappingId={mappingId}
          recordFlag={flag}
          operationDs={recordDsObj[activeKey]}
        />
      ),
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  const initCommodityInfoLov = async () => {
    const data = searchTableDs.current?.toData() || {};
    const { model, projectName, supplierCompanyLov, unit } = data;
    const value = supplierCompanyLov;
    setLoading(true);
    const selectData = { ...value, model, projectName, unit };
    const current = SearchComponent?.current;
    const res = getResponse(await initDirectCommoditys(selectData));
    if (res) {
      getTabNumber();
      current.setFields({ supplierCompanyId: value });
      const { customizeDs } = current;
      if (!customizeDs.current) customizeDs.create({});
      customizeDs.current.init({
        // supplierCompanyId为undefined时会导致值覆盖不生效，可以用null或者空字符串来覆盖掉值
        supplierCompanyId: value?.companyId || null,
        supplierId: value?.supplierId,
      });
      dsObj[activeKey].query();
      notification.success();
    }
    setLoading(false);
  };

  const handleSubmit = async (record) => {
    const res = getResponse(await saveDirectCommoditys(record.toData()));
    if (res) notification.success();
    dsObj[activeKey].query();
  };

  // 点击启用/不启用
  const commodityInfoAbleChange = async (record) => {
    const res = getResponse(await enableDirectCommoditys(record.toData()));
    if (res) notification.success();
    dsObj[activeKey].query();
  };

  const handleCancel = (record) => {
    if (record.status === 'add') {
      dsObj[activeKey].remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  const handleEdit = (record) => {
    record.setState('editing', true);
  };

  const handleQuery = ({ params }) => {
    const ds = dsObj[activeKey];
    ds.queryDataSet.loadData([params]);
    ds.query();
  };

  const handelFieldChange = (params) => {
    const value = params.value || {};
    if (params.name === 'supplierCompanyId') {
      const { customizeDs } = SearchComponent.current;
      if (!customizeDs.current) customizeDs.create({});
      customizeDs.current.init({
        // supplierCompanyId为undefined时会导致值覆盖不生效，可以用null或者空字符串来覆盖掉值
        supplierCompanyId: value?.companyId || null,
        supplierId: value?.supplierId,
      });
    }
  };

  const onRef = (ref) => {
    SearchComponent.current = ref;
  };

  const tableRender = () => {
    const { customizeTable } = props;
    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: codeObj[activeKey],
          },
          <SearchBarTable
            cacheState
            searchCode={searchCodeObj[activeKey]}
            columns={columns}
            dataSet={dsObj[activeKey]}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarRef={(ref) => {
              onRef(ref);
            }}
            searchBarConfig={{
              onQuery: handleQuery,
              onFieldChange: handelFieldChange,
              fieldProps: {
                supplierCompanyId: {
                  lovPara: { tenantId },
                },
              },
              left: activeKey === 'map' && {
                render: () => {
                  return (
                    <TextField
                      clearButton
                      prefix={<Icon type="search" />}
                      placeholder={intl
                        .get('ssta.commodity.model.commodity.search')
                        .d('请输入物料编码、物料名称查询')}
                      onChange={(val) => {
                        dsObj[activeKey].queryDataSet.current.set({ param: val });
                        dsObj[activeKey].query();
                      }}
                    />
                  );
                },
              },
            }}
          />
        )}
      </div>
    );
  };

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const getExportParams = () => {
    const ds = dsObj[activeKey];
    const queryData = ds.queryDataSet.current?.toData() || {};
    const codes = codeObj[activeKey];
    const unSelect = ds.selected.length === 0;
    const filterCodes = searchCodeObj[activeKey];
    const customizeUnitCode = [codes, filterCodes].filter((item) => item).join();
    const commodityIdList =
      activeKey === 'info' ? ds.selected.map((item) => item.toData().commodityId).join(',') : [];
    const mappingIdList =
      activeKey === 'info' ? ds.selected.map((item) => item.toData().mappingId).join(',') : [];
    if (unSelect) {
      return {
        ...queryData,
        customizeUnitCode,
      };
    } else {
      return filterNullValueObject({
        commodityIdList,
        mappingIdList,
        customizeUnitCode,
      });
    }
  };

  // 点击了初始化商品信息
  const handleInitCommodity = () => {
    Modal.open({
      title: intl.get('ssta.commodity.model.button.initCommodity').d('初始化商品信息'),
      drawer: true,
      destroyOnClose: true,
      style: {
        width: '500px',
      },
      children: (
        <Form dataSet={searchTableDs} labelLayout="float">
          <FormItem name="supplierCompanyLov" editable editor="lov" />
          <FormItem editable name="projectName" />
          <FormItem editable name="unit" />
          <FormItem editable name="model" />
        </Form>
      ),
      okText: intl.get('ssta.commodity.model.button.initCommodity').d('初始化商品信息'),
      onOk: async () => {
        const validateFlag = await searchTableDs.current?.validate(true);
        if (validateFlag) {
          initCommodityInfoLov();
        } else {
          notification.error({
            message: intl.get(`ssta.invoiceSheet.view.button.noAddMsg`).d('未维护必输字段'),
          });
          return false;
        }
      },
      onClose: () => {
        searchTableDs.reset();
      },
    });
  };

  // 点击了新建
  const handleAdd = () => {
    const record = dsObj[activeKey].create({}, 0);
    record.setState('editing', true);
  };

  const btns = () => {
    return [
      activeKey === 'info' && (
        <Button icon="sync" onClick={() => handleInitCommodity()} color="primary" loading={loading}>
          {intl.get('ssta.commodity.model.button.initCommodity').d('初始化商品信息')}
        </Button>
      ),
      activeKey === 'map' && (
        <Button icon="add" color="primary" onClick={() => handleAdd()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      ),
      <Import
        buttonText={intl.get('hzero.common.button.import').d('导入')}
        icon="archive"
        businessObjectTemplateCode={importCode[activeKey]}
        funcType="flat"
        buttonProps={{ type: 'c7n-pro', funcType: 'flat' }}
        prefixPatch="/ssta"
        args={{
          tenantId,
          templateCode: importCode[activeKey],
        }}
        successCallBack={() => {
          dsObj[activeKey].query();
        }}
      />,
      useObserver(() => (
        <ExcelExportPro
          otherButtonProps={{ type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' }}
          requestUrl={
            activeKey === 'info'
              ? `/ssta/v1/${tenantId}/direct-commoditys/excel-export`
              : `/ssta/v1/${tenantId}/direct-commodity-mappings/excel-export`
          }
          queryParams={() => {
            getExportParams();
          }}
          templateCode={
            activeKey === 'info' ? 'SDIM_COMMODITY_SUP_EXPORT' : 'SDIM_COMMODITY_MAPPING_SUP_EXPORT'
          }
          buttonText={
            dsObj[activeKey].selected.length === 0
              ? intl.get('ssta.costSheet.button.export').d('导出')
              : intl.get('ssta.costSheet.button.tickExport').d('勾选导出')
          }
        />
      )),
    ];
  };

  return (
    <>
      <Header title={intl.get('ssta.commodity.view.title.taxCommodityInfo').d('税务商品信息')}>
        {btnsFormat(btns())}
      </Header>
      <Content className={Styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SSTA.DIRECT_COMMODITY.TABS',
          },
          <Tabs animated={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabPane
              key="info"
              tab={intl.get('ssta.commodity.model.commodity.info').d('基础税收商品信息')}
              count={itemCount?.info}
            >
              {tableRender()}
            </TabPane>
            <TabPane
              key="map"
              tab={intl.get('ssta.commodity.model.commodity.map').d('税收商品映射')}
              count={itemCount?.map}
            >
              {activeKey === 'map' && tableRender()}
            </TabPane>
          </Tabs>
        )}
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.common',
      'ssta.commodity',
      'ssta.prePayment',
      'ssta.taxControl',
      'ssta.costSheet',
      'ssta.invoiceSheet',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.DIRECT_COMMODITY.COMMODITY_GRID',
      'SSTA.DIRECT_COMMODITY.COMMODITY_SEARCH',
      'SSTA.DIRECT_COMMODITY.COMMODITY_MAP_GRID',
      'SSTA.DIRECT_COMMODITY.COMMODITY_MAP_SEARCH',
      'SSTA.DIRECT_COMMODITY.TABS',
    ],
  })
)(DirectCommodity);
