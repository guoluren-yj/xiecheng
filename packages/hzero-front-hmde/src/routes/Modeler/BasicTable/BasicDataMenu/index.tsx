import React, {
  useRef,
  useState,
  useContext,
  useImperativeHandle,
  useMemo,
  useEffect,
} from 'react';
import { Tooltip, Radio } from 'choerodon-ui';
import { Icon, TextField, Select, Form, DataSet, Button, Spin } from 'choerodon-ui/pro';
import { Size } from 'choerodon-ui/pro/lib/core/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
// img
import activeForwardImg from '@/assets/icon/forward@2x.png';
import activeScanImg from '@/assets/icon/reverse@2x.png';
import activeRedundancyImg from '@/assets/icon/redundancy-2@2x.png';
import redundancyImg from '@/assets/icon/redundancy-2-g@2x.png';
import scanImg from '@/assets/icon/scanning-g@2x.png';
import forwardImg from '@/assets/icon/forward-g@2x.png';
import exclusiveImg from '@/assets/icon/exclusiveImg.svg';
import activeExclusiveImg from '@/assets/icon/exclusiveImg_active.svg';
import ImgIcon from '@/utils/ImgIcon';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import { requestMethodList, HZERO_HMDE } from '@/utils/config';
import ViewType from '@/routes/Modeler/component/ViewType';
import Modal from '@/components/LowcodeModal';
import Lov from '@/components/LowcodeLov';
import { lowcodeOrganizationURL } from '@/utils/common';
import { saveApiInfo } from '@/services/modelBaseService';

import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';

import useModalMain from '@/routes/Modeler/hooks/useModalMain';
import { TagsScreen } from '@/routes/Modeler/hooks/tags';
import TableStructureMenu from './TableStructureMenu';
import LabelViewMenu from './TableStructureMenu/LabelViewMenu';
import ApiStructureMenu from './ApiStructureMenu';
import BatchModel from '../BatchModel';
import AddTableModel from './TableStructureMenu/AddTableModel';
import styles from '../index.less';
import { TargetType } from '@/globalData/common';

import TableDataSet from '../stores/TableDataSet';

interface IButtonsData {
  src: string;
  activeSrc: string;
  active: boolean;
  value: string;
  text: string;
  push?: any;
}
const { Option } = Select;
const modelModalKey = Modal.key();

const isTenantRole = isTenantRoleLevel();

const Index = () => {
  const {
    ref: { menuSelectRef, apiMenuRef, basicDataMenuRef, baseLabelMenuRef },
    setDataStore,
    globalLoading,
    resetApiDetail,
    resetTableDetail,
    storeData: { pageType, viewType, level, isLeftShowMenu, labelCodeList },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;

  useImperativeHandle(basicDataMenuRef, () => ({
    handleInputClean,
  }));

  const leftMenuDs = useMemo(() => new DataSet(TableDataSet(viewType)), [viewType]);

  const buttonsConfig = [
    {
      src: forwardImg,
      activeSrc: activeForwardImg,
      active: false,
      value: 'POSITIVE',
      text: '正向',
    },
    { src: scanImg, activeSrc: activeScanImg, active: false, value: 'REVERSE', text: '扫描' },
    {
      src: redundancyImg,
      activeSrc: activeRedundancyImg,
      active: false,
      value: 'REDUNDANT',
      text: '共享扩展',
    },
    {
      src: exclusiveImg,
      activeSrc: activeExclusiveImg,
      active: false,
      value: 'REDUNDANT_X',
      text: '独享扩展',
    },
  ];
  useEffect(() => {
    setButtonsData(buttonsConfig);
  }, [level]);

  const searchValueRef: any = useRef('');
  const [refreshMenuLoading, setRefreshMenuLoading] = useState<boolean>(false);
  const [buttonsData, setButtonsData] = useState<IButtonsData[]>(buttonsConfig); // 过滤树形结构按钮
  const [expendsAll, setExpendsAll] = useState<boolean>(false);

  const { openTagsManagerModal } = useModalMain();

  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'api',
            type: FieldType.object,
            label: '选择API',
            required: true,
            lovCode: isTenantRole ? 'HMDE.EXTERNAL_API' : 'HMDE.EXTERNAL_API.SITE',
            dynamicProps: {
              lovPara: ({ dataSet }) => ({ serviceCode: dataSet.queryParameter.serviceCode }),
            },
            lovQueryAxiosConfig: {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/apis/external-api/page`,
              method: 'GET',
            },
            cascadeMap: { serviceCode: 'serviceCode.serviceCode' },
          },
          {
            name: 'serviceCode',
            type: FieldType.object,
            required: true,
            lovCode: isTenantRole ? 'HMDE.SERVICE' : 'HMDE.SERVICE.SITE',
            label: '选择服务',
          },
        ],
      }),
    []
  );

  /**
   * 刷新所有服务
   * @param {Number} delay 节流控制时间
   */
  const refresh = async (delay) => {
    setRefreshMenuLoading(true);
    const timer = setTimeout(() => {
      clearTimeout(timer);
      handleSearch(searchValueRef.current);
      setRefreshMenuLoading(false);
    }, delay);
  };

  /**
   * 表结构|api结构切换
   * @param {Object} e 原生事件对象
   */
  const handleTabChange = (e) => {
    setDataStore('pageType', e.target.value);
    setDataStore('labelCodeList', '');
    searchValueRef.current = '';
    resetApiDetail();
    resetTableDetail();
  };

  const handleButtonClick = async (index) => {
    const buttons = [...buttonsData];
    buttons[index].active = !buttons[index].active;
    const arr: any = [];
    const flag1 = buttons.every((item) => item.active === false);
    const flag2 = buttons.every((item) => item.active === true);
    buttons.forEach((ele) => {
      if (flag1 || flag2) {
        arr.push(ele.value);
      } else if (ele.active) {
        arr.push(ele.value);
      }
    });
    setButtonsData(buttons);
    if (viewType === 'serviceView') {
      // eslint-disable-next-line no-unused-expressions
      menuSelectRef.current?.handleFilleter(arr);
    } else {
      // eslint-disable-next-line no-unused-expressions
      baseLabelMenuRef.current?.handleFilleter(arr);
    }
  };

  /**
   * 输入框清空重新查询
   */
  const handleInputClean = () => {
    searchValueRef.current = '';
    handleSearch('');
    setDataStore('tableId', null);
    setDataStore('tableName', null);
    setDataStore('tableType', null);
  };

  // 搜索
  const handleSearch = (val) => {
    if (pageType === 'baseTable') {
      // eslint-disable-next-line no-unused-expressions
      if (viewType === 'labelView') {
        baseLabelMenuRef.current.leftMenuDsQuery({ name: !isEmpty(val?.trim()) ? val : '' });
      } else {
        // eslint-disable-next-line no-unused-expressions
        menuSelectRef.current?.findTreeNodePathByName?.(!isEmpty(val?.trim()) ? val : '');
      }
    } else if (pageType === 'api') {
      // eslint-disable-next-line no-unused-expressions
      apiMenuRef.current?.findMenuItemByName(!isEmpty(val?.trim()) ? val : '');
    }
  };

  const menuTagsScreenQuery = async (params: any) => {
    if (viewType === 'labelView') {
      await baseLabelMenuRef.current?.leftMenuDsQuery(params);
    } else {
      await menuSelectRef.current?.leftMenuDsQuery(params);
    }
  };

  const apiTagsScreenQuery = async (params: any) => {
    if (apiMenuRef.current) {
      await apiMenuRef.current.leftMenuDsQuery(params);
    }
  };

  const handleViewTypeChange = (value) => {
    setDataStore('viewType', value);
    resetApiDetail(); // 清api表结构缓存
    resetTableDetail(); // 清接基础表结构缓存
  };

  const tableStructureMenuProps = {
    // buttonsData,
    leftMenuDs,
    searchName: searchValueRef.current,
  };

  const labelViewMenuProps = {
    leftMenuDs,
    searchName: searchValueRef.current,
  };

  const apiStructureMenuProps = { val: searchValueRef.current };

  const viewTypeProps = {
    viewType,
    onchange: handleViewTypeChange,
  };

  // 展开/收起
  const handelExpendAndClose = async () => {
    setExpendsAll(!expendsAll);
    if (pageType === 'baseTable') {
      if (expendsAll) {
        await menuSelectRef.current.handleExpandedCloseAll();
      } else {
        await menuSelectRef.current.handleExpandedOpenAll();
      }
    } else if (pageType === 'api') {
      if (expendsAll) {
        apiMenuRef.current.expendsAndCloseAll('closeAll');
      } else {
        apiMenuRef.current.expendsAndCloseAll('openAll');
      }
    }
  };

  // 打开创建API结构模态框
  const handleAddApi = () => {
    Modal.open({
      lowcodeSize: 'small',
      title: '创建API结构',
      key: modelModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: (
        <Form dataSet={ds}>
          <Lov name="serviceCode" clearButton={false} noCache />
          <Lov name="api" clearButton={false} noCache />
        </Form>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: handleOk,
      afterClose: handleAfterClose,
    });
  };

  const handleOk = async () => {
    // 保存数据 并触发菜单查询 详情查询
    const flag = await ds.validate();
    if (flag && ds.current) {
      const value = ds.current.get('api');
      const res = await saveApiInfo(value);
      if (res && res.failed) {
        notification.error({ message: '错误', description: res.message });
        return false;
      }
      if (apiMenuRef.current) {
        apiMenuRef.current.leftMenuDsQuery();
      }
      ds.reset();
      setDataStore('apiCode', res.apiCode);
      setDataStore('apiId', res.apiId);
    } else {
      return false;
    }
  };

  const handleAfterClose = async () => {
    ds.reset();
  };

  const addTableModelProps = {
    setDataStore,
    serviceCode: undefined,
  };

  const ExpendAndRefresh = () => {
    return (
      <div className={styles['view-type-top']}>
        <span style={{ color: '#E2E2E6' }}>|</span>
        {/* 全展开收起 */}
        {viewType === 'serviceView' && (
          <Tooltip title="数据过多时全展开会有渲染卡顿，谨慎操作">
            <a
              className={`${styles['expend-all']} ${styles['lowcode-aTag']}`}
              onClick={handelExpendAndClose}
            >
              <ImgIcon
                size={16}
                name={expendsAll ? 'fullspread.svg' : 'putitallaway.svg'}
                style={{ margin: '0px 4px' }}
              />
            </a>
          </Tooltip>
        )}
        <div className={styles['refresh-expend']}>
          {/* 刷新菜单 */}
          <span className={styles.refresh}>
            {refreshMenuLoading ? (
              <span>
                <Spin size={Size.small} className={globalStyles['spin-small']} />
              </span>
            ) : (
              <span onClick={() => refresh(500)}>
                <Tooltip placement="top" title="刷新">
                  <ImgIcon name="refresh.svg" size={16} />
                </Tooltip>
              </span>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ display: isLeftShowMenu ? 'flex' : 'none' }}
      className={`${styles['list-menu']} ${styles['basic-list-menu']}`}
    >
      <div className={styles['top-wrapper']}>
        <div className={styles['view-type-top']}>
          {/* 视图分类 */}
          {(level === 'tenant' || isTenantRole) && <ViewType {...viewTypeProps} />}
        </div>
        <div className={styles['page-type-top']}>
          <Radio.Group
            className={styles['radio-group-style']}
            value={pageType}
            onChange={handleTabChange}
          >
            <Tooltip placement="top" title="表结构">
              <Radio.Button value="baseTable">
                {pageType === 'baseTable' ? (
                  <ImgIcon
                    style={{ margin: '0 4px' }}
                    name="Table model-Highlight@v4.0.svg"
                    size={16}
                  />
                ) : (
                  <ImgIcon style={{ margin: '0 4px' }} name="Table model@v4.0.svg" size={16} />
                )}
                <span style={{ color: pageType === 'baseTable' ? '#29BECE' : '#5a6677' }}>
                  表结构
                </span>
              </Radio.Button>
            </Tooltip>
            <Tooltip placement="top" title="API结构">
              <Radio.Button value="api">
                {pageType === 'api' ? (
                  <ImgIcon
                    style={{ margin: '0 4px' }}
                    name="API structure-Highlight@v4.0.svg"
                    size={16}
                  />
                ) : (
                  <ImgIcon style={{ margin: '0 4px' }} name="API structure@v4.0.svg" size={16} />
                )}
                <span style={{ color: pageType === 'api' ? '#29BECE' : '#5a6677' }}>API结构</span>
              </Radio.Button>
            </Tooltip>
          </Radio.Group>
        </div>
        {/* 批量生成模型&正向建表 */}
        <div className={styles['add-batch']} style={{ height: '45px' }}>
          {pageType === 'baseTable' && (
            <React.Fragment>
              <AddTableModel {...addTableModelProps} />
              {/* <span style={{ color: '#E2E2E6' }}>|</span> */}
              <BatchModel />
            </React.Fragment>
          )}
          <ExpendAndRefresh />
        </div>
        {/* 基础结构|api搜索框 */}
        {pageType === 'baseTable' ? (
          <div className={styles['c7n-pro-base-table-filter']}>
            <TextField
              value={searchValueRef.current}
              style={{ width: '228px' }}
              onInput={(e: any) => {
                searchValueRef.current = (e.target as any).value?.trim();
              }}
              suffix={
                <ImgIcon
                  onClick={() => handleSearch(searchValueRef.current)}
                  name="search@v4.0.svg"
                  size={14}
                />
              }
              placeholder="请输入表名"
              onChange={(data) => handleSearch(data)}
            />
            {viewType !== 'serviceView' && (
              <>
                {' '}
                <Tooltip title="标签管理" placement="top">
                  <ImgIcon
                    name="TagsManager.svg"
                    size={16}
                    style={{ margin: '0 4px', cursor: 'pointer' }}
                    onClick={() => openTagsManagerModal({ callback: handleSearch })}
                  />
                </Tooltip>
                <TagsScreen
                  menuTagsScreenQuery={(list) => {
                    setDataStore('labelCodeList', list);
                    menuTagsScreenQuery({ labelCodeList: list });
                  }}
                  type={TargetType.STRUCTURE_TABLE}
                  labelCodes={labelCodeList}
                />
              </>
            )}
          </div>
        ) : (
          <div className={styles['c7n-pro-base-table-filter']}>
            <Select
              placeholder="全部"
              value={apiMenuRef.current?.selectedVal}
              onChange={apiMenuRef.current?.filterItem}
              suffix={<Icon type="expand_more" />}
            >
              {(requestMethodList || []).map((item) => (
                <Option key={item} value={item.toLowerCase()}>
                  {item}
                </Option>
              ))}
            </Select>
            <TextField
              value={apiMenuRef.current?.inputVal}
              // style={{ width: '240px' }}
              onChange={(val) => {
                apiMenuRef.current.inputVal = val;
              }}
              suffix={
                searchValueRef.current && (
                  <Icon
                    type="close"
                    style={{ color: 'black', cursor: 'pointer' }}
                    onClick={handleInputClean}
                  />
                )
              }
              placeholder="请输入接口路径名"
              onEnterDown={(e) =>
                apiMenuRef.current?.findMenuItemByName((e.target as any)?.value?.trim())
              }
            />
            {viewType !== 'serviceView' && (
              <Tooltip title="标签管理" placement="top">
                <span>
                  <ImgIcon
                    name="TagsManager.svg"
                    size={16}
                    style={{ cursor: 'pointer', marginLeft: '4px' }}
                    onClick={() => openTagsManagerModal({ callback: handleSearch })}
                  />
                </span>
              </Tooltip>
            )}
            {viewType !== 'serviceView' && (
              <TagsScreen
                menuTagsScreenQuery={(list) => {
                  setDataStore('labelCodeList', list);
                  apiTagsScreenQuery({ labelCodeList: list });
                }}
                labelCodes={labelCodeList}
                type={TargetType.STRUCTURE_API}
              />
            )}
            {viewType !== 'serviceView' && (
              <Tooltip title="新建API">
                <span>
                  <Icon
                    type="add"
                    onClick={handleAddApi}
                    style={{
                      marginLeft: '4px',
                      verticalAlign: 'sub',
                      color: 'rgb(90, 102, 119)',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        )}
        {pageType === 'baseTable' && (
          <div className={styles['control-buttons']}>
            {buttonsData.map((ele, index) => (
              <Button
                disabled={globalLoading}
                funcType={FuncType.flat}
                className={ele.active ? `${styles.active}` : ''}
                onClick={() => handleButtonClick(index)}
              >
                <img src={ele.active ? ele.activeSrc : ele.src} alt="" />
                {ele.text}
              </Button>
            ))}
          </div>
        )}
      </div>
      {/* 基础结构菜单 */}
      {pageType === 'baseTable' && viewType === 'serviceView' && (
        <TableStructureMenu {...tableStructureMenuProps} />
      )}
      {pageType === 'baseTable' && viewType === 'labelView' && (
        <LabelViewMenu {...labelViewMenuProps} />
      )}
      {/* api结构菜单 */}
      {pageType === 'api' && <ApiStructureMenu {...apiStructureMenuProps} />}
      <div
        className={styles['collapse-handle']}
        style={{ display: !isLeftShowMenu ? 'none' : 'flex' }}
        onClick={() => setDataStore('isLeftShowMenu', false)}
      >
        <ImgIcon name="fold.svg" size={8} />
      </div>
    </div>
  );
};

export default observer(Index);
