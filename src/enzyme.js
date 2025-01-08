/**
 * Enzyme
 */
import * as Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({adapter: new Adapter()})

// export $ to window globle
window.Enzyme === undefined && (window.Enzyme = Enzyme)

export default Enzyme
