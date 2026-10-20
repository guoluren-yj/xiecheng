import React, { useContext, useMemo, useCallback, memo } from 'react';
import { SelectBox, Tooltip, Icon, Output } from 'choerodon-ui/pro';
import { Card, Row, Col } from 'choerodon-ui';
import { isArray, isFunction, isString } from 'lodash';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from '../CardTitle';
import { Store } from '../../Detail';
import styles from './index.less';

interface SuffixProps {
  text: React.ReactNode;
  onClick: () => void;
  name: string;
  option?: string | number;
  changedModals: string[];
}

const Suffix = memo((props: SuffixProps) => {
  const { text, onClick, name, option, changedModals } = props;
  const modalName = option ? name + option : name;
  const isChanged = isArray(changedModals) && changedModals.includes(modalName);
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

interface SelectBoxCardProps {
  name: string;
  onSuffixClick?: () => void;
  option?: string | number;
  optionFuncs?: Array<{ option: string | number; onSuffixClick: () => void }>;
  help?: string;
  suffixHelp?: string | { [key: string]: string };
  effectiveTip?: string;
  effectiveText?: string;
  isShowText?: boolean;
  wrapperStyle?: React.CSSProperties;
  firstLevelTitleFlag?: boolean;
  hideLabelFlag?: boolean;
}

export default memo((props: SelectBoxCardProps) => {
  const { editFlag, formDs, changedModals } = useContext(Store);

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

  const title = useMemo(() => formDs.getField(name)?.get('label'), [name, formDs]);

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
            (item) => item.option === formDs.current?.get(name) && value === item.option
          ) || {};
        return isFunction(onClick) ? (
          <Suffix
            text={suffixText}
            name={name}
            option={selectOption}
            changedModals={changedModals}
            onClick={() => onClick()}
          />
        ) : (
          suffixText
        );
      } else if (
        isFunction(onSuffixClick) &&
        formDs.current?.get(name) === option &&
        value === option
      ) {
        return (
          <Suffix
            text={suffixText}
            name={name}
            changedModals={changedModals}
            onClick={() => onSuffixClick()}
          />
        );
      } else {
        return suffixText;
      }
    },
    [
      name,
      option,
      formDs,
      suffixHelp,
      optionFuncs,
      onSuffixClick,
      changedModals,
    ]
  );

  const getContent = useCallback(() => {
    const commonProps = {
      name,
      dataSet: formDs,
      ...otherProps,
    };
    if (isShowText) {
      return (
        <a onClick={onSuffixClick}>
          {intl.get(`ssta.invoiceRule.view.button.definitionDetail`).d('定义详情')}
        </a>
      );
    } else if (editFlag) {
      return <SelectBox vertical optionRenderer={optionRenderer} {...commonProps} />;
    } else {
      return <Output renderer={optionRenderer} {...commonProps} />;
    }
  }, [name, editFlag, formDs, otherProps, isShowText, onSuffixClick, optionRenderer]);

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
    >
      {getCardBody()}
    </Card>
  );
});
