import React, { useContext, useEffect, useState, useRef, useImperativeHandle } from 'react';
import { DataSet, CheckBox, Spin } from 'choerodon-ui/pro';
import { Menu, Tooltip, Dropdown } from 'choerodon-ui';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { Size } from 'choerodon-ui/pro/lib/core/enum';
import { isTenantRoleLevel } from 'utils/utils';

import ImgIcon from '@/utils/ImgIcon';
import Modal from '@/components/LowcodeModal';
import { TargetType } from '@/globalData/common';
import { useRequestPro } from '@/routes/Modeler/hooks';
import SmallPagination from '@/routes/Modeler/component/SmallPagination';
import useModalMain, { IData } from '@/routes/Modeler/hooks/useModalMain';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import { tableDeleteService, tableRefresh } from '@/services/modelBaseService';
import globalStyles from '@/lowcodeGlobalStyles/global.less';

import BatchModel from '../../BatchModel';
import { SingleTagDistribute, MenuListLabels } from '../../../hooks/tags';
import styles from '../../index.less';

const { Item } = Menu;
const { confirm } = Modal;
interface ILabelViewMenu {
  leftMenuDs: DataSet;
  searchName: string;
}
const pageParams = {
  page: 1,
  pageSize: 10,
  total: 0,
};
const LabelViewMenu = observer(({ leftMenuDs, searchName }: ILabelViewMenu) => {
  const isTenantRole = isTenantRoleLevel();
  // 同步
  const [, refreshLoading, refreshRun] = useRequestPro(tableRefresh);
  const {
    globalLoading,
    ref: { baseTableDetailRef, indexTableDetailRef, baseLabelMenuRef },
    setDataStore,
    storeData: { _tenantId, level, viewType, labelCodeList },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const { openTagsDistributionModal } = useModalMain();
  const pageObjRef: any = useRef(pageParams);
  const isSubmitOkRef: any = useRef(null);
  const [checkedNodes, setCheckedNodes] = useState<IData[]>([]);
  const [startBatchCheckFlag, setStartBatchCheckFlag] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  useImperativeHandle(baseLabelMenuRef, () => ({
    handleFilleter,
    leftMenuDsQuery,
  }));

  useEffect(() => {
    setCheckedNodes([]);
  }, [_tenantId]);

  useEffect(() => {
    // 初始化查询
    if (viewType === 'labelView') {
      init();
    }
  }, [viewType, _tenantId]);

  const init = () => {
    leftMenuDsQuery({});
  };
  interface IParams {
    name?: string;
    page?: number;
    size?: number;
    isResetPage?: boolean;
    labelCodeList?: any[];
    tableTypeList?: string[];
  }
  type ILeftMenuQuery = (param: IParams) => any; // fixme
  const leftMenuDsQuery: ILeftMenuQuery = async (params = {}) => {
    const {
      isResetPage = true, // 是否重置分页 处理分液器上一页下一页不需要重置 其他查询均需重置第一页
      name = searchName,
      page = 1,
      size = 20,
      tableTypeList = '',
      labelCodeList: labelList = labelCodeList,
    } = params;
    const _page = isResetPage ? 1 : page;
    leftMenuDs.setQueryParameter('labelCodeList', labelList);
    leftMenuDs.setQueryParameter('page', _page - 1);
    leftMenuDs.setQueryParameter('size', size);
    if (!isEmpty(tableTypeList)) {
      leftMenuDs.setQueryParameter('tableTypeList', tableTypeList.toString());
    }
    leftMenuDs.setQueryParameter('name', name);

    setDataStore('globalLoading', true, true);
    const data = await leftMenuDs.query();
    setDataStore('globalLoading', false, true);
    pageObjRef.current = {
      page: data.number + 1,
      pageSize: data.size,
      total: data.totalElements,
    };
    setDataSource(data?.content || []);
    return data?.content || [];
  };

  /**
   * 单表同步
   */
  const handelTableSynchronization = async (nodeData) => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    Modal.warning({
      lowcodeSize: 'small',
      title: (
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.647058823529412)',
            fontWeight: 700,
          }}
        >
          同步警告
        </span>
      ),
      children: (
        <div>
          <p>
            同步将会覆盖原先的信息，<span style={{ color: '#1890FF' }}>您要继续同步吗？</span>
          </p>
        </div>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
    }).then(async (button) => {
      isSubmitOkRef.current = null;
      if (button === 'ok') {
        const res = await (refreshRun as any)?.(nodeData.id);
        if (typeof res === 'object') {
          notification.success({
            message: '同步成功！',
          } as any);
          setDataStore('tableType', nodeData.type);
          setDataStore('tableId', nodeData.id);
          setDataStore('tableName', nodeData.name);
          if (
            baseTableDetailRef &&
            baseTableDetailRef.current &&
            baseTableDetailRef.current.baseTableDetailRefresh
          ) {
            ((baseTableDetailRef || {}).current || {}).baseTableDetailRefresh();
          }
          if (
            indexTableDetailRef &&
            indexTableDetailRef.current &&
            indexTableDetailRef.current.indexTableDetailRefresh
          ) {
            ((indexTableDetailRef || {}).current || {}).indexTableDetailRefresh();
          }
          leftMenuDsQuery({ name: '' });
        } else {
          notification.error({
            message: '错误',
            description: res.message,
          });
        }
      }
    });
  };

  /**
   * 删除
   */
  const handelDeleteTable = async (nodeData) => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    const flag = (await confirm('您确定要删除吗？', 'small')) === 'ok';
    isSubmitOkRef.current = null;
    if (!flag) return;
    const res = await tableDeleteService({ body: nodeData });
    if (res && res.failed) {
      notification.error({
        message: '错误',
        description: res.message,
      });
    } else {
      notification.success({
        message: '删除成功！',
      } as any);
      setDataStore('tableName', null);
      leftMenuDsQuery({ name: '' });
    }
  };

  /**
   * 设置菜单选项Item样式
   * @param {Object} item
   * @param {Object} parentNode
   */
  const SetItemStyle = ({ item }: { item: any }): JSX.Element => {
    const [visible, setVisible] = useState<boolean>(false); // 下拉菜单显示
    const [curNode, setCurNode] = useState<string>('');
    // fixme
    const isPositive =
      item.type === 'POSITIVE' || item.type === 'REDUNDANT' || item.type === 'REDUNDANT_X'; // 是否正向见表
    const isRedundant = item.type === 'REDUNDANT' || item.type === 'REDUNDANT_X'; // 是否扩展

    const editMoreColumn = (
      <Menu>
        {isPositive && item.editTableFlag && (
          <Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
              handelDeleteTable({ ...item, grade: 'table' });
            }}
          >
            <ImgIcon
              name="delete-black.svg"
              size={16}
              style={{ width: 18, marginRight: '0.1rem' }}
            />
            <span>删除</span>
          </Item>
        )}
        {!isTenantRole && level !== 'tenant' && !isPositive && (
          <Item
            onClick={
              refreshLoading
                ? () => {}
                : (e) => {
                    if (e && e.domEvent) {
                      e.domEvent.stopPropagation();
                    }
                    handelTableSynchronization(item);
                  }
            }
          >
            {refreshLoading ? (
              <Spin
                size={Size.small}
                className={globalStyles['spin-small']}
                style={{ marginRight: '10px' }}
              />
            ) : (
              <Tooltip placement="top" title="同步单表">
                <ImgIcon
                  name="synchronize.svg"
                  size={16}
                  style={{ width: 18, marginRight: '0.1rem' }}
                />
              </Tooltip>
            )}
            <span>同步单表</span>
          </Item>
        )}
        {!isRedundant && (
          <Menu.Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
            }}
          >
            <BatchModel tableObj={item} />
          </Menu.Item>
        )}
        {(isTenantRole || level === 'tenant') && (
          <Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
            }}
          >
            <SingleTagDistribute
              code={item?.code}
              type={TargetType.STRUCTURE_TABLE}
              leftMenuDsQuery={leftMenuDsQuery}
            >
              <ImgIcon name="Tags.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
              <span>分配标签</span>
            </SingleTagDistribute>
          </Item>
        )}
      </Menu>
    );

    return (
      <div className={styles['menu-left-list-item']}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            userSelect: startBatchCheckFlag ? 'none' : 'auto',
          }}
          onMouseEnter={() => setCurNode(`${item?.name}&${item?.type}&${item?.code}`)}
          onMouseLeave={() => setCurNode('')}
        >
          <CheckBox
            value={`${item.name}&${item.type}&${item.code}`}
            checked={!!checkedNodes.find((n) => n.code === item.code)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={onmousedown}
            onMouseUp={onmouseup}
            onMouseEnter={(e) => {
              if (startBatchCheckFlag) {
                mouseoverChecked(e);
              }
            }}
          />
          {item.type === 'REVERSE' && (
            <Tooltip title="反向扫描">
              <ImgIcon name="reverse@2x.png" size={12} style={{ margin: '0 6px' }} />
            </Tooltip>
          )}
          {item.type === 'POSITIVE' && (
            <Tooltip title="正向建表">
              <ImgIcon name="forward@2x.png" size={12} style={{ margin: '0 6px' }} />
            </Tooltip>
          )}
          {item.type === 'REDUNDANT' && (
            <Tooltip title="共享扩展">
              <ImgIcon name="redundancy-2@2x.png" size={12} style={{ margin: '0 6px' }} />
            </Tooltip>
          )}
          {item.type === 'REDUNDANT_X' && (
            <Tooltip title="独享扩展">
              <ImgIcon name="exclusiveImg_active.svg" size={12} style={{ margin: '0 6px' }} />
            </Tooltip>
          )}
          <Tooltip title={item?.name}>
            <i className={styles['menu-left-list-font']}>
              <span>{item?.name}</span>
            </i>
          </Tooltip>
          <MenuListLabels labelAssignList={item?.labelAssignList} />
          <Dropdown
            visible={curNode === `${item?.name}&${item?.type}&${item?.code}` && visible}
            onVisibleChange={(vis) => setVisible(!!vis)}
            trigger={[Action.hover]}
            overlay={editMoreColumn}
          >
            <ImgIcon name="more-options.svg" size={14} style={{ marginRight: 3 }} />
          </Dropdown>
        </div>
      </div>
    );
  };

  const onCheck = (val, oldValue) => {
    if (val) {
      const [name, type, code] = val.split('&');
      setCheckedNodes([...checkedNodes, { name, type, code }]);
    } else {
      setCheckedNodes([...checkedNodes].filter(({ code }) => code !== oldValue.split('&')?.[2]));
    }
  };

  const onmousedown = (e) => {
    setStartBatchCheckFlag(true);
    if (navigator.userAgent.indexOf('Firefox') === -1) {
      mouseoverChecked(e);
    }
  };

  const mouseoverChecked = (e) => {
    const _value = e.target?.value;
    if (_value && checkedNodes.find((n) => Object.values(n)?.join('&') === _value)) {
      onCheck(false, _value);
    } else {
      onCheck(_value, false);
    }
  };

  const onmouseup = () => {
    setStartBatchCheckFlag(false);
  };

  useEffect(() => {
    document.body.addEventListener('mouseup', () => setStartBatchCheckFlag(false));
    return () => {
      document.body.removeEventListener('mouseup', onmouseup);
    };
  }, [startBatchCheckFlag]);

  /**
   * 循环遍历菜单选项Item
   * @param {Array<Object>} data
   * @param {Object} parentNode 菜单根对象
   */
  const loop = (data) =>
    data.map((item) => (
      <Item
        key={`${item?.name}&${item?.type}&${item?.code}`}
        dataSourceType={item?.dataSourceType}
        tableType={item?.type}
        tableId={item?.id}
        tableName={item?.name}
        createTableFlag={item?.createTableFlag}
        editTableFlag={item?.editTableFlag}
      >
        <SetItemStyle item={item} />
        {/* {setItemStyle(item)} */}
      </Item>
    ));

  /**
   * 选中菜单回调
   * @param {*} param0
   */
  const handleSelectNode = ({ item }): void => {
    const {
      tableType,
      tableId,
      tableName,
      dataSourceType,
      createTableFlag,
      editTableFlag,
    } = item.props;
    setDataStore('refDataSourceType', dataSourceType);
    setDataStore('tableType', tableType);
    setDataStore('tableId', tableId);
    setDataStore('tableName', tableName);
    setDataStore('createTableFlag', +createTableFlag);
    setDataStore('editTableFlag', +editTableFlag);
  };

  const pageSizeChange = (page, size) => {
    leftMenuDsQuery({ page, size, isResetPage: false });
  };

  // 根据不同层级 决定正向、反向、扩展标签过滤为前后端过滤
  type IHandleFilleter = (activeButtonList: string[]) => void;
  const handleFilleter: IHandleFilleter = (activeButtonList) => {
    return new Promise((resolve, reject) => {
      leftMenuDsQuery({ tableTypeList: activeButtonList })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  return (
    <div className={`${styles['list-menu']} ${styles['authorization-list-menu']}`}>
      <Spin spinning={globalLoading} wrapperClassName={styles['menu-list-wrapper']}>
        <div className={styles['basic-menu-wrapper']}>
          <div className={styles['label-menu-wrapper']} style={{ paddingBottom: 16 }}>
            <Menu
              mode="inline"
              // multiple
              onSelect={handleSelectNode}
            >
              {loop(dataSource)}
            </Menu>
          </div>
        </div>
      </Spin>
      <div>
        <SmallPagination
          showSizeChanger
          showTotal
          showPager={false}
          showQuickJumper={false}
          showSizeChangerLabel={false}
          sizeChangerPosition={'left' as any}
          pageObj={pageObjRef.current}
          onChange={pageSizeChange}
        />
        {checkedNodes.length > 0 && (
          <div className={styles['bottom-wrapper']}>
            <div>
              <span
                onClick={() =>
                  openTagsDistributionModal({
                    data: checkedNodes,
                    type: TargetType.STRUCTURE_TABLE,
                    callback: leftMenuDsQuery,
                  })
                }
              >
                分配标签
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
export default LabelViewMenu;
