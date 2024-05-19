/**
 * 加载App所需的UI模块，UI模块有样式和代码，代码部分在这里加载。
 * 在 f7.config.js 文件里面配置后，自动生成该文件。
 * 注意：IMPORT_COMPONENTS_BEGIN/END 和 INSTALL_COMPONENTS_BEGIN/END
 * 用于自动根据f7.config.js加载UI模块，不得修改删除
 * import Pages from './pages'; 和 const pages = new Pages();
 * 也不得删除，用于本地调式时，自动打包所有page模块，方便调试。
 */
import {App} from '@wiajs/core'
// import {App} from './core'

// Import Core Components
import Statusbar from '@wiajs/f7/statusbar'
// import View from "@wiajs/f7/view/view";
// import Navbar from "@wiajs/f7/navbar/navbar";
// import Subnavbar from '@wiajs/f7/subnavbar/subnavbar';
import Toolbar from '@wiajs/f7/toolbar'
// 点击时出现波纹效果
// import TouchRipple from '@wiajs/f7/touch-ripple/touch-ripple';
import Modal from '@wiajs/f7/modal'
import List from '@wiajs/f7/list'
import Button from '@wiajs/f7/button'
import Badge from '@wiajs/f7/badge'
import View from '@wiajs/f7/view'

// IMPORT_COMPONENTS_BEGIN
import Dialog from '@wiajs/f7/dialog'
import Preloader from '@wiajs/f7/preloader'
import Progressbar from '@wiajs/f7/progressbar'
import Swipeout from '@wiajs/f7/swipeout'
import Accordion from '@wiajs/f7/accordion'
import ListIndex from '@wiajs/f7/list-index'
import Tabs from '@wiajs/f7/tabs'
import Card from '@wiajs/f7/card'
import Chip from '@wiajs/f7/chip'
import Input from '@wiajs/f7/input'
import Checkbox from '@wiajs/f7/checkbox'
import Radio from '@wiajs/f7/radio'
import Toggle from '@wiajs/f7/toggle'
import Grid from '@wiajs/f7/grid'
import Fab from '@wiajs/f7/fab'
import Navbar from '@wiajs/f7/navbar'
import Menu from '@wiajs/f7/menu'
// IMPORT_COMPONENTS_END

// 添加应用缺省模块ss
App.use([
  // INSTALL CORE COMPONENTS
  Statusbar,
  // View,
  // Navbar,
  Toolbar,
  // Subnavbar,
  // TouchRipple,

  Modal,
  List,
  Badge,
  Button,
  View,

  // INSTALL_COMPONENTS_BEGIN
  Dialog,
  Preloader,
  Progressbar,
  Swipeout,
  Accordion,
  ListIndex,
  Tabs,
  Card,
  Chip,
  Input,
  Checkbox,
  Radio,
  Toggle,
  Grid,
  Fab,
  Navbar,
  Menu,
// INSTALL_COMPONENTS_END
])

// NAMED_ES_EXPORT
export default App
