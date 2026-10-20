import React, { useMemo, useEffect, useState, useCallback } from 'react';
import classnames from 'classnames';
import {
  DataSet,
  Modal,
  Button,
  NumberField,
  Form,
} from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import { isNil, keys } from 'lodash';

import PaperMarginSvg from '@/assets/sheet/paperMargin.svg';
import PaperMarginDefaultSvg from '@/assets/sheet/paperMargin_default.svg';
import PaperMarginWiderSvg from '@/assets/sheet/paperMargin_wider.svg';
import PaperMarginNarrowSvg from '@/assets/sheet/paperMargin_narrow.svg';

import intl from 'utils/intl';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-paper-margin';

export default function PaperMargin({ item, sheetRef, disabled }) {
  const { name, title, options } = item;
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('default');
  const [value, setValue] = useState();

  useEffect(() => {
    const initConfig = sheetRef.current.getPrintConfig();
    if (initConfig && !isNil(initConfig.margin)) {
      const {
        top: originTop,
        bottom: originBottom,
        left: originLeft,
        right: originRight,
        type: originType,
      } = initConfig.margin;
      const newValue = {
        top: Number((Number(originTop) / 10).toFixed(2)),
        bottom: Number((Number(originBottom) / 10).toFixed(2)),
        left: Number((Number(originLeft) / 10).toFixed(2)),
        right: Number((Number(originRight) / 10).toFixed(2)),
      };
      if (initConfig.margin.type) {
        setSelectedType(initConfig.margin.type);
        setValue(newValue);
      } else {
        const target = keys(options).find((i) => {
          const { top, bottom, left, right } = options[i];
          return (
            newValue.top === Number(top) &&
            newValue.bottom === Number(bottom) &&
            newValue.left === Number(left) &&
            newValue.right === Number(right)
          );
        });
        setValue(null);
        setSelectedType(target || 'custom');
      }
    }
  }, []);

  const formDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'marginTop',
          type: 'number',
          min: 0,
          max: 20,
          precision: 2,
          step: '0.01',
          defaultValue: 1.91,
          label: intl.get('hrpt.reportDesign.view.title.up').d('上'),
        },
        {
          name: 'marginBottom',
          type: 'number',
          min: 0,
          max: 20,
          precision: 2,
          step: '0.01',
          defaultValue: 1.91,
          label: intl.get('hrpt.reportDesign.view.title.down').d('下'),
        },
        {
          name: 'marginLeft',
          type: 'number',
          min: 0,
          max: 20,
          precision: 2,
          step: '0.01',
          defaultValue: 1.91,
          label: intl.get('hrpt.reportDesign.view.title.left').d('左'),
        },
        {
          name: 'marginRight',
          type: 'number',
          min: 0,
          max: 20,
          precision: 2,
          step: '0.01',
          defaultValue: 1.91,
          label: intl.get('hrpt.reportDesign.view.title.right').d('右'),
        },
        {
          name: 'alignVertival',
          type: 'boolean',
          label: intl.get('hrpt.reportDesign.view.title.alignVertival').d('垂直居中'),
        },
        {
          name: 'alignHorizontal',
          type: 'boolean',
          label: intl.get('hrpt.reportDesign.view.title.alignHorizontal').d('水平居中'),
        },
      ],
    });
  }, []);

  const handleClickItem = useCallback(
    (type) => {
      setPopupVisible(false);
      setSelectedType(type);
      if (type === 'custom') {
        openModal();
      } else {
        const { top, bottom, left, right } = options[type];
        setValue(null);
        sheetRef.current.setPrintConfig({
          margin: {
            top: Number((top * 10).toFixed(1)),
            bottom: Number((bottom * 10).toFixed(1)),
            left: Number((left * 10).toFixed(1)),
            right: Number((right * 10).toFixed(1)),
          },
        });
      }
    },
    [openModal, options, value]
  );

  const openModal = useCallback(() => {
    formDs.loadData([]);
    let record;
    if (value) {
      const { top, bottom, left, right } = value;
      record = formDs.create({
        marginTop: top,
        marginBottom: bottom,
        marginLeft: left,
        marginRight: right,
      });
    } else {
      record = formDs.create();
    }
    exitEditMode();
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.customePageMargin').d('自定义页边距'),
      className: styles['no-border-modal'],
      children: (
        <div>
          <div style={{ marginBottom: '12px' }}>{intl.get('hrpt.common.view.title.unitCm').d('单位：厘米')}</div>
          <Form labelLayout="float" columns={2} record={record} className={styles['no-colon-form']}>
            <NumberField name="marginTop" />
            <NumberField name="marginBottom" />
            <NumberField name="marginLeft" />
            <NumberField name="marginRight" />
          </Form>
        </div>
      ),
      onOk: handleSumbmit,
    });
  }, [value, formDs, handleSumbmit]);

  const handleSumbmit = useCallback(() => {
    const { marginTop, marginBottom, marginLeft, marginRight } = formDs.current.get([
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
    ]);
    setValue({
      top: marginTop,
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight,
    });
    sheetRef.current.setPrintConfig({
      margin: {
        top: Number((marginTop * 10).toFixed(1)),
        bottom: Number((marginBottom * 10).toFixed(1)),
        left: Number((marginLeft * 10).toFixed(1)),
        right: Number((marginRight * 10).toFixed(1)),
        type: 'custom',
      },
    });
  }, [formDs]);

  const renderItem = useCallback(
    (key) => {
      return (
        <div className={styles[`${clsPrefix}-menu-item-content`]}>
          <div>
            <div>
              <span>{intl.get('hrpt.reportDesign.view.title.up').d('上')}:</span>
              <span className={styles[`${clsPrefix}-menu-item-value`]}>{options[key].top}</span>
            </div>
            <div>
              <span>{intl.get('hrpt.reportDesign.view.title.down').d('下')}:</span>
              <span className={styles[`${clsPrefix}-menu-item-value`]}>{options[key].bottom}</span>
            </div>
          </div>
          <div>
            <div>
              <span>{intl.get('hrpt.reportDesign.view.title.left').d('左')}:</span>
              <span className={styles[`${clsPrefix}-menu-item-value`]}>{options[key].left}</span>
            </div>
            <div>
              <span>{intl.get('hrpt.reportDesign.view.title.right').d('右')}:</span>
              <span className={styles[`${clsPrefix}-menu-item-value`]}> {options[key].right}</span>
            </div>
          </div>
        </div>
      );
    },
    [options]
  );

  const content = useMemo(
    () => (
      <div className={styles[`${clsPrefix}-menu`]}>
        <div
          key="default"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClickItem('default')}
        >
          <div style={{ width: '16px' }}>
            {selectedType == 'default' && (
              <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
            )}
          </div>
          <div>
            <img src={PaperMarginDefaultSvg} />
          </div>
          <div>
            <div className={styles[`${clsPrefix}-menu-item-title`]}>
              {intl.get('hrpt.reportDesign.view.title.default').d('默认')}
            </div>
            {renderItem('default')}
          </div>
        </div>
        <div
          key="wider"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClickItem('wider')}
        >
          <div style={{ width: '16px' }}>
            {selectedType == 'wider' && (
              <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
            )}
          </div>
          <div>
            <img src={PaperMarginWiderSvg} />
          </div>
          <div>
            <div className={styles[`${clsPrefix}-menu-item-title`]}>
              <span>{intl.get('hrpt.reportDesign.view.title.wider').d('较宽')}</span>
            </div>
            {renderItem('wider')}
          </div>
        </div>
        <div
          key="narrow"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClickItem('narrow')}
        >
          <div style={{ width: '16px' }}>
            {selectedType == 'narrow' && (
              <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
            )}
          </div>
          <div>
            <img src={PaperMarginNarrowSvg} />
          </div>
          <div>
            <div className={styles[`${clsPrefix}-menu-item-title`]}>
              <span>{intl.get('hrpt.reportDesign.view.title.narrow').d('较窄')}</span>
            </div>
            {renderItem('narrow')}
          </div>
        </div>
        <div
          key="custom"
          className={classnames(
            styles[`${clsPrefix}-menu-item`],
            styles[`${clsPrefix}-menu-item-custom`]
          )}
          onClick={() => handleClickItem('custom')}
        >
          <div style={{ width: '16px' }}>
            {selectedType == 'custom' && (
              <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
            )}
          </div>
          <div>{intl.get('hrpt.reportDesign.view.title.custome').d('自定义')}</div>
        </div>
      </div>
    ),
    [handleClickItem, renderItem, selectedType, value]
  );

  const handleVisibleChange = useCallback((visible) => {
    setPopupVisible(visible);
  }, []);

  return (
    <Popover
      trigger={'click'}
      placement="bottomLeft"
      overlayClassName={styles[`${clsPrefix}-overlay`]}
      content={content}
      visible={popupVisible}
      disabled={disabled}
      onVisibleChange={handleVisibleChange}
    >
      <Button
        funcType="flat"
        className={classnames(styles[clsPrefix], { [styles['sheet-toolbar-diabled']]: disabled })}
      >
        <img src={PaperMarginSvg} />
        <span>{title} </span>
        <Icon type="arrow_drop_down" />
      </Button>
    </Popover>
  );
}
