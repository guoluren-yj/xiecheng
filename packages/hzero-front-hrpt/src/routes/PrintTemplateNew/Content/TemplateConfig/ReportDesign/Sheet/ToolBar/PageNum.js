import React, { useCallback } from 'react';
import classnames from 'classnames';
import { Form, Modal, DataSet, Switch, SelectBox, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import PageNumber from '@/assets/sheet/pageNumber.svg';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-page-num';

function Formula({ cell, item, sheetRef, disabled }) {
  const { name, type, title } = item;

  const openSettingModal = useCallback(() => {
    const formDs = new DataSet({
      fields: [
        {
          name: 'enabled',
          label: intl.get('hrpt.reportDesign.view.button.enabled').d('开启'),
          type: 'boolean',
        },
        {
          name: 'positionType',
          label: intl.get('hrpt.reportDesign.view.button.position').d('位置'),
          type: 'number',
          defaultValue: 1,
          dynamicProps: {
            required: ({ record }) => {
              return !!record.get('enabled');
            },
          },
        },
        {
          name: 'alignType',
          label: intl.get('hrpt.reportDesign.view.button.alignType').d('对齐方式'),
          defaultValue: 1,
          type: 'number',
          dynamicProps: {
            required: ({ record }) => {
              return !!record.get('enabled');
            },
          },
        },
        {
          name: 'pattern',
          label: intl.get('hrpt.reportDesign.view.button.format').d('格式'),
          type: 'string',
          defaultValue: 'currentNum',
          dynamicProps: {
            required: ({ record }) => {
              return !!record.get('enabled');
            },
          },
        },
      ],
    });
    const pageNum = sheetRef.current.getPageNum();
    if (!pageNum) {
      formDs.create({
        enabled: false,
      });
    } else {
      formDs.create({
        ...pageNum,
        enabled: true,
      });
    }
    exitEditMode();
    Modal.open({
      className: styles['no-border-modal'],
      title: intl.get('hrpt.reportDesign.view.title.pageNumSetting').d('页码设置'),
      children: <SettingForm formDs={formDs} />,
      onOk: async () => {
        const flag = await formDs.validate();
        if (!flag) {
          return false;
        }
        const { enabled, positionType, alignType, pattern } = formDs.current.toData();
        if (!enabled) {
          sheetRef.current.setPageNum(undefined);
        } else {
          sheetRef.current.setPageNum({
            positionType,
            alignType,
            pattern,
          });
        }
      },
    });
  }, []);

  return (
    <div
      className={classnames(styles[`${clsPrefix}`], {
        [styles['sheet-toolbar-diabled']]: disabled,
      })}
      onClick={openSettingModal}
    >
      <img src={PageNumber} />
      <span>{title}</span>
    </div>
  );
}

export default observer(Formula);

const SettingForm = observer(({ formDs }) => {
  return (
    <Form dataSet={formDs}>
      <Switch name="enabled" />
      {formDs.current && formDs.current.get('enabled') && (
        <>
          <SelectBox name="positionType">
            <Select.Option value={0}>
              {intl.get('hrpt.reportDesign.pageNumSetting.paperHeader').d('页眉')}
            </Select.Option>
            <Select.Option value={1}>
              {intl.get('hrpt.reportDesign.pageNumSetting.paperFooter').d('页脚')}
            </Select.Option>
          </SelectBox>
          <SelectBox name="alignType">
            <Select.Option value={0}>
              {intl.get('hrpt.reportDesign.pageNumSetting.alignType.left').d('左')}
            </Select.Option>
            <Select.Option value={1}>
              {intl.get('hrpt.reportDesign.pageNumSetting.alignType.center').d('中')}
            </Select.Option>
            <Select.Option value={2}>
              {intl.get('hrpt.reportDesign.pageNumSetting.alignType.right').d('右')}
            </Select.Option>
          </SelectBox>
          <Select name="pattern">
            <Select.Option value={'currentNum'}>
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat6').d('1,2,3')}
            </Select.Option>
            <Select.Option value={'—currentNum—'}>
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat5').d('-1-,-2-,-3-')}
            </Select.Option>
            <Select.Option value={'currentNum/countNum'}>
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat4').d('1/X')}
            </Select.Option>
            <Select.Option
              value={intl.get('hrpt.reportDesign.pageNumSetting.pattern1').d('第currentNum页')}
            >
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat1').d('第1页')}
            </Select.Option>
            <Select.Option
              value={intl
                .get('hrpt.reportDesign.pageNumSetting.pattern2')
                .d('第currentNum页/共countNum页')}
            >
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat2').d('第1页/共X页')}
            </Select.Option>
            <Select.Option
              value={intl
                .get('hrpt.reportDesign.pageNumSetting.pattern3')
                .d('第currentNum页 共countNum页')}
            >
              {intl.get('hrpt.reportDesign.pageNumSetting.patternFormat3').d('第1页 共X页')}
            </Select.Option>
          </Select>
        </>
      )}
    </Form>
  );
});
