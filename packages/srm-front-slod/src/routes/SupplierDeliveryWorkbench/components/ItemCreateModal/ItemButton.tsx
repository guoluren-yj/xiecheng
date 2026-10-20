import React, {FC, useState} from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Button, Modal, DataSet } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { indexDataSet } from '@/components/CustomFormAndTableWrapper';
import ContentTable from './CTable';
import { lineColumns, fetchLine, createFn, loadFn, updateFn } from './methods';

interface USMButtonProps {
  campKey?: string;
  buttonProps?: any;
  btnText?: string;
  funcType?: FuncType;
  loading?: boolean;
  dataSet?: DataSet;
  disabled?: boolean;
  btnParams?: any;
  history?: any;
};

const ItemButton: FC<USMButtonProps> = (props: USMButtonProps) => {

  const {
      loading,
      dataSet,
      campKey,
      history,
      disabled = false,
      btnText = '',
      btnParams,
      buttonProps = {funcType: FuncType.flat},
  } = props;

  const [btnLoading, setBtnLoading] = useState(false);


  const openModal = () => {
    setBtnLoading(true);
    const { lineCms } = lineColumns();
    const ds = new DataSet(indexDataSet({
      paging: false,
      load: loadFn,
      update: updateFn,
      componentData: lineCms,
    }));
    const lineProps = {
      ds,
      campKey,
      dataSet,
      loading,
      lineCms,
    };
    const body = dataSet?.selected?.map((item) => item.toData()) || [];
    const nodeConfigId = body[0]?.nodeConfigId;
    fetchLine({ body, nodeConfigId, campKey }).then(res => {
      if (getResponse(res)) {
        setBtnLoading(false);
        const data = isEmpty(res) ? [] : res?.map((i) => {
          return {
            ...i,
            custLineId: uuid(),
          };
        });
        ds.loadData(data);
        Modal.open({
          key: 'updateSubjectMatter',
          title: btnText,
          drawer: true,
          resizable: true,
          children: <ContentTable {...lineProps} />,
          style: {
            width: 800,
          },
          okText: intl.get('hzero.common.button.created').d('创建'),
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          onOk: async () => createFn(ds, dataSet, campKey, btnParams, history),
        });
      } else {
        setBtnLoading(false);
      }
    });
  };

  const newBtnProps: any = { ...buttonProps };

    return (
      <Button
        style={{ marginLeft: '16px', marginRight: '16px' }}
        type="c7n-pro"
        color="dark"
        loading={loading || btnLoading}
        onClick={openModal}
        disabled={disabled}
        {...newBtnProps}
      >
        {btnText}
      </Button>
    );
};


export default formatterCollections({
  code: [
    'slod.common',
    'hzero.common',
    'slod.deliveryManage',
    'sinv.deliveryCreation',
    'sinv.receiptWorkbench',
    'slod.deliveryWorkbench',
  ],
})(ItemButton);