import React, { useEffect, useState, useMemo } from 'react';
import { DataSet, Row, Col, Spin, Form, SelectBox, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { getMemberLabel } from '@/services/memberCentreService';

import styles from './index.less';

const initialCache = {
  page: 0, // 记录分页
  data: [], // 记录查询结果
  showMore: false, // 是否还有更多
};

export default function LabelEditModal(props) {
  const { modal, handleSave = (e) => e } = props;
  // 单次请求的数量
  const pageSize = 15;
  const [loading, setLoading] = useState(false);
  const [memberLabels, setMemberLabels] = useState([]);
  const [cache, setCache] = useState(initialCache);

  const { data, page, showMore } = cache;

  const labelDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'memberLabel',
            textField: 'labelName',
            valueField: 'labelId',
            options: new DataSet({
              paging: false,
              data,
            }),
            multiple: true,
          },
        ],
      }),
    [data]
  );

  useEffect(() => {
    setChecked(memberLabels);
  }, [labelDs]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, []);

  async function loadData(_page = 0) {
    const params = {
      enabledFlag: 1,
      page: _page,
      size: pageSize,
    };
    const res = await getMemberLabel(params);
    if (getResponse(res)) {
      const { content, totalPages } = res;
      const isMore = totalPages > _page + 1;
      // 查询条件是否变更
      let _data = content || [];
      if (_page > 0) {
        _data = [...data, ..._data];
        setCache({
          page: _page,
          showMore: isMore,
          data: _data,
        });
        setMemberLabels((pre) => pre);
      } else {
        setLoading(false);
        setCache({
          page: _page,
          showMore: isMore,
          data: _data,
        });
      }
    }
  }

  function setChecked(labels) {
    if (labelDs.current) {
      labelDs.current.set(
        'memberLabel',
        labels.map((m) => m.labelId)
      );
    }
  }

  function handleChange(value) {
    const filterData = (value || []).map((m) => data.find((f) => f.labelId === m));
    setMemberLabels(filterData);
  }
  if (modal) {
    modal.handleOk(() => handleSave(memberLabels));
  }

  function handelCloseLabel(labelId) {
    const labels = memberLabels.filter((_l) => _l.labelId !== labelId);
    setMemberLabels(labels);
    setChecked(labels);
  }

  return (
    <Row className={styles['label-modal-content']}>
      <Col span={12} className={styles['label-modal-left']}>
        {/* <p>{intl.get('sigl.memberCenter.view.labelModal.title.chooseLabel').d('选择标签')}</p> */}
        <Spin spinning={loading}>
          <Form columns={1} className={styles['label-modal-left-form']} dataSet={labelDs}>
            <SelectBox name="memberLabel" vertical onChange={handleChange} />
          </Form>
          {showMore && (
            <Button
              funcType="link"
              color="primary"
              onClick={() => loadData(page + 1)}
              className={styles['load-more']}
            >
              {intl.get('sigl.memberCenter.view.button.loadMore').d('加载更多')}
            </Button>
          )}
        </Spin>
      </Col>
      <Col span={12} className={styles['label-modal-right']}>
        <p className={styles['right-title']}>
          <span>{intl.get('sigl.memberCenter.view.labelModal.title.choosed').d('已选择')}</span>
          <span className={styles['right-title-count']}>{memberLabels.length}</span>
          <span>{intl.get('sigl.memberCenter.view.labelModal.title.tags').d('个标签')} </span>
        </p>
        <div>
          {memberLabels.map((label) => (
            <Tag closable onClose={() => handelCloseLabel(label.labelId)} key={label.labelId}>
              {label.labelName}
            </Tag>
          ))}
        </div>
      </Col>
    </Row>
  );
}
