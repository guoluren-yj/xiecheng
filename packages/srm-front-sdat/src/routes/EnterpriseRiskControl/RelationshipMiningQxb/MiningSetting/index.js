/**
 * @Description: 排查设置组件
 * @Author: Felix(LQX5731@163.com)
 * @Version: 1.0.0
 * @CreateTime: 2026-05-25 17:32:46
 * @LastEditTime: 2026-05-25 17:38:33
 * @FileName: index.js
 */
import React from 'react';
import intl from 'utils/intl';
import { CheckBox, Icon, NumberField, Range, Tooltip } from 'choerodon-ui/pro';

import styles from './index.less';

const CATEGORY_FIELD_NAME_MAP = {
  EQUITY: 'equity',
  DJGF: 'djg',
  CG: 'control_guarantee',
  CI: 'contact',
  WHITELIST: 'whitelist',
  STATUS: 'status',
};
const SETTINGS_NUMBER_FIELD_NAMES = ['stake_threshold', 'stake_threshold_history'];
const SETTINGS_VALUE_FIELD_NAME_MAP = {
  stake_threshold: 'stake_threshold',
  stake_threshold_history: 'stake_threshold_history',
};
const EQUITY_PARENT_FIELD_MAP = {
  stake_threshold: 'SH',
  SH_percent_greater: 'SH',
  SH_percent_less: 'SH',
  stake_threshold_history: 'HSH',
  HSH_percent_greater: 'HSH',
  HSH_percent_less: 'HSH',
  branch: null,
};
const SETTINGS_GROUPED_FIELD_MAP = {
  EQUITY: [
    'stake_threshold',
    'SH_percent_less',
    'HSH',
    'HSH_percent_greater',
    'HSH_percent_less',
    'branch',
  ],
  DJGF: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
  CG: ['same_controller', 'control', 'group', 'guarantee'],
  CI: [
    'same_phone',
    'same_email',
    'same_address',
    'same_history_phone',
    'same_history_email',
    'same_history_address',
  ],
  WHITELIST: ['public', 'gov', 'fund', 'bank', 'financial'],
  STATUS: ['status2', 'status3', 'status4', 'status7'],
};

/**
 * 渲染排查设置内容。
 * @param {object} props 组件属性
 * @returns {JSX.Element | null}
 */
const MiningSetting = ({
  isModal = false,
  settingDS,
  typeList,
  levelValue,
  number1,
  number2,
  onLevelChange,
  onNumber1Change,
  onNumber2Change,
}) => {
  const record = settingDS?.current;

  if (!record) {
    return null;
  }

  const sortedTypeList = [...typeList].sort(
    (current, next) => (current?.orderSeq || 0) - (next?.orderSeq || 0)
  );
  const rootTypeList = sortedTypeList.filter((item) => !item.tag);
  const childrenTypeMap = sortedTypeList.reduce((result, item) => {
    if (!item.tag) {
      return result;
    }
    return {
      ...result,
      [item.tag]: [...(result[item.tag] || []), item],
    };
  }, {});

  /**
   * 获取一级分类对应的字段名。
   * @param {string} categoryValue 一级分类 value
   * @returns {string}
   */
  const getCategoryFieldName = (categoryValue) => {
    return CATEGORY_FIELD_NAME_MAP[categoryValue] || categoryValue?.toLowerCase();
  };

  /**
   * 获取字段展示文案。
   * @param {object} item 配置项
   * @returns {string}
   */
  const getItemLabel = (item) => {
    if (item.value === 'SH_percent_greater') {
      return `${intl.get('sdat.supplier.view.title.shareholderRatio').d('股东股比')}＞${
        record.get('stake_threshold') ?? number1
      }%`;
    }
    if (item.value === 'SH_percent_less') {
      return `${intl.get('sdat.supplier.view.title.shareholderRatio').d('股东股比')}＜=${
        record.get('stake_threshold') ?? number1
      }%${intl.get('sdat.supplier.view.message.orEmpty').d('或为空时')}`;
    }
    if (item.value === 'HSH_percent_greater') {
      return `${intl.get('sdat.supplier.view.title.shareholderHisRatio').d('历史股东股比')}＞${
        record.get('stake_threshold_history') ?? number2
      }%`;
    }
    if (item.value === 'HSH_percent_less') {
      return `${intl.get('sdat.supplier.view.title.shareholderHisRatio').d('历史股东股比')}＜=${
        record.get('stake_threshold_history') ?? number2
      }%${intl.get('sdat.supplier.view.message.orEmpty').d('或为空时')}`;
    }
    if (item.meaning) {
      return item.meaning;
    }
    const field = settingDS.getField(item.value);
    if (field?.get && field.get('label')) {
      return field.get('label');
    }
    return item.value;
  };

  /**
   * 获取文本框当前值。
   * @param {string} fieldName 字段名
   * @returns {number | string}
   */
  const getNumberFieldValue = (fieldName) => {
    if (fieldName === 'stake_threshold') {
      return record.get('stake_threshold') ?? number1;
    }
    if (fieldName === 'stake_threshold_history') {
      return record.get('stake_threshold_history') ?? number2;
    }
    return '';
  };

  /**
   * 渲染分组标题。
   * @param {string} name 字段名
   * @param {string} defaultLabel 标题文案
   * @param {React.ReactNode} tipContent 提示内容
   * @returns {JSX.Element}
   */
  const renderSectionTitle = (name, defaultLabel, tipContent) => (
    <div className={styles['settings-section-header']}>
      <CheckBox dataSet={settingDS} name={name} />
      <Tooltip title={defaultLabel}>
        <div
          style={{
            marginLeft: '8px',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {defaultLabel}
        </div>
      </Tooltip>
      <Tooltip title={tipContent}>
        <Icon type="help_outline" className={styles['settings-help-icon']} />
      </Tooltip>
    </div>
  );

  /**
   * 渲染固定文本框行。
   * @param {object} item 配置项
   * @returns {JSX.Element}
   */
  const renderNumberFieldItem = (item) => {
    const fieldName = SETTINGS_VALUE_FIELD_NAME_MAP[item.value];
    return (
      <div key={item.value} className={styles['settings-item-inline']}>
        <span className={styles['settings-item-label']}>{item.meaning}</span>
        <div className={styles['settings-item-sub']}>
          <NumberField
            dataSet={settingDS}
            name={fieldName}
            style={{ width: '100px' }}
            value={getNumberFieldValue(item.value)}
            onChange={item.value === 'stake_threshold' ? onNumber1Change : onNumber2Change}
          />
          <span>%</span>
        </div>
      </div>
    );
  };

  /**
   * 渲染复选框项。
   * @param {object} item 配置项
   * @returns {JSX.Element}
   */
  const renderCheckboxItem = (item) => {
    const label = getItemLabel(item);
    // const isEquityItem =
    //   ['SH', 'HSH'].includes(item.value) || Boolean(EQUITY_PARENT_FIELD_MAP[item.value]);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CheckBox key={item.value} dataSet={settingDS} name={item.value} />
        <Tooltip title={label}>
          <div className={`${styles['settings-checkbox-label']}`}>{label}</div>
        </Tooltip>
      </div>
    );
  };

  /**
   * 渲染单行子项。
   * @param {object} item 配置项
   * @returns {JSX.Element}
   */
  const renderEquityChildRow = (item) => {
    if (SETTINGS_NUMBER_FIELD_NAMES.includes(item.value)) {
      return renderNumberFieldItem(item);
    }
    return <div className={styles['settings-item-child-row']}>{renderCheckboxItem(item)}</div>;
  };

  /**
   * 渲染股权分组。
   * @param {Array<object>} children 二级配置项
   * @returns {JSX.Element}
   */
  const renderEquitySectionContent = (children) => {
    const shareholderChildren = children.filter(
      (item) => EQUITY_PARENT_FIELD_MAP[item.value] === 'SH'
    );
    const historyShareholderChildren = children.filter(
      (item) => EQUITY_PARENT_FIELD_MAP[item.value] === 'HSH'
    );
    const otherChildren = children.filter((item) => EQUITY_PARENT_FIELD_MAP[item.value] === null);

    return (
      <div className={styles['settings-section-content']}>
        <div className={styles['settings-item-row']}>
          {renderCheckboxItem({
            value: 'SH',
            meaning: getItemLabel({
              value: 'SH',
              meaning: intl.get('sdat.supplier.view.title.shareholder').d('股东'),
            }),
          })}
        </div>
        <div className={styles['settings-item-children']}>
          {shareholderChildren.map((item) => (
            <React.Fragment key={item.value}>{renderEquityChildRow(item)}</React.Fragment>
          ))}
        </div>

        <div className={styles['settings-item-row']}>
          {renderCheckboxItem({
            value: 'HSH',
            meaning: getItemLabel({
              value: 'HSH',
              meaning: intl.get('sdat.supplier.view.title.hisShareholder').d('历史股东'),
            }),
          })}
        </div>
        <div className={styles['settings-item-children']}>
          {historyShareholderChildren.map((item) => (
            <React.Fragment key={item.value}>{renderEquityChildRow(item)}</React.Fragment>
          ))}
        </div>

        {otherChildren.map((item) => (
          <React.Fragment key={item.value}>{renderEquityChildRow(item)}</React.Fragment>
        ))}
      </div>
    );
  };

  /**
   * 渲染分组内容。
   * @param {string} categoryValue 一级分类 value
   * @returns {JSX.Element | null}
   */
  const renderSectionContent = (categoryValue) => {
    const children = childrenTypeMap[categoryValue] || [];
    if (!children.length) {
      return null;
    }
    if (categoryValue === 'EQUITY') {
      return renderEquitySectionContent(children);
    }
    const groupedFieldList = SETTINGS_GROUPED_FIELD_MAP[categoryValue];
    if (groupedFieldList?.length) {
      return (
        <div className={styles['settings-section-content']}>
          <div className={styles['settings-grid']}>
            {children
              .filter((item) => !SETTINGS_NUMBER_FIELD_NAMES.includes(item.value))
              .map((item) => renderCheckboxItem(item))}
          </div>
        </div>
      );
    }
    return (
      <div className={styles['settings-section-content']}>
        {children.map((item) => {
          if (SETTINGS_NUMBER_FIELD_NAMES.includes(item.value)) {
            return renderNumberFieldItem(item);
          }
          return renderCheckboxItem(item);
        })}
      </div>
    );
  };

  const tooltipMap = {
    EQUITY: (
      <div>
        <div>
          {intl
            .get('sdat.supplier.view.tips.equity.1')
            .d('1、通过企业/人员间存在股权投资关联的关系。')}
        </div>
        <div>
          {intl
            .get('sdat.supplier.view.tips.equity.2')
            .d('2、关系类型包括：股东关系、历史股东关系、分支机构。')}
        </div>
      </div>
    ),
    DJGF: (
      <div>
        <div>{intl.get('sdat.supplier.view.tips.djg.1')}</div>
        <div>{intl.get('sdat.supplier.view.tips.djg.2')}</div>
        <div>{intl.get('sdat.supplier.view.tips.djg.3')}</div>
      </div>
    ),
    CG: (
      <div>
        <div>{intl.get('sdat.supplier.view.tips.control.1')}</div>
        <div>{intl.get('sdat.supplier.view.tips.control.2')}</div>
        &nbsp;&nbsp;<div>{intl.get('sdat.supplier.view.tips.control.2.1')}</div>
        &nbsp;&nbsp;<div>{intl.get('sdat.supplier.view.tips.control.2.2')}</div>
        &nbsp;&nbsp;<div>{intl.get('sdat.supplier.view.tips.control.2.3')}</div>
        &nbsp;&nbsp;<div>{intl.get('sdat.supplier.view.tips.control.2.4')}</div>
      </div>
    ),
    CI: (
      <div>
        <div>{intl.get('sdat.supplier.view.tips.ci.1')}</div>
        <div>{intl.get('sdat.supplier.view.tips.ci.2')}</div>
      </div>
    ),
    WHITELIST: (
      <div>
        <div>{intl.get('sdat.supplier.view.tips.whitelist.1')}</div>
        <div>{intl.get('sdat.supplier.view.tips.whitelist.2')}</div>
      </div>
    ),
    STATUS: (
      <div>
        <div>{intl.get('sdat.supplier.view.tips.status.1')}</div>
        <div>{intl.get('sdat.supplier.view.tips.status.2')}</div>
      </div>
    ),
  };

  return (
    <div
      className={`${styles['settings-container']} ${
        isModal ? styles['settings-container-modal'] : ''
      }`}
    >
      <div className={`${styles['settings-section']} ${styles['settings-level-section']}`}>
        <div style={{ display: 'flex' }}>
          <div className={styles['settings-block-title']}>
            {intl.get('sdat.supplier.view.title.penetrationLevel').d('关系层级')}
          </div>
          <div className={styles['settings-level-body']}>
            <div className={styles['settings-level-slider-wrap']}>
              <Range
                range={false}
                value={levelValue}
                min={1}
                max={10}
                step={1}
                onChange={onLevelChange}
                style={{ width: '200px' }}
              />
              <NumberField
                style={{ marginLeft: '16px', width: '70px' }}
                value={levelValue}
                min={1}
                max={10}
                step={1}
                onChange={onLevelChange}
              />
            </div>
          </div>
        </div>

        <div className={styles['settings-level-tip']}>
          {intl
            .get('sdat.supplier.view.message.penetrationLevelTip')
            .d('设置需要排查的关系层级，层级越深，排查结果越全面')}
        </div>
      </div>

      <div className={styles['settings-block-title']}>
        {intl.get('sdat.supplier.view.title.companyMiningSetting').d('排查设置')}
      </div>

      {rootTypeList.map((category) => (
        <div key={category.value} className={styles['settings-section']}>
          {renderSectionTitle(
            getCategoryFieldName(category?.value),
            category?.meaning,
            tooltipMap[category?.value]
          )}
          {renderSectionContent(category.value)}
        </div>
      ))}
    </div>
  );
};

export default MiningSetting;
