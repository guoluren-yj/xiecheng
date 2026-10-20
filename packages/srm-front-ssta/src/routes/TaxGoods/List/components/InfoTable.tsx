import React, { useMemo, useContext, useEffect, Fragment, useCallback } from 'react';
import { Button, TextField, Icon, Modal } from 'choerodon-ui/pro';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { ActiveKey, GridCustCode, SearchCustCode } from '../../utils/type';

import { statusTagRender } from '../../../../utils/renderer';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import commonStyles from '../../../common.less';
import ModifyGoodsInfo from './ManualGoodsInfo';

const key = ActiveKey.Info;

const InfoTable = () => {

  const { infoTableDs, infoSearchRef, customizeTable, handleRecordInit, handleViewOperation, getTotalCount } = useContext<StoreValueType>(Store);

  const handleRef = useCallback(
    (ref) => {
      infoSearchRef.current = ref;
    }, [infoSearchRef]);

  // 行更改监听事件
  const handleRecordUpdate = useCallback(
    async ({ name, record, dataSet }) => {
      if (name === 'enabledFlag') {
        dataSet.dataToJSON = DataToJSON.dirty;
        const res = await dataSet.submit();
        dataSet.dataToJSON = DataToJSON.selected;
        if (!res) return;
        const { objectVersionNumber } = res.content?.[0] || {};
        record.set({ objectVersionNumber });
      }
    },
    []
  );

  useEffect(() => {
    infoTableDs.addEventListener('update', handleRecordUpdate);
    return () => {
      infoTableDs.removeEventListener('update', handleRecordUpdate);
    };
  }, [infoTableDs, handleRecordUpdate]);

  useEffect(() => {
    handleRecordInit(key);
  }, [handleRecordInit]);

  const onOk = useCallback(() => {
      infoTableDs.query();
      getTotalCount();
    }, [infoTableDs, getTotalCount]);

   // 修改信息
   const handleModifyInfo = useCallback((record) =>
    {
      Modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: commonStyles['ssta-small-modal'],
        title: intl.get('ssta.common.view.button.modifyInfo').d('修改信息'),
        children: <ModifyGoodsInfo record={record} action="modify" onOk={onOk} />,
      });
    }, []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'commodityCode',
        width: 180,
      },
      {
        name: 'commodityName',
        width: 200,
      },
      {
        name: 'operation',
        width: 140,
        renderer: ({ record }) => {
          const commodityId = record?.get('commodityId');
          return (
            <Fragment>
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleModifyInfo(record)}
              >
                {intl.get('ssta.common.view.button.modifyInfo').d('修改信息')}
              </Button>
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleViewOperation({ commodityId }, 'info')}
              >
                {intl.get('hzero.common.button.operation').d('操作记录')}
              </Button>
            </Fragment>
          );
        },
      },
      {
        name: 'commodityServiceCateCode',
        width: 150,
      },
      {
        name: 'taxRate',
        width: 90,
        renderer: ({ record }) => record?.get('taxRateMeaning'),
      },
      {
        name: 'preferentialPolicyFlagMeaning',
        width: 120,
      },
      {
        name: 'freeTaxMarkMeaning',
        width: 120,
      },
      {
        name: 'specialManagementVat',
        width: 150,
      },
      {
        name: 'percent',
        width: 150,
      },
      {
        name: 'keyWord',
        width: 180,
      },
      {
        name: 'remark',
        width: 140,
      },
      {
        name: 'summaryFlagMeaning',
        width: 120,
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => statusTagRender(value ? intl.get('hzero.common.status.enable').d('启用') : intl.get('hzero.common.status.disabled').d('禁用'), value ? 'success' : 'error'),
      },
      {
        name: 'sourceCodeMeaning',
        width: 120,
      },
      {
        name: 'supUnifiedSocialCode',
        width: 150,
      },
      {
        name: 'projectName',
        width: 150,
      },
      {
        name: 'model',
        width: 150,
      },
      {
        name: 'uom',
        width: 150,
      },
    ];
  }, [handleViewOperation, handleModifyInfo]);

  const searchBarConfig = useMemo(() => {
    return {
      left: {
        render: (_, customizeDs) => (
          <TextField
            clearButton
            name="queryParam"
            dataSet={customizeDs}
            style={{ width: 300 }}
            prefix={<Icon type="search" />}
            placeholder={intl
              .get('ssta.goodsInfo.view.placeholder.enterTaxCodeOrGoodsOrServiceToQuery')
              .d('请输入税收分类编码、税收分类编码名称')}
          />
        ),
      },
    };
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCode[key] },
        <SearchBarTable
          cacheState
          customizable
          columns={columns}
          dataSet={infoTableDs}
          searchBarRef={handleRef}
          searchCode={SearchCustCode[key]}
          searchBarConfig={searchBarConfig}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default InfoTable;
