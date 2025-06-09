import { useContext, useState } from 'react'
import { Link } from 'react-router'
import { ButtonGroup } from '../../components/buttons'
import { Fetch } from '../../fetch'
import { HostContext } from '../../context'
import { TopTile } from './TopTile'

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
      <div className="top-tiles">
        <h2>
          What's hot
        </h2>
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
            {whats_hot.map((hot, i) => (
              <TopTile
                key={hot.current.nsid}
                rank={i+1}
                nsid={hot.current.nsid}
                activeCount={hot.current.dids_estimate}
                change={hot.change}
                rankPeriod={period}
              />
            ))}
          </ol>
        )}
      />
    </>
  );
}
