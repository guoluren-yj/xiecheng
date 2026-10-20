/*
 * @Description: 结算策略详情-带操作按钮的单选框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useCallback, memo } from 'react';
import { SelectBox, Tooltip, Icon, Output } from 'choerodon-ui/pro';
import { Card, Row, Col } from 'choerodon-ui';
import { isArray, isFunction, isString } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from '../CardTitle';
import { Store } from '../../StoreProvider';
import styles from './index.less';

/**
 * @description: 操作按钮
 * @param {Object} text 选项文本 onClick 操作按钮回调
 * @return {ReactNode}
 */
const Suffix = memo(({ text, onClick, name, option, changedModals }) => {
  const modalName = option ? name + option : name;
  const isChanged = changedModals.includes(modalName);
  return (
    <span>
      {text}
      <a
        className={`${styles['radio-suffix']} ${isChanged && styles['radio-suffix-changed']}`}
        onClick={onClick}
        style={name === 'invoicePaymentUxFlag' ? { marginLeft: 15 } : {}}
      >
        {intl.get(`ssta.settleStrategy.view.button.definitionDetail`).d('定义详情')}
      </a>
    </span>
  );
});

/**
 * @description: 带操作按钮的单选框
 * @param {String} name 绑定ds字段
 * @param {String}option 操作按钮显示选项
 * @param {Array} optionFuncs  多操作按钮选项回调集合
 * @param {Function} onSuffixClick 单操作按钮回调
 * @return {ReactNode}
 */
export default memo((props) => {
  const { editFlag, headerDs, settleConfigId, collectRef, changedModals } = useContext(Store);

  const {
    name,
    onSuffixClick,
    option = '1',
    optionFuncs,
    help,
    suffixHelp,
    effectiveTip,
    effectiveText,
    isShowText,
    wrapperStyle,
    firstLevelTitleFlag,
    hideLabelFlag,
    ...otherProps
  } = props;

  const title = useMemo(() => headerDs.getField(name)?.get('label'), [name, headerDs]);

  const handleSuffixClick = useCallback(
    (onClick) => {
      if (settleConfigId === 'create') {
        notification.warning({
          message: intl
            .get('ssta.settleStrategy.view.notification.saveStrategyFirst')
            .d('无法编辑，请填写策略名称，点击保存生成策略编码后，维护详情'),
        });
      } else {
        onClick();
      }
    },
    [settleConfigId]
  );

  /**
   * @description: 自定义选项
   * @param {Object} value 值 text 显示文本
   * @return {ReactNode/String} Suffix/text
   */
  const optionRenderer = useCallback(
    ({ value, text }) => {
      const suffix = suffixHelp ? (isString(suffixHelp) ? suffixHelp : suffixHelp[value]) : '';
      const suffixText = suffixHelp ? (
        <span>
          {text}
          {suffix && (
            <Tooltip title={suffix}>
              <Icon type="help" className={styles['select-card-label-help']} />
            </Tooltip>
          )}
        </span>
      ) : (
        text
      );
      if (isArray(optionFuncs)) {
        const { onSuffixClick: onClick, option: selectOption } =
          optionFuncs.find(
            (item) => item.option === headerDs.current?.get(name) && value === item.option
          ) || {};
        return isFunction(onClick) ? (
          <Suffix
            text={suffixText}
            name={name}
            option={selectOption}
            changedModals={changedModals}
            onClick={() => handleSuffixClick(onClick)}
          />
        ) : (
          suffixText
        );
      } else if (
        isFunction(onSuffixClick) &&
        headerDs.current?.get(name) === option &&
        value === option
      ) {
        return (
          <Suffix
            text={suffixText}
            name={name}
            changedModals={changedModals}
            onClick={() => handleSuffixClick(onSuffixClick)}
          />
        );
      } else {
        return suffixText;
      }
    },
    [
      name,
      option,
      onSuffixClick,
      headerDs,
      optionFuncs,
      suffixHelp,
      handleSuffixClick,
      changedModals,
    ]
  );

  const getContent = useCallback(() => {
    const commonProps = {
      name,
      dataSet: headerDs,
      ...otherProps,
    };
    if (isShowText) {
      return (
        <a onClick={onSuffixClick}>
          {intl.get(`ssta.settleStrategy.view.button.definitionDetail`).d('定义详情')}
        </a>
      );
    } else if (editFlag) {
      return <SelectBox vertical optionRenderer={optionRenderer} {...commonProps} />;
    } else {
      return <Output renderer={optionRenderer} {...commonProps} />;
    }
  }, [name, editFlag, headerDs, otherProps, isShowText, onSuffixClick, optionRenderer]);

  const getCardBody = useCallback(() => {
    return (
      <Row className={styles['select-box-row']}>
        {!hideLabelFlag && (
          <Col span={4} className={styles['select-box-label']}>
            {title}
            {help && (
              <Tooltip title={help}>
                <Icon type="help" className={styles['select-card-label-help']} />
              </Tooltip>
            )}
            {':'}
          </Col>
        )}
        <Col span={20} className={styles['select-suffix-content']}>
          {getContent()}
        </Col>
      </Row>
    );
  }, [help, title, getContent, hideLabelFlag]);

  return firstLevelTitleFlag ? (
    <div style={wrapperStyle}>
      <h3 className="ssta-form-title">{title}</h3>
      {getCardBody()}
    </div>
  ) : (
    <Card
      title={<CardTitle title={title} effectiveTip={effectiveTip} effectiveText={effectiveText} />}
      bordered={false}
      style={wrapperStyle}
      className={DETAIL_CARD_CLASSNAME}
      ref={(dom) => collectRef(dom, name)}
    >
      {getCardBody()}
    </Card>
  );
});
