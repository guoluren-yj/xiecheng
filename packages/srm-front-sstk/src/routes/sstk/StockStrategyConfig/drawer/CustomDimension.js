import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, TextField, IntlField, Lov, Select, Form, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import FormPro from '@/components/FormPro';

import c7nModal from '@/utils/c7nModal';
import CustomLov from '@/routes/sstk/components/CustomLov';
import SecondCard from '../../components/SecondCard';
import { dimensionBaseDS, dimensionMappingDS } from '../store/strategyDetailDs';
import { fetchLovFields, fetchSaveSDimension, fetchDimensionDetail } from '../api';

export default observer(function CustomDimension({
  dimensionId,
  dimensionDs,
  readOnly = false,
  modal,
}) {
  const [loading, setLoading] = useState(false);
  const baseInfoDs = useMemo(() => new DataSet(dimensionBaseDS(dimensionId, readOnly)), [dimensionId, readOnly]);
  const dimensionMappingDs = useMemo(() => new DataSet(dimensionMappingDS()), []);
  useEffect(() => {
    if (readOnly) {
      dimensionMappingDs.selection = false;
      modal.update({
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    }
    modal.update({
      footer: (
        <>
          {
            !readOnly && (
              <Button color="primary" onClick={() => handleSave(false)}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )
          }
          {
            !readOnly && !dimensionId && (
              <Button onClick={() => handleSave(true)}>
                {intl.get('sstk.common.button.saveAndClose').d('保存并关闭')}
              </Button>
            )
          }
          {!readOnly ? (
            <Button onClick={() => modal.close()}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          )
            : (
              <Button color='primary' onClick={() => modal.close()}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </Button>
            )
          }
        </>
      ),
    });
    // 编辑
    if (dimensionId) {
      initData();
    }
  }, []);

  const handleSave = async (close = false) => {
    const keepCurrent = !close && !dimensionId; // 停留当前页
    // if (readOnly) return true;
    if (!baseInfoDs.dirty && !dimensionMappingDs.dirty) {
      // 新建保存， 留在当前页
      if (!keepCurrent) modal.close();
      return;
    };
    const headerFlag = await baseInfoDs.validate();
    const lineFlag = await dimensionMappingDs.validate();
    if (headerFlag && lineFlag) {
      const data = baseInfoDs.current.toJSONData();
      data.lines = dimensionMappingDs.toJSONData().map(m => ({
        ...m,
        dimensionId,
      }));
      const res = getResponse(await fetchSaveSDimension(data));
      if (res) {
        notification.success();
        initData(res.dimensionId);
        dimensionDs.query();
        return !keepCurrent ? modal.close() : null;
      }
      return !keepCurrent ? modal.close() : null;
    }
  };

  const initData = async (_dimensionId) => {
    setLoading(true);
    const res = getResponse(await fetchDimensionDetail(dimensionId || _dimensionId));
    setLoading(false);
    if (res) {
      baseInfoDs.loadData([res]);
      dimensionMappingDs.loadData(res.lines);
      const { componentType, lovCode } = res || {};
      if (!readOnly && componentType === 'LOV' && lovCode) {
        const { tableFields = [] } = getResponse(await fetchLovFields(lovCode));
        const optionsDs = new DataSet({
          data: tableFields,
        });
        baseInfoDs.current.getField('filedObj').set('options', optionsDs);
      }
    }
  };

  //  值集视图编码lov
  const openSetViewModal = useCallback(() => {
    const ds = new DataSet({
      autoQuery: true,
      selection: false,
      queryFields: [
        { name: 'viewCode', label: intl.get('sstk.common.view.lovCode').d('值集视图编码') },
        { name: 'viewName', label: intl.get('sstk.common.view.lovName').d('值集视图名称') },
      ],
      fields: [
        {
          name: 'viewCode',
          label: intl.get('sstk.common.view.lovCode').d('值集视图编码'),
        },
        {
          name: 'viewName',
          label: intl.get('sstk.common.view.lovCode').d('值集视图名称'),
        },
      ],
      transport: {
        read: {
          url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`,
          method: 'GET',
        },
      },
    });
    const columns = [
      {
        name: 'viewCode',
        width: 280,
      },
      {
        name: 'viewName',
        width: 280,
      },
    ];
    c7nModal({
      drawer: false,
      style: { width: 700 },
      title: intl.get('sstk.common.view.chooseLovView').d('选择值集视图'),
      children: (
        <CustomLov
          columns={columns}
          dataSet={ds}
          onRowDoubleClick={async (rowRecord) => {
            baseInfoDs.current.set('lovCodeObj', rowRecord.toData());
            const viewCode = rowRecord.get('lovCode');
            const { tableFields = [] } = getResponse(await fetchLovFields(viewCode));
            const optionsDs = new DataSet({
              data: tableFields,
            });
            baseInfoDs.current.getField('filedObj').set('options', optionsDs);
          }}
        />
      ),
    });
  }, []);

  const handleDelete = () => {
    dimensionMappingDs.delete(dimensionMappingDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sagm.common.modal.confirm.content').d('是否确定删除?'),
    }
    );
  };
  const columns = useMemo(() => {
    return [
      {
        name: 'targetSystem',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'targetType',
        width: 120,
        // IN_OUT_ORDER - 库存单 SHIPPING - 物流
        // LINE 单据行 HEADER - 单据头
        editor: (record) => {
          if (readOnly) return false;
          return <Select optionsFilter={(r) => record.get('targetSystem') === 'IN_OUT_ORDER' ? r.get('value') === 'LINE' : true} />;
        },
      },
      {
        name: 'targetFieldLov',
        width: 150,
        editor: !readOnly,
      },
      {
        name: 'targetFieldName',
        width: 150,
        editor: !readOnly,
      },
      // {
      //   name: 'option',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   // width: 100,
      //   hidden: readOnly,
      //   renderer: ({ record }) => (
      //     <Button
      //       funcType='link'
      //       color='primary'
      //       onClick={() => handleDelete(record)}
      //     >
      //       {intl.get('hzero.common.button.delete').d('删除')}
      //     </Button>
      //   ),
      // },
    ];
  });
  const componentType = baseInfoDs.current.get('componentType');
  return (
    <>
      <SecondCard offsetTop={0} title={intl.get('sstk.stockConfig.view.dimensionBaseInfo').d('基本配置')}>
        {
          readOnly ? (
            <Spin spinning={loading}>
              <FormPro
                readOnly
                columns={3}
                dataSet={baseInfoDs}
                fields={[
                  { name: 'dimensionCode' },
                  { name: 'dimensionName' },
                  { name: 'componentType' },
                  {
                    name: 'lovCodeObj',
                    show: componentType === 'LOV',
                  },
                  {
                    name: 'filedObj',
                    show: componentType === 'LOV',
                  },
                ]}
              />
            </Spin>
          ) :
            (
              <Spin spinning={loading}>
                <Form
                  labelLayout="float"
                  dataSet={baseInfoDs}
                  columns={2}
                >
                  <TextField name="dimensionCode" />
                  <IntlField name="dimensionName" />
                  <Select name="componentType" />
                  {componentType === 'LOV' && (
                    <>
                      <Lov name="lovCodeObj" onClick={openSetViewModal} />
                      <Select name="filedObj" showHelp="tooltip" />
                    </>
                  )}
                </Form>
              </Spin>
            )
        }
      </SecondCard>
      {baseInfoDs.current.get('dimensionId') && (
        <SecondCard title={intl.get('sstk.stockConfig.view.dimensionMapping').d('映射关系')}>
          <Table
            customizedCode='SSTK.STOCK_STRATEGY_CONFIG.DETAIL.DIMENSION_MAPPING_TABLE'
            dataSet={dimensionMappingDs}
            buttons={readOnly ? [] : [
              <Button icon="playlist_add" funcType="flat" onClick={() => dimensionMappingDs.create({}, 0)}>
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>,
              <Button
                funcType="flat"
                icon="delete_sweep"
                disabled={dimensionMappingDs.selected.length === 0}
                onClick={() => handleDelete()}
              >
                {intl.get('sstk.common.button.batchDelete').d('批量删除')}
              </Button>,
            ]}
            columns={columns}
          />
        </SecondCard>
      )}
    </>
  );
});