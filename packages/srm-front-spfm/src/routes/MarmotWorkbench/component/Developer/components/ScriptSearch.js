import React from 'react';
import { message } from 'choerodon-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { withRouter } from 'dva/router';
import withProps from 'utils/withProps';
import { isFunction } from 'lodash';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import { getAdaptorDs, getAdaptorTaskHeadDs, getAdaptorTaskLineDs } from '../store/ScriptSearchDs';

const tenantFlag = isTenantRoleLevel();
function ScriptSearch(props = {}) {
  const {
    valueDs: { adaptorDs, taskHeadDs, taskLineDs },
    findAdaptor,
  } = props;

  const adaptorPosition = (record) => {
    const { runningService, taskCode, applyTenantNum, applyTenantName } = record.toData();
    if (tenantFlag) {
      if (findAdaptor && isFunction(findAdaptor)) {
        findAdaptor(runningService, taskCode);
      } else {
        message.destroy();
        message.config({
          top: 100,
          bottom: 100,
          duration: 3,
        });
        message.error(
          intl.get('spfm.script.view.message.find.noFunction').d('定位错误，请联系管理员')
        );
      }
    } else {
      props.history.push({
        pathname: `/spfm/adaptor-task/list`,
        query: {
          runningService,
          taskCode,
          applyTenantNum,
          applyTenantName,
        },
      });
    }
  };

  const fieldArr = tenantFlag
    ? [
        {
          name: 'description',
        },
      ]
    : [
        {
          name: 'applyTenantName',
          width: 190,
        },
        {
          name: 'description',
        },
        {
          name: 'scriptVersion',
          width: 100,
          renderer: ({ value }) => <p>V{value}</p>,
        },
      ];
  const columns = [
    {
      name: 'runningService',
      width: 260,
    },
    {
      name: 'taskCode',
      width: 260,
    },
    ...fieldArr,
    {
      name: 'creatorName',
      width: 80,
      lock: 'right',
    },
    {
      name: 'action',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => {
        const current = record.toData();
        const {
          applyTenantNum: debugTenantNum = 'SRM',
          taskCode,
          scriptVersion,
          adaptorLine = {},
        } = current;
        const saveScriptKey = `${taskCode}|${debugTenantNum}`;
        const lineData = [{ ...adaptorLine, taskCode }];
        return (
          <span className="action-link">
            <MarmotScriptButton
              saveScriptKey={saveScriptKey}
              scriptCacheKey="adaptorTask|MarmotScript"
              name="scriptContent"
              marmotScriptInput={
                lineData && lineData[0] && lineData[0].inputContent ? lineData[0].inputContent : ''
              }
              showSelectVersion
              scriptVersion={scriptVersion}
              testParam={{
                debugTenantNum,
              }}
              beforeOpenModal={(coverPropsFnc) => {
                taskHeadDs.loadData([current]);
                taskLineDs.loadData(lineData);
                coverPropsFnc({
                  record: taskLineDs.current,
                });
              }}
              buttonName={intl.get('spfm.script.view.message.detail').d('详情')}
              disabled
            />
            <a onClick={() => adaptorPosition(record)}>
              {intl.get('spfm.script.view.message.position').d('定位')}
            </a>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Header title={intl.get('spfm.adaptorMonitor.view.title.adaptorSearch').d('埋点脚本全览')} />
      <Content>
        <Table
          dataSet={adaptorDs}
          virtualCell
          columns={columns}
          queryBarProps={{ defaultShowMore: true }}
        />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.script', 'spfm.adaptorMonitor', 'hzero.common'],
})(
  withProps(
    () => {
      const adaptorDs = new DataSet(getAdaptorDs());
      const taskHeadDs = new DataSet(getAdaptorTaskHeadDs());
      const taskLineDs = new DataSet(getAdaptorTaskLineDs());
      const valueDs = {
        adaptorDs,
        taskHeadDs,
        taskLineDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(withRouter(ScriptSearch))
);
