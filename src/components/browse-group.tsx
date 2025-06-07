import { useContext, useState } from 'react';
import { Link } from 'react-router';
import { HostContext } from '../context';
import { Fetch } from '../fetch';
import { NsidName, NsidPrefix } from './nsid';

async function get_prefix(host, prefix) {
  let res = await fetch(`${host}/prefix?prefix=${prefix}`);
  if (!res.ok) {
    throw new Error(`request failed: ${await res.text()}`);
  }
  return await res.json();
}

export function BrowseGroup({ prefix, active }) {
  const host = useContext(HostContext);
  const segments = prefix.split('.');
  const parents = [];
  for (let i = segments.length - 1; i >= 2; i--) {
    parents.unshift(segments.slice(0, i).join('.'));
  }
  return (
    <div style={{fontSize: /*'0.85rem'*/ 'inherit'}}>
      {parents.map(p => (
        <div>
          ↰&nbsp;
          <Link to={`/collection?prefix=${p}`}>
            <NsidPrefix prefix={p} />
          </Link>
        </div>
      ))}
      <Fetch
        using={get_prefix}
        args={[host, prefix]}
        ok={data => data.children.map(c => {
          if (c.type === 'collection') {
            return <Collection key={`c:${c.nsid}`} c={c} active={c.nsid === active} />;
          } else {
            return <SubPrefix key={`p:${c.prefix}`} c={c} />;
          }
        } /*TODO: paging*/)}
      />
    </div>
  );
}

function Collection({ c, active, marker }) {
  return (
    <div>
      {active
        ? (
          <div style={{fontWeight: 'bold'}}>
            ●&nbsp;{c.nsid}
          </div>
        ) : (
          <Link to={`/collection?nsid=${c.nsid}`} style={{color: '#888'}}>
            {marker || <>◦&nbsp;</>}
            <NsidName nsid={c.nsid} />
          </Link>
        )
      }
    </div>
  );
}

function SubPrefix({ c }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <Link
        style={{color: '#888'}}
        onClick={e => {
          e.preventDefault();
          setExpanded(e => !e);
        }}
      >
        <span style={{color: 'hsl(210, 94%, 72%)'}}>
          {expanded ? '◢' : '▸'}
        </span>
        &nbsp;
        <NsidPrefix prefix={c.prefix} />
        {expanded ? ':' : '.*'}
      </Link>
      {expanded && (
        <BrowseSubGroup prefix={c.prefix} />
      )}
    </div>
  );
}

export function BrowseSubGroup({ prefix }) {
  const host = useContext(HostContext);
  return (
    <div sytle={{fontSize: '0.8rem'}}>
      <Fetch
        using={get_prefix}
        args={[host, prefix]}
        ok={data => data.children.map(c => {
          if (c.type === 'collection') {
            return <Collection key={`c:${c.nsid}`} c={c} marker={<>&nbsp;&nbsp;↳&nbsp;</>} />;
          } else {
            return <SubPrefix key={`p:${c.prefix}`} c={c} />;
          }
        } /*TODO: paging*/)}
      />
    </div>
  );
}
