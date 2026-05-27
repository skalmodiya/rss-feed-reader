import { format, formatDistanceToNow, isValid } from 'date-fns'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../contexts/FeedsContext'

function parsedDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  return isValid(d) ? d : null
}

function DateMeta({ date, className = '' }) {
  if (!date) return null
  const relative = formatDistanceToNow(date, { addSuffix: true })
  const absolute = format(date, 'MMM d, yyyy · h:mm a')
  return (
    <time dateTime={date.toISOString()} title={absolute} className={className}>
      {relative}
    </time>
  )
}

// ── List layout (compact row) ────────────────────────────────────────────────
function ListCard({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  return (
    <article
      className={`flex gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-md cursor-pointer select-none ${
        isRead
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-80'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
      }`}
      onClick={() => { if (!isRead) onMarkRead(article.id); window.open(article.link, '_blank', 'noopener,noreferrer') }}
      onContextMenu={(e) => { e.preventDefault(); isRead ? onMarkUnread(article.id) : onMarkRead(article.id) }}
    >
      {article.thumbnail && (
        <img src={article.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-800" onError={(e) => { e.target.style.display = 'none' }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {!isRead && <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-gray-900 dark:text-gray-100">{article.title}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-1">
              {feed?.title && <span className="font-medium text-gray-600 dark:text-gray-300">{feed.title}</span>}
              {article.author && <><span>·</span><span>by {article.author}</span></>}
              {date && <><span>·</span><DateMeta date={date} /></>}
            </p>
          </div>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            className="shrink-0 p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); if (!isRead) onMarkRead(article.id) }}
            title="Open in new tab"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
        {article.summary && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{article.summary}</p>}
      </div>
    </article>
  )
}

// ── Card layout (grid tile with image on top) ────────────────────────────────
function CardTile({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  return (
    <article
      className={`flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer select-none ${
        isRead
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-80'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
      }`}
      onClick={() => { if (!isRead) onMarkRead(article.id); window.open(article.link, '_blank', 'noopener,noreferrer') }}
      onContextMenu={(e) => { e.preventDefault(); isRead ? onMarkUnread(article.id) : onMarkRead(article.id) }}
    >
      {article.thumbnail ? (
        <img src={article.thumbnail} alt="" className="w-full h-40 object-cover bg-gray-100 dark:bg-gray-800" onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">📰</div>
      )}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="flex items-start gap-2">
          {!isRead && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
          <h3 className="font-semibold text-sm leading-snug line-clamp-3 text-gray-900 dark:text-gray-100 flex-1">{article.title}</h3>
        </div>
        {article.summary && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{article.summary}</p>}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            {feed?.title && <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{feed.title}</p>}
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 flex-wrap">
              {article.author && <span>by {article.author}</span>}
              {article.author && date && <span>·</span>}
              {date && <DateMeta date={date} />}
            </p>
          </div>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            className="shrink-0 ml-2 p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); if (!isRead) onMarkRead(article.id) }}
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}

// ── Magazine layout (wide row with large image left) ─────────────────────────
function MagazineCard({ article, feed, date, isRead, onMarkRead, onMarkUnread }) {
  return (
    <article
      className={`flex gap-4 rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer select-none ${
        isRead
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-80'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
      }`}
      onClick={() => { if (!isRead) onMarkRead(article.id); window.open(article.link, '_blank', 'noopener,noreferrer') }}
      onContextMenu={(e) => { e.preventDefault(); isRead ? onMarkUnread(article.id) : onMarkRead(article.id) }}
    >
      {article.thumbnail ? (
        <img src={article.thumbnail} alt="" className="w-48 shrink-0 object-cover bg-gray-100 dark:bg-gray-800" onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-48 shrink-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-4xl">📰</div>
      )}
      <div className="flex-1 min-w-0 py-4 pr-4 flex flex-col gap-2">
        <div>
          {feed?.title && (
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{feed.title}</span>
          )}
          <div className="flex items-start gap-2 mt-1">
            {!isRead && <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
            <h3 className="font-bold text-base leading-snug line-clamp-2 text-gray-900 dark:text-gray-100">{article.title}</h3>
          </div>
        </div>
        {article.summary && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">{article.summary}</p>}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 flex-wrap">
            {article.author && <span>by <span className="font-medium text-gray-600 dark:text-gray-300">{article.author}</span></span>}
            {article.author && date && <span>·</span>}
            {date && <DateMeta date={date} />}
          </p>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            className="shrink-0 ml-2 p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); if (!isRead) onMarkRead(article.id) }}
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}

// ── Public export ────────────────────────────────────────────────────────────
export function ArticleCard({ article, isRead, onMarkRead, onMarkUnread, layout = 'list' }) {
  const { feeds } = useFeeds()
  const feed = feeds.find((f) => f.id === article.feedId)
  const date = parsedDate(article.pubDate)

  const props = { article, feed, date, isRead, onMarkRead, onMarkUnread }

  if (layout === 'card') return <CardTile {...props} />
  if (layout === 'magazine') return <MagazineCard {...props} />
  return <ListCard {...props} />
}
