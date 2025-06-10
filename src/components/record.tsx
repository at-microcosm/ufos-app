import { useState } from 'react';
import { NsidNice, NsidBad } from './nsid';
import './record.css';

const STRING_PREVIEW = 42;
const OBJ_INLINE_MAX_DEPTH = 2;

export function Record({ record, nsid }) {
  const { $type, ...rest } = record;
  return (
    <>
      <div className="record-type">
        {$type === nsid && (
            <div title="record's $type did not match the collection NSID">
              <span className="record-type-ok">$type</span>
              :{' '}
              <NsidNice nsid={$type} />
            </div>
          )
        }
      </div>
      <Obj o={rest} d={0} />
    </>
  );
}

function Obj({ o, d }) {
  let keys = Object.keys(o).toSorted();
  return keys.map(k => <Pair key={k} k={k} v={o[k]} d={d+1} />);
}
function Pair({ k, v, d }) {
  let inline = true;
  if (Array.isArray(v)) {
    if (v.length > 1) {
      inline = false;
    } else if (v.length === 1 && typeof v[0] === 'string') {
      inline = v.length <= STRING_PREVIEW;
    } else if (v.length > 0) {
      inline = false;
    }
  } else if (d > OBJ_INLINE_MAX_DEPTH && v !== null && typeof v === 'object') {
    inline = false;
  }
  return (
    <div key={k} style={{
      display: inline ? 'flex' : 'block',
    }}>
      <div className="json-key-outer">
        <span className="json-key-inner">
          {k}
        </span>
        :
      </div>
      <div style={
        !inline && (Array.isArray(v) || d > OBJ_INLINE_MAX_DEPTH)
          ? {paddingLeft: '2rem'}
          : {}
      }>
        <Value v={v} d={d} />
      </div>
    </div>
  );
}

function Value({ v, d }) {
  if (typeof v === 'string') {
    return <Str s={v} />;
  }
  if (typeof v === 'number') {
    return <Num n={v} />;
  }
  if (Array.isArray(v)) {
    return <Arr a={v} d={d+1} />
  }
  if (v === null) {
    return <span className="json-null">null</span>;
  }
  if (typeof v === 'object') { // must happen after array and null checks
    return <Obj o={v} d={d+1} />
  }
  return (
    <pre style={{
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      margin: '0',
      font: 'inherit',
    }}>
      {JSON.stringify(v, null, 2)}
    </pre>
  );
}

function Str({ s }) {
  const [showAll, setShowAll] = useState(false);
  const longer = s.length > STRING_PREVIEW;
  return (
    <span className="json-string">
      "
      <span>
        {longer
          ? showAll
            ? (
              <>
                <span className="content showing-all">
                  {s}
                </span>
                <button
                  className="string-more less"
                  onClick={() => setShowAll(false)}
                  title="show less"
                >
                  «
                </button>
              </>
            )
            : (
              <>
                <span className="content">{s.slice(0, STRING_PREVIEW - 3)}</span>
                <button
                  className="string-more"
                  onClick={() => setShowAll(true)}
                  title="show more"
                >
                  ●●●
                </button>
              </>
            )
          : <span className="content">{s}</span>
        }
        "
      </span>
    </span>
  );
}

function Num({ n }) {
  return (
    <span className="json-number">
      {n.toLocaleString()}
    </span>
  );
}

function Arr({ a, d }) {
  if (a.length === 0) {
    return <span>[]</span>
  }
  if (a.length === 1 && typeof a[0] === 'string' && a[0].length <= STRING_PREVIEW) {
    return <span>[<Str s={a[0]} />]</span>
  }
  return (
    <ul className="json-array">
      {a.map((el, i) => (
        <li key={i}>
          <Value v={el} d={d+1} />
        </li>
      ))}
    </ul>
  );
}
