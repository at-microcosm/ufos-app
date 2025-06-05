import { useContext, useState } from 'react'
import { ButtonGroup } from '../../components/buttons'
import { NsidTitle, NsidNice } from '../../components/nsid'
import { Sparkline } from '../../components/sparkline'
import { Fetch } from '../../fetch'
import { HostContext } from '../../context'

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;

async function get_top_collections(host, period) {
  // ufos buckets stats by hour
  // truncate query times to the hour so they can be cached by nginx
  const now_ms = +new Date();
  const now_hours = Math.floor(now_ms / ONE_HOUR_MS);
  const now_truncated = now_hours * ONE_HOUR_MS;
  const period_ms = {
    day: ONE_DAY_MS,
    week: ONE_WEEK_MS,
    month: ONE_MONTH_MS,
  }[period]!;
  const since = new Date(now_truncated - period_ms).toISOString();

  const q = `limit=8&since=${since}`;
  const r = await fetch(`${host}/collections?order=dids-estimate&${q}`);
  if (!r.ok) {
    throw new Error(`request failed: ${r}`);
  }
  const data = await r.json();
  return data.collections;
}

export function TopCollections() {
  const [period, setPeriod] = useState('day');
  const host = useContext(HostContext);
  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '2rem'
      }}>
        <h2>Top collections</h2>
        <ButtonGroup
          options={[
            {val: 'day', label: 'today'},
            {val: 'week', label: 'this week'},
          ]}
          current={period}
          onChange={setPeriod}
          subtle={true}
        />
      </div>
      <Fetch
        using={get_top_collections}
        args={[host, period]}
        ok={tops => (
          <ol style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem 0.9rem',
            padding: '0',
            margin: '0.6rem 0',
          }}>
            {tops.map((top, i) => <Top key={top.nsid} top={top} rank={i+1} />)}
          </ol>
        )}
      />
    </>
  );
}

function Top({ top, rank }) {
  return (
    <li style={{
      boxSizing: 'border-box',
      background: 'hsla(0, 0%, 50%, 0.1)',
      listStyle: 'none',
      borderRadius: '0.6em',
      width: '19rem',
      display: 'flex',
      overflow: 'hidden',
    }}>
      <span style={{
        alignSelf: 'top',
        fontWeight: 'bold',
        fontSize: rank < 10 ? '6rem' : '2.6rem',
        lineHeight: '6rem',
        opacity: '0.2',
        padding: '0rem 0rem',
        paddingRight: rank < 10 ? '0' : '0.4rem',
        position: 'relative',
        left: rank < 10 ? '-0.7rem' : '-0.35rem',
        marginRight: '-0.7rem',
        top: '-0.8rem',
        marginBottom: '-3rem'
      }}>
        {rank}
      </span>
      <div style={{
        padding: '0.3rem 0.3rem 0.3rem 0.1rem',
        width: '100%',
        overflow: 'hidden',
      }}>
        <div style={{ marginBottom: '0.4rem'}}>
          <h3><NsidTitle nsid={top.nsid} /></h3>
          <p style={{ margin: '0', fontSize: '0.8rem', lineHeight: '0.8rem' }}>
            <NsidNice nsid={top.nsid} subtle={true} />
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <Sparkline nsid={top.nsid} />
          <p style={{
            margin: '0',
            textAlign: 'right',
            fontSize: '0.8rem',
            lineHeight: '0.8rem',
            flexShrink: '0',
          }}>
            <strong>{top.dids_estimate.toLocaleString()}</strong>
            <span style={{ color: '#ccc' }}> active </span>
          </p>
        </div>
      </div>
    </li>
  );
}
