import { useContext } from 'react'
import { HostContext } from '../context'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Fetch } from '../fetch';
import './sparkline.css';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;
const ONE_QUARTER_MS = ONE_MONTH_MS * 3;

const get_timeseries = async (host, nsid, period, interval) => {
  // ufos buckets stats by hour
  // truncate query times to the hour so they can be cached by nginx
  const now_ms = +new Date();
  const now_hours = Math.floor(now_ms / ONE_HOUR_MS);
  const now_truncated = now_hours * ONE_HOUR_MS;

  const period_ms = {
    day: ONE_DAY_MS,
    week: ONE_WEEK_MS,
    month: ONE_MONTH_MS,
    quarter: ONE_QUARTER_MS,
  }[period]!;

  const interval_ms = {
    day: ONE_DAY_MS / 2,
    week: ONE_WEEK_MS / 2,
    month: ONE_WEEK_MS,
  }[interval]!;

  const since = new Date(now_truncated - period_ms).toISOString();

  const resp = await fetch(`${host}/timeseries?collection=${nsid}&since=${since}&step=${interval_ms / 1000}`);
  if (!resp.ok) {
    throw new Error(`failed to fetch: ${resp}`);
  }
  return await resp.json();
}

const fromISO = d => new Date(d);
const toLocale = d => d.toLocaleString();

export function Sparkline({ nsid, metric, height, period, interval, lastSegment, measuring }) {
  const host = useContext(HostContext);
  metric = metric ?? 'dids_estimate';
  period = period ?? 'week';
  interval = interval ?? 'day';
  measuring = measuring ?? 'unique users';
  const lastSegName = `${period}-for-${interval}`;
  return (
    <Fetch
      key={nsid}
      using={get_timeseries}
      args={[host, nsid, period, interval]}
      loading={() => (
        <div
          style={{ height: height ?? 32 }}
          className="sparkline-wrapper sparkline-loading"
        >
          <span>Loading&hellip;</span>
        </div>
      )}
      ok={({ series, range }) => (
        <div className={`sparkline-wrapper ${lastSegName ? `last-seg ${lastSegName}` : ''}`}>
          <SparkLineChart
            xAxis={{
              data: range.map(fromISO),
              valueFormatter: toLocale,
            }}
            yAxis={{ min: 0 }}
            data={series[nsid].map(d => d[metric])}
            valueFormatter={v => `${v.toLocaleString()} ${measuring}`}
            height={height ?? 32}
            color='hsl(210, 94%, 63%)'
            showTooltip
            showHighlight
          />
        </div>
      )}
    />
  );
}
