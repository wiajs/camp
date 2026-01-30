# Camp 更改日志

## 2025-01-23

### wia v1.0.0:

```js
const M = [
  '~/@wiajs/core/dist/jsx-runtime.js',
  '~/@wiajs/f7/lib/accordion/accordion.js',
  '~/@wiajs/f7/lib/badge/badge.js',
  '~/@wiajs/f7/lib/button/button.js',
  '~/@wiajs/f7/lib/card/card.js',
  '~/@wiajs/f7/lib/checkbox/checkbox.js',
  '~/@wiajs/f7/lib/chip/chip.js',
  '~/@wiajs/f7/lib/dialog/dialog-class.js',
  '~/@wiajs/f7/lib/dialog/dialog.js',
  '~/@wiajs/f7/lib/fab/fab.js',
  '~/@wiajs/f7/lib/grid/grid.js',
  '~/@wiajs/f7/lib/input/input.js',
  '~/@wiajs/f7/lib/list-index/list-index-class.js',
  '~/@wiajs/f7/lib/list-index/list-index.js',
  '~/@wiajs/f7/lib/list/list.js',
  '~/@wiajs/f7/lib/menu/menu.js',
  '~/@wiajs/f7/lib/modal/custom-modal-class.js',
  '~/@wiajs/f7/lib/modal/modal-class.js',
  '~/@wiajs/f7/lib/modal/modal.js',
  '~/@wiajs/f7/lib/navbar/navbar.js',
  '~/@wiajs/f7/lib/preloader/preloader.js',
  '~/@wiajs/f7/lib/progressbar/progressbar.js',
  '~/@wiajs/f7/lib/radio/radio.js',
  '~/@wiajs/f7/lib/statusbar/statusbar.js',
  '~/@wiajs/f7/lib/swipeout/swipeout.js',
  '~/@wiajs/f7/lib/tabs/tabs.js',
  '~/@wiajs/f7/lib/toggle/toggle-class.js',
  '~/@wiajs/f7/lib/toggle/toggle.js',
  '~/@wiajs/f7/lib/toolbar/toolbar.js',
  '~/@wiajs/f7/lib/view/resizable-view.js',
  '~/@wiajs/f7/lib/view/view-class.js',
  '~/@wiajs/f7/lib/view/view.js',
  '~/@wiajs/core/dist/core.mjs',
  '~/@wiajs/dom/dist/dom.mjs',
  '~/@wiajs/util/dist/util.mjs',
  '~/jssha/dist/sha.mjs',
  '~/style-loader/dist/runtime/injectStylesIntoStyleTag.js',
  '~/style-loader/dist/runtime/insertBySelector.js',
  '~/style-loader/dist/runtime/insertStyleElement.js',
  '~/style-loader/dist/runtime/setAttributesWithoutAttributes.js',
  '~/style-loader/dist/runtime/styleDomAPI.js',
  '~/style-loader/dist/runtime/styleTagTransform.js',
  '~/@wiajs/lib/img/util.js',
  '~/css-loader/dist/runtime/api.js',
  '~/css-loader/dist/runtime/noSourceMaps.js',
]
```

## 2025-01-16

### 生产打包输出文件结构变化

突然发现生产输出的文件结构变化很大，不是每个文件一个 函数封装！！！

package type 改为 'module' 无关，恢复 commonjs 也一样！

更新 rspack 版本到 1.1.8 所致！



### package type 改为 'module'，编译运行出错

const css = _index_less__WEBPACK_IMPORTED_MODULE_2__["default"]["wiaui-verify"];

被引用包 type 为 commonjs，less 引用如下：

import css from './index.less'

修改如下，错误消除
import * as css from './index.less'

项目是 module，被引用包不是module时，会出现 default 问题，打包软件 自动加上了 default！！！


## 2024-04-28

### 网格式布局

### tab 条

```html
<div class="page-content">
  <div class="toolbar tabbar">
    <div class="toolbar-inner">
      <a href="#tab-1" class="tab-link tab-link-active">学生</a>
      <a href="#tab-2" class="tab-link">员工</a>
    </div>
  </div>
</div>
```
