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
      </div>

      <p style={{ margin: '3rem 0 7rem', maxWidth: '32rem' }}>
        <span style={{ color: 'yellow' }}>service note:</span>
        {' '}
        looks like the raspberry pi that runs the UFOs API crashed. sorry! i'm away from home, check back on Monday.
      </p>

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
          <a href="https://microcosm.blue" className="external" target="_blank">
            <span style={{ color: '#f396a9' }}>m</span>
            <span style={{ color: '#f49c5c' }}>i</span>
            <span style={{ color: '#c7b04c' }}>c</span>
            <span style={{ color: '#92be4c' }}>r</span>
            <span style={{ color: '#4ec688' }}>o</span>
            <span style={{ color: '#51c2b6' }}>c</span>
            <span style={{ color: '#54bed7' }}>o</span>
            <span style={{ color: '#8fb1f1' }}>s</span>
            <span style={{ color: '#ce9df1' }}>m</span>

          </a>
        </p>
        <p className="actions">
          <a href="https://bsky.app/profile/microcosm.blue" target="_blank" className="external">
            🦋 follow
          </a>
          <a href="https://github.com/sponsors/uniphil/" target="_blank" className="external">
            💸 support
          </a>
          <a href="https://github.com/at-microcosm/links/tree/main/ufos" target="_blank" className="external">
            👩🏻‍💻 source
          </a>
        </p>

        <p className="secret-dev">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfHIRAW6mmq5Midecxh-bVjoEKn4PHA5DuBCq7tpemDD4e4fw/viewform"
            className="report external"
            target="_blank"
          >
            report content
          </a>
          {' | '}
          secret dev setting:
          {' '}
          <label>
            <input
              type="checkbox"
              onChange={e => setDev(e.target.checked)}
              checked={isDev(ufosHost)}
            />
            localhost
          </label>
        </p>
      </div>
    </HostContext.Provider>
  )
}

export default App
