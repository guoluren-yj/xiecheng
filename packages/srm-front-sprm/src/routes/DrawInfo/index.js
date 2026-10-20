import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
// import { List } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose, isFunction } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { DataSet, Table, Attachment } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryDrawInfo } from '@/services/drawInfoService';
import { getResponse } from 'utils/utils';

// import styles from './index.less';

const Index = (props) => {
  const { modal, href, remote, customizeTable } = props;
  const { handleCuxDownLoad = null, handleCuxDisplayLink = null, attachmentCuxProps = {} } = remote.props.process;
  const params = querystring.parse((href || '').replace('/sprm/draw-info', '').substr(1)) || {};

  const ds = useMemo(
    () =>
      new DataSet({
        selection: false,
        paging: false,
        fields: [
          {
            name: 'drawingLinkList',
            type: 'string',
            label: intl
              .get('smdm.materialApplication.model.materialApplication.link')
              .d('图纸链接'),
          },
          {
            name: 'drawingVersion',
            type: 'string',
            label: intl
              .get('smdm.materialApplication.model.materialApplication.drawingVersion')
              .d('版本'),
          },
          {
            name: 'drawingVersionText',
            type: 'string',
            label: intl
              .get('smdm.materialApplication.model.materialApplication.drawingVersionText')
              .d('图纸版本（支持非数字）'),
          },
        ],
      }),
    []
  );

  const columns = () => {
    const cols = [
      {
        name: 'drawingLinkList',
        renderer: ({ record, value }) => {
          return record.get('drawingSourceCode') === 'OBS' ? (
            <Attachment
              readOnly
              viewMode="popup"
              downloadAll={false}
              value={record.get('attachmentUuid')}
              bucketName={record.get('bucketName')}
              {...(attachmentCuxProps || {})}
            />
          ) : (
            value?.map((i) => (
              <div style={{ marginBottom: '10px' }}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(i, record);
                  }}
                >
                  {isFunction(handleCuxDisplayLink) ? handleCuxDisplayLink(record, value, i) : i}
                </a>
              </div>
            ))
          );
        },
      },
      // {
      //   name: 'attributeLongtext10',
      //   renderer: () => {
      //     return <Attachment readOnly funcType='link' value='300c869c7df3564fd1a61aca359e9787e4' buttons={[[]]} downloadAll={false} viewMode="popup" bucketName='/private-bucket' bucketDirectory='sprm-pr'
      //       attachmentLimit={() => { return { preview: true, download: false, remove: false } }} />;
      //   },
      // },
      {
        name: 'drawingVersion',
        width: 60,
      },
      {
        name: 'drawingVersionText',
        width: 60,
      },
    ];
    const newCols = remote?.process('SPRM_DRAWING_INFO_COLS', cols, { cols, ...props }) || cols;
    return newCols;
  };

  useEffect(() => {
    if (modal) {
      modal.update({
        title: intl
          .get('smdm.materialApplication.model.materialApplication.drawInfo')
          .d('图纸信息'),
      });
    }

    // setLoading(true);
    queryDrawInfo(params).then((res) => {
      if (getResponse(res)) {
        // setData(res);
        ds.loadData(res);
      }
    });
    // .finally(() => {
    //   setLoading(false);
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLinkClick = (url, record) => {
    if (isFunction(handleCuxDownLoad)) {
      handleCuxDownLoad(url, record, params);
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div>
      <div style={{ color: 'red', padding: '10px' }}>
        {intl
          .get('smdm.materialApplication.model.materialApplication.drawInfoTip')
          .d('若未顺利下载，请切换浏览器或复制链接直接访问')}
      </div>
      {customizeTable(
        {
          code: 'SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO',
          dataSet: ds,
        },
        <Table dataSet={ds} columns={columns()} />
      )}
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['smdm.common', 'smdm.materialApplication'],
  }),
  cuxRemote(
    {
      code: 'SPRM_DRAWING_INFO', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleCuxDownLoad: undefined,
        handleCuxDisplayLink: undefined,
      },
    }
  ),
  withCustomize({
    unitCode: ['SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO'],
  })
)(Index);
