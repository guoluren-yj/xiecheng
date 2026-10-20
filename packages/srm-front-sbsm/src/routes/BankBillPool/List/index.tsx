import React, { Fragment, useContext, useMemo, useState, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Import from 'components/Import';
import { SRM_SBDM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import ListTable from './components/ListTable';
import commonStyles from '../../../common.less';
import StoreProvider, { Store } from './stores';
import DynamicBtn from '../../../components/DynamicBtn';
import { formatDynamicBtns } from '../../../utils/utils';
import { ActiveKey, ListBtnsCustCode, ListTabsCustCode } from '../utils/type';

const { TabPane } = Tabs;

const TemplateCodeMap = {
  [ActiveKey.All]: 'SBSM_BANK_PAPER_ALL_EXPORT',
  [ActiveKey.Usable]: 'SBSM_BANK_PAPER_USABLE_EXPORT',
  [ActiveKey.Occupy]: 'SBSM_BANK_PAPER_USED_EXPORT',
  [ActiveKey.Without]: 'SBSM_BANK_PAPER_NO_NEED_USE_EXPORT',
};

// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.All]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-all/export`,
  [ActiveKey.Usable]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-usable/export`,
  [ActiveKey.Occupy]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-used/export`,
  [ActiveKey.Without]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-abandon/export`,
};

const List = observer(() => {
  const {
    dsMap,
    history,
    cacheState,
    permissionMap,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  } = useContext(Store);

  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected, queryDataSet } = currentListDs;
  const loading = currentListDs.status !== 'ready';

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    const currentDs = dsMap[key];
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
    fetchTabKeysCount([key]);
  },
    [dsMap, cacheState, fetchTabKeysCount]
  );

  const getExportParams = useCallback(() => {
    const idList = selected.map((item) => item.key);
    const { primaryKey } = currentListDs.props;
    const queryData = queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ [`${primaryKey}s`]: idList });
    } else {
      return filterNullValueObject({
        ...queryData,
        customizeUnitCode: currentListDs.getQueryParameter('customizeUnitCode'),
      });
    }
  }, [selected, currentListDs, queryDataSet]);

  const handleCreate = useCallback(() => {
    history.push('/sbsm/bank-bill-pool/create');
  }, [history]);

  const buttons = useMemo(() => {
    return formatDynamicBtns([
      permissionMap.get('create') && {
        name: 'create',
        group: true,
        child: (...customChildArgs) => (
          <DynamicBtn
            icon="add"
            loading={loading}
            customChildArgs={customChildArgs}
            text={intl.get(`hzero.common.button.create`).d('新建')}
            extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
          />
        ),
        children: [
          {
            name: 'manualCreate',
            child: intl.get(`sbsm.common.view.button.manualCreate`).d('手工新建'),
            btnProps: {
              loading,
              icon: 'add',
              wait: 1000,
              onClick: handleCreate,
            },
          },
          {
            name: 'importCreate',
            btnComp: Import,
            btnProps: {
              buttonText: intl.get(`sbsm.common.view.button.importCreate`).d('导入新建'),
              prefixPatch: '/sbdm',
              businessObjectTemplateCode: 'SBSM.BANK_PAPER_IMPORT',
              args: { templateCode: 'SBSM.BANK_PAPER_IMPORT' },
              buttonProps: {
                type: 'c7n-pro',
                icon: '',
                funcType: 'link',
                loading,
                className: commonStyles['meun-item-btn'],
              },
              successCallBack: () => currentListDs.query(),
            },
          },
        ],
      },
      permissionMap.get('export') && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`sbsm.common.view.button.export`).d('导出')
          : intl.get(`sbsm.common.view.button.selectedExport`).d('勾选导出'),
        btnProps: {
          templateCode: TemplateCodeMap[activeKey],
          otherButtonProps: { funcType: 'flat' },
          method: 'POST',
          allBody: true,
          requestUrl: ListExportUrl[activeKey],
          queryParams: getExportParams,
        },
      },
    ]);
  }, [
    loading,
    selected,
    activeKey,
    handleCreate,
    currentListDs,
    permissionMap,
    getExportParams,
  ]);

  const TabColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.Usable,
        tab: intl.get(`sbsm.bankBillPool.view.title.usable`).d('可使用'),
      },
      {
        key: ActiveKey.Occupy,
        tab: intl.get(`sbsm.bankBillPool.view.title.used`).d('已使用'),
      },
      {
        key: ActiveKey.Without,
        tab: intl.get(`sbsm.bankBillPool.view.title.noNeedToUse`).d('无需使用'),
      },
      {
        key: ActiveKey.All,
        tab: intl.get(`sbsm.bankBillPool.view.title.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.bankBillPool.view.title.billPool').d('票据池')}>
        {customizeBtnGroup(
          { code: ListBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            {TabColumns.map(({ key, tab }) => (
              <TabPane
                tab={tab}
                key={key}
                count={dsMap[key].getState('totalCount')}
              >
                <ListTable activeKey={key} />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentPoolList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentPoolList;