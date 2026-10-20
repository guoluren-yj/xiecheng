/*
 * @filename:
 * @Date: 2020-05-27 19:05:48
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { DataSet, Icon, Tabs, Table, Button, Select } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { message, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import uuid from 'uuid/v4';
import { isNil } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import {
  TableColumnTooltip,
  TableQueryBarType,
  TableEditMode,
  ColumnAlign,
} from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';

import globalStyles from '@/lowcodeGlobalStyles/global.less';
import editIcon from '@/assets/icon/edit-expression.svg';
import { checkVirtualFields } from '@/services/modelDataSourceService';
import { searchMatcher } from '@/utils/common';
import { treeToArr } from '@/utils/treeUtils';
import Modal from '@/components/LowcodeModal';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';
import { getVirtualType } from '@/routes/Modeler/ModelDesigner/utils/selectType';
import LowcodeTip from '@/components/LowcodeTip';

import thirdFormDS from './ThirdFormDS';
import LeftContentTable from './LeftTabs/LeftContentTable';
import LeftContentFunction from './LeftTabs/LeftContentFunction';
import LeftContentCalculate from './LeftTabs/LeftContentCalculate';
import RightContent from './RightContent';
import styles from './index.less';

// 静态数据
const modalKey = Modal.key();
interface IOnlineEditModal {
  update: (props: any) => any;
  close: () => any;
}
let onlineEditModal: IOnlineEditModal = {
  update: () => {},
  close: () => {},
};
const { TabPane } = Tabs;
const { Column } = Table;
const { Option } = Select;
const canEditList = ['Float', 'Double', 'BigDecimal'];

interface IIndex {
  step: number;
  secondRightData: model.data.DataObjectModel;
  refDataSourceType: string;
}
const Index = forwardRef(({ step, secondRightData, refDataSourceType }: IIndex) => {
  const {
    ref: { thirdStepRef },
    dataObject: {
      level,
      tenantId, // 当前选中的 tenantId
      dataObjectDetailType,
      dataObjectTreeData,
      dataObjectDetail: { extendsParentName },
    },
    virtualFields,
    setVirtualFields,
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const [sourceFieldsList, setSourceFieldsList] = useState<string[]>([]);
  const [defaultValue, setDefaultValue] = useState<any>(null);
  // 字段类型枚举
  const typeSelect = getVirtualType();

  const ThirdFormDS = useMemo(() => new DataSet(thirdFormDS(sourceFieldsList)), [sourceFieldsList]);
  const isTenantLevel = useMemo(() => level === 'tenant', []);
  const [activeKey, setActiveKey] = useState('table');
  /**
   * 初始化
   */
  const init = () => {
    const arr: string[] = [];
    const newRightData: model.data.BaseDataObjectField[] = [];
    if (secondRightData.fields && Array.isArray(secondRightData.fields)) {
      Object.assign(newRightData, secondRightData.fields);
    }
    newRightData.forEach((record) => {
      if (record.fieldName && record.primaryFlag !== 1) {
        arr.push(record.fieldName.toLowerCase());
      }
    });
    setSourceFieldsList(arr); // 获取第二步的可用字段名称 用于检验字段是否重复
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // 回显虚拟字段列表
    ThirdFormDS.reset();
    (virtualFields || []).forEach((item) => {
      ThirdFormDS.create(item);
    });
    // 使用 当前的 tenantId 区分平台虚拟字段和租户虚拟字段
    // 顺序很重要
    ThirdFormDS.records.forEach((record) => {
      const recordTenantId = record.get('tenantId');
      if (isTenantLevel && !isNil(recordTenantId)) {
        if (
          ((extendsParentName && dataObjectDetailType === 'edit') ||
            dataObjectDetailType === 'inherit') &&
          String(recordTenantId) !== String(tenantId)
        ) {
          // eslint-disable-next-line no-param-reassign
          record.selectable = false;
        }
      }
      const typeCascade =
        refDataSourceType !== 'Oracle'
          ? MySqlDataTypeCascade(record.get('type'))
          : OracleDataTypeCascade(record.get('type'));
      record.set('typeCascade', typeCascade);
    });
  }, [ThirdFormDS]);

  const rightContentRef: any = useRef();
  const currentRecord: any = useRef(); // 当前点击代码编辑器选中的行信息
  // 提取数据
  const handleSaveThird = async () => {
    const val = await ThirdFormDS.validate();
    if (val) {
      const arr = ThirdFormDS.toData();
      setVirtualFields(arr as model.data.DataVirtualField[]); // 更新虚拟字段
      return arr;
    }
    return null;
  };

  useImperativeHandle(thirdStepRef, () => ({
    handleSaveThird, // 保存当前数据
  }));

  /**
   * 刷新弹窗
   */
  useEffect(() => {
    onlineEditModal.update({
      children: onlineEditChildren(),
      onOk: handleModalSave,
    });
  }, [defaultValue, activeKey]);

  /**
   * 表达式解析校验
   */
  const handleCheck = async () => {
    const value = rightContentRef?.current.getEditorData();
    // value = value.replace(/\n/g, ''); // 去掉换行符
    if (!value) {
      message.error('表达式不能为空', undefined, undefined, 'top');
      return false;
    }
    const obj = {
      ...currentRecord.current,
      formulaContent: value,
    };
    // 校验接口
    const res = await checkVirtualFields({
      body: { ...dataObjectTreeData, virtualFieldList: [obj] },
    });
    if (res && res.failed) {
      notification.error({
        placement: 'topRight',
        message: '错误',
        description: res.message,
      });
      return false;
    }
    message.success('校验成功', undefined, undefined, 'top');
    return true;
  };

  // 点击左侧值的回调
  const handleClickCallback = (val: string): void => {
    // eslint-disable-next-line no-unused-expressions
    rightContentRef?.current?.handleSetEditorVal?.(val);
  };

  /**
   * 弹窗内容
   */
  const onlineEditChildren = () => (
    <div className={styles['content-wrapper']}>
      <div className={styles['content-left']}>
        <Tabs
          activeKey={activeKey}
          onChange={(key) => {
            if (key !== 'function' && defaultValue) {
              setDefaultValue(null);
            }
            setActiveKey(key);
          }}
        >
          <TabPane
            tab={
              <span className={styles['table-header']}>
                <Tooltip placement="top" title="模型字段">
                  <Icon
                    type=""
                    className={
                      activeKey === 'table' ? styles['table-icon-light'] : styles['table-icon']
                    }
                  />
                </Tooltip>
              </span>
            }
            key="table"
          >
            <LeftContentTable
              handleClickCallback={handleClickCallback}
              secondRightData={treeToArr([secondRightData])}
              openKeys={treeToArr([secondRightData]).map((i) => i.dataModelId) as string[]}
            />
          </TabPane>
          <TabPane
            tab={
              <span className={styles['table-header']}>
                <Tooltip placement="top" title="函数">
                  <Icon
                    type=""
                    className={
                      activeKey === 'function'
                        ? styles['function-icon-light']
                        : styles['function-icon']
                    }
                  />
                </Tooltip>
              </span>
            }
            key="function"
          >
            <LeftContentFunction handleClickCallback={handleClickCallback} />
          </TabPane>
          <TabPane
            tab={
              <span className={styles['table-header']}>
                <Tooltip placement="top" title="运算符">
                  <Icon
                    type=""
                    className={
                      activeKey === 'calculate'
                        ? styles['calculate-icon-light']
                        : styles['calculate-icon']
                    }
                  />
                </Tooltip>
              </span>
            }
            key="calculate"
          >
            <LeftContentCalculate handleClickCallback={handleClickCallback} />
          </TabPane>
        </Tabs>
      </div>
      <div className={styles['content-right']}>
        <div
          style={{
            padding: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'rgb(51, 52, 53)',
          }}
        >
          {currentRecord.current && currentRecord.current.displayName} (
          {currentRecord.current && currentRecord.current.aliasName}) =
        </div>
        <RightContent
          currentRecord={currentRecord.current}
          ref={rightContentRef}
          handleCheck={handleCheck}
          secondRightData={treeToArr([secondRightData])}
        />
      </div>
    </div>
  );

  /**
   * 在线编辑保存
   */
  const handleModalSave = async () => {
    const flag = await handleCheck();
    if (!flag) {
      // 保存校验
      return;
    }
    // 保存
    if (rightContentRef?.current?.getEditorData) {
      const result = rightContentRef.current.getEditorData();
      (ThirdFormDS || []).some((item) => {
        if (item.get('aliasName') === currentRecord.current.aliasName) {
          item.set('formulaContent', result);
          onlineEditModal.close();
          return true;
        }
        return false;
      });
    }
  };

  // 脚步按钮
  const footerCom = () => (
    <>
      <Button onClick={() => onlineEditModal.close()}>取消</Button>
      <Button onClick={handleModalSave} color={ButtonColor.primary}>
        保存
      </Button>
    </>
  );

  /**
   * 编辑条件表达式
   */
  const openEditOnlineModal = async (record: Record) => {
    currentRecord.current = record.toData();
    onlineEditModal = Modal.open({
      lowcodeSize: 'big',
      title: <div style={{ fontSize: '.16rem', fontWeight: 'bold' }}>编辑条件表达式</div>,
      key: modalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: onlineEditChildren(),
      footer: footerCom,
    });
  };

  /**
   *  虚拟字段列编辑icon
   * @param {*} param0 表达式
   */
  function iconRenderer({ record, text }: { record: Record; text: string }) {
    return [
      <div
        style={{
          position: 'absolute',
          top: 0,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        <span>
          {record.get('displayName') &&
          record.get('aliasName') &&
          record.get('dataType') &&
          checkRecordCanEdit(record) ? (
            <Tooltip title="编辑条件表达式">
              <span onClick={() => openEditOnlineModal(record)}>
                <img
                  key="key"
                  src={editIcon}
                  style={{
                    width: '14px',
                    visibility: 'visible',
                    verticalAlign: 'sub',
                    marginRight: '8px',
                    cursor: 'pointer',
                  }}
                  alt="icon"
                />
              </span>
            </Tooltip>
          ) : (
            ''
          )}
          <Tooltip title={text}>{text}</Tooltip>
        </span>
      </div>,
    ];
  }

  // 操作按钮
  const buttons = [
    <Button
      icon="playlist_add"
      color={ButtonColor.primary}
      onClick={() => {
        let code = uuid();
        code = code.replace(/[-]/g, '');
        const record: any = {
          code,
          fieldCode: code,
          modelFieldCode: code,
          leftFieldUniqueKey: `[${code}`,
          rightFieldUniqueKey: `${code}]`,
          _status: 'create',
        };
        if (isTenantLevel) {
          record.isCustom = true; // 租户自定义标识
        }
        ThirdFormDS.create(record, 0);
      }}
    >
      新增
    </Button>,
    ['delete', { color: ButtonColor.primary }],
  ];

  const checkRecordCanEdit = (record) => {
    // 平台层或者新建的
    if (!isTenantLevel || record.get('isCustom')) {
      return true;
    }
    if (!isNil(record.get('tenantId'))) {
      const recordTenant = String(record.get('tenantId'));
      return recordTenant === String(tenantId);
    } else {
      return !(isTenantLevel && dataObjectDetailType === 'edit');
    }
  };

  return (
    <>
      <Table
        key="indexTable"
        className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
        dataSet={ThirdFormDS}
        queryBar={TableQueryBarType.none}
        rowHeight={30}
        editMode={TableEditMode.cell}
        buttons={buttons as any}
        header={
          step === 3 && (
            <div className={styles['tip-content']}>
              {/* <div className={styles['top-warning']}>
                <span className={styles['top-warning-icon']} />
                <span>
                  备注：虚拟字段属于后台异步计算字段，数据更新存在一定的延时。可用于字段值查询场景，暂不支持前端实时计算。
                </span>
              </div> */}
              <LowcodeTip
                type="remarks"
                text="注释：虚拟字段属于后台异步计算字段，数据更新存在一定的延时。可用于字段值查询场景，暂不支持前端实时计算。"
              />
              {/* <div className={styles['top-warning']}>
                <span className={styles['top-warning-icon']} />
                <span>
                  提示：如需根据虚拟字段进行数据过滤，请点击右下角 &quot;返回第二步&quot;
                  按钮配置过滤条件及自定义筛选逻辑。
                </span>
              </div> */}
              <LowcodeTip
                type="warning"
                text='提示：如需根据虚拟字段进行数据过滤，请点击右下角 "返回第二步"按钮配置过滤条件及自定义筛选逻辑。'
              />
            </div>
          )
        }
      >
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="displayName"
          editor={checkRecordCanEdit}
          align={ColumnAlign.left}
        />
        <Column
          name="dataType"
          tooltip={TableColumnTooltip.overflow}
          align={ColumnAlign.left}
          editor={(record) =>
            checkRecordCanEdit(record) && (
              <Select searchable clearButton={false} name="dataType" searchMatcher={searchMatcher}>
                {typeSelect.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )
          }
        />
        <Column
          name="aliasName"
          align={ColumnAlign.left}
          tooltip={TableColumnTooltip.overflow}
          editor={checkRecordCanEdit}
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="virtualFieldType"
          align={ColumnAlign.left}
          editor={checkRecordCanEdit}
        />
        <Column
          name="dataSize"
          width={90}
          align={ColumnAlign.left}
          tooltip={TableColumnTooltip.overflow}
          editor={(record) =>
            (record.get('dataType') === 'Long' || canEditList.includes(record.get('dataType'))) &&
            checkRecordCanEdit(record)
          }
        />
        <Column
          name="decimalDigits"
          width={90}
          align={ColumnAlign.left}
          tooltip={TableColumnTooltip.overflow}
          editor={(record) =>
            canEditList.includes(record.get('dataType')) && checkRecordCanEdit(record)
          }
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="description"
          editor={checkRecordCanEdit}
          align={ColumnAlign.left}
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          width={300}
          name="formulaContent"
          align={ColumnAlign.left}
          renderer={iconRenderer as Renderer}
        />
      </Table>
    </>
  );
});
export default observer((props: any) => <Index {...props} />);
