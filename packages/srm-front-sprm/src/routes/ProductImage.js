import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { SRM_SPRM } from '_utils/config';
// import { List } from 'choerodon-ui';
import { DataSet, Table, Picture } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

// import styles from './index.less';

const Index = props => {
  const { modal, href, currentPrLineId } = props;
  const params = querystring.parse((href || '').replace('/sprm/product-image', '').substr(1)) || {};
  const { prLineId, itemPic } = params;
  const [imageSrc, setImageSrc] = useState(true);

  const ds = useMemo(
    () =>
      new DataSet({
        selection: false,
        paging: false,
        autoQuery: false,
        primaryKey: 'prLineId',
        fields: [
          {
            name: 'primaryUrl',
            type: 'string',
          },
        ],
        transport: {
          read: ({ data }) => {
            if (data.prLineId) {
              return {
                url: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-request/purchase-platform/pr-line-primary-url`,
                method: 'GET',
                data,
              };
            }
          },
        },
        events: {
          load: ({ dataSet }) => {
            dataSet.forEach(ele => {
              setImageSrc(ele.get('primaryUrl'));
            });
          },
        },
      }),
    []
  );

  const columns = [
    {
      name: 'primaryUrl',
      style: { padding: 0 },
      // eslint-disable-next-line jsx-a11y/alt-text
      renderer: ({ value }) => (
        <Picture border src={value} objectFit="fill" objectPosition="center" />
      ),
    },
  ];

  useEffect(() => {
    if (modal) {
      modal.update({
        title: intl.get('sprm.common.model.view.mainImage').d('查看主图'),
        onOk: () => {},
        closable: true,
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: okBtn => okBtn,
      });
    }
    if (!itemPic) {
      if (currentPrLineId) {
        ds.setQueryParameter('prLineId', currentPrLineId);
        ds.query();
      } else {
        ds.setQueryParameter('prLineId', prLineId);
        ds.query();
      }
    } else {
      ds.loadData([{ primaryUrl: itemPic }]);
    }
  }, [prLineId, currentPrLineId, itemPic]);

  return imageSrc && (prLineId || currentPrLineId || itemPic) ? (
    <Table
      dataSet={ds}
      columns={columns}
      rowHeight="auto"
      showHeader={false}
      border={false}
      columnEditorBorder={false}
    />
  ) : (
    <span />
  );
};

export default formatterCollections({
  code: ['sprm.common', 'hzero.common'],
})(Index);
