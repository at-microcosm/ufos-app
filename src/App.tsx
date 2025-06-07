import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { HostContext } from './context'
import './App.css'

const UFOS_HOST_DEV = 'http://localhost:9999';
const UFOS_HOST_PROD = 'https://ufos-api.microcosm.blue';
const INTIAL_HOST = localStorage.getItem('ufos-api-host') || UFOS_HOST_PROD;

function App({ children }) {
  const [ufosHost, setUfosHost] = useState(INTIAL_HOST);

  const setDev = en => {
    const newHost = en ? UFOS_HOST_DEV : UFOS_HOST_PROD;
    setUfosHost(newHost);
    localStorage.setItem('ufos-api-host', newHost);
  };
  const isDev = host => host === UFOS_HOST_DEV;

  return (
    <HostContext.Provider value={ufosHost}>
      <div className="dev-shortcut">
        api:
        {' '}
        <NavLink to="/status">status</NavLink>
        {' '}
        <Link to={ufosHost} target="_blank" className="external">
          docs
        </Link>
        {' '}
        <Link to="https://github.com/at-microcosm/links/tree/main/ufos" target="_blank" className="external">
          source
        </Link>
        {' '}
        <label>
          <input
            type="checkbox"
            onChange={e => setDev(e.target.checked)}
            checked={isDev(ufosHost)}
          />
          localhost
        </label>
      </div>
      <div className="header">
        <h1>
          <NavLink to="/">
            🛸 UFOs
          </NavLink>
          &nbsp;
        </h1>
        <p>Explore lexicons</p>
      </div>

      <div className="content">
        {children}
      </div>

      <div className="footer">
        <p className="from">
          UFOs is part of
          {' '}
          <Link to="https://microcosm.blue" className="external" target="_blank">
            microcosm
          </Link>
          ,
          {' follow at '}
          <Link to="https://bsky.app/profile/microcosm.blue" className="external" target="_blank">
            @microcosm.blue
          </Link>
        </p>
      </div>
    </HostContext.Provider>
  )
}

export default App
