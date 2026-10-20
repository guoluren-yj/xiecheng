/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/order */
import React, { useState, useEffect, useImperativeHandle, useRef, useContext } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { runInAction } from 'mobx';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';

import ImgIcon from '@/utils/ImgIcon';
import { createTableService } from '@/services/modelBaseService';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Modal from '@/components/LowcodeModal';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import PositiveTable from './PositiveTable';

const { Step } = Steps;
// 静态数据
const positiveModalKey = Modal.key();
type IUpdate = (props: object) => any;
type IClose = () => any;
interface IPositiveModal {
  update: IUpdate;
  close: IClose;
}
let positiveModal: IPositiveModal = {
  update: () => {},
  close: () => {},
};
interface IIndex {
  schemaName?: string;
  dataSourceType?: string;
  serviceCode?: string;
  setDataStore: any;
}
export default observer(({ schemaName, dataSourceType, serviceCode, setDataStore }: IIndex) => {
  const {
    ref: { addTableModelRef, menuSelectRef, baseLabelMenuRef },
    storeData: { _tenantId, level, viewType },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;

  useImperativeHandle(addTableModelRef, () => ({
    openPositiveModal,
  }));

  const [step, setStep] = useState<number>(0); // 步骤
  // 脚步按钮
  const stepsArr = [{ title: '添加基础表信息' }, { title: '添加表字段' }, { title: '添加索引' }];
  const positiveRef: any = useRef();
  const isSubmitOkRef: any = useRef(null);
  const positiveTableProps = {
    level,
    _tenantId,
    serviceCode,
    schemaName,
    propsDataSourceType: dataSourceType,
    ref: positiveRef,
  };

  type IFooterCom = (
    okBtn: React.ReactElement,
    cancelBtn: React.ReactElement
  ) => React.ReactElement;
  const footerCom: IFooterCom = (okBtn, cancelBtn) => (
    <div className={globalStyles['model-footer']}>
      {cancelBtn}
      {step !== 0 && (
        <Button
          onClick={async () => {
            setStep(step - 1);
          }}
        >
          上一步
        </Button>
      )}
      {step === 1 && okBtn}
      {step !== 2 && (
        <Button
          color={ButtonColor.primary}
          onClick={async () => {
            const baseData =
              step === 0
                ? await positiveTableProps?.ref?.current?.baseTableSave()
                : await positiveTableProps?.ref?.current?.fieldTableSave();
            if (baseData) {
              setStep(step + 1);
            }
          }}
        >
          下一步
        </Button>
      )}
      {step === 2 && okBtn}
    </div>
  );

  const childrenCom = (
    <div style={{ height: '417px' }}>
      <div className={globalStyles['model-body']} style={{ height: '50px' }}>
        <Steps current={step}>
          {stepsArr.map((i) => (
            <Step title={i.title} />
          ))}
        </Steps>
      </div>
      <PositiveTable step={step} {...positiveTableProps} />
    </div>
  );
  const upPositiveData = () => {
    positiveModal.update({
      children: childrenCom,
      footer: footerCom,
    });
  };
  useEffect(() => {
    upPositiveData();
  }, [step]);

  const handleSave = async () => {
    const baseData = await positiveTableProps.ref.current.baseTableSave();
    const firstData = await positiveTableProps.ref.current.fieldTableSave();
    const secondData = await positiveTableProps.ref.current.indexTableSave();
    if (baseData && firstData && secondData) {
      const body = {
        name: baseData[0]?.name,
        description: baseData[0]?.description,
        serviceCode: serviceCode || baseData[0]?.serviceCode,
        schemaName: schemaName || baseData[0]?.schemaName,
        dataSourceType: dataSourceType || baseData[0]?.dataSourceType,
        tableColumns: firstData || [],
        tableIndexes: secondData || [],
      }; // 组装数据
      const res = await createTableService({ body });
      if (res && res.failed) {
        notification.error({
          message: '错误',
          description: res.message,
        });
      } else {
        const leftMenuDsQuery =
          viewType === 'serviceView'
            ? menuSelectRef.current?.leftMenuDsQuery
            : baseLabelMenuRef.current?.leftMenuDsQuery;
        const modelObj = await leftMenuDsQuery({});
        const obj =
          viewType === 'serviceView' ? modelObj?.[0]?.children?.[0]?.children?.[0] : modelObj?.[0];
        if (obj) {
          runInAction(() => {
            setDataStore(
              'refDataSourceType',
              modelObj?.[0]?.children?.[0]?.children?.[0]?.dataSourceType
            );
            setDataStore('refDataSourceType', obj?.dataSourceType);
            setDataStore('tableType', obj?.type);
            setDataStore('tableId', obj?.id);
            setDataStore('tableName', obj?.name);
            setDataStore('createTableFlag', +obj?.createTableFlag);
            setDataStore('editTableFlag', +obj?.editTableFlag);
          });
        }
        setDataStore('activeTabKey', 'defaultTab'); // 默认定位到表字段
        notification.success({
          message: '提示',
          description: '新建成功',
        });
        const t = setTimeout(() => {
          positiveModal.close();
          clearTimeout(t);
        });
        return true;
      }
    }
    return false;
  }; // 保存

  const handleClose = () => {
    isSubmitOkRef.current = null;
  };
  const openPositiveModal = () => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    setStep(0);
    positiveModal = Modal.open({
      lowcodeSize: 'biggest',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>正向建表</div>,
      key: positiveModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: childrenCom,
      footer: footerCom,
      onOk: handleSave,
      okText: '完成',
      cancelText: '取消',
      afterClose: handleClose,
    });
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {serviceCode ? (
        <React.Fragment>
          <ImgIcon name="create-3@2x.png" size={14} style={{ width: 18, marginRight: '0.1rem' }} />
          <div>正向建表</div>
        </React.Fragment>
      ) : (
        <div onClick={openPositiveModal}>
          <ImgIcon name="Create table@v4.0.svg" size={14} style={{ width: 18 }} />
          <a style={{ color: '#29BECE' }}>正向建表</a>
        </div>
      )}
    </div>
  );
});
