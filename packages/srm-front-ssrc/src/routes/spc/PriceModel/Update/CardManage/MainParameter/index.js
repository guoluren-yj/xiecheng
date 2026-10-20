import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
  useImperativeHandle,
} from 'react';
import { Tabs, Icon } from 'choerodon-ui';
import {
  Form,
  TextField,
  Dropdown,
  Menu,
  Spin,
  Button,
  DataSet,
  useModal,
  Modal as C7nModal,
  useDataSet,
} from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { fetchModuleList, deleteModule, fetchAllColumns } from '@/services/priceModelService';
import { lineTableDS } from '../../store/storeDS';
import ColumnTable from './ColumnTable';
import LineTable from './LineTable';

import Store from '../../store/index';

const { TabPane } = Tabs;

export default observer(function MainParameter() {
  const Modal = useModal();

  const {
    commonRef: { countFormulaRef, mainParameterRef },
    routerParams: { modelId },
    commonDs: { columnTableDs, moduleFormDs },
  } = useContext(Store);

  const copyColumnDataRef = useRef([]);
  const moduleRecord = useRef({});

  const [moduleList, setModuleList] = useState([]);
  const [activeModuleKey, setActiveModuleKey] = useState();
  const [activityTabKey, setActivityTabKey] = useState('column');
  const [saveLoading, setSaveLoading] = useState(false);
  const [dynamicLineColumns, setDynamicLineColumns] = useState([]);

  // 先初始化lineTableDs，切换标签页时替换新实例，避免保存校验出现问题
  const defaultLineTableDs = useDataSet(() => lineTableDS({ modelId }), []);
  const [lineTableDs, setLineTableDs] = useState(defaultLineTableDs);

  useImperativeHandle(mainParameterRef, () => ({
    lineTableDs,
    activityTabKey,
  }));

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    queryModules();
  };

  useEffect(() => {
    lineTableDs.setState('fetchParamsAll', countFormulaRef.current?.fetchParamsAll);
  }, [countFormulaRef.current?.fetchParamsAll, lineTableDs]);

  // 查询模块后获取当前模块id
  const getCurrentModuleId = (data = [], operate) => {
    let currentModuleId;
    // 新增保存或删除后取最后一个模块为当前活动模块
    if (operate === 'add' || operate === 'delete') {
      currentModuleId = data[data.length - 1]?.moduleId;
    } else if (operate === 'edit') {
      // 编辑为当前活动模块
      currentModuleId = moduleRecord.current?.moduleId;
    } else {
      // 首次查询为第一个当前活动模块
      currentModuleId = data[0]?.moduleId;
    }

    return currentModuleId;
  };

  // 查询模块
  const queryModules = (operate) => {
    fetchModuleList({ modelId }).then((res) => {
      const result = getResponse(res);
      if (Array.isArray(result) && result.length > 0) {
        const currentModuleId = getCurrentModuleId(result, operate);

        setModuleList(result);
        setActiveModuleKey(currentModuleId);
        // 当操作为初始化，新增，删除后，设置明系列标签页，编辑操作保持不变
        if (operate !== 'edit') setActivityTabKey('column');
        // 初始查询columnTable
        columnTableDs.setState('moduleId', currentModuleId);
        columnTableDs.query();
      } else {
        // 没有模块
        setModuleList([]);
        setActiveModuleKey(null);
      }
    });
  };

  // 切换模块页签
  const handleChangeModuleKey = (key) => {
    setActiveModuleKey(key);
    columnTableDs.setState('moduleId', key);
    columnTableDs.query();
    if (activityTabKey === 'line') {
      setActivityTabKey('column');
      // eslint-disable-next-line no-unused-expressions
      lineTableDs.loadData([]);
    }
  };

  // 切换tab标签页
  const handleTabKeyChange = (key) => {
    if (key === 'line') {
      // 校验通过
      setSaveLoading(true);
      columnTableDs
        .submit()
        .then((response) => {
          // false - 校验失败，undefined - 无数据提交
          if (response !== false) {
            const data = {
              modelId,
              moduleId: activeModuleKey,
            };
            setActivityTabKey(key);
            fetchAllColumns(data).then((res) => {
              const result = getResponse(res);
              if (result && !result.failed) {
                // 查询 防止版本记录不一致
                columnTableDs.query();
                // 设置动态列
                copyColumnDataRef.current = result;
                // 生成新的实例，替换原有的实例，避免field校验问题
                const ds = new DataSet(lineTableDS({ modelId }));
                setLineTableDs(ds);

                setItemDynamicColumns(result, ds);
                ds.setState('moduleId', activeModuleKey);
                ds.query();
              }
            });
          }
        })
        .finally(() => {
          setSaveLoading(false);
        });
    }
    if (key === 'column') {
      setActivityTabKey(key);
      lineTableDs.loadData([]);
    }
  };

  // 设置明细项动态列
  const setItemDynamicColumns = (data, ds) => {
    const columns = [];
    data.forEach((item) => {
      const { componentType, valueField, displayField, columnId, columnName, calculateType } =
        item || {};
      if (componentType === 'Lov') {
        // eslint-disable-next-line no-unused-expressions
        ds?.addField(`${columnId}LOV`, {
          name: `${columnId}LOV`,
          label: columnName,
          ignore: 'always',
          required: calculateType === 'MANUAL',
          ...(renderFieldType(item) || {}),
        });
        // eslint-disable-next-line no-unused-expressions
        ds?.addField(`${columnId}`, {
          name: `${columnId}`,
          bind: `${columnId}LOV.${valueField}`,
        });
        // eslint-disable-next-line no-unused-expressions
        ds?.addField(`${columnId}Meaning`, {
          name: `${columnId}Meaning`,
          bind: `${columnId}LOV.${displayField}`,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        ds?.addField(columnId, {
          name: columnId,
          label: columnName,
          required: calculateType === 'MANUAL',
          ...(renderFieldType(item) || {}),
        });
      }
      columns.push({
        name: componentType === 'Lov' ? `${columnId}LOV` : columnId,
        width: 150,
        editor: calculateType === 'MANUAL',
      });
    });
    setDynamicLineColumns(columns);
  };

  // 渲染列类型
  const renderFieldType = (field = {}) => {
    const { componentType, lovCode, displayField, valueField } = field || {};
    let config = {};
    switch (componentType) {
      case 'InputNumber':
        config = {
          type: 'number',
        };
        break;
      case 'Lov':
        config = {
          type: 'object',
          lovCode,
          textField: displayField,
          valueField,
        };
        break;
      case 'ValueList':
        config = {
          lookupCode: lovCode,
        };
        break;
      case 'Input':
        config = {
          type: 'string',
        };
        break;
      default:
        break;
    }
    return config;
  };

  // 模块弹框-新增、编辑
  const handleAddModule = (record) => {
    let operate;
    if (record) {
      // 编辑
      moduleFormDs.loadData([record]);
      operate = 'edit';
      moduleRecord.current = record;
    } else {
      moduleFormDs.create({}, 0);
      operate = 'add';
    }
    return Modal.open({
      title: isEmpty(record)
        ? intl.get(`spc.priceModel.view.message.addModule`).d('新增模块')
        : intl.get(`spc.priceModel.view.message.editModule`).d('编辑模块'),

      drawer: true,
      destroyOnClose: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={moduleFormDs} labelLayout="float">
          <TextField name="moduleName" />
          <TextField name="moduleCode" />
        </Form>
      ),
      onOk: () => handleModuleOk(operate),
      afterClose: () => moduleFormDs.loadData([]),
    });
  };

  // 模块保存
  const handleModuleOk = async (operate) => {
    const res = await moduleFormDs.submit();
    // 校验失败 阻止弹框关闭
    if (res === false) return false;
    // 查询模块列表
    queryModules(operate);
  };

  // 删除模块确认
  const handleDeleteModule = (record) => {
    C7nModal.confirm({
      title: intl.get('ssrc.common.message.tips').d('提示'),
      children: intl.get(`spc.priceModel.view.message.deleteModule`).d('是否确认删除模块？'),
      onOk: () => confirmDeleteModule(record),
    });
  };

  // 删除模块
  const confirmDeleteModule = (record) => {
    deleteModule(record).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
        // 查询模块列表
        queryModules('delete');
      }
    });
  };

  const getMenu = useCallback(
    (n) => {
      return (
        <Menu>
          <Menu.Item>
            <a onClick={() => handleAddModule(n)}>
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
          </Menu.Item>
          <Menu.Item>
            <a onClick={() => handleDeleteModule(n)}>
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </a>
          </Menu.Item>
        </Menu>
      );
    },
    [activityTabKey, activeModuleKey]
  );

  const handleClickMoreVert = useCallback((e) => {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e?.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }, []);

  const tabsHeader = useMemo(
    () => (
      <Button icon="add" funcType="link" onClick={() => handleAddModule()}>
        {intl.get(`spc.priceModel.view.message.addModule`).d('新增模块')}
      </Button>
    ),
    [activityTabKey, activeModuleKey]
  );

  return (
    <Spin spinning={saveLoading}>
      <Tabs
        tabBarExtraContent={tabsHeader}
        activeKey={activeModuleKey}
        onChange={handleChangeModuleKey}
        animated={false}
      >
        {moduleList.map((item) => {
          return (
            <TabPane
              tab={
                <span>
                  {item.moduleName}
                  <Dropdown overlay={getMenu(item)}>
                    <Icon
                      onClick={handleClickMoreVert}
                      type="more_vert"
                      style={{ marginLeft: '4px' }}
                    />
                  </Dropdown>
                </span>
              }
              key={item.moduleId}
            >
              <Tabs
                type="card"
                activeKey={activityTabKey}
                onChange={handleTabKeyChange}
                animated={false}
              >
                <TabPane
                  tab={intl.get('spc.priceModel.view.tab.column').d('列明细定义')}
                  key="column"
                >
                  <ColumnTable />
                </TabPane>
                <TabPane tab={intl.get('spc.priceModel.view.tab.line').d('行明细定义')} key="line">
                  <LineTable
                    dataSet={lineTableDs}
                    dynamicLineColumns={dynamicLineColumns}
                    copyColumnData={copyColumnDataRef.current}
                  />
                </TabPane>
              </Tabs>
            </TabPane>
          );
        })}
      </Tabs>
    </Spin>
  );
});
