import React, { useMemo, useContext, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer, Observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import Modal from '@/components/LowcodeModal';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import { saveAllAssignedTable } from '@/services/modelBaseService';

import { leftDs, rightDs } from './DistributeTableDS';
import ModalTable from './ModalTable';
import SearchForm from './SearchForm';
import styles from '../../index.less';

// 静态数据
const modelModalKey = Modal.key();

const Distribute = (props) => {
  const {
    storeData: { tenantName, tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const leftTableDS: DataSet = useMemo(() => new DataSet(leftDs()), []);
  const rightTableDS: DataSet = useMemo(() => new DataSet(rightDs()), []);
  const leftCompleteData: any = useRef([]); // 可用表缓存数据
  const rightCompleteData: any = useRef([]); // 已分配表缓存数据

  // 移动表
  const handleMoveTable = (beforeDs: DataSet, afterDs: DataSet, type) => {
    const beforeRef = type === 'left' ? leftCompleteData : rightCompleteData;
    const afterRef = type === 'left' ? rightCompleteData : leftCompleteData;
    let beforeData = beforeDs.toData();
    const selectedTableCodeList: string[] = [];
    beforeData = beforeData.filter(
      (i: any) => !beforeDs.selected.some((record: any) => record?.data?.tableCode === i?.tableCode)
    );
    beforeDs.selected.forEach((i: any) => {
      afterDs.create(i.toData(), 0);
      // 更新缓存
      selectedTableCodeList.push(i.data.tableCode);
      afterRef.current.push(i.toData());
    });
    beforeDs.loadData(beforeData);
    // 更新缓存
    beforeRef.current = beforeRef.current.filter(
      (i) => !selectedTableCodeList.includes(i.tableCode)
    );
  };

  // 保存分配表
  const handleOk = async () => {
    const params = {
      query: {
        tenantId,
        dataSourceId: props.dataSourceId,
      },
      body: rightCompleteData.current,
    };
    const res = await saveAllAssignedTable(params);
    if (!res || res.failed) {
      notification.error({ message: '错误', description: res.message });
      return false;
    }
    // eslint-disable-next-line no-unused-expressions
    props?.init?.({});
    notification.success({ message: '提示', description: '操作成功' });
    return true;
  };

  // 根据表名称或描述过滤
  const filterTable = (ds, param, type) => {
    const fullData = type === 'left' ? leftCompleteData.current : rightCompleteData.current;
    const newData = fullData?.filter?.(
      (i) => i?.name?.indexOf?.(param) > -1 || i?.description?.indexOf?.(param) > -1
    );
    ds.loadData(newData);
  };

  // 表单查询
  const handleSearch = (val) => {
    if (isEmpty(leftCompleteData.current)) {
      leftCompleteData.current = leftTableDS.toData();
    }
    if (isEmpty(rightCompleteData.current)) {
      rightCompleteData.current = rightTableDS.toData();
    }
    if (!val) {
      leftTableDS.loadData(leftCompleteData.current);
      rightTableDS.loadData(rightCompleteData.current);
    } else {
      filterTable.bind(null, leftTableDS, val, 'left')();
      filterTable.bind(null, rightTableDS, val, 'right')();
    }
  };

  // 初始化刷新缓存
  const refreshCompleteData = (res: model.DataBaseAssign[], type) => {
    if (type === 'left') {
      leftCompleteData.current = res;
    } else {
      rightCompleteData.current = res;
    }
  };

  const leftTableProps = {
    tenantId,
    type: 'left',
    refreshCompleteData,
    dataSet: leftTableDS,
    dataSourceId: props.dataSourceId,
  };

  const rightTableProps = {
    tenantId,
    type: 'right',
    refreshCompleteData,
    dataSet: rightTableDS,
    dataSourceId: props.dataSourceId,
  };

  const searchFormProps = {
    serviceCode: props.serviceCode,
    schemaName: props.schemaName,
    dataSourceType: props.dataSourceType,
    handleSearch,
  };

  const childrenCom = (
    <React.Fragment>
      <SearchForm {...searchFormProps} />
      <div className={styles['permission-table-wrapper']}>
        <div className={styles['all-basic-table']}>
          <h4>基础表</h4>
          <ModalTable {...leftTableProps} />
        </div>
        <Observer>
          {() => (
            <div className={styles['move-buttons']}>
              <div>
                <span
                  className={`${styles['navigate-next']} ${
                    leftTableDS.selected.length && styles['navigate-next-light']
                  }`}
                  onClick={() => handleMoveTable(leftTableDS, rightTableDS, 'left')}
                >
                  <Icon type="navigate_next" />
                </span>
              </div>
              <div>
                <span
                  className={`${styles['navigate-before']}  ${
                    rightTableDS.selected.length && styles['navigate-before-light']
                  }`}
                  onClick={() => handleMoveTable(rightTableDS, leftTableDS, 'right')}
                >
                  <Icon type="navigate_before" />
                </span>
              </div>
            </div>
          )}
        </Observer>
        <div className={styles['used-basic-table']}>
          <h4
            style={{
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            可用基础表
          </h4>
          <ModalTable {...rightTableProps} />
        </div>
      </div>
    </React.Fragment>
  );

  const handleAfterClose = () => {};
  // 权限分配
  const openDistributeModal = () => {
    Modal.open({
      lowcodeSize: 'big',
      title: (
        <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>
          {`${tenantName}租户的物理模型授权`}
        </div>
      ),
      key: modelModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: childrenCom,
      okText: '确认',
      cancelText: '取消',
      onOk: handleOk,
      afterClose: handleAfterClose,
    });
  };
  return (
    <Button funcType={FuncType.flat} style={{ color: '#29bece' }} onClick={openDistributeModal}>
      权限分配
    </Button>
  );
};
export default observer((props: any) => <Distribute {...props} />);
