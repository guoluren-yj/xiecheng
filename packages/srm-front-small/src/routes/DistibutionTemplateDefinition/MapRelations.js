/**
 * 映射关系
 */
import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip, Table, Button, Lov, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const DeleteButton = observer(({dataSet, onClick = e => e, children}) => (
  <Button
    funcType="flat"
    icon="delete_sweep"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {children || intl.get('hzero.common.button.batchDelete').d('批量删除')}
  </Button>
));

export default function MapRelations(props) {
  const {
    editEnable,
    dimensionType,
    isCreate,
    mappingTableDs,
    readOnly,
  } = props;

  const editFlag = useMemo(() => editEnable || isCreate, [editEnable, isCreate]);

  useEffect(() => {
    mappingTableDs.selection = readOnly ? false : 'multiple';
  }, [readOnly]);

  function handleDelete() {
    mappingTableDs.remove(mappingTableDs.selected, true);
  }

  const mappingClumns = [
    {
      name: 'targetSystem',
      editor: (record) => editFlag && (
        <Select
          onOption={({ record: option }) => ({
            disabled: mappingTableDs.some(n => ['PRODUCT', 'PRICE'].includes(n.get('targetSystem'))) && !['PRODUCT', 'PRICE'].includes(record.get('targetSystem')) && ['PRODUCT', 'PRICE'].includes(option.get('value')),
          })}
          optionRenderer={({ text, value}) => {
            const disabled = mappingTableDs.some(n => ['PRODUCT', 'PRICE'].includes(n.get('targetSystem'))) && ['PRODUCT', 'PRICE'].includes(value);
            const titile = disabled ? intl.get('small.cartTemplate.view.confirm.targetSystem').d('商品中心与商品价格均属是本字段的取值来源字段因此只能配置其中一个，请检查映射配置后操作') : null;
            return (
              <Tooltip title={titile}>
                {text}
              </Tooltip>
            );
          }}
        />
      ),
    },
    {
      name: 'targetType',
      editor: editFlag,
    },
    {
      name: 'targetFieldCodeLov',
      editor: () => editFlag && <Lov noCache />,
    },
    { name: 'targetFieldName', editor: editFlag },
  ];

  return (
    !(dimensionType.includes('FIXED') && !isCreate) && (
      <div className="config-card">
        <div className="configs" style={{ marginBottom: 8 }}>
          <span>{intl.get('small.common.mapping.relations').d('映射关系')}</span>
        </div>
        <div className="config-card-help">
          {intl
            .get('small.common.mapping.help')
            .d(
              '①当自定义的维度需要传给SRM或者其他外部系统时，必须要跟商城订单（oms）映射，且选择的oms字段不允许在预采申请页面个性化的时候重复使用 ②当自定义的维度要做导入时，需要跟业务对象映射，字段必须保持一对一'
            )}
        </div>
        <Table
          buttons={
            editEnable || isCreate
              ? [
                  'add',
                  <DeleteButton dataSet={mappingTableDs} onClick={() => handleDelete()}>
                    {intl.get('hzero.common.button.batchDelete').d('批量删除')}
                  </DeleteButton>,
                ]
              : []
          }
          columns={mappingClumns}
          dataSet={mappingTableDs}
          customizedCode="LOV_CONFIG__MAPPING_TABLE"
        />
      </div>
    )
  );
};
