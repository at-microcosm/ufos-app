import { useContext, useState } from 'react'
import { Link } from 'react-router'
import { ButtonGroup } from '../../components/buttons'
import { NsidTitle, NsidNice } from '../../components/nsid'
import { Sparkline } from '../../components/sparkline'
import { Fetch } from '../../fetch'
import { HostContext } from '../../context'

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;

async function get_whats_hot(host, period) {
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
  const prior_since = new Date(now_truncated - 2*period_ms).toISOString();

  const [recent, before] = await Promise.all(
    [
      `limit=${52}&since=${since}`,
      `limit=${64}&since=${prior_since}&until=${since}`,
    ]
    .map(q => fetch(`${host}/collections?order=dids-estimate&${q}`))
    .map(r => r.then(resp => resp.ok ? resp.json() : Promise.reject(new Error(resp)))));

  return recent.collections
    .map(current => {
      const old = before.collections.find(older => older.nsid === current.nsid);
      if (old && old.dids_estimate > 0) {
        const change = (current.dids_estimate - old.dids_estimate) / old.dids_estimate;
        return ({ change, current, old })
      }
    })
    .filter(c => !!c)
    .toSorted((a, b) => b.change - a.change)
    .slice(0, 6);
}

export function WhatsHot() {
  const [period, setPeriod] = useState('day');
  const host = useContext(HostContext);
  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '2rem',
        justifyContent: 'center',
      }}>
        <h2>What's hot</h2>
        <ButtonGroup
          options={[
            {val: 'day', label: 'today'},
            {val: 'week', label: 'this week'},
            {val: 'month', label: 'this month'},
          ]}
          current={period}
          onChange={setPeriod}
          subtle={true}
        />
      </div>
      <Fetch
        using={get_whats_hot}
        args={[host, period]}
        ok={whats_hot => (
          <ol style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem 0.9rem',
            padding: '0',
            margin: '0.6rem 0',
          }}>
            {whats_hot.map((hot, i) => <Hot key={hot.current.nsid} hot={hot} rank={i+1} />)}
          </ol>
        )}
      />
    </>
  );
}

function Hot({ hot, rank }) {
  return (
    <li style={{listStyle: 'none'}}>
      <Link
        to={`/collection?nsid=${hot.current.nsid}`}
        style={{
          background: 'hsla(0, 0%, 50%, 0.1)',
          boxSizing: 'border-box',
          borderRadius: '0.6em',
          width: '19rem',
          display: 'flex',
          overflow: 'hidden',
          margin: '0',
          padding: '0',
        }}
      >
        <span style={{
          alignSelf: 'top',
          fontWeight: 'bold',
          fontSize: '6rem',
          lineHeight: '6rem',
          opacity: '0.2',
          padding: '0rem 0rem',
          position: 'relative',
          left: '-0.7rem',
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
            <h3><NsidTitle nsid={hot.current.nsid} />{hot.change > 0.9 && '🔥'}</h3>
            <p style={{ margin: '0', fontSize: '0.8rem', lineHeight: '0.8rem' }}>
              <NsidNice nsid={hot.current.nsid} subtle={true} />
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
          }}>
            <Sparkline nsid={hot.current.nsid} />
            <p style={{
              margin: '0',
              textAlign: 'right',
              fontSize: '0.8rem',
              lineHeight: '0.8rem',
              flexShrink: '0',
            }}>
              <strong>{hot.current.dids_estimate.toLocaleString()}</strong>
              <span style={{ color: '#ccc' }}> active </span>
              <span style={{
                fontSize: '0.8rem',
                background: 'hsla(0, 0%, 0%, 0.3)',
                color: hot.change > 0.9
                  ? 'yellow'
                  : hot.change > 0
                    ? '#64ff6c'
                    : 'inherit',
                borderRadius: '0.3rem',
                padding: '0 0.2rem 0 0.1rem',
              }}>
                {hot.change > 0 && '+'}{(hot.change * 100).toFixed()}%
              </span>
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
