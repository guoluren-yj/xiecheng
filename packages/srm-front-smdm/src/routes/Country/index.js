import { DataSet, Button as C7nBtn } from 'choerodon-ui/pro';
import React, { Fragment, useState, memo } from 'react';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import { Tag } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_MDM } from '_utils/config';
import { compose } from 'lodash';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { getSynsPlatform } from '@/services/countryService.js';
// import './index.less';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable/index.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { wholeDs } from './store.js';

const Index = ({ history, lineDs }) => {
  // const [init, setInit] = useState(false);
  const [loadings, setLoading] = useState(false);

  const lineColumns = [
    {
      name: 'mapperStatus',
      renderer: ({ record, value }) => (
        <Tag color={value === '1' ? 'green' : 'yellow'} style={{ border: 'none' }}>
          {record.get('mapperStatusMeaning')}
        </Tag>
      ),
    },
    {
      name: 'countryCode',
      renderer: ({ record, value }) => {
        return (
          <>
            <C7nBtn
              funcType="link"
              type="c7n-pro"
              onClick={() => {
                history.push(`/smdm/regional-mapping/detail-readOnly/${record.get('countryId')}`);
              }}
            >
              {value}
            </C7nBtn>
          </>
        );
      },
    },

    {
      name: 'countryName',
    },
    {
      name: 'countryMapperCode',
    },
    {
      name: 'countryMapperName',
    },
    {
      name: 'operation',
      renderer: ({ record }) => {
        return (
          <>
            <C7nBtn
              funcType="link"
              type="c7n-pro"
              onClick={() => {
                history.push(`/smdm/regional-mapping/detail-new/${record.get('countryId')}`);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </C7nBtn>
          </>
        );
      },
    },
  ];

  // const handleUpdateCountry = ({ record }) => {
  //   const data = record.toData();
  //   const dataSet = new DataSet(formDs());
  //   dataSet.loadData([data]);
  //   Modal.open({
  //     title: intl.get('smdm.country.model.common.countryMapper').d('区域映射'),
  //     width: 380,
  //     closable: true,
  //     drawer: true,
  //     children: (
  //       <div>
  //         <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
  //           <TextField name="countryCode" />
  //           <IntlField name="countryName" />
  //           <TextField name="countryMapperCode" />
  //           <IntlField name="countryMapperName" />
  //         </Form>
  //       </div>
  //     ),
  //     onOk: () => {
  //       return new Promise(async (resolve) => {
  //         const flag = await dataSet.validate();
  //         if (flag) {
  //           saveAttribute({
  //             ...dataSet.current?.toData(),
  //           })
  //             .then((res) => {
  //               if (getResponse(res)) {
  //                 notification.success();
  //                 lineDs.query();
  //               }
  //             })
  //             .finally(() => {
  //               resolve();
  //             });
  //         } else {
  //           resolve(false);
  //         }
  //       });
  //     },
  //     footer: (okBtn, cancelBtn) => (
  //       <div>
  //         {okBtn}
  //         {cancelBtn}
  //       </div>
  //     ),
  //   });
  // };

  const getQueryFrom = () => {
    const { selected = [] } = lineDs || {};
    if (selected.length > 0) {
      const countryIds = selected.map((ele) => ele.get('id'));
      return { idList: countryIds };
    } else {
      const queryData = lineDs.queryDataSet.current?.toJSONData();
      const { __dirty, __id, _status, ...others } = queryData || {};
      return {
        ...(others || {}),
      };
    }
  };

  const handleSyncPlatform = async () => {
    setLoading(true);
    const data = getResponse(await getSynsPlatform());
    if (data) {
      notification.success();
      lineDs.query();
    }
    setLoading(false);
  };

  const HeaderBtn = () => {
    const { selected } = lineDs;
    const headerButtons = [
      {
        name: 'syncPlatform',
        btnComp: Button,
        btnProps: {
          icon: 'filter_none',
          type: 'c7n-pro',
          color: 'primary',
          wait: 300,
          funcType: 'raised',
          loading: loadings,
          onClick: handleSyncPlatform,
        },
        child: intl.get(`hpfm.period.view.option.quote`).d('引用云级数据'),
      },
      {
        name: 'exportNew',
        noNest: true,
        child: (text) => (
          <ExcelExportPro
            data-name="exportNew"
            {...{
              templateCode: 'SRM_C_SMDM_COUNTRY_EXPORT',
              wait: 300,
              requestUrl: `${SRM_MDM}/v1/${getCurrentOrganizationId()}/countrys/export`,
              buttonText:
                text ||
                (selected.length > 0
                  ? intl.get('hzero.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新')),
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
        name: 'exportNew',
        noNest: true,
        child: (text) => (
          <CommonImport
            prefixPatch={`${SRM_MDM}`}
            name="importNew"
            buttonProps={{
              funcType: 'flat',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `srm.mdm.region.ps.new.region.import`,
                  type: 'button',
                  meaning: '批量导入-新',
                },
              ],
            }}
            args={{ templateCode: 'SRM_C_SMDM_COUNTRY_IMPORT' }}
            businessObjectTemplateCode="SRM_C_SMDM_COUNTRY_IMPORT"
            buttonText={text || intl.get('hzero.common.title.batchImport').d('批量导入')}
            successCallBack={() => {
              notification.success();
              lineDs.query();
            }}
          />
        ),
      },
    ];

    return (
      <>
        <DynamicButtons buttons={headerButtons} />
      </>
    );
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    // const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['countryOrMapperName'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : lineDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    lineDs.query(lineDs.currentPage);
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <Fragment>
      <Header title={intl.get('smdm.country.model.common.countryMapper').d('区域映射')}>
        <HeaderBtn />
      </Header>
      <Content>
        <SearchBarTable
          style={{ maxHeight: 'calc(100vh - 190px)' }}
          searchCode="SMDM_REGIONAL_MAP.FILTER"
          customizedCode="smdm_regional_map_list"
          dataSet={lineDs}
          columns={lineColumns}
          queryFieldsLimit={3}
          cacheState
          searchBarConfig={{
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="countryOrMapperName"
                  dataSet={lineDs}
                  placeholder={intl
                    .get('smdm.country.modal.enterSourceDocumentsNum')
                    .d('请输入国家/地区名称、映射国家地区名称查询')}
                />
              ),
            },
            onClear: resetQueryDs,
            onReset: resetQueryDs,
            onQuery: handleQuery,
          }}
        />
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['smdm.country', 'hpfm.country', 'hzero.common', 'hpfm.period'],
  }),
  withProps(
    () => {
      const lineDs = new DataSet(wholeDs());
      return {
        lineDs,
      };
    },
    { cacheState: true, keepOriginDataSet: true }
  )
)(memo(Index));
