/* eslint-disable react/jsx-indent */
import React, { useContext, useState, useMemo, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  TextField,
  NumberField,
  Select,
  Table,
  DataSet,
  Button,
  Icon,
  Row,
  Col,
} from 'choerodon-ui/pro';
import { Tooltip, Tabs } from 'choerodon-ui';
import { Content } from 'components/Page';
import notification from 'utils/notification';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import {
  TableColumnTooltip,
  TableQueryBarType,
  TableEditMode,
  ColumnAlign,
} from 'choerodon-ui/pro/lib/table/enum';
// import { isTenantRoleLevel } from 'utils/utils';

import ImgIcon from '@/utils/ImgIcon';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';
import { getSelectType } from '@/routes/Modeler/ModelDesigner/utils/selectType';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import FormDataSet from './store/FormDataSet';
import TableDataSet from './store/TableDataSet';
import ReverTableDataSet from './store/reverTableDataSet';
import styles from './index.less';
import IndexTable from './IndexTable/IndexTable';

const { Option } = Select;
const { Column } = Table;
const { TabPane } = Tabs;
const nameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'];
const whoNameList = [
  'LAST_UPDATE_DATE',
  'LAST_UPDATED_BY',
  'CREATION_DATE',
  'CREATED_BY',
  'OBJECT_VERSION_NUMBER',
];

enum ETableType {
  POSITIVE = 'POSITIVE',
  REVERSE = 'REVERSE',
  REDUNDANT = 'REDUNDANT',
  REDUNDANT_X = 'REDUNDANT_X',
}
enum EKey {
  edit = 'edit',
  delete = 'delete',
  poEdit = 'poEdit',
  reEdit = 'reEdit',
  save = 'save',
  save1 = 'save1',
  icon = 'icon',
  text = 'text',
  CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP',
  indexTab = 'indexTab',
  defaultTab = 'defaultTab',
}
export default observer(() => {
  const {
    setDataStore,
    ref: { baseTableDetailRef, baseLabelMenuRef, menuSelectRef },
    storeData: {
      viewType,
      // isLeftShowMenu,
      activeTabKey,
      refreshNum,
      tableId,
      tableName,
      tableType,
      refDataSourceType,
      editTableFlag,
    },
    currentDs,
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store; // tableType
  const tableDataSet: any = useMemo(() => new DataSet(TableDataSet(tableId, refDataSourceType)), [
    tableId,
    refDataSourceType,
  ]); // 表字段tabs数据
  const reverTableDataSet = useMemo(() => new DataSet(ReverTableDataSet(tableId)), [tableId]);
  const formDataSet = useMemo(() => {
    return new DataSet(FormDataSet(tableId));
  }, [tableId]);
  const [formEditShow, setFormEditShow] = useState<boolean>(false);
  const [columnNameList, setColumnNameList] = useState<string[]>([]);
  const [isEditAll, setIsEditAll] = useState<boolean>(false);

  const formCurrent: Record = formDataSet.current as any;
  // 字段类型枚举
  interface ITypeSelect {
    value: string;
    meaning: string;
  }
  const typeSelect: ITypeSelect[] = getSelectType(refDataSourceType);
  const buttons =
    tableType === ETableType.POSITIVE || tableType === ETableType.REDUNDANT
      ? [
          <Button hidden={!editTableFlag} onClick={() => handleAdd()} key={EKey.edit}>
            <ImgIcon name="create-new@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            新增
          </Button>,
          <Button
            hidden={!editTableFlag}
            disabled={tableDataSet.selected.length === 0}
            onClick={() => tableDataSet.delete(tableDataSet.selected)}
            key={EKey.delete}
          >
            <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            批量删除
          </Button>,
          <Button
            hidden={!editTableFlag}
            // disabled={(tableType === tableDataSet.toData().length) === 0}
            disabled={tableDataSet.toData().length === 0}
            onClick={() => batchEdit(ETableType.POSITIVE)}
            key={EKey.poEdit}
          >
            <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            {isEditAll ? '取消' : '批量编辑'}
          </Button>,
        ]
      : [
          <Button
            hidden={!editTableFlag}
            disabled={reverTableDataSet.toData().length === 0}
            onClick={() => batchEdit(ETableType.REVERSE)}
            key={EKey.reEdit}
          >
            <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            {isEditAll ? '取消' : '批量编辑'}
          </Button>,
        ];
  if (isEditAll) {
    if (tableType === ETableType.POSITIVE || tableType === ETableType.REDUNDANT) {
      buttons.push(
        <Button icon="save" onClick={() => saveAll('positive')} key={EKey.save}>
          保存
        </Button>
      );
    } else {
      buttons.push(
        <Button icon="save" onClick={() => saveAll('reverse')} key={EKey.save1}>
          保存
        </Button>
      );
    }
  } else if (tableType === ETableType.POSITIVE || tableType === ETableType.REDUNDANT) {
    buttons.splice(3, 1);
  } else {
    buttons.splice(2, 1);
  }
  // 刷新行信息
  const handleTableQuery = async () => {
    if (tableType === ETableType.POSITIVE || tableType === ETableType.REDUNDANT) {
      await tableDataSet.query();
      dealDataSetToArr();
    } else {
      reverTableDataSet.query();
    }
  };
  useImperativeHandle(baseTableDetailRef, () => ({
    baseTableDetailRefresh: () => {
      formDataSet.query();
      reverTableDataSet.query();
      handleTableQuery();
    },
  }));
  useEffect(() => {
    setFormEditShow(false);
    formDataSet.query();
    handleTableQuery();
  }, [tableType, tableId, refreshNum]);
  useEffect(() => {
    setIsEditAll(false);
  }, [tableName]);
  // 保存表头
  const handleFormSave = async () => {
    const val: boolean = await formCurrent.validate(true);
    if (val) {
      await formDataSet.submit();
      if (viewType === 'labelView') {
        baseLabelMenuRef.current.leftMenuDsQuery({});
      } else {
        // eslint-disable-next-line no-unused-expressions
        menuSelectRef.current?.findTreeNodePathByName?.('');
      }
      setFormEditShow(false);
    }
  };

  // 字段icon
  interface IIconProps {
    record: Record;
    text: string;
  }
  type IIconRenderer = (props: IIconProps) => any;
  const iconRenderer: IIconRenderer = ({ record, text }) => {
    return [
      record.get('primaryFlag') === 1 && (
        <Tooltip title="自增单主键">
          <Icon
            key={EKey.icon}
            type="vpn_key"
            style={{
              fontSize: '0.16rem',
              verticalAlign: 'text-bottom',
              marginRight: '8px',
              transform: 'rotate(-45deg)',
            }}
          />
        </Tooltip>
      ),
      <span key={EKey.text}>{text}</span>,
    ];
  };

  interface IOption {
    key: string | number;
    value: string | number;
  }
  interface IDefaultValueObj {
    type: string;
    style: string;
    optionArr: IOption[];
  }
  type IDefaultValueEditColumn = (record: Record) => React.ReactElement | boolean;
  const defaultValueEditColumn: IDefaultValueEditColumn = (record) => {
    const defaultValueObj: IDefaultValueObj = (record.get('typeCascade') || {}).defaultValue || {};
    if (record.get('primaryFlag') === 1 || defaultValueObj.type === 'readOnly') {
      return false;
    }
    if (defaultValueObj.style === 'select') {
      if (record.get('type') === 'DATE') {
        return (
          <Select name="defaultValue" searchMatcher={searchMatcher}>
            {[{ key: EKey.CURRENT_TIMESTAMP, value: EKey.CURRENT_TIMESTAMP }].map((item) => (
              <Option key={item.key} value={item.key}>
                {item.value}
              </Option>
            ))}
          </Select>
        );
      }
      return (
        <Select name="defaultValue" searchMatcher={searchMatcher}>
          {(defaultValueObj.optionArr || []).map((item) => (
            <Option key={item.key} value={item.key}>
              {item.value}
            </Option>
          ))}
        </Select>
      );
    }
    if (defaultValueObj.style === 'number') {
      return <NumberField step={1} />;
    }
    if (defaultValueObj.style === 'float') {
      return <NumberField />;
    }
    if (defaultValueObj.style === 'string') {
      return <TextField />;
    }
    return true;
  };

  // 执行批量编辑时重置一下编辑框样式
  interface ITypeCascade {
    dataSize: object;
    decimalDigits: object;
    defaultValue: object;
  }
  const editInitAll = () => {
    // 顺序很重要
    tableDataSet.records.forEach((record) => {
      const typeCascade: ITypeCascade =
        refDataSourceType !== 'Oracle'
          ? MySqlDataTypeCascade(record.get('type'))
          : OracleDataTypeCascade(record.get('type'));
      record.set('typeCascade', typeCascade);
    });
  };

  /**
   * 取出普通数据对象中的name字段值 并传给indexTable表
   */
  const dealDataSetToArr = () => {
    if (tableDataSet && tableDataSet.toData()) {
      const data: model.TableColumn[] = tableDataSet.toData() as model.TableColumn[];
      setColumnNameList(data.filter((i) => i.primaryFlag !== 1).map((item) => item.name));
    }
  };

  /**
   * 新增
   */
  const handleAdd = async () => {
    if (!isEditAll) {
      setIsEditAll(true);
    }
    tableDataSet.create({}, 0); // 新增
  };

  /**
   * 批量编辑
   */
  const batchEdit = (type: string) => {
    editInitAll();
    setIsEditAll(!isEditAll);
    if (isEditAll) {
      switch (type) {
        case ETableType.REVERSE:
          reverTableDataSet.reset();
          break;
        case ETableType.POSITIVE:
          tableDataSet.query();
          // tableDataSet.reset();
          break;
        default:
          break;
      }
    }
  };

  /**
   * 批量保存
   */
  const saveAll = async (type: string) => {
    let hasPrimaryFlag: boolean = false;
    if (type === 'reverse') {
      setIsEditAll(false);
      reverTableDataSet.submit();
      return;
    }
    const val = await tableDataSet.validate();
    hasPrimaryFlag = (tableDataSet.data || []).some((i) => i.get('primaryFlag'));
    if (!hasPrimaryFlag) {
      notification.error({
        description: '请至少选择一个主键',
      } as any);
      return;
    }
    if (val) {
      const res = await tableDataSet.submit();
      if (res && res.failed) {
        return;
      }
      setIsEditAll(false);
    }
  };

  return tableId ? (
    <Content className={`${styles['base-table-detail']}`}>
      <div className={`${styles['right-header']}`}>
        <div className="page-content-header">
          <div className={styles['content-header-title']}>
            {`基础表"${tableName}"的字段`}
            {tableType === ETableType.POSITIVE && (
              <span className={styles['table-type-positive']}>
                <ImgIcon name="forward@2x.png" size={12} style={{ marginRight: '4px' }} />
                <span>正向建表</span>
              </span>
            )}
            {tableType === ETableType.REVERSE && (
              <span className={styles['table-type-reverse']}>
                <ImgIcon name="reverse@2x.png" size={12} style={{ marginRight: '4px' }} />
                <span>反向扫描</span>
              </span>
            )}
            {tableType === ETableType.REDUNDANT && (
              <span className={styles['table-type-redundant']}>
                <ImgIcon name="redundancy-2@2x.png" size={12} style={{ marginRight: '4px' }} />
                <span>共享扩展</span>
              </span>
            )}
            {tableType === ETableType.REDUNDANT_X && (
              <span className={styles['table-type-redundant-x']}>
                <ImgIcon name="exclusiveImg_active.svg" size={12} style={{ marginRight: '4px' }} />
                <span>独享扩展</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex' }}>
            <div className={styles['content-header-label']}>备注：</div>
            {formEditShow ? (
              <Form
                columns={3}
                labelLayout={'placeholder' as any}
                dataSet={formDataSet}
                className={styles['content-header-description']}
              >
                <TextField name="description" colSpan={2} style={{ marginTop: '5px' }} />
                {/* <div colSpan={1}> */}
                <div className={styles['btn-wrapper']}>
                  <Button
                    onClick={() => {
                      formDataSet.query();
                      setFormEditShow(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={() => {
                      return formDataSet.query();
                    }}
                  >
                    重置
                  </Button>
                  <Button onClick={() => handleFormSave()} style={{ color: '#29bece' }}>
                    保存
                  </Button>
                </div>
              </Form>
            ) : (
              <Row className={styles['content-header-description']}>
                <Col span={16}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={formCurrent.get('description')} placement="bottom">
                      <span className={styles['content-header-span']}>
                        {formCurrent.get('description') ? formCurrent.get('description') : '暂无'}
                      </span>
                    </Tooltip>
                  </div>
                </Col>
                <Col span={8} className={styles['btn-wrapper']}>
                  {editTableFlag ? (
                    // <Button funcType={FuncType.flat} onClick={() => setFormEditShow(true)}>
                    //   <ImgIcon name="edit.svg" size={15} style={{ cursor: 'pointer' }} />
                    // </Button>
                    <Button onClick={() => setFormEditShow(true)} style={{ color: '#29bece' }}>
                      编辑
                    </Button>
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            )}
          </div>
        </div>
      </div>
      {tableType === ETableType.POSITIVE || tableType === ETableType.REDUNDANT ? ( // 正向见表
        <Tabs
          // style={!isLeftShowMenu ? { marginTop: 65, marginLeft: 38 } : {}}
          defaultActiveKey={activeTabKey}
          activeKey={activeTabKey}
          onChange={(key) => {
            if (key === EKey.indexTab) {
              tableDataSet.validate().then((res) => {
                if (res) {
                  if (key === EKey.indexTab) {
                    handleTableQuery();
                  }
                  setDataStore('activeTabKey', key);
                } else {
                  notification.error({
                    description: '字段未保存',
                  });
                }
              });
            }
            if (key === EKey.defaultTab && currentDs) {
              currentDs.validate().then((res) => {
                if (res) {
                  if (key === EKey.defaultTab) {
                    handleTableQuery();
                  }
                  setDataStore('activeTabKey', key);
                } else {
                  notification.error({
                    description: '字段未保存',
                  });
                }
              });
            }
          }}
          className={`${styles['detail-tabs-wrapper']} ${styles.tabs}`}
        >
          <TabPane tab="表字段" key={EKey.defaultTab}>
            <Table
              className={`${styles.btnFloatRight}`}
              dataSet={tableDataSet}
              rowHeight={30}
              queryBar={TableQueryBarType.none}
              editMode={TableEditMode.cell} // 批量编辑
              buttons={buttons}
              // scroll
            >
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="name"
                width={140}
                editor={(record) =>
                  !record.get('code') || // 新增的数据可以编辑
                  (isEditAll &&
                    !nameList.includes(record.get('name')) &&
                    !whoNameList.includes(record.get('name')))
                }
                align={ColumnAlign.left}
                renderer={iconRenderer as any}
              />
              <Column
                name="type"
                width={160}
                tooltip={TableColumnTooltip.overflow}
                align={ColumnAlign.left}
                editor={(record) =>
                  (!record.get('code') ||
                    (record.get('primaryFlag') !== 1 &&
                      isEditAll &&
                      !['TENANT_ID'].includes(record.get('name')) &&
                      !whoNameList.includes(record.get('name')) &&
                      !nameList.includes(record.get('name')))) && (
                    <Select
                      searchable
                      clearButton={false}
                      name="type"
                      searchMatcher={searchMatcher}
                    >
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
                name="description"
                editor={(record) => isEditAll && !nameList.includes(record.get('name'))}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="dataSize"
                width={120}
                align={ColumnAlign.left}
                editor={(record) =>
                  isEditAll &&
                  !record.get('primaryFlag') &&
                  !['TENANT_ID'].includes(record.get('name')) &&
                  ((record.get('typeCascade') || {}).dataSize || {}).type !== 'readOnly' &&
                  !whoNameList.includes(record.get('name')) &&
                  !nameList.includes(record.get('name'))
                }
              />
              <Column
                name="decimalDigits"
                width={120}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
                editor={(record) =>
                  isEditAll &&
                  !record.get('primaryFlag') &&
                  ((record.get('typeCascade') || {}).decimalDigits || {}).type !== 'readOnly' &&
                  !whoNameList.includes(record.get('name')) &&
                  !nameList.includes(record.get('name'))
                }
              />
              <Column
                name="defaultValue"
                width={120}
                editor={(record) =>
                  isEditAll &&
                  !nameList.includes(record.get('name')) &&
                  !whoNameList.includes(record.get('name')) &&
                  defaultValueEditColumn(record)
                }
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                width={100}
                name="requiredFlag"
                align={'center' as any}
                editor={(record) =>
                  isEditAll &&
                  record.get('primaryFlag') !== 1 &&
                  !whoNameList.includes(record.get('name')) &&
                  !nameList.includes(record.get('name'))
                }
                renderer={({ value }) => (value === 1 ? '是' : '否')}
              />
              <Column
                width={70}
                name="primaryFlag"
                align={'center' as any}
                editor={(record) =>
                  editTableFlag === 1 &&
                  tableType !== ETableType.REDUNDANT &&
                  isEditAll &&
                  !['TENANT_ID'].includes(record.get('name')) &&
                  !nameList.includes(record.get('name')) &&
                  !whoNameList.includes(record.get('name'))
                }
                renderer={({ value }) => (value === 1 ? '是' : '否')}
              />
            </Table>
          </TabPane>
          <TabPane tab="索引" key={EKey.indexTab}>
            <IndexTable
              columnNameList={columnNameList}
              status="edit"
              tableType={tableType}
              activeTabKey={activeTabKey}
            />
          </TabPane>
        </Tabs>
      ) : (
        <Tabs
          defaultActiveKey={activeTabKey}
          onChange={(key) => {
            setDataStore('activeTabKey', key);
          }}
          className={`${styles['detail-tabs-wrapper']} ${styles.tabs}`}
        >
          <TabPane
            tab={<span className={styles['table-header']}>表字段</span>}
            key={EKey.defaultTab}
          >
            <Table
              className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
              dataSet={reverTableDataSet}
              rowHeight={30}
              queryBar={TableQueryBarType.none}
              editMode={TableEditMode.cell} // 批量编辑
              buttons={buttons}
            >
              <Column
                name="name"
                width={180}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
                renderer={iconRenderer as any}
              />
              <Column
                name="type"
                width={160}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                name="description"
                editor={isEditAll}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                name="dataSize"
                width={120}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                name="decimalDigits"
                width={120}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                name="defaultValue"
                width={125}
                align={ColumnAlign.left}
                tooltip={TableColumnTooltip.overflow}
              />
              <Column
                width={90}
                name="requiredFlag"
                align={'center' as any}
                editor={false}
                renderer={({ value }) => (value === 1 ? '是' : '否')}
              />
              <Column
                width={70}
                name="primaryFlag"
                align={'center' as any}
                renderer={({ value }) => (value === 1 ? '是' : '否')}
              />
            </Table>
          </TabPane>
          <TabPane tab={<span className={styles['table-header']}>索引</span>} key={EKey.indexTab}>
            <IndexTable status="view" activeTabKey={activeTabKey} />
          </TabPane>
        </Tabs>
      )}
    </Content>
  ) : (
    <></>
  );
});
