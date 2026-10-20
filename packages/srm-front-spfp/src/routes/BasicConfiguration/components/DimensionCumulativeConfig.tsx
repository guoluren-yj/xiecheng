import React, { Fragment, useContext, useMemo, useCallback } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type Record from 'choerodon-ui/dataset/data-set/Record';

import intl from 'utils/intl';

import Styles from '../../common.less';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import DimensionAddModal from './DimensionAddModal';
import { DimensionType } from '../utils/type';
import { handleDimensionEnable } from '../utils/api';
import StatusTag from '../../Components/StatusTag';

const DimensionCumulativeConfig = () =>
{

  const { cumulativeDimensionDs, handleEnable } = useContext<StoreValueType>(Store);


  const onOk = useCallback(() =>
  {
    cumulativeDimensionDs.query();
    cumulativeDimensionDs.setState('isEditFlag', true);


  }, [cumulativeDimensionDs]);

  // 新增
  const handleAdd = useCallback(
    () =>
    {
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.addCumulativeDimensionConfig').d('新增累计维度配置'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-small-modal'],
        children: <DimensionAddModal type='create' dimensionType={DimensionType.cumulative} onOk={onOk} />,

      });

    },
    [onOk],
  );

  const handleEdit = useCallback(
    (record) =>
    {
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.editCumulativeDimensionConfig').d('编辑累计维度配置'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-small-modal'],
        okText: intl.get('hzero.common.button.save').d('保存'),
        children: <DimensionAddModal type='update' data={record?.toData() || {}} dimensionType={DimensionType.cumulative} onOk={onOk} />,

      });

    },
    [onOk],
  );

  const buttons = useMemo(
    () => [
      [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],

    ],
    [handleAdd]
  );

  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'enableFlag',
        width: 150,
        renderer: ({ value }) => (
          <StatusTag
            value={value}
            text={value === 1
              ? intl.get(`hzero.common.enable`).d('启用')
              : intl.get('hzero.common.status.disabled').d('禁用')}
            color={value === 1 ? 'success' : 'error'}
          />
        ),
      },
      {
        name: 'action',
        width: 150,
        renderer: ({ record }) => (
          <Fragment>
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleEdit(record)}
            >
              {intl.get(`hzero.common.button.editable`).d('编辑')}
            </Button>
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleEnable(record as Record, handleDimensionEnable, DimensionType.cumulative)}
            >
              {record?.get('enableFlag') === 1
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get(`hzero.common.enable`).d('启用')
              }
            </Button>
          </Fragment>
        ),
      },
      { name: 'ruleType', width: 150 },
      { name: 'documentCodeLov', width: 250 },
      { name: 'dimensionName', width: 250 },
      { name: 'dimensionDefCombinationMeaning', width: 300 },
    ];

  }, [handleEdit, handleEnable]);


  return (
    <Table
      dataSet={cumulativeDimensionDs}
      columns={columns}
      buttons={buttons}
      selectionMode={SelectionMode.none}
    />
  );
};

export default DimensionCumulativeConfig;