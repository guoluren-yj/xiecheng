import React, { Fragment } from 'react';

import { compose } from 'lodash';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { observer } from 'mobx-react';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import { SRM_MDM } from '_utils/config';

import { formDs, listDs } from './store.js';
import BaseInfo from './BaseInfo.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { updateFixedAssets } from '@/services/definitionFixedAssetsService.js';

const BudgetCheckTable = ({ wholeDs, customizeTable, customizeForm, customizeBtnGroup }) => {
  const columns = [
    { name: 'fixedAssetCode' },
    { name: 'fixedAssetName' },
    { name: 'assetCode' },
    { name: 'assetDescription' },
    { name: 'assetDate' },
    { name: 'companyNum' },
    { name: 'companyName', width: 160 },
    { name: 'ouName', width: 160 },
    {
      name: 'enabledFlag',
      // renderer: ({ text }) => enableRender(+text),
      renderer: ({ value }) => (
        <Tag color={[1, '1'].includes(value) ? 'green' : 'red'} style={{ border: 'none' }}>
          {[1, '1'].includes(value)
            ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
            : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
        </Tag>
      ),
    },
    { name: 'sourceCode' },
    {
      name: 'actions',
      renderer: ({ record }) => {
        return (
          <>
            <Button
              funcType="link"
              style={{ marginRight: '16px' }}
              onClick={() => {
                handleEdit({ fixedAssetId: record?.get('fixedAssetId') });
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              funcType="link"
              style={{ marginLeft: 0 }}
              onClick={() => {
                handleEnabledFlag(record);
              }}
            >
              {[1, '1'].includes(record?.get('enabledFlag'))
                ? intl.get('hzero.common.button.disable').d('禁用')
                : intl.get('hzero.common.button.enabled').d('启用')}
            </Button>
          </>
        );
      },
    },
  ];

  const handleEdit = (initData) => {
    const fixedAssetId = initData?.fixedAssetId;
    const formCurDs = new DataSet(formDs({ fixedAssetId }));
    if (!fixedAssetId) {
      formCurDs.create();
    }
    Modal.open({
      key: Modal.key(),
      title: fixedAssetId
        ? intl.get(`smdm.fixedAsset.model.common.editTitle`).d('编辑固定资产')
        : intl.get(`smdm.fixedAsset.model.common.createTitle`).d('新建固定资产'),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      children: <BaseInfo headerDs={formCurDs} customizeForm={customizeForm} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        const flag = await formCurDs.validate();
        if (flag) {
          const [data] = formCurDs?.toJSONData();
          const res = getResponse(
            await updateFixedAssets({
              ...data,
              customizeUnitCode: 'SMDM.FIXED.ASSETS_DEFINITION.FORM',
            })
          );
          if (res) {
            wholeDs.query();
          }
        } else {
          return false;
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
    });
  };

  const handleEnabledFlag = async (record) => {
    if (record) {
      const data = record?.toData();
      const res = getResponse(
        await updateFixedAssets({
          ...data,
          enabledFlag: [1, '1'].includes(data?.enabledFlag) ? 0 : 1,
          customizeUnitCode: 'SMDM.FIXED.ASSETS_DEFINITION.FORM',
        })
      );
      if (res) {
        wholeDs.query();
      }
    }
  };

  const getQueryFrom = () => {
    const { selected = [] } = wholeDs || {};
    // const selectedDate = exportDs.selected ? exportDs.selected.map(ele => ele.toJSONData()) : [];
    if (selected?.length > 0) {
      const fixedAssetIds = selected?.map((ele) => ele.get('fixedAssetId'));
      return { fixedAssetIds };
    } else {
      const queryData = wholeDs.queryDataSet.current.toJSONData();
      const { __dirty, __id, _status, ...others } = queryData;
      return {
        ...(others || {}),
        customizeUnitCode: 'SMDM.FIXED.ASSETS_DEFINITION.LIST,SMDM.FIXED.ASSETS_DEFINITION.FILTER',
        exportSearchbarUnitCode:
          'SMDM.FIXED.ASSETS_DEFINITION.LIST,SMDM.FIXED.ASSETS_DEFINITION.FILTER',
      };
    }
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = wholeDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['fixedAssetCodeAndName'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    wholeDs.queryDataSet.current
      ? wholeDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : wholeDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    wholeDs.query();
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    wholeDs.queryDataSet?.current.reset();
  };

  const HeaderBtn = observer(() => {
    const { selected = [] } = wholeDs;
    const headerList = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.creat').d('新建'),
        btnProps: {
          onClick: () => handleEdit(),
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'add',
          color: 'primary',
        },
      },
      {
        name: 'exportNew',
        noNest: true,
        child: (text) => (
          <ExcelExportPro
            data-name="exportNew"
            {...{
              templateCode: 'SRM_C_SMDM_FIXED_ASSET_EXPORT',
              wait: 300,
              buttonText:
                text ||
                (selected?.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出')
                  : intl.get('hzero.common.export.new').d('导出')),
              requestUrl: `${SRM_MDM}/v1/${getCurrentOrganizationId()}/fixed-assets/export`,
              method: 'POST',
              allBody: true,
              queryParams: () => getQueryFrom(true),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
              },
            }}
          />
        ),
      },
      {
        name: 'import',
        btnComp: CommonImport,
        btnProps: {
          prefixPatch: `${SRM_MDM}`,
          businessObjectTemplateCode: 'SMDM_FIXED_ASSET_IMPORT',
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
          buttonText: intl.get(`hzero.common.button.Import`).d('导入'),
        },
        child: intl.get(`hzero.common.button.Import`).d('导入'),
      },
    ];
    return customizeBtnGroup(
      {
        code: 'SMDM.FIXED.ASSETS_DEFINITION.BTNS',
        pro: true,
      },
      <DynamicButtons
        buttons={headerList}
        defaultBtnType="c7n-pro"
        maxNum={5}
        permissions={[
          {
            name: 'create',
            code: 'srm.mdm.fixed-assets-definition.button.create',
          },
          {
            name: 'exportNew',
            code: 'srm.mdm.fixed-assets-definition.button.export',
          },
          {
            name: 'import',
            code: 'srm.mdm.fixed-assets-definition.button.import',
          },
        ]}
      />
    );
  });

  return (
    <Fragment>
      <Header
        title={intl.get('smdm.fixedAsset.model.common.definitionFixedAssets').d('固定资产编码')}
      >
        <HeaderBtn />
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SMDM.FIXED.ASSETS_DEFINITION.LIST',
            dataSet: wholeDs,
          },
          <SearchBarTable
            cacheState
            style={{ maxHeight: `calc(100vh - 200px)` }}
            searchCode="SMDM.FIXED.ASSETS_DEFINITION.FILTER"
            dataSet={wholeDs}
            columns={columns}
            searchBarConfig={{
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="fixedAssetCodeAndName"
                    dataSet={wholeDs}
                    placeholder={intl
                      .get('smdm.fixedAsset.model.common.fixedAssetCodeAndName')
                      .d('请输入固定资产编码、名称查询')}
                  />
                ),
              },
              onClear: resetQueryDs,
              onReset: resetQueryDs,
              onQuery: handleQuery,
            }}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['smdm.fixedAsset', 'hzero.common', 'smdm.common'],
  }),
  withCustomize({
    unitCode: [
      'SMDM.FIXED.ASSETS_DEFINITION.FORM',
      'SMDM.FIXED.ASSETS_DEFINITION.FILTER',
      'SMDM.FIXED.ASSETS_DEFINITION.LIST',
      'SMDM.FIXED.ASSETS_DEFINITION.BTNS',
    ],
  }),
  withProps(
    () => {
      const wholeDs = new DataSet(listDs());
      return {
        wholeDs,
      };
    },
    { cacheState: true }
  )
)(BudgetCheckTable);
