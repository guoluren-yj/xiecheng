/*
 * AppraisalIndicator - 考评指标
 * @Date: 2023-11-06 16:49:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';

import { handleReferenceIndicator } from '@/routes/components/utils/appraisal';
import { addIndicator } from '@/services/appraisalPurchaserService';

const AppraisalIndicator = observer(
  ({
    isEdit,
    dataSet,
    basicDs,
    sourceKey,
    searchCode,
    custLoading,
    wfParams = {},
    readOnlyFlag,
    evalHeaderId,
    customizeTable,
    appraisalPersonDs,
    participSupplierDs,
    customizeUnitCode,
  }) => {
    useEffect(() => {
      basicDs.setState('indicatorLoading', true);
      const queryParams = {
        ...wfParams,
        customizeUnitCode: [
          'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_SEARCH',
          customizeUnitCode,
        ].join(),
      };
      dataSet.setQueryParameter('queryParams', queryParams);
      dataSet.query().finally(() => {
        basicDs.setState('indicatorLoading', false);
      });
    }, [evalHeaderId, JSON.stringify(wfParams)]);

    // 新建指标回调
    const handleCreateIndicator = ({ selectedRows, resolve }) => {
      addIndicator({ evalHeaderId, data: selectedRows })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            resolve();
            notification.success();
            dataSet.query();
            appraisalPersonDs.query(); // 查询评分人
          }
        })
        .finally(() => {
          resolve(false);
        });
    };

    const columns = [
      {
        name: 'indicatorCode',
        headerStyle: { paddingLeft: 48 },
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'scoreTypeMeaning',
      },
      {
        name: 'indicatorTypeMeaning',
      },
      {
        name: 'evalStandard',
        editor: isEdit,
      },
      {
        name: 'evalWeight',
        editor: isEdit,
      },
    ];

    // 新增指标回调
    const handleAddIndicator = () => {
      const supplierData = participSupplierDs.toData();
      if (isEmpty(supplierData)) {
        notification.warning({
          message: intl
            .get('sslm.appraisalPurchaser.view.message.addIndicatorMsg')
            .d('供应商未维护，请先维护参评供应商后，再操作新建指标'),
        });
      } else {
        handleReferenceIndicator({
          dataSet,
          sourceKey: 'TENANT',
          onOk: handleCreateIndicator,
          searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_ADD_SEARCH',
        });
      }
    };

    // 批量删除
    const handleDelete = () => {
      dataSet.delete(dataSet.selected).then(response => {
        if (response && response.success) {
          appraisalPersonDs.query(); // 查询评分人
        }
      });
    };

    const buttons = isEdit
      ? [
        <Button icon="playlist_add" onClick={() => handleAddIndicator()}>
          {intl.get(`spfm.supplierKpiIndicator.view.title.addIndicator`).d('新增指标')}
        </Button>,
        <Button icon="delete_sweep" onClick={handleDelete} disabled={isEmpty(dataSet.selected)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>,
        ]
      : [];
    return customizeTable(
      {
        code: customizeUnitCode,
        readOnly: readOnlyFlag,
      },
      <SearchBarTable
        virtual
        virtualCell
        mode="tree"
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        defaultRowExpanded
        searchCode={searchCode}
        custLoading={custLoading}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        style={{ maxHeight: sourceKey === 'VIEW_DETAIL' ? 348 : 600 }}
        searchBarConfig={{
          autoQuery: false,
          expandable: isEdit,
          defaultExpand: false,
          closeFilterSelector: isEdit,
        }}
      />
    );
  }
);

export default AppraisalIndicator;
