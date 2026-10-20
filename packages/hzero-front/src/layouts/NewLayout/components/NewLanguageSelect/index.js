/**
 * NewLanguageSelect
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Select, DataSet, Lov } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import { connect } from 'dva';

import { queryTimeZoneList, updateDefaultTimeZone } from 'services/api/language';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT } from 'utils/constants';
import { getCurrentOrganizationId, getCurrentUser, getResponse } from 'utils/utils';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const NewLanguageSelect = function NewLanguageSelect(props) {
  const {
    language,
    supportLanguage = [],
    loading = false,
    className,
    optionClassName,
    onUpdateDefaultLanguage,
    querySupportLanguage,
    popupContentClassName,
    popupClassName,
    timeZone,
    dayLightFlag,
  } = props;
  
  const [timeZoneList, setTimeZoneList] = useState([]);

  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        { name: 'lang', defaultValue: language },
        { name: 'tz',  defaultValue: timeZone },
      ],
    });
  }, [language, timeZone]);

  const langName = useMemo(() => {
    const lang =
      supportLanguage && language && supportLanguage.length
        ? supportLanguage.find(l => l.value === language)
        : undefined;
    return lang ? lang.name || '' : '';
  }, [language, supportLanguage]);

  const timeZoneName = useMemo(() => {
    const tz =
      timeZoneList && timeZone && timeZoneList.length
        ? timeZoneList.find(l => l.zoneId === timeZone)
        : undefined;
    let tzName = tz ? tz.zoneName : '';    
    if (tzName) {
      tzName = (tzName.match(/\(([^()]*)\)/) || [])[1];
    }
  return tzName || timeZone;
  }, [timeZone, timeZoneList]);

  useEffect(() => {
    getTimeZoneList();
  }, []);

  const getTimeZoneList = async() => {
    const res = await queryTimeZoneList(dayLightFlag);
    if (getResponse(res) && res) {
      if (dayLightFlag && res.content && res.content.length) {
        setTimeZoneList(res.content);
      } else if (!dayLightFlag && res.length) {
        setTimeZoneList(
          res.map(i => ({
            zoneId: i.value,
            zoneName: `(${i.value})${i.meaning}`
          }))
        );
      }
    }
  };

  const handleVisibleChange = (visible) => {
    if (visible || !formDs.current) {
      return;
    }
    const { lang, tz } = formDs.current.get(['lang', 'tz']);
    const langChanged = lang !== language;
    const timeZoneChanged = tz !== timeZone;
    if (langChanged || timeZoneChanged) {
      const queue = [];
      if (langChanged) {
        queue.push(onUpdateDefaultLanguage({ language: lang }));
      }
      if (timeZoneChanged) {
        queue.push(updateDefaultTimeZone({ timeZone: tz }));
      }
      Promise.all(queue).then(() => {
        if (langChanged) {
          cookies.set('language', lang, { path: '/' });
          // 切换语言时记录当前登陆租户、角色和语言
          const { currentRoleId } = getCurrentUser();
          localStorage.setItem(
            CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
            `${getCurrentOrganizationId()}-${currentRoleId}-${lang}-${tz}`
          );
        }
        localStorage.removeItem(YQCLOUD_TABMAP);
        localStorage.removeItem(YQCLOUD_COUNT);
        window.location.reload();
      });
    }
  };

      
  const content = (
    <div className={popupContentClassName}>
      <Select dataSet={formDs} name='lang' clearButton={false}>
        {supportLanguage.map((locale) => (
          <Select.Option key={locale.code} value={locale.code}>
            {locale.name}
          </Select.Option>
        ))}
      </Select>
      <Select
        dataSet={formDs}
        name='tz'
        clearButton={false}
        style={{ marginTop: '16px', display: 'block' }}
        searchable
        searchMatcher={({ record, text, textField }) =>
          record.get(textField) && text && record.get(textField).toLowerCase().indexOf(text.toLowerCase()) !== -1}
      >
        {timeZoneList.map((locale) => (
          <Select.Option key={locale.zoneId} value={locale.zoneId}>
            {locale.zoneName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger='click'
      overlayClassName={popupClassName}
      onVisibleChange={handleVisibleChange}
    >
      <span className={className}>
        <Icon type='language' />
        <span>{langName}</span>|<span>{timeZoneName}</span>
        <Icon type="expand_more" />
      </span>
    </Popover>
  )
};

export default connect(
  ({ global = {}, user = {}, loading = { effects: {} } }) => ({
    supportLanguage: global.supportLanguage, // 可供切换的语言
    language: global.language, // 当前的语言
    timeZone: (user.currentUser ||{}).timeZone,
    dayLightFlag: (user.currentUser || {}).dayLightFlag,
    loading:
      loading.effects['global/changeLanguage'] ||
      loading.effects['global/updateDefaultLanguage'] ||
      loading.effects['global/querySupportLanguage'],
  }),
  (dispatch) => ({
    onChangeLanguage: (payload) =>
      dispatch({
        type: 'global/changeLanguage',
        payload,
      }),
    onUpdateDefaultLanguage: (payload) =>
      dispatch({
        type: 'global/updateDefaultLanguage',
        payload,
      }),
    querySupportLanguage: () =>
      dispatch({
        type: 'global/querySupportLanguage',
      }),
  })
)(NewLanguageSelect);
