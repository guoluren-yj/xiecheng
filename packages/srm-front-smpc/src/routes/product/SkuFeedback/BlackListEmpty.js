import React from 'react';
import intl from 'utils/intl';
import styles from './style.less';

const BlackListSvg = () => (
  <svg width="300px" height="165px">
    <defs>
      <filter
        x="-8.1%"
        y="-33.3%"
        width="116.2%"
        height="166.7%"
        filterUnits="objectBoundingBox"
        id="filter-1"
      >
        <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.317647059   0 0 0 0 0.345098039   0 0 0 0 0.454901961  0 0 0 0.15 0"
          type="matrix"
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"
        />
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g id="eclist" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="eclist-blacklist-empty" transform="translate(-680.000000, -433.000000)">
        <g id="group-20" transform="translate(680.000000, 433.000000)">
          <rect id="rect" x="0" y="0" width="300" height="165" />
          <g id="group-5" transform="translate(60.000000, 37.000000)">
            <rect id="rect" fill="#F6F7F8" x="0" y="0" width="180" height="128" rx="2" />
            <g id="group-6">
              <path
                d="M2,0 L178,0 C179.104569,-2.02906125e-16 180,0.8954305 180,2 L180,12 L180,12 L0,12 L0,2 C-1.3527075e-16,0.8954305 0.8954305,-2.41183085e-16 2,0 Z"
                id="rect2"
                fill="#DCDEE3"
              />
              <g id="group-3" transform="translate(8.000000, 4.000000)" fill="#FFFFFF">
                <circle id="circle" cx="2" cy="2" r="2" />
                <circle id="circle2" cx="10" cy="2" r="2" />
                <circle id="circle2-2" cx="18" cy="2" r="2" />
              </g>
            </g>
            <g id="group-4" transform="translate(8.000000, 20.000000)">
              <path
                d="M2,0 L162,0 C163.104569,-2.02906125e-16 164,0.8954305 164,2 L164,98 C164,99.1045695 163.104569,100 162,100 L2,100 C0.8954305,100 1.91162759e-15,99.1045695 0,98 L0,2 C-1.3527075e-16,0.8954305 0.8954305,1.97926296e-15 2,0 Z"
                id="rect"
                fill="#FFFFFF"
                opacity="0.89546131"
              />
              <path
                d="M10,8 L154,8 C155.104569,8 156,8.8954305 156,10 L156,34 C156,35.1045695 155.104569,36 154,36 L10,36 C8.8954305,36 8,35.1045695 8,34 L8,10 C8,8.8954305 8.8954305,8 10,8 Z"
                id="rect"
                fill="#EEEEF1"
              />
              <g id="group-14" transform="translate(8.000000, 72.000000)">
                <g id="group-7">
                  <g id="group-11" transform="translate(29.000000, 0.000000)" fill="#EEEEF1">
                    <rect id="rect" x="0" y="0" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="8" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="16" width="40" height="4" rx="1" />
                  </g>
                  <g id="group-12">
                    <rect
                      id="rect2-18"
                      fill="#FFFFFF"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <rect
                      id="rect"
                      fill="#F6F7F8"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <path
                      d="M15.7354021,8.30948837 L25,17.6716083 L25,19.4782609 C25,19.7664094 24.7664094,20 24.4782609,20 L4.16666667,20 L15.7354021,8.30948837 Z"
                      id="shapecombine"
                      fill="#DCDEE3"
                    />
                    <path
                      d="M6.60327366,9.65476254 L16.8407482,20 L0.52173913,20 C0.233590565,20 3.52880218e-17,19.7664094 0,19.4782609 L-1.42108547e-14,16.3275443 L6.60327366,9.65476254 Z"
                      id="shapecombine"
                      fill="#EEEEF1"
                    />
                    <ellipse
                      id="circle"
                      fill="#FFFFFF"
                      cx="4.16666667"
                      cy="4.21052632"
                      rx="2.08333333"
                      ry="2.10526316"
                    />
                  </g>
                </g>
                <g id="group-7" transform="translate(79.000000, 0.000000)">
                  <g id="group-11" transform="translate(29.000000, 0.000000)" fill="#EEEEF1">
                    <rect id="rect" x="0" y="0" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="8" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="16" width="40" height="4" rx="1" />
                  </g>
                  <g id="group-12">
                    <rect
                      id="rect2-18"
                      fill="#FFFFFF"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <rect
                      id="rect"
                      fill="#F6F7F8"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <path
                      d="M15.7354021,8.30948837 L25,17.6716083 L25,19.4782609 C25,19.7664094 24.7664094,20 24.4782609,20 L4.16666667,20 L15.7354021,8.30948837 Z"
                      id="shapecombine"
                      fill="#DCDEE3"
                    />
                    <path
                      d="M6.60327366,9.65476254 L16.8407482,20 L0.52173913,20 C0.233590565,20 3.52880218e-17,19.7664094 0,19.4782609 L-1.42108547e-14,16.3275443 L6.60327366,9.65476254 Z"
                      id="shapecombine"
                      fill="#EEEEF1"
                    />
                    <ellipse
                      id="circle"
                      fill="#FFFFFF"
                      cx="4.16666667"
                      cy="4.21052632"
                      rx="2.08333333"
                      ry="2.10526316"
                    />
                  </g>
                </g>
              </g>
              <g id="group-14" transform="translate(8.000000, 44.000000)">
                <g id="group-7">
                  <g id="group-11" transform="translate(29.000000, 0.000000)" fill="#EEEEF1">
                    <rect id="rect" x="0" y="0" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="8" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="16" width="40" height="4" rx="1" />
                  </g>
                  <g id="group-12">
                    <rect
                      id="rect2-18"
                      fill="#FFFFFF"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <rect
                      id="rect"
                      fill="#F6F7F8"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <path
                      d="M15.7354021,8.30948837 L25,17.6716083 L25,19.4782609 C25,19.7664094 24.7664094,20 24.4782609,20 L4.16666667,20 L15.7354021,8.30948837 Z"
                      id="shapecombine"
                      fill="#DCDEE3"
                    />
                    <path
                      d="M6.60327366,9.65476254 L16.8407482,20 L0.52173913,20 C0.233590565,20 3.52880218e-17,19.7664094 0,19.4782609 L-1.42108547e-14,16.3275443 L6.60327366,9.65476254 Z"
                      id="shapecombine"
                      fill="#EEEEF1"
                    />
                    <ellipse
                      id="circle"
                      fill="#FFFFFF"
                      cx="4.16666667"
                      cy="4.21052632"
                      rx="2.08333333"
                      ry="2.10526316"
                    />
                  </g>
                </g>
                <g id="group-7" transform="translate(79.000000, 0.000000)">
                  <g id="group-11" transform="translate(29.000000, 0.000000)" fill="#EEEEF1">
                    <rect id="rect" x="0" y="0" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="8" width="40" height="4" rx="1" />
                    <rect id="rect" x="0" y="16" width="40" height="4" rx="1" />
                  </g>
                  <g id="group-12">
                    <rect
                      id="rect2-18"
                      fill="#FFFFFF"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <rect
                      id="rect"
                      fill="#F6F7F8"
                      x="0"
                      y="0"
                      width="25"
                      height="20"
                      rx="0.52173913"
                    />
                    <path
                      d="M15.7354021,8.30948837 L25,17.6716083 L25,19.4782609 C25,19.7664094 24.7664094,20 24.4782609,20 L4.16666667,20 L15.7354021,8.30948837 Z"
                      id="shapecombine"
                      fill="#DCDEE3"
                    />
                    <path
                      d="M6.60327366,9.65476254 L16.8407482,20 L0.52173913,20 C0.233590565,20 3.52880218e-17,19.7664094 0,19.4782609 L-1.42108547e-14,16.3275443 L6.60327366,9.65476254 Z"
                      id="shapecombine"
                      fill="#EEEEF1"
                    />
                    <ellipse
                      id="circle"
                      fill="#FFFFFF"
                      cx="4.16666667"
                      cy="4.21052632"
                      rx="2.08333333"
                      ry="2.10526316"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g id="group-18" filter="url(#filter-1)" transform="translate(62.000000, 6.000000)">
              <g id="group-19">
                <g id="group-16">
                  <path
                    d="M2,0 L68,0 C69.1045695,-2.02906125e-16 70,0.8954305 70,2 L70,34 C70,35.1045695 69.1045695,36 68,36 L2,36 C0.8954305,36 1.02344917e-15,35.1045695 0,34 L0,2 C-1.3527075e-16,0.8954305 0.8954305,1.09108455e-15 2,0 Z"
                    id="rect"
                    fill="#FFFFFF"
                  />
                  <g id="group-7" transform="translate(8.000000, 8.000000)">
                    <g id="group-11" transform="translate(28.000000, 0.000000)" fill="#EEEEF1">
                      <rect id="rect" x="0" y="0" width="20" height="4" rx="1" />
                      <rect id="rect" x="0" y="8" width="20" height="4" rx="1" />
                      <rect id="rect" x="0" y="16" width="20" height="4" rx="1" />
                    </g>
                    <g id="group-12">
                      <rect
                        id="rect2-18"
                        fill="#FFFFFF"
                        x="0"
                        y="0"
                        width="24"
                        height="19"
                        rx="0.500869565"
                      />
                      <rect
                        id="rect"
                        fill="#F6F7F8"
                        x="0"
                        y="0"
                        width="24"
                        height="20"
                        rx="0.500869572"
                      />
                      <path
                        d="M15.105986,8.89401395 L23.999,17.787014 L24,19.4991304 C24,19.7757531 23.7757531,20 23.4991304,20 L4,20 L15.105986,8.89401395 Z"
                        id="shapecombine"
                        fill="#DCDEE3"
                      />
                      <path
                        d="M6.33914272,10.1720244 L16.1671183,20 L0.500869565,20 C0.224246943,20 3.38765009e-17,19.7757531 0,19.4991304 L-1.687539e-14,16.5111671 L6.33914272,10.1720244 Z"
                        id="shapecombine"
                        fill="#EEEEF1"
                      />
                      <circle id="circle" fill="#FFFFFF" cx="4" cy="4" r="2" />
                    </g>
                  </g>
                </g>
                <g id="group-16" transform="translate(78.000000, 0.000000)">
                  <path
                    d="M2,0 L68,0 C69.1045695,-2.02906125e-16 70,0.8954305 70,2 L70,34 C70,35.1045695 69.1045695,36 68,36 L2,36 C0.8954305,36 1.02344917e-15,35.1045695 0,34 L0,2 C-1.3527075e-16,0.8954305 0.8954305,1.09108455e-15 2,0 Z"
                    id="rect"
                    fill="#FFFFFF"
                  />
                  <g id="group-7" transform="translate(8.000000, 8.000000)">
                    <g id="group-11" transform="translate(28.000000, 0.000000)" fill="#EEEEF1">
                      <rect id="rect" x="0" y="0" width="20" height="4" rx="1" />
                      <rect id="rect" x="0" y="8" width="20" height="4" rx="1" />
                      <rect id="rect" x="0" y="16" width="20" height="4" rx="1" />
                    </g>
                    <g id="group-12">
                      <rect
                        id="rect2-18"
                        fill="#FFFFFF"
                        x="0"
                        y="0"
                        width="24"
                        height="19"
                        rx="0.500869565"
                      />
                      <rect
                        id="rect"
                        fill="#F6F7F8"
                        x="0"
                        y="0"
                        width="24"
                        height="20"
                        rx="0.500869572"
                      />
                      <path
                        d="M15.105986,8.89401395 L23.999,17.787014 L24,19.4991304 C24,19.7757531 23.7757531,20 23.4991304,20 L4,20 L15.105986,8.89401395 Z"
                        id="shapecombine"
                        fill="#DCDEE3"
                      />
                      <path
                        d="M6.33914272,10.1720244 L16.1671183,20 L0.500869565,20 C0.224246943,20 3.38765009e-17,19.7757531 0,19.4991304 L-1.64313008e-14,16.5111671 L6.33914272,10.1720244 Z"
                        id="shapecombine"
                        fill="#EEEEF1"
                      />
                      <circle id="circle" fill="#FFFFFF" cx="4" cy="4" r="2" />
                    </g>
                  </g>
                </g>
              </g>
              <g id="group-17" transform="translate(64.000000, 8.000000)">
                <circle
                  id="circle"
                  className={styles['black-list-empty-center']}
                  stroke="#F6F7F8"
                  strokeWidth="2"
                  fill="#00B8CC"
                  cx="10"
                  cy="10"
                  r="11"
                />
                <path
                  d="M13,10 L15,8 L13,6 L13,7.5 L5.5,7.5 L5.5,8.5 L13,8.5 L13,10 Z M7,10 L5,12 L7,14 L7,12.5 L14.5,12.5 L14.5,11.5 L7,11.5 L7,10 Z"
                  id="icon"
                  fill="#FFFFFF"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

export default function BlackListEmpty() {
  return (
    <div className={styles['black-list-empty']}>
      <BlackListSvg />
      <div className={styles['black-list-empty-text']}>
        {intl.get('smpc.feedback.view.noBlackListData').d('暂无黑名单数据')}
      </div>
    </div>
  );
}
