/**
 * 批量授权租户
 */
import React, { useMemo, useState, useEffect, useRef, useContext } from 'react';
import { DataSet, Radio } from 'choerodon-ui/pro';
import { List /* Icon */ } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { observer } from 'mobx-react-lite';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import Lov from '@/components/LowcodeLov';
import Modal from '@/components/LowcodeModal';
import { IData } from '@/routes/Modeler/hooks/useModalMain';

import styles from './index.less';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import ImgIcon from '@/utils/ImgIcon';

const [ALLOW_LIST, BLOCK_LIST]: string[] = ['ALLOW_LIST', 'BLOCK_LIST'];
interface IThisModel {
  update: (children: any) => void;
}
let thisModel: IThisModel = {
  update: () => {},
};
interface ITenantList {
  createdBy: number;
  creationDate: string;
  enabledFlag: boolean;
  tenantId: string;
  tenantName: string;
  tenantNum: string;
}
interface IIndex {
  dataSource: IData[];
  url?: string; // 保存路径
  title?: string;
  listName?: string;
  leftMenuQuery?: (params?: any) => void; // 参数可以是模型参数 也可以是数据对象参数 任意
}

const modelTypeToIconNameDict = {
  PREDEFINE: 'preset.svg',
  PLATFORM: 'platformprivate.svg',
  PLATFORM_SHARED: 'platformsharing.svg',
  TENANT: 'tenantcustomization.svg',
};

const Index = ({
  dataSource = [],
  url = 'data-assigns/batch',
  title = '数据对象',
  listName = 'dataObjectCodes',
  leftMenuQuery = () => {},
}: IIndex) => {
  const selectedModelType = dataSource[0].type!;

  const modelManagerStore: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const tenantListRef: any = useRef([]);
  const [tenantList, setTenantList] = useState<any[]>([]);

  const assignPatternDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            // label: '授权模式',
            name: 'assignPattern',
            type: FieldType.string,
            required: true,
            defaultValue: BLOCK_LIST,
          },
        ],
      }),
    []
  );
  const formDs: DataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          // {
          //   // label: '授权模式',
          //   name: 'assignPattern',
          //   type: FieldType.string,
          //   required: true,
          //   defaultValue: BLOCK_LIST,
          // },
          {
            // label: '授权租户',
            name: 'tenant',
            type: FieldType.object,
            required: false,
            lovCode: 'HPFM.TENANT',
            multiple: true,
          },
        ],
        transport: {
          submit: () => {
            const params = {
              // sourceCodes: dataSource.map((item: any) => item.code), // 数据对象Code们
              // logicModelCodes: dataSource.map((item: any) => item.code), // 数据对象Code们
              [listName]: dataSource.map((item: any) => item.code), // 数据对象Code们,
              // assignPattern: data?.[0]?.assignPattern, // 黑白名单模式
              assignPattern: assignPatternDs?.current?.get('assignPattern'), // 黑白名单模式
              addTenantIds: tenantListRef.current.map((item) => item.tenantId), // 新增了哪些租户ID
            };
            return {
              url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/${url}`,
              method: 'post',
              data: params,
            };
          },
        },
        events: {
          update: ({ name, value }) => {
            if (name === 'tenant') {
              handelUpdateTenant(value);
            }
          },
        },
      }),
    [tenantList, dataSource]
  );

  useEffect(() => {
    thisModel.update({
      children: childrenCom,
    });
  }, [tenantList]);

  const handelUpdateTenant = (value) => {
    const arr: ITenantList[] = value.filter(
      (item) => !tenantListRef.current.some((i: any) => i.tenantId === item.tenantId)
    );
    setTenantList([...arr, ...tenantListRef.current]);
    tenantListRef.current = [...arr, ...tenantListRef.current];
  };

  const handleOk = async () => {
    formDs.submit().then(() => {
      leftMenuQuery();
      modelManagerStore.setDataStore(
        'modelDetailRefreshSignal',
        !modelManagerStore.storeData.modelDetailRefreshSignal
      );
    });
  };

  const handelDelete = (tenantId) => {
    // 删除租户标签
    const arr = tenantListRef.current.filter((item) => item.tenantId !== tenantId);
    setTenantList(arr);
    tenantListRef.current = arr;
  };

  const childrenCom = (
    <div className={styles['batch-authorization-wrapper']}>
      <div className={styles['source-list']}>
        <h3>{`${title}列表`}</h3>
        <List
          size={Size.small}
          bordered
          dataSource={dataSource}
          renderItem={(item) => (
            <List.Item>
              <ImgIcon
                name={modelTypeToIconNameDict[selectedModelType]}
                size={16}
                style={{ marginRight: '6px' }}
              />
              {item.name}
            </List.Item>
          )}
        />
      </div>
      <div className={styles['authorization-mode']}>
        <h3 className={styles['form-label']}>授权模式</h3>
        <div>
          <Radio dataSet={assignPatternDs} name="assignPattern" key={ALLOW_LIST} value={ALLOW_LIST}>
            白名单模式
          </Radio>
          <Radio
            dataSet={assignPatternDs}
            name="assignPattern"
            key={BLOCK_LIST}
            value={BLOCK_LIST}
            style={{ marginLeft: 16 }}
          >
            黑名单模式
          </Radio>
        </div>
        {/* <h3 className={styles['form-label']}>授权租户</h3>
        <div>
          <Lov
            color="primary"
            dataSet={formDs}
            name="tenant"
            mode="button"
            clearButton={false}
            noCache
          >
            添加租户
          </Lov>
        </div>
        <div className={styles['tenant-list-wrapper']}>
          {tenantList.map((item: any) => (
            <div className={styles['tenant-box']} key={item.tenantId}>
              {item.tenantName}
              <Icon type="close" onClick={handelDelete.bind(null, item.tenantId)} />
            </div>
          ))}
        </div> */}
        <div className="add-tenants">
          <div className="title">授权租户</div>
          <Lov
            className="add-button"
            color="primary"
            dataSet={formDs}
            name="tenant"
            mode="button"
            clearButton={false}
            noCache
          >
            <div className="shape-cross" />
            添加租户
          </Lov>
        </div>
        <div className={styles['tenant-list-wrapper']}>
          <div className="header">
            <div className="name">租户名称</div>
            <div className="code">租户编号</div>
            <div className="operations">操作</div>
          </div>
          <div className="body">
            {tenantList.length === 0 && (
              <div className="empty-hint">暂无租户，请点击右上角[添加租户]按钮添加</div>
            )}
            {tenantList.map((item: any) => {
              return (
                <div className="objective-record" key={item.tenantId}>
                  <div className="name" title={item.tenantName}>
                    {item.tenantName}
                  </div>
                  <div className="code" title={item.tenantNum}>
                    {item.tenantNum}
                  </div>
                  {/* <Icon type="close" onClick={handelDelete.bind(null, item.tenantId)} /> */}
                  <ImgIcon
                    className="operations"
                    name="delete-black.svg"
                    size={14}
                    onClick={() => {
                      handelDelete(item.tenantId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const closeModal = () => {
    setTenantList([]);
    tenantListRef.current = [];
  };

  const openModal = () => {
    thisModel = Modal.open({
      lowcodeSize: 'big',
      key: Modal.key(),
      title: `${title}授权`,
      closable: true,
      border: false,
      okText: '完成',
      cancelText: '取消',
      onOk: handleOk,
      children: childrenCom,
      afterClose: closeModal,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
      onClick={openModal}
    >
      批量授权
    </div>
  );
};

export default observer(Index);
