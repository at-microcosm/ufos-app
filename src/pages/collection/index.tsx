import { useContext, useState } from 'react';
import { HostContext } from '../../context';
import { Link, Navigate, useSearchParams } from 'react-router';
import { BrowseGroup } from '../../components/browse-group';
import { NsidNice, NsidPrefix } from '../../components/nsid';
import { niceDt } from '../../components/nice';
import { Sparkline } from '../../components/sparkline';
import { Record } from '../../components/record';
import { ButtonGroup } from '../../components/buttons';
import { Fetch, GetJson } from '../../fetch';
import './collection.css';

// TODO refactor out with what-hot (/top collections, ...)
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;

async function get_collection_stat(host, nsid, period) {
  const now_ms = +new Date();
  const now_hours = Math.floor(now_ms / ONE_HOUR_MS);
  const now_truncated = now_hours * ONE_HOUR_MS;
  const period_ms = {
    day: ONE_DAY_MS,
    week: ONE_WEEK_MS,
    month: ONE_MONTH_MS,
  }[period]!;
  const since = new Date(now_truncated - period_ms).toISOString();
  const res = await fetch(`${host}/collections/stats?collection=${nsid}&since=${since}`);
  if (!res.ok) {
    throw new Error(`request failed: ${res}`);
  }
  const data = await res.json();
  return data[nsid];
}

export function Collection({}) {
  const host = useContext(HostContext);
  const [currentPreview, setCurrentPreview] = useState('samples');
  const [showMore, setShowMore] = useState(false);
  const [statPeriod, setStatPeriod] = useState('day');
  const [statType, statStatType] = useState('estimated_dids');
  const [countType, setCountType] = useState('creates');
  const [searchParams, _setSearchParams] = useSearchParams();
  const nsid = searchParams.get('nsid');
  const sparkPeriod = {
    day: 'week',
    week: 'month',
    month: 'quarter',
  }[statPeriod];
  const sparkMetric = statType === 'estimated_dids' ? 'dids_estimate' : countType;

  const browseAll = (
    <div className="browse-all">
      <hr />
      →&nbsp;
      <Link to="/all">
        browse all lexicons
      </Link>
    </div>
  );

  if (!nsid) {
    const prefix = nsid ? null : searchParams.get('prefix');
    if (!prefix) return <Navigate replace to="/" />;
    return (
      <div className="collection-page empty">
        <div className="collection-page-sidebar">
          <h3>Related lexicons</h3>
          <BrowseGroup prefix={prefix} />
          {browseAll}
        </div>
        <div className="collection-page-content">
          <h2>
            <NsidPrefix prefix={prefix} />
          </h2>
          <p>← select a lexicon</p>
        </div>
      </div>
    );
  }

  const nsidPrefix = nsid.split('.').slice(0, -1).join('.');

  return (
    <div className="collection-page">
      <div className="collection-page-sidebar">
        <h3>Related lexicons</h3>
        <BrowseGroup prefix={nsidPrefix} active={nsid} />
        {browseAll}
      </div>
      <div className="collection-page-content">
        <h2>
          <NsidNice nsid={nsid} />
        </h2>
        <div className="stats-summary">
          <div className="collection-page-sparkline">
            <Sparkline
              nsid={nsid}
              height={56}
              period={sparkPeriod}
              interval={statPeriod}
              metric={sparkMetric}
            />
          </div>

          <span className="big-stat">
            <Fetch
              using={get_collection_stat}
              args={[host, nsid, statPeriod]}
              loading={() => <>&hellip;&nbsp;</>}
              ok={data => {
                let n = '??';
                if (statType === 'estimated_dids') {
                  n = data.dids_estimate;
                } else if (countType === 'creates') {
                  n = data.creates;
                } else if (countType === 'updates') {
                  n = data.updates;
                } else {
                  n = data.deletes;
                }
                return n.toLocaleString();
              }}
            />
          </span>

          <ButtonGroup
            options={[
              {val: 'day', label: 'daily'},
              {val: 'week', label: 'weekly'},
              {val: 'month', label: 'monthly'},
            ]}
            current={statPeriod}
            onChange={setStatPeriod}
            subtle
            vertical
          />
          <ButtonGroup
            options={[
              {val: 'estimated_dids', label: 'users'},
              {val: 'records', label: 'records'},
            ]}
            current={statType}
            onChange={t => statStatType(t)}
            subtle
            vertical
          />
          {statType === 'records' && (
            <ButtonGroup
              options={[
                {val: 'creates', label: 'created'},
                {val: 'updates', label: 'updated'},
                {val: 'deletes', label: 'deleted'},
              ]}
              current={countType}
              onChange={setCountType}
              subtle
              vertical
            />
          )}

        </div>

        <h3 className="preview-main-selector">
          <ButtonGroup
            options={[
              {val: 'samples', label: 'Samples'},
              {val: 'lexicon', label: 'Lexicon'},
              {val: 'stats', label: 'Stats'},
              {val: 'api', label: 'API'},
            ]}
            current={currentPreview}
            onChange={setCurrentPreview}
            big
            subtle
          />
        </h3>

        <div style={currentPreview === 'samples' ? {} : { display: 'none' }}>
          <GetJson
            endpoint="/records"
            params={{ collection: nsid, limit: 1 }}
            ok={samples => samples.length === 0
              ? <p><em>no records seen (or all have been deleted)</em></p>
              : showMore
                ? (
                  <>
                  {samples.map(s => (
                    <Sample
                      key={`${s.did}/${s.rkey}`}
                      sample={s}
                      nsid={nsid}
                    />
                  ))}
                  {samples.length > 1 && (
                    <button
                      onClick={() => setShowMore(false)}
                    >
                      - hide {samples.length - 1} samples
                    </button>
                  )}
                  </>
                )
                : (
                  <>
                    <Sample
                      key={`${samples[0].did}/${samples[0].rkey}`}
                      sample={samples[0]}
                      nsid={nsid}
                    />
                    {samples.length > 1 && (
                      <button
                        onClick={() => setShowMore(true)}
                      >
                        + show {samples.length - 1} more samples
                      </button>
                    )}
                  </>
                )
            }
          />
        </div>
        {currentPreview === 'lexicon' && (
          <div className="coming-soon">
            <p>Lexicon resolution, definition previews, and validation are coming soon</p>
          </div>
        )}
        {currentPreview === 'stats' && (
          <div className="coming-soon">
            <p>More detailed stats coming here soon!</p>
            <p>UFOs records per-collection counts, aggregated hourly. Its unique user estimates can be accurately merged across arbitrary time spans and collection groups.</p>
            <p>
              <a href="https://github.com/uniphil/cardinality-estimator-safe" target="_blank" className="external">
                HyperLogLogs
              </a>
              {' are '}
              <a href="https://antirez.com/news/75" target="_blank" className="external">
                cool
              </a>
              !
            </p>
          </div>
        )}
        {currentPreview === 'api' && (
          <div className="preview-api">
            <p>Use <NsidNice nsid={nsid} /> records in your own project!</p>
            <h4>
              Get latest records with the
              {' '}
              <a href={`${host}/#tag/default/get/records`} target="_blank" className="external">
                UFOs-API
              </a>
            </h4>
            <pre className="preview-api-example">
              <span className="method">GET</span>
              {' '}
              <a href={`${host}/records?collection=${nsid}`} target="_blank">
                <span className="host">{host}</span>
                <span className="path">/records</span>
                ?collection=
                <span className="var">{nsid}</span>
              </a>
            </pre>
            <p>
              See the
              {' '}
              <a href={`${host}`} target="_blank" className="external">
                API documentation
              </a>
              {' '}
              for more examples.
            </p>

            <h4>
              Subscribe to real-time events with
              {' '}
              <a href="https://github.com/bluesky-social/jetstream" target="_blank" className="external">
                Jetstream
              </a>
            </h4>
            <pre className="preview-api-example">
              <a
                href={`https://pdsls.dev/jetstream?instance=wss%3A%2F%2Fjetstream.fire.hose.cam%2Fsubscribe&collections=${nsid}`}
                target="_blank"
              >
                <span className="host">wss://jetstream.fire.hose.cam</span>
                <span className="path">/subscribe</span>
                ?wantedCollections=
                <span className="var">{nsid}</span>
              </a>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function Sample({ sample, nsid }) {
  const [viewMode, setViewMode] = useState('preview');
  const recordTime = new Date(sample.time_us / 1000);
  const dt = new Date() - recordTime;
  const ONE_HOUR = 60 * 60 * 1000;
  const niceTime = dt > ONE_HOUR
    ? recordTime.toISOString().split('T')[0]
    : `${niceDt(dt)} ago`;
  const atUri = `at://${sample.did}/${sample.collection}/${sample.rkey}`;
  const contentLink = new URL(window.location);
  contentLink.searchParams.append('record', atUri);
  const reportLink = `https://docs.google.com/forms/d/e/1FAIpQLSfHIRAW6mmq5Midecxh-bVjoEKn4PHA5DuBCq7tpemDD4e4fw/viewform?usp=pp_url&entry.1269528930=Contents+of+a+sample+record&entry.1714716109=${encodeURIComponent(contentLink)}`;

  return (
    <>
      <div className="collection-sample-meta">
        <ButtonGroup
          options={[
            {val: 'preview'},
            {val: 'json'},
          ]}
          current={viewMode}
          onChange={setViewMode}
          subtle
        />
        <span className="collection-sample-actions">
          <a
            href={`https://pdsls.dev/${atUri}`}
            className="ago external"
            target="_blank"
            title={`Sample seen at ${recordTime.toLocaleString()}`}
          >
            {niceTime}
          </a>
          <a
            href={reportLink}
            className="report external"
            target="_blank"
            title="report record"
          >
            report
          </a>
        </span>
      </div>
      <div className="collection-record-sample">
        {viewMode === 'preview'
          ? <Record record={sample.record} nsid={nsid} />
          : (
            <pre className="collection-record-sample-json">
              {JSON.stringify(sample.record, null, 2)}
            </pre>
          )
        }
      </div>
    </>
  );
}
