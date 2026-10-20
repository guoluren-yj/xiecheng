/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import {
  fetchUpdateData,
  fetchAddData,
  fetchDisabledData,
  fetchEnabledData,
  fetchMultiLanguage,
  fetchSetNavigation,
  fetchCancelNavigation,
} from '@/services/aiAgent/appManageService';

import EditForm from './EditForm';

import { ServiceListDS, ServiceDetailDS, IntlMultiDS } from './stores/aiAppManageDS';

import styles from './index.less';

function AiAppManage(props) {
  const { listDS } = props;

  const detailDS = useMemo(() => new DataSet({ ...ServiceDetailDS(), forceValidate: true }), []);
  const intlMultiDS = useMemo(() => new DataSet({ ...IntlMultiDS() }), []);

  useEffect(() => {
    listDS.query();
  }, []);

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        header: intl.get('sdat.aiAppManage.view.model.serialNumber').d('序号'),
        width: 65,
        lock: 'left',
        renderer: ({ record }) => {
          const { currentPage, pageSize } = listDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'skillName',
        width: 200,
        lock: 'left',
      },
      {
        name: 'skillAliasName',
        width: 200,
      },
      {
        name: 'skillCode',
        width: 200,
      },
      {
        name: 'skillIcon',
        width: 100,
        // renderer: ({ text }) => {
        //   return text ? <Icon type={text} /> : text;
        // },
      },
      {
        name: 'skillType',
        width: 150,
      },
      {
        name: 'secretKey',
        width: 300,
      },
      {
        name: 'skillDesc',
        width: 200,
      },
      {
        name: 'suggestion',
        width: 200,
        renderer: ({ text }) => {
          const strList = text ? text.split('@') : [];
          return strList.length ? (
            <div>
              {strList?.map((item, index) => {
                return <div id={item}>{`${index + 1}.${item}`}</div>;
              })}
            </div>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'tenantName',
        width: 200,
      },
      {
        name: 'serviceType',
        width: 150,
      },
      {
        name: 'endPoint',
        width: 200,
      },
      {
        name: 'supplier',
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'sortNum',
        width: 100,
      },
      {
        name: 'enableFlag',
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value === 0
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </span>
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('sdat.aiAppManage.view.model.operation').d(' 操作'),
        width: 220,
        renderer: ({ record }) => {
          const enableFlag = record?.get('enableFlag');
          const navigationFlag = record?.get('navigationFlag');
          return (
            <span>
              <a onClick={() => handleOpenEditModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {[1, '1'].includes(enableFlag) ? (
                <a style={{ marginLeft: '10px' }} onClick={() => handleEnabled(record, 0)}>
                  {intl.get('hzero.common.status.disabled').d('禁用')}
                </a>
              ) : (
                <a style={{ marginLeft: '10px' }} onClick={() => handleEnabled(record, 1)}>
                  {intl.get('hzero.common.button.enabled').d('启用')}
                </a>
              )}
              {[1, '1'].includes(navigationFlag) ? (
                <a style={{ marginLeft: '10px' }} onClick={() => handleSetNavigation(record, 0)}>
                  {intl.get('sdat.aiAppManage.view.title.cancelSet').d('取消设置导航')}
                </a>
              ) : (
                <a style={{ marginLeft: '10px' }} onClick={() => handleSetNavigation(record, 1)}>
                  {intl.get('sdat.aiAppManage.view.title.setNavigation').d('设置导航')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
  };

  /**
   * 禁用启用操作
   */
  const handleEnabled = async (record, flag) => {
    const data = record?.toData() ?? {};
    let res = null;
    if ([0, '0'].includes(flag)) {
      // 禁用操作
      res = await fetchDisabledData({
        ...data,
        enableFlag: flag,
      });
    } else {
      res = await fetchEnabledData({
        ...data,
        enableFlag: flag,
      });
    }

    if (getResponse(res)) {
      notification.success();
      listDS.query();
    }
  };

  /**
   * 设置为导航
   * @param {*} record
   * @param {*} flag
   */
  const handleSetNavigation = async (record, flag) => {
    const data = record?.toData() ?? {};
    let res = null;
    if ([0, '0'].includes(flag)) {
      // 取消导航
      res = await fetchCancelNavigation({
        ...data,
        navigationFlag: flag,
      });
    } else {
      res = await fetchSetNavigation({
        ...data,
        navigationFlag: flag,
      });
    }

    if (getResponse(res)) {
      notification.success();
      listDS.query();
    }
  };

  const handleFormatEditData = async (words, _token) => {
    const defaultObj = {
      _token,
    };

    const tls = {
      suggestion1: {},
      suggestion2: {},
      suggestion3: {},
      suggestion4: {},
      suggestion5: {},
    };

    if (words.length) {
      words.forEach((rcd, index) => {
        defaultObj[`suggestion${index + 1}`] = rcd;
      });
    }

    const langMsg = await fetchMultiLanguage({
      fieldName: 'suggestion',
      _token,
    });

    if (langMsg.length) {
      langMsg.forEach((item) => {
        item.msgList = item?.value?.split('@') ?? [];
        if (item.msgList.length) {
          item.msgList.forEach((item2, index) => {
            tls[`suggestion${index + 1}`][item.code] = item2;
          });
        }
      });
    }

    defaultObj._tls = {
      ...tls,
    };
    intlMultiDS.loadData([{ ...defaultObj }]);
    return true;
  };

  /**
   * 新建或编辑数据
   * @param {object} item
   */
  const handleOpenEditModal = async (item) => {
    let modal = null;
    let editSuggestion = null;
    let skillConfigId = null;
    if (item) {
      editSuggestion = item?.get('suggestion') ?? '';
      // 编辑操作
      detailDS.loadData([
        {
          ...(item?.toData() ?? {}),
        },
      ]);
      const words = editSuggestion.split('@');
      const _token = item?.get('_token') ?? '';
      skillConfigId = item?.get('skillConfigId') ?? '';
      await handleFormatEditData(words, _token);
    } else {
      detailDS.loadData([]);
      detailDS.create({}, 0);
      intlMultiDS.loadData([]);
      intlMultiDS.create({}, 0);
    }

    const handleCloseModal = () => {
      if (modal) {
        detailDS.loadData([]);
        detailDS.reset();
        modal.close();
      }
    };

    const handleCreate = async () => {
      const isValid = await detailDS.validate();

      const suggestionObj = intlMultiDS?.toData()[0] ?? {};
      const { _tls = {} } = suggestionObj || {};
      const {
        suggestion1 = {},
        suggestion2 = {},
        suggestion3 = {},
        suggestion4 = {},
        suggestion5 = {},
      } = _tls || {};

      const tlsList = [suggestion1, suggestion2, suggestion3, suggestion4, suggestion5].filter(
        (rcd, index) => Object.keys(rcd).length > 0 && !!suggestionObj[`suggestion${index + 1}`]
      );

      const languageMap = {
        zh_CN: '',
        en_US: '',
        ja_JP: '',
      };

      languageMap.zh_CN = tlsList.map((rcd) => rcd?.zh_CN ?? '$').join('@');
      languageMap.en_US = tlsList.map((rcd) => rcd?.en_US ?? '$').join('@');
      languageMap.ja_JP = tlsList.map((rcd) => rcd?.ja_JP ?? '$').join('@');
      languageMap.th_TH = tlsList.map((rcd) => rcd?.th_TH ?? '$').join('@');
      languageMap.zh_TW = tlsList.map((rcd) => rcd?.zh_TW ?? '$').join('@');
      languageMap.vi_VN = tlsList.map((rcd) => rcd?.vi_VN ?? '$').join('@');
      languageMap.ru_RU = tlsList.map((rcd) => rcd?.ru_RU ?? '$').join('@');

      if (isValid) {
        const obj = detailDS?.current?.toData() ?? {};
        let res = null;
        if (obj._tls) {
          obj._tls.serviceName = obj._tls.serviceName || {};
          obj._tls.serviceName.zh_CN = obj.serviceName;
        }

        const params = {
          ...obj,
          _tls: {
            ...(obj?._tls ?? {}),
            suggestion: { ...languageMap },
          },
          suggestion: languageMap.zh_CN,
        };

        if (params.skillConfigId) {
          // 更新
          res = await fetchUpdateData([params]);
        } else {
          res = await fetchAddData([params]);
        }

        if (getResponse(res)) {
          notification.success();
          handleCloseModal();
          listDS.query();
          return res;
        }
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('sdat.aiAppManage.view.title.editAiService').d('编辑应用服务管理')
        : intl.get('sdat.aiAppManage.view.title.createAiService').d('新建应用服务管理'),
      children: (
        <EditForm
          detailDS={detailDS}
          intlMultiDS={intlMultiDS}
          editSuggestion={editSuggestion}
          skillConfigId={skillConfigId}
        />
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  return (
    <>
      <Header title={intl.get('sdat.aiAppManage.view.title.aiServiceMgt').d('AI应用服务管理')}>
        <Button icon="add" color="primary" onClick={() => handleOpenEditModal('')}>
          {intl.get('sdat.aiAppManage.view.title.createNew').d('新增')}
        </Button>
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          <Table
            dataSet={listDS}
            columns={columns()}
            rowHeight="auto"
            customizable
            customizedCode="SDAT.AI_AGENT_APPLICATION_MANAGE_LIST"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.aiAppManage', 'sdat.common'],
})(
  withProps(
    () => {
      const listDS = new DataSet(ServiceListDS());
      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AiAppManage)
);
