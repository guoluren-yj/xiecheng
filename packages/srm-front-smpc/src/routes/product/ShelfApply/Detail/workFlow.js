import React, { useEffect, useState, useMemo } from 'react';
import { flowRight } from 'lodash';
import qs from 'qs';
import { DataSet, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';

import BaseInfo from './BaseInfo';
import LineDetail from './LineDetail';
import { baseInfoDs, lineDs } from './ds';
import styles from '../style.less';

const lineSearchCode = 'SMPC.SHELF_APPLY.LINE.SEARCH_BAR';

const SubContent = (props) => {
  const { id, title, style, children } = props;
  return (
    <div className={styles['sub-content-container']} id={id} style={style}>
      <div className="sub-content-header">
        <span>{title}</span>
      </div>
      <div className="sub-content-body">{children}</div>
    </div>
  );
};

function Detail(props) {
  const {
    match: {
      params: { status = '' },
    },
    location: { search = '' },
    onFormLoaded,
  } = props;
  const { applyHeaderId: aId } = qs.parse(search.substr(1));
  const [{ applyHeaderId, applyType }, setInitData] = useState({
    applyHeaderId: aId,
  });

  const headerDs = useMemo(() => new DataSet(baseInfoDs({ applyHeaderId })), [applyHeaderId]);
  const detailDs = useMemo(() => new DataSet(lineDs(lineSearchCode)), []);
  useEffect(() => {
    initData();
    detailDs.setQueryParameter('applyHeaderId', applyHeaderId);
  }, [applyHeaderId, status]);

  async function initData() {
    // console.log('初始化');
    if (applyHeaderId) {
      const headerRes = await headerDs.query();
      if (getResponse(headerRes)) {
        setInitData((pre) => ({ ...pre, ...headerRes }));
        if (onFormLoaded && headerDs.current) {
          onFormLoaded(true);
        }
      }
    }
    // 第一次新建， 没有uuid,
  }

  return (
    <>
      <Header title={intl.get('smpc.ShelfApply.view.title.applyDetail').d('申请详情')} />
      <Content>
        <SubContent title={intl.get('smpc.ShelfApply.view.baseInfo').d('基本信息')}>
          <BaseInfo
            readOnly
            dataSet={headerDs}
            // applyStatus={applyStatus}
            lineDs={detailDs}
          />
        </SubContent>
        {applyHeaderId && (
          <SubContent title={intl.get('smpc.ShelfApply.view.lineDetail').d('商品明细')}>
            <LineDetail
              isPub
              dataSet={detailDs}
              applyHeaderId={applyHeaderId}
              readOnly
              lineSearchCode={lineSearchCode}
              applyType={applyType}
              headerDs={headerDs}
            />
          </SubContent>
        )}
        {applyHeaderId && (
          <SubContent
            title={intl.get('smpc.ShelfApply.view.attachment').d('附件')}
            style={{ width: '50%' }}
          >
            <Attachment
              dataSet={headerDs}
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="smpc-shelf-file"
              labelLayout="float"
              // listType="picture"
              accept={['.rar', '.zip', '.doc', '.docx', '.pdf', 'image/*']}
              showValidation="newLine"
              readOnly
            />
          </SubContent>
        )}
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['sagm.common', 'smpc.ShelfApply'],
  })
)(Detail);
