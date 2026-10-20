import React, { cloneElement, isValidElement } from 'react';
import { Tag, List } from 'choerodon-ui';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { isFunction, isNil } from 'lodash';
import moment from 'moment';
import { isEmpty, isString } from 'lodash';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Utils } from 'choerodon-ui/dataset';

import AISvg from '@/routes/components/AISvg';
import constructForm from '@/routes/workspace/Detail/components/ContractHeader/ConstructForm';
import styles from '../routes/workspace/Detail/index.less';

// 状态组件
export const renderStatus = (code, meaning, colorFlag) => {
  let list = [];
  switch (colorFlag) {
    case 'change':
      // 变更类型
      list = [
        {
          // 黄色
          status: ['UN_UPDATE'],
          color: 'gray',
        },
        {
          // 橙色
          status: ['UPDATE'],
          color: 'orange',
        },
        {
          // 红色
          status: ['DELETE'],
          color: 'red',
        },
        {
          // 绿色
          status: ['CREATE'],
          color: 'green',
        },
      ];
      break;
    case 'rc':
      // 收货状态
      list = [
        {
          // 橙色
          status: ['10_NEW'],
          color: 'orange',
        },
        {
          // 绿色
          status: ['20_SUBMITTED', '35_PUBLISH', '40_FINISHED'],
          color: 'green',
        },
      ];
      break;
    case 'temp':
      // 模板审查状态
      list = [
        {
          // 橙色
          status: ['PROCESSING'],
          color: 'orange',
        },
        {
          // 绿色
          status: ['SUCCESS'],
          color: 'green',
        },
        {
          status: ['FAILED'],
          color: 'red',
        },
        {
          status: ['EXPIRED'],
          color: 'gray',
        },
        {
          status: ['PENDING'],
          color: 'yellow',
        },
      ];
      break;
    default:
      // 订单-状态
      list = [
        {
          // 黄色
          status: [
            'PENDING',
            'DELIVERY_DATE_REVIEW',
            'CLOSEING',
            'CANCELING',
            'CANCELLED_PARTIAL',
            'CLOSETOBECOMFIRMED',
            'CANCELTOBECOMFIRMED',
          ],
          color: 'yellow',
        },
        {
          // 绿色
          status: [
            'APPROVED',
            'PUBLISHED',
            'CONFIRMED',
            'PART_FEED_BACK',
            'SUBMITTED',
            'SUBMITTED_WFL',
          ],
          color: 'green',
        },
        {
          // 红色
          status: ['REJECTED', 'DELIVERY_DATE_REJECT'],
          color: 'red',
        },
        {
          // 灰色
          status: ['CLOSED', 'CANCELED', 'PUBLISH_CANCEL'],
          color: 'gray',
        },
      ];
  }
  const colorConfig = list.find((i) => i.status.includes(code));
  return (
    <Tag color={colorConfig?.color} style={{ border: 'none' }}>
      {meaning}
    </Tag>
  );
};

export function renderTransferOrderStatus(code, meaning) {
  if (!code) return '-';
  const colorConfig = {
    TRANSFERRING: 'yellow', // 转单中
    TRANSFER_SUCCESSFUL: 'green',
    TRANSFER_FAIL: 'red', // 转单失败
  };
  return (
    <Tag color={colorConfig[code]} style={{ border: 'none' }}>
      {meaning}
      {code === 'TRANSFER_FAIL' && (
        <Icon
          type="help"
          style={{ marginLeft: '6px', fontSize: '14px', marginBottom: '4px', fontWeight: 'normal' }}
        />
      )}
    </Tag>
  );
}

export function renderArchiveFlag(archiveFlag = 0, archiveFlagMeaning) {
  const colorConfigList = ['orange', 'orange', 'green'];
  return (
    <Tag color={colorConfigList[archiveFlag]} style={{ border: 'none' }}>
      {archiveFlagMeaning}
    </Tag>
  );
}

export function getClassName(field, record, currentMode) {
  let className = '';
  if (currentMode && record?.get(`${field}Flag`)) {
    if (currentMode === 'current') {
      className = styles.changeAfter;
    } else if (currentMode === 'history') {
      className = styles.changeBefore;
    }
  }
  return className;
}

const commonFieldRender = ({ defaultValue, name, record, dataSet, defaultConfig }) => {
  if (!name) return null;
  const { render = undefined } = { ...defaultConfig };
  let value = defaultValue;
  if (render) {
    return render({
      record,
      name,
      value,
      dataSet,
    });
  }
  const field = dataSet.getField(name);
  let multiple;
  let textField;
  let lovCode;
  let lookupCode;
  if (field) {
    multiple = field.get('multiple', record);
    textField = field.get('textField', record) || '__notconfig__';
    lovCode = field.get('lovCode', record);
    lookupCode = field.get('lookupCode', record);
  }
  if (!isNil(value)) {
    switch (field.type) {
      case 'boolean':
        return ['1', 1, 'Y'].includes(value)
          ? intl.get(`hzero.common.status.yes`).d('是')
          : intl.get(`hzero.common.status.no`).d('否');
      case 'dateTime':
      case 'date':
        return moment(value).format(
          Utils.getDateFormatByField(
            field,
            (field && field.get('type', record)) || 'string',
            record
          )
        );
      case 'object':
        if (typeof value === 'object') {
          if (value.toJS) {
            value = value.toJS();
          }
          if (multiple) {
            const delimiter = ['boolean', 'number'].includes(typeof multiple) ? ',' : multiple;
            value = Object.values(value).join(delimiter);
          } else if (lovCode || lookupCode) {
            value = value[textField];
          } else {
            value = JSON.stringify(value);
          }
        }
        return value;
      default:
        if (lookupCode) {
          const meaning = record.getField(name)?.getText(value);
          value = meaning || value;
        }
        return value;
    }
  }
  return value;
};

/**
 * 标准字段对比样式
 * @param {Array} columns 标准字段数组
 * @param {*} param1 currentMode：字段对比标识 differeFlag：变更标识
 * @returns
 */
export function renderCompareColumns(columns, { currentMode, differeFlag, intelligent }) {
  if (!(currentMode || differeFlag || intelligent)) {
    return columns;
  }
  return columns.map((item) => {
    const newEditor =
      intelligent && item.formType
        ? {
            editor: (record) => {
              const name = item?.compareValue || item.name;
              // 之前这里的diffFlag判断智能提取AI标是否展示不准，但是兼容以前的逻辑，这里新加一个属性来取ai标识的判断字段
              const diffFlagField = intelligent ? item.aiIconFieldCode || name : name;
              const diffFlag = record?.get(`${diffFlagField}DiffFlag`);
              // 取智能提取的数据
              const diffValue = record?.get(`${name}DiffValue`);
              const text = record?.get(name);
              if (intelligent && item.formType) {
                record.setState(`${item.name}-AiIconFieldCode`, diffFlagField);
                if (isFunction(item.editor) && isValidElement(item?.editor(record))) {
                  const editorRes = item?.editor(record);
                  return cloneElement(editorRes, {
                    prefix: diffFlag ? (
                      <AISvg diffFlag={diffFlag} text={text} isInner diffValue={diffValue} />
                    ) : (
                      false
                    ),
                  });
                } else if (
                  (!isFunction(item.editor) && item.editor) ||
                  (isFunction(item.editor) && item?.editor(record) === true)
                ) {
                  return constructForm({
                    ...item,
                    isEdit: true,
                    prefix: diffFlag ? (
                      <AISvg diffFlag={diffFlag} text={text} isInner diffValue={diffValue} />
                    ) : (
                      false
                    ),
                  });
                }
              }
              return item?.editor;
            },
          }
        : {};
    return {
      ...item,
      ...newEditor,
      renderer: (params) => {
        const { record, dataSet } = params;
        const name = item?.compareValue || item.name;
        let names = record.get(name);
        if (moment.isMoment(names)) {
          names = moment(names).format(DEFAULT_DATE_FORMAT);
        }
        // 修复大数字问题，大数字类型的value是对象会进入这个if条件，先这样处理
        if (!isString(names) && !isEmpty(names)) {
          return item.renderer ? item.renderer(params) : null;
        }
        if (record?.getField(name) && record?.getField(name)?.lookup) {
          const newMeaning = record.getField(name)?.getText(names);
          names = newMeaning || names;
        }
        if (currentMode) {
          return (
            <span
              className={getClassName(name, record, currentMode)}
              style={{ display: 'inline-block', width: '100%', height: '100%' }}
            >
              {item.renderer ? item.renderer(params) : names}
            </span>
          );
        }
        if (differeFlag && record?.get('objectFlag') && record?.get('objectFlag') !== 'UN_UPDATE') {
          let changedContent = record?.get('different')?.[name];
          const keyMap = Object.keys(record?.get('different') || {});
          changedContent = commonFieldRender({
            defaultValue: record?.get('different')?.[`${name}Meaning`] || changedContent,
            name,
            dataSet,
            record,
          });
          // 变更类型：变更
          if (changedContent || keyMap.includes(name)) {
            return (
              <Tooltip
                title={intl
                  .get('spcm.common.view.message.changeBefore', {
                    name: changedContent || '-',
                  })
                  .d(`修改前：${changedContent || '-'}`)}
              >
                <span className={styles[`diff-${record.get('objectFlag')}`]}>
                  {item.renderer ? item.renderer(params) : names || '-'}
                </span>
              </Tooltip>
            );
          }
          // 变更类型：新建、删除
          if (['DELETE', 'CREATE'].includes(record?.get('objectFlag'))) {
            return (
              <span className={styles[`diff-${record.get('objectFlag')}`]}>
                {item.renderer ? item.renderer(params) : names || '-'}
              </span>
            );
          }
        }
        // 之前这里的diffFlag判断智能提取AI标是否展示不准，但是兼容以前的逻辑，这里新加一个属性来取ai标识的判断字段
        const diffFlagField = intelligent ? item.aiIconFieldCode || name : name;
        const diffFlag = record?.get(`${diffFlagField}DiffFlag`);
        // 取智能提取的数据
        const diffValue = record?.get(`${name}DiffValue`);
        if (intelligent && item.formType && diffFlag && !differeFlag) {
          return (
            <AISvg diffFlag={diffFlag} isRender isInner diffValue={diffValue}>
              {item.renderer ? item.renderer(params) : names}
            </AISvg>
          );
        }
        return item.renderer ? item.renderer(params) : names;
      },
    };
  });
}

/**
 * 个性化字段对比样式
 * @param {object} param0 字段属性
 * @param {*} param1 currentMode：字段对比标识 differeFlag：变更标识
 * @returns
 */
export function extTextRender([extParam, node], { currentMode, differeFlag }) {
  const { name, record, dataSet } = extParam;
  if (extParam && !isEmpty(extParam) && currentMode) {
    return (
      <span
        className={getClassName(name, record, currentMode)}
        style={{ display: 'inline-block', width: '100%' }}
      >
        {node || '-'}
      </span>
    );
  }
  if (differeFlag && record?.get('objectFlag') && record?.get('objectFlag') !== 'UN_UPDATE') {
    let changedContent = record?.get('different')?.[name];
    changedContent = commonFieldRender({
      defaultValue: record?.get('different')?.[`${name}Meaning`] || changedContent,
      name,
      dataSet,
      record,
    });
    const keyMap = Object.keys(record?.get('different') || {});
    // 变更类型：变更
    if (changedContent || keyMap.includes(name)) {
      return (
        <Tooltip
          title={intl
            .get('spcm.common.view.message.changeBefore', {
              name: changedContent || '-',
            })
            .d(`修改前：${changedContent || '-'}`)}
        >
          <span className={styles[`diff-${record.get('objectFlag')}`]}>{node || '-'}</span>
        </Tooltip>
      );
    }
    // 变更类型：新建、删除
    if (['DELETE', 'CREATE'].includes(record?.get('objectFlag'))) {
      return <span className={styles[`diff-${record.get('objectFlag')}`]}>{node || '-'}</span>;
    }
  }
  return node;
}

export const renderSmartTips = ({ smartTaskId, isPub } = {}) => {
  const afterFix = isPub ? '.approval' : '';
  const data = [
    {
      code: 3,
      tip: intl.get(`spcm.workspace.view.title.successAI${afterFix}`).d('AI提取成功'),
      desc: '',
    },
    {
      code: 1,
      tip: intl
        .get(`spcm.workspace.view.title.failureAI1${afterFix}`)
        .d('AI提取失败，请手工选择或填写，同时联系运维'),
      desc: intl
        .get(`spcm.workspace.view.title.failureAI2${afterFix}`)
        .d('AI提取成功，但写入失败，例如合同文本中的供应商在系统中【不存在】，请走供应商准入流程'),
    },
    {
      code: 2,
      tip: intl
        .get(`spcm.workspace.view.title.differentAI1${afterFix}`)
        .d('AI提取结果与实际不一致'),
      desc: intl
        .get(`spcm.workspace.view.title.differentAI2${afterFix}`)
        .d(
          '用户对提取后的结果进行主动修改,合同文本中的数据与系统主数据【不一致】，例如供应商电话，地址'
        ),
    },
  ];
  return smartTaskId ? (
    <Tooltip
      placement="bottom"
      popupClassName={styles['intl-help']}
      title={
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<AISvg diffFlag={item.code} />}
                title={item.tip}
                description={item.desc}
              />
            </List.Item>
          )}
        />
      }
      theme="light"
    >
      <Tag className={styles['intl-help-icon']} border={false} color="geekblue">
        {intl.get(`spcm.common.title.intelExtract`).d('智能提取')}
        <Icon type="help" />
      </Tag>
    </Tooltip>
  ) : null;
};
