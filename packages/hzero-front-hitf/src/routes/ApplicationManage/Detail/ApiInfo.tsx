import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { omit } from 'lodash';
import { DataSet, TextField, Button, Lov, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { ViewMode } from 'choerodon-ui/pro/lib/lov/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';

import tagRender from '@/utils/TagRender';
import { deleteApiLines, getEbApiTable } from '@/services/applicationManageService';

import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

interface ApiInfoProps {
  tableDs: DataSet,
  addApiDs: DataSet,
  selectList: any,
  appType: string,
  tenantId: string | number,
  dataSource: string,
  publishFlag: boolean,
  history: any,
  id: any,
}

const ApiInfo: React.FC<ApiInfoProps> = ({ tableDs, addApiDs, appType, tenantId, history, id }) => {
  const createFlag = window.location.href.includes('create-detail');
  const [deleteFlag, setDeleteFlag] = useState(false);

  useEffect(() => {
    // 监听ds selected  跨页cacheSelected
    // deleteflag memo ds.selected
    // 待修改
    tableDs.addEventListener('select', handleDsSelect);
    tableDs.addEventListener('unSelect', handleDsSelect);
    tableDs.addEventListener('batchSelect', handleDsSelect);
    tableDs.addEventListener('batchUnSelect', handleDsSelect);
    return () => {
      tableDs.removeEventListener('select', handleDsSelect);
      tableDs.removeEventListener('unSelect', handleDsSelect);
      tableDs.removeEventListener('batchSelect', handleDsSelect);
      tableDs.removeEventListener('batchUnSelect', handleDsSelect);
    };
  }, [tableDs]);

  // 已发布的应用，已保存的接口不可删除
  const handleLoad = ({ dataSet }) => {
    dataSet.forEach((record) => {
      const { applicationLineId, publishFlag } = record.get(['applicationLineId', 'publishFlag']);
      // 已发布应用下，已保存的接口不可勾选删除 || 开放平台下已保存接口不可勾选删除
      const selectFlag = publishFlag && applicationLineId;
      // eslint-disable-next-line no-param-reassign
      record.selectable = !selectFlag;
    });
    addApiDs.reset();
  };

  const handleAppType = () => {
    // 新建时应用类型改变，清空api信息中的表格数据和lov弹窗中选中的数据
    const selectedValue: { [x: string]: any } = addApiDs.toData()[0]; // ds.current--待修改
    if (!selectedValue || !selectedValue.addApi) {
      if (createFlag) {
        handleEbData();
      }
      return;
    }
    const addApiValue = selectedValue.addApi;
    tableDs.forEach(record => {
      // 删除新增但未保存的数据
      addApiValue.forEach((item, index) => {
        const interfaceFlag = item.interfaceId === record.get('interfaceId');
        if (interfaceFlag) {
          addApiValue.splice(index, 1);
        }
      });
      tableDs.remove(record, true);
    });
    if (createFlag) {
      // 新增时才存在修改应用类型的情况，此时需考虑勾选电商，设置默认值
      handleEbData();
    }
    const apiRecord: any = addApiDs.current;
    apiRecord.set('addApi', addApiValue);
  };

  const handleEbData = () => {
    tableDs.loadData([]);
    if (appType === 'EB_PUNCHOUT' || appType === 'EB_API') {
      // 选择电商租户
      getEbApiTable(appType, tenantId).then((res) => {
        const result = getResponse(res);
        if (result) {
          tableDs.loadData(result.content);
          // 设置初始值
          addApiDs.loadData([{ addApi: result.content }]);
        }
      });
    }
  };

  useEffect(() => {
    const field: any = addApiDs.getField('addApi');
    field.setLovPara('applicationType', appType);
    if(!isTenant) {
      field.setLovPara('tenantId', tenantId);
    }
    handleAppType();
    tableDs.addEventListener('load', handleLoad);
    return () => {
      tableDs.removeEventListener('load', handleLoad);
    };
  }, [addApiDs, appType, tenantId]);

  // 表格数据选中
  const handleDsSelect = ({ dataSet }) => {
    const selectedRows = dataSet.selected;
    setDeleteFlag(selectedRows && selectedRows.length > 0);
  };

  // 检索
  const handleSearch = (params) => {
    if (createFlag) {
      // 新建不进行查询
      return;
    }
    let filterValues: { interfaceCode?: string } = params;
    const { interfaceCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      interfaceName: interfaceCode,
    });
    tableDs.query();
  };

  // 接口详情
  const goDetail = useCallback(
    (serviceType, tenantInterfaceId) => {
      history.push({
        pathname: `/hitf${isTenant ? '/interface-configuration-workbench' : ''}/application-manage/api/${tenantInterfaceId}`,
        state: {
          serviceType,
        },
      });
    },
    [],
  );


  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'statusMeaning',
        width: 110,
        renderer: ({ record }) => {
          const status = record ? record.get('status') : '';
          return (
            <span>
              {tagRender(status, status === 1 ? intl.get('hzero.common.model.status.enable').d('启用') : intl.get('hzero.common.status.disabled').d('禁用'))}
            </span>
          );
        },
      },
      {
        name: 'operate',
        width: 80,
        header: intl.get('hzero.common.option').d('操作'),
        renderer: ({ record }) => {
          const { serviceType, tenantInterfaceId } = record?.get(['serviceType', 'tenantInterfaceId']);
          return !tenantInterfaceId ? null :
            (
              <span
                className={styles['api-link-span']}
                onClick={() => goDetail(serviceType, tenantInterfaceId)}
              >
                {intl.get('hzero.common.view.button.edit').d('编辑')}
              </span>
            );
        },
      },
      {
        name: 'interfaceCode',
      },
      { name: 'interfaceName' },
      {
        name: 'requestMethodMeaning',
        width: 100,
      },
      {
        name: 'publishTypeMeaning',
        width: 100,
      },
      {
        name: 'interfaceTypeMeaning',
        width: 100,
      },
      {
        name: 'interfaceCategoryMeaning',
        width: 120,
      },
      {
        name: 'interactiveMethodMeaning',
        width: 100,
      },
    ],
    []
  );

  // api弹窗更新
  const handleApiUpdate = () => {
    const addValue: { [x: string]: any } = addApiDs.toData()[0];// current-待修改
    tableDs.forEach(record => {
      if (!record.get('applicationHeaderId')) {
        tableDs.remove(record, true);
      }
    });
    if (addValue && addValue.addApi) {
      addValue.addApi.forEach(item => {
        const addItem = omit(item, ['objectVersionNumber']);
        const flag = tableDs.find(record => record.get('interfaceId') === item.interfaceId);
        if (!flag) {
          tableDs.appendData([addItem]);
        }
      });
    }
  };

  // 删除API
  const handleConfirm = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      maskClosable: true,
      destroyOnClose: true,
      children: <div>{intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗')}</div>,
      onOk: deleteApi,
    });
  };

  const deleteApi = () => {
    // props.match.params.id--待修改
    const headerId = window.location.href.split('application-manage/detail/')[1];
    setDeleteFlag(false);
    const params: Object[] = [];
    const selectedValue: { [x: string]: any } = addApiDs.toData()[0];
    const addApiValue = selectedValue ? selectedValue.addApi : [];

    tableDs.selected.forEach(record => {
      if (record.get('applicationHeaderId')) {
        params.push(record.toData());
      } else {
        // 删除新增但未保存的数据
        addApiValue.forEach((item, index) => {
          const flag = item.interfaceId === record.get('interfaceId');
          if (flag) {
            addApiValue.splice(index, 1);
          }
        });
      }
      tableDs.remove(record, true);
    });
    const apiRecord: any = addApiDs.current;
    if (addApiDs.current) {
      apiRecord.set('addApi', addApiValue);
    }
    if (params.length > 0) {
      // 编辑表单中删除已有api
      deleteApiLines(params, headerId).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({});
          // const flag = window.location.href.includes('create-detail');
          // if (flag) {
          //   return;
          // }
          // handleSearch();
        }
      });
    }
  };

  return (
    <>
      <SearchBarTable
        searchCode="HITF.APPLICATION_MANAGE.DETAIL.API.FILTER"
        columns={columns}
        dataSet={tableDs}
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name="interfaceCode"
                  placeholder={intl
                    .get('hitf.application.detail.filter.interface')
                    .d('请输入接口编码、名称查询')}
                  prefix={<Icon type="search" />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          onQuery: ({ params }) => handleSearch(params),
          closeFilterSelector: true,
          autoQuery: Boolean(id),
        }}
        buttons={[
          <div className={styles['lov-btn']}>
            {appType !== '' && (
              <Lov
                dataSet={addApiDs}
                name='addApi'
                viewMode={TriggerViewMode.drawer}
                mode={ViewMode.button}
                modalProps={{
                  afterClose: handleApiUpdate,
                  className: styles['lov-btn-modal'],
                }}
                tableProps={{
                  autoHeight: {
                    type: TableAutoHeightType.minHeight,
                    diff: 0,
                  },
                }}
              />
            )}
            <Button
              icon="playlist_add"
              funcType={FuncType.flat}
              color={ButtonColor.primary}
              disabled={appType === ''}
            >
              {intl.get('hzero.common.btn.add').d('新增')}
            </Button>
          </div>,
          <Button
            icon="delete"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            disabled={!deleteFlag}
            onClick={handleConfirm}
          >
            {intl.get('hzero.common.button.toDelete').d('删除')}
          </Button>,
        ]}
      />
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ApiInfo));
