import React, { useMemo } from 'react';
import withProps from 'utils/withProps';
import { DataSet, Button, Tabs, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { flowRight } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import ImportButton from 'components/Import';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { useSingleTabs } from '@/hooks/useTabs';
import c7nModal from '@/utils/c7nModal';
// import { getC7NQueryParams } from '@/utils/utils';
import { DropdownMenuBtns, ObserverBtn } from '@/components/CommonButtons';
import getTabs from './tab';
import EditForm from './EditForm';
import HotWorSet from './HotWorSet';
import StepNew from './StepNew';
import { hotWordSetDS } from './StepNew/ds';
import { saveHotMapping } from './api';
import { fieldMap } from './ds';

import styles from './index.less';

const { TabPane } = Tabs;

const getWithProps = withProps(
  () => {
    return {
      tabList: getTabs(),
    };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);
let defaultTabKey = 'CATEGORY';
function StockReportWorkbench(props) {
  const { tabList = [] } = props;
  const [activeKey, onTabChange] = useSingleTabs(defaultTabKey, { tabList }, (key) => {
    defaultTabKey = key;
  });
  const getCurrentDataset = () => (tabList.find((f) => f.key === activeKey) || {}).dataSet;
  // const getCurrentTab = () => tabList.find((f) => f.key === activeKey) || {};

  const query = () => {
    const ds = getCurrentDataset();
    ds.query(ds.currentPage);
  };

  const handleCreate = (record) => {
    const title = record
      ? intl.get('smpc.hotWordMapping.view.editHotWord').d('编辑搜索热词')
      : intl.get('smpc.hotWordMapping.view.newHotWord').d('新建搜索热词');
    c7nModal({
      style: { width: 380 },
      key: Modal.key(),
      drawer: true,
      okText: record
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.ok').d('确定'),
      title,
      children: <EditForm tabKey={activeKey} record={record} query={query} />,
    });
  };

  const hotWordNew = () => {
    c7nModal({
      style: { width: 742 },
      key: Modal.key(),
      drawer: true,
      title: intl.get('smpc.hotWordMapping.view.hotWordNew').d('引用用户搜索热词新建'),
      children: <StepNew tabKey={activeKey} query={query} />,
    });
  };

  function handleBatchManage() {
    const ds = new DataSet(hotWordSetDS(activeKey));
    const field = fieldMap[activeKey];
    const data = getCurrentDataset().selected.map((r) => ({
      ...r.toData(),
      hotWord: r.get('hotWord'),
      [field.LovName]: {
        [field.textField]: r.get(field.textField),
        [field.valueField]: r.get('dataId'),
      },
    }));
    ds.loadData(data);
    c7nModal({
      style: { width: 742 },
      key: Modal.key(),
      drawer: true,
      okText: intl.get('hzero.common.button.save').d('保存'),
      title: intl.get('smpc.hotWordMapping.view.batchManageHotWord').d('批量编辑搜索热词'),
      children: <HotWorSet tabKey={activeKey} dataSet={ds} type="normal" />,
      onOk: async () => {
        if (!ds.dirty) return true;
        const flag = await ds.validate();
        if (!flag) return false;
        const params = (ds.toJSONData() || []).map((m) => ({
          ...m,
          tenantId: getCurrentOrganizationId(),
          mappingType: activeKey,
          creationType: m.creationType || 'manual',
          dataId: activeKey === 'CATEGORY' ? m?.categoryId : m?.catalogId,
        }));
        const res = getResponse(await saveHotMapping(params, 'PUT'));
        if (res) {
          notification.success();
          query();
          return true;
        }
        return false;
      },
    });
  }

  function handleDelete(record) {
    const selectData = getCurrentDataset().selected;
    getCurrentDataset().delete(record ? [record] : selectData, {
      title: <span>{intl.get('hzero.common.message.confirm.title').d('提示')}</span>,
      children: (
        <span>{intl.get('smpc.hotWordMapping.view.confirm.content').d('是否确定删除?')}</span>
      ),
    });
  }

  const getColumns = useMemo(
    () =>
      [
        {
          name: 'hotWord',
          width: 240,
          renderer: ({ record, text }) => <a onClick={() => handleCreate(record)}>{text}</a>,
        },
        {
          name: 'categoryCode',
          minWidth: 200,
          show: activeKey === 'CATEGORY',
        },
        {
          name: 'categoryName',
          minWidth: 240,
          show: activeKey === 'CATEGORY',
        },
        {
          name: 'catalogCode',
          minWidth: 200,
          show: activeKey === 'CATALOG',
        },
        {
          name: 'catalogName',
          minWidth: 240,
          show: activeKey === 'CATALOG',
        },
        {
          name: 'creationTypeMeaningField',
          width: 140,
        },
        {
          name: 'realName',
          width: 120,
        },
        {
          name: 'option',
          width: 100,
          title: intl.get('hzero.common.action').d('操作'),
          renderer: ({ record }) => (
            <>
              <Button funcType="link" onClick={() => handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </>
          ),
        },
      ].filter((c) => c.show !== false),
    [activeKey]
  );

  const buttons = useMemo(() => {
    return [
      {
        name: 'create',
        comp: DropdownMenuBtns,
        btnProps: {
          width: 100,
          menus: [
            {
              text: intl.get('smpc.hotWordMapping.view.btn.manualNew').d('手动新建'),
              event: () => handleCreate(null),
            },
            {
              text: intl.get('smpc.hotWordMapping.view.btn.hotWordNew').d('引用用户搜索热词新建'),
              event: () => hotWordNew(),
            },
            {
              childRef: (
                <div className={styles['menu-item-wrapper']}>
                  <ImportButton
                    businessObjectTemplateCode={
                      activeKey === 'CATEGORY'
                        ? 'SMPC.HOT_WORD_MAPPING_TEMPLATE'
                        : 'SMPC.HOT_WORD_MAPPING_CATALOG_TEMPLATE'
                    }
                    refreshButton
                    buttonText={intl.get('smpc.product.button.batchImportNew').d('(新)批量导入')}
                    prefixPatch="/smpc"
                    successCallBack={query}
                    buttonProps={{
                      type: 'c7n-pro',
                      funcType: 'flat',
                      icon: '',
                      style: { textAlign: 'left', height: 40, marginLeft: 0, paddingLeft: 20 },
                      permissionList: [
                        {
                          code: `srm.small.tenant.product.hot-wrod-mapping.button.export-new`,
                          type: 'button',
                          meaning: '列表-(新)导入',
                        },
                      ],
                    }}
                  />
                </div>
              ),
            },
          ],
        },
        getCompChild: () => (
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
      },
      {
        name: 'batchEdit',
        comp: ObserverBtn,
        btnProps: {
          text: intl.get('smpc.hotWordMapping.view.batchEdit').d('批量编辑'),
          icon: 'mode_edit',
          onClick: handleBatchManage,
          isHeadButton: false,
          dataSet: getCurrentDataset(),
          getDisable: (data) => data.length === 0,
        },
      },
      {
        name: 'batchDelete',
        comp: ObserverBtn,
        btnProps: {
          text: intl.get('smpc.product.button.batchDelete').d('批量删除'),
          icon: 'delete_sweep',
          onClick: () => handleDelete(null),
          isHeadButton: false,
          dataSet: getCurrentDataset(),
          getDisable: (data) => data.length === 0,
        },
      },
    ];
  }, [activeKey]);

  return (
    <>
      <Header title={intl.get('smpc.hotWordMapping.view.title').d('搜索热词类目推荐')}>
        {buttons.map((b) => {
          const { name, comp: Comp, getCompChild, btnProps = {} } = b;
          return (
            <Comp key={name} {...btnProps}>
              {getCompChild && getCompChild()}
            </Comp>
          );
        })}
        {/* <button onClick={() => console.log(getC7NQueryParams(getCurrentDataset(), { mappingType: activeKey.toLocaleLowerCase() }))}>hhh</button> */}
      </Header>
      <Content>
        <Tabs
          defaultActiveKey={defaultTabKey}
          activeKey={activeKey}
          onChange={onTabChange}
          customizable
          customizedCode="SMPC.HOT_WORD_MAPPING.tabs"
        >
          {tabList.map((m) => {
            const { tab, key, dataSet } = m;
            return (
              <TabPane tab={tab} key={key} count={() => dataSet.totalCount}>
                <div style={{ height: 'calc(100vh - 245px)' }}>
                  {/* {
                      customizeTable({
                        code: activeKey === 'STOCK' ? 'SSTK.STOCK_REPORT_WORKBENCH.STOCK.LIST' : 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.LIST',
                      }, ( */}
                  <SearchBarTable
                    style={{ maxHeight: 'calc(100% - 22px)' }}
                    dataSet={dataSet}
                    columns={getColumns}
                    searchCode={m.searchBarCode}
                    customizedCode={m.tableCode}
                    cacheState
                  />
                  {/* )) */}
                  {/* } */}
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </Content>
    </>
  );
}

export default flowRight(
  // withCustomize({ unitCode: ['SSTK.STOCK_REPORT_WORKBENCH.STOCK.LIST', 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.LIST'] }),
  formatterCollections({
    code: ['hzero.common', 'smpc.hotWordMapping', 'smpc.product'],
  }),
  getWithProps
)(StockReportWorkbench);
