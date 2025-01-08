import {useState} from 'react'
import i18n from 'i18next'
import {useTranslation, initReactI18next} from 'react-i18next'
import reactLogo from '../../assets/react.svg'
import './Comp.css'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          'Click on the logos to learn more': 'Click on the logos to learn more',
        },
      },
      zhs: {
        translation: {
          'Click on the logos to learn more': '点击图标了解更多...',
        },
      },
      zht: {
        translation: {
          'Click on the logos to learn more': '點擊圖標了解更多...',
        },
      },
    },
    lng: 'zhs', // if you're using a language detector, do not define the lng option
    fallbackLng: 'zhs',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })

function Comp() {
  const {t} = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <div>
        <a href='https://reactjs.org' target='_blank' rel='noreferrer'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Rspack + React + TypeScript</h1>
      <div className='card'>
        <button onClick={() => setCount(count => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/Comp.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>{t('Click on the logos to learn more')}</p>
    </div>
  )
}

export default Comp
