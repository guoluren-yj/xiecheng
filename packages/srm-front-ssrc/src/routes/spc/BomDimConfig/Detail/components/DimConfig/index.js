import React, { useMemo } from 'react';
import { Button, Modal, DataSet } from 'choerodon-ui/pro';
import FilterBarTable from '_components/FilterBarTable';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import { StatusRender } from '@/routes/spc/FormulaManage/utils';
import DimConfigDrawer from './DimConfigDrawer';
import { DimConfigFormDS } from './store';

const Index = (props) => {
  const { isEdit, dataSet, bomTemplateId } = props;

  const columns = useMemo(
    () =>
      [
        {
          name: 'bomDimensionEnabledFlag',
          editor: isEdit,
          width: 100,
          renderer: ({ value }) => enableRender(value) || '-',
        },
        {
          name: 'bomDimensionCode',
          width: 150,
          renderer: ({ record, value }) => (
            <a onClick={() => handleCreate(record, 'view')}>{value}</a>
          ),
        },
        {
          name: 'bomDimensionName',
          width: 120,
        },
        {
          name: 'businessObjectName',
          width: 140,
        },
        {
          name: 'bomDimensionType',
          width: 120,
          renderer: ({ value, record }) => {
            return StatusRender(value, record.get('bomDimensionTypeMeaning'));
          },
        },
        {
          name: 'bomDimensionRequired',
          width: 120,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'bomDimensionEditable',
          width: 120,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'bomDimensionVisible',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'bomDimensionSeq',
          width: 100,
        },
        {
          name: 'isFormula',
          width: 200,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'bomDimensionWidget',
          renderer: ({ record }) => record.get('bomDimensionWidgetMeaning'),
        },
        {
          name: 'bomDimensionWidgetCode',
          width: 200,
        },
        isEdit && {
          name: 'action',
          width: 100,
          lock: 'right',
          renderer: ({ record }) => (
            <a onClick={() => handleCreate(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
          ),
        },
      ].filter((item) => item),
    [isEdit]
  );

  const handleCreate = (record, type = 'edit') => {
    const editFlag = isEdit && type !== 'view';
    const drawerDS = new DataSet(DimConfigFormDS(bomTemplateId, editFlag));
    if (type === 'create') {
      drawerDS.create({});
    } else {
      // 处理多语言的查看，如果用create，会导致多语言字段不会调用接口
      drawerDS.loadData(record?.toData ? [record.toData()] : []);
    }
    const notEditProps = {
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    };
    const title = intl.get(`spc.bomDimConfig.view.title.${type}DimConfig`).d(`维度配置`);
    Modal.open({
      title,
      destroyOnClose: true,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      children: <DimConfigDrawer isEdit={editFlag} dataSet={drawerDS} bomTemplateId={bomTemplateId} />,
      onOk: async () => {
        if (!editFlag) return;
        const res = getResponse(await drawerDS.submit());
        // 校验不通过
        if (res === false) return false;
        // 没有操作过数据
        if (res === undefined) return;
        dataSet.query();
      },
      ...(editFlag ? {} : notEditProps),
    });
  };

  // const handleDelete = async () => {
  //   const selectedRows = dataSet.selected;
  //   const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
  //   const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
  //   // 删除本地数据
  //   dataSet.remove(newAddRows);
  //   // 删除线上数据
  //   const res = await dataSet.delete(existedRows, {
  //     title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
  //     children: intl
  //       .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
  //       .d('确认删除选中行？'),
  //   });
  //   if (getResponse(res)) {
  //     dataSet.query();
  //   }
  // };

  const TableButtons = observer(() => {
    // const { ds } = btnProps;
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    return [
      <Button
        data-name="add"
        icon="playlist_add"
        onClick={() => handleCreate({}, 'create')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
      // <Button
      //   data-name="delete"
      //   icon="delete_sweep"
      //   disabled={isEmpty(ds.selected)}
      //   onClick={handleDelete}
      //   {...buttonCommonProps}
      // >
      //   {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      // </Button>,
    ];
  });

  return (
    <FilterBarTable
      customizable
      customizedCode="SPC.PRICE_BOM_DIM_CONFIG.DETAIL.DIM_CONFIG_TABLE"
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 430 }}
      buttons={isEdit && [<TableButtons ds={dataSet} />]}
      filterBarConfig={{
        autoQuery: false,
        collpaseble: !!isEdit,
      }}
    />
  );
};

export default Index;
