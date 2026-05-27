import { format, formatDistanceToNow, isValid } from 'date-fns'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../contexts/FeedsContext'

function parsedDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  return isValid(d) ? d : null
}

function Meta({ feed, author, date }) {
  const relative = date ? formatDistanceToNow(date, { addSuffix: true }) : null
  const absolute = date ? format(date, 'MMM d, yyyy · h:mm a') : null
  return (
    <p className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-1 items-center mt-1">
      {feed?.title && <span className="font-medium text-gray-600 dark:text-gray-300">{feed.title}</span>}
      {feed?.title && (author || date) && <span>·</span>}
      {author && <span>by {author}</span>}
      {author && date && <span>·</span>}
      {date && <time dateTime={date.toISOString()} title={absolute}>{relative}</time>}
    </p>
  )
}

function OpenButton({ link, onRead }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 p-1 rounded text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      onClick={(e) => { e.stopPropagation(); onRead() }}
      title="Open in new tab"
    >
      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
    </a>
  )
}

function useCardHandlers(article, isRead, onMarkRead, onMarkUnread) {
  return {
    onClick: () => { if (!isRead) onMarkRead(article.id); window.open(article.link, '_blank', 'noopener,noreferrer') },
    onContextMenu: (e) => { e.preventDefault(); isRead ? onMarkUnread(article.id) : onMarkRead(article.id) },
  }
}

const baseCard = (isRead) =>
  `cursor-pointer select-none rounded-xl border transition-all hover:shadow-md ${
    isRead
      ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-90'
      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
  }`

// ── LIST (compact row) ───────────────────────────────────────────────────────
function ListCard({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  const handlers = useCardHandlers(article, isRead, onMarkRead, onMarkUnread)
  return (
    <article className={`${baseCard(isRead)} flex gap-3 p-3`} {...handlers}>
      {article.thumbnail && (
        <img
          src={article.thumbnail} alt=""
          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-800"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 min-w-0">
            {!isRead && <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />}
            <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.title}</h3>
          </div>
          <OpenButton link={article.link} onRead={() => onMarkRead(article.id)} />
        </div>
        <Meta feed={feed} author={article.author} date={date} />
        {article.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.summary}</p>
        )}
      </div>
    </article>
  )
}

// ── GRID CARD (image top, content below) ────────────────────────────────────
function GridCard({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  const handlers = useCardHandlers(article, isRead, onMarkRead, onMarkUnread)
  return (
    <article className={`${baseCard(isRead)} flex flex-col overflow-hidden`} {...handlers}>
      {article.thumbnail ? (
        <img
          src={article.thumbnail} alt=""
          className="w-full h-44 object-cover bg-gray-100 dark:bg-gray-800"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-4xl">📰</div>
      )}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            {!isRead && <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />}
            <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100" style={{display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.title}</h3>
          </div>
          <OpenButton link={article.link} onRead={() => onMarkRead(article.id)} />
        </div>
        {article.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex-1" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.summary}</p>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Meta feed={feed} author={article.author} date={date} />
        </div>
      </div>
    </article>
  )
}

// ── MAGAZINE (large image left, text right) ──────────────────────────────────
function MagazineCard({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  const handlers = useCardHandlers(article, isRead, onMarkRead, onMarkUnread)
  return (
    <article className={`${baseCard(isRead)} flex overflow-hidden`} {...handlers}>
      <div className="shrink-0 w-48 sm:w-56 bg-gray-100 dark:bg-gray-800 self-stretch">
        {article.thumbnail ? (
          <img
            src={article.thumbnail} alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">📰</div>' }}
          />
        ) : (
          <div className="w-full h-full min-h-[120px] flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">📰</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col p-4">
        {feed?.title && (
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">{feed.title}</span>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            {!isRead && <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />}
            <h3 className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.title}</h3>
          </div>
          <OpenButton link={article.link} onRead={() => onMarkRead(article.id)} />
        </div>
        {article.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1" style={{display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{article.summary}</p>
        )}
        <Meta feed={feed} author={article.author} date={date} />
      </div>
    </article>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────
export function ArticleCard({ article, isRead, onMarkRead, onMarkUnread, layout = 'list' }) {
  const { feeds } = useFeeds()
  const feed = feeds.find((f) => f.id === article.feedId)
  const date = parsedDate(article.pubDate)
  const props = { article, feed, date, isRead, onMarkRead, onMarkUnread }
  if (layout === 'grid') return <GridCard {...props} />
  if (layout === 'magazine') return <MagazineCard {...props} />
  return <ListCard {...props} />
}
