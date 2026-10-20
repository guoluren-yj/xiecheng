/**
 * 主题配置-审批记录
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @since: 2022-07-14 14:23:03
 * @description: 主题配置-审批记录
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { Timeline, Spin, Icon } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_HPFM } from '_utils/config';
import { addIntlColor, groupOpLog } from './util';

export default formatterCollections({
  code: ['hiam.theme'],
})(() => {
  const [data, setData] = useState({
    loading: true,
    recordGroups: [],
  });

  useEffect(() => {
    try {
      request(`${SRM_HPFM}/v1/${getCurrentOrganizationId()}/theme-op-log?size=100`).then((res) => {
        if (getResponse(res)) {
          setData({
            loading: false,
            recordGroups: groupOpLog(res.content),
          });
        }
      });
    } catch (error) {
      setData({
        loading: false,
        recordGroups: [],
      });
    }
  }, []);

  const getFontDesc = (opType, opContent) => {
    if (opType === 'UPLOAD') {
      return (
        <>
          {intl.get('hiam.theme.view.history.upload').d('上传了')}
          {intl.get('hiam.theme.view.title.config.font').d('字体')}【
          {opContent.split('@').slice(-1)}】
          <a download={opContent} href={opContent}>
            <Icon type="get_app" style={{ fontSize: 16 }} />
          </a>
        </>
      );
    }

    return (
      <>
        {intl.get('hiam.theme.view.history.delete').d('删除了')}
        {intl.get('hiam.theme.view.title.config.font').d('字体')}【{opContent.split('@').slice(-1)}
        】
      </>
    );
  };

  const changeText = (value, meaning, mappingText) => {
    const values = value.split('|').map((i) => (mappingText && mappingText[i]) || i);
    return intl
      .get('hiam.theme.view.history.desc', {
        state: `【${meaning}】`,
        before: `__${values[0]}__`,
        after: `__${values[1]}__`,
      })
      .d(`将【${meaning}】由__${values[0]}__改变为__${values[1]}__`);
  };
  const getOtherDesc = (value, meaning) => {
    const descIntl = changeText(value, meaning);
    return addIntlColor(descIntl);
  };

  const getHistoryDesc = (record) => {
    const { opType, opContent, opObject, opObjectMeaning } = record;
    switch (opObject) {
      case 'FONT_PACKAGE':
        return getFontDesc(opType, opContent);
      case 'THEME_CONFIG':
        if (opType === 'RESET') return intl.get('hiam.theme.view.history.reset').d('恢复了默认');
        return changeText(opContent, intl.get('hiam.theme.view.title.theme').d('主题'), {
          0: intl.get('hiam.theme.view.title.oldTheme').d('老主题'),
          1: intl.get('hiam.theme.view.title.newTheme').d('新主题(推荐)'),
        }).replace(/__/g, '');
      case 'PS_TABLE_DENSITY':
        return changeText(opContent, intl.get('hiam.theme.view.title.tableDensty').d('表格密度'), {
          small: intl.get('hiam.theme.view.title.tableDenstySmall').d('紧凑'),
          default: intl.get('hiam.theme.view.title.tableDenstyStd').d('标准'),
        }).replace(/__/g, '');
      case 'PS_LINE_FEED':
        return changeText(opContent, intl.get('hiam.theme.view.title.menuLineWrap').d('菜单换行'), {
          0: intl.get('hiam.theme.view.title.lineWrapNot').d('省略显示'),
          1: intl.get('hiam.theme.view.title.lineRwapIs').d('换行显示'),
        }).replace(/__/g, '');
      case 'PS_FORM_LAYOUT':
        return changeText(opContent, intl.get('hiam.theme.view.title.formLayout').d('表单布局'), {
          100: intl.get('hiam.theme.view.title.padType100').d('填充率100%'),
          75: intl.get('hiam.theme.view.title.padType75').d('填充率75%'),
        }).replace(/__/g, '');
      default:
        return getOtherDesc(opContent, opObjectMeaning);
    }
  };
  return (
    <Spin spinning={data.loading}>
      <Timeline>
        {data.recordGroups.length > 0 &&
          data.recordGroups.map((group = {}) => {
            const { realName, loginName, lastUpdateDate } = group[0] || {};
            return (
              <Timeline.Item color="#e5e5e5">
                <Icon type="mode_edit" />
                <div className="right-content">
                  <p>
                    <b>
                      {realName}({loginName})
                    </b>
                    {intl.get('hiam.theme.view.history.update.theme').d('修改了')}
                    <b>【{intl.get('hiam.theme.view.theme').d('主题')}】</b>
                  </p>
                  {group.map((record) => (
                    <p>
                      <b>{realName}</b>
                      {getHistoryDesc(record)}
                    </p>
                  ))}
                  <p>{lastUpdateDate}</p>
                </div>
              </Timeline.Item>
            );
          })}
      </Timeline>
    </Spin>
  );
});
