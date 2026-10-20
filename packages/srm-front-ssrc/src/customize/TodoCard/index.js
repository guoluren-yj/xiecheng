import React, { useMemo, useEffect, memo } from 'react';
import { message } from 'hzero-ui';
import { Card, Row, Col } from 'choerodon-ui';
import { Icon, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Link } from 'dva/router';
import classNames from 'classnames';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

// 得到ds
function getListDs(code) {
  return {
    paging: false,
    autoQuery: false,
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((f) => {
          Object.assign(f, { status: 'update' });
        });
        const showRecords = dataSet.filter((f) => f.get('isShow') === 0);
        dataSet.batchSelect(showRecords);
      },
    },
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/dashboard_clause`,
        method: 'GET',
      },
      submit: ({ dataSet }) => {
        const notClauses = dataSet
          .filter((f) => !f.isSelected)
          .map((m) => ({ ...m.toJSONData(), code, tenantId: userOrganizationId }));
        if (notClauses.length < 1) {
          notClauses.push({ code, tenantId: userOrganizationId });
        }
        return {
          url: `${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`,
          method: 'POST',
          data: notClauses,
        };
      },
    },
  };
}

const CardContent = observer(({ dataSet }) => {
  const showRecords = dataSet?.filter((f) => f.get('isShow') === 0);
  if (!dataSet || dataSet.status === 'loading' || showRecords.length < 1) {
    return <Card loading bordered={false} bodyStyle={{ padding: '0 20px' }} />;
  }
  return (
    <div className={styles['card-wait-deal-content']}>
      {showRecords.map((m) => (
        <Row className="card-content-row" key={`card-items-${m.get('clauseId')}`}>
          <Col span={20}>
            <Link to={m.get('menuCode')} className="card-content-row-link">
              {m.get('clauseName')}
            </Link>
          </Col>
          <Col span={4} className="card-content-row-num">
            {m.get('docCount')}
          </Col>
        </Row>
      ))}
    </div>
  );
});

// 待办类通用卡片
function TodoCard(props) {
  const { title, code, className = '' } = props;
  const dataSet = useMemo(() => new DataSet(getListDs(code)), []);
  useEffect(() => {
    if (code) {
      dataSet.setQueryParameter('code', code);
      dataSet.setQueryParameter('type', 'Customer');
      dataSet.query();
    }
  }, [code]);

  const handleConfigList = () => {
    Modal.open({
      title: intl
        .get(`spfm.dashboard.view.title.modalSelect`, { name: title })
        .d(`选择需要展示的${title}条目`),
      style: { width: 380 },
      children: (
        <Table
          dataSet={dataSet}
          columns={[
            {
              name: 'clauseName',
              width: 100,
              header: intl
                .get(`spfm.dashboard.view.modalTableColumn`, { name: title })
                .d(`${title}条目`),
            },
          ]}
        />
      ),
      onOk: async () => {
        if (dataSet.selected.length < 1) {
          message.warning(
            intl
              .get(`spfm.dashboard.view.message.confirm.selectedSetClause`, { name: title })
              .d(`请选择要显示的${title}条目！`)
          );
          return false;
        }
        const res = getResponse(await dataSet.submit());
        if (res) {
          dataSet.query();
          return true;
        }
        return false;
      },
    });
  };

  return (
    <div className={classNames({ [styles['card-wait-deal']]: true, [className]: true })}>
      <div className="card-body">
        <div className="card-header">
          <span className="card-title">{title}</span>
          <a className="card-icon" onClick={handleConfigList}>
            <Icon type="more_horiz" />
          </a>
        </div>
        <CardContent dataSet={dataSet} />
      </div>
    </div>
  );
}

export default memo(TodoCard);
