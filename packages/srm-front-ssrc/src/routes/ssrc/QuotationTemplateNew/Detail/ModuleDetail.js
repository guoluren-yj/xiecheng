import React, { useState, useMemo, useRef, useContext, useImperativeHandle } from 'react';
import { action } from 'mobx';
import { Table, Modal, TextField, Select, Spin, Lov, NumberField } from 'choerodon-ui/pro';
import { Tabs, Tooltip, Icon, Tag } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import {
  saveBusSAttributes,
  saveColumnsNext,
  fetchSummaryItems,
  saveItemData,
} from '@/services/quotationTemplateNewService';
import AttrChildren from './AttrChildren';
// eslint-disable-next-line import/no-cycle
import { TemplateIdContext } from './index';

const { TabPane } = Tabs;

const promptCode = 'ssrc.quotationTemplate';

export default function ModuleDetail(props) {
  const { columnDs, itemDs, templateStatus, moduleDetailRef, remote, pageReadonly = false } = props;
  // 是否可编辑
  const editableFlag = templateStatus !== 'RELEASED' && !pageReadonly;

  // 暴露子组件的api给父组件使用
  useImperativeHandle(moduleDetailRef, () => ({
    activity,
    setActivity,
    getUpdateData,
  }));

  const attrChildrenRef = useRef();
  const copyColumnDataRef = useRef([]);

  const [activity, setActivity] = useState('column');
  const [dynamicItemColumns, setDynamicItemColumns] = useState([]);
  const [summaryItemList, setSummaryItemList] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const templateId = useContext(TemplateIdContext);

  // 切换tab标签页
  const handleKeyChange = async (key) => {
    if (key === 'item') {
      if (editableFlag) {
        // 校验通过
        if (await columnDs.validate()) {
          setSaveLoading(true);
          const data = {
            templateId,
            data: columnDs.toData(),
          };
          saveColumnsNext(data)
            .then((res) => {
              const result = getResponse(res);
              if (result && !result.failed) {
                // 查询 防止版本记录不一致
                columnDs.query();
                setActivity(key);
                // 设置动态列
                copyColumnDataRef.current = result;
                setItemDynamicColumns(result);
                itemDs.setQueryParameter('moduleTemplateId', templateId);
                itemDs.query();
              }
            })
            .finally(() => setSaveLoading(false));
        }
      } else {
        setActivity(key);
        itemDs.setQueryParameter('moduleTemplateId', templateId);
        const firstLine = await itemDs.query();
        const { content = [] } = firstLine || {};
        if (!isEmpty(content)) {
          setItemDynamicColumns(content[0]?.quotationColumns);
        }
      }
    }
    if (key === 'column') {
      setActivity(key);
      if (editableFlag) {
        handleSaveItemData();
      } else {
        itemDs.loadData([]);
      }
    }
  };

  // 设置明细项动态列
  const setItemDynamicColumns = action((data = []) => {
    if (isEmpty(data)) {
      return;
    }

    const columns = [];
    data.forEach((item) => {
      // visible过滤
      // if (item.visible === 1 || item.visible === 2) {
      const lovFlag = (item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov';
      // 数值框且内部可编辑
      const defaultNumberFlag =
        (item.disabled === 1 || item.disabled === 2) && item.componentType === 'InputNumber';
      const columnCodeName = lovFlag ? `${item.columnCode}Lov` : item.columnCode;
      const columnField = itemDs.getField(columnCodeName);
      if (columnField) {
        columnField.reset();
        columnField.set('computedProps', {
          type({ record }) {
            if (
              record.get('quotationDetailType') === 'SCOPE' ||
              record.get('quotationDetailType') === 'ALL'
            ) {
              return 'string'; // 汇总、不汇总
            } else if (lovFlag && record.get('quotationDetailType') === 'NO') {
              return 'object';
            } else if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
              // 数值框且内部可编辑且不汇总，默认值功能
              return 'number';
            } else {
              return 'string'; // 非必输、必输、只读
            }
          },
          // 汇总行，非数值组件，禁用
          disabled({ record }) {
            return (
              (record.get('quotationDetailType') === 'SCOPE' ||
                record.get('quotationDetailType') === 'ALL') &&
              item.componentType !== 'InputNumber'
            );
          },
          min({ record }) {
            if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
              return item.quotationColumnCmpts?.find?.((n) => n.attributeName === 'min')
                ?.attributeValue;
            }
          },
          max({ record }) {
            if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
              return '99999999999999999999';
            }
          },
          precision({ record }) {
            if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
              const value = item.quotationColumnCmpts?.find?.(
                (n) => n.attributeName === 'precision'
              )?.attributeValue;
              return value ? Number(value) : null;
            }
          },
          defaultValue({ record }) {
            if (
              item.disabled !== 1 &&
              item.disabled !== 2 &&
              record.get('quotationDetailType') === 'NO'
            ) {
              const value = item.quotationColumnCmpts?.find?.((n) => n.attributeName === 'required')
                ?.attributeValue;
              return value;
            }
          },
        });
      } else {
        itemDs.addField(lovFlag ? `${item.columnCode}Lov` : item.columnCode, {
          name: lovFlag ? `${item.columnCode}Lov` : item.columnCode,
          label: item.columnName,
          dynamicProps: {
            type: ({ record }) => {
              if (
                record.get('quotationDetailType') === 'SCOPE' ||
                record.get('quotationDetailType') === 'ALL'
              ) {
                return 'string'; // 汇总、不汇总
              } else if (lovFlag && record.get('quotationDetailType') === 'NO') {
                return 'object';
              } else if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
                // 数值框且内部可编辑且不汇总，默认值功能
                return 'number';
              } else {
                return 'string'; // 非必输、必输、只读
              }
            },
            // 汇总行，非数值组件，禁用
            disabled: ({ record }) =>
              (record.get('quotationDetailType') === 'SCOPE' ||
                record.get('quotationDetailType') === 'ALL') &&
              item.componentType !== 'InputNumber',
            min: ({ record }) => {
              if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
                return item.quotationColumnCmpts?.find?.((n) => n.attributeName === 'min')
                  ?.attributeValue;
              }
            },
            max: ({ record }) => {
              if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
                return '99999999999999999999';
              }
            },
            precision: ({ record }) => {
              if (defaultNumberFlag && record.get('quotationDetailType') === 'NO') {
                const value = item.quotationColumnCmpts?.find?.(
                  (n) => n.attributeName === 'precision'
                )?.attributeValue;
                return value ? Number(value) : null;
              }
            },
            defaultValue: ({ record }) => {
              if (
                item.disabled !== 1 &&
                item.disabled !== 2 &&
                record.get('quotationDetailType') === 'NO'
              ) {
                const value = item.quotationColumnCmpts?.find?.(
                  (n) => n.attributeName === 'required'
                )?.attributeValue;
                return value;
              }
            },
          },
        });
        if (lovFlag) {
          itemDs.addField(item.columnCode, {
            name: item.columnCode,
            bind: `${item.columnCode}Lov.${item.valueField}`,
          });
          itemDs.addField(`${item.columnCode}Meaning`, {
            name: `${item.columnCode}Meaning`,
            bind: `${item.columnCode}Lov.${item.displayField}`,
          });
        }
      }
      columns.push({
        name: lovFlag ? `${item.columnCode}Lov` : item.columnCode,
        width: 150,
        editor: (record) =>
          editableFlag ? handleDynItemComponent(record, item) : handleNoEditComponent(record, item),
      });
      // }
    });

    const newColumns = remote
      ? remote.process('SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ITEM_DYNAMICCOLUMN', columns, {
          pageProps: props,
          editableFlag,
          data,
        })
      : columns;

    setDynamicItemColumns(newColumns);
  });

  // 不可编辑设置值集
  const handleNoEditComponent = (record = {}, item = {}) => {
    if (
      record.get('quotationDetailType') === 'NO' &&
      (item.disabled === 1 || item.disabled === 2)
    ) {
      switch (item.componentType) {
        case 'Lov':
          record.getField(`${item.columnCode}Lov`).set('lookupCode', '');
          record.getField(`${item.columnCode}Lov`).set('lovCode', item.lovCode);
          break;
        case 'ValueList':
          record.getField(item.columnCode).set('lookupCode', item.lovCode);
          break;
        default:
          break;
      }
    }
    if (![1, 2].includes(item.disabled) && record.get('quotationDetailType') === 'NO') {
      record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
    }
    if (record.get('quotationDetailType') !== 'NO') {
      if (
        record.get('quotationDetailType') === 'SCOPE' ||
        record.get('quotationDetailType') === 'ALL'
      ) {
        if (item.componentType === 'Lov' && [1, 2].includes(item.disabled)) {
          record
            .getField(`${item.columnCode}Lov`)
            .set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
        } else {
          record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
        }
      }

      if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
        record.getField(`${item.columnCode}Lov`).set('lovCode', '');
      }

      if (record.get('quotationDetailType') === 'RULE') {
        if (item.componentType === 'Lov' && [1, 2].includes(item.disabled)) {
          record.getField(`${item.columnCode}Lov`).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
        } else {
          record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
        }
      }
    }
    return false;
  };

  // 处理明细项动态组件
  const handleDynItemComponent = (record = {}, item = {}) => {
    let component = (
      <Select
        name={
          [1, 2].includes(item.disabled) && item.componentType === 'Lov'
            ? `${item.columnCode}Lov`
            : item.columnCode
        }
        record={record}
        allowClear
        style={{ width: '100%' }}
      />
    );
    // 不汇总行 默认值功能
    if (
      record.get('quotationDetailType') === 'NO' &&
      (item.disabled === 1 || item.disabled === 2)
    ) {
      switch (item.componentType) {
        case 'InputNumber':
          component = (
            <NumberField name={item.columnCode} record={record} style={{ width: '100%' }} />
          );
          break;
        case 'Input':
          component = (
            <TextField name={item.columnCode} record={record} style={{ width: '100%' }} />
          );
          break;
        case 'Lov':
          record.getField(`${item.columnCode}Lov`).set('lookupCode', '');
          record.getField(`${item.columnCode}Lov`).set('lovCode', item.lovCode);
          component = (
            <Lov name={`${item.columnCode}Lov`} record={record} style={{ width: '100%' }} />
          );
          break;
        case 'ValueList':
          record.getField(item.columnCode).set('lookupCode', item.lovCode);
          break;
        default:
          break;
      }
    }
    if (![1, 2].includes(item.disabled) && record.get('quotationDetailType') === 'NO') {
      record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
    }
    if (record.get('quotationDetailType') !== 'NO') {
      if (
        record.get('quotationDetailType') === 'SCOPE' ||
        record.get('quotationDetailType') === 'ALL'
      ) {
        if (item.componentType === 'Lov' && [1, 2].includes(item.disabled)) {
          record
            .getField(`${item.columnCode}Lov`)
            .set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
        } else {
          record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
        }
      }

      if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
        record.getField(`${item.columnCode}Lov`).set('lovCode', '');
      }

      if (record.get('quotationDetailType') === 'RULE') {
        if (item.componentType === 'Lov' && [1, 2].includes(item.disabled)) {
          record.getField(`${item.columnCode}Lov`).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
        } else {
          record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_INPUT_TYPE');
        }
        // 指定规则, 数值格式字段变为文本框格式
        if (item.componentType === 'InputNumber') {
          component = (
            <TextField
              name={item.columnCode}
              record={record}
              style={{ width: '100%' }}
              suffix={
                <Tooltip
                  title={intl.get(`${promptCode}.view.message.rule.tip`).d(
                    // eslint-disable-next-line no-template-curly-in-string
                    '注意：输入细项编码，细项编码只能由数字、字母、下划线组成，请按照${细项编码}输入，例${010}。'
                  )}
                >
                  <Icon type="info-o" style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          );
        }
      }
    }

    return component;
  };

  // 聚焦指定范围,查询指定范围下拉框数据
  const handleFocusSummaryItems = (record = {}) => {
    const { templateDetailId, parentDetailId } = record.toData();
    if (isEmpty(summaryItemList[templateDetailId])) {
      fetchSummaryItems({
        templateDetailId: templateDetailId || null,
        parentDetailId,
        templateId,
      }).then((res) => {
        const responseRes = getResponse(res);
        if (responseRes && !responseRes.failed) {
          setSummaryItemList({ ...summaryItemList, [templateDetailId]: responseRes.content });
        }
      });
    }
  };

  /**
   * 获取-自定义明细列-保存数据
   */
  const getUpdateData = () => {
    let data = [];
    const currentData = itemDs.toData();
    data = currentData.map((item) => {
      const {
        quotationColumns = [],
        quotationDetailType,
        templateId: lineTemplateId,
        ...otherItems
      } = item;
      // eslint-disable-next-line guard-for-in
      for (const arr in otherItems) {
        if (arr.indexOf('Lov') !== -1 && typeof otherItems[arr] !== 'object') {
          otherItems[arr?.replace(/Lov$/, '')] = otherItems[arr];
        }
      }
      const newQuotationColumns = quotationColumns?.map((i) => {
        let field = 'quotationColumnValue';
        if (quotationDetailType === 'NO' && (i.disabled === 1 || i.disabled === 2)) {
          field = 'columnDefaultValue';
        } else if (quotationDetailType === 'RULE' && i.componentType === 'InputNumber') {
          field = 'quoTplDtlCalculationRule';
        }
        return {
          ...i,
          [field]: otherItems[i.columnCode],
        };
      });
      return {
        ...otherItems,
        quotationDetailType,
        quotationColumns: newQuotationColumns,
        templateId: lineTemplateId || templateId,
      };
    });
    return data;
  };

  // 报价明细项保存
  const handleSaveItemData = async () => {
    if (await itemDs.validate()) {
      const params = {
        templateId,
        data: getUpdateData(),
      };
      return saveItemData(params).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          if (!isEmpty(summaryItemList)) {
            setSummaryItemList({});
          }
          // 查询
          itemDs.query();
        }
      });
    }
  };

  // 新建一级报价明细项
  const handleAddOneItem = () => {
    itemDs.create(
      {
        // templateDetailId: uuidv4(),
        quotationColumns: copyColumnDataRef.current,
        enabledFlag: 1,
        parentDetailId: null, // 一级细项标记
        quotationDetailType: 'NO', // 明细项类型，默认值不汇总
        templateId,
      },
      0
    );
  };

  // 新建二级报价明细项
  const handleAddTwoItem = (record = {}) => {
    if (!record.get('expand')) {
      record.set('expand', true);
    }
    itemDs.create(
      {
        // templateDetailId: uuidv4(),
        parentDetailId: record.data.templateDetailId,
        quotationColumns: copyColumnDataRef.current,
        enabledFlag: 1,
        quotationDetailType: 'NO', // 明细项类型，默认值不汇总
        templateId,
      },
      0
    );
  };

  // 组件、业务属性弹框保存
  const handleModalOk = async (type) => {
    if (type === 'attrs') {
      // 组件属性
      // eslint-disable-next-line no-unused-expressions
      await attrChildrenRef.current?.tableDs.submit();
    } else if (type === 'busSAttributes') {
      // 业务属性
      const data = attrChildrenRef.current?.tableDs.toData();
      let param = {};
      data.forEach((i) => {
        const { quotationColumnId, objectVersionNumber } = i;
        param = {
          ...param,
          quotationColumnId,
          objectVersionNumber,
          [i.attributeName]: i.attributeValue,
        };
      });

      param = remote
        ? await remote.process(
            'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_MODAL_HANDLE_SAVE_PARAMS',
            param,
            {
              pageProps: props,
              attrChildrenRef,
            }
          )
        : param;

      if (!param) {
        return false;
      }

      const res = getResponse(await saveBusSAttributes(param));
      if (res && !res.failed) {
        notification.success();
        columnDs.query();
      } else {
        // 接口报错后，阻止弹框关闭
        return false;
      }
    }
  };

  // 打开组件、业务属性弹框
  const handleShowModal = (record, type) => {
    const {
      columnName,
      componentDescription,
      componentType,
      visible,
      disabled,
      quotationColumnId,
      objectVersionNumber,
      calculationRule,
    } = record.get([
      'columnName',
      'componentDescription',
      'componentType',
      'visible',
      'disabled',
      'quotationColumnId',
      'objectVersionNumber',
      'calculationRule',
    ]);
    const attrChildrenProps = {
      remote,
      type,
      columnName,
      componentDescription,
      componentType,
      visible,
      disabled,
      quotationColumnId,
      objectVersionNumber,
      calculationRule,
      attrChildrenRef,
      editableFlag,
      record,
    };
    const modalProps = editableFlag
      ? {
          onOk: () => handleModalOk(type),
        }
      : {
          okButton: false,
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          cancelProps: {
            color: 'primary',
          },
        };
    Modal.open({
      key: Modal.key(),
      title:
        type === 'attrs'
          ? intl.get(`${promptCode}.model.definition.attrs`).d('组件属性')
          : intl.get(`${promptCode}.model.definition.busSAttributes`).d('业务属性'),
      drawer: true,
      style: {
        width: '742px',
      },
      children: <AttrChildren {...attrChildrenProps} />,
      ...modalProps,
    });
  };

  const columnColumns = useMemo(
    () =>
      [
        !editableFlag
          ? {
              name: 'enabledFlag',
              title: intl.get(`hzero.common.templateStatus`).d('状态'),
              renderer: ({ value }) =>
                value ? (
                  <Tag color="green" style={{ border: 'none' }}>
                    {intl.get(`hzero.common.bomViewStatus.enable`).d('启用')}
                  </Tag>
                ) : (
                  <Tag color="red" style={{ border: 'none' }}>
                    {intl.get(`hzero.common.model.status.disabled`).d('禁用')}
                  </Tag>
                ),
            }
          : null,
        {
          name: 'columnCode',
          editor: editableFlag,
        },
        {
          name: 'columnName',
          editor: editableFlag,
        },
        {
          name: 'columnSequence',
          editor: editableFlag,
          width: 150,
        },
        {
          name: 'componentLov',
          editor: editableFlag,
        },
        {
          name: 'lovCodeLov',
          editor: editableFlag,
        },
        {
          name: 'calculationRule',
          editor: editableFlag,
        },
        {
          header: intl.get(`${promptCode}.model.definition.attrs`).d('组件属性'),
          name: 'attrs',
          renderer: ({ record }) =>
            record.status !== 'add' && (
              <a onClick={() => handleShowModal(record, 'attrs')}>
                {intl.get(`${promptCode}.model.definition.attrs`).d('组件属性')}
              </a>
            ),
        },
        {
          header: intl.get(`${promptCode}.model.definition.busSAttributes`).d('业务属性'),
          name: 'busSAttributes',
          renderer: ({ record }) =>
            record.status !== 'add' && (
              <a onClick={() => handleShowModal(record, 'busSAttributes')}>
                {intl.get(`${promptCode}.model.definition.busSAttributes`).d('业务属性')}
              </a>
            ),
        },
        editableFlag
          ? {
              name: 'enabledFlag',
              editor: editableFlag,
            }
          : null,
      ].filter(Boolean),
    [editableFlag]
  );

  const itemColumns = useMemo(
    () =>
      [
        {
          name: 'configCode',
          editor: editableFlag,
          width: 150,
          headerStyle: {
            paddingLeft: '36px',
          },
        },
        !editableFlag
          ? {
              name: 'enabledFlag',
              width: 80,
              title: intl.get(`hzero.common.templateStatus`).d('状态'),
              renderer: ({ value }) =>
                value ? (
                  <Tag color="green" style={{ border: 'none' }}>
                    {intl.get(`hzero.common.bomViewStatus.enable`).d('启用')}
                  </Tag>
                ) : (
                  <Tag color="red" style={{ border: 'none' }}>
                    {intl.get(`hzero.common.model.status.disabled`).d('禁用')}
                  </Tag>
                ),
            }
          : null,
        {
          name: 'configName',
          width: 130,
          editor: editableFlag,
        },
        {
          name: 'lineSequence',
          editor: editableFlag,
          width: 150,
        },
        {
          header: intl.get(`${promptCode}.model.template.nextQuotationDetails`).d('下级报价明细'),
          name: 'nextQuotationDetails',
          width: 120,
          align: 'left',
          renderer: ({ record }) =>
            editableFlag &&
            record.data.parentDetailId === null &&
            record.data.objectVersionNumber ? (
              <a onClick={() => handleAddTwoItem(record)}>
                {intl.get('hzero.common.button.create').d('新建')}
              </a>
            ) : (
              ''
            ),
        },
        {
          name: 'quotationDetailType',
          width: 130,
          editor: (record) =>
            editableFlag && (
              <Select name="quotationDetailType" record={record} clearButton={false} />
            ),
        },
        {
          name: 'summaryItemList',
          width: 150,
          editor: (record) =>
            editableFlag && (
              <Select
                name="summaryItemList"
                record={record}
                clearButton={false}
                onFocus={() => handleFocusSummaryItems(record)}
                selectAllButton={false}
              >
                {summaryItemList?.[record.data?.templateDetailId]?.map((n) => (
                  <Select.Option value={n.configCode} key={n.configCode}>
                    {n.configCode}-{n.configName}
                  </Select.Option>
                ))}
              </Select>
            ),
        },
        ...dynamicItemColumns,
        editableFlag
          ? {
              name: 'enabledFlag',
              editor: editableFlag,
              width: 80,
            }
          : null,
      ].filter(Boolean),
    [dynamicItemColumns, summaryItemList, editableFlag]
  );

  return (
    <Spin spinning={saveLoading}>
      <Tabs
        animated={false}
        activeKey={activity}
        onChange={handleKeyChange}
        style={{ marginTop: '20px' }}
      >
        <TabPane key="column" tab={intl.get(`${promptCode}.view.tab.column`).d('报价明细列')}>
          <Table
            customizable
            customizedCode="code"
            dataSet={columnDs}
            columns={columnColumns}
            buttons={editableFlag && ['add', 'delete']}
          />
        </TabPane>
        <TabPane key="item" tab={intl.get(`${promptCode}.view.tab.item`).d('报价明细项')}>
          <Table
            mode="tree"
            dataSet={itemDs}
            customizable
            customizedCode="code"
            columns={
              remote
                ? remote.process(
                    'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ITEM_COLUMN',
                    itemColumns,
                    { pageProps: props, editableFlag }
                  )
                : itemColumns
            }
            buttons={
              editableFlag && [
                ['add', { onClick: handleAddOneItem }],
                'delete',
                ['save', { onClick: handleSaveItemData }],
              ]
            }
          />
        </TabPane>
      </Tabs>
    </Spin>
  );
}
