import React, { useMemo, useContext, useEffect, useCallback, Fragment } from 'react';
import { Button, Modal, TextField, Icon } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { ActiveKey, GridCustCode, SearchCustCode } from '../../utils/type';
import { statusTagRender } from '../../../../utils/renderer';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import commonStyles from '../../../common.less';
import ModifyGoodsMapping from './ManualGoodsMapping';

const key = ActiveKey.Mapping;

const MappingTable = () =>
{

  const { getTotalCount, mappingTableDs, customizeTable, handleRecordInit, handleViewOperation } = useContext<StoreValueType>(Store);

  useEffect(() =>
  {
    handleRecordInit(key);
  }, [handleRecordInit]);

  const onOk = useCallback(() =>
  {
    mappingTableDs.query();
    getTotalCount();
  }, [mappingTableDs, getTotalCount]);

  // 修改信息
  const handleModifyInfo = useCallback((record) =>
  {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.common.view.button.modifyInfo').d('修改信息'),
      children: <ModifyGoodsMapping record={record} action="modify" onOk={onOk} />,
    });
  }, []);

  const columns = useMemo<ColumnProps[]>(() =>
  {
    return [
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 170,
      },
      {
        name: 'operation',
        width: 140,
        renderer: ({ record }) =>
        {
          const mappingId = record?.get('mappingId');
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
                onClick={() => handleViewOperation({ mappingId }, 'mapping')}
              >
                {intl.get('hzero.common.button.operation').d('操作记录')}
              </Button>
            </Fragment>
          );
        },
      },
      {
        name: 'purchaserCompanyName',
        width: 200,
      },
      {
        name: 'partnerItemCode',
        width: 160,
      },
      {
        name: 'partnerItemName',
        width: 180,
      },
      {
        name: 'model',
        width: 150,
      },
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 90,
      },
      {
        name: 'commodityCode',
        width: 180,
      },
      {
        name: 'commodityName',
        width: 200,
      },
      {
        name: 'commodityServiceCateCode',
        width: 150,
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => statusTagRender(value ? intl.get('hzero.common.status.enable').d('启用') : intl.get('hzero.common.status.disabled').d('禁用'), value ? 'success' : 'error'),
      },
    ];
  }, [handleModifyInfo, handleViewOperation]);

  const searchBarConfig = useMemo(() =>
  {
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
              .get('ssta.goodsInfo.view.placeholder.enterItemOrGoodsOrServiceToQuery')
              .d('请输入物料名称、税收分类编码名称')}
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
          dataSet={mappingTableDs}
          searchCode={SearchCustCode[key]}
          searchBarConfig={searchBarConfig}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default MappingTable;
