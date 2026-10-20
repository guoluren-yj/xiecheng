import React, { Fragment, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import {
  Table,
  DataSet,
  Button,
  Modal,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
// import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { WaitType } from 'choerodon-ui/pro/lib/core/enum';

import { tableDS, diffInfoListDS, bankListDS } from './stores';

import { bankSync, bankBatchSync } from '@/services/diffBankInfoService'

interface IndexProps {
  [propName: string]: any;
}

interface  ObserverBtnProps {
  [propName: string]: any;
}

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const Index: React.FC<IndexProps> = () => {

    const listDs = useMemo(()=>  new DataSet(tableDS()), []);

    const ObserverBtn = observer(({ dataSet, fn, text, funcType, color, disabledFun }: ObserverBtnProps) => {
      const disabled = disabledFun();
      return (
        <Button dataSet={dataSet} funcType={funcType} color={color} onClick={fn} waitType={WaitType.debounce} wait={300} disabled={disabled}>
          {text}
        </Button>
      );
    }); 

    const handleSync = (bankListDs, data) => {
      return new Promise((resolve)=>{
        bankSync({
          ...data,
          bankId: bankListDs.selected[0].get('bankId'),
        }).then((res)=>{
          if(getResponse(res)){
            notification.success({})
            Modal.destroyAll();
            listDs.unSelectAll();
            listDs.clearCachedSelected();
            listDs.query();
          }
        }).finally(()=>{
          resolve(true);
        });
      });
    };

    const handleBatchSync = (bankListDs) => {
      return new Promise((resolve)=>{
        bankBatchSync({
          data: listDs.selected.map((ele)=>({...ele.toData()})),
          bankId: bankListDs.selected[0].get('bankId'),
        }).then((res)=>{
          if(getResponse(res)){
            notification.success({})
            Modal.destroyAll();
            listDs.unSelectAll();
            listDs.clearCachedSelected();
            listDs.query();
          }
        }).finally(()=>{
          resolve(true);
        });
      });
    };

    const openChooseBankModal : (data?: any) => any = (data) => {
      const isBatch = data ? false : true;
      const bankListDs = new DataSet(bankListDS());

      const bankColumns: ColumnProps[] = [
        {
          name: 'bankCode',
          width: 200,
        },
        {
          name: 'bankName',
          width: 250,
        },
        {
          name: 'bankTypeMeaning',
          width: 150,
        },
    ];

      Modal.open({
        title: intl.get(`${commonPrompt}.diffInfo`).d('差异信息'),
        key: Modal.key(),
        style: { width: '800px' },
        children: (
          <>
            <Table
              dataSet={bankListDs}
              columns={bankColumns}
              queryFieldsLimit={2}
            />
          </>
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        footer: () => (
          <div>
            <ObserverBtn
              fn={()=> !isBatch ? handleSync(bankListDs, data) : handleBatchSync(bankListDs) }
              disabledFun={()=> isEmpty(bankListDs.selected)}
              dataSet={bankListDs}
              funcType={FuncType.raised}
              color={ButtonColor.primary}
              text={intl.get('hzero.common.button.async').d('同步')}
            />
          </div>
        ),
      })
    };

    const diffInfoChoose = (dataSet, data) => {
      const newData = {...data, syncInconsistentFields: dataSet.selected.map(ele => ele.get('inconsistentField')) }
      openChooseBankModal(newData);
    };

    const openDiffInfoModal = (record) => {
      const diffInfoDs = new DataSet(diffInfoListDS());
      const data = record.toData();
      const diffInfoDsData = (data.inconsistentData || []).map((ele)=>({ ...ele, bankFirm: data.bankFirm, platformExistFlag: data.platformExistFlag }))

      diffInfoDs.loadData([...diffInfoDsData]);

      const diffColumns: ColumnProps[] = [
          {
            name: 'bankFirm',
            width: 150,
          },
          {
            name: 'platformExistFlag',
            renderer: ({ value }) => yesOrNoRender(Number(value)),
            width: 120,
          },
          {
            name: 'inconsistentFieldMeaning',
            width: 150,
          },
          {
            name: 'externalValue',
            width: 150,
          },
          {
            name: 'platformValue',
            width: 150,
          },
      ];

      Modal.open({
        title: intl.get(`${commonPrompt}.diffInfo`).d('差异信息'),
        key: Modal.key(),
        style: { width: '850px' },
        children: (
          <>
            <Table
              dataSet={diffInfoDs}
              columns={diffColumns}
            />
          </>
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        footer: () => (
          <div>
            <ObserverBtn
              fn={()=>diffInfoChoose(diffInfoDs, data)}
              disabledFun={()=> isEmpty(diffInfoDs.selected)}
              dataSet={diffInfoDs}
              funcType={FuncType.raised}
              color={ButtonColor.primary}
              text={intl.get('hzero.common.button.async').d('同步')}
            />
          </div>
        ),
      })

    };

    const renderUnanimous = ({ value, record }) => {
      if(Number(value) === 1){
        return <a onClick={()=>openDiffInfoModal(record)}>{intl.get(`${commonPrompt}.inconsistent`).d('不一致')}</a>
      }else{
        return <span>{intl.get(`${commonPrompt}.unanimous`).d('一致')}</span>
      }
    };

    const columns: ColumnProps[] = useMemo(() => {
      return [
        {
          name: 'unanimousFlag',
          renderer: ({ value, record }) => renderUnanimous({ value, record }),
          width: 120,
        },
        {
          name: 'bankName',
          width: 250,
        },
        {
          name: 'bankFirm',
          width: 200,
        },
        {
          name: 'bankBranchName',
          width: 250,
        },
        {
          name: 'platformExistFlag',
          renderer: ({ value }) => yesOrNoRender(Number(value)),
          width: 120,
        },
        {
          name: 'tenantName',
          width: 250,
        },
        {
          name: 'syncFlag',
          renderer: ({ value }) => yesOrNoRender(Number(value)),
          width: 120,
        },
      ];
    }, []);

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.diffBankInfo`).d('差异银行信息')}>
        <ObserverBtn
          fn={()=>openChooseBankModal()}
          disabledFun={()=> isEmpty(listDs.selected) || !listDs.selected.every((ele)=> ele.get('bankName') === listDs.selected[0].get('bankName'))}
          dataSet={listDs}
          funcType={FuncType.raised}
          color={ButtonColor.primary}
          text={intl.get('hzero.common.button.async').d('同步')}
        />
      </Header>
      <Content>
        <Table
          dataSet={listDs}
          columns={columns}
          queryFieldsLimit={3}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['smdm.common', 'hzero.common', 'smdm.bank', 'hpfm.bank'],
})(Index);
