import React from 'react';
import intl from 'utils/intl';
import { getClassName } from '../../utils';

const Notice = function () {
  return (
    <div className={getClassName('notice', 'wrapper')}>
      <div className={getClassName('notice')}>
        <svg width="194px" height="132px" viewBox="0 0 194 132">
          <title>notice</title>
          <defs>
            <filter x="-3.5%" y="-5.5%" width="107.1%" height="111.0%" filterUnits="objectBoundingBox" id="filter-1">
              <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
              <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
            <path d="M6.28222222,5.03448276 L30.1333333,5.03448276 L30.1333333,5.03448276 L30.1333333,67.9655172 L6.28222222,67.9655172 C5.58634344,67.9655172 5.02222222,67.401396 5.02222222,66.7055172 L5.02222222,6.29448276 C5.02222222,5.59860397 5.58634344,5.03448276 6.28222222,5.03448276 Z" id="path-2"></path>
            <filter x="-6.0%" y="-2.4%" width="111.9%" height="104.8%" filterUnits="objectBoundingBox" id="filter-3">
              <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.05 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
            </filter>
            <path d="M35.1555556,5.03448276 L106.717778,5.03448276 C107.413657,5.03448276 107.977778,5.59860397 107.977778,6.29448276 L107.977778,66.7055172 C107.977778,67.401396 107.413657,67.9655172 106.717778,67.9655172 L35.1555556,67.9655172 L35.1555556,67.9655172 L35.1555556,5.03448276 Z" id="path-4"></path>
            <filter x="-2.1%" y="-2.4%" width="104.1%" height="104.8%" filterUnits="objectBoundingBox" id="filter-5">
              <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.05 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
            </filter>
            <polygon id="path-6" points="2.19722222 3.16988865 3.32879167 3.85452586 3.02850463 2.56417744 4.02824074 1.69599138 2.71173842 1.58402658 2.19722222 0.3670977 1.68270602 1.58402658 0.366203702 1.69599138 1.36593981 2.56417744 1.06565278 3.85452586"></polygon>
            <polygon id="path-8" points="12.1071429 6.68610775 12.1071429 7.87793165 4.74357857 7.87793165 8.11420714 11.2847032 7.26428571 12.1366995 2.42142858 7.2820197 7.26428571 2.42733991 8.11420714 3.27933621 4.74357857 6.68610775"></polygon>
            <rect id="path-10" x="0" y="0" width="60" height="24" rx="3"></rect>
            <filter x="-145.0%" y="-312.5%" width="390.0%" height="825.0%" filterUnits="objectBoundingBox" id="filter-11">
              <feMorphology radius="8" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
              <feOffset dx="0" dy="12" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="19" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.03 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
              <feOffset dx="0" dy="9" in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
              <feGaussianBlur stdDeviation="9" in="shadowOffsetOuter2" result="shadowBlurOuter2"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.05 0" type="matrix" in="shadowBlurOuter2" result="shadowMatrixOuter2"></feColorMatrix>
              <feMorphology radius="4" operator="erode" in="SourceAlpha" result="shadowSpreadOuter3"></feMorphology>
              <feOffset dx="0" dy="6" in="shadowSpreadOuter3" result="shadowOffsetOuter3"></feOffset>
              <feGaussianBlur stdDeviation="5.5" in="shadowOffsetOuter3" result="shadowBlurOuter3"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" type="matrix" in="shadowBlurOuter3" result="shadowMatrixOuter3"></feColorMatrix>
              <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="shadowMatrixOuter2"></feMergeNode>
                <feMergeNode in="shadowMatrixOuter3"></feMergeNode>
              </feMerge>
            </filter>
            <polygon id="path-12" points="6 8.635 9.09 10.5 8.27 6.985 11 4.62 7.405 4.315 6 0.999999996 4.595 4.315 0.999999996 4.62 3.73 6.985 2.91 10.5"></polygon>
          </defs>
          <g id="菜单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="菜单-空态" transform="translate(-36.000000, -198.000000)">
              <g id="编组-6" transform="translate(1.000000, 48.000000)">
                <g id="notice" transform="translate(35.000000, 192.000000)">
                  <rect id="矩形" x="0" y="0" width="140" height="79"></rect>
                  <g id="编组-16" filter="url(#filter-1)" transform="translate(13.000000, 6.000000)">
                    <rect id="矩形" fill="#F2F3F5" x="0" y="0" width="113" height="73" rx="1.89"></rect>
                    <g id="矩形" opacity="0.901204427">
                      <use fill="black" fill-opacity="1" filter="url(#filter-3)" href="#path-2"></use>
                      <use fill="#FFFFFF" fill-rule="evenodd" href="#path-2"></use>
                    </g>
                    <g id="矩形" opacity="0.897693452">
                      <use fill="black" fill-opacity="1" filter="url(#filter-5)" href="#path-4"></use>
                      <use fill="#FFFFFF" fill-rule="evenodd" href="#path-4"></use>
                    </g>
                    <rect id="矩形" fill="#CFD8E5" x="9.02222222" y="10.0344828" width="13.8111111" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形" fill="#CFD8E5" x="24.0222222" y="10.0344828" width="3.76666667" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-3" fill="#ECEFF2" x="8.78888889" y="17.6206897" width="15.0666667" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-4" fill="#ECEFF2" x="8.78888889" y="25.8017241" width="17.5777778" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-5" fill="#ECEFF2" x="8.78888889" y="33.9827586" width="10.0444444" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-11" fill="#ECEFF2" x="8.78888889" y="50.3448276" width="10.0444444" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-25" fill="currentColor" x="8.78888889" y="58.5258621" width="10.0444444" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形备份-6" fill="#ECEFF2" x="8.78888889" y="42.1637931" width="12" height="3.77586207" rx="0.63"></rect>
                    <rect id="矩形" fill="#CFD8E5" x="41.0222222" y="10.0344828" width="61.8809524" height="5.03448276" rx="0.63"></rect>
                    <g id="编组-5" transform="translate(41.074603, 23.648706)" fill="#ECEFF2">
                      <rect id="矩形备份-7" x="0" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-8" x="17.0396825" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-9" x="34.0793651" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-10" x="52.1952381" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                    </g>
                    <g id="编组-4" transform="translate(44.119048, 36.490366)">
                      <rect id="矩形备份-12" fill="#ECEFF2" x="0" y="0.730310771" width="7" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-21" fill="#ECEFF2" x="0" y="5.23648361" width="7" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-13" fill="currentColor" x="13.9952381" y="0.730310771" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <g id="star" transform="translate(24.936508, 0.000000)">
                        <rect id="矩形" x="0" y="0" width="4.39444444" height="4.40517241"></rect>
                        <mask id="mask-7" fill="white">
                          <use href="#path-6"></use>
                        </mask>
                        <use id="蒙版" fill="currentColor" href="#path-6"></use>
                      </g>
                      <rect id="矩形备份-22" fill="#ECEFF2" x="13.9952381" y="5.23648361" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-14" fill="#ECEFF2" x="31.0349206" y="0.730310771" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-23" fill="#ECEFF2" x="31.0349206" y="5.23648361" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-15" fill="#ECEFF2" x="48.9714286" y="0.730310771" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      <rect id="矩形备份-24" fill="#ECEFF2" x="48.9714286" y="5.23648361" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                    </g>
                    <g id="编组-11" transform="translate(41.074603, 54.568509)" fill="#ECEFF2">
                      <g id="编组-2" transform="translate(0.000000, 4.506173)">
                        <rect id="矩形备份-17" x="0" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-18" x="17.0396825" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-19" x="34.0793651" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-20" x="52.015873" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      </g>
                      <g id="编组-2备份">
                        <rect id="矩形备份-17" x="0" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-18" x="17.0396825" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-19" x="34.0793651" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                        <rect id="矩形备份-20" x="52.015873" y="0" width="10.0444444" height="2.96785826" rx="0.629999989"></rect>
                      </g>
                    </g>
                    <g id="编组-9" transform="translate(24.303968, 30.836207)">
                      <ellipse id="椭圆形" stroke="#F2F3F5" stroke-width="1.8" fill="currentColor" cx="7.89206349" cy="7.91133005" rx="8.79206349" ry="8.81133005"></ellipse>
                      <g id="arrow_back" transform="translate(0.627778, 0.629310)">
                        <rect id="矩形" x="0" y="0" width="14.5285714" height="14.5640394"></rect>
                        <mask id="mask-9" fill="white">
                          <use href="#path-8"></use>
                        </mask>
                        <use id="蒙版" fill="#FFFFFF" href="#path-8"></use>
                      </g>
                    </g>
                  </g>
                  <g id="fg/新增数据" transform="translate(80.000000, 0.000000)">
                    <g id="矩形">
                      <use fill="black" fill-opacity="1" filter="url(#filter-11)" href="#path-10"></use>
                      <use fill="#FFFFFF" fill-rule="evenodd" href="#path-10"></use>
                    </g>
                    <rect id="矩形" fill="#ECEFF2" x="6" y="6" width="35" height="12" rx="1"></rect>
                    <g id="star" transform="translate(45.000000, 6.000000)">
                      <rect id="矩形" x="0" y="0" width="12" height="12"></rect>
                      <mask id="mask-13" fill="white">
                        <use href="#path-12"></use>
                      </mask>
                      <use id="蒙版" fill="currentColor" href="#path-12"></use>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
      <p>{intl.get('hzero.common.basicLayout.notice').d('在全部菜单里\\n将功能标星🌟添加为常用功能').replace('\\n', '\n')}</p>
    </div>
  );
};

export default Notice;
