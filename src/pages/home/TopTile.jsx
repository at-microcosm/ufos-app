import { Link } from 'react-router'
import { NsidTitle, NsidNice } from '../../components/nsid'
import { Sparkline } from '../../components/sparkline'


export function TopTile({ rank, nsid, activeCount, change }) {
  return (
    <li style={{listStyle: 'none'}}>
      <Link
        to={`/collection?nsid=${nsid}`}
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
            <h3 style={{ color: '#ccc' }}>
              <NsidTitle nsid={nsid} />{(change && change > 0.9) ? '🔥' : ''}
            </h3>
            <p style={{ margin: '0', fontSize: '0.8rem', lineHeight: '0.8rem' }}>
              <NsidNice nsid={nsid} subtle={true} />
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
          }}>
            <Sparkline nsid={nsid} />
            <p style={{
              margin: '0',
              textAlign: 'right',
              fontSize: '0.8rem',
              lineHeight: '0.8rem',
              flexShrink: '0',
            }}>
              <strong style={change ? {} : { color: '#ccc' }}>
                {activeCount.toLocaleString()}
              </strong>
              <span style={{ color: '#ccc' }}> active </span>
              {change && (
                <span style={{
                  fontSize: '0.8rem',
                  background: 'hsla(0, 0%, 0%, 0.3)',
                  color: change > 0.9
                    ? 'yellow'
                    : change > 0
                      ? '#64ff6c'
                      : 'inherit',
                  borderRadius: '0.3rem',
                  padding: '0 0.2rem 0 0.1rem',
                }}>
                  {change > 0 && '+'}{(change * 100).toFixed()}%
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
