import React, { useMemo, useEffect, useState } from 'react';
import { flatten } from 'lodash';
import { Table, DataSet, Select, CheckBox, Lov, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { deleteCofirmModal } from '../../MallHomeConfig/common/modals';
import { fetchTypeAndMethod, deleteTypeAndMethod } from '../api';
import styles from './index.less';

let tableList = [];

const tableds = ({ recordData, initData }) => {
  return {
    data: initData,
    selection: 'multiple',
    fields: [
      {
        name: 'invoiceMethod',
        lookupCode: 'SMAL.INVOICE_METHOD',
        required: true,
        // lovPara: { parentValue: recordData.ecPlatform },
        label: intl.get('small.common.model.invoiceMethod').d('开票方式'),
      },
      {
        name: 'invoiceType',
        lookupCode: 'SMAL.INVOICE_TYPE',
        required: true,
        // lovPara: { parentValue: recordData.ecPlatform },
        label: intl.get('small.common.model.invoiceTypes').d('发票类型'),
      },
      {
        name: 'orderSeq',
        label: intl.get('small.payInfoManagement.model.orderSeq').d('优先级'),
      },
      {
        name: 'invoiceTypeData',
      },
      {
        name: 'enableFlag',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('small.common.model.isornoEnabledFlag').d('是否启用'),
      },
      {
        name: 'ecClientId',
        defaultValue: recordData.ecClientId,
      },
    ],
    transport: {
      destroy() {
        return {
          url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/ec-invoice-infos/batch-delete`,
          method: 'DELETE',
        };
      },
    },
    events: {
      update: ({ record, name, value }) => {
        if (name === 'invoiceMethod') {
          const text = record.getField('invoiceMethod').getText(value);
          record.set('invoiceMethodName', text);
        }
        if (name === 'invoiceType') {
          const text = record.getField('invoiceType').getText(value);
          record.set('invoiceTypeName', text);
        }
      },
    },
  };
};

const tablecolumns = (DS) => [
  {
    name: 'invoiceMethod',
    editor: (record) => (
      <Select
        onChange={(value, oldValue) => {
          const list = DS.toData().filter(
            (p) =>
              p.invoiceMethod &&
              record.get('invoiceType') &&
              +p.invoiceMethod === +value &&
              +record.get('invoiceType') === +p.invoiceType
          );
          if (list.length > 1) {
            record.set('invoiceMethod', oldValue);
          }
        }}
      />
    ),
  },
  {
    name: 'invoiceType',
    editor: (record) => (
      <Select
        onChange={(value, oldValue) => {
          const list = DS.toData().filter(
            (p) =>
              p.invoiceType &&
              record.get('invoiceMethod') &&
              +p.invoiceType === +value &&
              +record.get('invoiceMethod') === +p.invoiceMethod
          );
          if (list.length > 1) {
            record.set('invoiceType', oldValue);
          }
        }}
      />
    ),
  },
  { name: 'orderSeq', width: 90, align: 'left', renderer: ({record}) => (record.index + 1) },
  { name: 'enableFlag', width: 60, editor: <CheckBox /> },
];

const companyds = ({ initData, groupNum }) => {
  return {
    data: [
      {
        companyLov: initData,
      },
    ],
    fields: [
      {
        name: 'companyLov',
        type: 'object',
        lovCode: 'HPFM.TENANT_COMPANY',
        label: '公司',
        multiple: true,
        optionsProps: {
          pageSize: 20,
          record: {
            dynamicProps: {
              selectable: (record) => {
                const otherList = tableList?.filter(
                  (p) => +p.groupNum !== +groupNum && +p.groupNum !== 1
                );
                const hasCompany = flatten(
                  otherList?.map((p) => p.cds.current.toData()?.companyLov)
                );
                return !hasCompany.some((p) => p.companyId === record.get('companyId'));
              },
            },
          },
        },
      },
    ],
  };
};

export default function InvoiceMethod(props) {
  const { record: recordData } = props;
  const [list, setList] = useState([]);
  tableList = useMemo(() => {
    return list.map((p) => {
      const tds =
        p.tds || new DataSet(tableds({ recordData, initData: p.ecInvoiceInfoList || [] }));
      return {
        ...p,
        tds,
        cds:
          p.cds ||
          new DataSet(companyds({ initData: p.ecInvoiceAssignList || [], groupNum: p.groupNum })),
      };
    });
  }, [list]);

  useEffect(() => {
    fetchTypeAndMethod(recordData).then((res) => {
      const result = getResponse(res);
      if (Array.isArray(result) && !result?.some(p => p.groupNum === 1)) {
        result.unshift({
          groupNum: 1,
          ecInvoiceInfoList: [],
          ecInvoiceAssignList: [],
        });
      }
      // // 兼容老的优先级排序
      // const newResult = result.map(r=>{
      //   return {
      //     ...r,
      //     ecInvoiceInfoList: (r?.ecInvoiceInfoList?.sort((a, b)=> a.orderSeq - b.orderSeq ) || []).map((e, i)=>({...e, orderSeq: i+1})),
      //   };
      // });
      setList(result || []);
    });
    return () => {
      tableList = [];
    };
  }, []);

  useEffect(() => {
    props.onDSRef({ name: 'invoiceMethodDS', ref: tableList });
  }, [list, tableList]);

  function handleCompanyDelete(table){
    deleteCofirmModal({
      onOk: () => deleteTable(table),
    });
  }

  function deleteTable(item) {
    deleteTypeAndMethod({
      ecClientId: recordData.ecClientId,
      groupNum: item.groupNum,
      ecInvoiceInfoList: [],
      ecInvoiceAssignList: [],
    }).then((res) => {
      if (getResponse(res)) {
        setList((data) => {
          return data.filter((p) => p.groupNum !== item.groupNum);
        });
        notification.success();
      }
    });
  }

  async function handleDelete(dataSet){
    const res = await dataSet.delete(dataSet.selected || []);
    if(res){
      dataSet.loadData(dataSet.toData());
    }
  }

  return (
    <div className={styles['modal-content']}>
      {tableList?.map((table) => {
        const isDefault = table.groupNum === 1;
        const AddCompany = (
          <Lov
            clearButton={false}
            dataSet={table?.cds}
            disabled={isDefault}
            name="companyLov"
            mode="button"
            icon="domain_list"
            viewMode="drawer"
            modalProps={{
              style: {
                width: 742,
              },
              title: intl.get('small.payInfoManagement.model.use.company').d('适用公司'),
            }}
            tableProps={{
              style: {
                maxHeight: `calc(100vh - 260px)`,
              },
            }}
          >
            {isDefault
              ? intl.get('small.payInfoManagement.model.all.company').d('全部公司')
              : intl.get('small.payInfoManagement.model.use.company').d('适用公司')}
          </Lov>
        );
        const DelButton = observer(({ dataSet }) => {
          return (
            <Button
              disabled={!dataSet.selected.length}
              funcType="flat"
              color="primary"
              icon="delete_sweep"
              onClick={()=>{ handleDelete(dataSet); }}
            >
              {intl.get('small.common.model.batchDelete').d('批量删除')}
            </Button>
          );
        });
        const columns = tablecolumns(table?.tds);
        return (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <Table
              dragColumnAlign="left"
              rowDraggable
              customizedCode="SMAL.EC_PAYMENT.INVOICEMETHOD"
              buttons={['add', AddCompany, <DelButton dataSet={table?.tds} />]}
              dataSet={table?.tds}
              columns={columns}
              pagination={false}
            />
            {!isDefault && (
            <Button className="table-delete-btn" funcType="flat" icon="delete" onClick={()=>{ handleCompanyDelete(table); }} />
            )}
          </div>
        );
      })}
      <Button
        className="table-add-btn"
        icon="add"
        funcType="flat"
        color="primary"
        onClick={() => {
          setList((data) => {
            const num = Math.max.apply(
              null,
              data?.map((p) => p.groupNum)
            );
            return [...tableList, { groupNum: num + 1 }];
          });
        }}
      >
        {intl.get('small.payInfoManagement.button.add.invoiceType').d('新建开票方式')}
      </Button>
    </div>
  );
}
